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
  PROPOSED_PACKAGES, packageEconomics, BALANCE_PRICING_APPROVED, PENDING_FOUNDER_DECISIONS,
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
    expect(BALANCE_VALUE_REFERENCE.units).toBe(144_000);
    expect(BALANCE_UNIT_USD).toBe(20 / 144_000);
    near(BALANCE_UNIT_EGP, 0.0071986, 1e-6);
  });

  it('the Creator’s unit and the provider’s credit are NOT the same thing', () => {
    // They differ by ~9.8x and measure different things: one is a price AZMA
    // paid, the other a denomination AZMA sells. Confusing them once already
    // produced a cost basis that was wrong by an order of magnitude.
    expect(CREDIT_USD).toBeGreaterThan(BALANCE_UNIT_USD * 9);
    expect(CREDIT_EGP).toBeGreaterThan(BALANCE_UNIT_EGP * 9);
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
    expect(e.balanceConsumed).toBe(2000);
    near(e.balanceValueEgp, 2000 * BALANCE_UNIT_EGP, 1e-9);
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

  it('video is charged per REQUESTED second, and says so', () => {
    const rule = consumptionFor('VIDEO_CREATION')!;
    expect(rule.quantity).toBe('per-requested-second');
    expect(rule.note).toMatch(/6\.583/);
    const six = priceOperation('VIDEO_CREATION', 6);
    expect(six.balanceConsumed).toBe(6000);
    near(six.providerCostEgp!, 288 * CREDIT_EGP, 1e-6);   // 48 cr/s x 6
  });

  it('a capability with no measured cost yields a null cost, never a zero', () => {
    const e = priceOperation('NOT_A_CAPABILITY');
    expect(e.providerCostEgp).toBeNull();
    expect(e.grossContributionEgp).toBeNull();
    expect(e.providerCostBasis).toBe('UNKNOWN');
  });

  it('every consumption rule points at a cost capability that exists', () => {
    for (const r of OPERATION_CONSUMPTION) {
      expect(priceOperation(r.capability).providerCostEgp).not.toBeNull();
    }
  });
});

describe('3 · nothing may be sold at a price nobody approved', () => {
  it('the pricing table is explicitly NOT approved', () => {
    expect(BALANCE_PRICING_APPROVED).toBe(false);
    expect(priceOperation('IMAGE_GENERATION').approved).toBe(false);
  });

  it('every package reports itself unapproved too', () => {
    for (const p of PROPOSED_PACKAGES) {
      expect(packageEconomics(p, 'IMAGE_GENERATION').approved).toBe(false);
    }
  });

  it('every package sells the same value per pound — there is one unit value', () => {
    for (const p of PROPOSED_PACKAGES) {
      const e = packageEconomics(p, 'IMAGE_GENERATION');
      // Within a rounding of the reference: a package that quietly gave a
      // better rate would be a second unit value, and there is only one.
      near(e.impliedUnitValueEgp, BALANCE_UNIT_EGP, 5e-5);
    }
  });

  it('the decisions that belong to the Founder are named, not defaulted', () => {
    const joined = PENDING_FOUNDER_DECISIONS.join(' ');
    for (const k of ['EXPIRY', 'REFUNDABLE', 'TRANSFERABLE', 'CONSUMPTION_TABLE', 'PACKAGE_PRICES']) {
      expect(joined).toContain(k);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

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
    expect(BALANCE).not.toMatch(/xpay/i);
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
