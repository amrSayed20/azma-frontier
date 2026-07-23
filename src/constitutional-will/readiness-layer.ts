/**
 * AZMA OS — THE CONSTITUTIONAL READINESS LAYER
 * Construction Campaign
 *
 * Distinguishes readiness from execution by construction: readiness is
 * a permanent, terminal fact ('formed') about an Intention, never a
 * trigger. No function in this file — or anywhere in this module —
 * transitions an Intention, executes it, or notifies any consumer of
 * it. Reading readiness is the entire capability this file provides.
 */

import { getIntentionQueue } from './intention-queue';
import type { ConstitutionalIntention } from './types';

export function isReady(intention: ConstitutionalIntention): boolean {
  return intention.readiness === 'formed';
}

/** Every currently-formed, ready Intention — read-only; nothing is triggered by reading this list. */
export function listReadyIntentions(): readonly ConstitutionalIntention[] {
  return getIntentionQueue().filter((intention) => isReady(intention));
}
