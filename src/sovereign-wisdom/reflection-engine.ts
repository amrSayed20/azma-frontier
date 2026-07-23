/**
 * AZMA OS — THE CONSTITUTIONAL WISDOM
 * The Constitutional Reflection Engine
 * Construction Phase IX
 *
 * A purely backward-looking, statistical aggregation over the
 * Constitutional Memory's own accumulated Knowledge Repository (Phase
 * VIII) — never re-deriving reasoning, only counting what the Sovereign
 * Core has already concluded over time. Feeds the Maturity Layer's own
 * "increases through experience" requirement.
 */

import { getKnowledgeHistoryForOrgan } from '../sovereign-memory';
import type { ConstitutionalClaim } from '../sovereign-core';
import type { ReflectionSummary } from './types';

export function reflectOnOrgan(organId: string): ReflectionSummary {
  const history = getKnowledgeHistoryForOrgan(organId);
  const claimKindCounts: Record<ConstitutionalClaim['kind'], number> = {
    fact: 0,
    inference: 0,
    uncertainty: 0,
    recommendation: 0,
  };

  for (const entry of history) {
    for (const claim of entry.advisory.claims) {
      claimKindCounts[claim.kind] += 1;
    }
  }

  return { organId, totalArchivedAdvisories: history.length, claimKindCounts };
}
