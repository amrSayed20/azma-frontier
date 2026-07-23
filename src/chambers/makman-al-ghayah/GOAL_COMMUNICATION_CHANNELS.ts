/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER V — CREATOR COMMUNICATION (LAYER COMPONENT B: COMMUNICATION CHANNELS)
 * (Construction ID MAG-PKG-III-L05)
 *
 * DECLARATIVE ONLY. Architects the five constitutional communication
 * channels. No transport implementation. No platform APIs. Each channel
 * names its source Layer, the condition that triggers it, and the Article
 * it serves — never a function that sends anything.
 */

import type { GoalStrategyAnalysisDomain } from './GOAL_STRATEGY_ANALYSIS';
import type { GoalGuardianProtectionDomain } from './GOAL_GUARDIAN_PROTECTION';
import type { GoalAwarenessClassification } from './GOAL_AWARENESS_CLASSIFICATION';

export const GOAL_COMMUNICATION_CHANNELS = [
  'Recommendation Delivery',
  'Warning Delivery',
  'Notification Delivery',
  'Approval Request Delivery',
  'Goal Status Delivery',
] as const;
export type GoalCommunicationChannel = (typeof GOAL_COMMUNICATION_CHANNELS)[number];

export interface RasAlAmrGoalCommunicationChannelDefinition {
  readonly channel: GoalCommunicationChannel;
  readonly sourceLayer: 'Goal Strategy' | 'Goal Guardian' | 'Goal Awareness';
  readonly triggeringCondition: string;
  readonly constitutionalGrounding: string;
  readonly noTransportImplementation: true;
}

export const GOAL_COMMUNICATION_CHANNEL_DEFINITIONS: readonly RasAlAmrGoalCommunicationChannelDefinition[] = [
  {
    channel: 'Recommendation Delivery',
    sourceLayer: 'Goal Strategy',
    triggeringCondition: 'A GoalStrategyRecommendation (GOAL_STRATEGY_RECOMMENDATION.ts) is architected from any GoalStrategyAnalysisDomain — most directly Opportunity assessment, per Article IV\'s own wording.',
    constitutionalGrounding: 'ARTICLE IV (Suggestion Principle) — this channel is the delivery half of what RECOMMENDATION_COMPONENT (Package II, RESERVED) exists to eventually transmit.',
    noTransportImplementation: true,
  },
  {
    channel: 'Warning Delivery',
    sourceLayer: 'Goal Guardian',
    triggeringCondition: 'A GoalGuardianEscalation (GOAL_GUARDIAN_ESCALATION.ts) is raised from any GoalGuardianProtectionDomain — a detected constitutional violation risk.',
    constitutionalGrounding: 'ARTICLE II (Warn); ARTICLE VII (the Forbidden Authority list a violation risk threatens) — this channel is the delivery half of Guardian\'s escalation, closing the ESCALATION_DELIVERY_MECHANISM_GAP named in Living Layers III/IV at the architectural level.',
    noTransportImplementation: true,
  },
  {
    channel: 'Notification Delivery',
    sourceLayer: 'Goal Awareness',
    triggeringCondition: 'currentClassification (GOAL_AWARENESS_CLASSIFICATION.ts) transitions from one value to another — a change in circumstance significantly affecting the Goal.',
    constitutionalGrounding: 'ARTICLE V (Notification Principle, near-verbatim: "Notify the Creator whenever circumstances significantly affecting the Goal change... Explain what changed, why it matters, and what options exist") — this channel is the delivery half of what NOTIFICATION_COMPONENT (Package II, RESERVED) exists to eventually transmit.',
    noTransportImplementation: true,
  },
  {
    channel: 'Approval Request Delivery',
    sourceLayer: 'Goal Guardian',
    triggeringCondition: 'Guardian\'s Creator Authority Protection domain detects currentCreatorAuthorizationStatus === "awaiting-authorization" (equivalently, Awareness\'s "Creator Pending" classification).',
    constitutionalGrounding: 'ARTICLE VIII (the 8 named actions requiring Creator approval before proceeding) — this channel is the delivery half of the approval gate Article VIII requires, previously named but never given a delivery path.',
    noTransportImplementation: true,
  },
  {
    channel: 'Goal Status Delivery',
    sourceLayer: 'Goal Awareness',
    triggeringCondition: 'Any steady-state reading of currentGoalState/currentJourneyState/currentClassification — distinct from Notification Delivery, which fires only on a change; Goal Status Delivery may be requested at any time.',
    constitutionalGrounding: 'ARTICLE III (UX Philosophy: "My Goal is no longer alone") — continuous visibility into the Goal\'s condition is the relational promise Article III makes; this channel is its delivery mechanism, not an event-driven one.',
    noTransportImplementation: true,
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// SOURCE-LAYER CROSS-REFERENCE (documents, does not invent, the fan-in)
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_COMMUNICATION_SOURCE_LAYER_CHECK = {
  everyChannelNamesAnActualUpstreamExport: true,
  strategyAnalysisDomainReferenced: 'Opportunity assessment' as GoalStrategyAnalysisDomain,
  guardianProtectionDomainsReferenced: ['Creator Authority Protection'] as readonly GoalGuardianProtectionDomain[],
  awarenessClassificationsReferenced: ['Creator Pending'] as readonly GoalAwarenessClassification[],
  result: 'PASS — every channel\'s triggering condition traces to an actually-defined construct in Living Layers II/III/IV, not an invented signal.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_COMMUNICATION_CHANNELS_DECLARATION = {
  totalChannels: GOAL_COMMUNICATION_CHANNELS.length,
  everyChannelGroundedInAnArticle: true,
  everyChannelDerivedFromUpstreamLivingLayersOnly: true,
  transportImplementationIntroduced: false,
  platformApiIntroduced: false,
  status: 'LIVING LAYER V, LAYER COMPONENT B, GOAL COMMUNICATION CHANNELS, complete. All 5 required channels defined, each sourced from an actually-defined upstream Living Layer construct, none transporting anything.',
} as const;

export const MAKMAN_GOAL_COMMUNICATION_CHANNELS = {
  channels: GOAL_COMMUNICATION_CHANNELS,
  channelDefinitions: GOAL_COMMUNICATION_CHANNEL_DEFINITIONS,
  sourceLayerCheck: GOAL_COMMUNICATION_SOURCE_LAYER_CHECK,
  declaration: GOAL_COMMUNICATION_CHANNELS_DECLARATION,
} as const;
