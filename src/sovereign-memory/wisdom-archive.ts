/**
 * AZMA OS — THE CONSTITUTIONAL MEMORY
 * The Constitutional Wisdom Archive
 * Construction Phase VIII
 *
 * The Body's most-refined preserved output: every 'recommendation'-kind
 * Claim the Sovereign Core has ever produced, across every Advisory the
 * Knowledge Repository has archived — never re-reasoned, never
 * re-evaluated, only filtered and preserved. This is the Wisdom tier of
 * the Memory Registry's own DIKW hierarchy (see memory-registry.ts).
 * Deliberately does NOT rank, prioritize, or act on any recommendation —
 * that would be interpretation or execution, both explicitly forbidden
 * by this phase's Constitutional Limits.
 */

import { getFullKnowledgeRepository } from './knowledge-repository';
import type { ConstitutionalClaim } from '../sovereign-core';

export interface WisdomRecord {
  readonly organId: string;
  readonly claim: ConstitutionalClaim;
  readonly archivedAt: string;
}

/** Every recommendation-kind Claim ever archived, across all organs, oldest first. */
export function getFullWisdomArchive(): readonly WisdomRecord[] {
  const records: WisdomRecord[] = [];
  for (const entry of getFullKnowledgeRepository()) {
    for (const claim of entry.advisory.claims) {
      if (claim.kind === 'recommendation') {
        records.push({ organId: entry.organId, claim, archivedAt: entry.archivedAt });
      }
    }
  }
  return records;
}

/** Every recommendation-kind Claim ever archived for one organ, oldest first. */
export function getWisdomForOrgan(organId: string): readonly WisdomRecord[] {
  return getFullWisdomArchive().filter((record) => record.organId === organId);
}
