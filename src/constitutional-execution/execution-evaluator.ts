/**
 * AZMA OS — THE CONSTITUTIONAL EXECUTION
 * The Constitutional Execution Evaluator
 * Construction Campaign
 *
 * The one gate through which a ConstitutionalDecision may become a
 * ConstitutionalExecution. Verifies only two facts, never re-judging the
 * decision's own content: is it traceable to a real Constitutional
 * Decision, and is its verdict exactly 'approved'? Any decision, deferred,
 * rejected, or escalated is refused, with a disclosed reason — never
 * silently accepted, never re-evaluated as if this layer could reach a
 * different verdict than Decision already did.
 */

import { CONSTITUTIONAL_ACTION } from './action-registry';
import type { ConstitutionalDecision, ConstitutionalExecution, ExecutionRejection } from './types';

function isTraceableApprovedDecision(decision: ConstitutionalDecision): boolean {
  return typeof decision.decisionId === 'string' && decision.decisionId.startsWith('decision-') && decision.verdict === 'approved';
}

export function evaluateDecisionForExecution(
  decision: ConstitutionalDecision,
): { execution: ConstitutionalExecution | null; rejection: ExecutionRejection | null } {
  if (!decision.decisionId || !decision.decisionId.startsWith('decision-')) {
    return {
      execution: null,
      rejection: { decisionId: decision.decisionId, reason: 'Not traceable to a real Constitutional Decision.' },
    };
  }
  if (decision.verdict !== 'approved') {
    return {
      execution: null,
      rejection: {
        decisionId: decision.decisionId,
        reason: `Only 'approved' decisions may be executed; this decision's verdict is '${decision.verdict}'.`,
      },
    };
  }
  if (!isTraceableApprovedDecision(decision)) {
    return {
      execution: null,
      rejection: { decisionId: decision.decisionId, reason: 'Decision failed authorization verification.' },
    };
  }

  return {
    execution: {
      executionId: `execution-${decision.decisionId}`,
      organId: decision.organId,
      sourceDecisionId: decision.decisionId,
      action: CONSTITUTIONAL_ACTION,
      executedAt: new Date().toISOString(),
    },
    rejection: null,
  };
}
