/**
 * AZMA OS — THE SOVEREIGN BODY
 * The Constitutional Skeleton — Query Layer
 * Construction Phase I — The Constitutional Skeleton
 *
 * Pure, read-only accessor functions over the Skeleton's registries. No
 * mutation, no side effects, no scheduling — exactly the same discipline
 * already established for the Sovereign Identity Layer and the Sovereign
 * Capability Diwan's own query layers. "The Skeleton owns no runtime
 * behavior" is honored here by construction: every function below only
 * reads already-declared static data.
 */

import { CONSTITUTIONAL_REGIONS } from './region-registry';
import { CONSTITUTIONAL_SYSTEMS } from './system-registry';
import { CONSTITUTIONAL_ORGANS } from './organ-registry';
import { CONSTITUTIONAL_RELATIONSHIPS } from './relationship-registry';
import { CONSTITUTIONAL_BOUNDARIES } from './boundary-registry';
import { CONSTITUTIONAL_AUTHORITIES } from './authority-registry';
import type {
  ConstitutionalRegion,
  ConstitutionalRegionId,
  ConstitutionalSystem,
  ConstitutionalOrgan,
  ConstitutionalRelationship,
  ConstitutionalBoundary,
  ConstitutionalAuthority,
  OrganImplementationStatus,
} from './types';

export function getRegionById(id: ConstitutionalRegionId): ConstitutionalRegion | null {
  return CONSTITUTIONAL_REGIONS.find((region) => region.id === id) ?? null;
}

export function getSystemForRegion(regionId: ConstitutionalRegionId): ConstitutionalSystem | null {
  return CONSTITUTIONAL_SYSTEMS.find((system) => system.regionId === regionId) ?? null;
}

export function listOrgansByRegion(regionId: ConstitutionalRegionId): readonly ConstitutionalOrgan[] {
  return CONSTITUTIONAL_ORGANS.filter((organ) => organ.regionId === regionId);
}

export function getOrganById(id: string): ConstitutionalOrgan | null {
  return CONSTITUTIONAL_ORGANS.find((organ) => organ.id === id) ?? null;
}

export function listOrgansByImplementationStatus(
  status: OrganImplementationStatus,
): readonly ConstitutionalOrgan[] {
  return CONSTITUTIONAL_ORGANS.filter((organ) => organ.implementationStatus === status);
}

export function listRelationshipsForOrgan(organId: string): readonly ConstitutionalRelationship[] {
  return CONSTITUTIONAL_RELATIONSHIPS.filter(
    (relationship) => relationship.fromOrganId === organId || relationship.toOrganId === organId,
  );
}

export function getBoundaryForOrgan(organId: string): ConstitutionalBoundary | null {
  return CONSTITUTIONAL_BOUNDARIES.find((boundary) => boundary.organId === organId) ?? null;
}

export function getAuthorityForOrgan(organId: string): ConstitutionalAuthority | null {
  return CONSTITUTIONAL_AUTHORITIES.find((authority) => authority.organId === organId) ?? null;
}

/**
 * A future organ's readiness check: does it already have a defined
 * region, system, boundary, and authority? Pure evaluation — decides
 * nothing, executes nothing, only reports what the registries already
 * contain.
 */
export function organHasCompleteConstitutionalHome(organId: string): boolean {
  const organ = getOrganById(organId);
  if (!organ) return false;
  return Boolean(
    getRegionById(organ.regionId) &&
      getSystemForRegion(organ.regionId) &&
      getBoundaryForOrgan(organId) &&
      getAuthorityForOrgan(organId),
  );
}
