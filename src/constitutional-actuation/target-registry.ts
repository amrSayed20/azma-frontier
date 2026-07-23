/**
 * AZMA OS — THE CONSTITUTIONAL ACTUATION
 * The Constitutional Target Registry
 * Construction Campaign
 *
 * A valid Constitutional Target is simply an already-registered Skeleton
 * organ (Phase I) — this file reuses CONSTITUTIONAL_ORGANS directly,
 * never inventing a second target concept (there is no external
 * infrastructure target authorized anywhere in this campaign — see
 * types.ts's own disclosure).
 */

import { CONSTITUTIONAL_ORGANS } from '../sovereign-body';

export function isValidTarget(organId: string): boolean {
  return CONSTITUTIONAL_ORGANS.some((organ) => organ.id === organId);
}

export function listValidTargetOrganIds(): readonly string[] {
  return CONSTITUTIONAL_ORGANS.map((organ) => organ.id);
}
