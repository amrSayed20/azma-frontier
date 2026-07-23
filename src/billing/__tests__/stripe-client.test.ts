import { getStripeClient, resetStripeClientForTests } from '../stripe-client';

describe('Billing Foundation — Stripe Client', () => {
  const original = process.env.STRIPE_SECRET_KEY;

  beforeEach(() => {
    resetStripeClientForTests();
  });

  afterEach(() => {
    process.env.STRIPE_SECRET_KEY = original;
    resetStripeClientForTests();
  });

  it('throws a clear error when no Stripe secret key is configured — never fails silently', () => {
    delete process.env.STRIPE_SECRET_KEY;
    expect(() => getStripeClient()).toThrow(/STRIPE_SECRET_KEY/);
  });

  it('caches the client instance across calls once configured', () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
    const first = getStripeClient();
    const second = getStripeClient();
    expect(first).toBe(second);
  });
});
