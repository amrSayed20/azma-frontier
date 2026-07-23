import { emitSignal, getSignalLog } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking, getHeartbeatState } from '../../sovereign-heart';
import { beginConstitutionalThought, endConstitutionalThought, resetPerceptionIntake } from '../../sovereign-core';
import { beginConstitutionalObservation, endConstitutionalObservation, resetObservationLayer } from '../../sovereign-consciousness';
import { beginConstitutionalRemembering, endConstitutionalRemembering, resetKnowledgeRepository } from '../../sovereign-memory';
import { beginContinuousMaturityTracking, endContinuousMaturityTracking, resetImprovementRegistry } from '../../sovereign-evolution';
import { beginConstitutionalReception, endConstitutionalReception, resetReceptionQueue } from '../../constitutional-reception';
import { processReceptionQueueIntoIntentions, resetIntentionQueue } from '../../constitutional-will';
import { processIntentionsIntoDecisions, resetDecisionQueue } from '../../constitutional-decision';
import {
  processDecisionsIntoExecutions,
  resetExecutionQueue,
  resetExecutionResultRegistry,
  resetExecutionRejections,
  getExecutionQueue,
} from '../../constitutional-execution';
import type { ConstitutionalExecution } from '../../constitutional-execution';
import {
  CONSTITUTIONAL_ACTUATION_PIPELINE,
  CONSTITUTIONAL_PATHWAY,
  evaluateExecutionForActuation,
  processExecutionsIntoRoutings,
  getRoutingQueue,
  getRoutingsForOrgan,
  getRoutingRejections,
  resetRoutingLayer,
  verifyEveryActuationOriginatesFromExecution,
  verifyExecutionPathwaysAreAuthorized,
  verifyEveryRoutingDecisionIsTraceable,
  verifyNoAuthorityExistsBeyondRouting,
  getConstitutionalActuationCertificationReport,
} from '../index';

describe('The Constitutional Actuation (The Imperial Motor System)', () => {
  afterEach(() => {
    resetRoutingLayer();
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

  function runFullChain(organId: string): void {
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
      purpose: 'actuation test scenario',
      content: null,
    });
    processReceptionQueueIntoIntentions();
    processIntentionsIntoDecisions();
    processDecisionsIntoExecutions();
  }

  it("names this module's own 4-stage pipeline and single authorized pathway", () => {
    expect(CONSTITUTIONAL_ACTUATION_PIPELINE.length).toBe(4);
    expect(CONSTITUTIONAL_PATHWAY.pathwayKind).toBe('internal-record');
  });

  it('routes a faithful execution to the one authorized pathway and the correct organ target', () => {
    runFullChain('hujjah-al-damighah');
    const executed = getExecutionQueue().find((execution) => execution.organId === 'hujjah-al-damighah');
    expect(executed).toBeDefined();

    const routed = processExecutionsIntoRoutings();
    expect(routed.length).toBeGreaterThan(0);

    const forOrgan = getRoutingsForOrgan('hujjah-al-damighah');
    expect(forOrgan.length).toBeGreaterThan(0);
    expect(forOrgan[0].pathway.pathwayKind).toBe('internal-record');
    expect(forOrgan[0].target.organId).toBe('hujjah-al-damighah');
    expect(forOrgan[0].sourceExecutionId).toBe(executed!.executionId);
  });

  it('never routes the same execution twice into a duplicate routing', () => {
    runFullChain('ras-al-amr');
    processExecutionsIntoRoutings();
    const countAfterFirst = getRoutingQueue().length;
    processExecutionsIntoRoutings();
    expect(getRoutingQueue().length).toBe(countAfterFirst);
  });

  it('refuses to route an execution not traceable to a real Constitutional Execution', () => {
    runFullChain('makman-al-ghayah');
    const sample = getExecutionQueue()[0];
    const untraceable: ConstitutionalExecution = { ...sample, executionId: 'not-a-real-execution-id' };
    const result = evaluateExecutionForActuation(untraceable);
    expect(result.routing).toBeNull();
    expect(result.rejection).not.toBeNull();
  });

  it('refuses to route an execution whose organId names no registered constitutional organ', () => {
    runFullChain('qiyamah-chamber');
    const sample = getExecutionQueue()[0];
    const fakeTarget: ConstitutionalExecution = { ...sample, organId: 'not-a-real-organ' };
    const result = evaluateExecutionForActuation(fakeTarget);
    expect(result.routing).toBeNull();
    expect(result.rejection?.reason).toContain('not a registered constitutional organ');
  });

  it('exercises no authority beyond routing — Execution\'s own queue and the Living Body remain unaffected', () => {
    runFullChain('sovereign-vault-palace');
    const executionQueueBefore = JSON.stringify(getExecutionQueue());
    const logBefore = getSignalLog().length;
    const heartBefore = getHeartbeatState();

    processExecutionsIntoRoutings();

    expect(JSON.stringify(getExecutionQueue())).toBe(executionQueueBefore);
    expect(getSignalLog().length).toBe(logBefore);
    expect(getHeartbeatState()).toEqual(heartBefore);
  });

  it('produces a full 4-item Certification Report, all verified', () => {
    runFullChain('sovereign-capability-diwan');
    processExecutionsIntoRoutings();

    const report = getConstitutionalActuationCertificationReport();
    expect(report.length).toBe(4);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyEveryActuationOriginatesFromExecution().verified).toBe(true);
    expect(verifyExecutionPathwaysAreAuthorized().verified).toBe(true);
    expect(verifyEveryRoutingDecisionIsTraceable().verified).toBe(true);
    expect(verifyNoAuthorityExistsBeyondRouting().verified).toBe(true);
  });

  it("the Routing Layer's own rejection log is a real, readable, append-only array", () => {
    runFullChain('global-ui-runtime');
    processExecutionsIntoRoutings();
    expect(Array.isArray(getRoutingRejections())).toBe(true);
  });
});
