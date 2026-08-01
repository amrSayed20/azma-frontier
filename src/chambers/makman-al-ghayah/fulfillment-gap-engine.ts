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
  GapClass,
} from './fulfillment-gap-contracts';

function verdictToGapCategory(verdict: CriterionEvidenceVerdict): FulfillmentGapCategory {
  switch (verdict) {
    case 'ASSESSMENT_NOT_POSSIBLE':  return 'EVIDENCE_AVAILABILITY';
    case 'INSUFFICIENT_EVIDENCE':    return 'EVIDENCE_SUFFICIENCY';
    case 'SUPPORTS_NON_FULFILLMENT': return 'FULFILLMENT_ABSENT';
    case 'SUPPORTS_FULFILLMENT':     return 'NO_ACTIVE_GAP';
  }
}

/**
 * SOVEREIGN GAP CLASSIFICATION FOUNDATION — Constitutional Foundation Package VII.
 * Maps the evidential FulfillmentGapCategory to the constitutional GapClass —
 * the higher-level nature of the Gap.
 *
 * OBSERVATION_GAP: both EVIDENCE_AVAILABILITY and EVIDENCE_SUFFICIENCY share
 *   this class. Both mean "the Empire lacks enough to judge." The distinction
 *   between them (no observations vs. insufficient observations) is preserved
 *   in gapCategory; gapClass names their shared constitutional nature.
 *
 * FULFILLMENT_GAP: FULFILLMENT_ABSENT — evidence contradicts fulfillment.
 *   The sub-nature (business/creative/distribution/strategic weakness) is
 *   unknown until Investigation (future package). gapClass names only
 *   the constitutional nature; it does not invent a sub-cause.
 *
 * NO_ACTIVE_GAP: no gap to classify.
 */
function categoryToGapClass(category: FulfillmentGapCategory): GapClass {
  switch (category) {
    case 'EVIDENCE_AVAILABILITY': return 'OBSERVATION_GAP';
    case 'EVIDENCE_SUFFICIENCY':  return 'OBSERVATION_GAP';
    case 'FULFILLMENT_ABSENT':    return 'FULFILLMENT_GAP';
    case 'NO_ACTIVE_GAP':        return 'NO_ACTIVE_GAP';
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
  const gapClass = categoryToGapClass(gapCategory);
  return {
    goalId,
    assessmentId,
    criterionId: ca.criterionId,
    criterionDescriptionSnapshot: ca.criterionDescriptionSnapshot,
    evidenceVerdict: ca.evidenceVerdict,
    gapCategory,
    gapClass,
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
