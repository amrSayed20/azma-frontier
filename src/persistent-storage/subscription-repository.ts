/**
 * AZMA OS — PERSISTENT STORAGE FOUNDATION
 * Subscription Records
 *
 * Added by the Billing Foundation (Execution Package IV) — a new table,
 * touching neither creators, sessions, generation_records, nor
 * vault_assets. stripe_customer_id lives here rather than on the
 * creators table, so nothing built by the Authentication Foundation
 * needed to change.
 */

import type { DatabaseSync } from 'node:sqlite';

export type SubscriptionStatus = 'incomplete' | 'active' | 'past_due' | 'canceled';

export interface SubscriptionRecord {
  readonly subscriptionId: string;
  readonly creatorId: string;
  readonly stripeCustomerId: string | null;
  readonly stripeSubscriptionId: string | null;
  readonly status: SubscriptionStatus;
  readonly plan: string;
  readonly currentPeriodEnd: number | null;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface NewSubscription {
  readonly subscriptionId: string;
  readonly creatorId: string;
  readonly stripeCustomerId?: string | null;
  readonly stripeSubscriptionId?: string | null;
  readonly status: SubscriptionStatus;
  readonly plan: string;
  readonly currentPeriodEnd?: number | null;
}

export interface SubscriptionPatch {
  readonly stripeSubscriptionId?: string | null;
  readonly status?: SubscriptionStatus;
  readonly currentPeriodEnd?: number | null;
}

function rowToSubscription(row: Record<string, unknown>): SubscriptionRecord {
  return {
    subscriptionId: row.subscription_id as string,
    creatorId: row.creator_id as string,
    stripeCustomerId: (row.stripe_customer_id as string | null) ?? null,
    stripeSubscriptionId: (row.stripe_subscription_id as string | null) ?? null,
    status: row.status as SubscriptionStatus,
    plan: row.plan as string,
    currentPeriodEnd: (row.current_period_end as number | null) ?? null,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}

export function createSubscription(db: DatabaseSync, subscription: NewSubscription): SubscriptionRecord {
  const now = Date.now();
  const stripeCustomerId = subscription.stripeCustomerId ?? null;
  const stripeSubscriptionId = subscription.stripeSubscriptionId ?? null;
  const currentPeriodEnd = subscription.currentPeriodEnd ?? null;

  db.prepare(
    `INSERT INTO subscriptions
      (subscription_id, creator_id, stripe_customer_id, stripe_subscription_id, status, plan, current_period_end, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(subscription.subscriptionId, subscription.creatorId, stripeCustomerId, stripeSubscriptionId, subscription.status, subscription.plan, currentPeriodEnd, now, now);

  return {
    subscriptionId: subscription.subscriptionId,
    creatorId: subscription.creatorId,
    stripeCustomerId,
    stripeSubscriptionId,
    status: subscription.status,
    plan: subscription.plan,
    currentPeriodEnd,
    createdAt: now,
    updatedAt: now,
  };
}

/** The most recently created subscription for a Creator — sufficient for a single-plan Launch Foundation. */
export function getSubscriptionByCreator(db: DatabaseSync, creatorId: string): SubscriptionRecord | null {
  const row = db
    .prepare(
      `SELECT subscription_id, creator_id, stripe_customer_id, stripe_subscription_id, status, plan, current_period_end, created_at, updated_at
       FROM subscriptions WHERE creator_id = ? ORDER BY created_at DESC, rowid DESC LIMIT 1`,
    )
    .get(creatorId);
  return row ? rowToSubscription(row) : null;
}

export function getSubscriptionByStripeSubscriptionId(db: DatabaseSync, stripeSubscriptionId: string): SubscriptionRecord | null {
  const row = db
    .prepare(
      `SELECT subscription_id, creator_id, stripe_customer_id, stripe_subscription_id, status, plan, current_period_end, created_at, updated_at
       FROM subscriptions WHERE stripe_subscription_id = ?`,
    )
    .get(stripeSubscriptionId);
  return row ? rowToSubscription(row) : null;
}

export function updateSubscription(db: DatabaseSync, subscriptionId: string, patch: SubscriptionPatch): void {
  const current = db.prepare('SELECT * FROM subscriptions WHERE subscription_id = ?').get(subscriptionId);
  if (!current) return;

  const stripeSubscriptionId = patch.stripeSubscriptionId ?? (current.stripe_subscription_id as string | null);
  const status = patch.status ?? (current.status as SubscriptionStatus);
  const currentPeriodEnd = patch.currentPeriodEnd ?? (current.current_period_end as number | null);

  db.prepare(
    'UPDATE subscriptions SET stripe_subscription_id = ?, status = ?, current_period_end = ?, updated_at = ? WHERE subscription_id = ?',
  ).run(stripeSubscriptionId, status, currentPeriodEnd, Date.now(), subscriptionId);
}
