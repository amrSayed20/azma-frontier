import type { DatabaseSync } from 'node:sqlite';
import { CreatorCreditRepository } from './credit-ledger/credit-ledger-repository';
import { markSettlement, unresolvedAttempts } from './paid-operation-attempts';
import type { AttemptRecord } from './paid-operation-attempts';

/**
 * AZMA OS — THE HOLD THAT NOBODY CLOSED.
 *
 * ─── WHAT WENT WRONG, MEASURED ──────────────────────────────────────────────
 *
 *   Seven places wrapped `settle` in `catch { /* non-fatal *\/ }`. The
 *   intention was right — a Creator must not lose a result they earned because
 *   the ledger stumbled — but the stumble left NOTHING behind: the reservation
 *   stayed `pending`, the units stayed locked out of the Creator's own
 *   availability, `total_spent` never moved, and no record anywhere said so.
 *   A Creator could end a week with units they could neither spend nor see.
 *
 * ─── WHY IT RESOLVES BY RECORD AND NEVER BY AGE ─────────────────────────────
 *
 *   The tempting sweeper releases anything held for more than an hour. It is
 *   wrong, and expensively so: a provider job that actually SUCCEEDED but
 *   whose settlement failed would have its hold handed back, and the Empire
 *   would have paid the provider for work it then gave away.
 *
 *   So this resolver reads the attempt's own recorded outcome and acts only on
 *   it. An attempt still `in-flight` is one NOBODY can speak for — not the
 *   clock, not this function — so it is reported untouched. Age appears in
 *   this file exactly once: as a number in a report a human reads.
 *
 * ─── WHY IT CANNOT CHARGE TWICE ─────────────────────────────────────────────
 *
 *   It never computes a charge. It calls the same `settle` and `release` the
 *   original request would have called, and both are idempotent at the
 *   repository: `settle` on a closed reservation returns the settlement that
 *   already exists, and `release` on one is a no-op. Running this resolver
 *   twice, or in two processes at once, moves no money the second time.
 */

export interface ResolutionOutcome {
  readonly attemptKey: string;
  readonly creatorId: string;
  readonly scope: string;
  readonly action: 'settled' | 'released' | 'left-undecided' | 'still-owed';
  readonly units: number | null;
  readonly ageMs: number;
  readonly note: string;
}

export interface ResolutionReport {
  readonly examined: number;
  readonly settled: number;
  readonly released: number;
  /** Still running. Deliberately untouched — see the file header. */
  readonly undecided: number;
  /** The ledger refused again. These stay `owed` and will be retried. */
  readonly stillOwed: number;
  readonly outcomes: readonly ResolutionOutcome[];
}

/**
 * Resolve ONE attempt by what the record says happened to it.
 *
 * Exported on its own so a single stuck hold can be resolved by name, and so a
 * test can prove the decision for each state separately.
 */
export function resolveAttempt(db: DatabaseSync, attempt: AttemptRecord): ResolutionOutcome {
  const base = {
    attemptKey: attempt.attemptKey,
    creatorId: attempt.creatorId,
    scope: attempt.scope,
    units: attempt.unitsHeld,
    ageMs: Date.now() - attempt.createdAtMs,
  };

  if (attempt.reservationId === null) {
    // Marked owed with no hold to resolve. Nothing is held, so nothing is due.
    markSettlement(db, attempt.attemptKey, 'not-owed');
    return { ...base, action: 'settled', note: 'no reservation was ever attached; nothing was held' };
  }

  if (attempt.state === 'in-flight') {
    return {
      ...base,
      action: 'left-undecided',
      note: 'the operation has not reported an outcome; releasing it could give away work that succeeded',
    };
  }

  const credits = new CreatorCreditRepository(db);

  try {
    if (attempt.state === 'succeeded') {
      // A hold with no recorded amount is not a zero. Settling it for zero
      // would hand the whole hold back and make a paid success free, so it
      // stays owed for a human to read instead.
      if (attempt.unitsHeld === null) {
        return { ...base, action: 'still-owed', note: 'the hold carries no recorded amount; a charge must not be guessed' };
      }
      credits.settle(attempt.reservationId, attempt.unitsHeld);
      markSettlement(db, attempt.attemptKey, 'settled');
      return { ...base, action: 'settled', note: 'the operation succeeded, so the hold became a charge' };
    }

    credits.release(attempt.reservationId, `reconciled:${attempt.failureReason ?? 'failed'}`);
    markSettlement(db, attempt.attemptKey, 'released');
    return { ...base, action: 'released', note: 'the operation failed, so the hold went back to the Creator' };
  } catch (error) {
    // It stays `owed`. A debt that cannot be collected today is still a debt,
    // and the next run will try again.
    return {
      ...base,
      action: 'still-owed',
      note: String((error as { message?: unknown })?.message ?? error).slice(0, 200),
    };
  }
}

/**
 * Resolve every hold the record can speak for, and name the ones it cannot.
 *
 * Read-then-act, one attempt at a time: a resolver that took them all in one
 * transaction would let a single unresolvable row block every other Creator's
 * refund.
 */
export function reconcileOwedAttempts(db: DatabaseSync, limit = 200): ResolutionReport {
  const owed = unresolvedAttempts(db, limit);
  const outcomes = owed.map((attempt) => resolveAttempt(db, attempt));

  return {
    examined: outcomes.length,
    settled: outcomes.filter((o) => o.action === 'settled').length,
    released: outcomes.filter((o) => o.action === 'released').length,
    undecided: outcomes.filter((o) => o.action === 'left-undecided').length,
    stillOwed: outcomes.filter((o) => o.action === 'still-owed').length,
    outcomes,
  };
}
