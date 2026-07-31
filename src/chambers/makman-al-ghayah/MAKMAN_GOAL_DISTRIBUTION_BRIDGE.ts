/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LAUNCH FOUNDATION — COMMERCIAL GOAL COMPLETION PIPELINE
 * (WORK PACKAGE C: GOAL DISTRIBUTION BRIDGE — PHASES A & B)
 * (Construction ID MAG-LF-001)
 *
 * Phase A: the operational bridge that transfers a constitutionally
 * completed Goal into the existing destination pipeline, preserving Goal
 * identity, Goal Commitment, and constitutional traceability.
 *
 * Phase B: integrates with the already-implemented DESTINATION_EXECUTION_COMPONENT
 * (FlattenedRenderingBridge) by calling it, unmodified, and supplies
 * CONSUMPTION_GATEWAY_COMPONENT's own already-declared IPublicationRegistry
 * dependency for the first time (consumption-boundary.ts declared this
 * interface but nothing in the repository ever implemented it — supplying
 * an implementation is integration, not redesign).
 *
 * PACKAGE XXVII — SOVEREIGN EXPORT ENGINE (2026-07-28, constitutional
 * naming only, zero logic changed): `bridgeToDestination()` is the entry
 * point of the Sovereign Export Engine — it receives the Render Graph
 * (`intent.compiledAssemblyGraph`, produced by Ras Al Amr's
 * PrePublishingBoundary, Package XXVI) and forwards it unmodified to
 * FlattenedRenderingBridge; see direction-workspace-constitution.ts's own
 * Package XXVII disclosure for the full chain and its one disclosed gap.
 */

import { GoalContract, GoalStatus } from './goal-contracts';
import type { SovereignPublication } from './publication-contracts';
import { FlattenedRenderingBridge } from './rendering-bridge';
import type { IPublicationRegistry } from './consumption-boundary';
import type { RuntimeChainContext } from './MAKMAN_OPERATIONAL_DELIVERY_CONTRACTS';
import type { MakmanCommercialIntent, GoalDistributionBridgeResult } from './MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS';

/**
 * MINISTRY VIII — REAL CINEMATIC LEDGER
 *
 * The Cinematic Ledger dependency the Distribution Bridge writes to.
 * Defined here because this bridge is the constitutional point of production —
 * the moment a completed Goal transitions into a permanent sovereign publication.
 * The concrete implementation (CinematicLedger in persistent-storage) adapts to
 * this interface without modifying the bridge's own business logic.
 *
 * record() is called after evaluateAndDispatchRender() resolves, so
 * initialRenderStatus reflects the genuine starting production status
 * (DYNAMIC/PROCESSING/FAILED), not a placeholder.
 */
export interface ICinematicLedger {
  record(
    publication: SovereignPublication,
    sourceCanvasId: string,
    canvasType: string,
    initialRenderStatus: string,
    operationId?: string,
    goalId?: string,
  ): void;
}

export class MakmanGoalNotCompletedError extends Error {
  constructor(goalId: string, actualStatus: GoalStatus) {
    super(`Goal [${goalId}] cannot enter the Distribution Bridge: status is [${actualStatus}], not COMPLETED. Goal Commitment must reach Fulfilment before Distribution.`);
    this.name = 'MakmanGoalNotCompletedError';
  }
}

export class MakmanGoalIdentityMismatchError extends Error {
  constructor(goalId: string, chainContextGoalId: string) {
    super(`Goal identity mismatch: goal.goalId [${goalId}] does not match chainContext.goalId [${chainContextGoalId}]. Constitutional traceability cannot be preserved across a mismatched identity.`);
    this.name = 'MakmanGoalIdentityMismatchError';
  }
}

let publicationCounter = 0;
function generatePublicationId(): string {
  publicationCounter += 1;
  return `pub-${Date.now()}-${publicationCounter}`;
}

/**
 * First real implementation of CONSUMPTION_GATEWAY_COMPONENT's own
 * IPublicationRegistry dependency (consumption-boundary.ts) — an
 * in-memory catalog, the same pattern already accepted for goal-state.ts
 * and MonetizationLedgerGateway's ledgers.
 */
export class MakmanPublicationRegistry implements IPublicationRegistry {
  private readonly publications = new Map<string, SovereignPublication>();

  public register(publication: SovereignPublication): void {
    this.publications.set(publication.publicationId, publication);
  }

  public async getPublication(publicationId: string): Promise<SovereignPublication | null> {
    return this.publications.get(publicationId) ?? null;
  }
}

/**
 * Transfers a constitutionally completed Goal into the existing
 * Distribution pipeline. Constructs a SovereignPublication from the
 * Goal plus the caller-supplied MakmanCommercialIntent, registers it, and
 * dispatches it to the already-existing FlattenedRenderingBridge
 * (DESTINATION_EXECUTION_COMPONENT) unmodified.
 */
export class MakmanGoalDistributionBridge {
  constructor(
    private readonly registry: MakmanPublicationRegistry,
    private readonly renderingBridge: FlattenedRenderingBridge,
    private readonly cinemaLedger?: ICinematicLedger,
  ) {}

  public async bridgeToDestination(
    goal: GoalContract,
    chainContext: RuntimeChainContext,
    intent: MakmanCommercialIntent
  ): Promise<GoalDistributionBridgeResult> {
    if (goal.status !== GoalStatus.COMPLETED) {
      throw new MakmanGoalNotCompletedError(goal.goalId, goal.status);
    }
    if (goal.goalId !== chainContext.goalId) {
      throw new MakmanGoalIdentityMismatchError(goal.goalId, chainContext.goalId);
    }

    const now = Date.now();
    const publication: SovereignPublication = {
      publicationId: generatePublicationId(),
      sourceCompilationId: intent.compiledAssemblyGraph.compilationId,
      publisherTenantId: intent.publisherTenantId,
      title: goal.title,
      description: goal.description,
      coverArtUri: intent.coverArtUri,
      accessPolicy: intent.accessPolicy,
      isPublished: true,
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    this.registry.register(publication);

    const renderState = await this.renderingBridge.evaluateAndDispatchRender(publication, intent.compiledAssemblyGraph);

    // Cinematic Ledger — permanent constitutional record of this production event.
    // Written after render dispatch so the initial status is the genuine one.
    this.cinemaLedger?.record(
      publication,
      intent.compiledAssemblyGraph.sourceCanvasId,
      intent.compiledAssemblyGraph.canvasType,
      renderState.status,
      renderState.activeOperationId,
      goal.goalId,
    );

    return { publication, renderState, chainContext };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_GOAL_DISTRIBUTION_BRIDGE_DECLARATION = {
  destinationExecutionComponentRedesigned: false,
  publicationRegistrySuppliedForFirstTime: true,
  goalIdentityPreserved: true,
  constitutionalTraceabilityPreserved: true,
  status: 'LAUNCH FOUNDATION (MAG-LF-001), WORK PACKAGE C, GOAL DISTRIBUTION BRIDGE (PHASES A & B), complete.',
} as const;
