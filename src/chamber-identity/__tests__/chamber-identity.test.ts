import { CHAMBER_IDENTITY_PROFILES } from '../chamber-identity-registry';
import { getChamberIdentityProfileV2, listChamberIdentityProfilesV2 } from '../queries';
import type { ChamberId } from '../types';

const ALL_CHAMBER_IDS: readonly ChamberId[] = [
  'sovereign-vault-palace',
  'hujjah-al-damighah',
  'qiyamah-chamber',
  'ras-amr',
  'makman-al-ghayah',
];

describe('Chamber Identity V1', () => {
  it('defines a profile for every real Chamber', () => {
    for (const id of ALL_CHAMBER_IDS) {
      expect(CHAMBER_IDENTITY_PROFILES[id].chamberId).toBe(id);
    }
  });
});

describe('Chamber Identity V2 — composed from existing registries, not duplicated', () => {
  it('resolves every field for every Chamber, including Ras Al Amr\'s id bridge', () => {
    for (const id of ALL_CHAMBER_IDS) {
      const profile = getChamberIdentityProfileV2(id);
      expect(profile.constitutionalBoundaries.length).toBeGreaterThan(0);
      expect(profile.nonResponsibilities).toEqual(profile.constitutionalBoundaries);
      expect(profile.personality.length).toBeGreaterThan(0);
      expect(profile.communicationStyle.length).toBeGreaterThan(0);
      expect(profile.emotionalExperience.length).toBeGreaterThan(0);
      expect(profile.entryCondition.length).toBeGreaterThan(0);
      expect(profile.exitCondition.length).toBeGreaterThan(0);
      expect(Array.isArray(profile.relationships)).toBe(true);
    }
  });

  it('bridges the ras-amr / ras-al-amr id drift so boundaries genuinely resolve', () => {
    const profile = getChamberIdentityProfileV2('ras-amr');
    expect(profile.constitutionalBoundaries[0]).toMatch(/direction\/orchestration/);
  });

  it('finds the one real evidenced relationship between Makman and Ras Al Amr', () => {
    const makman = getChamberIdentityProfileV2('makman-al-ghayah');
    expect(makman.relationships.some((r) => r.otherChamberOrOrganId === 'ras-al-amr')).toBe(true);
  });

  it('lists all five composed profiles', () => {
    expect(listChamberIdentityProfilesV2()).toHaveLength(5);
  });
});
