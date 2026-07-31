/**
 * AZMA OS — Makman Al-Ghayah
 * FULFILLMENT ASSESSMENT FOUNDATION — Constitutional Foundation Package V
 *
 * Pure, deterministic assessment computation. No I/O. No side effects.
 * No AI. No external dependencies. Takes what the Empire actually has
 * (criteria + observations) and returns only what the evidence honestly supports.
 *
 * CURRENT EVIDENCE BOUNDARY:
 * The only signal class available is CONSUMPTION_ATTEMPT → AUTHORIZED|DENIED.
 * Because Success Criteria are open-form text ("Generate 100 qualified sales
 * leads", "Reach a new market segment", etc.), the Empire cannot parse them
 * semantically and cannot map consumption access events to arbitrary outcomes.
 *
 * Consequently, for all current criteria:
 *   - Zero observations → ASSESSMENT_NOT_POSSIBLE (nothing to reason from)
 *   - Observations exist → INSUFFICIENT_EVIDENCE (signal class ≠ criterion class)
 *
 * The four-verdict type system is fully present and capable of expressing
 * SUPPORTS_FULFILLMENT and SUPPORTS_NON_FULFILLMENT; future signal types
 * (purchase confirmation, audience demographics, revenue events) will enable
 * the engine to issue those verdicts without changing the type system.
 */

import type { GoalContract, SuccessCriterion } from './goal-contracts';
import type { ObservationRecord } from './observation-contracts';
import type {
  GoalFulfillmentAssessment,
  CriterionAssessment,
  CriterionEvidenceVerdict,
} from './fulfillment-assessment-contracts';

let assessmentCounter = 0;
function generateAssessmentId(timestampMs: number): string {
  assessmentCounter += 1;
  return `fa-${timestampMs}-${assessmentCounter}`;
}

/**
 * Severity map for deriving the most conservative overall verdict.
 * Lower number = more conservative = weaker claim about fulfillment.
 */
const VERDICT_SEVERITY: Record<CriterionEvidenceVerdict, number> = {
  'ASSESSMENT_NOT_POSSIBLE': 0,
  'INSUFFICIENT_EVIDENCE': 1,
  'SUPPORTS_NON_FULFILLMENT': 2,
  'SUPPORTS_FULFILLMENT': 3,
};

function mostConservativeVerdict(verdicts: readonly CriterionEvidenceVerdict[]): CriterionEvidenceVerdict {
  if (verdicts.length === 0) return 'ASSESSMENT_NOT_POSSIBLE';
  return verdicts.reduce((current, next) =>
    VERDICT_SEVERITY[next] < VERDICT_SEVERITY[current] ? next : current,
  'SUPPORTS_FULFILLMENT' as CriterionEvidenceVerdict);
}

function assessOneCriterion(
  criterion: SuccessCriterion,
  observations: readonly ObservationRecord[],
  assessedAtMs: number,
): CriterionAssessment {
  if (observations.length === 0) {
    return {
      criterionId: criterion.criterionId,
      criterionDescriptionSnapshot: criterion.description,
      evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      observationCount: 0,
      authorizedCount: 0,
      deniedCount: 0,
      assessedAtMs,
    };
  }

  const authorizedCount = observations.filter((o) => o.outcome === 'AUTHORIZED').length;
  const deniedCount = observations.filter((o) => o.outcome === 'DENIED').length;

  return {
    criterionId: criterion.criterionId,
    criterionDescriptionSnapshot: criterion.description,
    evidenceVerdict: 'INSUFFICIENT_EVIDENCE',
    observationCount: observations.length,
    authorizedCount,
    deniedCount,
    assessedAtMs,
  };
}

/**
 * Compute a Fulfillment Assessment for a Milestone Goal from its available
 * observations. This is the Empire's judgment engine — it reasons only from
 * facts, never from assumption.
 *
 * The result is an immutable record: persist it before discarding it.
 * It must not be recomputed and stored as "the latest" — each call produces
 * a new historical snapshot valid for the evidence available at that moment.
 */
export function assessGoalFulfillment(
  goal: GoalContract,
  observations: readonly ObservationRecord[],
): GoalFulfillmentAssessment {
  const now = Date.now();
  const criteria = goal.successCriteria ?? [];

  if (criteria.length === 0) {
    return {
      assessmentId: generateAssessmentId(now),
      goalId: goal.goalId,
      assessedAtMs: now,
      overallVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionAssessments: [],
    };
  }

  const criterionAssessments = criteria.map((criterion) =>
    assessOneCriterion(criterion, observations, now),
  );

  const overallVerdict = mostConservativeVerdict(
    criterionAssessments.map((ca) => ca.evidenceVerdict),
  );

  return {
    assessmentId: generateAssessmentId(now),
    goalId: goal.goalId,
    assessedAtMs: now,
    overallVerdict,
    criterionAssessments,
  };
}
