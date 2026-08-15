/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LAUNCH FOUNDATION — COMMERCIAL GOAL COMPLETION PIPELINE
 * (WORK PACKAGE B: DISTRIBUTION CONTRACTS)
 * (Construction ID MAG-LF-001)
 *
 * Declares the two new Operational Contracts this pipeline requires.
 * Every field type is reused by reference from an already-certified or
 * already-existing file — nothing here redefines AccessPolicy,
 * CompiledAssemblyGraph, SovereignPublication, PublicationRenderState, or
 * RuntimeChainContext.
 */

import type { CompiledAssemblyGraph } from '../ras-al-amr/pre-publishing-boundary';
import type { AccessPolicy, SovereignPublication } from './publication-contracts';
import type { PublicationRenderState } from './rendering-bridge';
import type { RuntimeChainContext } from './MAKMAN_OPERATIONAL_DELIVERY_CONTRACTS';

/**
 * Bundles exactly the fields SovereignPublication/CompiledAssemblyGraph
 * require that GoalContract does not carry. Supplied by the caller — this
 * package does not decide publisherTenantId, accessPolicy, or the
 * compiled graph; those are the Creator's own commercial decision
 * (ARTICLE VIII) and RAS AL AMR's own compiled output, arriving as a
 * second, distribution-time handoff distinct from the original Goal
 * Handover (see MAKMAN_RUNTIME_CORE_RAS_AL_AMR_INTEGRATION.ts).
 */
export interface MakmanCommercialIntent {
  readonly publisherTenantId: string;
  readonly compiledAssemblyGraph: CompiledAssemblyGraph;
  readonly accessPolicy: AccessPolicy;
  readonly coverArtUri?: string;
  /** Unix ms timestamp. When present and in the future, publication is created in scheduled (not yet published) state. */
  readonly scheduledPublishAt?: number;
}

export interface GoalDistributionBridgeResult {
  readonly publication: SovereignPublication;
  readonly renderState: PublicationRenderState;
  readonly chainContext: RuntimeChainContext;
}

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS_DECLARATION = {
  newTypesIntroduced: ['MakmanCommercialIntent', 'GoalDistributionBridgeResult'],
  existingTypesReusedByReference: ['CompiledAssemblyGraph', 'AccessPolicy', 'SovereignPublication', 'PublicationRenderState', 'RuntimeChainContext'],
  status: 'LAUNCH FOUNDATION (MAG-LF-001), WORK PACKAGE B, DISTRIBUTION CONTRACTS, complete.',
} as const;
