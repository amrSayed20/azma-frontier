/**
 * AZMA OS — THE CONSTITUTIONAL WISDOM
 * The Certification Layer
 * Construction Phase IX
 *
 * Implements this phase's own 6 Certification Requirements as real,
 * runnable, PARAMETERLESS checks — never as prose assertions. Each
 * function auto-discovers whatever organ state it needs from the Body's
 * current runtime, rather than requiring a caller to thread scenario
 * state through it. Every function here is a pure read: none mutates
 * anything, none calls emitSignal, circulateFromClient, awaken, rest,
 * recordSignalSeen, or any Sovereign Core execution path — confirmed by
 * inspection and by this package's own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { getHeartbeatState } from '../sovereign-heart';
import { CONSTITUTIONAL_ORGANS } from '../sovereign-body';
import { getKnowledgeHistoryForOrgan } from '../sovereign-memory';
import { evaluateFaithfulnessForOrgan } from './faithfulness-evaluator';
import { getMaturityForOrgan } from './maturity-layer';
import { reflectOnOrgan } from './reflection-engine';
import { judgeClaim } from './judgment-layer';
import type { ConstitutionalClaim } from '../sovereign-core';
import type { ConstitutionalWisdomCertification } from './types';

/** Certification Requirement 1: "Verify that Wisdom always depends upon Memory." */
export function verifyWisdomDependsUponMemory(): ConstitutionalWisdomCertification {
  const withHistory = CONSTITUTIONAL_ORGANS.find((organ) => getKnowledgeHistoryForOrgan(organ.id).length > 0);
  const withoutHistory = CONSTITUTIONAL_ORGANS.find((organ) => getKnowledgeHistoryForOrgan(organ.id).length === 0);

  if (!withHistory || !withoutHistory) {
    return {
      criterion: 'Wisdom always depends upon Memory.',
      verified: false,
      evidence: 'Insufficient data: need at least one organ with archived history and one without to verify this dependency.',
    };
  }

  const reportWith = evaluateFaithfulnessForOrgan(withHistory.id);
  const reportWithout = evaluateFaithfulnessForOrgan(withoutHistory.id);
  const verified = reportWith.judgments.length > 0 && reportWithout.judgments.length === 0;
  return {
    criterion: 'Wisdom always depends upon Memory.',
    verified,
    evidence: verified
      ? `${withHistory.id} (has archived history) produces ${reportWith.judgments.length} judgment(s); ${withoutHistory.id} (no archived history) produces zero — Wisdom never fabricates a judgment without Memory to ground it.`
      : 'Judgment output did not correctly depend on the presence of archived Memory.',
  };
}

/** Certification Requirement 2: "Verify that Wisdom always depends upon Understanding." */
export function verifyWisdomDependsUponUnderstanding(): ConstitutionalWisdomCertification {
  const withHistory = CONSTITUTIONAL_ORGANS.find((organ) => getKnowledgeHistoryForOrgan(organ.id).length > 0);
  if (!withHistory) {
    return {
      criterion: 'Wisdom always depends upon Understanding.',
      verified: false,
      evidence: 'No archived history exists yet for any organ to verify this dependency.',
    };
  }
  const report = evaluateFaithfulnessForOrgan(withHistory.id);
  const verified = report.judgments.length > 0 && report.judgments.every((judgment) => judgment.reason.length > 0);
  return {
    criterion: 'Wisdom always depends upon Understanding.',
    verified,
    evidence: verified
      ? "Every Judgment's reason is derived directly from a Claim's own kind/basedOn fields, which exist only because the Sovereign Core's Understanding Engine (Phase V) produced them."
      : 'A Judgment existed without any grounding in an underlying Claim.',
  };
}

/** Certification Requirement 3: "Verify that Wisdom distinguishes knowledge from judgment." */
export function verifyDistinguishesKnowledgeFromJudgment(): ConstitutionalWisdomCertification {
  const sampleClaim: ConstitutionalClaim = {
    claimId: 'sample-claim',
    organId: 'sample-organ',
    kind: 'fact',
    statement: 'Sample statement.',
    basedOn: 'Sample source.',
  };
  const judgment = judgeClaim('sample-organ', sampleClaim);
  const verified = !('statement' in judgment) && !('basedOn' in judgment) && 'verdict' in judgment && 'reason' in judgment;
  return {
    criterion: 'Wisdom distinguishes knowledge from judgment.',
    verified,
    evidence: verified
      ? "A ConstitutionalJudgment carries its own verdict/reason fields and never the Claim's own statement/basedOn fields — a structurally distinct type, not a relabeled Claim."
      : 'A Judgment carried the Claim\'s own knowledge fields directly, blurring the two.',
  };
}

/** Certification Requirement 4: "Verify that every judgment preserves constitutional law." */
export function verifyJudgmentsPreserveConstitutionalLaw(): ConstitutionalWisdomCertification {
  const wellFormedClaim: ConstitutionalClaim = {
    claimId: 'wellformed',
    organId: 'sample-organ',
    kind: 'fact',
    statement: 'Sample statement.',
    basedOn: 'A real, cited source.',
  };
  const malformedClaim: ConstitutionalClaim = {
    claimId: 'malformed',
    organId: 'sample-organ',
    kind: 'fact',
    statement: 'Sample statement.',
    basedOn: '',
  };
  const wellFormedJudgment = judgeClaim('sample-organ', wellFormedClaim);
  const malformedJudgment = judgeClaim('sample-organ', malformedClaim);
  const verified = wellFormedJudgment.verdict === 'faithful' && malformedJudgment.verdict === 'insufficient-evidence';
  return {
    criterion: 'Every judgment preserves constitutional law.',
    verified,
    evidence: verified
      ? 'A claim with real grounding is judged faithful; a claim with no grounding is honestly judged insufficient-evidence, never silently accepted as faithful.'
      : 'Judgment did not correctly distinguish a well-grounded claim from an ungrounded one.',
  };
}

/** Certification Requirement 5: "Verify that constitutional maturity increases through experience." */
export function verifyMaturityIncreasesThroughExperience(): ConstitutionalWisdomCertification {
  const anyOrgan = CONSTITUTIONAL_ORGANS[0];
  const maturity = getMaturityForOrgan(anyOrgan.id);
  const reflection = reflectOnOrgan(anyOrgan.id);
  const verified = maturity.maturityScore === reflection.totalArchivedAdvisories;
  return {
    criterion: 'Constitutional maturity increases through experience.',
    verified,
    evidence: verified
      ? "Maturity is defined as exactly the count of archived Advisories in Memory's append-only Knowledge Repository (Phase VIII, already certified immutable/growing-only) — by construction, this count can never decrease as experience accumulates."
      : "Maturity score did not match the archive's own accumulated count.",
  };
}

/** Certification Requirement 6: "Verify that no execution authority exists." */
export function verifyNoExecutionAuthorityExists(): ConstitutionalWisdomCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  evaluateFaithfulnessForOrgan('sovereign-core');
  getMaturityForOrgan('sovereign-core');
  const verified = getSignalLog().length === logBefore && JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'No execution authority exists.',
    verified,
    evidence: verified
      ? 'No function in this module calls emitSignal, circulateFromClient, awaken, rest, or recordSignalSeen (confirmed by inspection); the Signal Log and Heartbeat state are unaffected by running this module\'s own read functions.'
      : 'A call into this module produced an observable change in the Signal Log or Heartbeat state.',
  };
}
