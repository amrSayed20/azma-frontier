/**
 * AZMA OS — THE CONSTITUTIONAL DECISION (IMPERIAL JUDGMENT)
 * Construction Campaign — Type Definitions
 *
 * Authority: "The Constitutional Construction Campaign," THE
 * CONSTITUTIONAL DECISION ("The Birth of Imperial Judgment").
 *
 * "RECEIVE ONLY FROM WILL" VS. "CONSULT WISDOM/MEMORY/AWARENESS/LAW",
 * reconciled precisely: the ONLY source of a candidate to decide upon is
 * Constitutional Will's own Intention Queue — this module has no Bus
 * subscription of its own, exactly like Will (see
 * decision-queue.ts's own disclosure). "Consult" means reading the
 * already-certified, pure QUERY functions of Wisdom
 * (evaluateFaithfulnessForOrgan), Memory (getKnowledgeHistoryForOrgan),
 * Consciousness (getConditionForOrgan), and the Skeleton
 * (organHasCompleteConstitutionalHome) for CONTEXT — never as a second
 * source of intentions, never through a live subscription, never
 * mutating anything they hold. This is the same distinction already
 * drawn for "Al-Wateen... never governs" and "the Sovereign Core...
 * never executes": consulting an organ's already-published truth is not
 * "direct communication" with it in the forbidden, live-coupling sense.
 */

import type { ConstitutionalIntention } from '../constitutional-will';

export type ConstitutionalDecisionVerdict = 'approved' | 'deferred' | 'rejected' | 'escalated';

export interface ConstitutionalDecision {
  readonly decisionId: string;
  readonly organId: string;
  readonly sourceIntentionId: string;
  readonly verdict: ConstitutionalDecisionVerdict;
  readonly reason: string;
  readonly decidedAt: string;
}

export interface DecisionRejection {
  readonly intentionId: string;
  readonly reason: string;
}

export interface ConstitutionalDecisionCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}

export type { ConstitutionalIntention };
