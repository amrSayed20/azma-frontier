/**
 * AZMA OS — BILLING FOUNDATION
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Execution Package IV. Real Stripe subscriptions on top of the
 * Authentication and Persistent Storage Foundations. See
 * checkout-service.ts and webhook-service.ts for what could and could
 * not be exercised against a live provider in this environment.
 */

export { getStripeClient, resetStripeClientForTests } from './stripe-client';
export { LAUNCH_PLAN_ID, getLaunchPlan } from './plans';
export type { LaunchPlan } from './plans';
export { createCheckoutSession } from './checkout-service';
export type { CheckoutResult } from './checkout-service';
export { verifyWebhookSignature, handleWebhookEvent } from './webhook-service';
export { hasActiveEntitlement } from './entitlement-service';
