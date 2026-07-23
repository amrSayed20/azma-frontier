import { receiveCreatorPresence } from '../../creator-presence';
import {
  prepareTongueIntent,
  verifyFaithfullyPreservesCreatorPresenceFields,
  verifyNeverModifiesCreatorPresence,
  verifyNeverRequiresContinuityOrPriorTurns,
  verifyPlaceholderIsDocumentedAsTemporaryNotConstitutional,
  verifyProducesOnlyAFaithfulTongueIntent,
  verifyNoAuthorityExercised,
  getConstitutionalListeningCertificationReport,
} from '../index';

describe('Faithful Constitutional Listening (Registry Entry IV)', () => {
  it('faithfully prepares a TongueIntent from a Creator Presence, preserving every field exactly', () => {
    const presence = receiveCreatorPresence('what should i do next', 'text', 'makman-al-ghayah');
    const intent = prepareTongueIntent(presence);
    expect(intent.raw).toBe('what should i do next');
    expect(intent.method).toBe('text');
    expect(intent.context).toBe('makman-al-ghayah');
    expect(intent.timestamp).toBe(presence.enteredAt);
  });

  it('stores a fixed compatibility placeholder for priorTurns — not a claim that zero prior turns were observed', () => {
    const presence = receiveCreatorPresence('continue', 'text', 'qiyamah-chamber');
    const intent = prepareTongueIntent(presence);
    expect(intent.priorTurns).toBe(0);
  });

  it("documents the priorTurns placeholder as a temporary compatibility measure, never a Constitutional claim of knowledge", () => {
    const presence = receiveCreatorPresence('what now', 'text', 'ras-amr');
    expect(verifyPlaceholderIsDocumentedAsTemporaryNotConstitutional(presence).verified).toBe(true);
  });

  it('never modifies the Creator Presence it prepares from', () => {
    const presence = receiveCreatorPresence('review this', 'text', 'sovereign-vault-palace');
    expect(verifyNeverModifiesCreatorPresence(presence).verified).toBe(true);
  });

  it('never requires Conversation Continuity or priorTurns as an input', () => {
    const presence = receiveCreatorPresence('hello', 'voice', 'hujjah-al-damighah');
    expect(verifyNeverRequiresContinuityOrPriorTurns(presence).verified).toBe(true);
  });

  it('produces only a faithful TongueIntent shape — nothing enriched, nothing Voice-shaped', () => {
    const presence = receiveCreatorPresence('should i proceed', 'text', 'ras-amr');
    expect(verifyProducesOnlyAFaithfulTongueIntent(presence).verified).toBe(true);
  });

  it('exercises no constitutional authority', () => {
    const presence = receiveCreatorPresence('', 'silence', 'universal');
    expect(verifyNoAuthorityExercised(presence).verified).toBe(true);
  });

  it('produces a full 6-item Certification Report, all verified, for a Creator Presence', () => {
    const presence = receiveCreatorPresence('what if we tried another path', 'text', 'makman-al-ghayah');
    const report = getConstitutionalListeningCertificationReport(presence);
    expect(report.length).toBe(6);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyFaithfullyPreservesCreatorPresenceFields(presence).verified).toBe(true);
  });
});
