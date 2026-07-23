import { emitSignal } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking } from '../../sovereign-heart';
import { beginConstitutionalThought, endConstitutionalThought, resetPerceptionIntake, getLatestAdvisoryForOrgan } from '../../sovereign-core';
import { beginConstitutionalObservation, endConstitutionalObservation, resetObservationLayer, getChangeLog } from '../../sovereign-consciousness';
import { beginConstitutionalRemembering, endConstitutionalRemembering, resetKnowledgeRepository, getKnowledgeHistoryForOrgan } from '../../sovereign-memory';
import { beginContinuousMaturityTracking, endContinuousMaturityTracking, resetImprovementRegistry } from '../../sovereign-evolution';
import {
  verifyContinuousCooperationAmongAllOrgans,
  verifyAuthoritySeparationPreserved,
  verifyInformationFlowsThroughCompleteLivingBody,
  verifyNoOrganAssumesAnothersResponsibility,
  verifyConstitutionalHarmonyPreserved,
  getLivingBodyCooperationCertificationReport,
} from '../index';

describe('The Living Body Integration (The First Living Organism)', () => {
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

  function awakenAllOrgans(): void {
    awaken();
    beginConstitutionalThought();
    beginConstitutionalObservation();
    beginConstitutionalRemembering();
    beginContinuousMaturityTracking();
  }

  it('confirms continuous cooperation once all 5 live organs are activated', () => {
    awakenAllOrgans();
    expect(verifyContinuousCooperationAmongAllOrgans().verified).toBe(true);
  });

  it("confirms constitutional authority remains separated across Al-Wateen, the Sovereign Core, Constitutional Memory, and Constitutional Consciousness", () => {
    expect(verifyAuthoritySeparationPreserved().verified).toBe(true);
  });

  it('confirms one constitutional signal flows through the complete Living Body — Heart, Core, Consciousness, and Memory all cooperate around the same event', () => {
    awakenAllOrgans();
    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'living body integration flow test',
      content: null,
    });

    const result = verifyInformationFlowsThroughCompleteLivingBody();
    expect(result.verified).toBe(true);
    expect(result.evidence).toContain('hujjah-al-damighah');
  });

  it("confirms no organ assumes another's responsibility — Evolution's own data never blends another organ's shape", () => {
    awakenAllOrgans();
    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'living body integration isolation test',
      content: null,
    });
    expect(verifyNoOrganAssumesAnothersResponsibility().verified).toBe(true);
  });

  it('confirms constitutional harmony can still be recognized once the full Living Body is active', () => {
    awakenAllOrgans();
    expect(verifyConstitutionalHarmonyPreserved().verified).toBe(true);
  });

  it('proves real independence — stopping Consciousness does not stop Core or Memory from continuing to cooperate', () => {
    awakenAllOrgans();
    endConstitutionalObservation();

    const changeLogBefore = getChangeLog().length;
    emitSignal({
      origin: 'makman-al-ghayah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'living body integration independence test',
      content: null,
    });

    // Consciousness, stopped, recognizes nothing new.
    expect(getChangeLog().length).toBe(changeLogBefore);
    // Core and Memory, still running, keep cooperating regardless.
    expect(getLatestAdvisoryForOrgan('makman-al-ghayah')).not.toBeNull();
    expect(getKnowledgeHistoryForOrgan('makman-al-ghayah').length).toBeGreaterThan(0);
  });

  it('produces a full 5-item Cooperation Certification Report, all verified', () => {
    awakenAllOrgans();
    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'living body integration certification test',
      content: null,
    });

    const report = getLivingBodyCooperationCertificationReport();
    expect(report.length).toBe(5);
    report.forEach((entry) => expect(entry.verified).toBe(true));
  });
});
