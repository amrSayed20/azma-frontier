import { emitSignal, getSignalLog } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking, getHeartbeatState } from '../../sovereign-heart';
import {
  CONSTITUTIONAL_MEMORY_TIERS,
  getFullHistory,
  getHistoryForOrgan,
  getHistoryWithinRange,
  verifyHistoryImmutable,
  beginConstitutionalRemembering,
  endConstitutionalRemembering,
  isRemembering,
  getKnowledgeHistoryForOrgan,
  getFullKnowledgeRepository,
  resetKnowledgeRepository,
  getFullWisdomArchive,
  getWisdomForOrgan,
  getExperienceTimeline,
  getCreatorJourney,
  getRelationshipMemory,
  verifyHistoryRemainsImmutable,
  verifyDIKWDistinction,
  verifyIdentityPreservedAcrossHistory,
  verifyRelationshipsHistoricallyTraceable,
  verifyCreatorJourneysFaithfullyPreserved,
  verifyNoAuthorityExercised,
  getConstitutionalMemoryCertificationReport,
} from '../index';

describe('The Constitutional Memory (The Living Memory)', () => {
  afterEach(() => {
    endConstitutionalRemembering();
    resetKnowledgeRepository();
    rest();
    resetContinuityTracking();
  });

  it('names exactly the 4-tier DIKW hierarchy, each mapped to a different already-certified type', () => {
    expect(CONSTITUTIONAL_MEMORY_TIERS.map((entry) => entry.tier)).toEqual([
      'Data',
      'Information',
      'Knowledge',
      'Wisdom',
    ]);
  });

  it('the History Archive reflects real emitted signals — full, per-organ, and within a time range', () => {
    const before = getFullHistory().length;
    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'memory history-archive test',
      content: null,
    });
    expect(getFullHistory().length).toBe(before + 1);

    const forOrgan = getHistoryForOrgan('hujjah-al-damighah');
    expect(forOrgan.some((s) => s.purpose === 'memory history-archive test')).toBe(true);

    const inRange = getHistoryWithinRange('1970-01-01T00:00:00.000Z', new Date(Date.now() + 60_000).toISOString());
    expect(inRange.some((s) => s.purpose === 'memory history-archive test')).toBe(true);
  });

  it('confirms history is immutable — an earlier snapshot\'s prefix remains untouched as the archive grows', () => {
    const snapshot = getFullHistory();
    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'memory immutability test',
      content: null,
    });
    const result = verifyHistoryImmutable(snapshot);
    expect(result.immutable).toBe(true);
  });

  it('the Knowledge Repository accumulates every Advisory over time, unlike the Core\'s own overwriting cache', () => {
    awaken();
    beginConstitutionalRemembering();
    expect(isRemembering()).toBe(true);

    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'memory knowledge-repository test 1',
      content: null,
    });
    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'memory knowledge-repository test 2',
      content: null,
    });

    const history = getKnowledgeHistoryForOrgan('qiyamah-chamber');
    expect(history.length).toBe(2); // both preserved, neither overwritten
  });

  it('is idempotent — beginning remembering twice does not create a duplicate subscription', () => {
    awaken();
    beginConstitutionalRemembering();
    beginConstitutionalRemembering();
    const before = getFullKnowledgeRepository().length;

    emitSignal({
      origin: 'makman-al-ghayah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'memory idempotency test',
      content: null,
    });

    expect(getFullKnowledgeRepository().length).toBe(before + 1);
  });

  it('stops remembering once ended, and resetKnowledgeRepository clears the archive', () => {
    awaken();
    beginConstitutionalRemembering();
    emitSignal({
      origin: 'sovereign-vault-palace',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-vault-palace',
      purpose: 'memory stop test',
      content: null,
    });
    endConstitutionalRemembering();
    expect(isRemembering()).toBe(false);

    const countAtStop = getFullKnowledgeRepository().length;
    emitSignal({
      origin: 'sovereign-vault-palace',
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'sovereign-vault-palace',
      purpose: 'memory stop test — after end',
      content: null,
    });
    expect(getFullKnowledgeRepository().length).toBe(countAtStop);

    resetKnowledgeRepository();
    expect(getFullKnowledgeRepository().length).toBe(0);
  });

  it('the Wisdom Archive\'s filter never leaks a non-recommendation claim, even as the Knowledge Repository accumulates fact/uncertainty claims alongside it', () => {
    awaken();
    beginConstitutionalRemembering();
    emitSignal({
      origin: 'sovereign-vault-palace',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-vault-palace',
      purpose: 'memory wisdom-archive test',
      content: null,
    });

    // DISCLOSED FINDING (see PHASE_VIII_ENGINEERING_REVIEW.ts): the Core's
    // only recommendation-producing rule requires an organ's memory to be
    // empty, which can never be true for an organ analyzed as a reaction to
    // its OWN just-emitted signal — that signal is already in its memory
    // by the time any subscriber runs. So this archived Advisory contains
    // non-recommendation claims (fact, at least), never a recommendation,
    // through this live pathway — proving the Wisdom Archive's filter
    // correctly excludes them, rather than asserting a recommendation
    // that this pathway cannot actually produce.
    const knowledge = getKnowledgeHistoryForOrgan('sovereign-vault-palace');
    expect(knowledge.length).toBeGreaterThan(0);
    expect(knowledge[0].advisory.claims.some((claim) => claim.kind !== 'recommendation')).toBe(true);

    const wisdomForOrgan = getWisdomForOrgan('sovereign-vault-palace');
    expect(wisdomForOrgan.length).toBe(0);
    getFullWisdomArchive().forEach((record) => expect(record.claim.kind).toBe('recommendation'));
  });

  it('the Experience Timeline merges signals and archived advisories in chronological order', () => {
    awaken();
    beginConstitutionalRemembering();
    emitSignal({
      origin: 'sovereign-capability-diwan',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-capability-diwan',
      purpose: 'memory timeline test',
      content: null,
    });

    const timeline = getExperienceTimeline();
    expect(timeline.some((entry) => entry.kind === 'signal' && entry.organId === 'sovereign-capability-diwan')).toBe(true);
    expect(timeline.some((entry) => entry.kind === 'advisory' && entry.organId === 'sovereign-capability-diwan')).toBe(true);
    for (let i = 1; i < timeline.length; i += 1) {
      expect(timeline[i].timestamp >= timeline[i - 1].timestamp).toBe(true);
    }
  });

  it('the Creator Journey lens returns the Sovereign Tongue\'s own ConversationThread shape, disclosed as session-scoped', () => {
    const snapshot = getCreatorJourney();
    expect(typeof snapshot.thread.sessionId).toBe('string');
    expect(Array.isArray(snapshot.thread.chamberHistory)).toBe(true);
    expect(snapshot.source).toContain('core/tongue');
  });

  it('Relationship Memory cross-references every declared relationship, and recognizes both organs once observed', () => {
    const before = getRelationshipMemory();
    expect(before.length).toBe(4);

    emitSignal({
      origin: 'makman-al-ghayah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'memory relationship test — makman',
      content: null,
    });
    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'memory relationship test — ras-al-amr',
      content: null,
    });

    const after = getRelationshipMemory();
    const makmanRasRelationship = after.find(
      (record) => record.fromOrganId === 'makman-al-ghayah' && record.toOrganId === 'ras-al-amr',
    );
    expect(makmanRasRelationship?.bothOrgansEverObserved).toBe(true);
  });

  it('exercises no constitutional authority — remains read-only with respect to the Living Body', () => {
    const logBefore = getSignalLog().length;
    const heartBefore = getHeartbeatState();
    getFullHistory();
    getRelationshipMemory();
    getCreatorJourney();
    getFullWisdomArchive();
    expect(getSignalLog().length).toBe(logBefore);
    expect(getHeartbeatState()).toEqual(heartBefore);
  });

  it('produces a full 6-item Certification Report, all verified', () => {
    awaken();
    beginConstitutionalRemembering();
    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'memory certification test',
      content: null,
    });

    const report = getConstitutionalMemoryCertificationReport();
    expect(report.length).toBe(6);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyHistoryRemainsImmutable().verified).toBe(true);
    expect(verifyDIKWDistinction().verified).toBe(true);
    expect(verifyIdentityPreservedAcrossHistory().verified).toBe(true);
    expect(verifyRelationshipsHistoricallyTraceable().verified).toBe(true);
    expect(verifyCreatorJourneysFaithfullyPreserved().verified).toBe(true);
    expect(verifyNoAuthorityExercised().verified).toBe(true);
  });
});
