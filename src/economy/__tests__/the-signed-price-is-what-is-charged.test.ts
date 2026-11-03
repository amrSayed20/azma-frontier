/**
 * AZMA OS — ما يُخصَم هو الرقمُ الموقَّع، بالضبط.
 *
 * ─── WHAT THE OWNER FORBADE AS EVIDENCE ─────────────────────────────────────
 *
 *   «لا تَعتبِر مجرّدَ توصيلِ البوّابةِ بسُلطةِ السعرِ دليلًا على صحّةِ
 *   المحاسبة.»
 *
 *   So no test here reads an import or a wire. Every one of them performs an
 *   operation and then reads `credit_ledger`, and asserts that the number
 *   taken from the Creator EQUALS the figure in the Founder's own table —
 *   not approximately, not derived, not rounded.
 *
 *   And the partial connection is proved by what did NOT move: video, 2×
 *   upscale and speech were excluded by name, and the last block holds them
 *   where they were.
 */

import { readFileSync } from 'fs';
import { mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

process.env.AZMA_DB_PATH = join(mkdtempSync(join(tmpdir(), 'azma-signed-')), 'signed.db');

import { getDb, createCreator } from '../../persistent-storage';
import { CreatorCreditRepository } from '../credit-ledger/credit-ledger-repository';
import { authorisePaidOperation, settleAuthorisedOperation } from '../paid-operation-gate';
import { claimAttempt } from '../paid-operation-attempts';
import { OPERATION_CONSUMPTION } from '../pricing/sovereign-value-balance';
import { AzmaUnitCostEngine } from '../cost-engine/azma-cost-engine';
import { CostUnavailableError, GatewayNotFoundError } from '../cost-engine/cost-engine-types';
import type { CapabilityTarget } from '../cost-engine/cost-engine-types';

let seq = 0;

function creator(): string {
  const id = `sp_${++seq}`;
  createCreator(getDb(), { creatorId: id, email: `${id}@azma.test`, passwordHash: null, displayName: 'مبدع' });
  return id;
}
function fund(id: string, units: number): void {
  new CreatorCreditRepository(getDb()).creditUnits(id, units, 'purchase', `fund:${id}:${++seq}`);
}
const ledger = (creatorId: string) =>
  getDb()
    .prepare('SELECT transaction_type AS type, amount, status FROM credit_ledger WHERE creator_id = ? ORDER BY rowid')
    .all(creatorId) as { type: string; amount: number; status: string }[];
const balance = (creatorId: string) => {
  const b = new CreatorCreditRepository(getDb()).getBalance(creatorId);
  return { available: b.availableUnits, reserved: b.reservedUnits, spent: b.totalSpent };
};

/** The Founder's own figure, read from his table and never typed here. */
const signed = (capability: string): number => {
  const rule = OPERATION_CONSUMPTION.find((r) => r.capability === capability);
  if (!rule) throw new Error(`${capability} is not in OPERATION_CONSUMPTION`);
  return rule.balancePerUnit;
};

function hold(params: {
  creatorId: string;
  capability: CapabilityTarget;
  gatewayId: string;
  sovereignCapability: string;
  quantity: number;
}) {
  const claim = claimAttempt({
    db: getDb(), creatorId: params.creatorId, scope: `signed:${params.sovereignCapability}`, clientKey: null,
  });
  if (claim.kind !== 'claimed') throw new Error('expected a claim');
  const verdict = authorisePaidOperation({
    db: getDb(), creatorId: params.creatorId, role: 'creator',
    capability: params.capability, gatewayId: params.gatewayId,
    attemptKey: claim.attemptKey,
    sovereignCapability: params.sovereignCapability,
    quantity: params.quantity,
  });
  return { claim, verdict };
}

describe('١ · الأربعُ المُمكَّنةُ تَخصِم رقمَك بالضبط', () => {
  it('IMAGE_EDIT charges the signed 200 for one image — read from the ledger', () => {
    const me = creator();
    fund(me, 10_000);
    const { verdict } = hold({
      creatorId: me, capability: 'image-editing', gatewayId: 'magic-hour',
      sovereignCapability: 'IMAGE_EDIT', quantity: 1,
    });

    expect(verdict.kind).toBe('reserved');
    if (verdict.kind !== 'reserved') return;
    // EQUALS his figure. Not close to it.
    expect(verdict.units).toBe(signed('IMAGE_EDIT'));
    expect(verdict.units).toBe(200);

    settleAuthorisedOperation(getDb(), me, verdict);

    // ONE reservation, ONE settlement, and the balance moved by exactly that.
    const entries = ledger(me);
    expect(entries.filter((e) => e.type === 'reservation')).toHaveLength(1);
    expect(entries.filter((e) => e.type === 'settlement')).toHaveLength(1);
    expect(entries.find((e) => e.type === 'settlement')!.amount).toBe(200);
    expect(balance(me)).toEqual({ available: 9_800, reserved: 0, spent: 200 });
  });

  it('MOTION charges the signed 200 per REQUESTED second, multiplied', () => {
    const me = creator();
    fund(me, 10_000);
    const seconds = 5;
    const { verdict } = hold({
      creatorId: me, capability: 'video-generation', gatewayId: 'magic-hour',
      sovereignCapability: 'MOTION', quantity: seconds,
    });

    if (verdict.kind !== 'reserved') throw new Error('expected a hold');
    expect(verdict.units).toBe(signed('MOTION') * seconds);
    expect(verdict.units).toBe(1_000);

    settleAuthorisedOperation(getDb(), me, verdict);
    expect(balance(me)).toEqual({ available: 9_000, reserved: 0, spent: 1_000 });
  });

  it('IMAGE_GENERATION’s signed figure is 200, and INFOGRAPHIC’s is the same today', () => {
    // The image road reads this directly. Asserted on the table, so the day
    // the two figures diverge this test says so before a Creator does.
    expect(signed('IMAGE_GENERATION')).toBe(200);
    expect(signed('INFOGRAPHIC')).toBe(200);
  });

  it('and a Creator who cannot afford the signed price is refused, holding nothing', () => {
    const me = creator();
    fund(me, 199); // one unit short of the signed 200
    const { verdict } = hold({
      creatorId: me, capability: 'image-editing', gatewayId: 'magic-hour',
      sovereignCapability: 'IMAGE_EDIT', quantity: 1,
    });

    expect(verdict.kind).toBe('refused');
    if (verdict.kind === 'refused') {
      expect(verdict.httpStatus).toBe(402);
      expect(verdict.requiredUnits).toBe(200);
    }
    expect(ledger(me).filter((e) => e.type === 'reservation')).toHaveLength(0);
    expect(balance(me)).toEqual({ available: 199, reserved: 0, spent: 0 });
  });
});

describe('٢ · ولا كمّيّةً تَفترِضُها البوّابة', () => {
  it.each([
    ['zero', 0],
    ['negative', -3],
    ['a fraction', 2.5],
    ['not a number', Number.NaN],
  ])('a quantity of %s is refused, never charged as one', (_name, quantity) => {
    const me = creator();
    fund(me, 10_000);
    const { verdict } = hold({
      creatorId: me, capability: 'video-generation', gatewayId: 'magic-hour',
      sovereignCapability: 'MOTION', quantity,
    });

    expect(verdict.kind).toBe('refused');
    expect(balance(me)).toEqual({ available: 10_000, reserved: 0, spent: 0 });
  });

  it('a capability the signed table does not hold is refused, not priced at zero', () => {
    const me = creator();
    fund(me, 10_000);
    const { verdict } = hold({
      creatorId: me, capability: 'image-editing', gatewayId: 'magic-hour',
      sovereignCapability: 'A_CAPABILITY_NOBODY_SIGNED', quantity: 1,
    });

    expect(verdict.kind).toBe('refused');
    if (verdict.kind === 'refused') expect(verdict.reason).toBe('cost-unavailable');
    expect(balance(me)).toEqual({ available: 10_000, reserved: 0, spent: 0 });
  });
});

describe('٣ · وإثباتُ ما لم يَتحرَّك — الثلاثُ المستثناةُ بالاسم', () => {
  /*  A PARTIAL CONNECTION IS PROVED BY THE SILENT, NOT ONLY BY THE MOVED.
   *
   *    The owner excluded video, 2× upscale and speech by name. These read
   *    the cost engine exactly as every live road still does for them, and
   *    assert the figures are the ones that were there before.
   */
  const engine = (capability: CapabilityTarget, gatewayId: string): number | 'refused' => {
    try {
      return new AzmaUnitCostEngine().estimate(capability, gatewayId).estimatedAzmaUnits;
    } catch (e) {
      if (e instanceof CostUnavailableError || e instanceof GatewayNotFoundError) return 'refused';
      throw e;
    }
  };

  it('video generation is still unpriced in the catalog the road reads', () => {
    // So an entitled subscriber still generates with no reservation, which is
    // the owner's own standing decision until video is priced.
    expect(engine('video-generation', 'magic-hour')).toBe('refused');
  });

  it('speech is still 30 on elevenlabs, and still absent from the signed table', () => {
    expect(engine('text-to-speech', 'elevenlabs')).toBe(30);
    expect(OPERATION_CONSUMPTION.find((r) => r.capability === 'TEXT_TO_SPEECH')).toBeUndefined();
    expect(OPERATION_CONSUMPTION.find((r) => r.capability === 'VOICE_AND_TTS')).toBeUndefined();
  });

  it('voice cloning is still refused', () => {
    expect(engine('voice-cloning', 'elevenlabs')).toBe('refused');
  });

  it('2× upscale now READS its signed 50 — the exclusion was lifted 2026-11-03', () => {
    // It was excluded by the owner's own earlier decision, and he activated
    // it on 2026-11-03: «أعتمد تفعيل خصم 50 وحدة لعملية رفع الدقة 2× وفق
    // السعر المسجل حاليًا». So the assertion flips from an absence to a read.
    expect(signed('UPSCALE_2X')).toBe(50);
    const upscale = readFileSync(
      join(process.cwd(), 'app/api/vault/assets/[assetId]/upscale/route.ts'), 'utf8',
    );
    expect(upscale).toContain("sovereignPriceFor('UPSCALE_2X')");
    // The zero it starts from is still there, and it still means «nothing is
    // owed until a price is read» — a Founder and a 2× with no price both
    // reach the engine on it.
    expect(upscale).toContain('let upscaleChargeUnits = 0;');
  });

  it('and reframe keeps the 20 it always matched', () => {
    expect(signed('PLATFORM_REFRAME')).toBe(20);
  });
});

describe('٤ · والاستحقاقُ المجّانيُّ لا يُحاسَب، كما كان', () => {
  it('a Founder owes nothing even on a connected capability', () => {
    const founder = creator();
    const claim = claimAttempt({
      db: getDb(), creatorId: founder, scope: 'signed:founder', clientKey: null,
    });
    if (claim.kind !== 'claimed') throw new Error('expected a claim');
    const verdict = authorisePaidOperation({
      db: getDb(), creatorId: founder, role: 'founder',
      capability: 'image-editing', gatewayId: 'magic-hour',
      attemptKey: claim.attemptKey,
      sovereignCapability: 'IMAGE_EDIT', quantity: 1,
    });

    expect(verdict).toEqual({ kind: 'entitled', via: 'founder' });
    expect(ledger(founder)).toHaveLength(0);
  });

  it('a valid free entitlement is spent instead of the signed price', () => {
    const me = creator();
    fund(me, 10_000);
    const claim = claimAttempt({
      db: getDb(), creatorId: me, scope: 'signed:trial', clientKey: null,
    });
    if (claim.kind !== 'claimed') throw new Error('expected a claim');
    const verdict = authorisePaidOperation({
      db: getDb(), creatorId: me, role: 'creator',
      capability: 'image-generation', gatewayId: 'magic-hour',
      attemptKey: claim.attemptKey,
      sovereignCapability: 'IMAGE_GENERATION', quantity: 1,
      trialCapability: 'image',
    });

    // The entitlement is checked BEFORE the price, so a gift is never charged
    // the signed figure.
    expect(verdict).toEqual({ kind: 'entitled', via: 'trial' });
    expect(balance(me)).toEqual({ available: 10_000, reserved: 0, spent: 0 });
  });
});
