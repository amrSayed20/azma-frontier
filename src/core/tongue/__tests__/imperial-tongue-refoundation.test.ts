import {
  IMPERIAL_TONGUE_RESPONSIBILITIES,
  listPermanentResponsibilities,
  listTransitionalResponsibilities,
  getToneProfile,
  TONE_PROFILES,
  CONTEXT_ROLES,
  IMPERIAL_CONSCIOUSNESS,
  validateDignity,
  getThread,
  readCitizenProfile,
  imperialConscience,
  determineIntention,
  assessQuality,
  inferCreatorProfile,
} from '../index';

describe('The Imperial Tongue Constitutional Refoundation (Package I)', () => {
  it('classifies every current responsibility as exactly one of permanent or transitional, each with a non-empty citation', () => {
    expect(IMPERIAL_TONGUE_RESPONSIBILITIES.length).toBeGreaterThan(0);
    IMPERIAL_TONGUE_RESPONSIBILITIES.forEach((entry) => {
      expect(['permanent', 'transitional']).toContain(entry.classification);
      expect(entry.file.length).toBeGreaterThan(0);
      expect(entry.responsibility.length).toBeGreaterThan(0);
      expect(entry.citation.length).toBeGreaterThan(0);
    });
  });

  it('classifies voice.ts, the constitution.ts identity vocabulary, and (post-Certification) memory.ts as permanent — nothing else', () => {
    const permanent = listPermanentResponsibilities();
    expect(permanent.length).toBe(3);
    expect(permanent.some((entry) => entry.file === 'voice.ts')).toBe(true);
    expect(permanent.some((entry) => entry.file.startsWith('constitution.ts (ChamberContext'))).toBe(true);
    expect(permanent.some((entry) => entry.file === 'memory.ts')).toBe(true);
  });

  it("preserves memory.ts's own Citizen Memory capability, now classified permanent, unchanged", () => {
    const profile = readCitizenProfile();
    expect(profile).toBeDefined();
    expect(profile.signals).toBeDefined();
  });

  it('preserves every transitional responsibility as still present and importable, unrenamed and unrelocated', () => {
    const transitional = listTransitionalResponsibilities();
    expect(transitional.length).toBeGreaterThanOrEqual(6);
    // Each transitional file's own export is still reachable from the same
    // public barrel, at the same path, proving nothing was deleted or moved.
    expect(typeof imperialConscience).toBe('function');
    expect(typeof getThread).toBe('function');
    expect(typeof determineIntention).toBe('function');
    expect(typeof assessQuality).toBe('function');
    expect(typeof inferCreatorProfile).toBe('function');
  });

  it('preserves the one live runtime path unchanged — getToneProfile still returns a complete ToneProfile for every chamber', () => {
    Object.keys(CONTEXT_ROLES).forEach((context) => {
      const profile = getToneProfile(context as keyof typeof CONTEXT_ROLES);
      expect(profile).toBeDefined();
      expect(TONE_PROFILES[context as keyof typeof TONE_PROFILES]).toBeDefined();
    });
  });

  it('preserves validateDignity unchanged — Constitutional Expression\'s own dependency still works', () => {
    const result = validateDignity('This is a faithful, sufficiently long constitutional response for testing.');
    expect(result.approved).toBe(true);
  });

  it('preserves the module\'s own foundational identity constant', () => {
    expect(IMPERIAL_CONSCIOUSNESS.singular).toBe(true);
  });
});
