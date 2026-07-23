import { emitSignal, getSignalLog } from '../../sovereign-nervous-system';
import { awaken, rest, resetContinuityTracking, getHeartbeatState } from '../../sovereign-heart';
import { beginConstitutionalRemembering, endConstitutionalRemembering, resetKnowledgeRepository } from '../../sovereign-memory';
import {
  CONSTITUTIONAL_WISDOM_INPUTS,
  judgeClaim,
  reflectOnOrgan,
  getMaturityForOrgan,
  integrateLearningForOrgan,
  CONSTITUTIONAL_DECISION_PRINCIPLES,
  evaluateFaithfulnessForOrgan,
  evaluateFaithfulnessForBody,
  verifyWisdomDependsUponMemory,
  verifyWisdomDependsUponUnderstanding,
  verifyDistinguishesKnowledgeFromJudgment,
  verifyJudgmentsPreserveConstitutionalLaw,
  verifyMaturityIncreasesThroughExperience,
  verifyNoExecutionAuthorityExists,
  getConstitutionalWisdomCertificationReport,
} from '../index';
import type { ConstitutionalClaim } from '../../sovereign-core';

describe('The Constitutional Wisdom (Imperial Maturity)', () => {
  afterEach(() => {
    endConstitutionalRemembering();
    resetKnowledgeRepository();
    rest();
    resetContinuityTracking();
  });

  it("names exactly the 5 inputs this phase's own Mission describes", () => {
    expect(CONSTITUTIONAL_WISDOM_INPUTS.map((entry) => entry.input)).toEqual([
      'Knowledge',
      'Memory',
      'Awareness',
      'Understanding',
      'Purpose',
    ]);
  });

  it('judges a well-grounded claim faithful, and an ungrounded claim insufficient-evidence — never silently accepted', () => {
    const wellFormed: ConstitutionalClaim = {
      claimId: 'c1',
      organId: 'sample',
      kind: 'fact',
      statement: 'stmt',
      basedOn: 'a real source',
    };
    const ungrounded: ConstitutionalClaim = { claimId: 'c2', organId: 'sample', kind: 'fact', statement: 'stmt', basedOn: '' };

    expect(judgeClaim('sample', wellFormed).verdict).toBe('faithful');
    expect(judgeClaim('sample', ungrounded).verdict).toBe('insufficient-evidence');
  });

  it('a Judgment is structurally distinct from a Claim — never blends knowledge fields into judgment fields', () => {
    const claim: ConstitutionalClaim = { claimId: 'c3', organId: 'sample', kind: 'fact', statement: 'stmt', basedOn: 'source' };
    const judgment = judgeClaim('sample', claim);
    expect(judgment).not.toHaveProperty('statement');
    expect(judgment).not.toHaveProperty('basedOn');
    expect(judgment).toHaveProperty('verdict');
    expect(judgment).toHaveProperty('reason');
  });

  it('judges every claim in an Advisory, one Judgment per Claim', () => {
    awaken();
    beginConstitutionalRemembering();
    emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'wisdom judgment test',
      content: null,
    });

    const report = evaluateFaithfulnessForOrgan('hujjah-al-damighah');
    expect(report.judgments.length).toBeGreaterThan(0);
    expect(report.allFaithful).toBe(true);
  });

  it('produces zero judgments, honestly, for an organ with no archived history — never fabricated', () => {
    const report = evaluateFaithfulnessForOrgan('makman-al-ghayah');
    expect(report.judgments.length).toBe(0);
  });

  it('the Reflection Engine counts archived claim kinds accurately over accumulated experience', () => {
    awaken();
    beginConstitutionalRemembering();
    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'wisdom reflection test',
      content: null,
    });

    const reflection = reflectOnOrgan('ras-al-amr');
    expect(reflection.totalArchivedAdvisories).toBe(1);
    const totalClaims = Object.values(reflection.claimKindCounts).reduce((sum, count) => sum + count, 0);
    expect(totalClaims).toBeGreaterThan(0);
  });

  it('Maturity is defined exactly as the archive\'s own accumulated count, and only grows as experience accumulates', () => {
    awaken();
    beginConstitutionalRemembering();
    const before = getMaturityForOrgan('qiyamah-chamber').maturityScore;

    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'wisdom maturity test 1',
      content: null,
    });
    const afterOne = getMaturityForOrgan('qiyamah-chamber').maturityScore;
    expect(afterOne).toBe(before + 1);

    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'wisdom maturity test 2',
      content: null,
    });
    const afterTwo = getMaturityForOrgan('qiyamah-chamber').maturityScore;
    expect(afterTwo).toBe(afterOne + 1);
  });

  it('Learning Integration honestly reports an empty Wisdom Archive rather than synthesizing an entry (Constitutional Decision Two)', () => {
    awaken();
    beginConstitutionalRemembering();
    emitSignal({
      origin: 'sovereign-vault-palace',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-vault-palace',
      purpose: 'wisdom learning-integration test',
      content: null,
    });

    const summary = integrateLearningForOrgan('sovereign-vault-palace');
    expect(summary.wisdomEntryCount).toBe(0);
    expect(summary.note).toContain('honestly empty');
  });

  it('names the Decision Principles this phase\'s own Judgment and Learning layers follow', () => {
    expect(CONSTITUTIONAL_DECISION_PRINCIPLES.length).toBeGreaterThanOrEqual(4);
    CONSTITUTIONAL_DECISION_PRINCIPLES.forEach((entry) => {
      expect(entry.principle.length).toBeGreaterThan(0);
      expect(entry.rationale.length).toBeGreaterThan(0);
    });
  });

  it('evaluateFaithfulnessForBody covers every Skeleton-registered organ, including Constitutional Memory itself', () => {
    const reports = evaluateFaithfulnessForBody();
    expect(reports.length).toBe(12);
    expect(reports.map((report) => report.organId)).toContain('sovereign-memory');
  });

  it('exercises no execution authority — remains read-only with respect to the Living Body', () => {
    const logBefore = getSignalLog().length;
    const heartBefore = getHeartbeatState();
    evaluateFaithfulnessForOrgan('sovereign-core');
    getMaturityForOrgan('sovereign-core');
    integrateLearningForOrgan('sovereign-core');
    expect(getSignalLog().length).toBe(logBefore);
    expect(getHeartbeatState()).toEqual(heartBefore);
  });

  it('produces a full 6-item Certification Report, all verified once the Body has accumulated some experience', () => {
    awaken();
    beginConstitutionalRemembering();
    emitSignal({
      origin: 'sovereign-capability-diwan',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'sovereign-capability-diwan',
      purpose: 'wisdom certification test',
      content: null,
    });

    const report = getConstitutionalWisdomCertificationReport();
    expect(report.length).toBe(6);
    report.forEach((entry) => expect(entry.verified).toBe(true));

    expect(verifyWisdomDependsUponMemory().verified).toBe(true);
    expect(verifyWisdomDependsUponUnderstanding().verified).toBe(true);
    expect(verifyDistinguishesKnowledgeFromJudgment().verified).toBe(true);
    expect(verifyJudgmentsPreserveConstitutionalLaw().verified).toBe(true);
    expect(verifyMaturityIncreasesThroughExperience().verified).toBe(true);
    expect(verifyNoExecutionAuthorityExists().verified).toBe(true);
  });
});
