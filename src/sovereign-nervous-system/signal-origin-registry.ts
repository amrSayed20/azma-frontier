/**
 * AZMA OS — THE CONSTITUTIONAL NERVOUS SYSTEM
 * The Constitutional Signal Origin Registry
 * Construction Phase II
 *
 * Per the Constitutional Principle of Inheritance ("all... organ
 * definitions... shall be inherited from the Constitutional Skeleton
 * whenever possible. No duplicate constitutional definitions shall be
 * introduced"), this is NOT a second list of organs. It is a thin,
 * read-only validator over src/sovereign-body's own Organ Registry
 * (Phase I) — a signal's origin is legitimate if and only if it names a
 * real, already-registered organ id. No new organ identifiers are
 * defined here.
 */

import { getOrganById } from '../sovereign-body';

/** Every signal possesses exactly one constitutional origin (Phase II, Article VIII) — this is legitimate only if it names an organ already recognized by the Skeleton. */
export function isLegitimateSignalOrigin(organId: string): boolean {
  return getOrganById(organId) !== null;
}

/** Throws if the given organ id is not a recognized constitutional organ. Used by the Perception Bus before accepting a signal — this is validation, not interpretation: it checks WHO is speaking, never WHAT they said. */
export function assertLegitimateSignalOrigin(organId: string): void {
  if (!isLegitimateSignalOrigin(organId)) {
    throw new Error(
      `Constitutional Nervous System: "${organId}" is not a recognized constitutional organ (src/sovereign-body Organ Registry). Every signal must possess one legitimate constitutional origin (Phase II, Article VIII).`,
    );
  }
}
