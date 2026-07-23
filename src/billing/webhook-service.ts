/**
 * AZMA OS — BILLING FOUNDATION
 * Webhook Processing
 *
 * Signature verification is pure, local HMAC computation against
 * STRIPE_WEBHOOK_SECRET (Stripe.webhooks.constructEvent) — it requires
 * no live API key and no network call, so unlike Checkout Session
 * creation, this is genuinely, fully testable offline in this
 * environment (verified against Stripe's own test-signing helper).
 *
 * Handles exactly the 4 events this Foundation's own scope names:
 * checkout completion, subscription updates, subscription deletion, and
 * payment failure. Every other event type is intentionally ignored,
 * disclosed rather than silently mishandled.
 */

import Stripe from 'stripe';
import { getDb, getSubscriptionByStripeSubscriptionId, updateSubscription } from '../persistent-storage';
import type { SubscriptionStatus } from '../persistent-storage';

export function verifyWebhookSignature(rawBody: string, signatureHeader: string): Stripe.Event {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured — webhook signatures cannot be verified.');
  }
  return Stripe.webhooks.constructEvent(rawBody, signatureHeader, webhookSecret);
}

function extractSubscriptionId(value: string | Stripe.Subscription | null | undefined): string | null {
  if (!value) return null;
  return typeof value === 'string' ? value : value.id;
}

function mapStripeSubscriptionStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    case 'canceled':
    case 'incomplete_expired':
      return 'canceled';
    default:
      return 'incomplete';
  }
}

export function handleWebhookEvent(event: Stripe.Event): void {
  const db = getDb();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const subscriptionRecordId = session.metadata?.subscriptionRecordId;
      const stripeSubscriptionId = extractSubscriptionId(session.subscription);
      if (subscriptionRecordId && stripeSubscriptionId) {
        updateSubscription(db, subscriptionRecordId, { stripeSubscriptionId, status: 'active' });
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const record = getSubscriptionByStripeSubscriptionId(db, subscription.id);
      if (record) {
        const currentPeriodEnd = subscription.items.data[0]?.current_period_end ?? null;
        updateSubscription(db, record.subscriptionId, {
          status: mapStripeSubscriptionStatus(subscription.status),
          currentPeriodEnd: currentPeriodEnd ? currentPeriodEnd * 1000 : null,
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const record = getSubscriptionByStripeSubscriptionId(db, subscription.id);
      if (record) {
        updateSubscription(db, record.subscriptionId, { status: 'canceled' });
      }
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeSubscriptionId = extractSubscriptionId(invoice.parent?.subscription_details?.subscription ?? null);
      if (stripeSubscriptionId) {
        const record = getSubscriptionByStripeSubscriptionId(db, stripeSubscriptionId);
        if (record) {
          updateSubscription(db, record.subscriptionId, { status: 'past_due' });
        }
      }
      break;
    }

    default:
      break;
  }
}
