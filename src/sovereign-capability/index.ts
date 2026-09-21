/**
 * AZMA OS — THE SOVEREIGN CAPABILITY DIWAN
 * Public API — import from here, never directly from diwan.ts,
 * types.ts, lifecycle.ts, taxonomy.ts, or queries.ts.
 *
 * ─── BOUNDED PURPOSE (Diwan Authority Closure, 2026-09-21) ────────────────
 *
 *   This module is a GOVERNANCE RECORD — taxonomy, lifecycle and
 *   certification vocabulary from Campaigns A–C — and NOT an authority over
 *   what a Creator can do. The sole authority for executable Creator
 *   capability is src/chamber-truth/, every entry of which carries the
 *   service boundary that performs it; the Manifest derives from it and the
 *   Kernel consumes the Manifest.
 *
 *   Measured at closure: no file outside this directory imports it, no
 *   runtime decision reads CAPABILITY_DIWAN, and the ids recorded here
 *   (e.g. 'vault-review-treasury-records') name no boundary in the
 *   repository. A test in src/chamber-truth holds the import count at
 *   zero so this record cannot quietly become an authority again.
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
