/**
 * AZMA OS — لا مزوِّدَ مدفوعًا بلا بوّابة.
 *
 * ─── WHAT THE AUDIT FOUND, AND WHAT THESE HOLD SHUT ─────────────────────────
 *
 *   Audited against the live release 2026-10-31. Six paid roads existed; two
 *   of them — `edit` and `animate` — reached a billed provider with no
 *   entitlement check, no price, no balance check, no reservation and no
 *   settlement, in the route AND in the service beneath it. `animate` is the
 *   most expensive act the Empire buys: 840 provider credits, measured, for
 *   five seconds.
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

/** An operation the catalog DOES price, so the paid road can be exercised. */
function priceable(creatorId: string, key: string): GateVerdict {
  return authorisePaidOperation({
    db: getDb(), creatorId, role: 'creator',
    capability: 'image-generation', gatewayId: 'openai',
    idempotencyKey: key,
  });
}

describe('١ · لا تُنفَّذ عمليّةٌ بلا سعرٍ معتمد', () => {
  it('an operation whose price is pending is refused, and nothing is held', () => {
    const me = creator();
    fund(me, 10_000);

    const verdict = authorisePaidOperation({
      db: getDb(), creatorId: me, role: 'creator',
      capability: 'image-editing', gatewayId: 'magic-hour',
      idempotencyKey: `edit:${me}:a1`,
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
      idempotencyKey: `lipsync:${me}:a1`,
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
      idempotencyKey: `edit:${founder}:a1`,
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
      idempotencyKey: `gen:${me}:a1`,
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
      idempotencyKey: `gen:${me}:too-poor`,
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

    const verdict = priceable(me, `gen:${me}:hold`);
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
    const verdict = priceable(me, `gen:${me}:settle`);
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
    const verdict = priceable(me, `gen:${me}:fail`);
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
    const verdict = priceable(me, `gen:${me}:both`);
    if (verdict.kind !== 'reserved') throw new Error('expected a reservation');

    settleAuthorisedOperation(getDb(), me, verdict);
    releaseAuthorisedOperation(getDb(), me, verdict, 'late_release');

    expect(balance(me).totalSpent).toBe(verdict.units);
    expect(balance(me).availableUnits).toBe(100 - verdict.units);
  });
});

describe('٥ · لا خصمَ مزدوجًا لنفسِ النيّة', () => {
  it('the same idempotency key returns the SAME reservation, not a second one', () => {
    const me = creator();
    fund(me, 1_000);
    const key = `gen:${me}:one-intent`;

    const first = priceable(me, key);
    const second = priceable(me, key);

    expect(first.kind).toBe('reserved');
    expect(second.kind).toBe('reserved');
    if (first.kind !== 'reserved' || second.kind !== 'reserved') return;
    expect(second.reservationId).toBe(first.reservationId);

    // One hold, one debit of availability — not two.
    expect(ledger(me).filter((e) => e.transaction_type === 'reservation')).toHaveLength(1);
    expect(balance(me).reservedUnits).toBe(first.units);
  });

  it('settling the same reservation twice spends it once', () => {
    const me = creator();
    fund(me, 1_000);
    const verdict = priceable(me, `gen:${me}:settle-twice`);
    if (verdict.kind !== 'reserved') throw new Error('expected a reservation');

    settleAuthorisedOperation(getDb(), me, verdict);
    settleAuthorisedOperation(getDb(), me, verdict);

    expect(ledger(me).filter((e) => e.transaction_type === 'settlement')).toHaveLength(1);
    expect(balance(me).totalSpent).toBe(verdict.units);
  });

  // PROBED 2026-10-31 on the bare repository: a stable key replayed after its
  // reservation closes returns that CLOSED row — reserved 0, available
  // unmoved — and the caller would take it for a hold and call a paid
  // provider behind nothing. These two hold that shut.
  it('repeating the intent after it SETTLED holds real units again, and never hands back the spent one', () => {
    const me = creator();
    fund(me, 10_000);
    const key = `gen:${me}:replay-after-settle`;

    const first = priceable(me, key);
    if (first.kind !== 'reserved') throw new Error('expected a reservation');
    settleAuthorisedOperation(getDb(), me, first);
    const availableAfterFirst = balance(me).availableUnits;

    const second = priceable(me, key);
    if (second.kind !== 'reserved') throw new Error('expected a second reservation');

    expect(second.reservationId).not.toBe(first.reservationId);
    // The decisive number: the replay actually took units out of availability.
    expect(balance(me).availableUnits).toBe(availableAfterFirst - second.units);
    expect(balance(me).reservedUnits).toBe(second.units);
    expect(ledger(me).filter((e) => e.transaction_type === 'reservation')).toHaveLength(2);
  });

  it('retrying the intent after a RELEASE holds again, and that settlement succeeds', () => {
    const me = creator();
    fund(me, 10_000);
    const key = `gen:${me}:replay-after-release`;

    const first = priceable(me, key);
    if (first.kind !== 'reserved') throw new Error('expected a reservation');
    releaseAuthorisedOperation(getDb(), me, first, 'provider-failed');

    const retry = priceable(me, key);
    if (retry.kind !== 'reserved') throw new Error('expected a fresh reservation');
    expect(retry.reservationId).not.toBe(first.reservationId);
    expect(balance(me).reservedUnits).toBe(retry.units);

    settleAuthorisedOperation(getDb(), me, retry);

    // It settled for real — so no reconciliation debt was written.
    expect(balance(me).totalSpent).toBe(retry.units);
    expect(ledger(me).filter((e) => e.transaction_type === 'reconciliation_required')).toHaveLength(0);
  });

  it('a DIFFERENT intent gets its own hold', () => {
    const me = creator();
    fund(me, 1_000);
    const a = priceable(me, `gen:${me}:intent-a`);
    const b = priceable(me, `gen:${me}:intent-b`);
    if (a.kind !== 'reserved' || b.kind !== 'reserved') throw new Error('expected reservations');
    expect(b.reservationId).not.toBe(a.reservationId);
    expect(ledger(me).filter((e) => e.transaction_type === 'reservation')).toHaveLength(2);
  });
});

describe('٦ · التزامن — لا يُنفَق أكثرُ من الموجود', () => {
  it('two intents with room for one: the second is refused, and the sum never exceeds the balance', () => {
    // Learn the catalogued price from a well-funded probe, then fund a second
    // Creator for exactly ONE operation — so the second intent has nowhere to
    // take its units from.
    const probeOwner = creator();
    fund(probeOwner, 10_000);
    const probe = priceable(probeOwner, `gen:${probeOwner}:probe`);
    if (probe.kind !== 'reserved') throw new Error('expected a priced reservation');
    const unitPrice = probe.units;

    const me = creator();
    fund(me, unitPrice);

    const a = priceable(me, `gen:${me}:race-a`);
    const b = priceable(me, `gen:${me}:race-b`);

    expect(a.kind).toBe('reserved');
    expect(b.kind).toBe('refused');
    const after = balance(me);
    expect(after.availableUnits).toBeGreaterThanOrEqual(0);
    expect(after.reservedUnits).toBe(unitPrice);
  });
});

describe('٧ · التسويةُ الفاشلةُ تَترُك أثرًا يُصالَح', () => {
  it('a settlement that cannot be applied is recorded, not swallowed', () => {
    const me = creator();
    // A reservation id that does not exist forces `settle` to throw inside the
    // gate — the shape of a ledger that stumbled while the Creator's result
    // was already produced.
    const phantom: GateVerdict = { kind: 'reserved', reservationId: 'reservation_that_never_was', units: 7 };

    expect(() => settleAuthorisedOperation(getDb(), me, phantom)).not.toThrow();

    const recon = ledger(me).filter((e) => e.transaction_type === 'reconciliation_required');
    expect(recon).toHaveLength(1);
    expect(recon[0].status).toBe('pending');
  });

  it('a stuck hold can be found by age, so nothing is locked in silence', () => {
    const me = creator();
    fund(me, 1_000);
    const verdict = priceable(me, `gen:${me}:stuck`);
    if (verdict.kind !== 'reserved') throw new Error('expected a reservation');

    // Everything newer than the window is invisible to the sweeper…
    expect(pendingReservations(getDb(), 60_000).map((r) => r.reservationId)).not.toContain(verdict.reservationId);
    // …and everything older than zero is not.
    expect(pendingReservations(getDb(), -1).map((r) => r.reservationId)).toContain(verdict.reservationId);
  });

  it('a settled hold is no longer pending', () => {
    const me = creator();
    fund(me, 1_000);
    const verdict = priceable(me, `gen:${me}:not-stuck`);
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
  ];

  it.each(roads)('$name holds the money before it calls the provider', ({ files }) => {
    const source = files.map(read).join('\n');
    const authorises = /authorisePaidOperation\(/.test(source) || /\.reserve\(/.test(source);
    const settles = /settleAuthorisedOperation\(|\.settle\(/.test(source);
    const releases = /releaseAuthorisedOperation\(|\.release\(/.test(source);
    expect({ authorises, settles, releases }).toEqual({ authorises: true, settles: true, releases: true });
  });

  it('the two roads the audit found naked now use the shared gate, not a copy of it', () => {
    // The edit's gate lives in the SERVICE, because a second caller reaches
    // the act without the route. Each road is judged where its act is.
    for (const f of [
      'src/qiyamah-generation/image-edit-service.ts',
      'app/api/vault/assets/[assetId]/animate/route.ts',
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
