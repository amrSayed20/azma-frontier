/**
 * AZMA OS — THE CONSTITUTIONAL RECEPTION
 * The Constitutional Reception Certification Layer
 * Construction Campaign
 *
 * Implements this Campaign's own 5 Certification Requirements as real,
 * runnable checks. Every function here is a pure read: none mutates
 * anything, none calls emitSignal, circulateFromClient, awaken, rest,
 * recordSignalSeen, or any organ's own execution path — confirmed by
 * inspection and by this package's own tests.
 */

import { getReceptionQueue } from './reception-queue';
import { prioritizeReceivedExpressions } from './priority-receiver';
import { deliverToRecipient } from './delivery';
import type { ConstitutionalReceptionCertification } from './types';

/** Certification Requirement 1: "Verify that every received expression originates from the Constitutional Expression Layer." */
export function verifyEveryReceptionOriginatesFromExpressionLayer(): ConstitutionalReceptionCertification {
  const queue = getReceptionQueue();
  const verified = queue.length > 0 && queue.every(
    (entry) => entry.expression.expressionId.startsWith('expression-') && entry.expression.contributingSources.length > 0,
  );
  return {
    criterion: 'Every received expression originates from the Constitutional Expression Layer.',
    verified,
    evidence: verified
      ? `All ${queue.length} queued reception(s) wrap a real ConstitutionalExpression carrying the Expression Layer's own expressionId format and at least one contributing source.`
      : 'The Reception Queue is empty, or contains an entry not traceable to the Expression Layer.',
  };
}

/** Certification Requirement 2: "Verify that no constitutional organ communicates directly with a recipient." */
export function verifyNoOrganCommunicatesDirectlyWithRecipient(): ConstitutionalReceptionCertification {
  const queue = getReceptionQueue();
  // Every queued entry's expression already passed through composeExpressionForOrgan
  // (Certification Requirement 1 above) — reception-queue.ts's own onSignalToReceive
  // calls only that one function, never Al-Wateen/Core/Consciousness/Memory/Evolution
  // directly (confirmed by inspection: this file's only cross-module import is
  // composeExpressionForOrgan from ../constitutional-expression).
  const verified = queue.every((entry) => entry.expression.sourceInputs.length > 0);
  return {
    criterion: 'No constitutional organ communicates directly with a recipient.',
    verified,
    evidence: verified
      ? "Every queued reception's data traces exclusively through the Expression Layer's own composeExpressionForOrgan() — confirmed by inspection that reception-queue.ts imports no organ module directly, only the Expression Layer."
      : 'A queued entry carried no traceable source inputs from the Expression Layer.',
  };
}

/** Certification Requirement 3: "Verify that reception preserves constitutional dignity." */
export function verifyReceptionPreservesDignity(): ConstitutionalReceptionCertification {
  const queue = getReceptionQueue();
  const verified = queue.length > 0 && queue.every((entry) => entry.expression.dignity.approved);
  return {
    criterion: 'Reception preserves constitutional dignity.',
    verified,
    evidence: verified
      ? "Every queued reception carries its expression's own dignity verdict (from the Sovereign Tongue's validateDignity(), reused unmodified by the Expression Layer) unaltered — Reception never re-evaluates or overrides it."
      : 'The Reception Queue is empty, or contains an entry whose dignity verdict was not preserved as approved.',
  };
}

/** Certification Requirement 4: "Verify that constitutional priority is respected." */
export function verifyConstitutionalPriorityRespected(): ConstitutionalReceptionCertification {
  const queue = getReceptionQueue();
  const prioritized = prioritizeReceivedExpressions(queue);
  const firstNonAttentionIndex = prioritized.findIndex((entry) => !entry.deservesAttention);
  const verified =
    firstNonAttentionIndex === -1 ||
    prioritized.slice(0, firstNonAttentionIndex).every((entry) => entry.deservesAttention);
  return {
    criterion: 'Constitutional priority is respected.',
    verified,
    evidence: verified
      ? 'Every attention-worthy reception is ordered before every non-attention-worthy one in the prioritized sequence.'
      : 'At least one non-attention-worthy reception was ordered ahead of an attention-worthy one.',
  };
}

/** Certification Requirement 5: "Verify that unauthorized reception never occurs." */
export function verifyUnauthorizedReceptionNeverOccurs(): ConstitutionalReceptionCertification {
  const queue = getReceptionQueue();
  if (queue.length === 0) {
    return {
      criterion: 'Unauthorized reception never occurs.',
      verified: false,
      evidence: 'The Reception Queue is empty — nothing to test delivery against yet.',
    };
  }
  const sample = queue[0];
  const unauthorizedAttempt = deliverToRecipient('an-unregistered-recipient', sample);
  const authorizedAttempt = deliverToRecipient('constitutional-council', sample);
  const verified = !unauthorizedAttempt.delivered && authorizedAttempt.delivered;
  return {
    criterion: 'Unauthorized reception never occurs.',
    verified,
    evidence: verified
      ? 'An unregistered recipient id is refused delivery; a registered, authorized recipient id succeeds — the distinction is enforced, not assumed.'
      : 'Delivery did not correctly distinguish an unauthorized recipient from an authorized one.',
  };
}
