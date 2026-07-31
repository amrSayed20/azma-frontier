/**
 * AZMA OS — Makman Al-Ghayah
 * FULFILLMENT ASSESSMENT FOUNDATION — Constitutional Foundation Package V
 *
 * A Fulfillment Assessment is a reasoned conclusion about whether available
 * evidence demonstrates progress toward or satisfaction of a Success Criterion.
 *
 * It is constitutionally distinct from:
 *   - GoalStatus.COMPLETED: operational production completion
 *   - SuccessCriterion: Creator-declared intended observable outcome
 *   - ObservationRecord: recorded evidence of reality
 *
 * EVIDENCE LAW — permanently binding:
 * Absence of evidence is NOT evidence of failure.
 * The Empire currently observes only CONSUMPTION_ATTEMPT → AUTHORIZED|DENIED.
 * This signal class cannot validate arbitrary open-form Creator criteria.
 * The architecture is capable of all four verdicts; current evidence constrains
 * which can be honestly issued. No verdict is manufactured without proof.
 *
 * HISTORICAL TRUTH — permanently binding:
 * An assessment snapshots the exact criterion description at assessment time.
 * If the Creator later replaces their criteria list, this assessment still
 * reflects what was true when it was drawn. Past assessments are immutable.
 *
 * CREATOR AUTHORITY — permanently binding:
 * The Empire may assess evidence. It may never redefine the Creator's
 * Success Criterion or silently declare a different outcome "good enough."
 */

/**
 * The four honest evidence verdicts the Empire can issue.
 * Ordered from least certain (most conservative) to most certain.
 * ASSESSMENT_NOT_POSSIBLE: no observations exist, or no Success Criteria defined.
 * INSUFFICIENT_EVIDENCE: observations exist but cannot validate this criterion.
 * SUPPORTS_NON_FULFILLMENT: evidence actively contradicts the criterion.
 * SUPPORTS_FULFILLMENT: evidence actively supports the criterion.
 */
export type CriterionEvidenceVerdict =
  | 'ASSESSMENT_NOT_POSSIBLE'
  | 'INSUFFICIENT_EVIDENCE'
  | 'SUPPORTS_NON_FULFILLMENT'
  | 'SUPPORTS_FULFILLMENT';

/**
 * The Empire's assessment of one SuccessCriterion against available evidence.
 * `criterionDescriptionSnapshot` preserves the exact criterion wording at
 * assessment time — if the Creator later replaces their criteria, this
 * snapshot retains historical truth without requiring a version-history system.
 */
export interface CriterionAssessment {
  readonly criterionId: string;
  readonly criterionDescriptionSnapshot: string;
  readonly evidenceVerdict: CriterionEvidenceVerdict;
  readonly observationCount: number;
  readonly authorizedCount: number;
  readonly deniedCount: number;
  readonly assessedAtMs: number;
}

/**
 * The Empire's assessment of all Success Criteria for one Milestone Goal.
 * `overallVerdict` is the most conservative across all criterion assessments —
 * the weakest individual link defines the collective conclusion.
 * `criterionAssessments` is empty if the Goal has no defined Success Criteria.
 */
export interface GoalFulfillmentAssessment {
  readonly assessmentId: string;
  readonly goalId: string;
  readonly assessedAtMs: number;
  readonly overallVerdict: CriterionEvidenceVerdict;
  readonly criterionAssessments: readonly CriterionAssessment[];
}

/**
 * Chamber-declared contract for persisting and retrieving Fulfillment Assessments.
 * persistent-storage/ implements this interface; the chamber never imports
 * from persistent-storage/ directly — the interface-inversion pattern.
 *
 * Assessments are persisted because they represent historical conclusions:
 * future evidence or criteria changes should not silently alter past judgments.
 */
export interface IFulfillmentAssessmentStore {
  save(assessment: GoalFulfillmentAssessment, creatorId: string): void;
  findLatestForGoal(goalId: string, creatorId: string): GoalFulfillmentAssessment | null;
  listForGoal(goalId: string, creatorId: string): readonly GoalFulfillmentAssessment[];
}
