/**
 * AZMA OS — Makman Al-Ghayah
 * SOVEREIGN KNOWLEDGE REQUEST FOUNDATION — Constitutional Foundation Package IX
 *
 * Pure, deterministic construction of a SovereignKnowledgeRequestBatch from
 * a GapKnowledgeRequirementReport. No I/O. No side effects. No AI. No external
 * dependencies. No invocation of Al Hujjah.
 *
 * This engine does only one thing: translate constitutional Knowledge
 * Requirements into formal constitutional Knowledge Requests.
 *
 * TRANSLATION RULE:
 *   For every KnowledgeRequirement in the report, produce one
 *   SovereignKnowledgeRequest with an assigned requestId and requestedAtMs.
 *   All other fields are inherited verbatim from the requirement.
 *   No filtering — every requirement becomes a request. (NO_ACTIVE_GAP
 *   requirements were already excluded in Package VIII; none reach this engine.)
 *
 * WHAT THE ENGINE ADDS:
 *   requestId  — a unique identity for this specific request
 *   requestedAtMs — the constitutional timestamp of issuance
 *
 * WHAT THE ENGINE DOES NOT ADD:
 *   No answers. No investigation results. No AI reasoning.
 *   No causal inference. No recommendations. No conclusions.
 */

import type { GapKnowledgeRequirementReport } from './gap-investigation-contracts';
import type {
  SovereignKnowledgeRequest,
  SovereignKnowledgeRequestBatch,
} from './sovereign-knowledge-request-contracts';

function buildOneRequest(
  requirement: GapKnowledgeRequirementReport['requirements'][number],
  issuedAtMs: number,
): SovereignKnowledgeRequest {
  return {
    requestId: `kr-${requirement.goalId}-${requirement.criterionId}-${issuedAtMs}`,
    goalId: requirement.goalId,
    assessmentId: requirement.assessmentId,
    criterionId: requirement.criterionId,
    criterionDescriptionSnapshot: requirement.criterionDescriptionSnapshot,
    gapClass: requirement.gapClass,
    gapCategory: requirement.gapCategory,
    questionStatement: requirement.questionStatement,
    availability: requirement.availability,
    requestedAtMs: issuedAtMs,
  };
}

/**
 * Build the SovereignKnowledgeRequestBatch from a GapKnowledgeRequirementReport.
 * One SovereignKnowledgeRequest is produced per KnowledgeRequirement.
 * Empty when the requirement report contains no active requirements.
 *
 * Pure function. Does not persist. Does not invoke Al Hujjah. Does not answer.
 */
export function buildKnowledgeRequests(
  report: GapKnowledgeRequirementReport,
): SovereignKnowledgeRequestBatch {
  const issuedAtMs = Date.now();
  return {
    batchId: `krb-${report.goalId}-${report.assessmentId}-${issuedAtMs}`,
    goalId: report.goalId,
    assessmentId: report.assessmentId,
    requests: report.requirements.map((req) => buildOneRequest(req, issuedAtMs)),
    issuedAtMs,
  };
}
