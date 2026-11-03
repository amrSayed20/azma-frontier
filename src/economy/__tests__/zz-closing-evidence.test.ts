/**
 * CLOSING EVIDENCE — prints the ledger, the holds and the operation states.
 *
 * This file is an instrument, not a guard: it asserts almost nothing and
 * exists to put real rows in front of a reader. It runs on its own temporary
 * SQLite file and touches no production data.
 */

import { mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

process.env.AZMA_DB_PATH = join(mkdtempSync(join(tmpdir(), 'azma-evidence-')), 'evidence.db');

import { getDb, createCreator } from '../../persistent-storage';
import { CreatorCreditRepository } from '../credit-ledger/credit-ledger-repository';
import {
  authorisePaidOperation, settleAuthorisedOperation, releaseAuthorisedOperation,
} from '../paid-operation-gate';
import { claimAttempt, completeAttempt, failAttempt } from '../paid-operation-attempts';
import { reconcileOwedAttempts } from '../paid-operation-resolver';

const SCOPE = 'evidence:image-generation';
let n = 0;

function creator(role: 'creator' | 'founder' = 'creator'): string {
  const id = `ev_${++n}`;
  createCreator(getDb(), { creatorId: id, email: `${id}@azma.test`, passwordHash: null, role, displayName: 'مبدع' });
  return id;
}
function fund(id: string, units: number): void {
  new CreatorCreditRepository(getDb()).creditUnits(id, units, 'purchase', `fund:${id}`);
}
function submit(creatorId: string, clientKey: string | null) {
  const claim = claimAttempt({ db: getDb(), creatorId, scope: SCOPE, clientKey });
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

function dump(label: string, creatorId: string): void {
  const db = getDb();
  const ledger = db
    .prepare(`SELECT transaction_type AS type, direction, amount, status, balance_after
                FROM credit_ledger WHERE creator_id = ? ORDER BY rowid`)
    .all(creatorId);
  const attempts = db
    .prepare(`SELECT scope, state, settlement_state, units_held, failure_reason
                FROM paid_operation_attempts WHERE creator_id = ? ORDER BY created_at_ms`)
    .all(creatorId);
  const bal = new CreatorCreditRepository(db).getBalance(creatorId);
  console.log(`\nEVIDENCE · ${label}`);
  console.log('  balance  ' + JSON.stringify({
    available: bal.availableUnits, reserved: bal.reservedUnits, spent: bal.totalSpent,
  }));
  console.log('  ledger   ' + JSON.stringify(ledger));
  console.log('  attempts ' + JSON.stringify(attempts));
}

describe('closing evidence', () => {
  it('A · one press, charged once and settled', () => {
    const me = creator(); fund(me, 1_000);
    const { claim, verdict } = submit(me, 'press-A');
    if (verdict?.kind !== 'reserved') throw new Error('expected a hold');
    settleAuthorisedOperation(getDb(), me, verdict);
    completeAttempt(getDb(), claim.attemptKey, { assetId: 'asset-A' });
    dump('A · one press, settled', me);
    // 1000 bought, 40 held, 40 spent, nothing left reserved.
    const a = new CreatorCreditRepository(getDb()).getBalance(me);
    expect([a.availableUnits, a.reservedUnits, a.totalSpent]).toEqual([960, 0, 40]);
  });

  it('B · the same press arriving twice', () => {
    const me = creator(); fund(me, 1_000);
    const first = submit(me, 'press-B');
    if (first.verdict?.kind !== 'reserved') throw new Error('expected a hold');
    const second = submit(me, 'press-B');
    console.log('\nEVIDENCE · B · second arrival verdict: ' + JSON.stringify({
      claimKind: second.claim.kind, authorised: second.verdict !== null,
    }));
    dump('B · two arrivals, one hold', me);
    expect(second.verdict).toBeNull();
  });

  it('C · two deliberate presses with no key — both covered', () => {
    const me = creator(); fund(me, 1_000);
    submit(me, null); submit(me, null);
    dump('C · two keyless submissions', me);
    // BOTH covered. Never one hold standing behind two provider calls.
    const c = new CreatorCreditRepository(getDb()).getBalance(me);
    expect([c.availableUnits, c.reservedUnits]).toEqual([920, 80]);
  });

  it('D · a provider failure gives the units back', () => {
    const me = creator(); fund(me, 1_000);
    const { claim, verdict } = submit(me, 'press-D');
    if (verdict?.kind !== 'reserved') throw new Error('expected a hold');
    releaseAuthorisedOperation(getDb(), me, verdict, 'provider-failed');
    failAttempt(getDb(), claim.attemptKey, 'provider:timed-out');
    dump('D · released after failure', me);
    // Back to the opening balance, and nothing spent.
    const d = new CreatorCreditRepository(getDb()).getBalance(me);
    expect([d.availableUnits, d.reservedUnits, d.totalSpent]).toEqual([1000, 0, 0]);
  });

  it('E · a settlement the ledger refused, then reconciled', () => {
    const me = creator(); fund(me, 1_000);
    const { claim, verdict } = submit(me, 'press-E');
    if (verdict?.kind !== 'reserved') throw new Error('expected a hold');
    completeAttempt(getDb(), claim.attemptKey, { assetId: 'asset-E' });
    // The shape of a process that produced and then died before settling.
    dump('E1 · produced, hold still standing', me);
    const report = reconcileOwedAttempts(getDb());
    console.log('\nEVIDENCE · E2 · resolver report: ' + JSON.stringify({
      examined: report.examined, settled: report.settled,
      released: report.released, undecided: report.undecided, stillOwed: report.stillOwed,
    }));
    dump('E3 · after reconciliation', me);
    // It settled the produced work and touched nothing that was in flight —
    // including three holds belonging to the other Creators above.
    expect(report.settled).toBe(1);
    expect(report.stillOwed).toBe(0);
    const e = new CreatorCreditRepository(getDb()).getBalance(me);
    expect([e.availableUnits, e.reservedUnits, e.totalSpent]).toEqual([960, 0, 40]);
  });

  it('F · an unpriced operation is refused and holds nothing', () => {
    const me = creator(); fund(me, 1_000);
    const claim = claimAttempt({ db: getDb(), creatorId: me, scope: 'evidence:image-edit', clientKey: 'press-F' });
    if (claim.kind !== 'claimed') throw new Error('expected a claim');
    const verdict = authorisePaidOperation({
      db: getDb(), creatorId: me, role: 'creator',
      capability: 'image-editing', gatewayId: 'magic-hour',
      attemptKey: claim.attemptKey,
    });
    failAttempt(getDb(), claim.attemptKey, 'gate:cost-unavailable');
    console.log('\nEVIDENCE · F · verdict: ' + JSON.stringify(verdict));
    dump('F · unpriced, refused', me);
    expect(verdict.kind).toBe('refused');
    // Not one unit moved: the ledger holds the purchase and nothing else.
    const f = new CreatorCreditRepository(getDb()).getBalance(me);
    expect([f.availableUnits, f.reservedUnits]).toEqual([1000, 0]);
  });

  it('G · a running operation is never swept, however old', () => {
    const me = creator(); fund(me, 1_000);
    const { claim, verdict } = submit(me, 'press-G');
    if (verdict?.kind !== 'reserved') throw new Error('expected a hold');
    getDb().prepare('UPDATE paid_operation_attempts SET created_at_ms = ? WHERE attempt_key = ?')
      .run(Date.now() - 30 * 24 * 60 * 60 * 1_000, claim.attemptKey);
    const report = reconcileOwedAttempts(getDb());
    const mine = report.outcomes.find((o) => o.attemptKey === claim.attemptKey);
    console.log('\nEVIDENCE · G · thirty days old: ' + JSON.stringify({
      action: mine?.action, ageDays: Math.round((mine?.ageMs ?? 0) / 86_400_000), note: mine?.note,
    }));
    dump('G · untouched', me);
    expect(mine?.action).toBe('left-undecided');
  });
});
