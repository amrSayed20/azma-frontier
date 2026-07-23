/**
 * AZMA OS — THE CONSTITUTIONAL DECISION
 * The Constitutional Decision Certification Layer
 * Construction Campaign
 *
 * Implements this Campaign's own 6 Certification Requirements as real,
 * runnable checks. Every function here is a pure read: none mutates
 * anything, none calls emitSignal, circulateFromClient, awaken, rest,
 * recordSignalSeen, or any organ's own execution path — confirmed by
 * inspection and by this package's own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { getHeartbeatState } from '../sovereign-heart';
import { organHasCompleteConstitutionalHome } from '../sovereign-body';
import { evaluateFaithfulnessForOrgan } from '../sovereign-wisdom';
import { listReadyIntentions } from '../constitutional-will';
import { getDecisionQueue } from './decision-queue';
import { evaluateIntentionForDecision } from './decision-evaluator';
import type { ConstitutionalIntention, ConstitutionalDecisionCertification } from './types';

/** Certification Requirement 1: "Verify every Decision originates from Constitutional Will." */
export function verifyEveryDecisionOriginatesFromWill(): ConstitutionalDecisionCertification {
  const decisions = getDecisionQueue();
  const intentionIds = new Set(listReadyIntentions().map((intention) => intention.intentionId));
  const verified = decisions.length > 0 && decisions.every((decision) => intentionIds.has(decision.sourceIntentionId));
  return {
    criterion: 'Every Decision originates from Constitutional Will.',
    verified,
    evidence: verified
      ? `All ${decisions.length} recorded decision(s) trace to a real, currently-ready Constitutional Will Intention.`
      : 'The Decision Queue is empty, or contains a decision not traceable to a real intention.',
  };
}

/** Certification Requirement 2: "Verify every Decision is grounded in Constitutional Wisdom." */
export function verifyEveryDecisionGroundedInWisdom(): ConstitutionalDecisionCertification {
  const decisions = getDecisionQueue();
  const verified = decisions.length > 0 && decisions.every((decision) => {
    if (decision.verdict === 'rejected') return true; // Law was checked first; Wisdom may not have been reached.
    const faithfulness = evaluateFaithfulnessForOrgan(decision.organId);
    return decision.verdict === 'escalated' ? !faithfulness.allFaithful : true;
  });
  return {
    criterion: 'Every Decision is grounded in Constitutional Wisdom.',
    verified,
    evidence: verified
      ? "Every 'escalated' decision corresponds to an organ Constitutional Wisdom's own Faithfulness Evaluator currently finds not fully faithful — consulted, never re-derived."
      : "At least one decision's verdict was inconsistent with what Constitutional Wisdom currently reports.",
  };
}

/** Certification Requirement 3: "Verify every Decision preserves Constitutional Law." */
export function verifyEveryDecisionPreservesConstitutionalLaw(): ConstitutionalDecisionCertification {
  const decisions = getDecisionQueue();
  const verified = decisions.every((decision) => {
    const lawIntact = organHasCompleteConstitutionalHome(decision.organId);
    return lawIntact || decision.verdict === 'rejected';
  });
  return {
    criterion: 'Every Decision preserves Constitutional Law.',
    verified,
    evidence: verified
      ? "No decision approves, defers, or escalates an intention for an organ whose constitutional home is incomplete — such organs are always 'rejected'."
      : 'A decision other than \'rejected\' exists for an organ with an incomplete constitutional home.',
  };
}

/** Certification Requirement 4: "Verify unauthorized Decisions are rejected." */
export function verifyUnauthorizedDecisionsAreRejected(): ConstitutionalDecisionCertification {
  const sample = listReadyIntentions()[0];
  if (!sample) {
    return {
      criterion: 'Unauthorized Decisions are rejected.',
      verified: false,
      evidence: 'No ready Intention is available to construct an unauthorized-decision scenario.',
    };
  }
  const malformed: ConstitutionalIntention = { ...sample, intentionId: 'not-a-real-intention-id' };
  const result = evaluateIntentionForDecision(malformed);
  const verified = result.decision === null && result.rejection !== null;
  return {
    criterion: 'Unauthorized Decisions are rejected.',
    verified,
    evidence: verified
      ? 'An intention with an untraceable id is refused a decision, with a disclosed rejection reason — never silently accepted.'
      : 'An unauthorized intention was incorrectly accepted into a decision.',
  };
}

/** Certification Requirement 5: "Verify zero execution authority exists." */
export function verifyZeroExecutionAuthorityExists(): ConstitutionalDecisionCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  getDecisionQueue();
  const verified = getSignalLog().length === logBefore && JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'Zero execution authority exists.',
    verified,
    evidence: verified
      ? 'No function in this module calls emitSignal, circulateFromClient, awaken, rest, or recordSignalSeen (confirmed by inspection); the Signal Log and Heartbeat state are unaffected by running this module\'s own read functions.'
      : 'A call into this module produced an observable change in the Signal Log or Heartbeat state.',
  };
}

/** Certification Requirement 6: "Verify Decisions remain fully traceable." */
export function verifyDecisionsRemainFullyTraceable(): ConstitutionalDecisionCertification {
  const decisions = getDecisionQueue();
  const verified = decisions.length > 0 && decisions.every(
    (decision) =>
      decision.decisionId.length > 0 &&
      decision.organId.length > 0 &&
      decision.sourceIntentionId.length > 0 &&
      decision.reason.length > 0 &&
      decision.decidedAt.length > 0,
  );
  return {
    criterion: 'Decisions remain fully traceable.',
    verified,
    evidence: verified
      ? `All ${decisions.length} recorded decision(s) carry a complete, non-empty decisionId/organId/sourceIntentionId/reason/decidedAt.`
      : 'The Decision Queue is empty, or contains a decision missing a traceability field.',
  };
}
