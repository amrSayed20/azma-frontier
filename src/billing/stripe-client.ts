/**
 * AZMA OS — BILLING FOUNDATION
 * The Payment Provider Wrapper
 *
 * The ONE point of contact with the certified payment provider (Stripe).
 * Deliberately isolated behind this single accessor — mirrors
 * src/qiyamah-generation/image-provider.ts's own isolation pattern for
 * the Launch Provider, and the same AI-provider-neutrality-style
 * discipline applied to a payment provider instead.
 */

import Stripe from 'stripe';

let cachedClient: Stripe | null = null;

export function getStripeClient(): Stripe {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured — the payment provider cannot be reached.');
  }
  if (!cachedClient) {
    cachedClient = new Stripe(apiKey);
  }
  return cachedClient;
}

/** Resets the cached client — used only by tests to force re-reading process.env. */
export function resetStripeClientForTests(): void {
  cachedClient = null;
}
