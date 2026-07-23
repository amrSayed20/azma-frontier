import { emitSignal, getSignalLog } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking, getHeartbeatState } from '../../sovereign-heart';
import { beginConstitutionalRemembering, endConstitutionalRemembering, resetKnowledgeRepository } from '../../sovereign-memory';
import {
  CONSTITUTIONAL_EVOLUTION_HISTORY,
  getConstitutionalLearningForOrgan,
  listConstitutionalLearningForBody,
  recordMaturitySnapshot,
  getMaturitySnapshotsForOrgan,
  getAllMaturitySnapshots,
  resetImprovementRegistry,
  evaluateImprovementForOrgan,
  identifyMostRefinedOrgan,
  getMaturityProgressionForOrgan,
  evaluateConstitutionalContinuity,
  verifyEvolutionPreservesConstitutionalIdentity,
  verifyImprovementStrengthensMaturity,
  verifyConstitutionalContinuityNeverBroken,
  verifyConstitutionalHistoryPreserved,
  verifyEvolutionServesTheCreator,
  verifyNoExecutionAuthorityExists,
  getConstitutionalEvolutionCertificationReport,
} from '../index';

describe('The Constitutional Evolution (Continuous Maturity)', () => {
  afterEach(() => {
    endConstitutionalRemembering();
    resetKnowledgeRepository();
    resetImprovementRegistry();
    rest();
    resetContinuityTracking();
  });

  it("records the Body's own construction history, chronologically, from the Skeleton through this phase", () => {
    expect(CONSTITUTIONAL_EVOLUTION_HISTORY.length).toBeGreaterThanOrEqual(10);
    expect(CONSTITUTIONAL_EVOLUTION_HISTORY[0].phaseId).toBe('phase-i');
    expect(CONSTITUTIONAL_EVOLUTION_HISTORY[CONSTITUTIONAL_EVOLUTION_HISTORY.length - 1].phaseId).toBe('phase-x');
  });

  it("the Learning Registry is a lens over Wisdom's own Reflection Engine, not a second one", () => {
    awaken();
    beginConstitutionalRemembering();
    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'evolution learning test',
      content: null,
    });
    const learning = getConstitutionalLearningForOrgan('hujjah-al-damighah');
    expect(learning.totalArchivedAdvisories).toBe(1);

    const wholeBody = listConstitutionalLearningForBody();
    expect(wholeBody.length).toBe(12);
  });

  it('records maturity snapshots as an audit trail, reading the score from Wisdom itself', () => {
    awaken();
    beginConstitutionalRemembering();
    const snapshot1 = recordMaturitySnapshot('ras-al-amr');
    expect(snapshot1.maturityScore).toBe(0);

    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'evolution improvement test',
      content: null,
    });
    const snapshot2 = recordMaturitySnapshot('ras-al-amr');
    expect(snapshot2.maturityScore).toBe(1);

    const history = getMaturitySnapshotsForOrgan('ras-al-amr');
    expect(history.length).toBe(2);
    expect(getAllMaturitySnapshots().length).toBeGreaterThanOrEqual(2);
  });

  it('the Refinement Layer honestly reports insufficient data with fewer than 2 snapshots, and a real delta with 2 or more', () => {
    const tooFew = evaluateImprovementForOrgan('makman-al-ghayah');
    expect(tooFew.evidence).toContain('insufficient');

    awaken();
    beginConstitutionalRemembering();
    recordMaturitySnapshot('qiyamah-chamber');
    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'evolution refinement test',
      content: null,
    });
    recordMaturitySnapshot('qiyamah-chamber');

    const improvement = evaluateImprovementForOrgan('qiyamah-chamber');
    expect(improvement.improved).toBe(true);
    expect(improvement.delta).toBeGreaterThanOrEqual(0);

    const mostRefined = identifyMostRefinedOrgan();
    expect(mostRefined.organId).toBe('qiyamah-chamber');
  });

  it('the Maturity Progression is the same chronological record the Improvement Registry already keeps', () => {
    awaken();
    beginConstitutionalRemembering();
    recordMaturitySnapshot('sovereign-vault-palace');
    recordMaturitySnapshot('sovereign-vault-palace');
    const progression = getMaturityProgressionForOrgan('sovereign-vault-palace');
    expect(progression).toEqual(getMaturitySnapshotsForOrgan('sovereign-vault-palace'));
  });

  it('the Continuity Evaluator confirms constitutional identity and history remain intact', () => {
    const evaluation = evaluateConstitutionalContinuity();
    expect(evaluation.identityIntact).toBe(true);
    expect(evaluation.historyImmutable).toBe(true);
  });

  it('exercises no execution authority — remains read-only with respect to the Living Body', () => {
    const logBefore = getSignalLog().length;
    const heartBefore = getHeartbeatState();
    evaluateConstitutionalContinuity();
    getAllMaturitySnapshots();
    listConstitutionalLearningForBody();
    expect(getSignalLog().length).toBe(logBefore);
    expect(getHeartbeatState()).toEqual(heartBefore);
  });

  it('produces a full 6-item Certification Report, all verified once the Body has recorded some improvement', () => {
    awaken();
    beginConstitutionalRemembering();
    recordMaturitySnapshot('sovereign-capability-diwan');
    emitSignal({
      origin: 'sovereign-capability-diwan',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-capability-diwan',
      purpose: 'evolution certification test',
      content: null,
    });
    recordMaturitySnapshot('sovereign-capability-diwan');

    const report = getConstitutionalEvolutionCertificationReport();
    expect(report.length).toBe(6);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyEvolutionPreservesConstitutionalIdentity().verified).toBe(true);
    expect(verifyImprovementStrengthensMaturity().verified).toBe(true);
    expect(verifyConstitutionalContinuityNeverBroken().verified).toBe(true);
    expect(verifyConstitutionalHistoryPreserved().verified).toBe(true);
    expect(verifyEvolutionServesTheCreator().verified).toBe(true);
    expect(verifyNoExecutionAuthorityExists().verified).toBe(true);
  });
});
