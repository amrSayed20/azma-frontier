/**
 * AZMA OS — THE CONSTITUTIONAL CONSCIOUSNESS
 * The Constitutional Condition Monitor
 * Construction Phase VII
 *
 * Combines Awareness State (what an organ last reported) with the
 * Presence Layer (whether it is currently present) into one read-only
 * OrganCondition per organ. Combines only — no branch here decides
 * whether a condition is good, bad, expected, or concerning. That
 * remains strictly out of scope (Constitutional Limits: "shall never
 * interpret constitutional meaning... shall never produce constitutional
 * judgment").
 */

import { CONSTITUTIONAL_ORGANS } from '../sovereign-body';
import { getOrganContinuity, CONSTITUTIONAL_RHYTHM } from '../sovereign-heart';
import { getAwarenessStateForOrgan } from './awareness-state';
import type { OrganCondition } from './types';

export function getConditionForOrgan(organId: string): OrganCondition {
  return {
    organId,
    knownState: getAwarenessStateForOrgan(organId),
    presenceStatus: getOrganContinuity(organId, CONSTITUTIONAL_RHYTHM).status,
  };
}

/** Every Skeleton-registered organ's condition, not only ones that have reported — the same "no organ silently omitted" honesty already applied by the Heart's own listAllOrganContinuity(). */
export function listAllOrganConditions(): readonly OrganCondition[] {
  return CONSTITUTIONAL_ORGANS.map((organ) => getConditionForOrgan(organ.id));
}
