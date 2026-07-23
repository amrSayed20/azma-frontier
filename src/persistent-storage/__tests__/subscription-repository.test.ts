import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import {
  createSubscription,
  getSubscriptionByCreator,
  getSubscriptionByStripeSubscriptionId,
  updateSubscription,
} from '../subscription-repository';

describe('Persistent Storage Foundation — Subscription records', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('creates a subscription and reads it back for its Creator', () => {
    const created = createSubscription(db, {
      subscriptionId: 'sub-1', creatorId: 'creator-1', stripeCustomerId: 'cus_1', status: 'incomplete', plan: 'creator-monthly',
    });
    expect(created.status).toBe('incomplete');

    const fetched = getSubscriptionByCreator(db, 'creator-1');
    expect(fetched).toEqual(created);
  });

  it('returns null when a Creator has no subscription', () => {
    expect(getSubscriptionByCreator(db, 'no-such-creator')).toBeNull();
  });

  it('returns the most recently created subscription for a Creator with more than one', () => {
    createSubscription(db, { subscriptionId: 'sub-a', creatorId: 'creator-2', status: 'canceled', plan: 'creator-monthly' });
    createSubscription(db, { subscriptionId: 'sub-b', creatorId: 'creator-2', status: 'active', plan: 'creator-monthly' });
    expect(getSubscriptionByCreator(db, 'creator-2')?.subscriptionId).toBe('sub-b');
  });

  it('finds a subscription by its Stripe subscription id', () => {
    createSubscription(db, {
      subscriptionId: 'sub-3', creatorId: 'creator-3', stripeSubscriptionId: 'stripe_sub_123', status: 'active', plan: 'creator-monthly',
    });
    expect(getSubscriptionByStripeSubscriptionId(db, 'stripe_sub_123')?.subscriptionId).toBe('sub-3');
  });

  it('updates status, stripeSubscriptionId, and currentPeriodEnd', () => {
    createSubscription(db, { subscriptionId: 'sub-4', creatorId: 'creator-4', status: 'incomplete', plan: 'creator-monthly' });
    updateSubscription(db, 'sub-4', { stripeSubscriptionId: 'stripe_sub_456', status: 'active', currentPeriodEnd: 999_999 });

    const updated = getSubscriptionByCreator(db, 'creator-4');
    expect(updated?.status).toBe('active');
    expect(updated?.stripeSubscriptionId).toBe('stripe_sub_456');
    expect(updated?.currentPeriodEnd).toBe(999_999);
  });

  it('does nothing when updating a subscription that does not exist', () => {
    expect(() => updateSubscription(db, 'no-such-subscription', { status: 'active' })).not.toThrow();
  });
});
