import { emitSignal, getSignalLog } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking, getHeartbeatState } from '../../sovereign-heart';
import { beginConstitutionalThought, endConstitutionalThought, resetPerceptionIntake } from '../../sovereign-core';
import { beginConstitutionalObservation, endConstitutionalObservation, resetObservationLayer } from '../../sovereign-consciousness';
import { beginConstitutionalRemembering, endConstitutionalRemembering, resetKnowledgeRepository } from '../../sovereign-memory';
import { beginContinuousMaturityTracking, endContinuousMaturityTracking, resetImprovementRegistry } from '../../sovereign-evolution';
import { beginConstitutionalReception, endConstitutionalReception, resetReceptionQueue } from '../../constitutional-reception';
import { processReceptionQueueIntoIntentions, resetIntentionQueue } from '../../constitutional-will';
import { processIntentionsIntoDecisions, resetDecisionQueue, getDecisionQueue } from '../../constitutional-decision';
import type { ConstitutionalDecision } from '../../constitutional-decision';
import {
  CONSTITUTIONAL_EXECUTION_PIPELINE,
  CONSTITUTIONAL_ACTION,
  evaluateDecisionForExecution,
  getExecutionQueue,
  getExecutionsForOrgan,
  resetExecutionQueue,
  getAllExecutionResults,
  getExecutionResult,
  resetExecutionResultRegistry,
  processDecisionsIntoExecutions,
  getExecutionRejections,
  resetExecutionRejections,
  verifyEveryExecutionOriginatesFromApprovedDecision,
  verifyUnauthorizedExecutionsAreRejected,
  verifyEveryExecutionRemainsFullyTraceable,
  verifyExecutionResultsAreFaithfullyRecorded,
  verifyZeroDecisionMakingAuthorityExists,
  getConstitutionalExecutionCertificationReport,
} from '../index';

describe('The Constitutional Execution (Constitutional Action)', () => {
  afterEach(() => {
    resetExecutionQueue();
    resetExecutionResultRegistry();
    resetExecutionRejections();
    resetDecisionQueue();
    resetIntentionQueue();
    endConstitutionalReception();
    resetReceptionQueue();
    endConstitutionalThought();
    resetPerceptionIntake();
    endConstitutionalObservation();
    resetObservationLayer();
    endConstitutionalRemembering();
    resetKnowledgeRepository();
    endContinuousMaturityTracking();
    resetImprovementRegistry();
    rest();
    resetContinuityTracking();
  });

  function activateEverythingAndDecide(organId: string): void {
    awaken();
    beginConstitutionalThought();
    beginConstitutionalObservation();
    beginConstitutionalRemembering();
    beginContinuousMaturityTracking();
    beginConstitutionalReception();

    emitSignal({
      origin: organId,
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: organId,
      purpose: 'execution test scenario',
      content: null,
    });
    processReceptionQueueIntoIntentions();
    processIntentionsIntoDecisions();
  }

  it("names this module's own 4-stage pipeline and single uniform Constitutional Action", () => {
    expect(CONSTITUTIONAL_EXECUTION_PIPELINE.length).toBe(4);
    expect(CONSTITUTIONAL_ACTION.actionKind).toBe('faithful-record');
  });

  it('executes an approved decision, faithfully recording one uniform action', () => {
    activateEverythingAndDecide('hujjah-al-damighah');
    const approved = getDecisionQueue().find((decision) => decision.verdict === 'approved');
    expect(approved).toBeDefined();

    const executed = processDecisionsIntoExecutions();
    expect(executed.length).toBeGreaterThan(0);

    const forOrgan = getExecutionsForOrgan('hujjah-al-damighah');
    expect(forOrgan.length).toBeGreaterThan(0);
    expect(forOrgan[0].action.actionKind).toBe('faithful-record');
    expect(forOrgan[0].sourceDecisionId).toBe(approved!.decisionId);
  });

  it('never processes the same decision twice into a duplicate execution', () => {
    activateEverythingAndDecide('ras-al-amr');
    processDecisionsIntoExecutions();
    const countAfterFirst = getExecutionQueue().length;
    processDecisionsIntoExecutions();
    expect(getExecutionQueue().length).toBe(countAfterFirst);
  });

  it('refuses to execute a decision whose verdict is not approved, and one with an untraceable id', () => {
    activateEverythingAndDecide('makman-al-ghayah');
    const sample = getDecisionQueue()[0];

    const notApproved: ConstitutionalDecision = { ...sample, verdict: 'deferred' };
    const untraceable: ConstitutionalDecision = { ...sample, decisionId: 'not-a-real-decision-id' };

    const notApprovedResult = evaluateDecisionForExecution(notApproved);
    expect(notApprovedResult.execution).toBeNull();
    expect(notApprovedResult.rejection).not.toBeNull();

    const untraceableResult = evaluateDecisionForExecution(untraceable);
    expect(untraceableResult.execution).toBeNull();
    expect(untraceableResult.rejection).not.toBeNull();
  });

  it('records a faithful, matching ExecutionResult for every execution', () => {
    activateEverythingAndDecide('qiyamah-chamber');
    processDecisionsIntoExecutions();

    const executions = getExecutionsForOrgan('qiyamah-chamber');
    expect(executions.length).toBeGreaterThan(0);
    executions.forEach((execution) => {
      const result = getExecutionResult(execution.executionId);
      expect(result).not.toBeNull();
      expect(result!.outcome).toBe('completed');
      expect(result!.recordedAt).toBe(execution.executedAt);
    });
    expect(getAllExecutionResults().length).toBeGreaterThanOrEqual(executions.length);
  });

  it('exercises no decision-making authority — Decision\'s own queue and the Living Body remain unaffected', () => {
    activateEverythingAndDecide('sovereign-vault-palace');
    const decisionQueueBefore = JSON.stringify(getDecisionQueue());
    const logBefore = getSignalLog().length;
    const heartBefore = getHeartbeatState();

    processDecisionsIntoExecutions();

    expect(JSON.stringify(getDecisionQueue())).toBe(decisionQueueBefore);
    expect(getSignalLog().length).toBe(logBefore);
    expect(getHeartbeatState()).toEqual(heartBefore);
  });

  it('produces a full 5-item Certification Report, all verified', () => {
    activateEverythingAndDecide('sovereign-capability-diwan');
    processDecisionsIntoExecutions();

    const report = getConstitutionalExecutionCertificationReport();
    expect(report.length).toBe(5);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyEveryExecutionOriginatesFromApprovedDecision().verified).toBe(true);
    expect(verifyUnauthorizedExecutionsAreRejected().verified).toBe(true);
    expect(verifyEveryExecutionRemainsFullyTraceable().verified).toBe(true);
    expect(verifyExecutionResultsAreFaithfullyRecorded().verified).toBe(true);
    expect(verifyZeroDecisionMakingAuthorityExists().verified).toBe(true);
  });

  it('the pipeline\'s own rejection log is a real, readable, append-only array', () => {
    activateEverythingAndDecide('global-ui-runtime');
    processDecisionsIntoExecutions();
    expect(Array.isArray(getExecutionRejections())).toBe(true);
  });
});
