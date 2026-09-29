/**
 * AZMA OS — the Sovereign Value Balance, and the XPay binding beneath it.
 *
 * ─── THE TWO FAILURES THESE GUARDS EXIST TO PREVENT ─────────────────────────
 *
 *   1. A Creator being granted value they did not pay for. Every path that
 *      could grant Balance is driven here with the wrong amount, the wrong
 *      currency, a forged signature, a replayed event and a stale timestamp.
 *
 *   2. A provider's name, unit or price reaching a Creator — which would
 *      chain the Empire's customer-facing numbers to a provider it must be
 *      able to replace without anyone noticing.
 */

import { createHmac } from 'node:crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  SOVEREIGN_VALUE_BALANCE, BALANCE_VALUE_REFERENCE, BALANCE_UNIT_USD, BALANCE_UNIT_EGP,
  OPERATION_CONSUMPTION, consumptionFor, priceOperation, creatorFacingCost,
  SOVEREIGN_PACKAGES, packageById, unitPriceEgp, RIYADA_COMPOSITION,
  VALIDITY_AR, BALANCE_NOTICES_AR,
  BALANCE_PRICING_APPROVED, PAYMENT_PROOF_STATUS, GIFT_BALANCE, PENDING_FOUNDER_DECISIONS,
} from '../pricing/sovereign-value-balance';
import { XPayPaymentGateway, readXPayCredentials, xpayMode } from '../payment/xpay-payment-gateway';
import { WebhookSignatureError, PaymentSessionError } from '../payment/payment-gateway-contracts';
import { CREDIT_USD, CREDIT_EGP } from '../cost-engine/qiyamah-cost-truth';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
const near = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(tol);

const SECRET = 'whsec_test_only_never_a_real_secret';
const gateway = new XPayPaymentGateway({ secretKey: 'sk_test_x', webhookSecret: SECRET });

/** Sign a body exactly as XPay documents it: HMAC-SHA256 over `${t}.${raw}`. */
function sign(raw: string, atSeconds = Math.floor(Date.now() / 1000)): string {
  const v1 = createHmac('sha256', SECRET).update(`${atSeconds}.${raw}`).digest('hex');
  return `t=${atSeconds},v1=${v1}`;
}

const sessionEvent = (over: Record<string, unknown> = {}, type = 'checkout.session.completed') =>
  JSON.stringify({
    type,
    data: { object: {
      id: 'cs_test_abc123', paymentStatus: 'paid', amountTotal: 9900, currency: 'EGP',
      metadata: { creator_id: 'c1', pack_id: 'start', azma_units: '800', idempotency_key: 'k1' },
      ...over,
    } },
  });

// ─────────────────────────────────────────────────────────────────────────────

describe('1 · the unit is sovereign, and is the only one a Creator sees', () => {
  it('it is named in Arabic, and the acronym is internal only', () => {
    expect(SOVEREIGN_VALUE_BALANCE.nameAr).toBe('ميزان القيمة السيادي');
    expect(SOVEREIGN_VALUE_BALANCE.internalCode).toBe('SVB');
  });

  it('the unit value is derived from the Founder’s reference, never typed', () => {
    expect(BALANCE_VALUE_REFERENCE.usd).toBe(20);
    // FINAL SCALE 2026-09-27: ten times fewer digits, the same value — every
    // consumption figure was divided by ten in the same ruling.
    expect(BALANCE_VALUE_REFERENCE.units).toBe(14_400);
    expect(BALANCE_UNIT_USD).toBe(20 / 14_400);
    near(BALANCE_UNIT_EGP, 0.0719861, 1e-6);
  });

  it('the Creator’s unit and the provider’s credit are NOT the same thing', () => {
    // They differ by ~9.8x and measure different things: one is a price AZMA
    // paid, the other a denomination AZMA sells. Confusing them once already
    // produced a cost basis that was wrong by an order of magnitude.
    expect(CREDIT_USD).not.toBe(BALANCE_UNIT_USD);
    expect(CREDIT_EGP).not.toBe(BALANCE_UNIT_EGP);
  });

  it('what a Creator is shown carries no provider, cost, margin or model', () => {
    const view = creatorFacingCost('IMAGE_GENERATION');
    expect(Object.keys(view).sort()).toEqual(['balanceConsumed', 'capability', 'unitNameAr']);
    const s = JSON.stringify(view).toLowerCase();
    for (const w of ['magic', 'credit', 'provider', 'usd', 'cost', 'margin', 'nano', 'minimax', 'veo', 'xpay']) {
      expect(s).not.toContain(w);
    }
  });
});

describe('2 · the five numbers are kept apart', () => {
  it('an image: provider cost, balance value and contribution are separate fields', () => {
    const e = priceOperation('IMAGE_GENERATION');
    near(e.providerCostEgp!, 7.03407, 1e-4);       // A — measured
    expect(e.providerCostBasis).toBe('MEASURED');
    expect(e.balanceConsumed).toBe(200);
    near(e.balanceValueEgp, 200 * BALANCE_UNIT_EGP, 1e-9);
    near(e.grossContributionEgp!, e.balanceValueEgp - e.providerCostEgp!, 1e-9);
  });

  it('the unknown operating costs are ALWAYS named, never folded in', () => {
    const e = priceOperation('IMAGE_GENERATION');
    expect(e.unknownOperatingCosts).toEqual(
      expect.arrayContaining(['STORAGE', 'BANDWIDTH', 'COMPUTE_CPU_GPU_SERVER', 'POST_PRODUCTION_SILENCE_REMUX']),
    );
    // Gross contribution does NOT pretend to clear them.
    expect(e.grossContributionEgp).not.toBeNull();
  });

  it('video is charged per REQUESTED second', () => {
    const rule = consumptionFor('VIDEO_GENERATION')!;
    expect(rule.quantity).toBe('per-requested-second');
    expect(priceOperation('VIDEO_GENERATION', 6).balanceConsumed).toBe(1200);
  });

  it('video is priced on VEO, not on the cheaper model that produces it', () => {
    // FOUNDER RULING: commercial basis is Veo at 96 credits/s though the
    // allocated binding is H3 at a measured 48. Pricing on the cheaper
    // binding would drop the customer price the day the binding changed.
    const rule = consumptionFor('VIDEO_GENERATION')!;
    expect(rule.pricingBasisCapability).toBe('VIDEO_CREATION_STANDARD');
    expect(rule.pricingBasisCapability).not.toBe('VIDEO_CREATION_ACTUAL');
    near(priceOperation('VIDEO_GENERATION', 1).providerCostEgp!, 96 * CREDIT_EGP, 1e-6);
  });

  it('Ras Al Amr and storyboard carry NO fabricated provider cost', () => {
    for (const cap of ['MP4_PRODUCTION', 'STORYBOARD_IMAGE', 'STORYBOARD_VIDEO']) {
      const rule = consumptionFor(cap)!;
      expect(rule.pricingBasisCapability).toBeNull();
      expect(priceOperation(cap).providerCostEgp).toBeNull();
      expect(rule.balancePerUnit).toBe(70);
    }
  });

  it('a capability with no measured cost yields a null cost, never a zero', () => {
    const e = priceOperation('NOT_A_CAPABILITY');
    expect(e.providerCostEgp).toBeNull();
    expect(e.grossContributionEgp).toBeNull();
    expect(e.providerCostBasis).toBe('UNKNOWN');
  });

  it('a rule that NAMES a cost basis must resolve to a real measured one', () => {
    // A rule pointing at a capability the cost truth does not hold would
    // price against nothing while looking priced. A rule naming NO basis is
    // a different thing, and an honest one: see MP4 and storyboard above.
    for (const r of OPERATION_CONSUMPTION) {
      if (r.pricingBasisCapability === null) continue;
      expect(priceOperation(r.capability).providerCostEgp).not.toBeNull();
      expect(priceOperation(r.capability).providerCostBasis).not.toBe('UNKNOWN');
    }
  });
});

describe('3 · the prices are approved; taking money is a separate gate', () => {
  it('the pricing gate is CLOSED — every figure is the Founder’s final one', () => {
    expect(BALANCE_PRICING_APPROVED).toBe(true);
    expect(priceOperation('IMAGE_GENERATION').approved).toBe(true);
  });

  it('but payment is NOT proven, and the two are separate facts', () => {
    // A flag meaning «approved» AND «proven» becomes false the moment those
    // disagree — which is exactly where they stand. So they are two.
    expect(PAYMENT_PROOF_STATUS.pricingApproved).toBe(true);
    expect(PAYMENT_PROOF_STATUS.paymentProvenInSandbox).toBe(false);
    expect(PAYMENT_PROOF_STATUS.paymentProvenInProduction).toBe(false);
    expect(PAYMENT_PROOF_STATUS.blockedBy).toMatch(/SECRET/);
    expect(PAYMENT_PROOF_STATUS.blockedBy).toMatch(/permission_denied/);
    // And it says why without naming a payment provider in this layer.
    expect(PAYMENT_PROOF_STATUS.blockedBy).not.toMatch(/xpay/i);
  });

  it('nothing can be sold anyway: the checkout refuses with no gateway', () => {
    const route = read('app/api/sovereign/economy/xpay-checkout/route.ts');
    expect(route).toContain("error: 'payment_gateway_unavailable'");
    expect(route).toContain('const gateway = getXPayGateway();');
    expect(route).toContain('if (!gateway) {');
  });

  it('the four approved packages are exactly the Founder figures', () => {
    expect(SOVEREIGN_PACKAGES.map((p) => [p.nameAr, p.priceEgp, p.balanceUnits])).toEqual([
      ['الأساس', 99, 1375],
      ['الارتقاء', 249, 3450],
      ['الاحتراف', 499, 6900],
      ['الريادة', 1200, 16670],
    ]);
  });

  it('nothing is a subscription and nothing is transferable', () => {
    for (const p of SOVEREIGN_PACKAGES) {
      expect(p.recurrence).toBe('one-time');
      expect(p.transferable).toBe(false);
    }
  });

  it('NO package expires — the 28 days and the six months are cancelled', () => {
    // FOUNDER'S RULING 2026-09-28: «كذلك نعم ألغِ الـ28 يوم», under POLICY:
    // REFUNDS & CREDIT BALANCE v1.0 §4 — «Paid credits … do not expire merely
    // because time has passed». Two of his own instruments had said opposite
    // things about the same money; this is which one governs.
    for (const p of SOVEREIGN_PACKAGES) {
      expect(p.validity).toBe('does-not-expire');
    }
    expect(Object.keys(VALIDITY_AR)).toEqual(['does-not-expire']);
    expect(VALIDITY_AR['does-not-expire']).toBe('لا تنتهي');
  });

  it('and the machinery that could compute an expiry is GONE, not disabled', () => {
    // Removed and not left behind a flag: a function that can still compute a
    // deduction from a Creator's Balance is a deduction waiting for a caller,
    // and the Empire's own rule is that what is rejected is removed, never
    // covered. This reads the source, because a deleted export cannot be
    // imported to be asserted about.
    const pricing = read('src/economy/pricing/sovereign-value-balance.ts');
    const code = pricing
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/^\s*\/\/.*$/gm, '');
    for (const gone of [
      'export function riyadaExpiry', 'export const RIYADA_PERIOD_MS',
      'export function standardCycleEnd', 'export const STANDARD_CYCLE_MS',
      'export const CARRY_FORWARD_WINDOW',
    ]) {
      expect(code).not.toContain(gone);
    }
    // …and the tombstone records what stood there, so the removal is history
    // rather than an absence someone later mistakes for an omission.
    expect(pricing).toContain('TOMBSTONE');
    expect(pricing).toContain('riyadaExpiry(n)');
  });

  it('what a Creator is TOLD no longer promises an ending', () => {
    // A superseded rule may not survive in a sentence about someone's money.
    const joined = Object.values(BALANCE_NOTICES_AR).join(' ');
    expect(joined).toContain('رصيدك لا ينتهي');
    expect(joined).not.toContain('ثمانية وعشرون يوماً');
    expect(joined).not.toContain('يُحذف ثلث');
    expect(joined).not.toContain('يتوقّف المتبقّي عن الاستعمال');
    // What does NOT change: it is still not cash, and still not a subscription.
    expect(joined).toContain('لا يُردّ الرصيد نقداً');
    expect(joined).toContain('وليس هذا اشتراكاً');
  });

  it('the three ordinary packages sell a unit at the reference rate', () => {
    for (const id of ['asas', 'irtiqaa', 'ihtiraf']) {
      near(unitPriceEgp(packageById(id)!), BALANCE_UNIT_EGP, 5e-4);
    }
  });

  it('الريادة is now at PARITY — the correction closed a 1.93x overcharge', () => {
    // It was 8,640 units for 1,200 EGP: 0.13889 per unit against 0.0720,
    // reported rather than shipped. Corrected to 16,670, which is exactly
    // what 1,200 EGP buys at the reference rate.
    near(unitPriceEgp(packageById('riyada')!), BALANCE_UNIT_EGP, 1e-5);
    near(RIYADA_COMPOSITION.timesDearerThanOrdinary, 1.0, 1e-3);
    expect(RIYADA_COMPOSITION.supersededUnits).toBe(8_640);
  });

  it('its composition sums to its balance — 13,892 + 2,778 = 16,670', () => {
    expect(RIYADA_COMPOSITION.baseUnits + RIYADA_COMPOSITION.bonusUnits)
      .toBe(RIYADA_COMPOSITION.totalUnits);
    expect(RIYADA_COMPOSITION.totalUnits).toBe(packageById('riyada')!.balanceUnits);
    expect(RIYADA_COMPOSITION.baseValueEgp + RIYADA_COMPOSITION.bonusValueEgp)
      .toBe(packageById('riyada')!.priceEgp);
  });

  it('and the 2,778 may still NOT be called a bonus — they were bought', () => {
    // 1,200 EGP buys exactly 16,670 at the standard rate, so nothing is
    // given. The composition describes the price; it does not add to it.
    expect(RIYADA_COMPOSITION.MAY_CLAIM_BONUS).toBe(false);
    expect(RIYADA_COMPOSITION.MAY_CLAIM_DISCOUNT).toBe(false);
  });

  it('gift Balance is offered as a DISCRETION, never as an entitlement', () => {
    expect(GIFT_BALANCE.isEntitlement).toBe(false);
    expect(GIFT_BALANCE.isPromised).toBe(false);
    // «قد تمنح» — may grant. Never «تمنح», which is a promise.
    expect(GIFT_BALANCE.noticeAr).toContain('قد تمنح');
    expect(GIFT_BALANCE.noticeAr).toContain('تفضّلٌ لا استحقاق');
    // It names no amount and no condition that could read as a contract.
    expect(GIFT_BALANCE.noticeAr).not.toMatch(/[0-9٠-٩]/);
    // A granted gift behaves like ordinary purchased Balance.
    expect([GIFT_BALANCE.expires, GIFT_BALANCE.transferable]).toEqual([false, false]);
  });

  it('الريادة keeps its 16,670 units — only its ending was cancelled', () => {
    // The parity correction of 2026-09-27 stands untouched. What went is the
    // six-month clock that removed a third of a real Balance by time.
    expect(packageById('riyada')!.balanceUnits).toBe(16_670);
    expect(RIYADA_COMPOSITION.totalUnits).toBe(16_670);
    expect(packageById('riyada')!.validity).toBe('does-not-expire');
  });

  it('the decisions that belong to the Founder are named, not defaulted', () => {
    const joined = PENDING_FOUNDER_DECISIONS.join(' ');
    for (const k of ['RIYADA_BONUS_WORDING', 'COURTESY_REGENERATION', 'VAT']) {
      expect(joined).toContain(k);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('3b · each capability is its own charge — nothing is charged twice', () => {
  it('the ten approved capabilities are distinct, with no alias', () => {
    // PLATFORM_REFRAME added 2026-09-29 by Founder ruling: «اعاده التاطير
    // تتكلف 20 نقطه... ولن يكون بمكمن الغايه ايه معاملات من الرصيد بخلاف
    // اعاده التاطير». It is its own capability precisely so it can never be
    // confused with MP4_PRODUCTION, which is an assembly and priced per
    // second — a reframe is one operation on one existing file.
    const ids = OPERATION_CONSUMPTION.map((r) => r.capability);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.sort()).toEqual([
      'IMAGE_EDIT', 'IMAGE_GENERATION', 'INFOGRAPHIC', 'MOTION', 'MP4_PRODUCTION',
      'PLATFORM_REFRAME', 'STORYBOARD_IMAGE', 'STORYBOARD_VIDEO', 'UPSCALE_2X',
      'VIDEO_GENERATION',
    ]);
  });

  it('a reframe is its own charge, never an assembly charge', () => {
    const reframe = consumptionFor('PLATFORM_REFRAME')!;
    expect(reframe.balancePerUnit).toBe(20);
    expect(reframe.quantity).toBe('per-operation');
    // No provider is contacted, so there is no measured provider basis behind
    // it. A null basis is the honest record — it is not a zero cost.
    expect(reframe.pricingBasisCapability).toBeNull();
  });

  it('MP4 assembly does NOT silently contain a generation charge', () => {
    // FOUNDER AMENDMENT: «Do NOT hide Qiyamah generation inside the 5 EGP/s
    // MP4 assembly price.» Assembly is 70 and generation is 200 — one can
    // never stand in for the other, and charging both is two ledger events.
    const mp4 = consumptionFor('MP4_PRODUCTION')!;
    const video = consumptionFor('VIDEO_GENERATION')!;
    expect(mp4.balancePerUnit).toBe(70);
    expect(video.balancePerUnit).toBe(200);
    expect(mp4.balancePerUnit).not.toBe(video.balancePerUnit);
    expect(mp4.note).toMatch(/charged separately|never twice/i);
  });

  it('assembly and generation priced together is the SUM, not either alone', () => {
    // A six-second assembly that also generated six seconds of video costs
    // both, and each is its own event. 70x6 + 200x6.
    const assembly = priceOperation('MP4_PRODUCTION', 6).balanceConsumed;
    const generation = priceOperation('VIDEO_GENERATION', 6).balanceConsumed;
    expect(assembly).toBe(420);
    expect(generation).toBe(1200);
    expect(assembly + generation).toBe(1620);
  });

  it('the three Ras Al Amr capabilities all sit at the approved 70', () => {
    for (const cap of ['MP4_PRODUCTION', 'STORYBOARD_IMAGE', 'STORYBOARD_VIDEO']) {
      expect(consumptionFor(cap)!.balancePerUnit).toBe(70);
    }
  });
});

describe('3c · the policy package exists and claims nothing untrue', () => {
  const REQUIRED = [
    'TERMS_AND_CONDITIONS', 'ACCEPTABLE_USE_POLICY', 'REFUND_AND_REPLACEMENT_POLICY',
    'PRIVACY_POLICY', 'AI_CONTENT_POLICY', 'SOVEREIGN_VALUE_BALANCE_POLICY',
    'ACCOUNT_AND_SUSPENSION_POLICY',
  ];

  it('all seven documents are present', () => {
    for (const name of REQUIRED) {
      expect(() => read(`docs/policies/${name}.md`)).not.toThrow();
    }
  });

  it('every one is marked LEGAL REVIEW REQUIRED', () => {
    for (const name of REQUIRED) {
      expect(read(`docs/policies/${name}.md`)).toContain('LEGAL REVIEW REQUIRED');
    }
  });

  it('none claims an approval, certification or guarantee it does not have', () => {
    for (const name of REQUIRED) {
      const doc = read(`docs/policies/${name}.md`);
      // Each ends with an explicit list of what it does NOT claim.
      expect(doc).toContain('ما لا تدّعيه هذه الوثيقة');
      // And never asserts the approval the directive forbids asserting.
      expect(doc).not.toMatch(/معتمدة من جهاز حماية المستهلك|وافق جهاز حماية/);
      expect(doc).not.toMatch(/ISO 27001 ✓|SOC 2 ✓/);
    }
  });

  it('the Balance policy carries the approved packages, and no expiry at all', () => {
    const doc = read('docs/policies/SOVEREIGN_VALUE_BALANCE_POLICY.md');
    for (const n of ['1,375', '3,450', '6,900', '16,670', '99', '249', '499', '1,200']) {
      expect(doc).toContain(n);
    }
    // REWRITTEN 2026-09-28: it used to require «ثلثه» · «ثلثاه» · «٢٨ يوماً».
    // The Founder cancelled both rules, so a guard demanding them would now be
    // holding the document to a promise he withdrew.
    expect(doc).toContain('رصيدك لا ينتهي');
    expect(doc).toContain('لا تنتهي');
    // The cancelled rule survives ONLY inside the record of its cancellation.
    const beforeTheRecord = doc.slice(0, doc.indexOf('ما أُلغي بهذا البند'));
    expect(beforeTheRecord).not.toContain('ثمانية وعشرون يوماً');
  });

  it('and it still tells the half that did NOT change: this is not cash', () => {
    // What went is the ending. What stays is that a Balance is not money: it
    // is not refunded, not withdrawn, not transferred to a bank — and not a
    // subscription. Removing an expiry must not quietly soften any of that.
    const doc = read('docs/policies/SOVEREIGN_VALUE_BALANCE_POLICY.md');
    expect(doc).toContain('لا يُصرف');
    expect(doc).toContain('وليس هذا اشتراكاً');
    expect(doc).toContain('ولا يُنقل الميزان بين الحسابات');
    // And the cancellation is RECORDED in the document, not silently applied.
    expect(doc).toContain('ألغى المؤسّس ذلك في 2026-09-28');
  });

  it('the gift notice is a discretion on the page a Creator reads', () => {
    const doc = read('docs/policies/SOVEREIGN_VALUE_BALANCE_POLICY.md');
    expect(doc).toContain('قد تمنح الإمبراطورية');
    expect(doc).toContain('تفضّلٌ لا استحقاق');
    // No amount and no condition that could read as a promise.
    expect(doc).toContain('لا نَعِد بمقدارها');
  });

  it('nothing calls a one-time package a subscription, or promises free re-runs', () => {
    const balance = read('docs/policies/SOVEREIGN_VALUE_BALANCE_POLICY.md');
    expect(balance).toContain('ولا تُسمّى أيٌّ منها «اشتراكاً»');
    expect(balance).toMatch(/لا توجد اليوم إعادة مجانية غير محدودة/);
  });
});

describe('4 · the webhook signature is verified before the body is read', () => {
  it('a correctly signed, paid session verifies', async () => {
    const raw = sessionEvent();
    const out = await gateway.verifyWebhookEvent(raw, sign(raw));
    expect(out.verified).toBe(true);
    expect(out.eventType).toBe('payment.succeeded');   // AZMA's word, not XPay's
    expect(out.paymentIntentId).toBe('cs_test_abc123');
    expect(out.amountReceived).toBe(9900);
    expect(out.currency).toBe('EGP');
  });

  it('a FORGED signature is refused', async () => {
    const raw = sessionEvent();
    await expect(gateway.verifyWebhookEvent(raw, 't=1730000000,v1=deadbeef'))
      .rejects.toBeInstanceOf(WebhookSignatureError);
  });

  it('a signature from a DIFFERENT secret is refused', async () => {
    const raw = sessionEvent();
    const t = Math.floor(Date.now() / 1000);
    const wrong = createHmac('sha256', 'whsec_someone_else').update(`${t}.${raw}`).digest('hex');
    await expect(gateway.verifyWebhookEvent(raw, `t=${t},v1=${wrong}`))
      .rejects.toBeInstanceOf(WebhookSignatureError);
  });

  it('a body altered after signing is refused — the raw bytes are what is hashed', async () => {
    const raw = sessionEvent();
    const header = sign(raw);
    const tampered = raw.replace('"amountTotal":9900', '"amountTotal":1');
    await expect(gateway.verifyWebhookEvent(tampered, header))
      .rejects.toBeInstanceOf(WebhookSignatureError);
  });

  it('a REPLAYED event outside the 5-minute window is refused', async () => {
    const raw = sessionEvent();
    const old = Math.floor(Date.now() / 1000) - 3600;
    await expect(gateway.verifyWebhookEvent(raw, sign(raw, old)))
      .rejects.toBeInstanceOf(WebhookSignatureError);
  });

  it('a malformed or absent header is refused, not ignored', async () => {
    const raw = sessionEvent();
    for (const h of ['', 'garbage', 't=123', 'v1=abc']) {
      await expect(gateway.verifyWebhookEvent(raw, h)).rejects.toBeInstanceOf(WebhookSignatureError);
    }
  });
});

describe('5 · a signed event is not a PAID one', () => {
  const unpaid: ReadonlyArray<readonly [string, Record<string, unknown>, string]> = [
    ['an unpaid completed session', { paymentStatus: 'unpaid' }, 'checkout.session.completed'],
    ['a failed payment',            { paymentStatus: 'failed' }, 'checkout.session.completed'],
    ['an expired session',          { paymentStatus: 'unpaid' }, 'checkout.session.expired'],
    ['a canceled session',          { paymentStatus: 'unpaid' }, 'checkout.session.canceled'],
    ['an unrelated event',          {},                          'customer.created'],
  ];

  for (const [name, over, type] of unpaid) {
    it(`${name} does not become a fulfilment event`, async () => {
      const raw = sessionEvent(over, type);
      const out = await gateway.verifyWebhookEvent(raw, sign(raw));
      expect(out.verified).toBe(true);                       // correctly signed
      expect(out.eventType).not.toBe('payment.succeeded');
      expect(out.eventType).toMatch(/^unfulfilled:/);        // and will be ignored
    });
  }

  it('an async Fawry success IS a fulfilment event once paid', async () => {
    const raw = sessionEvent({ paymentStatus: 'paid' }, 'checkout.session.async_payment_succeeded');
    const out = await gateway.verifyWebhookEvent(raw, sign(raw));
    expect(out.eventType).toBe('payment.succeeded');
  });
});

describe('6 · the amount and the currency are checked against AZMA’s own record', () => {
  const HANDLER = read('src/economy/payment/payment-webhook-handler.ts');

  it('the expected amount is derived from the pack, not from the event', () => {
    expect(HANDLER).toContain('const expectedMinorUnits = Math.round(pack.priceEgp * 100);');
    expect(HANDLER).toContain('if (event.amountReceived !== expectedMinorUnits)');
  });

  it('an amount that is merely close is still refused — no tolerance', () => {
    expect(HANDLER).not.toMatch(/Math\.abs\(event\.amountReceived/);
    expect(HANDLER).toContain('amount_mismatch:');
  });

  it('a currency that is not EGP is refused', () => {
    expect(HANDLER).toContain("event.currency.toUpperCase() !== 'EGP'");
    expect(HANDLER).toContain('currency_mismatch:');
  });

  it('units are still cross-checked against the pack definition', () => {
    expect(HANDLER).toContain('if (pack.azmaUnits !== azmaUnits)');
  });

  it('the grant is idempotent by a key that includes the gateway and the event', () => {
    expect(HANDLER).toContain('const webhookIdempotencyKey = `webhook:${gateway.gatewayId}:${idempotencyKey}`;');
  });
});

describe('7 · the session AZMA creates carries AZMA’s own amount', () => {
  const GW = read('src/economy/payment/xpay-payment-gateway.ts');

  it('the amount is converted to MINOR UNITS, as XPay documents', () => {
    expect(GW).toContain('const unitAmount = Math.round(request.amountEgp * 100);');
  });

  it('a non-positive amount is refused rather than sent', async () => {
    await expect(gateway.createPaymentSession({
      creatorId: 'c1', packId: 'start', amountEgp: 0, azmaUnits: 800,
      idempotencyKey: 'k', successUrl: 'https://azmaos.com/ok', cancelUrl: 'https://azmaos.com/no',
    })).rejects.toBeInstanceOf(PaymentSessionError);
  });

  it('an idempotency key is always sent, so a retry is replayed not repeated', () => {
    expect(GW).toContain("'Idempotency-Key': request.idempotencyKey || randomUUID(),");
  });

  it('it posts to the documented endpoint and reads the documented fields', () => {
    expect(GW).toContain("fetch(`${XPAY_API}/checkout/sessions`");
    expect(GW).toContain("const XPAY_API = 'https://api.xpay.app';");
    expect(GW).toContain('afterCompletion: { type: \'redirect\', redirect: { url: request.successUrl } },');
  });
});

describe('8 · secrets never leave the server, and test is never live', () => {
  const GW = read('src/economy/payment/xpay-payment-gateway.ts');

  it('credentials are read from the environment at call time, never at load', () => {
    expect(GW).toContain("process.env['XPAY_SECRET_KEY']");
    expect(GW).toContain("process.env['XPAY_WEBHOOK_SECRET']");
    // A module-level capture would bake a key into a bundle.
    expect(GW).not.toMatch(/^const\s+\w+\s*=\s*process\.env/m);
  });

  it('no key, secret or token is written in source', () => {
    expect(GW).not.toMatch(/sk_live_[A-Za-z0-9]/);
    expect(GW).not.toMatch(/whsec_[A-Za-z0-9]{8,}/);
    expect(GW).not.toMatch(/sk_test_[A-Za-z0-9]{8,}/);
  });

  it('test and live are separated by the key itself, as documented', () => {
    expect(xpayMode('sk_test_abc')).toBe('test');
    expect(xpayMode('sk_live_abc')).toBe('live');
    expect(xpayMode('nonsense')).toBe('unknown');
  });

  it('with no credentials configured there is no gateway, and no simulation', () => {
    const before = { k: process.env['XPAY_SECRET_KEY'], w: process.env['XPAY_WEBHOOK_SECRET'] };
    delete process.env['XPAY_SECRET_KEY'];
    delete process.env['XPAY_WEBHOOK_SECRET'];
    expect(readXPayCredentials()).toBeNull();
    if (before.k) process.env['XPAY_SECRET_KEY'] = before.k;
    if (before.w) process.env['XPAY_WEBHOOK_SECRET'] = before.w;
  });

  it('nothing is logged that could carry a secret', () => {
    expect(GW).not.toMatch(/console\.(log|info|warn|error)/);
  });
});

describe('9 · the dependency direction is preserved', () => {
  const BALANCE = read('src/economy/pricing/sovereign-value-balance.ts');
  const CONTRACTS = read('src/economy/payment/payment-gateway-contracts.ts');
  const HANDLER = read('src/economy/payment/payment-webhook-handler.ts');

  it('the Balance knows the cost TRUTH, never a provider', () => {
    // Allowed: Balance -> Cost Truth. Forbidden: Balance -> Magic Hour.
    expect(BALANCE).toContain("from '../cost-engine/qiyamah-cost-truth'");
    expect(BALANCE).not.toMatch(/magic-hour|magichour|MagicHour/i);
    expect(BALANCE).not.toMatch(/xpay/i);
  });

  it('the sovereign boundary has its OWN word for «the money arrived»', () => {
    // MEASURED while writing these guards: this handler switched on
    // 'checkout.session.completed' — a Stripe/XPay OBJECT NAME — which is
    // exactly the dependency the architecture forbids. The XPay binding now
    // normalises to 'payment.succeeded'; the legacy strings survive only for
    // the two older bindings that emit them, and are marked as such.
    expect(HANDLER).toContain("'payment.succeeded',");
    expect(HANDLER).toContain('legacy: Stripe binding');
    expect(HANDLER).toContain('legacy: Paymob binding');
  });

  it('no payment provider is NAMED in the sovereign boundary’s logic', () => {
    for (const src of [CONTRACTS, HANDLER]) {
      // A comment may explain a legacy string; code may not depend on one.
      // Trailing comments are stripped too — `\s+//` cannot match the `//`
      // inside a URL, which is always preceded by a colon, not whitespace.
      const code = src
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/\s+\/\/.*$/gm, '');
      expect(code).not.toMatch(/\bxpay\b/i);
      expect(code).not.toMatch(/\bstripe\b/i);
      expect(code).not.toMatch(/\bpaymob\b/i);
    }
  });

  it('the XPay binding never emits an XPay object name across the boundary', () => {
    const GW = read('src/economy/payment/xpay-payment-gateway.ts');
    const at = GW.indexOf('eventType: isPaid');
    expect(at).toBeGreaterThan(-1);
    const emitted = GW.slice(at, at + 140);
    expect(emitted).toContain("'payment.succeeded'");
    expect(emitted).not.toContain('checkout.session.completed');
  });

  it('the gateway contract stays provider-shaped, not XPay-shaped', () => {
    expect(CONTRACTS).toContain('export interface IPaymentGateway');
    expect(CONTRACTS).toContain('createPaymentSession');
    expect(CONTRACTS).toContain('verifyWebhookEvent');
  });

  it('XPay is one implementation of that contract, replaceable by a sibling', () => {
    const GW = read('src/economy/payment/xpay-payment-gateway.ts');
    expect(GW).toContain('implements IPaymentGateway');
    expect(GW).toContain("readonly gatewayId = 'xpay';");
  });
});

/**
 * ─── WHAT A REPLACED GATEWAY ALMOST TOOK WITH IT ────────────────────────────
 *
 *   The Paymob checkout this route supersedes had TWO guards the Empire paid
 *   for after real audits: money is never taken from an identity nobody has
 *   proven, and a Creator is never returned to a host the caller chose. When
 *   the gateway was replaced, neither guard travelled — the NEWER, sanctioned
 *   path was the weaker one. Found by reading the two routes side by side on
 *   2026-09-27, before either had ever taken a pound.
 */
describe('10 · the checkout route carries the guards the older one earned', () => {
  const ROUTE = read('app/api/sovereign/economy/xpay-checkout/route.ts');

  it('a session alone does not reach the gateway — identity must be proven', () => {
    expect(ROUTE).toContain('verificationStateForCreator');
    expect(ROUTE).toContain('isVerified({ verificationState:');
    expect(ROUTE).toContain("error: 'identity_not_verified'");
    // And the refusal comes BEFORE anything that could open a payment session.
    expect(ROUTE.indexOf('isVerified(')).toBeLessThan(ROUTE.indexOf('createPaymentSession'));
  });

  it('the identity question is the same one the older route asks', () => {
    const OLD = read('app/api/billing/checkout/route.ts');
    for (const token of ['verificationStateForCreator', 'isVerified({ verificationState:']) {
      expect(OLD).toContain(token);
      expect(ROUTE).toContain(token);
    }
  });

  it('the return destination is the Empire’s, never a header the caller writes', () => {
    expect(ROUTE).toContain('request.nextUrl.origin');
    expect(ROUTE).not.toContain("headers.get('origin')");
    // Both destinations pass through the one rule that refuses absolute URLs.
    expect(ROUTE).toContain("returnUrl(origin, '/sovereign-balance?paid=1')");
    expect(ROUTE).toContain("returnUrl(origin, '/sovereign-balance')");
  });

  it('the page those destinations name actually exists', () => {
    // A success URL pointing at a route that was never built sends a Creator
    // to a 404 immediately after paying.
    expect(() => read('app/sovereign-balance/page.tsx')).not.toThrow();
  });
});
