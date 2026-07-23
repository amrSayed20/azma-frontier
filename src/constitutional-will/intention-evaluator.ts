/**
 * AZMA OS — THE CONSTITUTIONAL WILL
 * The Constitutional Intention Evaluator
 * Construction Campaign
 *
 * The one gate through which a ReceivedExpression may become a
 * ConstitutionalIntention. Reads only fields Reception and Expression
 * already computed — deservesAttention, dignity.approved, and the
 * receptionId's own traceable format — never re-evaluating significance
 * or dignity itself (Constitutional Limits: "No runtime authority").
 * Rejects, with a disclosed reason, anything that fails any of the 3
 * gates — never silently drops, never silently accepts.
 */

import type { ReceivedExpression, ConstitutionalIntention, IntentionRejection } from './types';

function isTraceableToReception(entry: ReceivedExpression): boolean {
  return typeof entry.receptionId === 'string' && entry.receptionId.startsWith('reception-');
}

export function evaluateReceptionForIntention(
  entry: ReceivedExpression,
): { intention: ConstitutionalIntention | null; rejection: IntentionRejection | null } {
  if (!isTraceableToReception(entry)) {
    return {
      intention: null,
      rejection: { receptionId: entry.receptionId, reason: 'Not traceable to a real Constitutional Reception entry.' },
    };
  }
  if (!entry.expression.dignity.approved) {
    return {
      intention: null,
      rejection: { receptionId: entry.receptionId, reason: 'The underlying expression did not preserve constitutional dignity.' },
    };
  }
  if (!entry.deservesAttention) {
    return {
      intention: null,
      rejection: { receptionId: entry.receptionId, reason: 'Reception did not mark this expression as deserving attention.' },
    };
  }

  return {
    intention: {
      intentionId: `intention-${entry.receptionId}`,
      organId: entry.expression.organId,
      sourceReceptionId: entry.receptionId,
      statement: entry.expression.unifiedSummary,
      formedAt: new Date().toISOString(),
      readiness: 'formed',
    },
    rejection: null,
  };
}
