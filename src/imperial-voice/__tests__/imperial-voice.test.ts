import {
  composeImperialVoice,
  isIdentityCurrentlyPreserved,
  verifyProducesImperialVoice,
  verifyNeverFabricatesCitizenIntention,
  verifyNoAuthorityExercised,
  verifyPreservesConstitutionalIdentity,
  verifyNeverBecomesConstitutionalMemory,
  getImperialVoiceCertificationReport,
} from '../index';
import type { TongueIntent } from '../../core/tongue';

describe('The Imperial Voice (Registry Entry I — The Imperial Tongue Engine)', () => {
  it('composes a complete Imperial Voice for a Chamber context, with intention honestly null when no real Citizen expression is supplied', () => {
    const voice = composeImperialVoice('hujjah-al-damighah');
    expect(voice.context).toBe('hujjah-al-damighah');
    expect(voice.tone.vocabularyChar).toBe('scholarly');
    expect(voice.citizenProfile).toBeDefined();
    expect(voice.creatorProfile).toBeDefined();
    expect(voice.intention).toBeNull();
  });

  it('derives Citizen Intention only when a real TongueIntent is supplied — never fabricates one', () => {
    const intent: TongueIntent = {
      raw: 'what is the next step',
      method: 'text',
      context: 'makman-al-ghayah',
      timestamp: Date.now(),
      priorTurns: 2,
    };
    const voice = composeImperialVoice('makman-al-ghayah', intent);
    expect(voice.intention).not.toBeNull();
    expect(voice.intention!.outcomeType).toBe('momentum');
  });

  it("derives Creator Service directly from Citizen Memory's own profile, never independently", () => {
    const voice = composeImperialVoice('universal');
    expect(voice.creatorProfile.rhythm).toBeDefined();
    expect(voice.creatorProfile.confidence).toBeDefined();
  });

  it("reads (never re-derives) src/imperial-presence/'s own Identity Certification for identityPreserved", () => {
    expect(isIdentityCurrentlyPreserved()).toBe(true);
    const voice = composeImperialVoice('universal');
    expect(voice.identityPreserved).toBe(true);
  });

  it('exercises no constitutional authority — remains read-only with respect to the Living Body', () => {
    expect(verifyNoAuthorityExercised('qiyamah-chamber').verified).toBe(true);
  });

  it("never becomes Constitutional Memory — Citizen Memory's own profile is unchanged by composing", () => {
    expect(verifyNeverBecomesConstitutionalMemory('ras-amr').verified).toBe(true);
  });

  it('produces a full 5-item Certification Report, all verified, for a Chamber context', () => {
    const report = getImperialVoiceCertificationReport('sovereign-vault-palace');
    expect(report.length).toBe(5);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyProducesImperialVoice('sovereign-vault-palace').verified).toBe(true);
    expect(verifyNeverFabricatesCitizenIntention('sovereign-vault-palace').verified).toBe(true);
    expect(verifyPreservesConstitutionalIdentity('sovereign-vault-palace').verified).toBe(true);
  });
});
