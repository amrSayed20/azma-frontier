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
 * ─── THE CONTRADICTION, AND THE RULING THAT ENDED IT ────────────────────────
 *
 *   For a few hours the Empire held two of the Founder's own instruments that
 *   said opposite things about the same money.
 *
 *   POLICY: REFUNDS & CREDIT BALANCE v1.0, §4:
 *       «Paid credits purchased by the user do not expire merely because time
 *        has passed.»
 *
 *   BALANCE EXPIRY & CARRY-FORWARD AMENDMENT, 2026-09-27:
 *       الأساس · الارتقاء · الاحتراف — ٢٨ يوماً، وإن لم يشترِ الخالق باقةً
 *       جديدة «يتوقّف المتبقّي عن الاستعمال»؛ والريادة ستّة أشهر ثم يُحذف
 *       ثلث المتبقّي.
 *
 *   Nothing was published while they disagreed, because a Creator must never
 *   be able to reach two Empire promises about their own balance that
 *   contradict each other.
 *
 *   FOUNDER'S RULING, 2026-09-28: «كذلك نعم ألغِ الـ28 يوم». The policy
 *   governs. The pricing layer was changed to match — not the other way round
 *   — and every function that could compute an expiry was deleted rather than
 *   disabled.
 *
 *   The record is kept rather than erased: a rule that governed real money,
 *   even briefly, is part of what the Empire has to be able to account for.
 */
export const EXPIRY_RULE_IN_CONFLICT = {
  policySays: 'Paid credits do not expire merely because time has passed.',
  codeAndArabicPolicySay:
    'كانت: الباقات الثلاث ٢٨ يوماً، والريادة ستّة أشهر ثم يُحذف ثلث المتبقّي. أُلغيت.',
  resolvedBy: 'FOUNDER RULING 2026-09-28 — «كذلك نعم ألغِ الـ28 يوم». The policy governs.' as string | null,
  /** The two instruments agree now, so the policy may be reached by a Creator. */
  MAY_PUBLISH: true as const,
} as const;
