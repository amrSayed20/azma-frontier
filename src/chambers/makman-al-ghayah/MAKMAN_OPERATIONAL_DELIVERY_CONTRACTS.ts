/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * OPERATIONAL FOUNDATION — RECOMMENDATION & NOTIFICATION OPERATIONAL SYSTEM
 * (WORK PACKAGE B: DELIVERY CONTRACTS)
 * (Construction ID MAG-OPF-002)
 *
 * Declares every type the Delivery System operates on. GoalNotification is
 * the one genuinely new construct in this Package — see the honesty note
 * in MAKMAN_OPERATIONAL_DELIVERY_IDENTITY.ts. Everything else is reused by
 * reference from already-certified Living Layer files.
 */

import type { GoalContract } from './goal-contracts';
import type { GoalPresenceIdentity } from './GOAL_PRESENCE_IDENTITY';
import type { GoalAwarenessIdentity } from './GOAL_AWARENESS_IDENTITY';
import type { GoalAwarenessClassification } from './GOAL_AWARENESS_CLASSIFICATION';
import type { GoalGuardianIdentity } from './GOAL_GUARDIAN_IDENTITY';
import type { GoalStrategyIdentity } from './GOAL_STRATEGY_IDENTITY';
import type { GoalCommunicationIdentity } from './GOAL_COMMUNICATION_IDENTITY';

/**
 * Notification content. NEW — grounded in ARTICLE V and
 * NOTIFICATION_COMPONENT's own Package II purpose text ("Explain what
 * changed, why it matters, and what options exist"), mirroring the
 * justification/alternatives shape Strategy already established for
 * Recommendation content, so the two channels share a consistent contract
 * pattern rather than two unrelated ad hoc shapes.
 */
export interface GoalNotification {
  readonly fromClassification: GoalAwarenessClassification;
  readonly toClassification: GoalAwarenessClassification;
  readonly whatChanged: string;
  readonly whyItMatters: string;
  readonly availableOptions: readonly string[];
  readonly isExecutable: false;
  readonly destination: 'the-creator';
}

/**
 * Traceability bundle. Every field is reused, by indexed reference, from
 * an already-certified Identity interface — nothing here is redefined.
 */
export interface RuntimeChainContext {
  readonly goalId: GoalContract['goalId'];
  readonly presenceId: GoalPresenceIdentity['presenceId'];
  readonly awarenessId: GoalAwarenessIdentity['awarenessId'];
  readonly guardianId: GoalGuardianIdentity['guardianId'];
  readonly strategyId: GoalStrategyIdentity['strategyId'];
  readonly communicationId: GoalCommunicationIdentity['communicationId'];
}

export const DELIVERY_CHANNELS = ['Recommendation Delivery', 'Notification Delivery'] as const;
export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number];

/**
 * Deliberately stops at "ready-for-creator" — no "delivered" or
 * "acknowledged" status exists yet, because no transport implementation is
 * authorized in this Package (mirrors GOAL_COMMUNICATION_CHANNELS.ts's own
 * "No transport implementation. No platform APIs." constraint).
 */
export const DELIVERY_STATUSES = ['received', 'ready-for-creator'] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export interface RasAlAmrMakmanDeliveryRecord<TContent> {
  readonly deliveryId: string;
  readonly channel: DeliveryChannel;
  readonly content: TContent;
  readonly chainContext: RuntimeChainContext;
  readonly status: DeliveryStatus;
  readonly receivedAtMs: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_OPERATIONAL_DELIVERY_CONTRACTS_DECLARATION = {
  newTypesIntroduced: ['GoalNotification', 'RuntimeChainContext', 'DeliveryChannel', 'DeliveryStatus', 'RasAlAmrMakmanDeliveryRecord'],
  recommendationShapeReused: true,
  identityShapesReusedByReference: true,
  status: 'OPERATIONAL FOUNDATION (MAG-OPF-002), WORK PACKAGE B, DELIVERY CONTRACTS, complete.',
} as const;
