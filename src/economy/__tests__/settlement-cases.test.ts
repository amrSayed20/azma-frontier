/**
 * AZMA OS — حالاتُ التسويةِ السبع، بحالةِ القيودِ قبلَ العمليّةِ وبعدها.
 *
 * ─── THE SEVEN THE ARCHITECT NAMED, AND WHY EACH IS ITS OWN CASE ────────────
 *
 *   1 · the provider failed before producing anything
 *   2 · the provider succeeded and keeping the asset failed
 *   3 · the asset was kept and the settlement failed
 *   4 · the provider returned an unknown result
 *   5 · some scenes of a multi-scene operation succeeded and some failed
 *   6 · reconciliation run more than once
 *   7 · a late result arriving after an undecided state was recorded
 *
 *   They are not variations of one case. In 1 the Creator owes nothing; in 2
 *   they owe nothing either but for a different reason, and the Empire has
 *   already paid; in 3 they owe and the ledger refused to take it; in 4 NOBODY
 *   may decide; in 5 one operation holds several answers at once.
 *
 *   Every assertion reads the LEDGER and the ATTEMPT row, before and after. A
 *   balance is a materialised view; the ledger is the record.
 *
 *   THREE RULES THAT HOLD ACROSS ALL SEVEN, each with its own test:
 *     · age alone never releases a hold
 *     · an operation is never settled for an amount nobody recorded
 *     · the resolver never calls a paid provider to repair a ledger
 */

import { mkdtempSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

process.env.AZMA_DB_PATH = join(mkdtempSync(join(tmpdir(), 'azma-settle-')), 'settle.db');

import { getDb, createCreator } from '../../persistent-storage';
import { CreatorCreditRepository } from '../credit-ledger/credit-ledger-repository';
import {
  authorisePaidOperation, settleAuthorisedOperation, releaseAuthorisedOperation,
} from '../paid-operation-gate';
import {
  claimAttempt, completeAttempt, failAttempt, readAttempt, unresolvedAttempts,
} from '../paid-operation-attempts';
import { reconcileOwedAttempts, resolveAttempt } from '../paid-operation-resolver';

const SCOPE = 'settle:image-generation';
let seq = 0;

function creator(): string {
  const id = `st_${++seq}`;
  createCreator(getDb(), { creatorId: id, email: `${id}@azma.test`, passwordHash: null, displayName: 'مبدع' });
  return id;
}
function fund(id: string, units: number): void {
  new CreatorCreditRepository(getDb()).creditUnits(id, units, 'purchase', `fund:${id}`);
}

/** The ledger as a record, not as a balance. */
function ledgerOf(creatorId: string) {
  return getDb()
    .prepare(`SELECT transaction_type AS type, amount, status FROM credit_ledger
                WHERE creator_id = ? ORDER BY rowid`)
    .all(creatorId) as { type: string; amount: number; status: string }[];
}
function balanceOf(creatorId: string) {
  const b = new CreatorCreditRepository(getDb()).getBalance(creatorId);
  return { available: b.availableUnits, reserved: b.reservedUnits, spent: b.totalSpent };
}
/** The hold's own row, which is what the resolver reads. */
function holdStatus(reservationId: string): string | undefined {
  return (getDb()
    .prepare('SELECT status FROM credit_ledger WHERE ledger_id = ?')
    .get(reservationId) as { status?: string } | undefined)?.status;
}

function submit(creatorId: string, clientKey: string | null, scope = SCOPE) {
  const claim = claimAttempt({ db: getDb(), creatorId, scope, clientKey });
  if (claim.kind === 'in-flight' || claim.kind === 'already-succeeded') return { claim, verdict: null };
  return {
    claim,
    verdict: authorisePaidOperation({
      db: getDb(), creatorId, role: 'creator',
      capability: 'image-generation', gatewayId: 'openai',
      attemptKey: claim.attemptKey,
    }),
  };
}

/** One funded Creator with one hold standing, ready for a case to end it. */
function creatorWithHold(clientKey: string) {
  const me = creator();
  fund(me, 1_000);
  const before = { ledger: ledgerOf(me), balance: balanceOf(me) };
  const { claim, verdict } = submit(me, clientKey);
  if (verdict?.kind !== 'reserved') throw new Error('expected a hold');
  return { me, claim, verdict, before, held: { ledger: ledgerOf(me), balance: balanceOf(me) } };
}

describe('١ · فشلُ المزوِّدِ قبلَ إنتاجِ الأصل', () => {
  it('the hold goes back whole, nothing is spent, and the attempt is resolved', () => {
    const { me, claim, verdict, before, held } = creatorWithHold('case-1');

    // BEFORE: bought 1000, held 40 of it, spent nothing.
    expect(before.balance).toEqual({ available: 1_000, reserved: 0, spent: 0 });
    expect(held.balance).toEqual({ available: 960, reserved: 40, spent: 0 });
    expect(holdStatus(verdict.reservationId)).toBe('pending');

    releaseAuthorisedOperation(getDb(), me, verdict, 'provider-failed');
    failAttempt(getDb(), claim.attemptKey, 'provider:refused');

    // AFTER: exactly where they started, and the record says why.
    expect(balanceOf(me)).toEqual({ available: 1_000, reserved: 0, spent: 0 });
    expect(holdStatus(verdict.reservationId)).toBe('reversed');
    expect(ledgerOf(me).map((e) => `${e.type}:${e.status}`)).toEqual([
      'purchase:completed', 'reservation:reversed', 'release:completed',
    ]);
    const attempt = readAttempt(getDb(), claim.attemptKey);
    expect([attempt?.state, attempt?.settlementState]).toEqual(['failed', 'released']);
    // Resolved means resolved: the resolver has nothing left to do here.
    expect(unresolvedAttempts(getDb()).map((a) => a.attemptKey)).not.toContain(claim.attemptKey);
  });
});

describe('٢ · نجاحُ المزوِّدِ وفشلُ حفظِ الأصل', () => {
  it('the Creator pays nothing — and the Empire has paid, which the record shows', () => {
    const { me, claim, verdict } = creatorWithHold('case-2');

    // The provider produced; the Vault refused the deposit. The bytes are
    // gone and no asset exists, so the Creator owes nothing — the Empire's own
    // provider charge is a loss it carries, and that is a different number
    // from anything in this ledger.
    releaseAuthorisedOperation(getDb(), me, verdict, 'deposit-failed');
    failAttempt(getDb(), claim.attemptKey, 'storage:deposit-failed');

    expect(balanceOf(me)).toEqual({ available: 1_000, reserved: 0, spent: 0 });
    expect(holdStatus(verdict.reservationId)).toBe('reversed');
    // The REASON is kept, so this case can be told apart from case 1 when
    // someone asks why the Empire paid for nothing.
    expect(readAttempt(getDb(), claim.attemptKey)?.failureReason).toBe('storage:deposit-failed');
  });
});

describe('٣ · حُفِظ الأصلُ وفَشِلت التسوية', () => {
  it('the Creator keeps the asset, the debt is recorded, and the asset stays known', () => {
    const { me, claim, verdict } = creatorWithHold('case-3');

    // The asset was deposited and the attempt knows WHICH asset.
    completeAttempt(getDb(), claim.attemptKey, { assetId: 'asset-case-3' });
    // Then the ledger stumbles: the hold is gone from under the settlement.
    getDb().prepare("UPDATE credit_ledger SET status = 'reversed' WHERE ledger_id = ?")
      .run(verdict.reservationId);

    settleAuthorisedOperation(getDb(), me, verdict);

    // THE RULE: the Creator does not lose what they earned.
    const attempt = readAttempt(getDb(), claim.attemptKey);
    expect(attempt?.state).toBe('succeeded');
    expect(JSON.parse(attempt?.resultJson ?? 'null')).toEqual({ assetId: 'asset-case-3' });
    // AND the debt is recorded in two places that answer two questions.
    expect(attempt?.settlementState).toBe('owed');
    expect(ledgerOf(me).some((e) => e.type === 'reconciliation_required' && e.status === 'pending')).toBe(true);
    expect(unresolvedAttempts(getDb()).map((a) => a.attemptKey)).toContain(claim.attemptKey);
  });

  it('and when the settlement CAN be applied, the resolver takes the charge', () => {
    const { me, claim, verdict } = creatorWithHold('case-3b');
    completeAttempt(getDb(), claim.attemptKey, { assetId: 'asset-case-3b' });

    // BEFORE: produced, hold still standing, nothing spent.
    expect(balanceOf(me)).toEqual({ available: 960, reserved: 40, spent: 0 });
    expect(holdStatus(verdict.reservationId)).toBe('pending');

    const attempt = readAttempt(getDb(), claim.attemptKey)!;
    const outcome = resolveAttempt(getDb(), attempt);

    // AFTER: charged exactly once, for exactly what was held.
    expect(outcome.action).toBe('settled');
    expect(balanceOf(me)).toEqual({ available: 960, reserved: 0, spent: 40 });
    expect(holdStatus(verdict.reservationId)).toBe('completed');
    expect(ledgerOf(me).filter((e) => e.type === 'settlement')).toHaveLength(1);
  });
});

describe('٤ · نتيجةٌ مجهولةٌ من المزوِّد', () => {
  it('NOBODY decides — not the clock, not the resolver', () => {
    const { me, claim, verdict } = creatorWithHold('case-4');

    // The provider answered nothing at all: no success, no failure. The
    // attempt stays in-flight, which is the honest record.
    expect(readAttempt(getDb(), claim.attemptKey)?.state).toBe('in-flight');

    // Aged by a month, because age is the one thing that must not decide this.
    getDb().prepare('UPDATE paid_operation_attempts SET created_at_ms = ? WHERE attempt_key = ?')
      .run(Date.now() - 30 * 24 * 60 * 60 * 1_000, claim.attemptKey);

    const report = reconcileOwedAttempts(getDb());
    const mine = report.outcomes.find((o) => o.attemptKey === claim.attemptKey);

    expect(mine?.action).toBe('left-undecided');
    // Still held, still pending, nothing spent and nothing given back.
    expect(balanceOf(me)).toEqual({ available: 960, reserved: 40, spent: 0 });
    expect(holdStatus(verdict.reservationId)).toBe('pending');
    // And it is VISIBLE, which is the point of not touching it.
    expect(unresolvedAttempts(getDb()).map((a) => a.attemptKey)).toContain(claim.attemptKey);
  });
});

describe('٥ · عمليّةٌ متعدّدةُ المشاهد: بعضُها نَجح وبعضُها فَشِل', () => {
  it('each scene is settled or released on its own, and the charge is the successes only', () => {
    const me = creator();
    fund(me, 1_000);

    // Three scenes of ONE commission, each with its own hold — because one
    // hold for three scenes would charge for a scene that failed.
    const scenes = ['scene-a', 'scene-b', 'scene-c'].map((id) => {
      const claim = claimAttempt({ db: getDb(), creatorId: me, scope: 'settle:scenes', clientKey: id });
      if (claim.kind !== 'claimed') throw new Error('expected a claim');
      const verdict = authorisePaidOperation({
        db: getDb(), creatorId: me, role: 'creator',
        capability: 'image-generation', gatewayId: 'openai',
        attemptKey: claim.attemptKey,
      });
      if (verdict.kind !== 'reserved') throw new Error('expected a hold');
      return { id, claim, verdict };
    });

    const unit = scenes[0]!.verdict.kind === 'reserved' ? scenes[0]!.verdict.units : 0;
    // BEFORE: three holds standing.
    expect(balanceOf(me)).toEqual({ available: 1_000 - 3 * unit, reserved: 3 * unit, spent: 0 });

    // The first and third produced; the second did not.
    for (const scene of [scenes[0]!, scenes[2]!]) {
      settleAuthorisedOperation(getDb(), me, scene.verdict, undefined, { assetId: `asset-${scene.id}` });
      completeAttempt(getDb(), scene.claim.attemptKey, { assetId: `asset-${scene.id}` });
    }
    releaseAuthorisedOperation(getDb(), me, scenes[1]!.verdict, 'scene-failed');
    failAttempt(getDb(), scenes[1]!.claim.attemptKey, 'provider:refused');

    // AFTER: two charges, one refund, and nothing left held.
    expect(balanceOf(me)).toEqual({
      available: 1_000 - 2 * unit, reserved: 0, spent: 2 * unit,
    });
    expect(ledgerOf(me).filter((e) => e.type === 'settlement')).toHaveLength(2);
    expect(ledgerOf(me).filter((e) => e.type === 'release')).toHaveLength(1);
    // And the failed scene can be retried on its own without touching the two
    // that succeeded: its key is spent, theirs replay.
    expect(readAttempt(getDb(), scenes[1]!.claim.attemptKey)?.state).toBe('failed');
    expect(readAttempt(getDb(), scenes[0]!.claim.attemptKey)?.state).toBe('succeeded');
  });
});

describe('٦ · تشغيلُ المصالحةِ أكثرَ من مرّة', () => {
  it('moves money once, and three runs look exactly like one', () => {
    const { me, claim } = creatorWithHold('case-6');
    completeAttempt(getDb(), claim.attemptKey, { assetId: 'asset-case-6' });

    reconcileOwedAttempts(getDb());
    const afterFirst = { balance: balanceOf(me), ledger: ledgerOf(me) };

    reconcileOwedAttempts(getDb());
    reconcileOwedAttempts(getDb());

    expect(balanceOf(me)).toEqual(afterFirst.balance);
    expect(ledgerOf(me)).toEqual(afterFirst.ledger);
    expect(readAttempt(getDb(), claim.attemptKey)?.settlementState).toBe('settled');
  });
});

describe('٧ · نتيجةٌ متأخّرةٌ تَصِل بعد تسجيلِ حالةٍ غيرِ محسومة', () => {
  it('the late answer is still accepted, and the hold is then charged correctly', () => {
    const { me, claim, verdict } = creatorWithHold('case-7');

    // The resolver looked, found it undecided, and left it — as case 4 proves.
    const firstLook = reconcileOwedAttempts(getDb());
    expect(firstLook.outcomes.find((o) => o.attemptKey === claim.attemptKey)?.action)
      .toBe('left-undecided');
    expect(holdStatus(verdict.reservationId)).toBe('pending');

    // THEN the provider's answer arrives — minutes or hours later.
    completeAttempt(getDb(), claim.attemptKey, { assetId: 'asset-case-7' });

    // The next run can now speak for it, and does.
    const secondLook = reconcileOwedAttempts(getDb());
    expect(secondLook.outcomes.find((o) => o.attemptKey === claim.attemptKey)?.action)
      .toBe('settled');
    expect(balanceOf(me)).toEqual({ available: 960, reserved: 0, spent: 40 });
    // This is exactly why nothing was released on the first look: the work had
    // succeeded, and a clock-driven refund would have given it away.
    expect(readAttempt(getDb(), claim.attemptKey)?.settlementState).toBe('settled');
  });

  it('a late FAILURE after an undecided look gives the units back, not a charge', () => {
    const { me, claim } = creatorWithHold('case-7b');
    reconcileOwedAttempts(getDb());
    failAttempt(getDb(), claim.attemptKey, 'provider:timed-out');

    reconcileOwedAttempts(getDb());

    expect(balanceOf(me)).toEqual({ available: 1_000, reserved: 0, spent: 0 });
    expect(readAttempt(getDb(), claim.attemptKey)?.settlementState).toBe('released');
  });
});

describe('٨ · ثلاثُ قواعدَ تَسري على السبعةِ جميعًا', () => {
  it('age alone never releases a hold', () => {
    const { me, claim, verdict } = creatorWithHold('rule-age');
    getDb().prepare('UPDATE paid_operation_attempts SET created_at_ms = ? WHERE attempt_key = ?')
      .run(0, claim.attemptKey); // as old as the epoch

    reconcileOwedAttempts(getDb());

    expect(holdStatus(verdict.reservationId)).toBe('pending');
    expect(balanceOf(me).reserved).toBe(40);
  });

  it('an operation is never settled for an amount nobody recorded', () => {
    const { me, claim, verdict } = creatorWithHold('rule-amount');
    completeAttempt(getDb(), claim.attemptKey, { assetId: 'asset-rule' });
    getDb().prepare('UPDATE paid_operation_attempts SET units_held = NULL WHERE attempt_key = ?')
      .run(claim.attemptKey);

    const outcome = resolveAttempt(getDb(), readAttempt(getDb(), claim.attemptKey)!);

    // Settling for zero would hand the whole hold back and make a paid
    // success free. A missing number is not a zero.
    expect(outcome.action).toBe('still-owed');
    expect(balanceOf(me).spent).toBe(0);
    expect(holdStatus(verdict.reservationId)).toBe('pending');
  });

  it('the resolver never calls a paid provider to repair a ledger', () => {
    // Asserted on the resolver's own source, because the only honest way to
    // prove a function does not contact a provider is that it cannot: it
    // imports nothing that could.
    const source = readFileSync(join(process.cwd(), 'src/economy/paid-operation-resolver.ts'), 'utf8');
    expect(source).not.toMatch(/ViaProvider|generateImage|generateVideo|fetch\(|runCreativeOperation/);
    // It reaches exactly two things: the ledger, and the attempt record.
    const imports = [...source.matchAll(/from '([^']+)'/g)].map((m) => m[1]!);
    expect(imports.sort()).toEqual([
      './credit-ledger/credit-ledger-repository',
      './paid-operation-attempts',
      './paid-operation-attempts',
      'node:sqlite',
    ]);
  });
});
