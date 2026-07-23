/**
 * AZMA OS — THE CONSTITUTIONAL WILL (THE IMPERIAL INTENTION)
 * Construction Campaign — Type Definitions
 *
 * Authority: "The Constitutional Construction Campaign," THE
 * CONSTITUTIONAL WILL ("The Birth of the Imperial Intention").
 *
 * STRICTER SEPARATION THAN ANY PRIOR PHASE: "Receive only from the
 * Constitutional Reception Layer" is read literally. Unlike Al-Wateen,
 * the Sovereign Core, Consciousness, Memory, Evolution, and Reception —
 * every one of which subscribes directly to the Nervous System's Bus —
 * this module has NO subscription of its own to that Bus at all. It
 * only ever reads src/constitutional-reception/'s own getReceptionQueue()
 * output, pulled on demand (processReceptionQueueIntoIntentions()), never
 * pushed to it. This is the clearest layering boundary this campaign has
 * built: Will cannot see a raw signal, an organ's state, or an
 * expression — only what Reception has already queued.
 *
 * READINESS IS NOT EXECUTION: a ConstitutionalIntention's readiness
 * field can only ever be 'formed' — there is no function anywhere in
 * this module (or exported from it) that transitions an intention
 * further, executes it, or notifies anything. Forming an intention is
 * the entire scope of this Campaign.
 */

import type { ReceivedExpression } from '../constitutional-reception';

export type IntentionReadiness = 'formed';

export interface ConstitutionalIntention {
  readonly intentionId: string;
  readonly organId: string;
  readonly sourceReceptionId: string;
  readonly statement: string;
  readonly formedAt: string;
  readonly readiness: IntentionReadiness;
}

export interface IntentionRejection {
  readonly receptionId: string;
  readonly reason: string;
}

export interface ConstitutionalWillCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}

export type { ReceivedExpression };
