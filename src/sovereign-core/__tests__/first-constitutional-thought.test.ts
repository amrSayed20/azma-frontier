import { emitSignal, getSignalLog } from '../../sovereign-nervous-system';
import { ingestCirculatedSignal } from '../../sovereign-circulation';
import { awaken, rest, getHeartbeatState, resetContinuityTracking } from '../../sovereign-heart';
import {
  beginConstitutionalThought,
  endConstitutionalThought,
  isThinking,
  getLatestAdvisoryForOrgan,
  getReceivedSignalCount,
  resetPerceptionIntake,
  getConstitutionalMemoryForOrgan,
  getFullConstitutionalMemory,
} from '../index';

describe('Integration Package: The First Constitutional Thought', () => {
  afterEach(() => {
    endConstitutionalThought();
    resetPerceptionIntake();
    rest();
    resetContinuityTracking();
  });

  it('the Core receives constitutional perception from the Nervous System once it begins thinking', () => {
    beginConstitutionalThought();
    expect(isThinking()).toBe(true);
    const before = getReceivedSignalCount();

    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'first thought perception test',
      content: null,
    });

    expect(getReceivedSignalCount()).toBe(before + 1);
    expect(getLatestAdvisoryForOrgan('hujjah-al-damighah')).not.toBeNull();
  });

  it('the Core receives constitutional circulation — a signal delivered via Circulation\'s own ingestion path reaches the same subscription, without a second transport', () => {
    beginConstitutionalThought();
    const before = getReceivedSignalCount();

    const result = ingestCirculatedSignal({
      origin: 'makman-al-ghayah',
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'first thought circulation test',
      content: null,
    });

    expect(result.circulated).toBe(true);
    expect(getReceivedSignalCount()).toBe(before + 1);
    expect(getLatestAdvisoryForOrgan('makman-al-ghayah')).not.toBeNull();
  });

  it('the Core receives constitutional memory — read-only, never altering historical truth', () => {
    beginConstitutionalThought();
    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'first thought memory test',
      content: null,
    });

    const logBefore = getSignalLog().length;
    const memory = getConstitutionalMemoryForOrgan('ras-al-amr');
    getFullConstitutionalMemory();
    expect(memory.some((signal) => signal.purpose === 'first thought memory test')).toBe(true);
    expect(getSignalLog().length).toBe(logBefore);
  });

  it('produces constitutional recommendations without ever executing them', () => {
    beginConstitutionalThought();
    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'first thought recommendation test',
      content: null,
    });

    const advisory = getLatestAdvisoryForOrgan('qiyamah-chamber');
    expect(advisory?.claims.length).toBeGreaterThan(0);
    expect(advisory?.plan.organId).toBe('qiyamah-chamber');
  });

  it('every produced claim preserves constitutional law — grounded in the Skeleton\'s own recorded truth, never invented', () => {
    beginConstitutionalThought();
    emitSignal({
      origin: 'sovereign-vault-palace',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-vault-palace',
      purpose: 'first thought law-fidelity test',
      content: null,
    });

    const advisory = getLatestAdvisoryForOrgan('sovereign-vault-palace');
    const registryFact = advisory?.claims.find(
      (claim) => claim.kind === 'fact' && claim.statement.includes('Organ Registry'),
    );
    expect(registryFact?.statement).toContain('implemented-but-unconsumed');
  });

  it('exercises no constitutional authority — the Core remains completely read-only with respect to the Living Body', () => {
    const logBefore = getSignalLog().length;
    const heartBefore = getHeartbeatState();
    beginConstitutionalThought();

    emitSignal({
      origin: 'sovereign-tongue',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-tongue',
      purpose: 'first thought read-only test',
      content: null,
    });
    getLatestAdvisoryForOrgan('sovereign-tongue');

    // The Core's own reaction to the signal is the +1 in the log (the
    // signal itself, emitted by the test, not by the Core) — the Core's
    // subscription and advisory derivation never call emitSignal,
    // circulateFromClient, awaken, or rest themselves.
    expect(getSignalLog().length).toBe(logBefore + 1);
    expect(getHeartbeatState()).toEqual(heartBefore);
  });

  it('is idempotent — beginning constitutional thought twice does not create a duplicate subscription', () => {
    beginConstitutionalThought();
    beginConstitutionalThought();
    const before = getReceivedSignalCount();

    emitSignal({
      origin: 'sovereign-capability-diwan',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-capability-diwan',
      purpose: 'first thought idempotency test',
      content: null,
    });

    expect(getReceivedSignalCount()).toBe(before + 1);
  });

  it('stops receiving once ended, and resetPerceptionIntake clears the cache', () => {
    beginConstitutionalThought();
    emitSignal({
      origin: 'global-ui-runtime',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'global-ui-runtime',
      purpose: 'first thought stop test',
      content: null,
    });
    endConstitutionalThought();
    expect(isThinking()).toBe(false);

    const countAtStop = getReceivedSignalCount();
    emitSignal({
      origin: 'global-ui-runtime',
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'global-ui-runtime',
      purpose: 'first thought stop test — after end',
      content: null,
    });
    expect(getReceivedSignalCount()).toBe(countAtStop);

    resetPerceptionIntake();
    expect(getReceivedSignalCount()).toBe(0);
    expect(getLatestAdvisoryForOrgan('global-ui-runtime')).toBeNull();
  });

  it('remains connected to Al-Wateen — advisories reflect the Heart\'s own continuity determination, not a re-derived one', () => {
    awaken();
    beginConstitutionalThought();
    emitSignal({
      origin: 'sovereign-core',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-core',
      purpose: 'first thought Al-Wateen connection test',
      content: null,
    });

    const advisory = getLatestAdvisoryForOrgan('sovereign-core');
    expect(advisory?.understanding.continuity.status).toBe('continuous');
  });
});
