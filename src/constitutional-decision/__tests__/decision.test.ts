import { emitSignal, getSignalLog } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking, getHeartbeatState } from '../../sovereign-heart';
import { beginConstitutionalThought, endConstitutionalThought, resetPerceptionIntake } from '../../sovereign-core';
import { beginConstitutionalObservation, endConstitutionalObservation, resetObservationLayer } from '../../sovereign-consciousness';
import { beginConstitutionalRemembering, endConstitutionalRemembering, resetKnowledgeRepository } from '../../sovereign-memory';
import { beginContinuousMaturityTracking, endContinuousMaturityTracking, resetImprovementRegistry } from '../../sovereign-evolution';
import { beginConstitutionalReception, endConstitutionalReception, resetReceptionQueue } from '../../constitutional-reception';
import { processReceptionQueueIntoIntentions, resetIntentionQueue } from '../../constitutional-will';
import type { ConstitutionalIntention } from '../../constitutional-will';
import {
  CONSTITUTIONAL_DECISION_PIPELINE,
  CONSTITUTIONAL_JUDGMENT_TREE,
  evaluateIntentionForDecision,
  processIntentionsIntoDecisions,
  getDecisionQueue,
  getDecisionsForOrgan,
  resetDecisionQueue,
  getFullDecisionHistory,
  getDecisionHistoryByVerdict,
  getDecisionHistoryForOrgan,
  verifyEveryDecisionOriginatesFromWill,
  verifyEveryDecisionGroundedInWisdom,
  verifyEveryDecisionPreservesConstitutionalLaw,
  verifyUnauthorizedDecisionsAreRejected,
  verifyZeroExecutionAuthorityExists,
  verifyDecisionsRemainFullyTraceable,
  getConstitutionalDecisionCertificationReport,
} from '../index';

describe('The Constitutional Decision (Imperial Judgment)', () => {
  afterEach(() => {
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

  it("names this module's own 4-stage pipeline and 4-branch judgment tree", () => {
    expect(CONSTITUTIONAL_DECISION_PIPELINE.length).toBe(4);
    expect(CONSTITUTIONAL_JUDGMENT_TREE.length).toBe(4);
    expect(CONSTITUTIONAL_JUDGMENT_TREE.map((entry) => entry.verdict)).toEqual([
      'rejected',
      'escalated',
      'deferred',
      'approved',
    ]);
  });

  it('approves an intention once Law, Wisdom, Memory, and Awareness all support it', () => {
    awaken();
    beginConstitutionalThought();
    beginConstitutionalObservation();
    beginConstitutionalRemembering();
    beginContinuousMaturityTracking();
    beginConstitutionalReception();

    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'decision approval test',
      content: null,
    });

    processReceptionQueueIntoIntentions();
    const decided = processIntentionsIntoDecisions();
    expect(decided.length).toBeGreaterThan(0);

    const forOrgan = getDecisionsForOrgan('hujjah-al-damighah');
    expect(forOrgan.length).toBeGreaterThan(0);
    expect(forOrgan[0].verdict).toBe('approved');
  });

  it('defers an intention when Constitutional Memory has no archived evidence yet', () => {
    // Heart + Core + Reception only — Memory and Evolution are never
    // activated, so Constitutional Consciousness's own condition data
    // (sourced from Heart, not from its own subscription) still gives
    // Reception 3 contributing sources, but Memory stays genuinely empty.
    awaken();
    beginConstitutionalThought();
    beginConstitutionalReception();

    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'decision deferral test',
      content: null,
    });

    processReceptionQueueIntoIntentions();
    processIntentionsIntoDecisions();

    const forOrgan = getDecisionsForOrgan('ras-al-amr');
    expect(forOrgan.length).toBeGreaterThan(0);
    expect(forOrgan[0].verdict).toBe('deferred');
  });

  it('rejects an intention whose organ lacks a complete constitutional home', () => {
    const syntheticIntention: ConstitutionalIntention = {
      intentionId: 'intention-synthetic-test',
      organId: 'not-a-real-organ',
      sourceReceptionId: 'reception-synthetic-test',
      statement: 'A synthetic intention for an organ the Skeleton has never registered.',
      formedAt: new Date().toISOString(),
      readiness: 'formed',
    };
    const result = evaluateIntentionForDecision(syntheticIntention);
    expect(result.decision?.verdict).toBe('rejected');
  });

  it('refuses to decide an intention not traceable to a real, formed Will Intention', () => {
    const malformed: ConstitutionalIntention = {
      intentionId: 'not-a-real-intention-id',
      organId: 'sovereign-vault-palace',
      sourceReceptionId: 'reception-fake',
      statement: 'malformed',
      formedAt: new Date().toISOString(),
      readiness: 'formed',
    };
    const result = evaluateIntentionForDecision(malformed);
    expect(result.decision).toBeNull();
    expect(result.rejection).not.toBeNull();
  });

  it("the Decision History exposes the same queue, filterable by verdict and organ", () => {
    awaken();
    beginConstitutionalThought();
    beginConstitutionalObservation();
    beginConstitutionalRemembering();
    beginContinuousMaturityTracking();
    beginConstitutionalReception();

    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'decision history test',
      content: null,
    });
    processReceptionQueueIntoIntentions();
    processIntentionsIntoDecisions();

    expect(getFullDecisionHistory()).toEqual(getDecisionQueue());
    expect(getDecisionHistoryForOrgan('qiyamah-chamber').length).toBeGreaterThan(0);
    expect(getDecisionHistoryByVerdict('approved').length).toBeGreaterThan(0);
  });

  it('exercises no execution authority — remains read-only with respect to the Living Body', () => {
    const logBefore = getSignalLog().length;
    const heartBefore = getHeartbeatState();
    processIntentionsIntoDecisions();
    getDecisionQueue();
    getFullDecisionHistory();
    expect(getSignalLog().length).toBe(logBefore);
    expect(getHeartbeatState()).toEqual(heartBefore);
  });

  it('produces a full 6-item Certification Report, all verified', () => {
    awaken();
    beginConstitutionalThought();
    beginConstitutionalObservation();
    beginConstitutionalRemembering();
    beginContinuousMaturityTracking();
    beginConstitutionalReception();

    emitSignal({
      origin: 'sovereign-capability-diwan',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-capability-diwan',
      purpose: 'decision certification test',
      content: null,
    });
    processReceptionQueueIntoIntentions();
    processIntentionsIntoDecisions();

    const report = getConstitutionalDecisionCertificationReport();
    expect(report.length).toBe(6);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyEveryDecisionOriginatesFromWill().verified).toBe(true);
    expect(verifyEveryDecisionGroundedInWisdom().verified).toBe(true);
    expect(verifyEveryDecisionPreservesConstitutionalLaw().verified).toBe(true);
    expect(verifyUnauthorizedDecisionsAreRejected().verified).toBe(true);
    expect(verifyZeroExecutionAuthorityExists().verified).toBe(true);
    expect(verifyDecisionsRemainFullyTraceable().verified).toBe(true);
  });
});
