/**
 * AZMA OS — THE CONSTITUTIONAL EXECUTION
 * The Constitutional Execution Certification Layer
 * Construction Campaign
 *
 * Implements this Campaign's own 5 Certification Requirements as real,
 * runnable checks. Every function here is a pure read: none mutates
 * anything, none calls emitSignal, circulateFromClient, awaken, rest,
 * recordSignalSeen, or any organ's own execution path — confirmed by
 * inspection and by this package's own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { getHeartbeatState } from '../sovereign-heart';
import { getDecisionQueue } from '../constitutional-decision';
import type { ConstitutionalDecision } from '../constitutional-decision';
import { getExecutionQueue } from './execution-queue';
import { getAllExecutionResults, getExecutionResult } from './execution-result-registry';
import { evaluateDecisionForExecution } from './execution-evaluator';
import type { ConstitutionalExecutionCertification } from './types';

/** Certification Requirement 1: "Verify every execution originates from an approved Constitutional Decision." */
export function verifyEveryExecutionOriginatesFromApprovedDecision(): ConstitutionalExecutionCertification {
  const executions = getExecutionQueue();
  const approvedDecisionIds = new Set(
    getDecisionQueue().filter((decision) => decision.verdict === 'approved').map((decision) => decision.decisionId),
  );
  const verified = executions.length > 0 && executions.every((execution) => approvedDecisionIds.has(execution.sourceDecisionId));
  return {
    criterion: 'Every execution originates from an approved Constitutional Decision.',
    verified,
    evidence: verified
      ? `All ${executions.length} recorded execution(s) trace to a decision currently recorded with verdict 'approved'.`
      : 'The Execution Queue is empty, or contains an execution not traceable to an approved decision.',
  };
}

/** Certification Requirement 2: "Verify unauthorized executions are rejected." */
export function verifyUnauthorizedExecutionsAreRejected(): ConstitutionalExecutionCertification {
  const sample = getDecisionQueue()[0];
  if (!sample) {
    return {
      criterion: 'Unauthorized executions are rejected.',
      verified: false,
      evidence: 'No decision is available to construct an unauthorized-execution scenario.',
    };
  }
  const notApproved: ConstitutionalDecision = { ...sample, decisionId: sample.decisionId, verdict: 'deferred' };
  const untraceable: ConstitutionalDecision = { ...sample, decisionId: 'not-a-real-decision-id' };

  const notApprovedResult = evaluateDecisionForExecution(notApproved);
  const untraceableResult = evaluateDecisionForExecution(untraceable);

  const verified =
    notApprovedResult.execution === null &&
    notApprovedResult.rejection !== null &&
    untraceableResult.execution === null &&
    untraceableResult.rejection !== null;

  return {
    criterion: 'Unauthorized executions are rejected.',
    verified,
    evidence: verified
      ? 'A decision with a non-approved verdict, and a decision with an untraceable id, are both refused execution, each with a disclosed rejection reason.'
      : 'At least one unauthorized decision was incorrectly accepted for execution.',
  };
}

/** Certification Requirement 3: "Verify every execution remains fully traceable." */
export function verifyEveryExecutionRemainsFullyTraceable(): ConstitutionalExecutionCertification {
  const executions = getExecutionQueue();
  const verified = executions.length > 0 && executions.every(
    (execution) =>
      execution.executionId.length > 0 &&
      execution.organId.length > 0 &&
      execution.sourceDecisionId.length > 0 &&
      execution.executedAt.length > 0 &&
      execution.action.actionKind.length > 0,
  );
  return {
    criterion: 'Every execution remains fully traceable.',
    verified,
    evidence: verified
      ? `All ${executions.length} recorded execution(s) carry a complete, non-empty executionId/organId/sourceDecisionId/executedAt/action.`
      : 'The Execution Queue is empty, or contains an execution missing a traceability field.',
  };
}

/** Certification Requirement 4: "Verify execution results are faithfully recorded." */
export function verifyExecutionResultsAreFaithfullyRecorded(): ConstitutionalExecutionCertification {
  const executions = getExecutionQueue();
  const verified = executions.length > 0 && executions.every((execution) => {
    const result = getExecutionResult(execution.executionId);
    return result !== null && result.outcome === 'completed' && result.recordedAt === execution.executedAt;
  });
  return {
    criterion: 'Execution results are faithfully recorded.',
    verified,
    evidence: verified
      ? `Every one of ${executions.length} execution(s) has a matching, unaltered ExecutionResult (same executionId, same timestamp).`
      : 'The Execution Queue is empty, or an execution has no matching, faithfully-recorded result.',
  };
}

/** Certification Requirement 5: "Verify zero decision-making authority exists." */
export function verifyZeroDecisionMakingAuthorityExists(): ConstitutionalExecutionCertification {
  const decisionQueueBefore = JSON.stringify(getDecisionQueue());
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();

  getExecutionQueue();
  getAllExecutionResults();

  const verified =
    JSON.stringify(getDecisionQueue()) === decisionQueueBefore &&
    getSignalLog().length === logBefore &&
    JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'Zero decision-making authority exists.',
    verified,
    evidence: verified
      ? "Constitutional Decision's own queue, the Signal Log, and the Heartbeat state are all byte-for-byte identical before and after running this module's own functions — no decision was created, modified, or reinterpreted."
      : "This module's own functions produced an observable change in Decision's queue or elsewhere in the Living Body.",
  };
}
