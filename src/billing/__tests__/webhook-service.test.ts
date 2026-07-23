import Stripe from 'stripe';
import { verifyWebhookSignature } from '../webhook-service';

describe('Billing Foundation — Webhook Signature Verification (real, not mocked)', () => {
  const originalSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secret = 'whsec_test_secret_for_verification';
  const payload = JSON.stringify({ id: 'evt_1', object: 'event', type: 'checkout.session.completed', data: { object: { id: 'cs_1' } } });

  beforeEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = secret;
  });

  afterEach(() => {
    process.env.STRIPE_WEBHOOK_SECRET = originalSecret;
  });

  it('accepts a genuinely, correctly signed payload', () => {
    const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
    const event = verifyWebhookSignature(payload, header);
    expect(event.type).toBe('checkout.session.completed');
  });

  it('rejects a payload signed with the wrong secret', () => {
    const header = Stripe.webhooks.generateTestHeaderString({ payload, secret: 'whsec_a_completely_different_secret' });
    expect(() => verifyWebhookSignature(payload, header)).toThrow();
  });

  it('rejects a tampered payload, even with a validly-formed signature from a real signing pass', () => {
    const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
    const tamperedPayload = payload.replace('checkout.session.completed', 'customer.subscription.deleted');
    expect(() => verifyWebhookSignature(tamperedPayload, header)).toThrow();
  });

  it('throws a clear error when no webhook secret is configured', () => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
    const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
    expect(() => verifyWebhookSignature(payload, header)).toThrow(/STRIPE_WEBHOOK_SECRET/);
  });
});
