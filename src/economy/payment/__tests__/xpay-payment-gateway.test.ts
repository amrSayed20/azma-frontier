// MOCKED / CONTRACT TESTS — no real XPay call is made; fetch is replaced.
// Shapes follow XPay's own documentation (github.com/xpayeg/docs).
// REAL XPAY TEST: NOT TESTED — no XPay account available.

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../../../persistent-storage/db';
import {
  XpayPaymentGateway,
  isValidXpayBillingName,
  normalizeXpayPhone,
  resolveXpayConfig,
  type XpayConfig,
} from '../xpay-payment-gateway';
import { PaymentSessionError } from '../payment-gateway-contracts';
import { handlePaymentWebhook } from '../payment-webhook-handler';
import { CreatorCreditRepository } from '../../credit-ledger/credit-ledger-repository';

const CONFIG: XpayConfig = {
  apiKey: 'test-key',
  communityId: 'zogDmQW',
  variableAmountId: 25,
  environment: 'staging',
  feesAddedToBill: false,
  baseUrl: 'https://staging.xpay.app',
};
const CREATOR = 'creator-xpay-1';
const UUID = '94fdb93f-c7f0-4b4d-8c8f-1c463c931344';

interface Call { url: string; method: string; headers: Record<string, string>; body: Record<string, unknown> | null }

function mockXpay(routes: Record<string, (call: Call) => { status?: number; body: unknown }>): Call[] {
  const calls: Call[] = [];
  jest.spyOn(global, 'fetch').mockImplementation(async (input, init) => {
    const call: Call = {
      url: String(input),
      method: init?.method ?? 'GET',
      headers: (init?.headers ?? {}) as Record<string, string>,
      body: init?.body ? JSON.parse(String(init.body)) : null,
    };
    calls.push(call);
    const key = Object.keys(routes).find((k) => call.url.includes(k));
    const reply = key ? routes[key](call) : { status: 404, body: { status: { code: 404, message: 'not found' }, data: {} } };
    return { ok: (reply.status ?? 200) < 400, status: reply.status ?? 200, json: async () => reply.body } as Response;
  });
  return calls;
}

const payOk = () => ({
  body: { status: { code: 200, message: 'success', errors: [] }, data: { iframe_url: 'https://staging.xpay.app/core/payment_iframe/2733/', transaction_id: 3220, transaction_status: 'PENDING', transaction_uuid: UUID } },
});
const transaction = (status: string, piastres = 9900, currency = 'EGP') => () => ({
  body: { status: { code: 200, message: 'success', errors: [] }, data: { uuid: UUID, status, total_amount_piasters: piastres, total_amount_currency: currency } },
});

const session = (overrides: Partial<Parameters<XpayPaymentGateway['createPaymentSession']>[0]> = {}) => ({
  creatorId: CREATOR, packId: 'start', amountEgp: 99, azmaUnits: 800, idempotencyKey: 'idem-1',
  successUrl: '', cancelUrl: '', customerEmail: 'mona@example.test', customerName: 'منى عادل', customerPhone: '01012345678',
  ...overrides,
});

let db: DatabaseSync;
beforeEach(() => { db = createDatabase(':memory:'); });
afterEach(() => { db.close(); jest.restoreAllMocks(); });

describe('XPay billing data', () => {
  it('needs a name of two words or more', () => {
    expect(isValidXpayBillingName('منى عادل')).toBe(true);
    expect(isValidXpayBillingName('منى')).toBe(false);
    expect(isValidXpayBillingName('   ')).toBe(false);
  });

  it('turns an Egyptian 01 number into +20 and keeps international numbers', () => {
    expect(normalizeXpayPhone('010 1234 5678')).toBe('+201012345678');
    expect(normalizeXpayPhone('00201112345678')).toBe('+201112345678');
    expect(normalizeXpayPhone('+966501234567')).toBe('+966501234567');
    expect(normalizeXpayPhone('12345')).toBeNull();
    expect(normalizeXpayPhone('0101234567')).toBeNull();
  });
});

describe('XPay configuration', () => {
  const env = { XPAY_API_KEY: 'k', XPAY_COMMUNITY_ID: 'c', XPAY_VARIABLE_AMOUNT_ID: '4' };
  it('requires an explicit environment, so no server charges for real by accident', () => {
    expect(resolveXpayConfig(env)).toBeNull();
    expect(resolveXpayConfig({ ...env, XPAY_ENVIRONMENT: 'production' })).toBeNull();
    expect(resolveXpayConfig({ ...env, XPAY_ENVIRONMENT: 'staging' })?.baseUrl).toBe('https://staging.xpay.app');
    expect(resolveXpayConfig({ ...env, XPAY_ENVIRONMENT: 'live' })?.baseUrl).toBe('https://community.xpay.app');
  });
  it('is missing when any credential is missing', () => {
    expect(resolveXpayConfig({ XPAY_ENVIRONMENT: 'staging', XPAY_API_KEY: 'k', XPAY_COMMUNITY_ID: 'c' })).toBeNull();
  });
});

describe('XpayPaymentGateway.createPaymentSession [MOCKED]', () => {
  it('calls the documented pay endpoint with the API key, the pack amount and the real payer', async () => {
    const calls = mockXpay({ '/api/v1/payments/pay/variable-amount': payOk });
    const result = await new XpayPaymentGateway(db, CONFIG).createPaymentSession(session());

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe('https://staging.xpay.app/api/v1/payments/pay/variable-amount');
    expect(calls[0].method).toBe('POST');
    expect(calls[0].headers['x-api-key']).toBe('test-key');
    expect(calls[0].body).toEqual({
      community_id: 'zogDmQW', variable_amount_id: 25, amount: 99, original_amount: 99, currency: 'EGP',
      pay_using: 'card', language: 'ar',
      billing_data: { name: 'منى عادل', email: 'mona@example.test', phone_number: '+201012345678' },
    });
    expect(result.checkoutUrl).toBe('https://staging.xpay.app/core/payment_iframe/2733/');
    expect(result.sessionId).toBe(UUID);

    const row = db.prepare("SELECT creator_id, provider_id, provider_order_id, charged_amount_piasters, status FROM payment_transactions WHERE idempotency_key = 'idem-1'").get();
    expect(row).toEqual({ creator_id: CREATOR, provider_id: 'xpay', provider_order_id: UUID, charged_amount_piasters: 9900, status: 'initiated' });
  });

  it('adds XPay fees through prepare-amount only when the agreement says so', async () => {
    const calls = mockXpay({
      '/api/v1/payments/prepare-amount/': () => ({ body: { status: { code: 200 }, data: { total_amount: 101.5, total_amount_currency: 'EGP' } } }),
      '/api/v1/payments/pay/variable-amount': payOk,
    });
    await new XpayPaymentGateway(db, { ...CONFIG, feesAddedToBill: true }).createPaymentSession(session());
    expect(calls.map((c) => c.url.replace(CONFIG.baseUrl, ''))).toEqual(['/api/v1/payments/prepare-amount/', '/api/v1/payments/pay/variable-amount']);
    expect(calls[1].body).toEqual(expect.objectContaining({ amount: 101.5, original_amount: 99 }));
    const row = db.prepare("SELECT charged_amount_piasters FROM payment_transactions WHERE idempotency_key = 'idem-1'").get();
    expect(row).toEqual({ charged_amount_piasters: 10150 });
  });

  it('never sends placeholder billing data: a missing phone or one-word name stops before any call', async () => {
    const calls = mockXpay({});
    const gateway = new XpayPaymentGateway(db, CONFIG);
    await expect(gateway.createPaymentSession(session({ customerPhone: undefined }))).rejects.toBeInstanceOf(PaymentSessionError);
    await expect(gateway.createPaymentSession(session({ customerName: 'منى' }))).rejects.toBeInstanceOf(PaymentSessionError);
    expect(calls).toHaveLength(0);
  });

  it('reports XPay validation errors as a session error and stores nothing', async () => {
    mockXpay({ '/api/v1/payments/pay/variable-amount': () => ({ status: 400, body: { status: { code: 400, message: '', errors: [{ billing_data: { phone_number: ['Enter a valid phone number.'] } }] }, data: {} } }) });
    await expect(new XpayPaymentGateway(db, CONFIG).createPaymentSession(session())).rejects.toThrow(/HTTP 400/);
    expect(db.prepare('SELECT COUNT(*) AS n FROM payment_transactions').get()).toEqual({ n: 0 });
  });
});

describe('XPay callback → units [MOCKED]', () => {
  async function startOrder(): Promise<XpayPaymentGateway> {
    mockXpay({ '/api/v1/payments/pay/variable-amount': payOk });
    const gateway = new XpayPaymentGateway(db, CONFIG);
    await gateway.createPaymentSession(session());
    jest.restoreAllMocks();
    return gateway;
  }
  // The callback body as XPay documents it: the UUID travels under "transaction_id".
  const callback = (status: string) => JSON.stringify({ member_id: null, payment_id: '25', merchant_id: 'zogDmQW', total_amount: 99, transaction_id: UUID, transaction_status: status, total_amount_piasters: 9900 });
  const balance = () => new CreatorCreditRepository(db).getBalance(CREATOR).availableUnits;

  it('grants the pack once, after re-reading SUCCESSFUL from XPay', async () => {
    const gateway = await startOrder();
    const calls = mockXpay({ [`/transactions/${UUID}/`]: transaction('SUCCESSFUL') });

    const first = await handlePaymentWebhook(db, gateway, callback('SUCCESSFUL'), '');
    const replay = await handlePaymentWebhook(db, gateway, callback('SUCCESSFUL'), '');

    expect(first).toEqual(expect.objectContaining({ processed: true, azmaUnitsGranted: 800, creatorId: CREATOR }));
    expect(replay.processed).toBe(true);
    expect(balance()).toBe(800);
    expect(calls[0].url).toBe(`https://staging.xpay.app/api/v1/communities/zogDmQW/transactions/${UUID}/`);
    expect(calls[0].headers['x-api-key']).toBe('test-key');
  });

  it('does not trust the callback body: a forged SUCCESSFUL is refused when XPay says FAILED', async () => {
    const gateway = await startOrder();
    mockXpay({ [`/transactions/${UUID}/`]: transaction('FAILED') });
    const result = await handlePaymentWebhook(db, gateway, callback('SUCCESSFUL'), '');
    expect(result.reason).toBe('ignored_event_type:transaction.failed');
    expect(balance()).toBe(0);
  });

  it('refuses a SUCCESSFUL transaction whose amount or currency differs from the order', async () => {
    const gateway = await startOrder();
    mockXpay({ [`/transactions/${UUID}/`]: transaction('SUCCESSFUL', 100) });
    expect((await handlePaymentWebhook(db, gateway, callback('SUCCESSFUL'), '')).reason).toBe('ignored_event_type:transaction.amount_mismatch');
    mockXpay({ [`/transactions/${UUID}/`]: transaction('SUCCESSFUL', 9900, 'USD') });
    expect((await handlePaymentWebhook(db, gateway, callback('SUCCESSFUL'), '')).reason).toBe('ignored_event_type:transaction.amount_mismatch');
    expect(balance()).toBe(0);
  });

  it('makes no call to XPay for a UUID this server never created', async () => {
    const gateway = new XpayPaymentGateway(db, CONFIG);
    const calls = mockXpay({});
    const result = await handlePaymentWebhook(db, gateway, JSON.stringify({ transaction_id: 'not-ours' }), '');
    expect(result.processed).toBe(false);
    expect(calls).toHaveLength(0);
  });

  it('a confirmed payment stays confirmed: later callbacks make no XPay call and grant nothing more', async () => {
    const gateway = await startOrder();
    mockXpay({ [`/transactions/${UUID}/`]: transaction('SUCCESSFUL') });
    await handlePaymentWebhook(db, gateway, callback('SUCCESSFUL'), '');
    const calls = mockXpay({ [`/transactions/${UUID}/`]: transaction('REFUNDED') });
    await handlePaymentWebhook(db, gateway, callback('REFUNDED'), '');
    expect(calls).toHaveLength(0);
    const row = db.prepare('SELECT status FROM payment_transactions WHERE provider_order_id = ?').get(UUID);
    expect(row).toEqual({ status: 'successful' });
    expect(balance()).toBe(800);
  });

  it('any other XPay state is kept for review and grants nothing', async () => {
    const gateway = await startOrder();
    mockXpay({ [`/transactions/${UUID}/`]: transaction('REFUNDED') });
    expect((await handlePaymentWebhook(db, gateway, callback('REFUNDED'), '')).reason).toBe('ignored_event_type:transaction.other:refunded');
    expect(db.prepare('SELECT status FROM payment_transactions WHERE provider_order_id = ?').get(UUID)).toEqual({ status: 'review:refunded' });
    expect(balance()).toBe(0);
  });

  it('accepts the redirect form { transaction_uuid } and tolerates malformed bodies', async () => {
    const gateway = await startOrder();
    mockXpay({ [`/transactions/${UUID}/`]: transaction('PENDING') });
    expect((await handlePaymentWebhook(db, gateway, JSON.stringify({ transaction_uuid: UUID }), '')).reason).toBe('ignored_event_type:transaction.pending');
    expect((await handlePaymentWebhook(db, gateway, 'not-json', '')).processed).toBe(false);
    expect((await handlePaymentWebhook(db, gateway, '{}', '')).processed).toBe(false);
  });
});
