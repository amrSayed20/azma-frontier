import { emitSignal } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking } from '../../sovereign-heart';
import { beginConstitutionalThought, endConstitutionalThought, resetPerceptionIntake } from '../../sovereign-core';
import { beginConstitutionalObservation, endConstitutionalObservation, resetObservationLayer } from '../../sovereign-consciousness';
import { beginConstitutionalRemembering, endConstitutionalRemembering, resetKnowledgeRepository } from '../../sovereign-memory';
import { beginContinuousMaturityTracking, endContinuousMaturityTracking, resetImprovementRegistry } from '../../sovereign-evolution';
import {
  CONSTITUTIONAL_SOURCES,
  gatherFromImperialTongue,
  gatherFromConstitutionalExpression,
  gatherFromAllSources,
  isIdentityCurrentlyPreserved,
  composeManifestationForSubject,
  verifySupportsMultipleSources,
  verifyNeverCreatesConstitutionalTruth,
  verifyNeverFiltersOrPrioritizes,
  verifyPreservesConstitutionalIdentity,
  verifyNoAuthorityExercised,
  getConstitutionalManifestationCertificationReport,
} from '../index';

describe('The Constitutional Manifestation System (Package II)', () => {
  afterEach(() => {
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

  function activateAllSources(): void {
    awaken();
    beginConstitutionalThought();
    beginConstitutionalObservation();
    beginConstitutionalRemembering();
    beginContinuousMaturityTracking();
  }

  it('registers exactly the 2 Constitutional Sources named by the Constitutional Decision', () => {
    expect(CONSTITUTIONAL_SOURCES.length).toBe(2);
    expect(CONSTITUTIONAL_SOURCES.map((s) => s.sourceId)).toEqual(['imperial-tongue', 'constitutional-expression']);
  });

  it("gathers from the Imperial Tongue for a valid chamber context, honestly returning null for an invalid one", () => {
    expect(gatherFromImperialTongue('hujjah-al-damighah')).not.toBeNull();
    expect(gatherFromImperialTongue('not-a-real-chamber')).toBeNull();
  });

  it('gathers from Constitutional Expression only when it has real evidence for the subject', () => {
    expect(gatherFromConstitutionalExpression('sovereign-vault-palace')).toBeNull();

    activateAllSources();
    emitSignal({
      origin: 'sovereign-vault-palace',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-vault-palace',
      purpose: 'manifestation expression-adapter test',
      content: null,
    });
    expect(gatherFromConstitutionalExpression('sovereign-vault-palace')).not.toBeNull();
  });

  it('composes one manifestation from multiple sources for a subject both sources recognize, in fixed registration order', () => {
    activateAllSources();
    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'manifestation composition test',
      content: null,
    });

    const manifestation = composeManifestationForSubject('hujjah-al-damighah');
    expect(manifestation).not.toBeNull();
    expect(manifestation!.sources.length).toBe(2);
    expect(manifestation!.sources[0].sourceId).toBe('imperial-tongue');
    expect(manifestation!.sources[1].sourceId).toBe('constitutional-expression');

    const all = gatherFromAllSources('hujjah-al-damighah');
    expect(all.length).toBe(2);
  });

  it('still composes a manifestation from a single available source, without requiring both', () => {
    const manifestation = composeManifestationForSubject('universal');
    expect(manifestation).not.toBeNull();
    expect(manifestation!.sources.length).toBe(1);
    expect(manifestation!.sources[0].sourceId).toBe('imperial-tongue');
  });

  it('honestly returns null when no registered source has any evidence for the subject', () => {
    expect(composeManifestationForSubject('not-a-real-subject-at-all')).toBeNull();
  });

  it("reads (never re-derives) src/imperial-presence/'s own Identity Certification for identityPreserved", () => {
    expect(isIdentityCurrentlyPreserved()).toBe(true);
    const manifestation = composeManifestationForSubject('universal');
    expect(manifestation!.identityPreserved).toBe(true);
  });

  it('exercises no constitutional authority — remains read-only with respect to the Living Body', () => {
    expect(verifyNoAuthorityExercised().verified).toBe(true);
  });

  it('produces a full 5-item Certification Report, all verified, for a multi-source subject', () => {
    activateAllSources();
    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'manifestation certification test',
      content: null,
    });

    const report = getConstitutionalManifestationCertificationReport('qiyamah-chamber');
    expect(report.length).toBe(5);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifySupportsMultipleSources('qiyamah-chamber').verified).toBe(true);
    expect(verifyNeverCreatesConstitutionalTruth('qiyamah-chamber').verified).toBe(true);
    expect(verifyNeverFiltersOrPrioritizes('qiyamah-chamber').verified).toBe(true);
    expect(verifyPreservesConstitutionalIdentity('qiyamah-chamber').verified).toBe(true);
  });
});
