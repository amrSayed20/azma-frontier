/**
 * AZMA OS — THE CONSTITUTIONAL RECEPTION (THE IMPERIAL LISTENER)
 * Construction Campaign — Type Definitions
 *
 * Authority: "The Constitutional Construction Campaign," THE
 * CONSTITUTIONAL RECEPTION ("The Birth of the Imperial Listener").
 *
 * CONTINUITY WITH THE COUNCIL'S OWN DECISION: following the
 * Constitutional Expression Campaign's certification, the Council ruled
 * the Expression Layer "shall remain the only authorized pathway through
 * which the Living Body expresses itself... All future communication
 * shall originate through the Constitutional Expression Layer." This
 * module is therefore the first and only consumer of
 * composeExpressionForOrgan() (src/constitutional-expression/) — it
 * never reads Al-Wateen, the Sovereign Core, Consciousness, Memory, or
 * Evolution directly. Every ReceivedExpression wraps an already-composed
 * ConstitutionalExpression UNMODIFIED — this module never alters,
 * rephrases, or reinterprets what it receives.
 *
 * NO REAL RECIPIENT YET, disclosed honestly: per this Campaign's own Out
 * of Scope ("No UI. No rendering. No notifications. No Creator-facing
 * presentation."), no recipient registered here is actually wired to a
 * live consumer. See recipient-registry.ts's own `connected: false` on
 * every entry — the same "Constitutionally Undefined, not filled in"
 * honesty already applied to CHAMBER_SCORES (SIO-001) and elsewhere in
 * this campaign.
 */

import type { ConstitutionalExpression } from '../constitutional-expression';

export type RecipientId = 'constitutional-council' | 'sovereign-creator';

export interface RecipientDescriptor {
  readonly recipientId: RecipientId;
  readonly authorized: boolean;
  readonly connected: boolean;
  readonly evidenceNote: string;
}

export interface ReceivedExpression {
  readonly receptionId: string;
  readonly expression: ConstitutionalExpression;
  readonly receivedAt: string;
  readonly deservesAttention: boolean;
}

export interface DeliveryResult {
  readonly delivered: boolean;
  readonly recipientId: RecipientId | null;
  readonly reason: string;
}

export interface ConstitutionalReceptionCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}
