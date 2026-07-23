/**
 * AZMA OS — THE CONSTITUTIONAL WILL
 * The Constitutional Intention Queue
 * Construction Campaign
 *
 * A pull-based processor, NOT a Bus subscriber (see types.ts's own
 * disclosure). Reads Constitutional Reception's own getReceptionQueue()
 * on demand, evaluates each entry exactly once, and appends any formed
 * Intention to this append-only queue. Never processes the same
 * reception twice.
 */

import { getReceptionQueue } from '../constitutional-reception';
import { evaluateReceptionForIntention } from './intention-evaluator';
import type { ConstitutionalIntention, IntentionRejection } from './types';

let intentions: ConstitutionalIntention[] = [];
let rejections: IntentionRejection[] = [];
const processedReceptionIds = new Set<string>();

/** Pulls Reception's current queue, forms any new Intentions, and records any rejections — read-only toward Reception itself. */
export function processReceptionQueueIntoIntentions(): readonly ConstitutionalIntention[] {
  const formed: ConstitutionalIntention[] = [];
  for (const entry of getReceptionQueue()) {
    if (processedReceptionIds.has(entry.receptionId)) continue;
    processedReceptionIds.add(entry.receptionId);

    const { intention, rejection } = evaluateReceptionForIntention(entry);
    if (intention) {
      intentions.push(intention);
      formed.push(intention);
    } else if (rejection) {
      rejections.push(rejection);
    }
  }
  return formed;
}

export function getIntentionQueue(): readonly ConstitutionalIntention[] {
  return [...intentions];
}

export function getIntentionsForOrgan(organId: string): readonly ConstitutionalIntention[] {
  return intentions.filter((intention) => intention.organId === organId);
}

export function getIntentionRejections(): readonly IntentionRejection[] {
  return [...rejections];
}

/** Test/reset utility — clears this module's own state without touching Reception itself. */
export function resetIntentionQueue(): void {
  intentions = [];
  rejections = [];
  processedReceptionIds.clear();
}
