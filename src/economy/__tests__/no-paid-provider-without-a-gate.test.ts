/**
 * AZMA OS — لا مزوِّدَ مدفوعًا بلا بوّابة.
 *
 * ─── WHAT THE AUDIT FOUND, AND WHAT THESE HOLD SHUT ─────────────────────────
 *
 *   Audited against the live release 2026-10-31. Six paid roads existed; two
 *   of them — `edit` and `animate` — reached a billed provider with no
 *   entitlement check, no price, no balance check, no reservation and no
 *   settlement, in the route AND in the service beneath it. `animate` is among
 *   the dearest acts the Empire buys: VEO_MOTION is 96 provider credits per
 *   second, measured, so five seconds is 480.
 *
 *   CORRECTED 2026-11-01: an earlier report said 840 for five seconds. That is
 *   168/second — Seedance, retired 2026-09-27, and forbidden as a current cost
 *   by `qiyamah-cost-truth.ts` in terms. The road was naked; the number was not
 *   its cost.
 *
 *   Two roads I first reported as naked were NOT: `upscale` carries the whole
 *   cycle in its route, and `creative/[operation]` carries it inside
 *   `creative-job-service`. Both corrections came from reading the service and
 *   not only the route file — which is why the last test in this file holds
 *   the SHAPE of the protection rather than its spelling.
 *
 *   Every assertion below reads the LEDGER. A balance is a materialised view;
 *   the ledger is the record, and a test that believes a screen has proved
 *   nothing about money.
 */

import { mkdtempSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

process.env.AZMA_DB_PATH = join(mkdtempSync(join(tmpdir(), 'azma-gate-')), 'gate.db');

import { getDb, createCreator } from '../../persistent-storage';
import { CreatorCreditRepository } from '../credit-ledger/credit-ledger-repository';
import {
  authorisePaidOperation,
  settleAuthorisedOperation,
  releaseAuthorisedOperation,
  pendingReservations,
} from '../paid-operation-gate';
import type { GateVerdict } from '../paid-operation-gate';
import {
  claimAttempt,
  completeAttempt,
  failAttempt,
  readAttempt,
  unresolvedAttempts,
  readClientOperationKey,
} from '../paid-operation-attempts';
import type { AttemptClaim } from '../paid-operation-attempts';
import { reconcileOwedAttempts, resolveAttempt } from '../paid-operation-resolver';

let seq = 0;
const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

function creator(role: 'creator' | 'founder' = 'creator'): string {
  const creatorId = `creator_${(seq += 1)}_${Date.now()}`;
  createCreator(getDb(), {
    creatorId, email: `gate-${seq}@azma.test`, passwordHash: null, role, displayName: 'مبدع',
  });
  return creatorId;
}

/** Units arrive the only way they can: a credit entry in the ledger. */
function fund(creatorId: string, units: number): void {
  new CreatorCreditRepository(getDb()).creditUnits(
    creatorId, units, 'purchase', `fund:${creatorId}:${units}:${(seq += 1)}`,
  );
}

const ledger = (creatorId: string) =>
  getDb()
    .prepare('SELECT transaction_type, direction, amount, status FROM credit_ledger WHERE creator_id = ? ORDER BY rowid')
    .all(creatorId) as { transaction_type: string; direction: string; amount: number; status: string }[];

const balance = (creatorId: string) => new CreatorCreditRepository(getDb()).getBalance(creatorId);

/**
 * One submission, carried the way a real road carries it: the client's key is
 * claimed first, and only a CLAIMED attempt is taken to the gate.
 *
 * `clientKey` null is the unimproved road — no client token, so every request
 * stands alone and holds its own units.
 */
function submit(
  creatorId: string,
  clientKey: string | null,
  role: 'creator' | 'founder' = 'creator',
): { claim: AttemptClaim; verdict: GateVerdict | null } {
  const claim = claimAttempt({ db: getDb(), creatorId, scope: TEST_SCOPE, clientKey });
  if (claim.kind === 'in-flight' || claim.kind === 'already-succeeded') {
    return { claim, verdict: null };
  }
  const verdict = authorisePaidOperation({
    db: getDb(), creatorId, role,
    capability: 'image-generation', gatewayId: 'openai',
    attemptKey: claim.attemptKey,
  });
  return { claim, verdict };
}

const TEST_SCOPE = 'test:image-generation';

/** A fresh claimed attempt, for a test exercising the gate and nothing else. */
function claimKey(creatorId: string): string {
  const claim = claimAttempt({ db: getDb(), creatorId, scope: TEST_SCOPE, clientKey: null });
  if (claim.kind !== 'claimed') throw new Error('a keyless claim is always a new attempt');
  return claim.attemptKey;
}

/** An operation the catalog DOES price, reached with no client key at all. */
function priceable(creatorId: string): GateVerdict {
  const { verdict } = submit(creatorId, null);
  if (verdict === null) throw new Error('a keyless submission can never be deduplicated');
  return verdict;
}

describe('١ · لا تُنفَّذ عمليّةٌ بلا سعرٍ معتمد', () => {
  it('an operation whose price is pending is refused, and nothing is held', () => {
    const me = creator();
    fund(me, 10_000);

    const verdict = authorisePaidOperation({
      db: getDb(), creatorId: me, role: 'creator',
      capability: 'image-editing', gatewayId: 'magic-hour',
      attemptKey: claimKey(me),
    });

    expect(verdict.kind).toBe('refused');
    if (verdict.kind === 'refused') {
      expect(verdict.reason).toBe('cost-unavailable');
      expect(verdict.httpStatus).toBe(503);
    }
    // The decisive proof: the ledger holds the purchase and nothing else.
    expect(ledger(me).filter((e) => e.transaction_type === 'reservation')).toHaveLength(0);
    expect(balance(me).availableUnits).toBe(10_000);
  });

  it('an operation with no price CLASS at all is refused before the engine is asked', () => {
    const me = creator();
    fund(me, 10_000);

    const verdict = authorisePaidOperation({
      db: getDb(), creatorId: me, role: 'creator',
      capability: null, gatewayId: 'magic-hour-lip-sync',
      attemptKey: claimKey(me),
    });

    expect(verdict.kind).toBe('refused');
    expect(balance(me).availableUnits).toBe(10_000);
  });
});

describe('٢ · الاستحقاقات لا تُكسَر ولا تُحاسَب', () => {
  it('a Founder owes nothing and nothing is reserved', () => {
    const founder = creator('founder');
    const verdict = authorisePaidOperation({
      db: getDb(), creatorId: founder, role: 'founder',
      capability: 'image-editing', gatewayId: 'magic-hour',
      attemptKey: claimKey(founder),
    });
    expect(verdict).toEqual({ kind: 'entitled', via: 'founder' });
    expect(ledger(founder)).toHaveLength(0);
  });

  it('a valid free entitlement is spent instead of the balance', () => {
    const me = creator();
    fund(me, 10_000);

    const verdict = authorisePaidOperation({
      db: getDb(), creatorId: me, role: 'creator',
      capability: 'image-generation', gatewayId: 'openai',
      attemptKey: claimKey(me),
      trialCapability: 'image',
    });

    expect(verdict).toEqual({ kind: 'entitled', via: 'trial' });
    // Not one unit moved, and the trial counter did.
    expect(balance(me).availableUnits).toBe(10_000);
    expect(ledger(me).filter((e) => e.transaction_type === 'reservation')).toHaveLength(0);
    const trial = getDb()
      .prepare('SELECT images_used FROM trial_entitlements WHERE creator_id = ?')
      .get(me) as { images_used: number };
    expect(trial.images_used).toBe(1);
  });

  it('settling or releasing entitled work is a no-op, not an error', () => {
    const founder = creator('founder');
    const verdict: GateVerdict = { kind: 'entitled', via: 'founder' };
    expect(() => settleAuthorisedOperation(getDb(), founder, verdict)).not.toThrow();
    expect(() => releaseAuthorisedOperation(getDb(), founder, verdict, 'x')).not.toThrow();
    expect(ledger(founder)).toHaveLength(0);
  });
});

describe('٣ · الرصيد غير الكافي يُوقِف قبل المزوِّد', () => {
  it('too few units refuses with 402 and holds nothing', () => {
    const me = creator();
    // One unit against a catalogued price of forty: the road is priced, and
    // the Creator cannot afford it.
    fund(me, 1);

    const verdict = authorisePaidOperation({
      db: getDb(), creatorId: me, role: 'creator',
      capability: 'image-generation', gatewayId: 'openai',
      attemptKey: claimKey(me),
    });

    expect(verdict.kind).toBe('refused');
    if (verdict.kind === 'refused') {
      expect(verdict.httpStatus).toBe(402);
      expect(verdict.reason).toBe('payment-required');
      expect(verdict.availableUnits).toBe(1);
    }
    expect(balance(me).availableUnits).toBe(1);
  });
});

describe('٤ · الحجز والتسوية والتحرير — على الدفتر لا على الشاشة', () => {
  it('a reservation moves units from available to reserved, and writes one pending entry', () => {
    const me = creator();
    fund(me, 100);
    const before = balance(me);

    const verdict = priceable(me);
    expect(verdict.kind).toBe('reserved');
    if (verdict.kind !== 'reserved') return;

    const after = balance(me);
    expect(after.availableUnits).toBe(before.availableUnits - verdict.units);
    expect(after.reservedUnits).toBe(before.reservedUnits + verdict.units);

    const pending = ledger(me).filter((e) => e.transaction_type === 'reservation' && e.status === 'pending');
    expect(pending).toHaveLength(1);
    expect(pending[0].direction).toBe('debit');
  });

  it('settling spends the units and records a settlement', () => {
    const me = creator();
    fund(me, 100);
    const verdict = priceable(me);
    if (verdict.kind !== 'reserved') throw new Error('expected a reservation');

    settleAuthorisedOperation(getDb(), me, verdict);

    const after = balance(me);
    expect(after.reservedUnits).toBe(0);
    expect(after.totalSpent).toBe(verdict.units);
    const settlements = ledger(me).filter((e) => e.transaction_type === 'settlement');
    expect(settlements).toHaveLength(1);
    expect(settlements[0].amount).toBe(verdict.units);
  });

  it('a provider failure gives every unit back', () => {
    const me = creator();
    fund(me, 100);
    const verdict = priceable(me);
    if (verdict.kind !== 'reserved') throw new Error('expected a reservation');

    releaseAuthorisedOperation(getDb(), me, verdict, 'provider_failed');

    const after = balance(me);
    expect(after.availableUnits).toBe(100);
    expect(after.reservedUnits).toBe(0);
    expect(after.totalSpent).toBe(0);
    expect(ledger(me).filter((e) => e.transaction_type === 'release')).toHaveLength(1);
  });

  it('releasing after settling takes nothing back — the spend stands', () => {
    const me = creator();
    fund(me, 100);
    const verdict = priceable(me);
    if (verdict.kind !== 'reserved') throw new Error('expected a reservation');

    settleAuthorisedOperation(getDb(), me, verdict);
    releaseAuthorisedOperation(getDb(), me, verdict, 'late_release');

    expect(balance(me).totalSpent).toBe(verdict.units);
    expect(balance(me).availableUnits).toBe(100 - verdict.units);
  });
});
describe('٥ · ضغطةٌ واحدةٌ وإن وصلت مرّتين', () => {
  /*  WHAT THESE DECIDE, AND WHY THE SERVER CANNOT DECIDE IT ALONE
   *
   *    Two requests with the same Creator, the same prompt and the same model
   *    are either ONE press the network sent twice, or TWO presses by someone
   *    who wants two pictures. The server cannot tell, and the two wrong
   *    guesses are not equally wrong:
   *
   *      guess «retry»     → the second provider call runs behind the first
   *                          call's hold: a paid provider with NO cover.
   *      guess «new press» → the Creator is charged twice for one press.
   *
   *    So the client says which it meant, with one key per press. These hold
   *    both halves: the key deduplicates, and its ABSENCE never does.
   */

  it('the same submission key, arriving while the first is still running, is refused — no second hold, no second call', () => {
    const me = creator();
    fund(me, 10_000);

    const first = submit(me, 'press-1');
    if (first.verdict?.kind !== 'reserved') throw new Error('expected a reservation');
    const heldAfterFirst = balance(me).reservedUnits;

    const second = submit(me, 'press-1');

    // The decisive answer: the caller is told to wait, and is handed NO
    // authorisation — so there is nothing it could call a provider with.
    expect(second.claim.kind).toBe('in-flight');
    expect(second.verdict).toBeNull();

    expect(ledger(me).filter((e) => e.transaction_type === 'reservation')).toHaveLength(1);
    expect(balance(me).reservedUnits).toBe(heldAfterFirst);
  });

  it('the same submission key, arriving after it SUCCEEDED, is answered from the record — not charged and not performed', () => {
    const me = creator();
    fund(me, 10_000);

    const first = submit(me, 'press-2');
    if (first.verdict?.kind !== 'reserved') throw new Error('expected a reservation');
    settleAuthorisedOperation(getDb(), me, first.verdict);
    completeAttempt(getDb(), first.claim.attemptKey, { assetId: 'asset-xyz' });

    const spentAfterFirst = balance(me).totalSpent;
    const availableAfterFirst = balance(me).availableUnits;

    const replay = submit(me, 'press-2');

    expect(replay.claim.kind).toBe('already-succeeded');
    if (replay.claim.kind === 'already-succeeded') {
      // The Creator is handed back what they already got.
      expect(JSON.parse(replay.claim.resultJson ?? 'null')).toEqual({ assetId: 'asset-xyz' });
    }
    expect(replay.verdict).toBeNull();

    // One reservation, one settlement, and not a unit more spent.
    expect(ledger(me).filter((e) => e.transaction_type === 'reservation')).toHaveLength(1);
    expect(ledger(me).filter((e) => e.transaction_type === 'settlement')).toHaveLength(1);
    expect(balance(me).totalSpent).toBe(spentAfterFirst);
    expect(balance(me).availableUnits).toBe(availableAfterFirst);
  });

  it('the same submission key, arriving after it FAILED, is a fresh attempt that holds its own units', () => {
    const me = creator();
    fund(me, 10_000);

    const first = submit(me, 'press-3');
    if (first.verdict?.kind !== 'reserved') throw new Error('expected a reservation');
    releaseAuthorisedOperation(getDb(), me, first.verdict, 'provider-failed');
    failAttempt(getDb(), first.claim.attemptKey, 'provider:edit-failed');

    const retry = submit(me, 'press-3');

    expect(retry.claim.kind).toBe('claimed-after-failure');
    expect(retry.verdict?.kind).toBe('reserved');
    if (retry.verdict?.kind !== 'reserved') return;

    // A retry of a failed attempt is a real attempt: its own key, its own
    // hold. The old one holds nothing, so sharing it would be an uncovered
    // provider call — which is the mistake this whole file exists to stop.
    expect(retry.verdict.attemptKey).not.toBe(first.claim.attemptKey);
    expect(retry.verdict.reservationId).not.toBe(first.verdict.reservationId);
    expect(balance(me).reservedUnits).toBe(retry.verdict.units);
  });

  it('WITHOUT a submission key, two requests are two operations — each covered', () => {
    const me = creator();
    fund(me, 10_000);

    const a = submit(me, null);
    const b = submit(me, null);
    if (a.verdict?.kind !== 'reserved' || b.verdict?.kind !== 'reserved') {
      throw new Error('expected two reservations');
    }

    expect(b.verdict.reservationId).not.toBe(a.verdict.reservationId);
    // Both held. Never one hold behind two provider calls.
    expect(balance(me).reservedUnits).toBe(a.verdict.units + b.verdict.units);
    expect(ledger(me).filter((e) => e.transaction_type === 'reservation')).toHaveLength(2);
  });

  it('a key from one road never matches the same key on another', () => {
    const me = creator();
    fund(me, 10_000);

    const onThisRoad = claimAttempt({ db: getDb(), creatorId: me, scope: TEST_SCOPE, clientKey: 'same-word' });
    const onAnother = claimAttempt({ db: getDb(), creatorId: me, scope: 'test:another-road', clientKey: 'same-word' });

    expect(onThisRoad.kind).toBe('claimed');
    expect(onAnother.kind).toBe('claimed');
    expect(onAnother.attemptKey).not.toBe(onThisRoad.attemptKey);
  });

  it('one Creator’s key never matches another’s', () => {
    const a = creator();
    const b = creator();
    const first = claimAttempt({ db: getDb(), creatorId: a, scope: TEST_SCOPE, clientKey: 'shared' });
    const second = claimAttempt({ db: getDb(), creatorId: b, scope: TEST_SCOPE, clientKey: 'shared' });
    expect(second.kind).toBe('claimed');
    expect(second.attemptKey).not.toBe(first.attemptKey);
  });

  it('settling the same reservation twice spends it once', () => {
    const me = creator();
    fund(me, 1_000);
    const verdict = priceable(me);
    if (verdict.kind !== 'reserved') throw new Error('expected a reservation');

    settleAuthorisedOperation(getDb(), me, verdict);
    settleAuthorisedOperation(getDb(), me, verdict);

    expect(ledger(me).filter((e) => e.transaction_type === 'settlement')).toHaveLength(1);
    expect(balance(me).totalSpent).toBe(verdict.units);
  });

  describe('a key that cannot be trusted is not a key', () => {
    it.each([
      ['empty', ''],
      ['whitespace only', '   '],
      ['longer than 200 characters', 'k'.repeat(201)],
      ['carrying a control character', 'abc\u0000def'],
    ])('%s is read as no key at all', (_name, value) => {
      expect(readClientOperationKey(value)).toBeNull();
    });

    it('a usable key is returned trimmed', () => {
      expect(readClientOperationKey('  press-9  ')).toBe('press-9');
    });

    it('a missing header is no key, not an empty one', () => {
      expect(readClientOperationKey(null)).toBeNull();
      expect(readClientOperationKey(undefined)).toBeNull();
    });
  });
});

describe('٦ · التزامن — لا يُنفَق أكثرُ من الموجود', () => {
  it('two intents with room for one: the second is refused, and the sum never exceeds the balance', () => {
    // Learn the catalogued price from a well-funded probe, then fund a second
    // Creator for exactly ONE operation — so the second intent has nowhere to
    // take its units from.
    const probeOwner = creator();
    fund(probeOwner, 10_000);
    const probe = priceable(probeOwner);
    if (probe.kind !== 'reserved') throw new Error('expected a priced reservation');
    const unitPrice = probe.units;

    const me = creator();
    fund(me, unitPrice);

    const a = priceable(me);
    const b = priceable(me);

    expect(a.kind).toBe('reserved');
    expect(b.kind).toBe('refused');
    const after = balance(me);
    expect(after.availableUnits).toBeGreaterThanOrEqual(0);
    expect(after.reservedUnits).toBe(unitPrice);
  });
});

describe('٧ · التسويةُ الفاشلةُ تَترُك أثرًا يُصالَح', () => {
  /*  WHAT WENT WRONG, AND WHAT A RESOLVER MAY AND MAY NOT DO
   *
   *    Seven places wrapped `settle` in `catch { }`. The Creator rightly kept
   *    their result — but the hold stayed pending, the units stayed locked out
   *    of their own availability, `total_spent` never moved, and nothing said
   *    so anywhere.
   *
   *    The tempting cure is a sweeper that releases anything held for an hour.
   *    It is wrong and expensive: a provider job that SUCCEEDED and whose
   *    settlement failed would have its hold handed back, and the Empire would
   *    have paid for work it then gave away. So the resolver reads the
   *    attempt's own recorded outcome, and age decides nothing.
   */

  it('a settlement that cannot be applied is recorded, not swallowed', () => {
    const me = creator();
    const phantom: GateVerdict = {
      kind: 'reserved',
      reservationId: 'reservation_that_never_was',
      units: 7,
      attemptKey: claimKey(me),
    };

    expect(() => settleAuthorisedOperation(getDb(), me, phantom)).not.toThrow();

    const recon = ledger(me).filter((e) => e.transaction_type === 'reconciliation_required');
    expect(recon).toHaveLength(1);
    expect(recon[0].status).toBe('pending');
  });

  it('a hold whose settlement failed stays OWED, which is what the resolver reads', () => {
    const me = creator();
    fund(me, 10_000);
    const { claim, verdict } = submit(me, 'settle-will-fail');
    if (verdict?.kind !== 'reserved') throw new Error('expected a reservation');

    completeAttempt(getDb(), claim.attemptKey, { assetId: 'produced' });
    // The ledger stumbles: the hold is gone from under the settlement.
    getDb().prepare("UPDATE credit_ledger SET status = 'reversed' WHERE ledger_id = ?").run(verdict.reservationId);
    settleAuthorisedOperation(getDb(), me, verdict);

    expect(readAttempt(getDb(), claim.attemptKey)?.settlementState).toBe('owed');
    expect(unresolvedAttempts(getDb()).map((a) => a.attemptKey)).toContain(claim.attemptKey);
  });

  it('the resolver SETTLES a hold whose operation succeeded', () => {
    const me = creator();
    fund(me, 10_000);
    const { claim, verdict } = submit(me, 'recon-success');
    if (verdict?.kind !== 'reserved') throw new Error('expected a reservation');

    // The shape of a process that produced and then died before settling.
    completeAttempt(getDb(), claim.attemptKey, { assetId: 'produced' });
    const attempt = readAttempt(getDb(), claim.attemptKey);
    if (!attempt) throw new Error('attempt not recorded');

    const outcome = resolveAttempt(getDb(), attempt);

    expect(outcome.action).toBe('settled');
    expect(ledger(me).filter((e) => e.transaction_type === 'settlement')).toHaveLength(1);
    expect(balance(me).totalSpent).toBe(verdict.units);
    expect(balance(me).reservedUnits).toBe(0);
    expect(readAttempt(getDb(), claim.attemptKey)?.settlementState).toBe('settled');
  });

  it('the resolver RELEASES a hold whose operation failed, and the units come back', () => {
    const me = creator();
    fund(me, 10_000);
    const opening = balance(me).availableUnits;
    const { claim, verdict } = submit(me, 'recon-failure');
    if (verdict?.kind !== 'reserved') throw new Error('expected a reservation');

    failAttempt(getDb(), claim.attemptKey, 'provider:timed-out');
    const attempt = readAttempt(getDb(), claim.attemptKey);
    if (!attempt) throw new Error('attempt not recorded');

    const outcome = resolveAttempt(getDb(), attempt);

    expect(outcome.action).toBe('released');
    expect(balance(me).availableUnits).toBe(opening);
    expect(balance(me).totalSpent).toBe(0);
    expect(readAttempt(getDb(), claim.attemptKey)?.settlementState).toBe('released');
  });

  it('the resolver NEVER touches a hold whose operation has not reported — however old it is', () => {
    const me = creator();
    fund(me, 10_000);
    const { claim, verdict } = submit(me, 'still-running');
    if (verdict?.kind !== 'reserved') throw new Error('expected a reservation');

    // Aged by a week. Age is the one thing that must not decide this.
    getDb()
      .prepare('UPDATE paid_operation_attempts SET created_at_ms = ? WHERE attempt_key = ?')
      .run(Date.now() - 7 * 24 * 60 * 60 * 1_000, claim.attemptKey);

    const report = reconcileOwedAttempts(getDb());
    const mine = report.outcomes.find((o) => o.attemptKey === claim.attemptKey);

    expect(mine?.action).toBe('left-undecided');
    // Still held, still pending, nothing spent and nothing given back: a
    // provider job that succeeded must never have its hold released by a clock.
    expect(balance(me).reservedUnits).toBe(verdict.units);
    expect(balance(me).totalSpent).toBe(0);
    expect(
      getDb().prepare('SELECT status FROM credit_ledger WHERE ledger_id = ?').get(verdict.reservationId),
    ).toEqual({ status: 'pending' });
  });

  it('running the resolver twice moves no money the second time', () => {
    const me = creator();
    fund(me, 10_000);
    const { claim, verdict } = submit(me, 'recon-twice');
    if (verdict?.kind !== 'reserved') throw new Error('expected a reservation');
    completeAttempt(getDb(), claim.attemptKey, { assetId: 'produced' });

    reconcileOwedAttempts(getDb());
    const afterFirst = balance(me);
    const settlementsAfterFirst = ledger(me).filter((e) => e.transaction_type === 'settlement').length;

    reconcileOwedAttempts(getDb());

    expect(balance(me).totalSpent).toBe(afterFirst.totalSpent);
    expect(balance(me).availableUnits).toBe(afterFirst.availableUnits);
    expect(ledger(me).filter((e) => e.transaction_type === 'settlement')).toHaveLength(settlementsAfterFirst);
  });

  it('an entitled operation is never owed anything to resolve', () => {
    const founder = creator('founder');
    const claim = claimAttempt({ db: getDb(), creatorId: founder, scope: TEST_SCOPE, clientKey: 'free-work' });
    if (claim.kind !== 'claimed') throw new Error('expected a claim');
    completeAttempt(getDb(), claim.attemptKey, { assetId: 'free' });

    expect(readAttempt(getDb(), claim.attemptKey)?.settlementState).toBe('not-owed');
    expect(unresolvedAttempts(getDb()).map((a) => a.attemptKey)).not.toContain(claim.attemptKey);
  });

  it('a hold with no recorded amount is left owed rather than settled for zero', () => {
    const me = creator();
    fund(me, 10_000);
    const { claim, verdict } = submit(me, 'amount-lost');
    if (verdict?.kind !== 'reserved') throw new Error('expected a reservation');
    completeAttempt(getDb(), claim.attemptKey, { assetId: 'produced' });
    getDb().prepare('UPDATE paid_operation_attempts SET units_held = NULL WHERE attempt_key = ?').run(claim.attemptKey);

    const attempt = readAttempt(getDb(), claim.attemptKey);
    if (!attempt) throw new Error('attempt not recorded');
    const outcome = resolveAttempt(getDb(), attempt);

    // Settling for zero would hand the whole hold back and make a paid
    // success free. A missing number is not a zero.
    expect(outcome.action).toBe('still-owed');
    expect(balance(me).totalSpent).toBe(0);
    expect(balance(me).reservedUnits).toBe(verdict.units);
  });

  it('a stuck hold can still be found by age, so nothing is locked in silence', () => {
    const me = creator();
    fund(me, 1_000);
    const verdict = priceable(me);
    if (verdict.kind !== 'reserved') throw new Error('expected a reservation');

    // A report a human reads — not an instruction anything acts on.
    expect(pendingReservations(getDb(), 60_000).map((r) => r.reservationId)).not.toContain(verdict.reservationId);
    expect(pendingReservations(getDb(), -1).map((r) => r.reservationId)).toContain(verdict.reservationId);
  });

  it('a settled hold is no longer pending', () => {
    const me = creator();
    fund(me, 1_000);
    const verdict = priceable(me);
    if (verdict.kind !== 'reserved') throw new Error('expected a reservation');
    settleAuthorisedOperation(getDb(), me, verdict);
    expect(pendingReservations(getDb(), -1).map((r) => r.reservationId)).not.toContain(verdict.reservationId);
  });
});

describe('٨ · كلُّ طريقٍ مدفوعٍ يَمُرُّ ببوّابة', () => {
  /**
   * The SHAPE, not the spelling. Twice during this audit a route looked naked
   * because its protection lived in the service it called — so each road is
   * judged by itself AND by what it delegates to.
   */
  const roads: readonly { name: string; files: readonly string[] }[] = [
    { name: 'edit', files: ['app/api/vault/assets/[assetId]/edit/route.ts', 'src/qiyamah-generation/image-edit-service.ts'] },
    { name: 'animate', files: ['app/api/vault/assets/[assetId]/animate/route.ts'] },
    { name: 'upscale', files: ['app/api/vault/assets/[assetId]/upscale/route.ts'] },
    { name: 'creative', files: ['app/api/vault/assets/[assetId]/creative/[operation]/route.ts', 'src/vault/creative-job-service.ts'] },
    { name: 'qiyamah-generate', files: ['app/api/qiyamah/generate/route.ts'] },
    { name: 'clone-voice', files: ['app/api/vault/assets/clone-voice/route.ts'] },
    { name: 'generate-speech', files: ['app/api/vault/assets/generate-speech/route.ts'] },
    { name: 'generate-cloned-speech', files: ['app/api/vault/assets/generate-cloned-speech/route.ts'] },
    // FOUND 2026-11-01, by tracing providers to their callers instead of
    // listing routes: the storyboard commission reached the billed image
    // provider from `app/api/ras-amr/*`, which neither earlier audit read.
    {
      name: 'ras-amr-scene-commission',
      files: [
        'app/api/ras-amr/storyboard/[storyboardId]/produce/route.ts',
        'src/ras-amr-production/qiyamah-commission.ts',
      ],
    },
  ];

  it.each(roads)('$name holds the money before it calls the provider', ({ files }) => {
    const source = files.map(read).join('\n');
    const authorises = /authorisePaidOperation\(/.test(source) || /\.reserve\(/.test(source);
    // Three spellings of one act, because a road may hold its own money
    // (`.settle`), pass through the gate (`settleAuthorisedOperation`), or use
    // the shared settlement for a hold taken outside it (`settleReservation`).
    // This test was written to judge the SHAPE; a regex that knew only one
    // spelling failed every road the moment the shared helper arrived, while
    // saying nothing about whether the money was safe.
    const settles = /settleAuthorisedOperation\(|settleReservation\(|\.settle\(/.test(source);
    const releases = /releaseAuthorisedOperation\(|releaseReservation\(|\.release\(/.test(source);
    expect({ authorises, settles, releases }).toEqual({ authorises: true, settles: true, releases: true });
  });

  it('the three roads the audits found naked now use the shared gate, not a copy of it', () => {
    // The edit's gate lives in the SERVICE, because a second caller reaches
    // the act without the route; the scene commission's lives in the courier,
    // because one commission makes many scenes and the money belongs to the
    // scene. Each road is judged where its act is.
    for (const f of [
      'src/qiyamah-generation/image-edit-service.ts',
      'app/api/vault/assets/[assetId]/animate/route.ts',
      'src/ras-amr-production/qiyamah-commission.ts',
    ]) {
      const source = read(f);
      expect(source).toContain('authorisePaidOperation(');
      // One module, however the importer spells the path to it.
      expect(source).toMatch(/from '[^']*economy\/paid-operation-gate'/);
      // No second economy: neither road may reach the ledger on its own.
      expect(source).not.toContain('new CreatorCreditRepository(');
    }
  });
});
