/**
 * AZMA OS — the order a Creator placed, before anyone paid for it.
 *
 * ─── WHY THIS IS A READER AND A WRITER AND NOTHING ELSE ─────────────────────
 *
 *   `payment_transactions` has existed since the first payment road and holds
 *   exactly the columns an order needs: who, which pack, how many units, how
 *   many pounds, the gateway, its ids, and a status. The superseded Paymob
 *   binding wrote them from inside itself, which is why nothing else could.
 *
 *   So no table is created and no column is added. What was missing was a
 *   place any gateway can call — the live one and the simulation alike — so
 *   that the Empire's books show an order from the moment it is placed rather
 *   than from the moment money arrives.
 *
 *   The unique `idempotency_key` is what makes a repeated press one order
 *   instead of two, and it is the same key the ledger later refuses to credit
 *   twice.
 */

import type { DatabaseSync } from 'node:sqlite';

export type PurchaseStatus = 'initiated' | 'succeeded' | 'failed' | 'cancelled';

export interface PurchaseOrder {
  readonly transactionId: string;
  readonly creatorId: string;
  readonly packId: string;
  readonly azmaUnits: number;
  readonly amountEgp: number;
  readonly idempotencyKey: string;
  readonly providerId: string;
  readonly providerOrderId: string | null;
  readonly providerTransactionId: string | null;
  readonly status: PurchaseStatus;
  readonly createdAt: number;
  readonly updatedAt: number;
}

const COLUMNS = `transaction_id, creator_id, pack_id, azma_units, amount_egp, idempotency_key,
  provider_id, provider_order_id, provider_transaction_id, status, created_at, updated_at`;

function rowToOrder(row: Record<string, unknown>): PurchaseOrder {
  return {
    transactionId: row.transaction_id as string,
    creatorId: row.creator_id as string,
    packId: row.pack_id as string,
    azmaUnits: row.azma_units as number,
    amountEgp: row.amount_egp as number,
    idempotencyKey: row.idempotency_key as string,
    providerId: row.provider_id as string,
    providerOrderId: (row.provider_order_id as string | null) ?? null,
    providerTransactionId: (row.provider_transaction_id as string | null) ?? null,
    status: row.status as PurchaseStatus,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

/**
 * Record an order at the moment the Creator asks to pay.
 *
 * Idempotent by the key: pressing twice on the same intent returns the order
 * that already exists rather than opening a second one.
 */
export function recordInitiatedPurchase(
  db: DatabaseSync,
  input: {
    readonly creatorId: string;
    readonly packId: string;
    readonly azmaUnits: number;
    readonly amountEgp: number;
    readonly idempotencyKey: string;
    readonly providerId: string;
    readonly providerOrderId?: string | null;
    readonly nowMs?: number;
  },
): PurchaseOrder {
  const existing = findPurchaseByKey(db, input.idempotencyKey);
  if (existing) return existing;

  const now = input.nowMs ?? Date.now();
  // The provider's own session id is the order's id when there is one: two
  // names for one thing is how a trail stops being followable.
  const transactionId = input.providerOrderId ?? `order_${now}_${Math.random().toString(36).slice(2, 10)}`;
  db.prepare(
    `INSERT INTO payment_transactions (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    transactionId, input.creatorId, input.packId, input.azmaUnits, input.amountEgp,
    input.idempotencyKey, input.providerId, input.providerOrderId ?? null, null,
    'initiated', now, now,
  );
  return findPurchaseByKey(db, input.idempotencyKey)!;
}

export function findPurchaseByKey(db: DatabaseSync, idempotencyKey: string): PurchaseOrder | null {
  const row = db
    .prepare(`SELECT ${COLUMNS} FROM payment_transactions WHERE idempotency_key = ?`)
    .get(idempotencyKey) as Record<string, unknown> | undefined;
  return row ? rowToOrder(row) : null;
}

/** One order, read scoped to its owner — an id alone proves nothing. */
export function findPurchaseForCreator(
  db: DatabaseSync,
  transactionId: string,
  creatorId: string,
): PurchaseOrder | null {
  const row = db
    .prepare(`SELECT ${COLUMNS} FROM payment_transactions WHERE transaction_id = ? AND creator_id = ?`)
    .get(transactionId, creatorId) as Record<string, unknown> | undefined;
  return row ? rowToOrder(row) : null;
}

/**
 * Move an order to its outcome.
 *
 * A terminal order is never moved again: the first ending is the ending, so a
 * replayed notification cannot turn a failure into a success — or, worse, a
 * success into a second success.
 */
export function settlePurchase(
  db: DatabaseSync,
  transactionId: string,
  status: Exclude<PurchaseStatus, 'initiated'>,
  providerTransactionId?: string | null,
  nowMs: number = Date.now(),
): boolean {
  const result = db
    .prepare(
      `UPDATE payment_transactions
          SET status = ?, provider_transaction_id = COALESCE(?, provider_transaction_id), updated_at = ?
        WHERE transaction_id = ? AND status = 'initiated'`,
    )
    .run(status, providerTransactionId ?? null, nowMs, transactionId);
  return Number(result.changes) > 0;
}

/** This Creator's orders, newest first — the trail a support question needs. */
export function listPurchasesForCreator(
  db: DatabaseSync,
  creatorId: string,
  limit = 20,
): readonly PurchaseOrder[] {
  return (db
    .prepare(`SELECT ${COLUMNS} FROM payment_transactions WHERE creator_id = ? ORDER BY created_at DESC LIMIT ?`)
    .all(creatorId, limit) as Record<string, unknown>[]).map(rowToOrder);
}
