import {
  RUNTIME_SIGNAL_KINDS,
  RUNTIME_SIGNAL_EMITTERS,
  RUNTIME_SIGNAL_VISIBILITY,
  isPermittedEmitter,
  visibilityOf,
  isCitizenVisibleEffect,
} from '../signals';

describe('Runtime Signals', () => {
  it('declares exactly sixteen named signals', () => {
    expect(RUNTIME_SIGNAL_KINDS).toHaveLength(16);
  });

  it('gives every signal exactly one emitter table and one visibility class', () => {
    for (const kind of RUNTIME_SIGNAL_KINDS) {
      expect(RUNTIME_SIGNAL_EMITTERS[kind]).toBeDefined();
      expect(RUNTIME_SIGNAL_EMITTERS[kind].length).toBeGreaterThan(0);
      expect(RUNTIME_SIGNAL_VISIBILITY[kind]).toBeDefined();
    }
  });

  it('permits only the Citizen to emit CitizenExpression', () => {
    expect(isPermittedEmitter('CitizenExpression', 'Citizen')).toBe(true);
    expect(isPermittedEmitter('CitizenExpression', 'PursuitEngine')).toBe(false);
  });

  it('permits only PursuitEngine to emit MarkerConfirmationSignal', () => {
    expect(isPermittedEmitter('MarkerConfirmationSignal', 'PursuitEngine')).toBe(true);
    expect(isPermittedEmitter('MarkerConfirmationSignal', 'RevealCoordinator')).toBe(false);
  });

  it('permits both PursuitEngine and RevealCoordinator to emit CreativeActStateSignal', () => {
    expect(isPermittedEmitter('CreativeActStateSignal', 'PursuitEngine')).toBe(true);
    expect(isPermittedEmitter('CreativeActStateSignal', 'RevealCoordinator')).toBe(true);
    expect(isPermittedEmitter('CreativeActStateSignal', 'NarrativeClock')).toBe(false);
  });

  it('classifies internal-only signals as never a citizen-visible effect', () => {
    expect(visibilityOf('TrustDepthSignal')).toBe('INTERNAL_ONLY');
    expect(isCitizenVisibleEffect('TrustDepthSignal')).toBe(false);
  });

  it('classifies felt-effect and citizen-originated signals as citizen-visible effects', () => {
    expect(isCitizenVisibleEffect('StoryBeatDeclaration')).toBe(true);
    expect(isCitizenVisibleEffect('CitizenExpression')).toBe(true);
  });
});
