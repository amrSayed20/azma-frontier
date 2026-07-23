/**
 * AZMA OS — THE CONSTITUTIONAL MEMORY
 * The Constitutional Relationship Memory
 * Construction Phase VIII
 *
 * The Skeleton's own Relationship Registry (Phase I,
 * CONSTITUTIONAL_RELATIONSHIPS) is a static, declarative fact table — it
 * never changes and carries no history. This file cross-references each
 * declared relationship against the History Archive to record whether
 * BOTH organs in the relationship have ever actually appeared in the
 * constitutional record — a real, historically-traceable fact, not a
 * re-assertion of the static declaration. SCOPE DISCLOSURE: this checks
 * only that both organs have been observed at all, not that the specific
 * declared relationship (e.g. "depends-on") was itself exercised in any
 * particular exchange — the Nervous System deliberately treats signal
 * content as opaque and uninterpreted (Phase II, Article I), and this
 * phase's own Constitutional Limits forbid interpreting meaning, so
 * inspecting content to confirm a specific interaction is out of scope.
 */

import { CONSTITUTIONAL_RELATIONSHIPS } from '../sovereign-body';
import { getFullHistory } from './history-archive';
import type { RelationshipMemoryRecord } from './types';

export function getRelationshipMemory(): readonly RelationshipMemoryRecord[] {
  const history = getFullHistory();
  const observedOrganIds = new Set(history.map((signal) => signal.origin));

  return CONSTITUTIONAL_RELATIONSHIPS.map((relationship) => {
    const fromObserved = observedOrganIds.has(relationship.fromOrganId);
    const toObserved = observedOrganIds.has(relationship.toOrganId);
    const bothOrgansEverObserved = fromObserved && toObserved;
    return {
      fromOrganId: relationship.fromOrganId,
      toOrganId: relationship.toOrganId,
      kind: relationship.kind,
      bothOrgansEverObserved,
      evidence: bothOrgansEverObserved
        ? `Both ${relationship.fromOrganId} and ${relationship.toOrganId} have appeared as a signal origin in the constitutional History Archive.`
        : `At least one of ${relationship.fromOrganId}/${relationship.toOrganId} has never appeared as a signal origin in the History Archive.`,
    };
  });
}
