import { emitSignal } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking } from '../../sovereign-heart';
import { beginConstitutionalThought, endConstitutionalThought, resetPerceptionIntake } from '../../sovereign-core';
import { beginConstitutionalObservation, endConstitutionalObservation, resetObservationLayer } from '../../sovereign-consciousness';
import { beginConstitutionalRemembering, endConstitutionalRemembering, resetKnowledgeRepository } from '../../sovereign-memory';
import { beginContinuousMaturityTracking, endContinuousMaturityTracking, resetImprovementRegistry } from '../../sovereign-evolution';
import {
  CONSTITUTIONAL_RECEPTION_QUESTIONS,
  CONSTITUTIONAL_RECIPIENTS,
  isAuthorizedRecipient,
  beginConstitutionalReception,
  endConstitutionalReception,
  isReceiving,
  getReceptionQueue,
  getReceptionQueueForOrgan,
  resetReceptionQueue,
  ATTENTION_THRESHOLD,
  prioritizeReceivedExpressions,
  deliverToRecipient,
  verifyEveryReceptionOriginatesFromExpressionLayer,
  verifyNoOrganCommunicatesDirectlyWithRecipient,
  verifyReceptionPreservesDignity,
  verifyConstitutionalPriorityRespected,
  verifyUnauthorizedReceptionNeverOccurs,
  getConstitutionalReceptionCertificationReport,
} from '../index';

describe('The Constitutional Reception (The Imperial Listener)', () => {
  afterEach(() => {
    endConstitutionalReception();
    resetReceptionQueue();
    endConstitutionalThought();
    resetPerceptionIntake();
    endConstitutionalObservation();
    resetObservationLayer();
    endConstitutionalRemembering();
    resetKnowledgeRepository();
    endContinuousMaturityTracking();
    resetImprovementRegistry();
    rest();
    resetContinuityTracking();
  });

  function activateEverything(): void {
    awaken();
    beginConstitutionalThought();
    beginConstitutionalObservation();
    beginConstitutionalRemembering();
    beginContinuousMaturityTracking();
    beginConstitutionalReception();
  }

  it('names the 4 questions this Campaign\'s own Mission asks', () => {
    expect(CONSTITUTIONAL_RECEPTION_QUESTIONS.length).toBe(4);
  });

  it('registers exactly 2 recipients, both authorized, honestly marked as not yet connected to any live consumer', () => {
    expect(CONSTITUTIONAL_RECIPIENTS.length).toBe(2);
    CONSTITUTIONAL_RECIPIENTS.forEach((recipient) => {
      expect(recipient.authorized).toBe(true);
      expect(recipient.connected).toBe(false);
    });
    expect(isAuthorizedRecipient('constitutional-council')).toBe(true);
    expect(isAuthorizedRecipient('an-unregistered-recipient')).toBe(false);
  });

  it('receives a real composed expression once activated, and only for organs that actually reported', () => {
    activateEverything();
    expect(isReceiving()).toBe(true);

    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'reception queue test',
      content: null,
    });

    const queue = getReceptionQueueForOrgan('hujjah-al-damighah');
    expect(queue.length).toBeGreaterThan(0);
    expect(queue[0].expression.organId).toBe('hujjah-al-damighah');
  });

  it('flags broadly-corroborated organs for attention, and leaves narrowly-observed ones silent', () => {
    // Broad corroboration: all 5 sources active for this organ.
    activateEverything();
    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'reception attention test — broad',
      content: null,
    });
    const broad = getReceptionQueueForOrgan('ras-al-amr');
    expect(broad[broad.length - 1].expression.contributingSources.length).toBeGreaterThanOrEqual(ATTENTION_THRESHOLD);
    expect(broad[broad.length - 1].deservesAttention).toBe(true);
  });

  it('leaves narrowly-observed organs silent — few contributing sources, no attention flag', () => {
    // Only the Heart and Reception itself are active — narrow corroboration.
    awaken();
    beginConstitutionalReception();
    emitSignal({
      origin: 'makman-al-ghayah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'reception attention test — narrow',
      content: null,
    });
    const narrow = getReceptionQueueForOrgan('makman-al-ghayah');
    expect(narrow[narrow.length - 1].expression.contributingSources.length).toBeLessThan(ATTENTION_THRESHOLD);
    expect(narrow[narrow.length - 1].deservesAttention).toBe(false);
  });

  it('the Priority Receiver orders attention-worthy receptions before silent ones', () => {
    activateEverything();
    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'reception priority test',
      content: null,
    });
    const prioritized = prioritizeReceivedExpressions(getReceptionQueue());
    const firstSilentIndex = prioritized.findIndex((entry) => !entry.deservesAttention);
    if (firstSilentIndex !== -1) {
      expect(prioritized.slice(0, firstSilentIndex).every((entry) => entry.deservesAttention)).toBe(true);
    }
  });

  it('refuses delivery to an unauthorized recipient, and succeeds for an authorized one', () => {
    activateEverything();
    emitSignal({
      origin: 'sovereign-vault-palace',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-vault-palace',
      purpose: 'reception delivery test',
      content: null,
    });
    const entry = getReceptionQueueForOrgan('sovereign-vault-palace')[0];

    const unauthorized = deliverToRecipient('an-unregistered-recipient', entry);
    expect(unauthorized.delivered).toBe(false);

    const authorized = deliverToRecipient('sovereign-creator', entry);
    expect(authorized.delivered).toBe(true);
  });

  it('produces a full 5-item Certification Report, all verified, once the Body has received something', () => {
    activateEverything();
    emitSignal({
      origin: 'sovereign-capability-diwan',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-capability-diwan',
      purpose: 'reception certification test',
      content: null,
    });

    const report = getConstitutionalReceptionCertificationReport();
    expect(report.length).toBe(5);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyEveryReceptionOriginatesFromExpressionLayer().verified).toBe(true);
    expect(verifyNoOrganCommunicatesDirectlyWithRecipient().verified).toBe(true);
    expect(verifyReceptionPreservesDignity().verified).toBe(true);
    expect(verifyConstitutionalPriorityRespected().verified).toBe(true);
    expect(verifyUnauthorizedReceptionNeverOccurs().verified).toBe(true);
  });
});
