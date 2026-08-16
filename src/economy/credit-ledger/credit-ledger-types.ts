// AZMA OS — LAUNCH ECONOMY FOUNDATION
// Credit Ledger: type contracts for the append-only economic transaction log.
// These types define the complete language of AZMA Unit economics.
// Provider costs, USD amounts, and API pricing are NEVER stored here.

export type CreditTransactionType =
  | 'purchase'     // one-time credit pack purchase
  | 'grant'        // free allocation (trial, promotion, adjustment)
  | 'reservation'  // units locked for a pending operation
  | 'settlement'   // final deduction after successful execution
  | 'release'      // reservation returned to available balance (failure/cancel)
  | 'refund'       // post-settlement reversal
  | 'adjustment'   // Founder-authorized manual correction
  | 'reversal';    // transaction-level reversal

export type CreditTransactionDirection = 'credit' | 'debit';

// pending = reservation locked, not yet settled or released
// completed = final, immutable
// reversed = reversed by a subsequent transaction
export type CreditTransactionStatus = 'pending' | 'completed' | 'reversed';

// The authoritative append-only record. Each row is immutable after INSERT.
export interface CreditLedgerEntry {
  readonly ledgerId: string;
  readonly creatorId: string;
  readonly transactionType: CreditTransactionType;
  readonly direction: CreditTransactionDirection;
  readonly amount: number;         // AZMA Units, always a positive integer
  readonly balanceAfter: number;   // available_units snapshot at write time
  readonly referenceId?: string;   // payment intent ID, reservation ID, etc.
  readonly idempotencyKey?: string;
  readonly status: CreditTransactionStatus;
  readonly metadataJson?: string;  // audit context — never credentials
  readonly createdAt: number;      // Unix ms
}

// Materialized fast-read balance — updated atomically with every ledger write.
export interface CreatorBalance {
  readonly creatorId: string;
  readonly availableUnits: number;  // can be reserved right now
  readonly reservedUnits: number;   // locked in active pending reservations
  readonly totalPurchased: number;  // lifetime purchased units
  readonly totalSpent: number;      // lifetime settled (consumed) units
  readonly updatedAt: number;
}

// Returned when a reservation succeeds.
export interface ReservationResult {
  readonly reservationId: string;            // = ledgerId of the pending reservation
  readonly reservedUnits: number;
  readonly availableAfterReservation: number;
}

// Returned when a settlement completes.
export interface SettlementResult {
  readonly settlementLedgerId: string;
  readonly settledUnits: number;
  readonly releasedUnits: number;   // surplus reservation returned
  readonly availableAfter: number;
}

// Economic errors — all checked, never unexpected.
export class InsufficientBalanceError extends Error {
  constructor(
    readonly creatorId: string,
    readonly requested: number,
    readonly available: number,
  ) {
    super(`Insufficient AZMA balance for creator ${creatorId}: requested ${requested}, available ${available}`);
    this.name = 'InsufficientBalanceError';
  }
}

export class ReservationNotFoundError extends Error {
  constructor(readonly reservationId: string) {
    super(`Reservation not found or not in pending state: ${reservationId}`);
    this.name = 'ReservationNotFoundError';
  }
}

export class DuplicateTransactionError extends Error {
  constructor(readonly idempotencyKey: string) {
    super(`Transaction already processed for idempotency key: ${idempotencyKey}`);
    this.name = 'DuplicateTransactionError';
  }
}

export class SettlementExceedsReservationError extends Error {
  constructor(readonly settledUnits: number, readonly reservedUnits: number) {
    super(`Settlement amount ${settledUnits} exceeds reservation ${reservedUnits}`);
    this.name = 'SettlementExceedsReservationError';
  }
}

// Repository interface — the only way the rest of the system touches the ledger.
export interface ICreatorCreditRepository {
  // Read current balance. Returns zero balance if no balance row exists yet.
  getBalance(creatorId: string): CreatorBalance;

  // Credit units (purchase or grant). Idempotent on idempotencyKey.
  // Throws DuplicateTransactionError if idempotencyKey already processed.
  creditUnits(
    creatorId: string,
    amount: number,
    type: 'purchase' | 'grant',
    idempotencyKey: string,
    referenceId?: string,
    metadata?: Record<string, unknown>,
  ): CreatorBalance;

  // Atomically reserve units. Throws InsufficientBalanceError if available < amount.
  // Idempotent on idempotencyKey.
  reserve(
    creatorId: string,
    amount: number,
    idempotencyKey: string,
    metadata?: Record<string, unknown>,
  ): ReservationResult;

  // Settle a reservation with actual consumed units (may be <= reservedUnits).
  // Idempotent: settling the same reservationId twice returns the same result.
  // Throws ReservationNotFoundError if reservationId is not a pending reservation.
  // Throws SettlementExceedsReservationError if actualUnits > reservedUnits.
  settle(
    reservationId: string,
    actualUnits: number,
    metadata?: Record<string, unknown>,
  ): SettlementResult;

  // Release a pending reservation — returns all units to available balance.
  // Idempotent: releasing an already-released reservation is a no-op.
  release(reservationId: string, reason?: string): void;

  // Return the full ledger history for a creator (audit use only).
  getLedgerHistory(creatorId: string, limit?: number): readonly CreditLedgerEntry[];
}
