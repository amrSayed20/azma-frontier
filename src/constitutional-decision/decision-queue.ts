/**
 * AZMA OS — THE CONSTITUTIONAL DECISION
 * The Constitutional Decision Queue
 * Construction Campaign
 *
 * A pull-based processor, NOT a Bus subscriber — the identical
 * discipline Constitutional Will itself established. Reads Constitutional
 * Will's own listReadyIntentions() on demand, evaluates each exactly
 * once, and appends any resulting Decision to this append-only queue.
 * Never processes the same intention twice.
 */

import { listReadyIntentions } from '../constitutional-will';
import { evaluateIntentionForDecision } from './decision-evaluator';
import type { ConstitutionalDecision, DecisionRejection } from './types';

let decisions: ConstitutionalDecision[] = [];
let rejections: DecisionRejection[] = [];
const processedIntentionIds = new Set<string>();

/** Pulls Will's current ready Intentions, decides any new ones, and records any rejections — read-only toward Will itself. */
export function processIntentionsIntoDecisions(): readonly ConstitutionalDecision[] {
  const decided: ConstitutionalDecision[] = [];
  for (const intention of listReadyIntentions()) {
    if (processedIntentionIds.has(intention.intentionId)) continue;
    processedIntentionIds.add(intention.intentionId);

    const { decision, rejection } = evaluateIntentionForDecision(intention);
    if (decision) {
      decisions.push(decision);
      decided.push(decision);
    } else if (rejection) {
      rejections.push(rejection);
    }
  }
  return decided;
}

export function getDecisionQueue(): readonly ConstitutionalDecision[] {
  return [...decisions];
}

export function getDecisionsForOrgan(organId: string): readonly ConstitutionalDecision[] {
  return decisions.filter((decision) => decision.organId === organId);
}

export function getDecisionRejections(): readonly DecisionRejection[] {
  return [...rejections];
}

/** Test/reset utility — clears this module's own state without touching Will itself. */
export function resetDecisionQueue(): void {
  decisions = [];
  rejections = [];
  processedIntentionIds.clear();
}
