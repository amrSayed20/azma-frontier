/**
 * AZMA OS — THE CONSTITUTIONAL DECISION
 * The Constitutional Decision Evaluator
 * Construction Campaign
 *
 * Implements the fixed-priority decision tree declared in
 * judgment-registry.ts. Every consultation is a pure read of an
 * already-certified query function — none is re-derived, none mutates
 * anything. Rejects, with a disclosed reason, any candidate not
 * traceable to a real Constitutional Will Intention — never silently
 * drops, never silently accepts.
 */

import { organHasCompleteConstitutionalHome } from '../sovereign-body';
import { evaluateFaithfulnessForOrgan } from '../sovereign-wisdom';
import { getKnowledgeHistoryForOrgan } from '../sovereign-memory';
import { getConditionForOrgan } from '../sovereign-consciousness';
import type { ConstitutionalIntention, ConstitutionalDecision, DecisionRejection } from './types';

function isTraceableToWill(intention: ConstitutionalIntention): boolean {
  return typeof intention.intentionId === 'string' && intention.intentionId.startsWith('intention-') && intention.readiness === 'formed';
}

export function evaluateIntentionForDecision(
  intention: ConstitutionalIntention,
): { decision: ConstitutionalDecision | null; rejection: DecisionRejection | null } {
  if (!isTraceableToWill(intention)) {
    return {
      decision: null,
      rejection: { intentionId: intention.intentionId, reason: 'Not traceable to a real, formed Constitutional Will Intention.' },
    };
  }

  const organId = intention.organId;
  const now = new Date().toISOString();
  const decisionId = `decision-${intention.intentionId}`;

  // Priority 1 — Constitutional Law.
  if (!organHasCompleteConstitutionalHome(organId)) {
    return {
      decision: {
        decisionId,
        organId,
        sourceIntentionId: intention.intentionId,
        verdict: 'rejected',
        reason: `"${organId}" does not have a complete constitutional home (region, system, boundary, authority) in the Skeleton.`,
        decidedAt: now,
      },
      rejection: null,
    };
  }

  // Priority 2 — Constitutional Wisdom.
  const faithfulness = evaluateFaithfulnessForOrgan(organId);
  if (!faithfulness.allFaithful) {
    return {
      decision: {
        decisionId,
        organId,
        sourceIntentionId: intention.intentionId,
        verdict: 'escalated',
        reason: `Constitutional Wisdom found at least one claim for "${organId}" that was not judged faithful.`,
        decidedAt: now,
      },
      rejection: null,
    };
  }

  // Priority 3 — Constitutional Memory and Constitutional Awareness.
  const hasMemory = getKnowledgeHistoryForOrgan(organId).length > 0;
  const condition = getConditionForOrgan(organId);
  const hasAwareness = condition.presenceStatus !== 'never-observed';
  if (!hasMemory || !hasAwareness) {
    return {
      decision: {
        decisionId,
        organId,
        sourceIntentionId: intention.intentionId,
        verdict: 'deferred',
        reason: `Insufficient grounding for "${organId}": ${!hasMemory ? 'no archived Memory' : 'no recognized Awareness presence'}.`,
        decidedAt: now,
      },
      rejection: null,
    };
  }

  // Priority 4 — every consultation passes.
  return {
    decision: {
      decisionId,
      organId,
      sourceIntentionId: intention.intentionId,
      verdict: 'approved',
      reason: `Constitutional Law is complete, Wisdom finds "${organId}" faithful, and both Memory and Awareness have real evidence.`,
      decidedAt: now,
    },
    rejection: null,
  };
}
