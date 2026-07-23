import {
  receiveCreatorPresence,
  verifyFaithfullyPreservesRawPresence,
  verifyNeverInterpretsOrJudges,
  verifyNeverConstructsTongueIntent,
  verifyNoAuthorityExercised,
  getCreatorWelcomeCertificationReport,
} from '../index';

describe('The Creator Presence (Registry Entry III — The Creator Welcome Engine)', () => {
  it('faithfully preserves the raw presence exactly as it entered', () => {
    const presence = receiveCreatorPresence('what is the next step', 'text', 'makman-al-ghayah');
    expect(presence.raw).toBe('what is the next step');
    expect(presence.method).toBe('text');
    expect(presence.context).toBe('makman-al-ghayah');
    expect(presence.enteredAt).toBeGreaterThan(0);
  });

  it('preserves presence for every input method without transformation', () => {
    const silence = receiveCreatorPresence('', 'silence', 'qiyamah-chamber');
    expect(silence.method).toBe('silence');
    expect(silence.raw).toBe('');
  });

  it('never carries a TongueIntent-shaped field — priorTurns and outcomeType belong to the Imperial Tongue Engine alone', () => {
    const presence = receiveCreatorPresence('should i proceed', 'text', 'ras-amr');
    expect('priorTurns' in presence).toBe(false);
    expect('outcomeType' in presence).toBe(false);
  });

  it('produces identical output for identical input — proving no interpretation or judgment occurs', () => {
    expect(verifyNeverInterpretsOrJudges('review this', 'text', 'sovereign-vault-palace').verified).toBe(true);
  });

  it('exercises no constitutional authority', () => {
    expect(verifyNoAuthorityExercised('hello', 'voice', 'hujjah-al-damighah').verified).toBe(true);
  });

  it('produces a full 4-item Certification Report, all verified, for a raw arrival', () => {
    const report = getCreatorWelcomeCertificationReport('what if we tried another path', 'text', 'makman-al-ghayah');
    expect(report.length).toBe(4);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyFaithfullyPreservesRawPresence('x', 'text', 'universal').verified).toBe(true);
    expect(verifyNeverConstructsTongueIntent('x', 'text', 'universal').verified).toBe(true);
  });
});
