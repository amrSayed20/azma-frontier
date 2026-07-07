import {
  mayGhostGuideIntervene,
  mayCompanionSpeak,
  mayInvisibleDirectorChangeRhythm,
  isChamberSilent,
  RUNTIME_INVARIANTS,
  type TimingContext,
} from '../contracts';

function baseContext(overrides: Partial<TimingContext> = {}): TimingContext {
  return {
    lifecycleStage: 'Directing',
    decision: { citizenState: 'flow', creativeDecisionRegistered: false },
    ghostGuide: { mode: 'silent', hasSpokenOnCurrentDirection: false },
    companion: { mode: 'leads' },
    director: { mode: 'watching' },
    rendering: null,
    ...overrides,
  };
}

describe('Ghost Guide intervention timing', () => {
  it('may intervene when silent, unspoken, and no decision registered', () => {
    expect(mayGhostGuideIntervene(baseContext())).toBe(true);
  });

  it('may not intervene after already speaking on the current direction', () => {
    expect(mayGhostGuideIntervene(baseContext({ ghostGuide: { mode: 'silent', hasSpokenOnCurrentDirection: true } }))).toBe(false);
  });

  it('may not intervene once a Citizen decision is registered', () => {
    expect(mayGhostGuideIntervene(baseContext({ decision: { citizenState: 'clarity', creativeDecisionRegistered: true } }))).toBe(false);
  });

  it('may not intervene while already present', () => {
    expect(mayGhostGuideIntervene(baseContext({ ghostGuide: { mode: 'present', hasSpokenOnCurrentDirection: false } }))).toBe(false);
  });
});

describe('Companion speaking timing', () => {
  it('may speak in any constitutional mode before a Citizen decision', () => {
    expect(mayCompanionSpeak(baseContext({ companion: { mode: 'challenges' } }))).toBe(true);
  });

  it('is unconditionally restricted to follows after a Citizen decision', () => {
    const decided = { citizenState: 'clarity' as const, creativeDecisionRegistered: true };
    expect(mayCompanionSpeak(baseContext({ decision: decided, companion: { mode: 'follows' } }))).toBe(true);
    expect(mayCompanionSpeak(baseContext({ decision: decided, companion: { mode: 'leads' } }))).toBe(false);
  });
});

describe('Invisible Director rhythm-change timing', () => {
  it('may change rhythm while watching or intervening, outside Rendering', () => {
    expect(mayInvisibleDirectorChangeRhythm(baseContext({ lifecycleStage: 'Creating', director: { mode: 'watching' } }))).toBe(true);
    expect(mayInvisibleDirectorChangeRhythm(baseContext({ lifecycleStage: 'Creating', director: { mode: 'intervening' } }))).toBe(true);
  });

  it('may never change rhythm during Rendering, regardless of mode', () => {
    expect(mayInvisibleDirectorChangeRhythm(baseContext({ lifecycleStage: 'Rendering', director: { mode: 'watching' } }))).toBe(false);
  });

  it('may not change rhythm while already withdrawn', () => {
    expect(mayInvisibleDirectorChangeRhythm(baseContext({ lifecycleStage: 'Creating', director: { mode: 'withdrawn' } }))).toBe(false);
  });
});

describe('Chamber silence timing', () => {
  it('is silent only during Rendering while actively presenting', () => {
    expect(isChamberSilent(baseContext({ lifecycleStage: 'Rendering', rendering: { presentation: 'presenting', recessionComplete: true } }))).toBe(true);
  });

  it('is not silent during Rendering before presentation begins', () => {
    expect(isChamberSilent(baseContext({ lifecycleStage: 'Rendering', rendering: { presentation: 'awaiting', recessionComplete: false } }))).toBe(false);
  });

  it('is not silent outside Rendering', () => {
    expect(isChamberSilent(baseContext({ lifecycleStage: 'Reflecting', rendering: { presentation: 'encounter-complete', recessionComplete: true } }))).toBe(false);
  });
});

describe('Runtime Invariants', () => {
  it('is a non-empty, fully traceable list', () => {
    expect(RUNTIME_INVARIANTS.length).toBeGreaterThan(0);
    for (const invariant of RUNTIME_INVARIANTS) {
      expect(invariant.id).toBeTruthy();
      expect(invariant.rule).toBeTruthy();
      expect(invariant.source).toBeTruthy();
    }
  });
});
