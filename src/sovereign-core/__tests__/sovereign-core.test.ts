import { emitSignal, getSignalLog } from '../../sovereign-nervous-system';
import { awaken, rest, getHeartbeatState, resetContinuityTracking, CONSTITUTIONAL_RHYTHM } from '../../sovereign-heart';
import {
  getConstitutionalKnowledgeBase,
  getKnowledgeForOrgan,
  getConstitutionalMemoryForOrgan,
  getFullConstitutionalMemory,
  deriveUnderstandingForOrgan,
  reasonAboutOrgan,
  planForOrgan,
  adviseOnOrgan,
  getConstitutionalMindSnapshot,
} from '../index';

describe('The Sovereign Core (The Constitutional Mind)', () => {
  afterEach(() => {
    rest();
    resetContinuityTracking();
  });

  it("the Knowledge Registry reads the Skeleton's Organ Registry directly, without duplicating it", () => {
    const base = getConstitutionalKnowledgeBase();
    expect(base.length).toBe(12);
    expect(getKnowledgeForOrgan('sovereign-core')?.name).toBe('The Sovereign Core');
    expect(getKnowledgeForOrgan('does-not-exist')).toBeNull();
  });

  it('the Memory Integration Layer never alters historical truth — pure reads over the existing Signal Log', () => {
    awaken();
    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'core memory test',
      content: null,
    });
    const before = getSignalLog().length;
    getConstitutionalMemoryForOrgan('hujjah-al-damighah');
    getFullConstitutionalMemory();
    getConstitutionalMemoryForOrgan('hujjah-al-damighah');
    expect(getSignalLog().length).toBe(before);
  });

  it('Understanding is derived only from constitutional inputs (Skeleton + Nervous System + Heart), matching each independently', () => {
    awaken();
    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'core understanding test',
      content: null,
    });
    const understanding = deriveUnderstandingForOrgan('ras-al-amr');
    expect(understanding.knowledge?.id).toBe('ras-al-amr');
    expect(understanding.continuity.status).toBe('continuous');
    expect(understanding.memory.some((signal) => signal.purpose === 'core understanding test')).toBe(true);
    expect(understanding.observedSignalTypes).toContain('Health');
  });

  it('honestly reports uncertainty when asked about an organ id with no constitutional home, rather than fabricating knowledge', () => {
    const understanding = deriveUnderstandingForOrgan('not-a-real-organ');
    expect(understanding.knowledge).toBeNull();
    const claims = reasonAboutOrgan(understanding);
    expect(claims.length).toBe(1);
    expect(claims[0].kind).toBe('uncertainty');
  });

  it('grounds every Fact claim in the Skeleton\'s own recorded truth — never invents organ status', () => {
    const understanding = deriveUnderstandingForOrgan('makman-al-ghayah');
    const claims = reasonAboutOrgan(understanding);
    const registryFact = claims.find((claim) => claim.kind === 'fact' && claim.statement.includes('Organ Registry'));
    expect(registryFact?.statement).toContain('implemented-but-unconsumed');
  });

  it('distinguishes fact from uncertainty for an organ that has never reported a single signal', () => {
    const understanding = deriveUnderstandingForOrgan('sovereign-core');
    expect(understanding.continuity.status).toBe('never-observed');
    const claims = reasonAboutOrgan(understanding);
    expect(claims.some((claim) => claim.kind === 'fact')).toBe(true);
    expect(claims.some((claim) => claim.kind === 'uncertainty')).toBe(true);
  });

  it('distinguishes fact from inference for an organ that reported once and then fell silent', () => {
    awaken();
    const t0 = Date.now();
    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'reasoning silence test',
      content: null,
    });
    const wellPast = t0 + CONSTITUTIONAL_RHYTHM.silenceThresholdMs + 1000;
    const understanding = deriveUnderstandingForOrgan('qiyamah-chamber', wellPast);
    expect(understanding.continuity.status).toBe('silent');
    const claims = reasonAboutOrgan(understanding);
    expect(claims.some((claim) => claim.kind === 'fact')).toBe(true);
    expect(claims.some((claim) => claim.kind === 'inference')).toBe(true);
  });

  it('produces an advisory Recommendation only when justified — never fabricated', () => {
    const understanding = deriveUnderstandingForOrgan('sovereign-vault-palace');
    expect(understanding.memory.length).toBe(0); // never touched elsewhere in this test file
    const claims = reasonAboutOrgan(understanding);
    expect(claims.some((claim) => claim.kind === 'recommendation')).toBe(true);
  });

  it('the Planning Layer orders only recommendation-kind claims into an inert, advisory Plan', () => {
    const understanding = deriveUnderstandingForOrgan('sovereign-vault-palace');
    const claims = reasonAboutOrgan(understanding);
    const plan = planForOrgan('sovereign-vault-palace', claims);
    const recommendationClaims = claims.filter((claim) => claim.kind === 'recommendation');
    expect(plan.steps.length).toBe(recommendationClaims.length);
    plan.steps.forEach((step) => {
      expect(claims.some((claim) => claim.claimId === step.justifiedByClaimId)).toBe(true);
    });
  });

  it('the Advisory Layer synthesizes Understanding + Claims + Plan and never executes anything — zero observable side effects', () => {
    const logBefore = getSignalLog().length;
    const heartBefore = getHeartbeatState();
    const advisory = adviseOnOrgan('makman-al-ghayah');
    expect(advisory.organId).toBe('makman-al-ghayah');
    expect(advisory.claims.length).toBeGreaterThan(0);
    expect(advisory.plan.organId).toBe('makman-al-ghayah');
    expect(getSignalLog().length).toBe(logBefore);
    expect(getHeartbeatState()).toEqual(heartBefore);
  });

  it('produces a full Constitutional Mind snapshot covering every Skeleton-registered organ, not a partial sample', () => {
    const snapshot = getConstitutionalMindSnapshot();
    expect(snapshot.length).toBe(12);
    expect(snapshot.map((advisory) => advisory.organId)).toContain('sovereign-core');
  });
});
