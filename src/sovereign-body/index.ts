/**
 * AZMA OS — THE SOVEREIGN BODY
 * Public API — import from here, never directly from the individual
 * registry files.
 *
 * Construction Phase I — The Constitutional Skeleton. See
 * SOVEREIGN_BODY_PHASE_I_ENGINEERING_REVIEW.ts for what this phase built
 * and deliberately did not build.
 */

export type {
  ConstitutionalBody,
  ConstitutionalRegion,
  ConstitutionalRegionId,
  ConstitutionalSystem,
  ConstitutionalSystemId,
  ConstitutionalOrgan,
  OrganImplementationStatus,
  ConstitutionalRelationship,
  ConstitutionalRelationshipKind,
  ConstitutionalBoundary,
  ConstitutionalAuthority,
  ConstitutionalClassification,
  ConstitutionalConstructKind,
} from './types';

export { SOVEREIGN_BODY } from './body-registry';
export { CONSTITUTIONAL_REGIONS } from './region-registry';
export { CONSTITUTIONAL_SYSTEMS } from './system-registry';
export { CONSTITUTIONAL_ORGANS } from './organ-registry';
export { CONSTITUTIONAL_RELATIONSHIPS } from './relationship-registry';
export { CONSTITUTIONAL_BOUNDARIES } from './boundary-registry';
export { CONSTITUTIONAL_AUTHORITIES } from './authority-registry';
export { CONSTITUTIONAL_CLASSIFICATIONS, getClassificationCounts } from './classification-registry';

export {
  getRegionById,
  getSystemForRegion,
  listOrgansByRegion,
  getOrganById,
  listOrgansByImplementationStatus,
  listRelationshipsForOrgan,
  getBoundaryForOrgan,
  getAuthorityForOrgan,
  organHasCompleteConstitutionalHome,
} from './queries';
