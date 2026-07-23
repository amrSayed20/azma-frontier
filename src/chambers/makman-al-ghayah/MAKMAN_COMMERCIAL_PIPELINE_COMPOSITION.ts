/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LAUNCH FOUNDATION — COMMERCIAL GOAL COMPLETION PIPELINE
 * (WORK PACKAGE D: PIPELINE COMPOSITION — PHASE B, COMPLETING ALL FOUR INTEGRATIONS)
 * (Construction ID MAG-LF-001)
 *
 * MAKMAN_GOAL_DISTRIBUTION_BRIDGE.ts already integrates with
 * DESTINATION_EXECUTION_COMPONENT (FlattenedRenderingBridge) and supplies
 * CONSUMPTION_GATEWAY_COMPONENT's missing IPublicationRegistry dependency.
 * This file completes Phase B by assembling the full consumption-side
 * stack — ACCESS_ENFORCEMENT_COMPONENT (SovereignAccessPolicyEngine) and
 * MONETIZATION_LEDGER_COMPONENT (MonetizationLedgerGateway) — into a real,
 * working PublicConsumptionBoundary (CONSUMPTION_GATEWAY_COMPONENT), using
 * only their existing, unmodified constructors.
 */

import { SovereignAccessPolicyEngine } from './access-policy-engine';
import { MonetizationLedgerGateway } from './monetization-ledger-gateway';
import { FlattenedRenderingBridge } from './rendering-bridge';
import { PublicConsumptionBoundary } from './consumption-boundary';
import { MakmanPublicationRegistry } from './MAKMAN_GOAL_DISTRIBUTION_BRIDGE';

export interface MakmanCommercialPipelineComposition {
  readonly publicationRegistry: MakmanPublicationRegistry;
  readonly policyEngine: SovereignAccessPolicyEngine;
  readonly ledgerGateway: MonetizationLedgerGateway;
  readonly renderingBridge: FlattenedRenderingBridge;
  readonly consumptionBoundary: PublicConsumptionBoundary;
}

/**
 * Assembles all four named operational components into one working
 * composition, using only their existing constructors — none redesigned,
 * none replaced. renderingBridge is accepted as a parameter because
 * FlattenedRenderingBridge requires a real FleetDispatcher, which is a
 * platform-level composition concern outside this Chamber's scope.
 */
export function composeMakmanCommercialPipeline(
  renderingBridge: FlattenedRenderingBridge
): MakmanCommercialPipelineComposition {
  const publicationRegistry = new MakmanPublicationRegistry();
  const policyEngine = new SovereignAccessPolicyEngine();
  const ledgerGateway = new MonetizationLedgerGateway();

  const consumptionBoundary = new PublicConsumptionBoundary(
    publicationRegistry,
    policyEngine,
    ledgerGateway,
    renderingBridge
  );

  return {
    publicationRegistry,
    policyEngine,
    ledgerGateway,
    renderingBridge,
    consumptionBoundary,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_COMMERCIAL_PIPELINE_COMPOSITION_DECLARATION = {
  componentsIntegrated: [
    'DESTINATION_EXECUTION_COMPONENT (FlattenedRenderingBridge, injected unmodified)',
    'ACCESS_ENFORCEMENT_COMPONENT (SovereignAccessPolicyEngine, constructed unmodified)',
    'MONETIZATION_LEDGER_COMPONENT (MonetizationLedgerGateway, constructed unmodified)',
    'CONSUMPTION_GATEWAY_COMPONENT (PublicConsumptionBoundary, constructed unmodified, given its first real IPublicationRegistry)',
  ],
  anyComponentRedesigned: false,
  status: 'LAUNCH FOUNDATION (MAG-LF-001), WORK PACKAGE D, PIPELINE COMPOSITION, complete. All four named Distribution components are now wired into one working stack for the first time.',
} as const;
