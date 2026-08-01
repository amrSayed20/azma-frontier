/**
 * AZMA OS — Makman Al-Ghayah
 * SOVEREIGN FULFILLMENT GAP FOUNDATION — Constitutional Foundation Package VI
 *
 * A Fulfillment Gap is the truthful constitutional description of the
 * unresolved distance between a Creator-defined Success Criterion and what
 * the available evidence currently supports.
 *
 * CONSTITUTIONAL DISTINCTION — two fundamentally different kinds of absence:
 *
 *   REALITY GAP: evidence actively indicates the outcome has not happened.
 *     Represented as FULFILLMENT_ABSENT.
 *
 *   KNOWLEDGE/OBSERVABILITY GAP: the Empire does not possess enough evidence
 *     to know whether the outcome happened. Represented as:
 *     - EVIDENCE_AVAILABILITY (no observations exist to reason from), and
 *     - EVIDENCE_SUFFICIENCY (observations exist, but the signal class cannot
 *       validate this open-form criterion).
 *
 * These MUST NOT be conflated. The Empire must never tell the Creator
 * "Your goal has not succeeded" when the truth is "We do not yet possess
 * evidence capable of determining this."
 *
 * NO CAUSATION: The Gap names what remains unresolved. It does not diagnose
 * why it is unresolved. Causal analysis belongs to future packages that have
 * supporting evidence to reason from.
 *
 * NOT PERSISTED SEPARATELY: The Gap is deterministically derivable from an
 * immutable GoalFulfillmentAssessment. Since assessments are already persisted
 * as immutable historical records, a separate Gap table would duplicate data
 * without adding historical truth. Gaps are derived on demand from the
 * persisted assessment.
 */

import type { CriterionEvidenceVerdict } from './fulfillment-assessment-contracts';

/**
 * The constitutional category of what remains absent between a Success
 * Criterion and the current state of evidence.
 *
 * EVIDENCE_AVAILABILITY: The Empire has no observations for this criterion.
 *   This is a KNOWLEDGE/OBSERVABILITY GAP — the Empire does not know because
 *   it has not seen. It must never be presented as evidence of failure.
 *
 * EVIDENCE_SUFFICIENCY: The Empire has observations, but the available signal
 *   class (CONSUMPTION_ATTEMPT) cannot validate this open-form criterion.
 *   This is also a KNOWLEDGE GAP — the Empire has seen activity but cannot
 *   conclude from it whether the criterion has been satisfied.
 *
 * FULFILLMENT_ABSENT: Available evidence actively supports the conclusion
 *   that the criterion has not been fulfilled. This is a REALITY GAP.
 *
 * NO_ACTIVE_GAP: Available evidence supports fulfillment. No gap exists to
 *   name. gapStatement is null — the Empire does not fabricate a gap.
 */
export type FulfillmentGapCategory =
  | 'EVIDENCE_AVAILABILITY'
  | 'EVIDENCE_SUFFICIENCY'
  | 'FULFILLMENT_ABSENT'
  | 'NO_ACTIVE_GAP';

/**
 * The Empire's statement of what remains unproven, contradicted, or unresolved
 * relative to one Creator-defined Success Criterion.
 *
 * Derived deterministically from an immutable CriterionAssessment. Not
 * persisted separately — the source GoalFulfillmentAssessment is immutable
 * and already persisted; the Gap is a pure function of that record.
 *
 * `criterionDescriptionSnapshot` is carried forward from the source assessment,
 * preserving the exact wording the Creator stated when the assessment was drawn.
 * If the Creator later replaces their criteria, the gap still reflects the
 * criterion text that was active at assessment time.
 *
 * `gapStatement` is null when gapCategory is NO_ACTIVE_GAP. The Empire does
 * not manufacture a statement of absence where evidence supports fulfillment.
 *
 * No causal reasoning: the gapStatement names what is absent, never why.
 */
export interface CriterionFulfillmentGap {
  readonly goalId: string;
  readonly assessmentId: string;
  readonly criterionId: string;
  readonly criterionDescriptionSnapshot: string;
  readonly evidenceVerdict: CriterionEvidenceVerdict;
  readonly gapCategory: FulfillmentGapCategory;
  readonly gapStatement: string | null;
  readonly identifiedAtMs: number;
}

/**
 * The complete Fulfillment Gap report for one Milestone Goal, derived from
 * one GoalFulfillmentAssessment. Contains one CriterionFulfillmentGap per
 * Success Criterion. Empty when the assessment had no criteria defined.
 */
export interface GoalFulfillmentGapReport {
  readonly goalId: string;
  readonly assessmentId: string;
  readonly derivedAtMs: number;
  readonly criterionGaps: readonly CriterionFulfillmentGap[];
}
