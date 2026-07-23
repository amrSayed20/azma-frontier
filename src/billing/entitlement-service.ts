/**
 * AZMA OS — BILLING FOUNDATION
 * Entitlement Verification
 *
 * The gate the generation capability now checks before running. Founder
 * accounts always pass (per the Authentication Foundation's own
 * Founder-is-a-role design — Founders never need to pay). Creator
 * accounts require an active subscription record. Payment failure
 * (invoice.payment_failed) sets a subscription to 'past_due' via
 * webhook-service.ts, which naturally fails this check — no separate
 * revocation logic is needed.
 */

import { getDb, getSubscriptionByCreator } from '../persistent-storage';
import type { CreatorRole } from '../authentication';

export function hasActiveEntitlement(creatorId: string, role: CreatorRole): boolean {
  if (role === 'founder') return true;

  const subscription = getSubscriptionByCreator(getDb(), creatorId);
  return subscription?.status === 'active';
}
