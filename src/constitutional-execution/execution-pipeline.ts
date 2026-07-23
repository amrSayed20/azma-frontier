/**
 * AZMA OS — THE CONSTITUTIONAL EXECUTION
 * The Constitutional Execution Pipeline
 * Construction Campaign
 *
 * A pull-based processor, NOT a Bus subscriber — the identical
 * discipline Constitutional Will and Constitutional Decision themselves
 * established. Reads Constitutional Decision's own getDecisionQueue() on
 * demand, evaluates each exactly once, and appends any resulting
 * Execution and its Result. Never processes the same decision twice.
 */

import { getDecisionQueue } from '../constitutional-decision';
import { evaluateDecisionForExecution } from './execution-evaluator';
import { appendExecution, hasProcessedDecision } from './execution-queue';
import { appendExecutionResult } from './execution-result-registry';
import type { ConstitutionalExecution, ExecutionRejection } from './types';

let rejections: ExecutionRejection[] = [];

/** Pulls Decision's current queue, executes any newly-approved decisions, and records any rejections — read-only toward Decision itself. */
export function processDecisionsIntoExecutions(): readonly ConstitutionalExecution[] {
  const executed: ConstitutionalExecution[] = [];
  for (const decision of getDecisionQueue()) {
    if (hasProcessedDecision(decision.decisionId)) continue;

    const { execution, rejection } = evaluateDecisionForExecution(decision);
    if (execution) {
      appendExecution(execution);
      appendExecutionResult({
        executionId: execution.executionId,
        outcome: 'completed',
        recordedAt: execution.executedAt,
        summary: `Faithfully recorded execution of approved decision "${decision.decisionId}" for organ "${decision.organId}" — action: ${execution.action.actionKind}.`,
      });
      executed.push(execution);
    } else if (rejection) {
      rejections.push(rejection);
    }
  }
  return executed;
}

export function getExecutionRejections(): readonly ExecutionRejection[] {
  return [...rejections];
}

/** Test/reset utility — clears this pipeline's own rejection log (the queue and result registry reset themselves). */
export function resetExecutionRejections(): void {
  rejections = [];
}
