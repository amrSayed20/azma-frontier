/**
 * AZMA OS — THE SOVEREIGN CAPABILITY DIWAN
 * Public API — import from here, never directly from diwan.ts,
 * types.ts, lifecycle.ts, taxonomy.ts, or queries.ts.
 *
 * Construction ID SCD-003, Campaign C — Constitutional Taxonomy,
 * Certification & Governance. See SCD_003_ENGINEERING_REVIEW.ts (and
 * SCD_001/SCD_002 before it) for what each campaign did and deliberately
 * did not do.
 */

export type {
  ConstitutionalCapability,
  CapabilityOwner,
  CapabilityCategory,
  ConstitutionalConsumer,
  CapabilityVisibility,
  CapabilityLifecycleState,
  CapabilityCertificationStatus,
  CertificationRecord,
  CapabilityRelationshipKind,
  CapabilityRelationship,
  RetirementRecord,
} from './types';

export { CAPABILITY_DIWAN } from './diwan';

export { CONSTITUTIONAL_LIFECYCLE_CONTRACT } from './lifecycle';

export { CAPABILITY_TAXONOMY } from './taxonomy';
export type { TaxonomyCategoryDefinition } from './taxonomy';

export {
  listAllCapabilities,
  getCapabilityById,
  listCapabilitiesByOwner,
  listCapabilitiesByLifecycleState,
  listDiscoverableCapabilitiesFor,
  getConstitutionalObservationSummary,
} from './queries';
export type { ConstitutionalObservationSummary } from './queries';
