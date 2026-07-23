/**
 * AZMA OS — THE CONSTITUTIONAL CONSCIOUSNESS
 * The Constitutional Presence Layer
 * Construction Phase VII
 *
 * NAMING DISCLOSURE (see types.ts header): this is the 4th distinct use
 * of "Presence" found across this repository this campaign. Scoped
 * narrowly and only to: whether an organ is currently PRESENT — i.e.
 * actively observed/reporting — in the Sovereign Body. This is exactly
 * what the Heart's own Continuity Tracker (Phase IV) already computes;
 * this file is a thin, disclosed lens over it, not a second continuity
 * mechanism. Explicitly NOT the same concept as Construction Phase VI's
 * cinematic "Imperial Presence" (src/imperial-presence/), ACDE's narrow
 * DirectorPresence type, or Makman's unrelated "Living Presence Layer."
 */

import { getOrganContinuity, listAllOrganContinuity, CONSTITUTIONAL_RHYTHM } from '../sovereign-heart';

/** Whether one organ is currently present (has reported within the Heart's own continuity threshold) — never-observed or silent organs are honestly reported as not present. */
export function isOrganPresent(organId: string): boolean {
  const status = getOrganContinuity(organId, CONSTITUTIONAL_RHYTHM).status;
  return status === 'continuous';
}

/** Every Skeleton-registered organ id currently present, by the same Heart-derived formula, applied identically to every organ. */
export function listPresentOrganIds(): readonly string[] {
  return listAllOrganContinuity(CONSTITUTIONAL_RHYTHM)
    .filter((record) => record.status === 'continuous')
    .map((record) => record.organId);
}
