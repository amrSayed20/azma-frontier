/**
 * AZMA OS — THE CONSTITUTIONAL ACTUATION
 * The Constitutional Actuation Evaluator
 * Construction Campaign
 *
 * The one gate through which a ConstitutionalExecution may become a
 * ConstitutionalRouting. Verifies only two facts, never reinterpreting
 * the execution's own content: is it traceable to a real Constitutional
 * Execution, and does its organId name a valid, registered target? Any
 * execution failing either check is refused, with a disclosed reason —
 * never silently accepted, never re-judged as if this layer could reach
 * a different conclusion than Execution (or Decision, before it) already
 * did.
 */

import { CONSTITUTIONAL_PATHWAY } from './pathway-registry';
import { isValidTarget } from './target-registry';
import type { ConstitutionalExecution, ConstitutionalRouting, RoutingRejection } from './types';

function isTraceableExecution(execution: ConstitutionalExecution): boolean {
  return typeof execution.executionId === 'string' && execution.executionId.startsWith('execution-');
}

export function evaluateExecutionForActuation(
  execution: ConstitutionalExecution,
): { routing: ConstitutionalRouting | null; rejection: RoutingRejection | null } {
  if (!isTraceableExecution(execution)) {
    return {
      routing: null,
      rejection: { executionId: execution.executionId, reason: 'Not traceable to a real Constitutional Execution.' },
    };
  }
  if (!isValidTarget(execution.organId)) {
    return {
      routing: null,
      rejection: {
        executionId: execution.executionId,
        reason: `"${execution.organId}" is not a registered constitutional organ — no valid target exists.`,
      },
    };
  }

  return {
    routing: {
      routingId: `routing-${execution.executionId}`,
      sourceExecutionId: execution.executionId,
      pathway: CONSTITUTIONAL_PATHWAY,
      target: { organId: execution.organId },
      routedAt: new Date().toISOString(),
    },
    rejection: null,
  };
}
