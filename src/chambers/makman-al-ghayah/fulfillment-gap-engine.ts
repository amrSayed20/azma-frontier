/**
 * AZMA OS — Makman Al-Ghayah
 * SOVEREIGN FULFILLMENT GAP FOUNDATION — Constitutional Foundation Package VI
 *
 * Pure, deterministic Gap derivation from an immutable GoalFulfillmentAssessment.
 * No I/O. No side effects. No AI. No external dependencies.
 *
 * CAUSALITY BOUNDARY: gap statements describe what is absent, never why it
 * is absent. No diagnosis, no recommendation, no speculative causal claim.
 * Example of what is permitted: "The Empire has no observations from which
 * to assess whether '100 qualified leads' has been fulfilled."
 * Example of what is forbidden: "Your campaign failed because the targeting
 * was wrong." The latter requires evidence Makman does not possess.
 *
 * DISTINCTION PRESERVED: EVIDENCE_AVAILABILITY and EVIDENCE_SUFFICIENCY are
 * knowledge/observability gaps — the Empire has not seen enough. FULFILLMENT_ABSENT
 * is a reality gap — evidence contradicts the criterion. These two categories
 * of absence must remain distinguishable to all future consumers.
 */

import type {
  GoalFulfillmentAssessment,
  CriterionAssessment,
  CriterionEvidenceVerdict,
} from './fulfillment-assessment-contracts';
import type {
  CriterionFulfillmentGap,
  GoalFulfillmentGapReport,
  FulfillmentGapCategory,
} from './fulfillment-gap-contracts';

function verdictToGapCategory(verdict: CriterionEvidenceVerdict): FulfillmentGapCategory {
  switch (verdict) {
    case 'ASSESSMENT_NOT_POSSIBLE':  return 'EVIDENCE_AVAILABILITY';
    case 'INSUFFICIENT_EVIDENCE':    return 'EVIDENCE_SUFFICIENCY';
    case 'SUPPORTS_NON_FULFILLMENT': return 'FULFILLMENT_ABSENT';
    case 'SUPPORTS_FULFILLMENT':     return 'NO_ACTIVE_GAP';
  }
}

function buildGapStatement(
  category: FulfillmentGapCategory,
  description: string,
  observationCount: number,
): string | null {
  switch (category) {
    case 'EVIDENCE_AVAILABILITY':
      return `The Empire has no observations from which to assess whether "${description}" has been fulfilled.`;
    case 'EVIDENCE_SUFFICIENCY':
      return `The Empire has ${observationCount} consumption observation${observationCount === 1 ? '' : 's'}, but this signal class cannot determine whether "${description}" has been achieved.`;
    case 'FULFILLMENT_ABSENT':
      return `Available evidence supports the conclusion that "${description}" has not yet been fulfilled.`;
    case 'NO_ACTIVE_GAP':
      return null;
  }
}

function deriveOneCriterionGap(
  ca: CriterionAssessment,
  goalId: string,
  assessmentId: string,
): CriterionFulfillmentGap {
  const gapCategory = verdictToGapCategory(ca.evidenceVerdict);
  return {
    goalId,
    assessmentId,
    criterionId: ca.criterionId,
    criterionDescriptionSnapshot: ca.criterionDescriptionSnapshot,
    evidenceVerdict: ca.evidenceVerdict,
    gapCategory,
    gapStatement: buildGapStatement(gapCategory, ca.criterionDescriptionSnapshot, ca.observationCount),
    identifiedAtMs: ca.assessedAtMs,
  };
}

/**
 * Derive the Fulfillment Gap report from an immutable GoalFulfillmentAssessment.
 * Returns one CriterionFulfillmentGap per criterion in the assessment.
 * Returns an empty criterionGaps array when the assessment had no criteria.
 *
 * This is a pure function — same assessment in, same report structure out.
 * It does not persist anything; the caller persisted the source assessment.
 */
export function deriveGapReport(assessment: GoalFulfillmentAssessment): GoalFulfillmentGapReport {
  return {
    goalId: assessment.goalId,
    assessmentId: assessment.assessmentId,
    derivedAtMs: Date.now(),
    criterionGaps: assessment.criterionAssessments.map((ca) =>
      deriveOneCriterionGap(ca, assessment.goalId, assessment.assessmentId),
    ),
  };
}
