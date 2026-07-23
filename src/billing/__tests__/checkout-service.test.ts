const mockCustomersCreate = jest.fn();
const mockSessionsCreate = jest.fn();

jest.mock('../stripe-client', () => ({
  getStripeClient: jest.fn(() => ({
    customers: { create: mockCustomersCreate },
    checkout: { sessions: { create: mockSessionsCreate } },
  })),
}));

jest.mock('../../persistent-storage', () => ({
  getDb: jest.fn(() => 'fake-db-handle'),
  getSubscriptionByCreator: jest.fn(),
  createSubscription: jest.fn(),
}));

import { getSubscriptionByCreator, createSubscription } from '../../persistent-storage';
import { createCheckoutSession } from '../checkout-service';

const mockGetSubscriptionByCreator = getSubscriptionByCreator as jest.Mock;
const mockCreateSubscription = createSubscription as jest.Mock;

describe('Billing Foundation — Checkout Session Creation', () => {
  const originalPriceId = process.env.STRIPE_PRICE_ID_CREATOR_MONTHLY;

  beforeEach(() => {
    process.env.STRIPE_PRICE_ID_CREATOR_MONTHLY = 'price_test_123';
    mockCustomersCreate.mockReset();
    mockSessionsCreate.mockReset();
    mockGetSubscriptionByCreator.mockReset();
    mockCreateSubscription.mockReset();
  });

  afterEach(() => {
    process.env.STRIPE_PRICE_ID_CREATOR_MONTHLY = originalPriceId;
  });

  it('creates a new Stripe customer and a local subscription record for a first-time Creator', async () => {
    mockGetSubscriptionByCreator.mockReturnValue(null);
    mockCustomersCreate.mockResolvedValue({ id: 'cus_new' });
    mockCreateSubscription.mockReturnValue({ subscriptionId: 'sub-record-1', stripeCustomerId: 'cus_new' });
    mockSessionsCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session123' });

    const result = await createCheckoutSession('creator-1', 'https://app.example/success', 'https://app.example/cancel');

    expect(mockCustomersCreate).toHaveBeenCalledWith({ metadata: { creatorId: 'creator-1' } });
    expect(mockCreateSubscription).toHaveBeenCalledWith('fake-db-handle', expect.objectContaining({
      creatorId: 'creator-1', stripeCustomerId: 'cus_new', status: 'incomplete',
    }));
    expect(mockSessionsCreate).toHaveBeenCalledWith(expect.objectContaining({
      customer: 'cus_new',
      mode: 'subscription',
      line_items: [{ price: 'price_test_123', quantity: 1 }],
    }));
    expect(result.checkoutUrl).toBe('https://checkout.stripe.com/session123');
  });

  it('reuses an existing Stripe customer and subscription record rather than creating a duplicate', async () => {
    mockGetSubscriptionByCreator.mockReturnValue({ subscriptionId: 'sub-existing', stripeCustomerId: 'cus_existing', status: 'incomplete' });
    mockSessionsCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session456' });

    await createCheckoutSession('creator-2', 'https://app.example/success', 'https://app.example/cancel');

    expect(mockCustomersCreate).not.toHaveBeenCalled();
    expect(mockCreateSubscription).not.toHaveBeenCalled();
    expect(mockSessionsCreate).toHaveBeenCalledWith(expect.objectContaining({ customer: 'cus_existing' }));
  });

  it('creates a fresh subscription record when the Creator\'s prior subscription was canceled', async () => {
    mockGetSubscriptionByCreator.mockReturnValue({ subscriptionId: 'sub-old', stripeCustomerId: 'cus_existing', status: 'canceled' });
    mockCreateSubscription.mockReturnValue({ subscriptionId: 'sub-new', stripeCustomerId: 'cus_existing' });
    mockSessionsCreate.mockResolvedValue({ url: 'https://checkout.stripe.com/session789' });

    await createCheckoutSession('creator-3', 'https://app.example/success', 'https://app.example/cancel');

    expect(mockCreateSubscription).toHaveBeenCalled();
  });

  it('throws honestly when the payment provider does not return a checkout URL', async () => {
    mockGetSubscriptionByCreator.mockReturnValue({ subscriptionId: 'sub-x', stripeCustomerId: 'cus_x', status: 'incomplete' });
    mockSessionsCreate.mockResolvedValue({ url: null });

    await expect(createCheckoutSession('creator-4', 'https://a', 'https://b')).rejects.toThrow(/checkout URL/);
  });
});
