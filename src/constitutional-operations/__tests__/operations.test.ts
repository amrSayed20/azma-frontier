import { emitSignal } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking } from '../../sovereign-heart';
import { beginConstitutionalThought, endConstitutionalThought, resetPerceptionIntake } from '../../sovereign-core';
import { beginConstitutionalObservation, endConstitutionalObservation, resetObservationLayer } from '../../sovereign-consciousness';
import { beginConstitutionalRemembering, endConstitutionalRemembering, resetKnowledgeRepository } from '../../sovereign-memory';
import { beginContinuousMaturityTracking, endContinuousMaturityTracking, resetImprovementRegistry } from '../../sovereign-evolution';
import { resetReceptionQueue, getReceptionQueue } from '../../constitutional-reception';
import { resetIntentionQueue, getIntentionQueue } from '../../constitutional-will';
import { resetDecisionQueue, getDecisionQueue } from '../../constitutional-decision';
import { resetExecutionQueue, resetExecutionResultRegistry, resetExecutionRejections, getExecutionQueue } from '../../constitutional-execution';
import { resetRoutingLayer, getRoutingQueue } from '../../constitutional-actuation';
import {
  CONSTITUTIONAL_OPERATIONAL_CYCLE,
  CONSTITUTIONAL_OPERATIONAL_ARCHITECTURE,
  beginConstitutionalOperationalCycle,
  endConstitutionalOperationalCycle,
  isOperating,
  getOperationalAuditLog,
  resetOperationalAuditLog,
  getOperationalHealthSnapshot,
  getOperationalFailureSnapshot,
  verifyCompleteCycleOperatesAutomatically,
  verifyEveryConstitutionalBoundaryPreserved,
  verifyEveryStageRemainsIndependentlyTraceable,
  verifyFailuresRemainIsolated,
  verifyRecoveryPreservesContinuity,
  verifyOperationalHealthIsMeasurable,
  verifyNoAuthorityMigratesBetweenLayers,
  getConstitutionalOperationalCertificationReport,
  getConstitutionalOperationalSnapshot,
} from '../index';

describe('Constitutional Operational Foundation, Package I (The First Living Operational Cycle)', () => {
  afterEach(() => {
    endConstitutionalOperationalCycle();
    resetOperationalAuditLog();
    resetRoutingLayer();
    resetExecutionQueue();
    resetExecutionResultRegistry();
    resetExecutionRejections();
    resetDecisionQueue();
    resetIntentionQueue();
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

  function awakenAllOrgans(): void {
    awaken();
    beginConstitutionalThought();
    beginConstitutionalObservation();
    beginConstitutionalRemembering();
    beginContinuousMaturityTracking();
  }

  it("names this Package's own 5-stage cycle and architectural commitments", () => {
    expect(CONSTITUTIONAL_OPERATIONAL_CYCLE.length).toBe(5);
    expect(CONSTITUTIONAL_OPERATIONAL_ARCHITECTURE.length).toBeGreaterThanOrEqual(4);
  });

  it('automatically carries one real signal through the entire chain — Reception, Will, Decision, Execution, and Actuation — with no manual pull call', () => {
    awakenAllOrgans();
    beginConstitutionalOperationalCycle();
    expect(isOperating()).toBe(true);

    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'operational cycle end-to-end test',
      content: null,
    });

    // No processReceptionQueueIntoIntentions()/processIntentionsIntoDecisions()/
    // processDecisionsIntoExecutions()/processExecutionsIntoRoutings() is ever
    // called directly in this test — only the Coordinator's own subscription.
    expect(getReceptionQueue().some((entry) => entry.expression.organId === 'hujjah-al-damighah')).toBe(true);
    expect(getIntentionQueue().some((intention) => intention.organId === 'hujjah-al-damighah')).toBe(true);
    expect(getDecisionQueue().some((decision) => decision.organId === 'hujjah-al-damighah')).toBe(true);
    expect(getExecutionQueue().some((execution) => execution.organId === 'hujjah-al-damighah')).toBe(true);
    expect(getRoutingQueue().some((routing) => routing.target.organId === 'hujjah-al-damighah')).toBe(true);
  });

  it('is idempotent — beginning the cycle twice does not create a duplicate subscription', () => {
    awakenAllOrgans();
    beginConstitutionalOperationalCycle();
    beginConstitutionalOperationalCycle();

    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'operational idempotency test',
      content: null,
    });

    // If a duplicate subscription existed, this organ would appear twice.
    expect(getIntentionQueue().filter((intention) => intention.organId === 'ras-al-amr').length).toBeLessThanOrEqual(1);
  });

  it('stops automatic processing once ended', () => {
    awakenAllOrgans();
    beginConstitutionalOperationalCycle();
    endConstitutionalOperationalCycle();
    expect(isOperating()).toBe(false);

    emitSignal({
      origin: 'makman-al-ghayah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'operational stop test',
      content: null,
    });

    expect(getRoutingQueue().some((routing) => routing.target.organId === 'makman-al-ghayah')).toBe(false);
  });

  it('records an audit entry for every automatic cycle run', () => {
    awakenAllOrgans();
    beginConstitutionalOperationalCycle();
    const before = getOperationalAuditLog().length;

    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'operational audit test',
      content: null,
    });

    expect(getOperationalAuditLog().length).toBe(before + 1);
  });

  it('measures operational health and failure snapshots as real, well-formed data', () => {
    awakenAllOrgans();
    beginConstitutionalOperationalCycle();
    emitSignal({
      origin: 'sovereign-vault-palace',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-vault-palace',
      purpose: 'operational health test',
      content: null,
    });

    const health = getOperationalHealthSnapshot();
    expect(health.routingQueueLength).toBeGreaterThan(0);

    const failures = getOperationalFailureSnapshot();
    expect(failures.totalRejectionCount).toBeGreaterThanOrEqual(0);

    const snapshot = getConstitutionalOperationalSnapshot();
    expect(snapshot.operating).toBe(true);
    expect(snapshot.auditLog.length).toBeGreaterThan(0);
  });

  it('produces a full 7-item Certification Report, all verified', () => {
    awakenAllOrgans();
    beginConstitutionalOperationalCycle();
    emitSignal({
      origin: 'sovereign-capability-diwan',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-capability-diwan',
      purpose: 'operational certification test',
      content: null,
    });

    const report = getConstitutionalOperationalCertificationReport();
    expect(report.length).toBe(7);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyCompleteCycleOperatesAutomatically().verified).toBe(true);
    expect(verifyEveryConstitutionalBoundaryPreserved().verified).toBe(true);
    expect(verifyEveryStageRemainsIndependentlyTraceable().verified).toBe(true);
    expect(verifyFailuresRemainIsolated().verified).toBe(true);
    expect(verifyRecoveryPreservesContinuity().verified).toBe(true);
    expect(verifyOperationalHealthIsMeasurable().verified).toBe(true);
    expect(verifyNoAuthorityMigratesBetweenLayers().verified).toBe(true);
  });
});
