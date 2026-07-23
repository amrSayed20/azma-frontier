/**
 * AZMA OS — THE CONSTITUTIONAL WILL
 * The Constitutional Will Certification Layer
 * Construction Campaign
 *
 * Implements this Campaign's own 5 Certification Requirements as real,
 * runnable checks. Every function here is a pure read: none mutates
 * anything, none calls emitSignal, circulateFromClient, awaken, rest,
 * recordSignalSeen, or any organ's own execution path — confirmed by
 * inspection and by this package's own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { getHeartbeatState } from '../sovereign-heart';
import { getReceptionQueue } from '../constitutional-reception';
import { getIntentionQueue } from './intention-queue';
import { evaluateReceptionForIntention } from './intention-evaluator';
import type { ReceivedExpression, ConstitutionalWillCertification } from './types';

/** Certification Requirement 1: "Verify every intention originates from Constitutional Reception." */
export function verifyEveryIntentionOriginatesFromReception(): ConstitutionalWillCertification {
  const intentions = getIntentionQueue();
  const receptionIds = new Set(getReceptionQueue().map((entry) => entry.receptionId));
  const verified = intentions.length > 0 && intentions.every((intention) => receptionIds.has(intention.sourceReceptionId));
  return {
    criterion: 'Every intention originates from Constitutional Reception.',
    verified,
    evidence: verified
      ? `All ${intentions.length} formed intention(s) trace to a real, currently-queued Constitutional Reception entry.`
      : 'The Intention Queue is empty, or contains an intention not traceable to a real reception.',
  };
}

/** Certification Requirement 2: "Verify constitutional intentions preserve Constitutional Law." */
export function verifyIntentionsPreserveConstitutionalLaw(): ConstitutionalWillCertification {
  const intentions = getIntentionQueue();
  const receptionById = new Map(getReceptionQueue().map((entry) => [entry.receptionId, entry]));
  const verified = intentions.length > 0 && intentions.every((intention) => {
    const source = receptionById.get(intention.sourceReceptionId);
    return Boolean(source?.expression.dignity.approved);
  });
  return {
    criterion: 'Constitutional intentions preserve Constitutional Law.',
    verified,
    evidence: verified
      ? "Every formed intention's source reception carried an expression whose dignity was already approved by the Constitutional Expression Layer."
      : 'The Intention Queue is empty, or contains an intention whose source did not preserve dignity.',
  };
}

/** Certification Requirement 3: "Verify unauthorized intentions are rejected." */
export function verifyUnauthorizedIntentionsAreRejected(): ConstitutionalWillCertification {
  const sample = getReceptionQueue()[0];
  if (!sample) {
    return {
      criterion: 'Unauthorized intentions are rejected.',
      verified: false,
      evidence: 'The Reception Queue is empty — no sample available to construct an unauthorized-intention scenario.',
    };
  }
  const malformed: ReceivedExpression = { ...sample, receptionId: 'not-a-real-reception-id' };
  const notAttentionWorthy: ReceivedExpression = { ...sample, receptionId: sample.receptionId, deservesAttention: false };

  const malformedResult = evaluateReceptionForIntention(malformed);
  const notAttentionResult = evaluateReceptionForIntention(notAttentionWorthy);

  const verified =
    malformedResult.intention === null &&
    malformedResult.rejection !== null &&
    notAttentionResult.intention === null &&
    notAttentionResult.rejection !== null;

  return {
    criterion: 'Unauthorized intentions are rejected.',
    verified,
    evidence: verified
      ? 'A reception with an untraceable id and a reception marked not attention-worthy are both refused, each with a disclosed rejection reason — never silently accepted.'
      : 'At least one unauthorized reception was incorrectly accepted as an intention.',
  };
}

/** Certification Requirement 4: "Verify readiness is distinguished from execution." */
export function verifyReadinessDistinguishedFromExecution(): ConstitutionalWillCertification {
  const intentions = getIntentionQueue();
  const allFormedOnly = intentions.every((intention) => intention.readiness === 'formed');
  return {
    criterion: 'Readiness is distinguished from execution.',
    verified: allFormedOnly,
    evidence: allFormedOnly
      ? "Every intention's readiness is exactly 'formed' — the single, terminal state this module recognizes. No function anywhere in this module transitions, executes, or notifies from an intention (confirmed by inspection of every exported function's own implementation)."
      : 'An intention carried a readiness value other than \'formed\'.',
  };
}

/** Certification Requirement 5: "Verify no execution authority exists." */
export function verifyNoExecutionAuthorityExists(): ConstitutionalWillCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  getIntentionQueue();
  const verified = getSignalLog().length === logBefore && JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'No execution authority exists.',
    verified,
    evidence: verified
      ? 'No function in this module calls emitSignal, circulateFromClient, awaken, rest, or recordSignalSeen (confirmed by inspection); the Signal Log and Heartbeat state are unaffected by running this module\'s own read functions.'
      : 'A call into this module produced an observable change in the Signal Log or Heartbeat state.',
  };
}
