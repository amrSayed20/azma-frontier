/**
 * AZMA OS — RAS AL AMR
 * PACKAGE IV — THE FIRST LIVING HEART
 * MISSION III — RELATIONSHIP CONTINUITY (WORK PACKAGE B: RELATIONSHIP MEMORY)
 * (Construction ID RAS-IV-M03)
 *
 * DECLARATIVE ONLY. Per the directive's own explicit exclusions: "This is
 * not historical storage. This is not archive functionality. This is not
 * Creator Memory. Relationship Memory preserves only the continuity
 * required for the Chamber to remain a living companion."
 *
 * HONESTY CHECK performed before writing: MEMORY.ts (Package I) already
 * defines Creator Memory in full — Director DNA, User Style, Project
 * History, Preferred Camera Style, Preferred Pacing, Preferred Exports,
 * Frequent Corrections. INTERFACES.ts's Memory contract (PartnershipMemoryLedger)
 * already accumulates this content. RUNTIME.ts's PartnershipRuntimeState
 * already carries directorDnaPresent: boolean — "Presence of Director DNA
 * content — never its content." Relationship Memory does not restate, hold,
 * or reference any of that CONTENT. It holds only the FACT that continuity
 * exists — booleans and category markers, never the artistic preferences,
 * corrections, or history themselves.
 */

import type { CollaborationState } from './RELATIONSHIP_CONTEXT';

/**
 * The complete shape of what Relationship Memory preserves. Every field is
 * a fact about continuity's existence, never its content.
 */
export interface RelationshipMemory {
  readonly hasMetCreatorBefore: boolean;
  readonly hasAbandonedWorkWorthyOfReturn: boolean;
  readonly collaborationState: CollaborationState;
  readonly partnershipDurationCategory: 'first-meeting' | 'long-term';
}

export const RELATIONSHIP_MEMORY_FIELD_GROUNDING = {
  hasMetCreatorBefore: 'RUNTIME.ts, PartnershipHistoryState (\'first-meeting\' | \'returning\') — read-only reference; this field does not redefine that type, it derives a boolean from it.',
  hasAbandonedWorkWorthyOfReturn: 'RELATIONSHIP.ts, failure ("Every abandoned project remains worthy of return.") — a fact of continuity (something exists to return to), never the content of the abandoned work itself, which remains MEMORY.ts\'s RAS_AL_AMR_PROJECT_HISTORY domain, untouched.',
  collaborationState: 'RELATIONSHIP_CONTEXT.ts, CollaborationState (this Mission, Work Package A).',
  partnershipDurationCategory: 'RELATIONSHIP.ts, firstMeeting vs. longTermPartnership ("The relationship is measured across years.").',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// EXPLICIT NON-CONTENT — what Relationship Memory holds NONE of
// ═══════════════════════════════════════════════════════════════════════════

export const RELATIONSHIP_MEMORY_EXCLUDES = {
  directorDna: 'Excluded entirely. Remains MEMORY.ts, RAS_AL_AMR_DIRECTOR_DNA and INTERFACES.ts\'s Memory contract (PartnershipMemoryLedger) — this Mission neither reads nor restates that content, only observes RUNTIME.ts\'s directorDnaPresent boolean if and when Runtime Core Awareness (Mission I) already surfaces it.',
  userStyle: 'Excluded entirely. Remains MEMORY.ts, RAS_AL_AMR_USER_STYLE.',
  projectHistoryContent: 'Excluded entirely. Remains MEMORY.ts, RAS_AL_AMR_PROJECT_HISTORY. RelationshipMemory.hasAbandonedWorkWorthyOfReturn is a boolean fact, never a reference to the project\'s actual content.',
  preferredCameraStylePacingExports: 'Excluded entirely. Remain MEMORY.ts\'s respective sections.',
  frequentCorrections: 'Excluded entirely. Remains MEMORY.ts, RAS_AL_AMR_FREQUENT_CORRECTIONS.',
  note: 'Relationship Memory is not a second Memory Domain. It is the minimum set of continuity facts required for RELATIONSHIP_PRESENCE.ts (Work Package C) to avoid behaving as though the Chamber has forgotten the Creator — nothing more.',
} as const;

export const RELATIONSHIP_MEMORY_DECLARATION = {
  isCreatorMemory: false,
  isHistoricalStorage: false,
  isArchiveFunctionality: false,
  holdsDirectorDnaContent: false,
  holdsProjectContent: false,
  holdsOnlyContinuityFacts: true,
  introducesNewConstitutionalAuthority: false,
  status: 'PACKAGE IV — MISSION III, WORK PACKAGE B, RELATIONSHIP MEMORY, complete. Four boolean/category fields, zero content fields — Creator Memory (MEMORY.ts) remains untouched and is the sole authority over what is actually remembered.',
} as const;

export const RAS_AL_AMR_RELATIONSHIP_MEMORY = {
  fieldGrounding: RELATIONSHIP_MEMORY_FIELD_GROUNDING,
  excludes: RELATIONSHIP_MEMORY_EXCLUDES,
  declaration: RELATIONSHIP_MEMORY_DECLARATION,
} as const;
