import { randomUUID } from 'crypto';
import type { DatabaseSync } from 'node:sqlite';
import type {
  CreditLedgerEntry,
  CreatorBalance,
  ICreatorCreditRepository,
  ReservationResult,
  SettlementResult,
} from './credit-ledger-types';
import {
  InsufficientBalanceError,
  ReservationNotFoundError,
  SettlementExceedsReservationError,
} from './credit-ledger-types';

// ─── DB ROW SHAPES ───────────────────────────────────────────────────────────

interface LedgerRow {
  ledger_id: string;
  creator_id: string;
  transaction_type: string;
  direction: string;
  amount: number;
  balance_after: number;
  reference_id: string | null;
  idempotency_key: string | null;
  status: string;
  metadata_json: string | null;
  created_at: number;
}

interface BalanceRow {
  creator_id: string;
  available_units: number;
  reserved_units: number;
  total_purchased: number;
  total_spent: number;
  updated_at: number;
}

// ─── MAPPERS ─────────────────────────────────────────────────────────────────

function toEntry(row: LedgerRow): CreditLedgerEntry {
  return {
    ledgerId: row.ledger_id,
    creatorId: row.creator_id,
    transactionType: row.transaction_type as CreditLedgerEntry['transactionType'],
    direction: row.direction as CreditLedgerEntry['direction'],
    amount: row.amount,
    balanceAfter: row.balance_after,
    referenceId: row.reference_id ?? undefined,
    idempotencyKey: row.idempotency_key ?? undefined,
    status: row.status as CreditLedgerEntry['status'],
    metadataJson: row.metadata_json ?? undefined,
    createdAt: row.created_at,
  };
}

function toBalance(row: BalanceRow): CreatorBalance {
  return {
    creatorId: row.creator_id,
    availableUnits: row.available_units,
    reservedUnits: row.reserved_units,
    totalPurchased: row.total_purchased,
    totalSpent: row.total_spent,
    updatedAt: row.updated_at,
  };
}

const ZERO_BALANCE = (creatorId: string): CreatorBalance => ({
  creatorId,
  availableUnits: 0,
  reservedUnits: 0,
  totalPurchased: 0,
  totalSpent: 0,
  updatedAt: 0,
});

// ─── REPOSITORY ──────────────────────────────────────────────────────────────

export class CreatorCreditRepository implements ICreatorCreditRepository {
  constructor(private readonly db: DatabaseSync) {}

  getBalance(creatorId: string): CreatorBalance {
    const row = this.db
      .prepare('SELECT * FROM creator_balances WHERE creator_id = ?')
      .get(creatorId) as unknown as BalanceRow | undefined;
    return row ? toBalance(row) : ZERO_BALANCE(creatorId);
  }

  creditUnits(
    creatorId: string,
    amount: number,
    type: 'purchase' | 'grant',
    idempotencyKey: string,
    referenceId?: string,
    metadata?: Record<string, unknown>,
  ): CreatorBalance {
    // Idempotency: return existing balance if this key already processed
    const existing = this.db
      .prepare('SELECT ledger_id FROM credit_ledger WHERE idempotency_key = ?')
      .get(idempotencyKey) as { ledger_id: string } | undefined;
    if (existing) {
      return this.getBalance(creatorId);
    }

    const ledgerId = randomUUID();
    const now = Date.now();
    const metaStr = metadata ? JSON.stringify(metadata) : null;

    this.db.exec('BEGIN IMMEDIATE');
    try {
      // Upsert balance row
      this.db
        .prepare(
          `INSERT INTO creator_balances (creator_id, available_units, reserved_units, total_purchased, total_spent, updated_at)
           VALUES (?, ?, 0, ?, 0, ?)
           ON CONFLICT(creator_id) DO UPDATE SET
             available_units = available_units + excluded.available_units,
             total_purchased = total_purchased + excluded.total_purchased,
             updated_at = excluded.updated_at`,
        )
        .run(creatorId, amount, amount, now);

      // Read new balance for snapshot
      const balRow = this.db
        .prepare('SELECT available_units FROM creator_balances WHERE creator_id = ?')
        .get(creatorId) as { available_units: number };

      // Append immutable ledger entry
      this.db
        .prepare(
          `INSERT INTO credit_ledger
             (ledger_id, creator_id, transaction_type, direction, amount, balance_after,
              reference_id, idempotency_key, status, metadata_json, created_at)
           VALUES (?, ?, ?, 'credit', ?, ?, ?, ?, 'completed', ?, ?)`,
        )
        .run(ledgerId, creatorId, type, amount, balRow.available_units, referenceId ?? null, idempotencyKey, metaStr, now);

      this.db.exec('COMMIT');
    } catch (err) {
      try { this.db.exec('ROLLBACK'); } catch { /* ignore secondary error */ }
      throw err;
    }

    return this.getBalance(creatorId);
  }

  reserve(
    creatorId: string,
    amount: number,
    idempotencyKey: string,
    metadata?: Record<string, unknown>,
  ): ReservationResult {
    // Idempotency: return existing reservation if key already processed
    const existing = this.db
      .prepare("SELECT ledger_id, amount FROM credit_ledger WHERE idempotency_key = ? AND transaction_type = 'reservation'")
      .get(idempotencyKey) as { ledger_id: string; amount: number } | undefined;
    if (existing) {
      const bal = this.getBalance(creatorId);
      return {
        reservationId: existing.ledger_id,
        reservedUnits: existing.amount,
        availableAfterReservation: bal.availableUnits,
      };
    }

    const ledgerId = randomUUID();
    const now = Date.now();
    const metaStr = metadata ? JSON.stringify(metadata) : null;

    this.db.exec('BEGIN IMMEDIATE');
    try {
      // Read current available balance inside the transaction
      const balRow = this.db
        .prepare('SELECT available_units, reserved_units FROM creator_balances WHERE creator_id = ?')
        .get(creatorId) as { available_units: number; reserved_units: number } | undefined;

      const currentAvailable = balRow?.available_units ?? 0;
      if (currentAvailable < amount) {
        this.db.exec('ROLLBACK');
        throw new InsufficientBalanceError(creatorId, amount, currentAvailable);
      }

      const balanceAfter = currentAvailable - amount;

      // Insert pending reservation ledger entry
      this.db
        .prepare(
          `INSERT INTO credit_ledger
             (ledger_id, creator_id, transaction_type, direction, amount, balance_after,
              idempotency_key, status, metadata_json, created_at)
           VALUES (?, ?, 'reservation', 'debit', ?, ?, ?, 'pending', ?, ?)`,
        )
        .run(ledgerId, creatorId, amount, balanceAfter, idempotencyKey, metaStr, now);

      // Atomically deduct from available, add to reserved
      // The WHERE AND available_units >= ? is a double-check against any race
      const result = this.db
        .prepare(
          `UPDATE creator_balances
           SET available_units = available_units - ?,
               reserved_units  = reserved_units  + ?,
               updated_at = ?
           WHERE creator_id = ? AND available_units >= ?`,
        )
        .run(amount, amount, now, creatorId, amount);

      if ((result as { changes: number }).changes !== 1) {
        this.db.exec('ROLLBACK');
        const fresh = this.getBalance(creatorId);
        throw new InsufficientBalanceError(creatorId, amount, fresh.availableUnits);
      }

      this.db.exec('COMMIT');
    } catch (err) {
      try { this.db.exec('ROLLBACK'); } catch { /* ignore */ }
      throw err;
    }

    return {
      reservationId: ledgerId,
      reservedUnits: amount,
      availableAfterReservation: (this.db
        .prepare('SELECT available_units FROM creator_balances WHERE creator_id = ?')
        .get(creatorId) as { available_units: number }).available_units,
    };
  }

  settle(
    reservationId: string,
    actualUnits: number,
    metadata?: Record<string, unknown>,
  ): SettlementResult {
    const now = Date.now();
    const metaStr = metadata ? JSON.stringify(metadata) : null;

    // Find the pending reservation
    const reservation = this.db
      .prepare("SELECT * FROM credit_ledger WHERE ledger_id = ? AND status = 'pending' AND transaction_type = 'reservation'")
      .get(reservationId) as unknown as LedgerRow | undefined;

    if (!reservation) {
      // Check if already settled (idempotent return)
      const alreadySettled = this.db
        .prepare("SELECT * FROM credit_ledger WHERE reference_id = ? AND transaction_type = 'settlement' AND status = 'completed'")
        .get(reservationId) as unknown as LedgerRow | undefined;
      if (alreadySettled) {
        const bal = this.getBalance(alreadySettled.creator_id);
        return {
          settlementLedgerId: alreadySettled.ledger_id,
          settledUnits: alreadySettled.amount,
          releasedUnits: 0,
          availableAfter: bal.availableUnits,
        };
      }
      throw new ReservationNotFoundError(reservationId);
    }

    const reservedAmount = reservation.amount;
    const creatorId = reservation.creator_id;

    if (actualUnits > reservedAmount) {
      throw new SettlementExceedsReservationError(actualUnits, reservedAmount);
    }

    const releasedUnits = reservedAmount - actualUnits;
    const settlementId = randomUUID();

    this.db.exec('BEGIN IMMEDIATE');
    try {
      // Mark reservation as completed
      this.db
        .prepare("UPDATE credit_ledger SET status = 'completed' WHERE ledger_id = ?")
        .run(reservationId);

      // Read current available for snapshot
      const balRow = this.db
        .prepare('SELECT available_units FROM creator_balances WHERE creator_id = ?')
        .get(creatorId) as { available_units: number };

      // If actualUnits < reservedAmount: release the surplus back to available
      const availableAfter = balRow.available_units + releasedUnits;

      // Update balance: release reserved (all of it), add back surplus, add to total_spent
      this.db
        .prepare(
          `UPDATE creator_balances
           SET reserved_units  = reserved_units  - ?,
               available_units = available_units + ?,
               total_spent     = total_spent     + ?,
               updated_at = ?
           WHERE creator_id = ?`,
        )
        .run(reservedAmount, releasedUnits, actualUnits, now, creatorId);

      // Insert settlement ledger entry
      this.db
        .prepare(
          `INSERT INTO credit_ledger
             (ledger_id, creator_id, transaction_type, direction, amount, balance_after,
              reference_id, status, metadata_json, created_at)
           VALUES (?, ?, 'settlement', 'debit', ?, ?, ?, 'completed', ?, ?)`,
        )
        .run(settlementId, creatorId, actualUnits, availableAfter, reservationId, metaStr, now);

      // If there was surplus, record a release entry for audit clarity
      if (releasedUnits > 0) {
        const releaseId = randomUUID();
        this.db
          .prepare(
            `INSERT INTO credit_ledger
               (ledger_id, creator_id, transaction_type, direction, amount, balance_after,
                reference_id, status, created_at)
             VALUES (?, ?, 'release', 'credit', ?, ?, ?, 'completed', ?)`,
          )
          .run(releaseId, creatorId, releasedUnits, availableAfter, reservationId, now);
      }

      this.db.exec('COMMIT');
    } catch (err) {
      try { this.db.exec('ROLLBACK'); } catch { /* ignore */ }
      throw err;
    }

    return {
      settlementLedgerId: settlementId,
      settledUnits: actualUnits,
      releasedUnits,
      availableAfter: (this.db
        .prepare('SELECT available_units FROM creator_balances WHERE creator_id = ?')
        .get(creatorId) as { available_units: number }).available_units,
    };
  }

  release(reservationId: string, reason?: string): void {
    const reservation = this.db
      .prepare("SELECT * FROM credit_ledger WHERE ledger_id = ? AND transaction_type = 'reservation'")
      .get(reservationId) as unknown as LedgerRow | undefined;

    if (!reservation) return; // unknown reservation — no-op
    if (reservation.status !== 'pending') return; // already settled or released — idempotent no-op

    const now = Date.now();
    const creatorId = reservation.creator_id;
    const amount = reservation.amount;
    const releaseId = randomUUID();

    this.db.exec('BEGIN IMMEDIATE');
    try {
      // Mark reservation as reversed
      this.db
        .prepare("UPDATE credit_ledger SET status = 'reversed' WHERE ledger_id = ? AND status = 'pending'")
        .run(reservationId);

      const balRow = this.db
        .prepare('SELECT available_units FROM creator_balances WHERE creator_id = ?')
        .get(creatorId) as { available_units: number };

      const availableAfter = balRow.available_units + amount;

      // Return units to available
      this.db
        .prepare(
          `UPDATE creator_balances
           SET reserved_units  = reserved_units  - ?,
               available_units = available_units + ?,
               updated_at = ?
           WHERE creator_id = ?`,
        )
        .run(amount, amount, now, creatorId);

      // Record the release
      this.db
        .prepare(
          `INSERT INTO credit_ledger
             (ledger_id, creator_id, transaction_type, direction, amount, balance_after,
              reference_id, status, metadata_json, created_at)
           VALUES (?, ?, 'release', 'credit', ?, ?, ?, 'completed', ?, ?)`,
        )
        .run(
          releaseId, creatorId, amount, availableAfter,
          reservationId,
          reason ? JSON.stringify({ reason }) : null, now,
        );

      this.db.exec('COMMIT');
    } catch (err) {
      try { this.db.exec('ROLLBACK'); } catch { /* ignore */ }
      throw err;
    }
  }

  getLedgerHistory(creatorId: string, limit = 100): readonly CreditLedgerEntry[] {
    const rows = this.db
      .prepare(
        'SELECT * FROM credit_ledger WHERE creator_id = ? ORDER BY created_at DESC LIMIT ?',
      )
      .all(creatorId, limit) as unknown as LedgerRow[];
    return rows.map(toEntry);
  }
}
