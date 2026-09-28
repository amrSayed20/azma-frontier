/**
 * AZMA OS — the Empire's published policies.
 *
 * ─── WHY THIS REGISTRY EXISTS AT ALL ────────────────────────────────────────
 *
 *   MEASURED 2026-09-28: the release artifact is
 *
 *       tar … .next package.json package-lock.json
 *
 *   `docs/` never travels. So the seven policy documents written in September
 *   — Terms, Acceptable Use, Refund & Replacement, Privacy, AI Content, the
 *   Sovereign Value Balance, Account & Suspension — exist in git and on a
 *   laptop, and not one of them can be served to a single Creator. XPay asks
 *   for public policy URLs before it will take a pound, and the Empire had
 *   none, while believing it had seven.
 *
 *   A policy nobody can read is not a policy. What is registered here is
 *   compiled into the build and therefore reachable; what is only in `docs/`
 *   is a manuscript.
 *
 *   The six Arabic documents are NOT registered yet — moving a legal text is
 *   not a copy-paste, and each needs the Founder's word on whether the version
 *   in `docs/` is the one that governs. They are named in
 *   `POLICIES_NOT_YET_PUBLISHABLE` so the gap is counted rather than forgotten.
 */

import type { PolicyDocument } from './types';
import { REFUNDS_AND_CREDIT_BALANCE } from './refunds-and-credit-balance';

export type { PolicyDocument, PolicyLanguage } from './types';

export const PUBLISHED_POLICIES: readonly PolicyDocument[] = [
  REFUNDS_AND_CREDIT_BALANCE,
];

export function policyBySlug(slug: string): PolicyDocument | undefined {
  return PUBLISHED_POLICIES.find((p) => p.slug === slug);
}

/**
 * Written in September, ratified by nobody, and unreachable by everybody.
 *
 * Counted here so the distance between «we have policies» and «a Creator can
 * read them» is a number rather than an impression.
 */
export const POLICIES_NOT_YET_PUBLISHABLE: readonly string[] = [
  'docs/policies/TERMS_AND_CONDITIONS.md',
  'docs/policies/ACCEPTABLE_USE_POLICY.md',
  'docs/policies/REFUND_AND_REPLACEMENT_POLICY.md',
  'docs/policies/PRIVACY_POLICY.md',
  'docs/policies/AI_CONTENT_POLICY.md',
  'docs/policies/SOVEREIGN_VALUE_BALANCE_POLICY.md',
  'docs/policies/ACCOUNT_AND_SUSPENSION_POLICY.md',
];

/**
 * ─── THE ONE CONTRADICTION THAT MUST NOT BE PUBLISHED TWICE ──────────────────
 *
 *   The Founder's Refunds & Credit Balance policy, §4:
 *
 *       «Paid credits purchased by the user do not expire merely because time
 *        has passed … the balance remains in the account and does not lapse»
 *
 *   The Founder's own BALANCE EXPIRY & CARRY-FORWARD AMENDMENT, in force in
 *   `src/economy/pricing/sovereign-value-balance.ts` and on the live Balance
 *   surface:
 *
 *       الأساس · الارتقاء · الاحتراف — صلاحية ٢٨ يوماً، وإن لم يشترِ الخالق
 *       باقةً جديدة «يتوقّف المتبقّي عن الاستعمال ولا يعود إليه مال»
 *       الريادة — ستّة أشهر، ثم يُحذف ثلث المتبقّي
 *
 *   Both are his. They cannot both be true of the same money, and publishing
 *   both would have the Empire promising a Creator two opposite things about
 *   their own balance — which is the one thing pricing honesty cannot survive.
 *
 *   So this flag exists, and it is what the Balance surface reads before it
 *   links to the policy. Nothing is deleted and nothing is decided here: the
 *   contradiction is held visible until the Founder says which instrument
 *   governs.
 */
export const EXPIRY_RULE_IN_CONFLICT = {
  policySays: 'Paid credits do not expire merely because time has passed.',
  codeAndArabicPolicySay:
    'الباقات الثلاث العادية صلاحيتها ٢٨ يوماً، والريادة ستّة أشهر ثم يُحذف ثلث المتبقّي.',
  resolvedBy: null as string | null,
  /** While false, no creator-facing surface links to the Refunds policy. */
  MAY_PUBLISH: false as const,
} as const;
