import { emitSignal, getSignalLog } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking, getHeartbeatState } from '../../sovereign-heart';
import { beginConstitutionalThought, endConstitutionalThought, resetPerceptionIntake } from '../../sovereign-core';
import { beginConstitutionalObservation, endConstitutionalObservation, resetObservationLayer } from '../../sovereign-consciousness';
import { beginConstitutionalRemembering, endConstitutionalRemembering, resetKnowledgeRepository } from '../../sovereign-memory';
import { beginContinuousMaturityTracking, endContinuousMaturityTracking, resetImprovementRegistry } from '../../sovereign-evolution';
import {
  EXPRESSION_SOURCE_REGISTRY,
  EXPRESSION_SOURCE_PRIORITY_ORDER,
  gatherAllForOrgan,
  filterOrgansWithSufficientEvidence,
  prioritizeInputs,
  composeExpressionForOrgan,
  verifyExpressionOriginatesFromRealEvidence,
  verifyExpressionNeverAltersTruth,
  verifyMultipleOrgansBecomeOneVoice,
  verifyExpressionPreservesDignity,
  verifyNoOrganBypassesExpressionLayer,
  getConstitutionalExpressionCertificationReport,
} from '../index';

describe('The Constitutional Expression (The Imperial Expression)', () => {
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

  it('names exactly the 5 source organs the Council ruled shall never expose output directly', () => {
    expect(EXPRESSION_SOURCE_REGISTRY.length).toBe(5);
    expect(EXPRESSION_SOURCE_PRIORITY_ORDER.length).toBe(5);
    expect(new Set(EXPRESSION_SOURCE_PRIORITY_ORDER)).toEqual(
      new Set(EXPRESSION_SOURCE_REGISTRY.map((entry) => entry.sourceOrgan)),
    );
  });

  it('gathers zero inputs, honestly, for an organ with no real evidence, and multiple once activity occurs', () => {
    expect(gatherAllForOrgan('sovereign-vault-palace').length).toBe(0);

    activateAllSources();
    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'expression gathering test',
      content: null,
    });

    const inputs = gatherAllForOrgan('hujjah-al-damighah');
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it('the Filter includes an organ once it meets the evidence threshold, and excludes it above what exists', () => {
    activateAllSources();
    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'expression filter test',
      content: null,
    });

    expect(filterOrgansWithSufficientEvidence(1)).toContain('ras-al-amr');
    expect(filterOrgansWithSufficientEvidence(6)).not.toContain('ras-al-amr');
  });

  it('the Prioritizer orders inputs by the Expression Registry\'s own declared priority', () => {
    activateAllSources();
    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'expression prioritizer test',
      content: null,
    });

    const prioritized = prioritizeInputs(gatherAllForOrgan('qiyamah-chamber'));
    const indices = prioritized.map((input) => EXPRESSION_SOURCE_PRIORITY_ORDER.indexOf(input.sourceOrgan));
    for (let i = 1; i < indices.length; i += 1) {
      expect(indices[i]).toBeGreaterThanOrEqual(indices[i - 1]);
    }
  });

  it('composes one unified expression from multiple organs, passing the Tongue\'s own dignity test', () => {
    expect(composeExpressionForOrgan('sovereign-vault-palace')).toBeNull();

    activateAllSources();
    emitSignal({
      origin: 'makman-al-ghayah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'expression composer test',
      content: null,
    });

    const expression = composeExpressionForOrgan('makman-al-ghayah');
    expect(expression).not.toBeNull();
    expect(expression!.contributingSources.length).toBeGreaterThanOrEqual(2);
    expect(typeof expression!.unifiedSummary).toBe('string');
    expect(expression!.dignity.approved).toBe(true);
  });

  it('exercises no constitutional authority — gathering and composing never alters the Living Body', () => {
    const logBefore = getSignalLog().length;
    const heartBefore = getHeartbeatState();
    gatherAllForOrgan('sovereign-core');
    composeExpressionForOrgan('sovereign-core');
    expect(getSignalLog().length).toBe(logBefore);
    expect(getHeartbeatState()).toEqual(heartBefore);
  });

  it('produces a full 5-item Certification Report, all verified, for a well-evidenced organ', () => {
    activateAllSources();
    emitSignal({
      origin: 'sovereign-capability-diwan',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-capability-diwan',
      purpose: 'expression certification test',
      content: null,
    });

    const report = getConstitutionalExpressionCertificationReport('sovereign-capability-diwan');
    expect(report.length).toBe(5);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyExpressionOriginatesFromRealEvidence('sovereign-capability-diwan').verified).toBe(true);
    expect(verifyExpressionNeverAltersTruth('sovereign-capability-diwan').verified).toBe(true);
    expect(verifyMultipleOrgansBecomeOneVoice('sovereign-capability-diwan').verified).toBe(true);
    expect(verifyExpressionPreservesDignity('sovereign-capability-diwan').verified).toBe(true);
    expect(verifyNoOrganBypassesExpressionLayer('sovereign-capability-diwan').verified).toBe(true);
  });
});
