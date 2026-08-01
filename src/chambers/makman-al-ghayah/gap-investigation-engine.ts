/**
 * AZMA OS — Makman Al-Ghayah
 * SOVEREIGN GAP INVESTIGATION FOUNDATION — Constitutional Foundation Package VIII
 *
 * Pure, deterministic derivation of Knowledge Requirements from a
 * GoalFulfillmentGapReport. No I/O. No side effects. No AI. No external
 * dependencies. No invocation of Al Hujjah.
 *
 * For each classified gap, this engine answers:
 *   "What must the Empire learn to understand this gap?"
 *   "Can this information currently be obtained?"
 *
 * It does NOT answer:
 *   "Why does this gap exist?"
 *   "What should the Creator do?"
 *   "Is the Creator's strategy correct?"
 *
 * AVAILABILITY DERIVATION:
 *
 * EVIDENCE_AVAILABILITY (OBSERVATION_GAP) → OBSERVABLE_INTERNALLY:
 *   The consumption observation system (Package IV) already records events
 *   automatically as publications are accessed. The Empire has the mechanism;
 *   it has simply not yet received events. More observations will arrive
 *   internally as consumption occurs.
 *
 * EVIDENCE_SUFFICIENCY (OBSERVATION_GAP) → REQUIRES_INVESTIGATION:
 *   Observations exist but the CONSUMPTION_ATTEMPT signal class cannot
 *   validate open-form criteria. The Empire needs outcome-specific data
 *   that its current signals cannot supply. External investigation is required.
 *
 * FULFILLMENT_ABSENT (FULFILLMENT_GAP) → REQUIRES_INVESTIGATION:
 *   Evidence contradicts the criterion. Understanding why — and what would
 *   constitute fulfillment — requires knowledge beyond AZMA OS's current
 *   observation capabilities. External investigation is required.
 *
 * NO_ACTIVE_GAP → no requirement produced. The Empire does not fabricate
 *   knowledge requirements for criteria where fulfillment is supported.
 */

import type { GoalFulfillmentGapReport, CriterionFulfillmentGap, FulfillmentGapCategory } from './fulfillment-gap-contracts';
import type {
  KnowledgeRequirement,
  GapKnowledgeRequirementReport,
  KnowledgeAvailability,
} from './gap-investigation-contracts';

function categoryToAvailability(category: FulfillmentGapCategory): KnowledgeAvailability {
  switch (category) {
    case 'EVIDENCE_AVAILABILITY': return 'OBSERVABLE_INTERNALLY';
    case 'EVIDENCE_SUFFICIENCY':  return 'REQUIRES_INVESTIGATION';
    case 'FULFILLMENT_ABSENT':    return 'REQUIRES_INVESTIGATION';
    case 'NO_ACTIVE_GAP':        return 'OBSERVABLE_INTERNALLY'; // unreachable — filtered before call
  }
}

function buildQuestionStatement(gap: CriterionFulfillmentGap): string {
  const desc = gap.criterionDescriptionSnapshot;
  switch (gap.gapCategory) {
    case 'EVIDENCE_AVAILABILITY':
      return `The Empire has no recorded consumption events from which to assess "${desc}". What consumption or signal events have been received for this publication?`;
    case 'EVIDENCE_SUFFICIENCY':
      return `The Empire has ${gap.identifiedAtMs > 0 ? 'some' : 'some'} consumption observations but cannot determine from them whether "${desc}" has been achieved. What specific outcome data would demonstrate this criterion?`;
    case 'FULFILLMENT_ABSENT':
      return `Available evidence supports the conclusion that "${desc}" has not yet been fulfilled. What knowledge is required to understand this gap?`;
    case 'NO_ACTIVE_GAP':
      return ''; // unreachable — filtered before call
  }
}

function deriveOneRequirement(gap: CriterionFulfillmentGap): KnowledgeRequirement {
  return {
    goalId: gap.goalId,
    assessmentId: gap.assessmentId,
    criterionId: gap.criterionId,
    criterionDescriptionSnapshot: gap.criterionDescriptionSnapshot,
    gapClass: gap.gapClass,
    gapCategory: gap.gapCategory,
    questionStatement: buildQuestionStatement(gap),
    availability: categoryToAvailability(gap.gapCategory),
    identifiedAtMs: gap.identifiedAtMs,
  };
}

/**
 * Derive the Knowledge Requirement report from a GoalFulfillmentGapReport.
 * Produces one KnowledgeRequirement per criterion with an active gap.
 * Criteria with NO_ACTIVE_GAP are excluded — no knowledge is required
 * where the gap does not exist.
 *
 * Pure function. Does not persist anything. Does not invoke Al Hujjah.
 * Does not produce recommendations. Does not infer causes.
 */
export function deriveKnowledgeRequirements(
  gapReport: GoalFulfillmentGapReport,
): GapKnowledgeRequirementReport {
  const requirements = gapReport.criterionGaps
    .filter((gap) => gap.gapCategory !== 'NO_ACTIVE_GAP')
    .map(deriveOneRequirement);

  return {
    goalId: gapReport.goalId,
    assessmentId: gapReport.assessmentId,
    derivedAtMs: Date.now(),
    requirements,
  };
}
