/**
 * AZMA OS — RAS AL AMR
 * PACKAGE IV — THE FIRST LIVING HEART
 * MISSION III — RELATIONSHIP CONTINUITY (WORK PACKAGE C: RELATIONSHIP PRESENCE)
 * (Construction ID RAS-IV-M03)
 *
 * DECLARATIVE ONLY. Defines how Presence (Mission II — session-scoped
 * technical continuity) evolves into Relationship (Mission III —
 * partnership-scoped continuity across time). This file composes the two;
 * it redefines neither.
 */

import type { PresenceExecutionContext } from './PRESENCE_CONTEXT';
import type { RelationshipContext } from './RELATIONSHIP_CONTEXT';
import type { RelationshipMemory } from './RELATIONSHIP_MEMORY';

export interface RelationshipPresence {
  readonly presence: PresenceExecutionContext;
  readonly relationshipContext: RelationshipContext;
  readonly relationshipMemory: RelationshipMemory;
}

export interface RasAlAmrPresenceToRelationshipEvolution {
  readonly presenceConcept: string;
  readonly relationshipConcept: string;
  readonly whatChanges: string;
}

export const PRESENCE_TO_RELATIONSHIP_EVOLUTION: readonly RasAlAmrPresenceToRelationshipEvolution[] = [
  {
    presenceConcept: 'PresenceExecutionContext.previous — the prior *session\'s* technical snapshot.',
    relationshipConcept: 'RelationshipContext.lastMeaningfulInteraction — the prior *relationship-significant* moment, which may be many sessions ago.',
    whatChanges: 'Scope widens from one session back to the entire partnership; content narrows from a full technical snapshot to only the 4 named meaningful-interaction kinds.',
  },
  {
    presenceConcept: 'PresenceContinuity (Mission II) — Recovery as a cross-cutting capability restoring continuity within one session\'s interruption.',
    relationshipConcept: 'RelationshipMemory.hasAbandonedWorkWorthyOfReturn — continuity restored across an interruption that outlasted the session entirely (an abandoned project, possibly returned to years later).',
    whatChanges: 'Recovery (Mission II) answers "did the Creator just step away and come back"; Relationship answers "did the Creator leave altogether and come back" — the same underlying constitutional principle (TIME.ts, Interruption Recovery; RELATIONSHIP.ts, failure), applied at two different time scales.',
  },
  {
    presenceConcept: 'RuntimeCoreAwareness (Mission I) — a single point-in-time snapshot, no relationship history.',
    relationshipConcept: 'RelationshipContext.currentRelationshipState / currentCollaborationState — carries forward whether this is a first meeting, a continuing partnership, or a return.',
    whatChanges: 'Mission I and II never asked "have we met before" — that question belongs exclusively to Relationship, grounded in RELATIONSHIP.ts, never invented here.',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// "NEVER BEHAVE AS THOUGH IT HAS FORGOTTEN THE CREATOR" — the boundary
// ═══════════════════════════════════════════════════════════════════════════

export const RELATIONSHIP_PRESENCE_CONTINUITY_GUARANTEE = {
  rule: 'The Chamber shall never behave as though it has forgotten the Creator. The Chamber shall preserve continuity without assuming new authority.',
  meansConcretely: [
    'RelationshipMemory.hasMetCreatorBefore, when true, is always available to whatever future Mission renders the Chamber\'s greeting or opening behavior — this Mission does not implement that rendering itself (no UI, no presentation, per every prior Stage\'s boundary).',
    'No field in this file grants Relationship any authority Mission I, Mission II, or Package II/III did not already establish — RelationshipPresence is a composition, not a new authority.',
  ],
  constitutionalSource: 'RELATIONSHIP.ts, firstMeeting ("The first encounter shall never feel like software onboarding.") — applied here to *returning*, not just first, encounters.',
} as const;

export const RELATIONSHIP_PRESENCE_DECLARATION = {
  redefinesPresenceExecutionContext: false,
  redefinesRelationshipContext: false,
  redefinesRelationshipMemory: false,
  assumesNewAuthority: false,
  status: 'PACKAGE IV — MISSION III, WORK PACKAGE C, RELATIONSHIP PRESENCE, complete. A composition of Presence (Mission II) and Relationship (this Mission, Work Packages A-B) — no new authority.',
} as const;

export const RAS_AL_AMR_RELATIONSHIP_PRESENCE = {
  evolution: PRESENCE_TO_RELATIONSHIP_EVOLUTION,
  continuityGuarantee: RELATIONSHIP_PRESENCE_CONTINUITY_GUARANTEE,
  declaration: RELATIONSHIP_PRESENCE_DECLARATION,
} as const;
