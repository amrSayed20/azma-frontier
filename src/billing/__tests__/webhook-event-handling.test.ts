jest.mock('../../persistent-storage', () => ({
  getDb: jest.fn(() => 'fake-db-handle'),
  getSubscriptionByStripeSubscriptionId: jest.fn(),
  updateSubscription: jest.fn(),
}));

import type Stripe from 'stripe';
import { getSubscriptionByStripeSubscriptionId, updateSubscription } from '../../persistent-storage';
import { handleWebhookEvent } from '../webhook-service';

const mockGetSubscriptionByStripeSubscriptionId = getSubscriptionByStripeSubscriptionId as jest.Mock;
const mockUpdateSubscription = updateSubscription as jest.Mock;

function fakeEvent(type: string, object: unknown): Stripe.Event {
  return { type, data: { object } } as unknown as Stripe.Event;
}

describe('Billing Foundation — Webhook Event Dispatch', () => {
  beforeEach(() => {
    mockGetSubscriptionByStripeSubscriptionId.mockReset();
    mockUpdateSubscription.mockReset();
  });

  it('activates the subscription record on checkout.session.completed', () => {
    handleWebhookEvent(fakeEvent('checkout.session.completed', {
      subscription: 'stripe_sub_1',
      metadata: { subscriptionRecordId: 'sub-record-1' },
    }));

    expect(mockUpdateSubscription).toHaveBeenCalledWith('fake-db-handle', 'sub-record-1', {
      stripeSubscriptionId: 'stripe_sub_1',
      status: 'active',
    });
  });

  it('does nothing on checkout.session.completed when metadata is missing — never guesses which record to update', () => {
    handleWebhookEvent(fakeEvent('checkout.session.completed', { subscription: 'stripe_sub_1', metadata: {} }));
    expect(mockUpdateSubscription).not.toHaveBeenCalled();
  });

  it('syncs status on customer.subscription.updated', () => {
    mockGetSubscriptionByStripeSubscriptionId.mockReturnValue({ subscriptionId: 'sub-record-2' });
    handleWebhookEvent(fakeEvent('customer.subscription.updated', {
      id: 'stripe_sub_2',
      status: 'past_due',
      items: { data: [{ current_period_end: 1_700_000 }] },
    }));

    expect(mockUpdateSubscription).toHaveBeenCalledWith('fake-db-handle', 'sub-record-2', {
      status: 'past_due',
      currentPeriodEnd: 1_700_000_000,
    });
  });

  it('cancels the local record on customer.subscription.deleted', () => {
    mockGetSubscriptionByStripeSubscriptionId.mockReturnValue({ subscriptionId: 'sub-record-3' });
    handleWebhookEvent(fakeEvent('customer.subscription.deleted', { id: 'stripe_sub_3' }));

    expect(mockUpdateSubscription).toHaveBeenCalledWith('fake-db-handle', 'sub-record-3', { status: 'canceled' });
  });

  it('marks the local record past_due on invoice.payment_failed', () => {
    mockGetSubscriptionByStripeSubscriptionId.mockReturnValue({ subscriptionId: 'sub-record-4' });
    handleWebhookEvent(fakeEvent('invoice.payment_failed', {
      parent: { subscription_details: { subscription: 'stripe_sub_4' } },
    }));

    expect(mockUpdateSubscription).toHaveBeenCalledWith('fake-db-handle', 'sub-record-4', { status: 'past_due' });
  });

  it('ignores event types outside this Foundation\'s own scope, without throwing', () => {
    expect(() => handleWebhookEvent(fakeEvent('customer.updated', {}))).not.toThrow();
    expect(mockUpdateSubscription).not.toHaveBeenCalled();
  });
});
