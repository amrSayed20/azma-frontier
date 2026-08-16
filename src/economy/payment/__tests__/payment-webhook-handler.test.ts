import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../../../persistent-storage/db';
import { handlePaymentWebhook } from '../payment-webhook-handler';
import { WebhookSignatureError } from '../payment-gateway-contracts';
import type { IPaymentGateway, WebhookVerificationResult } from '../payment-gateway-contracts';
import { CreatorCreditRepository } from '../../credit-ledger/credit-ledger-repository';

function makeGateway(overrides: Partial<WebhookVerificationResult> = {}): IPaymentGateway {
  const defaults: WebhookVerificationResult = {
    verified: true,
    eventType: 'checkout.session.completed',
    paymentIntentId: 'pi_test_001',
    metadata: {
      creator_id: 'creator-webhook-001',
      pack_id: 'start',
      azma_units: '800',
      idempotency_key: 'idem-webhook-001',
    },
    amountReceived: 9900,
    currency: 'egp',
  };
  const result = { ...defaults, ...overrides, metadata: { ...defaults.metadata, ...overrides.metadata } };
  return {
    gatewayId: 'stripe-mock',
    supportedCurrencies: ['egp'],
    createPaymentSession: jest.fn(),
    verifyWebhookEvent: jest.fn().mockResolvedValue(result),
  };
}

function makeInvalidSigGateway(): IPaymentGateway {
  return {
    gatewayId: 'stripe-mock',
    supportedCurrencies: ['egp'],
    createPaymentSession: jest.fn(),
    verifyWebhookEvent: jest.fn().mockRejectedValue(new WebhookSignatureError('stripe-mock')),
  };
}

let db: DatabaseSync;

beforeEach(() => {
  db = createDatabase(':memory:');
});

afterEach(() => {
  db.close();
});

// SCENARIO 26: Successful webhook credits AZMA units
describe('handlePaymentWebhook', () => {
  it('credits 800 AZMA units on a valid checkout.session.completed event', async () => {
    const gateway = makeGateway();
    const result = await handlePaymentWebhook(db, gateway, 'raw-body', 'sig');
    expect(result.processed).toBe(true);
    expect(result.reason).toBe('credited');
    expect(result.azmaUnitsGranted).toBe(800);
    expect(result.creatorId).toBe('creator-webhook-001');

    const repo = new CreatorCreditRepository(db);
    const bal = repo.getBalance('creator-webhook-001');
    expect(bal.availableUnits).toBe(800);
  });

  // SCENARIO 27: Invalid signature returns processed:false
  it('returns processed:false on invalid webhook signature', async () => {
    const gateway = makeInvalidSigGateway();
    const result = await handlePaymentWebhook(db, gateway, 'bad-body', 'bad-sig');
    expect(result.processed).toBe(false);
    expect(result.reason).toBe('signature_invalid');
  });

  // SCENARIO 28: Idempotent — same paymentIntentId does not double-credit
  it('is idempotent — replaying the same event does not double-credit', async () => {
    const gateway = makeGateway();
    await handlePaymentWebhook(db, gateway, 'raw-body', 'sig');
    await handlePaymentWebhook(db, gateway, 'raw-body', 'sig');

    const repo = new CreatorCreditRepository(db);
    const bal = repo.getBalance('creator-webhook-001');
    expect(bal.availableUnits).toBe(800); // still 800, not 1600
  });

  // SCENARIO 29: Irrelevant event type ignored
  it('ignores non-payment event types', async () => {
    const gateway = makeGateway({ eventType: 'customer.subscription.deleted' });
    const result = await handlePaymentWebhook(db, gateway, 'raw-body', 'sig');
    expect(result.processed).toBe(false);
    expect(result.reason).toMatch(/ignored_event_type/);
  });

  // SCENARIO 30: Tampered metadata — unit mismatch blocked
  it('blocks processing when azma_units metadata does not match pack definition', async () => {
    const gateway = makeGateway({ metadata: { azma_units: '9999' } });
    const result = await handlePaymentWebhook(db, gateway, 'raw-body', 'sig');
    expect(result.processed).toBe(false);
    expect(result.reason).toMatch(/units_mismatch/);
    // No units should have been granted
    const repo = new CreatorCreditRepository(db);
    expect(repo.getBalance('creator-webhook-001').availableUnits).toBe(0);
  });

  // SCENARIO 31: Missing metadata fields — gateway returns only partial metadata
  it('returns processed:false when required metadata fields are missing', async () => {
    // Build a gateway that returns ONLY pack_id, without creator_id or azma_units
    const incompleteGateway: IPaymentGateway = {
      gatewayId: 'stripe-mock',
      supportedCurrencies: ['egp'],
      createPaymentSession: jest.fn(),
      verifyWebhookEvent: jest.fn().mockResolvedValue({
        verified: true,
        eventType: 'checkout.session.completed',
        paymentIntentId: 'pi_test_missing_meta',
        metadata: { pack_id: 'start' },   // creator_id and azma_units intentionally absent
        amountReceived: 9900,
        currency: 'egp',
      } as WebhookVerificationResult),
    };
    const result = await handlePaymentWebhook(db, incompleteGateway, 'raw-body', 'sig');
    expect(result.processed).toBe(false);
    expect(result.reason).toBe('missing_required_metadata');
  });
});
