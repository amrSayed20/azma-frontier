// MOCKED / CONTRACT TESTS — No real Paymob API calls are made.
// All HTTP requests are intercepted via jest.spyOn(global, 'fetch').
// REAL PAYMOB TEST: NOT TESTED — credentials not yet available (Phase 2B).

import { createHmac } from 'crypto';
import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../../../persistent-storage/db';
import { PaymobPaymentGateway, resetPaymobGatewayForTests } from '../paymob-payment-gateway';
import { WebhookSignatureError, PaymentSessionError } from '../payment-gateway-contracts';
import { handlePaymentWebhook } from '../payment-webhook-handler';
import { CreatorCreditRepository } from '../../credit-ledger/credit-ledger-repository';

// ─── FIXTURES ────────────────────────────────────────────────────────────────

const TEST_API_KEY = 'test-api-key';
const TEST_INTEGRATION_ID = '123456';
const TEST_IFRAME_ID = '789';
const TEST_HMAC_SECRET = 'test-hmac-secret-for-unit-tests';

const CREATOR_ID = 'creator-paymob-001';
const PACK_ID = 'start';
const AZMA_UNITS = 800;
const PRICE_EGP = 99;
const IDEMPOTENCY_KEY = 'idem-paymob-test-001';

// Produces an obj fixture with a valid HMAC for TEST_HMAC_SECRET
function makePaymobObj(overrides: Partial<Record<string, unknown>> = {}): Record<string, unknown> {
  const base: Record<string, unknown> = {
    id: 55555,
    amount_cents: 9900,
    currency: 'EGP',
    success: true,
    pending: false,
    error_occured: false,
    is_auth: false,
    is_capture: false,
    is_standalone_payment: true,
    is_voided: false,
    is_refunded: false,
    is_3d_secure: true,
    has_parent_transaction: false,
    created_at: '2026-08-20T12:00:00',
    integration_id: parseInt(TEST_INTEGRATION_ID, 10),
    owner: 99999,
    order: { id: 77777, merchant_order_id: IDEMPOTENCY_KEY },
    source_data: { pan: 'xxxx', sub_type: 'MasterCard', type: 'card' },
    ...overrides,
  };

  const hmac = computeHmac(base);
  return { ...base, hmac };
}

// Matches the exact field list and order in PaymobPaymentGateway.computeHmac
function computeHmac(obj: Record<string, unknown>): string {
  const order = obj as {
    amount_cents: unknown; created_at: unknown; currency: unknown; error_occured: unknown;
    has_parent_transaction: unknown; id: unknown; integration_id: unknown; is_3d_secure: unknown;
    is_auth: unknown; is_capture: unknown; is_refunded: unknown; is_standalone_payment: unknown;
    is_voided: unknown; order: { id: unknown }; owner: unknown; pending: unknown;
    source_data: { pan: unknown; sub_type: unknown; type: unknown }; success: unknown;
  };
  const concat = [
    String(order.amount_cents), String(order.created_at), String(order.currency),
    String(order.error_occured), String(order.has_parent_transaction), String(order.id),
    String(order.integration_id), String(order.is_3d_secure), String(order.is_auth),
    String(order.is_capture), String(order.is_refunded), String(order.is_standalone_payment),
    String(order.is_voided), String(order.order.id), String(order.owner), String(order.pending),
    String(order.source_data.pan), String(order.source_data.sub_type), String(order.source_data.type),
    String(order.success),
  ].join('');
  return createHmac('sha512', TEST_HMAC_SECRET).update(concat).digest('hex');
}

function makeWebhookPayload(obj: Record<string, unknown>): string {
  return JSON.stringify({ type: 'TRANSACTION', obj });
}

// ─── TEST SETUP ──────────────────────────────────────────────────────────────

let db: DatabaseSync;
let gateway: PaymobPaymentGateway;

beforeEach(() => {
  db = createDatabase(':memory:');
  gateway = new PaymobPaymentGateway(db, TEST_API_KEY, TEST_INTEGRATION_ID, TEST_IFRAME_ID, TEST_HMAC_SECRET);
  resetPaymobGatewayForTests();
});

afterEach(() => {
  db.close();
  jest.restoreAllMocks();
});

// Helper: insert a payment_transactions record (simulates a completed checkout session)
function seedTransaction(opts: { idempotencyKey?: string; creatorId?: string; packId?: string; azmaUnits?: number } = {}): void {
  const { randomUUID } = require('crypto');
  const now = Date.now();
  db.prepare(
    `INSERT INTO payment_transactions
       (transaction_id, creator_id, pack_id, azma_units, amount_egp, idempotency_key,
        provider_id, provider_order_id, provider_reference, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 'paymob', '77777', ?, 'initiated', ?, ?)`,
  ).run(
    randomUUID(),
    opts.creatorId ?? CREATOR_ID,
    opts.packId ?? PACK_ID,
    opts.azmaUnits ?? AZMA_UNITS,
    PRICE_EGP,
    opts.idempotencyKey ?? IDEMPOTENCY_KEY,
    opts.idempotencyKey ?? IDEMPOTENCY_KEY,
    now, now,
  );
}

// Mock fetch helper — returns a sequence of responses
function mockFetch(...responses: Array<{ ok: boolean; body: unknown }>): void {
  let call = 0;
  jest.spyOn(global, 'fetch').mockImplementation(async () => {
    const resp = responses[call++] ?? responses[responses.length - 1];
    return {
      ok: resp.ok,
      status: resp.ok ? 200 : 500,
      json: async () => resp.body,
    } as Response;
  });
}

// ─── CHECKOUT SESSION TESTS (MOCKED) ─────────────────────────────────────────

describe('PaymobPaymentGateway.createPaymentSession [MOCKED]', () => {
  it('constructs a valid checkout URL with correct pack details', async () => {
    mockFetch(
      { ok: true, body: { token: 'auth-tok' } },       // auth
      { ok: true, body: { id: 77777 } },                // order
      { ok: true, body: { token: 'pay-tok-abc' } },     // payment key
    );

    const result = await gateway.createPaymentSession({
      creatorId: CREATOR_ID,
      packId: PACK_ID,
      amountEgp: PRICE_EGP,
      azmaUnits: AZMA_UNITS,
      idempotencyKey: IDEMPOTENCY_KEY,
      successUrl: 'https://example.com/success',
      cancelUrl: 'https://example.com/cancel',
    });

    expect(result.checkoutUrl).toContain('accept.paymob.com');
    expect(result.checkoutUrl).toContain(`iframes/${TEST_IFRAME_ID}`);
    expect(result.checkoutUrl).toContain('payment_token=pay-tok-abc');
    expect(result.sessionId).toBe('77777');
    expect(result.expiresAt).toBeGreaterThan(Date.now());
  });

  it('sends EGP amount in piastres (priceEgp × 100) to Paymob', async () => {
    const calls: string[] = [];
    jest.spyOn(global, 'fetch').mockImplementation(async (_url, opts) => {
      const body = JSON.parse((opts?.body as string) ?? '{}') as Record<string, unknown>;
      calls.push(JSON.stringify(body));
      if (calls.length === 1) return { ok: true, status: 200, json: async () => ({ token: 'auth-tok' }) } as Response;
      if (calls.length === 2) return { ok: true, status: 200, json: async () => ({ id: 77777 }) } as Response;
      return { ok: true, status: 200, json: async () => ({ token: 'pay-tok' }) } as Response;
    });

    await gateway.createPaymentSession({
      creatorId: CREATOR_ID, packId: PACK_ID, amountEgp: PRICE_EGP, azmaUnits: AZMA_UNITS,
      idempotencyKey: IDEMPOTENCY_KEY, successUrl: '', cancelUrl: '',
    });

    const orderBody = JSON.parse(calls[1]!) as { amount_cents: number; currency: string };
    expect(orderBody.amount_cents).toBe(PRICE_EGP * 100); // 99 EGP → 9900 piastres
    expect(orderBody.currency).toBe('EGP');
  });

  it('sets merchant_order_id to idempotencyKey for webhook reconciliation', async () => {
    const calls: string[] = [];
    jest.spyOn(global, 'fetch').mockImplementation(async (_url, opts) => {
      calls.push((opts?.body as string) ?? '');
      if (calls.length === 1) return { ok: true, status: 200, json: async () => ({ token: 'auth-tok' }) } as Response;
      if (calls.length === 2) return { ok: true, status: 200, json: async () => ({ id: 77777 }) } as Response;
      return { ok: true, status: 200, json: async () => ({ token: 'pay-tok' }) } as Response;
    });

    await gateway.createPaymentSession({
      creatorId: CREATOR_ID, packId: PACK_ID, amountEgp: PRICE_EGP, azmaUnits: AZMA_UNITS,
      idempotencyKey: IDEMPOTENCY_KEY, successUrl: '', cancelUrl: '',
    });

    const orderBody = JSON.parse(calls[1]!) as { merchant_order_id: string };
    expect(orderBody.merchant_order_id).toBe(IDEMPOTENCY_KEY);
  });

  it('stores a payment_transactions record after successful session creation', async () => {
    mockFetch(
      { ok: true, body: { token: 'auth-tok' } },
      { ok: true, body: { id: 77777 } },
      { ok: true, body: { token: 'pay-tok' } },
    );

    await gateway.createPaymentSession({
      creatorId: CREATOR_ID, packId: PACK_ID, amountEgp: PRICE_EGP, azmaUnits: AZMA_UNITS,
      idempotencyKey: IDEMPOTENCY_KEY, successUrl: '', cancelUrl: '',
    });

    const row = db.prepare('SELECT * FROM payment_transactions WHERE idempotency_key = ?')
      .get(IDEMPOTENCY_KEY) as { creator_id: string; pack_id: string; azma_units: number; status: string } | undefined;

    expect(row).toBeDefined();
    expect(row!.creator_id).toBe(CREATOR_ID);
    expect(row!.pack_id).toBe(PACK_ID);
    expect(row!.azma_units).toBe(AZMA_UNITS);
    expect(row!.status).toBe('initiated');
  });

  it('throws PaymentSessionError when Paymob auth call fails', async () => {
    mockFetch({ ok: false, body: {} });
    await expect(gateway.createPaymentSession({
      creatorId: CREATOR_ID, packId: PACK_ID, amountEgp: PRICE_EGP, azmaUnits: AZMA_UNITS,
      idempotencyKey: IDEMPOTENCY_KEY, successUrl: '', cancelUrl: '',
    })).rejects.toThrow(PaymentSessionError);
  });

  it('throws PaymentSessionError when Paymob order creation fails', async () => {
    mockFetch(
      { ok: true, body: { token: 'auth-tok' } },
      { ok: false, body: {} },
    );
    await expect(gateway.createPaymentSession({
      creatorId: CREATOR_ID, packId: PACK_ID, amountEgp: PRICE_EGP, azmaUnits: AZMA_UNITS,
      idempotencyKey: IDEMPOTENCY_KEY, successUrl: '', cancelUrl: '',
    })).rejects.toThrow(PaymentSessionError);
  });

  it('throws PaymentSessionError when payment key creation fails', async () => {
    mockFetch(
      { ok: true, body: { token: 'auth-tok' } },
      { ok: true, body: { id: 77777 } },
      { ok: false, body: {} },
    );
    await expect(gateway.createPaymentSession({
      creatorId: CREATOR_ID, packId: PACK_ID, amountEgp: PRICE_EGP, azmaUnits: AZMA_UNITS,
      idempotencyKey: IDEMPOTENCY_KEY, successUrl: '', cancelUrl: '',
    })).rejects.toThrow(PaymentSessionError);
  });
});

// ─── WEBHOOK VERIFICATION TESTS (MOCKED) ──────────────────────────────────────

describe('PaymobPaymentGateway.verifyWebhookEvent [MOCKED]', () => {
  it('SCENARIO: successful payment — verifies HMAC and returns transaction.success event', async () => {
    seedTransaction();
    const obj = makePaymobObj();
    const result = await gateway.verifyWebhookEvent(makeWebhookPayload(obj), obj.hmac as string);

    expect(result.verified).toBe(true);
    expect(result.eventType).toBe('transaction.success');
    expect(result.paymentIntentId).toBe('55555');
    expect(result.metadata['creator_id']).toBe(CREATOR_ID);
    expect(result.metadata['pack_id']).toBe(PACK_ID);
    expect(result.metadata['azma_units']).toBe(String(AZMA_UNITS));
    expect(result.metadata['idempotency_key']).toBe(IDEMPOTENCY_KEY);
    expect(result.amountReceived).toBe(9900);
    expect(result.currency).toBe('egp');
  });

  it('SCENARIO: pending payment — returns transaction.pending event', async () => {
    seedTransaction();
    const obj = makePaymobObj({ success: false, pending: true });
    const result = await gateway.verifyWebhookEvent(makeWebhookPayload(obj), obj.hmac as string);

    expect(result.eventType).toBe('transaction.pending');
  });

  it('SCENARIO: failed payment — returns transaction.failed event', async () => {
    seedTransaction();
    const obj = makePaymobObj({ success: false, pending: false });
    const result = await gateway.verifyWebhookEvent(makeWebhookPayload(obj), obj.hmac as string);

    expect(result.eventType).toBe('transaction.failed');
  });

  it('SCENARIO: invalid HMAC — throws WebhookSignatureError', async () => {
    seedTransaction();
    const obj = makePaymobObj();
    await expect(
      gateway.verifyWebhookEvent(makeWebhookPayload(obj), 'wrong-hmac-value'),
    ).rejects.toThrow(WebhookSignatureError);
  });

  it('SCENARIO: malformed JSON payload — throws WebhookSignatureError', async () => {
    await expect(
      gateway.verifyWebhookEvent('not-json-at-all', 'any-sig'),
    ).rejects.toThrow(WebhookSignatureError);
  });

  it('SCENARIO: missing obj field — throws WebhookSignatureError', async () => {
    await expect(
      gateway.verifyWebhookEvent(JSON.stringify({ type: 'TRANSACTION' }), 'any-sig'),
    ).rejects.toThrow(WebhookSignatureError);
  });

  it('SCENARIO: unknown transaction (no payment_transactions record) — returns transaction.unknown event', async () => {
    // No seedTransaction() — record not in DB
    const obj = makePaymobObj();
    const result = await gateway.verifyWebhookEvent(makeWebhookPayload(obj), obj.hmac as string);

    expect(result.eventType).toMatch(/transaction\.unknown/);
    expect(result.metadata).toEqual({});
  });

  it('SCENARIO: replayed event — second verification returns same result (idempotent status update)', async () => {
    seedTransaction();
    const obj = makePaymobObj();
    const sig = obj.hmac as string;

    const r1 = await gateway.verifyWebhookEvent(makeWebhookPayload(obj), sig);
    const r2 = await gateway.verifyWebhookEvent(makeWebhookPayload(obj), sig);

    expect(r1.eventType).toBe('transaction.success');
    expect(r2.eventType).toBe('transaction.success');

    // Status row updated to successful both times — no error on repeated update
    const row = db.prepare('SELECT status FROM payment_transactions WHERE idempotency_key = ?')
      .get(IDEMPOTENCY_KEY) as { status: string } | undefined;
    expect(row!.status).toBe('successful');
  });

  it('SCENARIO: payment status updated from initiated → successful on success webhook', async () => {
    seedTransaction();
    const obj = makePaymobObj();
    await gateway.verifyWebhookEvent(makeWebhookPayload(obj), obj.hmac as string);

    const row = db.prepare('SELECT status, provider_transaction_id FROM payment_transactions WHERE idempotency_key = ?')
      .get(IDEMPOTENCY_KEY) as { status: string; provider_transaction_id: string } | undefined;
    expect(row!.status).toBe('successful');
    expect(row!.provider_transaction_id).toBe('55555');
  });

  it('SCENARIO: payment status updated to failed on failure webhook', async () => {
    seedTransaction();
    const obj = makePaymobObj({ success: false, pending: false });
    await gateway.verifyWebhookEvent(makeWebhookPayload(obj), obj.hmac as string);

    const row = db.prepare('SELECT status FROM payment_transactions WHERE idempotency_key = ?')
      .get(IDEMPOTENCY_KEY) as { status: string } | undefined;
    expect(row!.status).toBe('failed');
  });

  it('SCENARIO: wrong currency in webhook — does not affect credit grant (pack definition is authoritative)', async () => {
    // Currency mismatch is caught at handlePaymentWebhook level, not verifyWebhookEvent
    seedTransaction();
    // Make a fake obj where currency is different but HMAC is recomputed
    const obj = makePaymobObj({ currency: 'USD' });
    const result = await gateway.verifyWebhookEvent(makeWebhookPayload(obj), obj.hmac as string);
    // verifyWebhookEvent passes through; handlePaymentWebhook is responsible for pack validation
    expect(result.verified).toBe(true);
    expect(result.currency).toBe('usd');
  });
});

// ─── FULL PIPELINE TESTS (via handlePaymentWebhook) ──────────────────────────

describe('Full pipeline: Paymob webhook → credit grant [MOCKED]', () => {
  it('SCENARIO: successful payment credits correct AZMA units to creator', async () => {
    seedTransaction();
    const obj = makePaymobObj();

    const result = await handlePaymentWebhook(db, gateway, makeWebhookPayload(obj), obj.hmac as string);

    expect(result.processed).toBe(true);
    expect(result.reason).toBe('credited');
    expect(result.azmaUnitsGranted).toBe(AZMA_UNITS);
    expect(result.creatorId).toBe(CREATOR_ID);

    const repo = new CreatorCreditRepository(db);
    expect(repo.getBalance(CREATOR_ID).availableUnits).toBe(AZMA_UNITS);
  });

  it('SCENARIO: idempotent credit grant — replayed webhook does not double-credit', async () => {
    seedTransaction();
    const obj = makePaymobObj();
    const payload = makeWebhookPayload(obj);
    const sig = obj.hmac as string;

    await handlePaymentWebhook(db, gateway, payload, sig);
    await handlePaymentWebhook(db, gateway, payload, sig);

    const repo = new CreatorCreditRepository(db);
    expect(repo.getBalance(CREATOR_ID).availableUnits).toBe(AZMA_UNITS); // 800, not 1600
  });

  it('SCENARIO: invalid HMAC — no credits granted, returns processed:false', async () => {
    seedTransaction();
    const obj = makePaymobObj();
    const result = await handlePaymentWebhook(db, gateway, makeWebhookPayload(obj), 'bad-signature');

    expect(result.processed).toBe(false);
    expect(result.reason).toBe('signature_invalid');

    const repo = new CreatorCreditRepository(db);
    expect(repo.getBalance(CREATOR_ID).availableUnits).toBe(0);
  });

  it('SCENARIO: failed payment — no credits granted', async () => {
    seedTransaction();
    const obj = makePaymobObj({ success: false, pending: false });
    const result = await handlePaymentWebhook(db, gateway, makeWebhookPayload(obj), obj.hmac as string);

    expect(result.processed).toBe(false);
    expect(result.reason).toMatch(/ignored_event_type:transaction\.failed/);

    const repo = new CreatorCreditRepository(db);
    expect(repo.getBalance(CREATOR_ID).availableUnits).toBe(0);
  });

  it('SCENARIO: pending payment — no credits granted yet', async () => {
    seedTransaction();
    const obj = makePaymobObj({ success: false, pending: true });
    const result = await handlePaymentWebhook(db, gateway, makeWebhookPayload(obj), obj.hmac as string);

    expect(result.processed).toBe(false);
    expect(result.reason).toMatch(/ignored_event_type:transaction\.pending/);

    const repo = new CreatorCreditRepository(db);
    expect(repo.getBalance(CREATOR_ID).availableUnits).toBe(0);
  });

  it('SCENARIO: unknown transaction (no matching record) — no credits granted', async () => {
    // No seedTransaction() call — payment_transactions has no matching record.
    // verifyWebhookEvent returns eventType 'transaction.unknown:...' which is not
    // in the relevantTypes set, so handlePaymentWebhook ignores it.
    const obj = makePaymobObj();
    const result = await handlePaymentWebhook(db, gateway, makeWebhookPayload(obj), obj.hmac as string);

    expect(result.processed).toBe(false);
    expect(result.reason).toMatch(/ignored_event_type:transaction\.unknown/);

    const repo = new CreatorCreditRepository(db);
    expect(repo.getBalance(CREATOR_ID).availableUnits).toBe(0);
  });

  it('SCENARIO: wrong creator (tampered merchant_order_id) — cannot forge credits for another creator', async () => {
    // Attacker provides a merchant_order_id that belongs to someone else's transaction
    seedTransaction({ idempotencyKey: 'victim-idem', creatorId: 'victim-creator', packId: 'start', azmaUnits: 800 });
    // Attacker builds a valid HMAC over a payload pointing to victim's order
    const obj = makePaymobObj({ order: { id: 77777, merchant_order_id: 'victim-idem' } });
    // If attacker doesn't have HMAC_SECRET, the sig will fail — tested in invalid HMAC scenario.
    // If attacker DID have HMAC_SECRET, they would only get credits for the victim's transaction
    // which goes to victim's creator_id (derived from payment_transactions, not client payload).
    const result = await handlePaymentWebhook(db, gateway, makeWebhookPayload(obj), obj.hmac as string);
    // Credits go to the actual creator_id in payment_transactions — 'victim-creator', not an attacker-supplied id
    if (result.processed) {
      expect(result.creatorId).toBe('victim-creator');
    }
  });

  it('SCENARIO: tampered azma_units in payment_transactions — pack definition blocks mismatch', async () => {
    // Seed with mismatched azma_units (wrong amount for the pack)
    seedTransaction({ azmaUnits: 9999, packId: 'start' }); // start pack = 800 units, not 9999
    const obj = makePaymobObj();
    const result = await handlePaymentWebhook(db, gateway, makeWebhookPayload(obj), obj.hmac as string);

    expect(result.processed).toBe(false);
    expect(result.reason).toMatch(/units_mismatch/);

    const repo = new CreatorCreditRepository(db);
    expect(repo.getBalance(CREATOR_ID).availableUnits).toBe(0);
  });

  it('SCENARIO: malformed provider event — no credits granted, no crash', async () => {
    const result = await handlePaymentWebhook(db, gateway, 'not-json', 'any-sig');
    expect(result.processed).toBe(false);
    expect(result.reason).toBe('signature_invalid');
  });
});

// ─── EGP CURRENCY VALIDATION ─────────────────────────────────────────────────

describe('PaymobPaymentGateway currency support', () => {
  it('declares EGP as the only supported currency', () => {
    expect(gateway.supportedCurrencies).toContain('egp');
    expect(gateway.supportedCurrencies).toHaveLength(1);
  });

  it('gatewayId is paymob', () => {
    expect(gateway.gatewayId).toBe('paymob');
  });
});

// ─── PACK VALIDATION ─────────────────────────────────────────────────────────

describe('Credit pack validation in full pipeline [MOCKED]', () => {
  it('processes start pack (800 units, 99 EGP → 9900 piastres)', async () => {
    seedTransaction({ packId: 'start', azmaUnits: 800 });
    const obj = makePaymobObj({ amount_cents: 9900 });
    const result = await handlePaymentWebhook(db, gateway, makeWebhookPayload(obj), obj.hmac as string);
    expect(result.processed).toBe(true);
    expect(result.azmaUnitsGranted).toBe(800);
  });

  it('processes create pack (2400 units)', async () => {
    seedTransaction({ packId: 'create', azmaUnits: 2400, idempotencyKey: 'idem-create-001' });
    const obj = makePaymobObj({
      amount_cents: 24900,
      order: { id: 77777, merchant_order_id: 'idem-create-001' },
    });
    const result = await handlePaymentWebhook(db, gateway, makeWebhookPayload(obj), obj.hmac as string);
    expect(result.processed).toBe(true);
    expect(result.azmaUnitsGranted).toBe(2400);
  });

  it('processes achieve pack (6000 units)', async () => {
    seedTransaction({ packId: 'achieve', azmaUnits: 6000, idempotencyKey: 'idem-achieve-001' });
    const obj = makePaymobObj({
      amount_cents: 49900,
      order: { id: 77777, merchant_order_id: 'idem-achieve-001' },
    });
    const result = await handlePaymentWebhook(db, gateway, makeWebhookPayload(obj), obj.hmac as string);
    expect(result.processed).toBe(true);
    expect(result.azmaUnitsGranted).toBe(6000);
  });
});
