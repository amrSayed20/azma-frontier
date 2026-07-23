/**
 * AZMA OS — THE CONSTITUTIONAL MEMORY (THE LIVING MEMORY)
 * Construction Phase VIII — Type Definitions
 *
 * Authority: "The Constitutional Construction of the Living Body,"
 * Construction Phase VIII ("The Constitutional Memory — The Birth of the
 * Living Memory").
 *
 * CONTINUITY DISCLOSURE: Construction Phase V ("The Sovereign Core")
 * already disclosed, in its own PHASE_V_ENGINEERING_REVIEW.ts, that no
 * "Constitutional Memory" module existed anywhere in the repository, and
 * built a Memory Integration Layer as a read-only lens over the Nervous
 * System's Signal Log — flagged explicitly for Council review, not
 * asserted as a finished answer. This phase IS that Council review's
 * answer: it builds the real, dedicated Constitutional Memory the
 * Sovereign Core could previously only approximate. Phase V's own Memory
 * Integration Layer (src/sovereign-core/memory-integration.ts) is left
 * unchanged — it still reads the Signal Log directly, which remains
 * correct — but this phase gives the Body a properly named, dedicated
 * home for memory, reusing rather than replacing what Phase V built.
 *
 * DIKW HIERARCHY, evidence-grounded, not invented: Certification
 * Requirement 2 asks this phase to "distinguish data, information,
 * knowledge, and wisdom." Rather than invent a fourth new type system,
 * this phase maps each tier onto an already-existing, already-certified
 * type from an earlier phase:
 *   Data        -> ConstitutionalSignal      (Nervous System, Phase II)
 *   Information -> OrganCondition            (Consciousness, Phase VII)
 *   Knowledge   -> ConstitutionalAdvisory     (Sovereign Core, Phase V)
 *   Wisdom      -> ConstitutionalClaim of kind 'recommendation', archived
 *                  over time (this phase's own, genuinely new
 *                  contribution — see wisdom-archive.ts)
 * No tier duplicates another phase's type; each is read and archived,
 * never re-derived independently.
 */

import type { ConstitutionalSignal } from '../sovereign-nervous-system';
import type { OrganCondition } from '../sovereign-consciousness';
import type { ConstitutionalAdvisory, ConstitutionalClaim } from '../sovereign-core';
import type { ConversationThread } from '../core/tongue';

export type MemoryTier = 'Data' | 'Information' | 'Knowledge' | 'Wisdom';

export interface MemoryTierDescriptor {
  readonly tier: MemoryTier;
  readonly typeName: string;
  readonly evidenceSource: string;
}

/** One archived Advisory, timestamped at the moment Memory recorded it — not overwritten by later archive entries, unlike the Sovereign Core's own live cache. */
export interface ArchivedAdvisory {
  readonly organId: string;
  readonly advisory: ConstitutionalAdvisory;
  readonly archivedAt: string;
}

export interface ExperienceTimelineEntry {
  readonly timestamp: string;
  readonly kind: 'signal' | 'advisory';
  readonly organId: string;
  readonly summary: string;
}

export interface RelationshipMemoryRecord {
  readonly fromOrganId: string;
  readonly toOrganId: string;
  readonly kind: string;
  readonly bothOrgansEverObserved: boolean;
  readonly evidence: string;
}

/** A disclosed, read-only lens over the Sovereign Tongue's existing session-scoped continuity data — not a new store, not organ/signal-scoped like everything else in this module. */
export interface CreatorJourneySnapshot {
  readonly thread: ConversationThread;
  readonly source: string;
}

export interface ConstitutionalMemoryCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}

export type { ConstitutionalSignal, OrganCondition, ConstitutionalAdvisory, ConstitutionalClaim };
