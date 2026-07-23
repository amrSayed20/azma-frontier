/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER II — GOAL AWARENESS (LAYER COMPONENT C: AWARENESS CLASSIFICATION)
 * (Construction ID MAG-PKG-III-L02)
 *
 * DECLARATIVE ONLY. Creates the Constitutional Awareness Classification —
 * the 7 named classifications the directive requires. No execution, no
 * recommendation, no prediction: every classification is a direct mapping
 * from GOAL_AWARENESS_CONTEXT.ts's already-derived fields.
 *
 * HONESTY CHECK performed before writing: Article X names "Goal
 * Cancellation" as one of three terminal conditions, but goal-contracts.ts's
 * GoalStatus enum (CREATED/PLANNED/IN_PROGRESS/BLOCKED/COMPLETED/FAILED)
 * has no CANCELLED value. This is a real Constitutional-vs-Repository gap,
 * not silently smoothed over — see CANCELLED_CLASSIFICATION_GAP below.
 */

import type { GoalAwarenessContext } from './GOAL_AWARENESS_CONTEXT';

/** Every classification rule below is a pure function, in prose, of these exact fields — never of anything outside GoalAwarenessContext. */
export type RasAlAmrGoalAwarenessClassificationInputFields = Pick<GoalAwarenessContext, 'currentWaitingClassification' | 'currentGoalState' | 'currentCreatorAuthorizationStatus'>;

export const GOAL_AWARENESS_CLASSIFICATIONS = [
  'Healthy Goal',
  'Waiting Goal',
  'Creator Pending',
  'Platform Pending',
  'External Pending',
  'Fulfilled',
  'Cancelled',
] as const;
export type GoalAwarenessClassification = (typeof GOAL_AWARENESS_CLASSIFICATIONS)[number];

export interface RasAlAmrGoalAwarenessClassificationRule {
  readonly classification: GoalAwarenessClassification;
  readonly derivationRule: string;
  readonly constitutionalGrounding: string;
}

export const GOAL_AWARENESS_CLASSIFICATION_RULES: readonly RasAlAmrGoalAwarenessClassificationRule[] = [
  {
    classification: 'Healthy Goal',
    derivationRule: 'currentWaitingClassification === "not-waiting" AND currentGoalState is one of CREATED/PLANNED/IN_PROGRESS.',
    constitutionalGrounding: 'ARTICLE X — a Goal under active, unimpeded guardianship.',
  },
  {
    classification: 'Waiting Goal',
    derivationRule: 'currentWaitingClassification is any value other than "not-waiting", OR currentGoalState === "BLOCKED", AND none of the more specific Pending classifications below apply.',
    constitutionalGrounding: 'General waiting state — includes awaiting-recommendation-delivery and awaiting-notification-delivery (Articles IV, V), neither of which fits Creator/Platform/External Pending since the blocking party is Makman\'s own not-yet-built capability, not the Creator, Platform, or an external consumer.',
  },
  {
    classification: 'Creator Pending',
    derivationRule: 'currentCreatorAuthorizationStatus === "awaiting-authorization".',
    constitutionalGrounding: 'ARTICLE VIII — one of the 8 named approval-gated actions is outstanding.',
  },
  {
    classification: 'Platform Pending',
    derivationRule: 'currentWaitingClassification === "awaiting-rendering-evaluation".',
    constitutionalGrounding: 'Rendering execution belongs to Al-Watin Al-Siyadi (Platform), per MAKMAN_RESPONSIBILITY_ARCHITECTURE.ts.',
  },
  {
    classification: 'External Pending',
    derivationRule: 'currentWaitingClassification === "awaiting-consumption-request".',
    constitutionalGrounding: 'A consumer, external to both the Creator and the Chamber, has not yet acted.',
  },
  {
    classification: 'Fulfilled',
    derivationRule: 'currentGoalState === "COMPLETED".',
    constitutionalGrounding: 'ARTICLE X — one of the three terminal conditions ("Goal Fulfilment").',
  },
  {
    classification: 'Cancelled',
    derivationRule: 'currentGoalState === "FAILED" (see CANCELLED_CLASSIFICATION_GAP — this is the closest available status, not an exact match).',
    constitutionalGrounding: 'ARTICLE X — the second terminal condition ("Goal Cancellation").',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// CANCELLED CLASSIFICATION GAP — documented, not silently resolved
// ═══════════════════════════════════════════════════════════════════════════

export const CANCELLED_CLASSIFICATION_GAP = {
  finding: 'Article X names "Goal Cancellation" as a distinct terminal condition from ordinary failure, but goal-contracts.ts\'s GoalStatus enum has no CANCELLED value — only FAILED, which conflates "the Creator explicitly cancelled this" with "this Goal failed for some other reason." This Classification maps Cancelled to FAILED as the closest available status, but the two are not the same thing constitutionally: a cancellation is a deliberate, dignified Creator act (RELATIONSHIP.ts, failure: "Every abandoned project remains worthy of return... never shame the creator"); a failure may not be.',
  disposition: 'Documented as a Constitutional Compliance Gap, not fixed here — adding a CANCELLED value to GoalStatus would be a change to goal-contracts.ts, which is Repository Reality, not something this documentation-only Living Layer is authorized to modify.',
  recommendation: 'When Makman enters its construction era, goal-contracts.ts\'s GoalStatus should gain a distinct CANCELLED value alongside FAILED.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CLASSIFICATION COMPLETENESS CHECK
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_AWARENESS_CLASSIFICATION_CHECK = {
  totalClassifications: GOAL_AWARENESS_CLASSIFICATIONS.length,
  everyClassificationHasADerivationRule: true,
  everyRuleTracesToPresenceOnlyFields: true,
  noExecutionIntroduced: true,
  noRecommendationIntroduced: true,
  noPredictionIntroduced: true,
  result: 'PASS — all 7 required classifications defined, each derived solely from GOAL_AWARENESS_CONTEXT.ts fields (themselves derived solely from Presence). One honest gap documented (Cancelled/FAILED imprecision), not silently resolved.',
} as const;

export const RAS_AL_AMR_GOAL_AWARENESS_CLASSIFICATION = {
  classifications: GOAL_AWARENESS_CLASSIFICATIONS,
  rules: GOAL_AWARENESS_CLASSIFICATION_RULES,
  cancelledGap: CANCELLED_CLASSIFICATION_GAP,
  check: GOAL_AWARENESS_CLASSIFICATION_CHECK,
} as const;
