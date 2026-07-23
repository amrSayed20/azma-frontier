import { emitSignal, getSignalLog } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking, CONSTITUTIONAL_RHYTHM, getHeartbeatState } from '../../sovereign-heart';
import {
  CONSTITUTIONAL_AWARENESS_DIMENSIONS,
  getAwarenessStateForOrgan,
  isOrganPresent,
  getConditionForOrgan,
  listAllOrganConditions,
  observeConstitutionalHarmony,
  recognizeSelf,
  beginConstitutionalObservation,
  endConstitutionalObservation,
  isObserving,
  getChangeLog,
  resetObservationLayer,
  verifyContinuousConditionRecognition,
  verifyAwarenessRemainsReadOnly,
  verifyObservesEveryParticipatingOrgan,
  verifyHarmonyCanBeRecognized,
  verifyImbalanceCanBeRecognized,
  verifyNoAuthorityExercised,
  getConstitutionalAwarenessCertificationReport,
} from '../index';

describe('The Constitutional Consciousness (The Living Awareness)', () => {
  afterEach(() => {
    endConstitutionalObservation();
    resetObservationLayer();
    rest();
    resetContinuityTracking();
    jest.useRealTimers();
  });

  it('names exactly the 4 Awareness Dimensions this phase\'s own Responsibilities describe', () => {
    expect(CONSTITUTIONAL_AWARENESS_DIMENSIONS.map((entry) => entry.dimension)).toEqual([
      'Condition',
      'Harmony',
      'Imbalance',
      'Change',
    ]);
  });

  it('the Awareness State reflects a real emitted signal, reusing the Nervous System\'s own State Registry', () => {
    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'consciousness awareness-state test',
      content: null,
    });
    const state = getAwarenessStateForOrgan('hujjah-al-damighah');
    expect(state.State?.purpose).toBe('consciousness awareness-state test');
  });

  it('the Presence Layer reflects the Heart\'s own continuity determination, never a re-derived one', () => {
    expect(isOrganPresent('sovereign-core')).toBe(false); // never observed
    awaken();
    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'consciousness presence test',
      content: null,
    });
    expect(isOrganPresent('ras-al-amr')).toBe(true);
  });

  it('the Condition Monitor combines Awareness State and Presence for one organ, and covers every Skeleton organ', () => {
    awaken();
    emitSignal({
      origin: 'makman-al-ghayah',
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'consciousness condition test',
      content: null,
    });
    const condition = getConditionForOrgan('makman-al-ghayah');
    expect(condition.presenceStatus).toBe('continuous');
    expect(condition.knownState.Health?.purpose).toBe('consciousness condition test');

    const all = listAllOrganConditions();
    expect(all.length).toBe(12);
  });

  it('can recognize harmony when every currently-participating organ shares the same presence status', () => {
    awaken();
    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'consciousness harmony test 1',
      content: null,
    });
    emitSignal({
      origin: 'sovereign-vault-palace',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-vault-palace',
      purpose: 'consciousness harmony test 2',
      content: null,
    });

    const harmony = observeConstitutionalHarmony();
    expect(harmony.harmonious).toBe(true);
  });

  it('can recognize imbalance when currently-participating organs\' presence statuses diverge', () => {
    jest.useFakeTimers();
    awaken();
    emitSignal({
      origin: 'sovereign-tongue',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-tongue',
      purpose: 'consciousness imbalance test — goes silent',
      content: null,
    });
    jest.advanceTimersByTime(CONSTITUTIONAL_RHYTHM.silenceThresholdMs + 1000);
    emitSignal({
      origin: 'sovereign-identity-layer',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-identity-layer',
      purpose: 'consciousness imbalance test — stays continuous',
      content: null,
    });

    const harmony = observeConstitutionalHarmony();
    expect(harmony.harmonious).toBe(false);
    expect(harmony.statusCounts.continuous).toBeGreaterThanOrEqual(1);
    expect(harmony.statusCounts.silent).toBeGreaterThanOrEqual(1);
  });

  it('the Observation Layer recognizes an organ\'s arrival as a constitutional change, event-driven, without polling', () => {
    awaken();
    beginConstitutionalObservation();
    expect(isObserving()).toBe(true);
    const before = getChangeLog().length;

    emitSignal({
      origin: 'global-ui-runtime',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'global-ui-runtime',
      purpose: 'consciousness change-recognition test',
      content: null,
    });

    const log = getChangeLog();
    expect(log.length).toBe(before + 1);
    expect(log[log.length - 1]).toMatchObject({ organId: 'global-ui-runtime', from: null, to: 'continuous' });
  });

  it('is idempotent — beginning observation twice does not create a duplicate subscription', () => {
    awaken();
    beginConstitutionalObservation();
    beginConstitutionalObservation();
    const before = getChangeLog().length;

    emitSignal({
      origin: 'sovereign-capability-diwan',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-capability-diwan',
      purpose: 'consciousness idempotency test',
      content: null,
    });

    expect(getChangeLog().length).toBe(before + 1);
  });

  it('stops recognizing change once ended, and resetObservationLayer clears the log', () => {
    awaken();
    beginConstitutionalObservation();
    emitSignal({
      origin: 'al-wateen',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'al-wateen',
      purpose: 'consciousness stop test',
      content: null,
    });
    endConstitutionalObservation();
    expect(isObserving()).toBe(false);

    const countAtStop = getChangeLog().length;
    emitSignal({
      origin: 'al-wateen',
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'al-wateen',
      purpose: 'consciousness stop test — after end',
      content: null,
    });
    expect(getChangeLog().length).toBe(countAtStop);

    resetObservationLayer();
    expect(getChangeLog().length).toBe(0);
  });

  it('recognizes its own constitutional home — global-ui-runtime is fully defined in the Skeleton\'s registries', () => {
    const result = recognizeSelf();
    expect(result.organId).toBe('global-ui-runtime');
    expect(result.hasCompleteConstitutionalHome).toBe(true);
  });

  it('exercises no constitutional authority — remains read-only with respect to the Living Body', () => {
    const logBefore = getSignalLog().length;
    const heartBefore = getHeartbeatState();
    listAllOrganConditions();
    observeConstitutionalHarmony();
    recognizeSelf();
    expect(getSignalLog().length).toBe(logBefore);
    expect(getHeartbeatState()).toEqual(heartBefore);
  });

  it('produces a full 6-item Certification Report, all verified once the Body has been observed', () => {
    awaken();
    beginConstitutionalObservation();
    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'consciousness certification test',
      content: null,
    });

    const report = getConstitutionalAwarenessCertificationReport();
    expect(report.length).toBe(6);
    report.forEach((entry) => {
      expect(entry.verified).toBe(true);
    });

    // Also exercised individually, matching this phase's own 6 named requirements.
    expect(verifyContinuousConditionRecognition().verified).toBe(true);
    expect(verifyAwarenessRemainsReadOnly().verified).toBe(true);
    expect(verifyObservesEveryParticipatingOrgan().verified).toBe(true);
    expect(verifyHarmonyCanBeRecognized().verified).toBe(true);
    expect(verifyImbalanceCanBeRecognized().verified).toBe(true);
    expect(verifyNoAuthorityExercised().verified).toBe(true);
  });
});
