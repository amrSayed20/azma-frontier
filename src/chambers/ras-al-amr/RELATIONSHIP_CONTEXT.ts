/**
 * AZMA OS — RAS AL AMR
 * PACKAGE IV — THE FIRST LIVING HEART
 * MISSION III — RELATIONSHIP CONTINUITY (WORK PACKAGE A: RELATIONSHIP CONTEXT)
 * (Construction ID RAS-IV-M03)
 *
 * DECLARATIVE ONLY. Defines the living relationship context: the last
 * meaningful interaction, the current creative journey, the current
 * relationship state, and the current collaboration state — each grounded
 * in RELATIONSHIP.ts (Package I) and pointing to, never duplicating,
 * RUNTIME.ts's PartnershipRuntimeState and Mission II's Presence.
 */

import type { PartnershipHistoryState } from './RUNTIME';
import type { PresenceExecutionContext } from './PRESENCE_CONTEXT';
import type { GoalConstitutionalState } from './PACKAGE_III_EXECUTION_GOAL_MODEL';

/**
 * Whether an interaction qualifies as "meaningful" for relationship
 * continuity purposes — deliberately narrow, per RELATIONSHIP.ts's own
 * named moments, not every technical event Presence tracks.
 */
export const MEANINGFUL_INTERACTION_KINDS = [
  'project-completed', 'recommendation-resolved', 'project-abandoned', 'return-after-absence',
] as const;
export type MeaningfulInteractionKind = (typeof MEANINGFUL_INTERACTION_KINDS)[number];

export interface RasAlAmrLastMeaningfulInteraction {
  readonly kind: MeaningfulInteractionKind;
  readonly presenceContextAtTime: PresenceExecutionContext | null;
}

export const MEANINGFUL_INTERACTION_GROUNDING: Readonly<Record<MeaningfulInteractionKind, string>> = {
  'project-completed': 'RELATIONSHIP.ts, growth ("Every completed project shall improve: Creative confidence, Artistic judgment, Professional maturity").',
  'recommendation-resolved': 'RELATIONSHIP.ts, failure ("Every rejected recommendation becomes understanding.").',
  'project-abandoned': 'RELATIONSHIP.ts, failure ("Every abandoned project remains worthy of return.").',
  'return-after-absence': 'RELATIONSHIP.ts, longTermPartnership ("The relationship is measured across years.").',
} as const;

/**
 * The creative journey, viewed at relationship scale rather than technical
 * scale — the Goal's own lifecycle (Package III), read only.
 */
export interface RasAlAmrCurrentCreativeJourney {
  readonly currentGoalState: GoalConstitutionalState | null;
  readonly source: 'PACKAGE_III_EXECUTION_GOAL_MODEL.ts, GOAL_CONSTITUTIONAL_STATES — read-only reference.';
}

/**
 * The relationship state itself — NOT redefined here. RUNTIME.ts's
 * PartnershipHistoryState (first-meeting / returning) already traces to
 * RELATIONSHIP.ts's firstMeeting vs. longTermPartnership sections; this
 * type re-uses it by reference.
 */
export type RasAlAmrCurrentRelationshipState = PartnershipHistoryState;

/**
 * Collaboration state — genuinely new: whether the current engagement is a
 * continuation, a fresh start, or a return following abandonment. Distinct
 * from RasAlAmrCurrentRelationshipState (which only distinguishes
 * first-meeting from returning, not the shape of a returning engagement).
 */
export const COLLABORATION_STATES = ['continuing', 'fresh-start', 'returning-after-abandonment'] as const;
export type CollaborationState = (typeof COLLABORATION_STATES)[number];

export const COLLABORATION_STATE_GROUNDING: Readonly<Record<CollaborationState, string>> = {
  continuing: 'RELATIONSHIP.ts, growth ("The relationship exists to strengthen the creator over time.") — the ordinary, uninterrupted case.',
  'fresh-start': 'RELATIONSHIP.ts, firstMeeting ("The creator shall feel welcomed into a professional creative partnership.").',
  'returning-after-abandonment': 'RELATIONSHIP.ts, failure ("Every abandoned project remains worthy of return... The Chamber shall encourage continuation. Never shame the creator.").',
} as const;

export interface RelationshipContext {
  readonly lastMeaningfulInteraction: RasAlAmrLastMeaningfulInteraction | null;
  readonly currentCreativeJourney: RasAlAmrCurrentCreativeJourney;
  readonly currentRelationshipState: RasAlAmrCurrentRelationshipState;
  readonly currentCollaborationState: CollaborationState;
}

export const RELATIONSHIP_CONTEXT_DECLARATION = {
  redefinesPartnershipHistoryState: false,
  storesDirectorDna: false,
  storesProjectContent: false,
  introducesNewConstitutionalAuthority: false,
  status: 'PACKAGE IV — MISSION III, WORK PACKAGE A, RELATIONSHIP CONTEXT, complete. One genuinely new concept (CollaborationState); everything else points to RUNTIME.ts, PRESENCE_CONTEXT.ts, or PACKAGE_III_EXECUTION_GOAL_MODEL.ts by reference.',
} as const;

export const RAS_AL_AMR_RELATIONSHIP_CONTEXT = {
  meaningfulInteractionGrounding: MEANINGFUL_INTERACTION_GROUNDING,
  collaborationStateGrounding: COLLABORATION_STATE_GROUNDING,
  declaration: RELATIONSHIP_CONTEXT_DECLARATION,
} as const;
