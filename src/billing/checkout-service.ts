/**
 * AZMA OS — BILLING FOUNDATION
 * Checkout Session Creation
 *
 * Creates (or reuses) a Stripe Customer for the Creator, ensures a
 * local subscription record exists, and creates a real Stripe Checkout
 * Session. This requires a live Stripe API call — genuinely untestable
 * end-to-end in this environment (no STRIPE_SECRET_KEY configured),
 * same disclosed limitation as Qiyamah's OpenAI integration. Unit
 * tests mock the Stripe client to verify this module's own
 * orchestration logic.
 */

import { randomUUID } from 'crypto';
import { getStripeClient } from './stripe-client';
import { getLaunchPlan } from './plans';
import { getDb, getSubscriptionByCreator, createSubscription } from '../persistent-storage';

export interface CheckoutResult {
  readonly checkoutUrl: string;
}

export async function createCheckoutSession(creatorId: string, successUrl: string, cancelUrl: string): Promise<CheckoutResult> {
  const db = getDb();
  const plan = getLaunchPlan();
  const stripe = getStripeClient();

  let subscription = getSubscriptionByCreator(db, creatorId);
  let stripeCustomerId = subscription?.stripeCustomerId ?? null;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({ metadata: { creatorId } });
    stripeCustomerId = customer.id;
  }

  if (!subscription || subscription.status === 'canceled') {
    subscription = createSubscription(db, {
      subscriptionId: randomUUID(),
      creatorId,
      stripeCustomerId,
      status: 'incomplete',
      plan: plan.planId,
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,
    mode: 'subscription',
    line_items: [{ price: plan.stripePriceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { creatorId, subscriptionRecordId: subscription.subscriptionId },
  });

  if (!session.url) {
    throw new Error('The payment provider did not return a checkout URL.');
  }

  return { checkoutUrl: session.url };
}
