/**
 * AZMA OS — BILLING FOUNDATION
 * Plan Registry
 *
 * A single plan for the First Constitutional Launch — the smallest
 * Launch-Critical billing surface, matching this Package's own Mission
 * ("enable the First Paying Creator to subscribe"), not a multi-tier
 * pricing system. The real Stripe Price id is read from environment
 * configuration, never invented — it does not exist without a real
 * Stripe account, which cannot be provisioned in this environment.
 */

export const LAUNCH_PLAN_ID = 'creator-monthly' as const;

export interface LaunchPlan {
  readonly planId: typeof LAUNCH_PLAN_ID;
  readonly stripePriceId: string;
}

export function getLaunchPlan(): LaunchPlan {
  const stripePriceId = process.env.STRIPE_PRICE_ID_CREATOR_MONTHLY;
  if (!stripePriceId) {
    throw new Error('STRIPE_PRICE_ID_CREATOR_MONTHLY is not configured — no plan exists to check out against.');
  }
  return { planId: LAUNCH_PLAN_ID, stripePriceId };
}
