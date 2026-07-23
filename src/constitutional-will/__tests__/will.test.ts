import { emitSignal, getSignalLog } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking, getHeartbeatState } from '../../sovereign-heart';
import { beginConstitutionalThought, endConstitutionalThought, resetPerceptionIntake } from '../../sovereign-core';
import { beginConstitutionalObservation, endConstitutionalObservation, resetObservationLayer } from '../../sovereign-consciousness';
import { beginConstitutionalRemembering, endConstitutionalRemembering, resetKnowledgeRepository } from '../../sovereign-memory';
import { beginContinuousMaturityTracking, endContinuousMaturityTracking, resetImprovementRegistry } from '../../sovereign-evolution';
import { beginConstitutionalReception, endConstitutionalReception, resetReceptionQueue } from '../../constitutional-reception';
import {
  CONSTITUTIONAL_WILL_PIPELINE,
  CONSTITUTIONAL_INTENTION_READINESS_STATES,
  processReceptionQueueIntoIntentions,
  getIntentionQueue,
  getIntentionsForOrgan,
  getIntentionRejections,
  resetIntentionQueue,
  isReady,
  listReadyIntentions,
  verifyEveryIntentionOriginatesFromReception,
  verifyIntentionsPreserveConstitutionalLaw,
  verifyUnauthorizedIntentionsAreRejected,
  verifyReadinessDistinguishedFromExecution,
  verifyNoExecutionAuthorityExists,
  getConstitutionalWillCertificationReport,
} from '../index';

describe('The Constitutional Will (The Imperial Intention)', () => {
  afterEach(() => {
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

  function activateEverything(): void {
    awaken();
    beginConstitutionalThought();
    beginConstitutionalObservation();
    beginConstitutionalRemembering();
    beginContinuousMaturityTracking();
    beginConstitutionalReception();
  }

  it("names this module's own 4-stage pipeline and single terminal readiness state", () => {
    expect(CONSTITUTIONAL_WILL_PIPELINE.length).toBe(4);
    expect(CONSTITUTIONAL_INTENTION_READINESS_STATES).toEqual(['formed']);
  });

  it('forms an intention only once a reception is broadly corroborated and dignity-approved', () => {
    activateEverything();
    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'will intention formation test',
      content: null,
    });

    const formed = processReceptionQueueIntoIntentions();
    expect(formed.length).toBeGreaterThan(0);

    const forOrgan = getIntentionsForOrgan('hujjah-al-damighah');
    expect(forOrgan.length).toBeGreaterThan(0);
    expect(forOrgan[0].readiness).toBe('formed');
    expect(forOrgan[0].statement.length).toBeGreaterThan(0);
  });

  it('never forms a duplicate intention from the same reception when processed twice', () => {
    activateEverything();
    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'will duplicate-processing test',
      content: null,
    });

    processReceptionQueueIntoIntentions();
    const countAfterFirst = getIntentionQueue().length;
    processReceptionQueueIntoIntentions();
    expect(getIntentionQueue().length).toBe(countAfterFirst);
  });

  it('rejects a reception with no real evidence of attention, recording a disclosed reason', () => {
    // Narrow corroboration: only the Heart is active, so Reception itself
    // will not mark this expression as deserving attention.
    awaken();
    beginConstitutionalReception();
    emitSignal({
      origin: 'makman-al-ghayah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'will rejection test',
      content: null,
    });

    processReceptionQueueIntoIntentions();
    expect(getIntentionsForOrgan('makman-al-ghayah').length).toBe(0);
    expect(getIntentionRejections().length).toBeGreaterThan(0);
  });

  it('the Readiness Layer confirms every intention is ready, and nothing transitions it further', () => {
    activateEverything();
    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'will readiness test',
      content: null,
    });
    processReceptionQueueIntoIntentions();

    const ready = listReadyIntentions();
    expect(ready.length).toBeGreaterThan(0);
    ready.forEach((intention) => expect(isReady(intention)).toBe(true));
  });

  it('exercises no execution authority — remains read-only with respect to the Living Body', () => {
    const logBefore = getSignalLog().length;
    const heartBefore = getHeartbeatState();
    processReceptionQueueIntoIntentions();
    getIntentionQueue();
    listReadyIntentions();
    expect(getSignalLog().length).toBe(logBefore);
    expect(getHeartbeatState()).toEqual(heartBefore);
  });

  it('produces a full 5-item Certification Report, all verified', () => {
    activateEverything();
    emitSignal({
      origin: 'sovereign-capability-diwan',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-capability-diwan',
      purpose: 'will certification test',
      content: null,
    });
    processReceptionQueueIntoIntentions();

    const report = getConstitutionalWillCertificationReport();
    expect(report.length).toBe(5);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyEveryIntentionOriginatesFromReception().verified).toBe(true);
    expect(verifyIntentionsPreserveConstitutionalLaw().verified).toBe(true);
    expect(verifyUnauthorizedIntentionsAreRejected().verified).toBe(true);
    expect(verifyReadinessDistinguishedFromExecution().verified).toBe(true);
    expect(verifyNoExecutionAuthorityExists().verified).toBe(true);
  });
});
