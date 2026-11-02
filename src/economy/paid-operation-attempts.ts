import { createHash, randomUUID } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';

/**
 * AZMA OS — ONE SUBMISSION, ONE ATTEMPT, ONE VERDICT.
 *
 * ─── WHY A KEY THE SERVER INVENTS CANNOT WORK ───────────────────────────────
 *
 *   The server cannot tell a retry from a deliberate repetition. Two requests
 *   carrying the same Creator, the same prompt and the same model are either
 *   one press that the network sent twice, or two presses by someone who
 *   wants two pictures. Whichever the server guesses, it is wrong half the
 *   time, and the two wrongs are not equal:
 *
 *     guess «retry»      → the second provider call runs behind the first
 *                          call's hold. A paid provider with no cover.
 *     guess «new press»  → the Creator is charged twice for one press.
 *
 *   MEASURED on the live release: all six paid roads guessed «new press», by
 *   keying on `randomUUID()` or `Date.now()`. So the correction is not a
 *   cleverer guess. Only the client knows which of the two it meant, so the
 *   client says: one key, minted when the button is pressed, resent verbatim
 *   on every retry of THAT press.
 *
 *   When no key is supplied, this mints a unique one. That keeps the
 *   unimproved behaviour — pressing twice costs twice — rather than the
 *   dangerous one, because an uncovered paid call is the worse failure.
 *
 * ─── WHAT THIS IS NOT ───────────────────────────────────────────────────────
 *
 *   It is not a second economy. It never prices, holds, charges or refunds;
 *   `credit_ledger` remains the only money authority and this table points at
 *   it. What lives here is the question neither `creative_jobs` nor
 *   `operation_ledger` can answer: has the provider ALREADY run for this
 *   submission, and was its hold ever resolved.
 */

/**
 * The one header every paid road reads its submission key from.
 *
 * A header rather than a body field, so adding it changed no request shape and
 * no route's validation — and so one name serves roads whose bodies have
 * nothing else in common.
 */
export const OPERATION_KEY_HEADER = 'x-azma-operation-key';

export type AttemptState = 'in-flight' | 'succeeded' | 'failed';
export type SettlementState = 'not-owed' | 'settled' | 'released' | 'owed';

export interface AttemptRecord {
  readonly attemptKey: string;
  readonly creatorId: string;
  readonly scope: string;
  readonly state: AttemptState;
  readonly reservationId: string | null;
  readonly settlementState: SettlementState;
  readonly unitsHeld: number | null;
  readonly resultJson: string | null;
  readonly failureReason: string | null;
  /** The long-running job this attempt paid for, when there is one. */
  readonly operationId: string | null;
  readonly createdAtMs: number;
  readonly updatedAtMs: number;
}

/** What `claimAttempt` decided about a request that has just arrived. */
export type AttemptClaim =
  /** Nothing has run for this submission. Proceed — and resolve it afterwards. */
  | { readonly kind: 'claimed'; readonly attemptKey: string }
  /**
   * This exact submission is running right now, in this process or another.
   * The provider must NOT be called a second time and nothing may be held.
   */
  | { readonly kind: 'in-flight'; readonly attemptKey: string; readonly sinceMs: number }
  /**
   * This exact submission already finished. Its answer is replayed verbatim:
   * no reservation, no provider call, no charge.
   */
  | { readonly kind: 'already-succeeded'; readonly attemptKey: string; readonly resultJson: string | null }
  /**
   * It already ran and failed. A retry of a failed attempt is legitimate, so
   * this is a NEW attempt key — fully covered, charged on its own.
   */
  | { readonly kind: 'claimed-after-failure'; readonly attemptKey: string; readonly previousFailure: string | null };

interface AttemptRow {
  attempt_key: string; creator_id: string; scope: string; state: string;
  reservation_id: string | null; settlement_state: string; units_held: number | null;
  result_json: string | null; failure_reason: string | null;
  operation_id: string | null;
  created_at_ms: number; updated_at_ms: number;
}

function toRecord(row: AttemptRow): AttemptRecord {
  return {
    attemptKey: row.attempt_key,
    creatorId: row.creator_id,
    scope: row.scope,
    state: row.state as AttemptState,
    reservationId: row.reservation_id,
    settlementState: row.settlement_state as SettlementState,
    unitsHeld: row.units_held,
    resultJson: row.result_json,
    failureReason: row.failure_reason,
    operationId: row.operation_id ?? null,
    createdAtMs: row.created_at_ms,
    updatedAtMs: row.updated_at_ms,
  };
}

/**
 * A client key, read from the request and refused if it is not usable.
 *
 * It is a key, not content: bounded, printable, and never trusted into SQL by
 * its own spelling — every lookup goes through the hashed stem below.
 */
export function readClientOperationKey(headerValue: string | null | undefined): string | null {
  if (typeof headerValue !== 'string') return null;
  const trimmed = headerValue.trim();
  if (trimmed.length === 0 || trimmed.length > 200) return null;
  // Control characters would make a key that cannot be logged or compared by
  // eye. A submission key has no reason to contain one.
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return null;
  return trimmed;
}

/** The fixed-shape stem for one submission. Hashed so no Creator's own text can shape a key. */
function stemFor(scope: string, creatorId: string, clientKey: string): string {
  return createHash('sha256').update(`${scope}\u0000${creatorId}\u0000${clientKey}`).digest('hex').slice(0, 32);
}

/**
 * Decide what this request is: the first run of a submission, a duplicate of
 * one in flight, a replay of one that finished, or a retry after a failure.
 *
 * The claim is written under `BEGIN IMMEDIATE`, so two requests that arrive at
 * the same instant cannot both be told «claimed».
 */
export function claimAttempt(params: {
  readonly db: DatabaseSync;
  readonly creatorId: string;
  readonly scope: string;
  /** Null when the client sent none — then this submission stands alone. */
  readonly clientKey: string | null;
}): AttemptClaim {
  const { db, creatorId, scope, clientKey } = params;
  const now = Date.now();

  // No key from the client: a key of its own that will match nothing. The
  // attempt is still RECORDED, because the resolver must be able to find its
  // hold whatever the client did.
  if (clientKey === null) {
    const key = `${scope}:${creatorId}:${randomUUID()}`;
    insertInFlight(db, key, creatorId, scope, now);
    return { kind: 'claimed', attemptKey: key };
  }

  const stem = stemFor(scope, creatorId, clientKey);
  const prefix = `${stem}#`;

  db.exec('BEGIN IMMEDIATE');
  try {
    const rows = db
      .prepare(
        `SELECT * FROM paid_operation_attempts
          WHERE substr(attempt_key, 1, ?) = ?
          ORDER BY created_at_ms`,
      )
      .all(prefix.length, prefix) as unknown as AttemptRow[];

    const succeeded = rows.find((r) => r.state === 'succeeded');
    if (succeeded) {
      db.exec('COMMIT');
      return { kind: 'already-succeeded', attemptKey: succeeded.attempt_key, resultJson: succeeded.result_json };
    }

    const running = rows.find((r) => r.state === 'in-flight');
    if (running) {
      db.exec('COMMIT');
      return { kind: 'in-flight', attemptKey: running.attempt_key, sinceMs: running.created_at_ms };
    }

    const key = `${prefix}${rows.length + 1}`;
    db.prepare(
      `INSERT INTO paid_operation_attempts
         (attempt_key, creator_id, scope, state, reservation_id, settlement_state,
          units_held, result_json, failure_reason, created_at_ms, updated_at_ms)
       VALUES (?, ?, ?, 'in-flight', NULL, 'not-owed', NULL, NULL, NULL, ?, ?)`,
    ).run(key, creatorId, scope, now, now);
    db.exec('COMMIT');

    const lastFailure = rows.length > 0 ? rows[rows.length - 1]!.failure_reason : null;
    return rows.length === 0
      ? { kind: 'claimed', attemptKey: key }
      : { kind: 'claimed-after-failure', attemptKey: key, previousFailure: lastFailure };
  } catch (error) {
    try { db.exec('ROLLBACK'); } catch { /* the transaction is already gone */ }
    throw error;
  }
}

function insertInFlight(db: DatabaseSync, key: string, creatorId: string, scope: string, now: number): void {
  db.prepare(
    `INSERT INTO paid_operation_attempts
       (attempt_key, creator_id, scope, state, reservation_id, settlement_state,
        units_held, result_json, failure_reason, created_at_ms, updated_at_ms)
     VALUES (?, ?, ?, 'in-flight', NULL, 'not-owed', NULL, NULL, NULL, ?, ?)`,
  ).run(key, creatorId, scope, now, now);
}

/** Bind the hold to the attempt, so the resolver can find one from the other. */
export function attachReservation(
  db: DatabaseSync,
  attemptKey: string,
  reservationId: string,
  unitsHeld: number,
): void {
  db.prepare(
    `UPDATE paid_operation_attempts
        SET reservation_id = ?, units_held = ?, settlement_state = 'owed', updated_at_ms = ?
      WHERE attempt_key = ?`,
  ).run(reservationId, unitsHeld, Date.now(), attemptKey);
}

/**
 * ─── AN ATTEMPT THAT PAID FOR A JOB NAMES THAT JOB ──────────────────────────
 *
 *   Only for work whose outcome is learned AFTER the request that paid for it
 *   returns — today, the MP4 export alone. The encode is a child process, and
 *   the duration the Founder ruled the charge follows exists only once the
 *   file does.
 *
 *   Written once, right after the hold, and never overwritten: the WHERE
 *   clause requires the column to still be empty, so two jobs can never claim
 *   the same payment and a replayed call cannot move a payment to a newer job.
 */
export function attachOperation(db: DatabaseSync, attemptKey: string, operationId: string): void {
  db.prepare(
    `UPDATE paid_operation_attempts
        SET operation_id = ?, updated_at_ms = ?
      WHERE attempt_key = ? AND operation_id IS NULL`,
  ).run(operationId, Date.now(), attemptKey);
}

/**
 * The attempt that paid for one job, or null when no attempt did.
 *
 * Null is the honest answer for an entitled render (a Founder, a trial) and
 * for a job started before this link existed. A settlement must read it as
 * «nothing is owed for this job», never as «settle zero».
 */
export function attemptForOperation(db: DatabaseSync, operationId: string): AttemptRecord | null {
  const row = db
    .prepare('SELECT * FROM paid_operation_attempts WHERE operation_id = ?')
    .get(operationId) as unknown as AttemptRow | undefined;
  return row ? toRecord(row) : null;
}

/** Mark how the hold ended. Called by the gate, never by a route directly. */
export function markSettlement(db: DatabaseSync, attemptKey: string, settlement: SettlementState): void {
  db.prepare('UPDATE paid_operation_attempts SET settlement_state = ?, updated_at_ms = ? WHERE attempt_key = ?')
    .run(settlement, Date.now(), attemptKey);
}

/**
 * The provider ran and produced. `result` is what a resent key will be
 * answered with, so it must be the Creator's own payload and nothing internal.
 */
export function completeAttempt(db: DatabaseSync, attemptKey: string, result: unknown): void {
  let serialised: string | null = null;
  try {
    const json = JSON.stringify(result ?? null);
    // A replayed answer must fit in a row. Beyond this the attempt is still
    // recorded as succeeded — it simply has no body to replay, and the route
    // says so rather than inventing one.
    serialised = typeof json === 'string' && json.length <= 64_000 ? json : null;
  } catch { serialised = null; }

  db.prepare(
    "UPDATE paid_operation_attempts SET state = 'succeeded', result_json = ?, updated_at_ms = ? WHERE attempt_key = ?",
  ).run(serialised, Date.now(), attemptKey);
}

/** It ran and did not produce. The next press with the same key is a fresh, covered attempt. */
export function failAttempt(db: DatabaseSync, attemptKey: string, reason: string): void {
  db.prepare(
    "UPDATE paid_operation_attempts SET state = 'failed', failure_reason = ?, updated_at_ms = ? WHERE attempt_key = ?",
  ).run(reason.slice(0, 300), Date.now(), attemptKey);
}

export function readAttempt(db: DatabaseSync, attemptKey: string): AttemptRecord | null {
  const row = db
    .prepare('SELECT * FROM paid_operation_attempts WHERE attempt_key = ?')
    .get(attemptKey) as unknown as AttemptRow | undefined;
  return row ? toRecord(row) : null;
}

/**
 * Attempts whose money was never resolved.
 *
 * `settlement_state = 'owed'` and nothing else — deliberately NOT a query by
 * age. An attempt still `in-flight` is one nobody can speak for, and it is
 * returned here so it can be SEEN, never so it can be swept.
 */
export function unresolvedAttempts(db: DatabaseSync, limit = 200): readonly AttemptRecord[] {
  const rows = db
    .prepare(
      `SELECT * FROM paid_operation_attempts
        WHERE settlement_state = 'owed'
        ORDER BY created_at_ms
        LIMIT ?`,
    )
    .all(limit) as unknown as AttemptRow[];
  return rows.map(toRecord);
}
