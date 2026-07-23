import { awaken, rest, tick, getHeartbeatState } from '../heartbeat';
import { resetContinuityTracking, getOrganContinuity, listAllOrganContinuity } from '../continuity-tracker';
import { CONSTITUTIONAL_RHYTHM } from '../rhythm-registry';
import { emitSignal } from '../../sovereign-nervous-system';

describe('The Constitutional Heart (Al-Wateen)', () => {
  afterEach(() => {
    rest();
    resetContinuityTracking();
    jest.useRealTimers();
  });

  it('beats continuously at the configured rhythm once awakened', () => {
    jest.useFakeTimers();
    awaken();
    expect(getHeartbeatState().awake).toBe(true);
    expect(getHeartbeatState().beatCount).toBe(0);

    jest.advanceTimersByTime(CONSTITUTIONAL_RHYTHM.beatIntervalMs * 3);

    expect(getHeartbeatState().beatCount).toBe(3);
    expect(getHeartbeatState().lastBeatAt).toBeTruthy();
  });

  it('is idempotent — awakening an already-awake Heart does not start a second beat', () => {
    jest.useFakeTimers();
    awaken();
    jest.advanceTimersByTime(CONSTITUTIONAL_RHYTHM.beatIntervalMs);
    const beatsAfterFirst = getHeartbeatState().beatCount;

    awaken(); // second call, should be a no-op
    jest.advanceTimersByTime(CONSTITUTIONAL_RHYTHM.beatIntervalMs);

    // If a second interval had been started, we'd see 2x the beats here.
    expect(getHeartbeatState().beatCount).toBe(beatsAfterFirst + 1);
  });

  it('stops beating and receiving reality once rested', () => {
    jest.useFakeTimers();
    awaken();
    jest.advanceTimersByTime(CONSTITUTIONAL_RHYTHM.beatIntervalMs);
    rest();
    expect(getHeartbeatState().awake).toBe(false);

    const beatsAtRest = getHeartbeatState().beatCount;
    jest.advanceTimersByTime(CONSTITUTIONAL_RHYTHM.beatIntervalMs * 5);
    expect(getHeartbeatState().beatCount).toBe(beatsAtRest);
  });

  it('tick() can be advanced manually, independent of the interval', () => {
    const before = getHeartbeatState().beatCount;
    tick();
    tick();
    expect(getHeartbeatState().beatCount).toBe(before + 2);
  });

  it('receives constitutional reality from the Nervous System and tracks continuity per organ', () => {
    awaken();
    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'heart continuity test',
      content: null,
    });

    const record = getOrganContinuity('hujjah-al-damighah', CONSTITUTIONAL_RHYTHM);
    expect(record.status).toBe('continuous');
    expect(record.lastSeenAt).toBeTruthy();
  });

  it('honestly records an organ that has never reported as "never-observed" — never silently omitted', () => {
    const record = getOrganContinuity('sovereign-core', CONSTITUTIONAL_RHYTHM);
    expect(record.status).toBe('never-observed');
    expect(record.lastSeenAt).toBeNull();
  });

  it('records an organ as "silent" once the silence threshold has elapsed, and treats every organ with the identical formula (no privileged organ)', () => {
    awaken();
    const now = Date.now();

    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'silence test — ras-al-amr',
      content: null,
    });
    emitSignal({
      origin: 'makman-al-ghayah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'silence test — makman-al-ghayah',
      content: null,
    });

    const wellPast = now + CONSTITUTIONAL_RHYTHM.silenceThresholdMs + 1000;
    const rasStatus = getOrganContinuity('ras-al-amr', CONSTITUTIONAL_RHYTHM, wellPast);
    const makmanStatus = getOrganContinuity('makman-al-ghayah', CONSTITUTIONAL_RHYTHM, wellPast);

    // Both organs, evaluated identically, reach the same status from the
    // same elapsed time — no organ received different treatment.
    expect(rasStatus.status).toBe('silent');
    expect(makmanStatus.status).toBe('silent');
  });

  it('preserves continuity through a temporary interruption — a silent organ that reports again immediately returns to "continuous"', () => {
    awaken();
    const t0 = Date.now();

    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'interruption test — first report',
      content: null,
    });

    const duringSilence = t0 + CONSTITUTIONAL_RHYTHM.silenceThresholdMs + 1000;
    expect(getOrganContinuity('qiyamah-chamber', CONSTITUTIONAL_RHYTHM, duringSilence).status).toBe('silent');

    // The organ reports again — continuity is restored without any reset
    // or special handling, simply because the formula always reflects the
    // most recent signal.
    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'interruption test — recovered',
      content: null,
    });
    expect(getOrganContinuity('qiyamah-chamber', CONSTITUTIONAL_RHYTHM, Date.now()).status).toBe('continuous');

    // And the Heart itself never stopped beating throughout the interruption.
    expect(getHeartbeatState().awake).toBe(true);
  });

  it('evaluates every Skeleton-registered organ, not only ones that reported', () => {
    const all = listAllOrganContinuity(CONSTITUTIONAL_RHYTHM);
    const ids = all.map((record) => record.organId);
    expect(ids).toContain('sovereign-core'); // never implemented, never reports — still present
    expect(ids).toContain('hujjah-al-damighah');
    expect(all.length).toBe(12); // matches the Skeleton's full Organ Registry
  });
});
