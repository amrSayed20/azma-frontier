import {
  establishFirstConstitutionalMotion,
  verifyExecutionOrderPreserved,
  verifyNoNewResponsibilityIntroduced,
  verifyNoInterpretationOrTransformation,
  verifyNoAuthorityExercised,
  verifyManifestationNeverFabricated,
  getFirstConstitutionalMotionCertificationReport,
} from '../index';

describe('The First Constitutional Motion (Launch Integration Layer)', () => {
  it('establishes a complete Constitutional Motion from raw Creator input through all four certified Engines', () => {
    const motion = establishFirstConstitutionalMotion('what should i build next', 'text', 'makman-al-ghayah');

    expect(motion.presence.raw).toBe('what should i build next');
    expect(motion.presence.context).toBe('makman-al-ghayah');

    expect(motion.intent.raw).toBe('what should i build next');
    expect(motion.intent.context).toBe('makman-al-ghayah');

    expect(motion.voice.context).toBe('makman-al-ghayah');
    expect(motion.voice.intention).not.toBeNull();

    expect(motion.manifestation).not.toBeNull();
    expect(motion.manifestation!.subjectKey).toBe('makman-al-ghayah');
  });

  it('defaults subjectKey to context when not supplied', () => {
    const motion = establishFirstConstitutionalMotion('review this', 'text', 'sovereign-vault-palace');
    expect(motion.manifestation!.subjectKey).toBe('sovereign-vault-palace');
  });

  it('honestly preserves a null Manifestation when the given subjectKey has no evidence, even though the rest of the Motion is real', () => {
    const motion = establishFirstConstitutionalMotion('hello', 'voice', 'universal', 'not-a-real-subject-at-all');
    expect(motion.presence).toBeDefined();
    expect(motion.voice).toBeDefined();
    expect(motion.manifestation).toBeNull();
  });

  it('preserves execution order — Entry IV\'s output faithfully reaches Entry I', () => {
    expect(verifyExecutionOrderPreserved('continue', 'text', 'qiyamah-chamber').verified).toBe(true);
  });

  it('introduces no new Constitutional Responsibility beyond the four certified outputs', () => {
    expect(verifyNoNewResponsibilityIntroduced('should i proceed', 'text', 'ras-amr').verified).toBe(true);
  });

  it('never interprets or transforms the Creator\'s raw expression', () => {
    expect(verifyNoInterpretationOrTransformation('what if we tried another path', 'text', 'hujjah-al-damighah').verified).toBe(true);
  });

  it('exercises no constitutional authority', () => {
    expect(verifyNoAuthorityExercised('', 'silence', 'universal').verified).toBe(true);
  });

  it('never fabricates a Manifestation Entry II did not itself produce', () => {
    expect(verifyManifestationNeverFabricated('what now', 'text', 'makman-al-ghayah').verified).toBe(true);
  });

  it('produces a full 5-item Certification Report, all verified, for a complete Motion', () => {
    const report = getFirstConstitutionalMotionCertificationReport('what if we tried another path', 'text', 'makman-al-ghayah');
    expect(report.length).toBe(5);
    report.forEach((entry) => expect(entry.verified).toBe(true));
  });
});
