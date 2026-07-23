/**
 * AZMA OS — SOVEREIGN OPERATIONAL ENTRY LAYER (SOEL) V1.0
 * (Construction ID MAG-LB-001)
 *
 * The constitutional operational boundary between the external world and
 * the sovereign internal platform, for Launch. Not Al-Wateen. Not Runtime.
 * Not Business Logic. Not an AI Orchestrator.
 *
 * SOEL is the ONLY module outside Makman Al-Ghayah's own chamber that
 * imports its Runtime/Bridge/Consumption constructs directly. The Public
 * API Surface (the Next.js route files under app/api/sovereign/entry/)
 * imports only from here — never from src/chambers/makman-al-ghayah
 * directly — enforcing "Runtime shall only be exposed through SOEL."
 *
 * SOEL originates no authorization, no business rule, and no AI-provider
 * call. It forwards two already-certified capabilities and nothing else.
 *
 * DISCOVERED DURING CONSTRUCTION: MakmanGoalRuntime is single-use by its
 * own certified design (MAG-OPF-001's own Identity/Scope: "One Runtime
 * Core instance serves exactly one Goal's full lifecycle") — its stage
 * tracking cannot be reset. submitCreatorGoal() therefore constructs a
 * fresh MakmanGoalRuntime per call, sharing only the underlying GoalState
 * store — this is a correct reflection of MAG-OPF-001's own declaration,
 * not a new constitutional decision.
 *
 * EXTENDED (MAG-LB-002): compileCanvasForPublishing() forwards to RAS AL
 * AMR's already-certified PrePublishingBoundary.compileForPublishing() —
 * the one Sovereign Operational Entry Layer now serves both chambers,
 * per this Package's own instruction to integrate with, not duplicate,
 * the already-certified SOEL. Its output (a CompiledAssemblyGraph) is
 * exactly what submitCreatorGoal()'s request shape requires, closing the
 * gap MAG-LB-001 disclosed ("a real caller today still needs a
 * CompiledAssemblyGraph... itself dependent on RAS AL AMR's own
 * unbuilt compilation endpoint").
 */

import { GoalState } from '../chambers/makman-al-ghayah/goal-state';
import { MakmanGoalRuntime } from '../chambers/makman-al-ghayah/MAKMAN_RUNTIME_CORE_ORCHESTRATION';
import type { MakmanGoalDistributionBridge } from '../chambers/makman-al-ghayah/MAKMAN_GOAL_DISTRIBUTION_BRIDGE';
import type { PublicConsumptionBoundary, ConsumptionResponse } from '../chambers/makman-al-ghayah/consumption-boundary';
import { runFirstCustomerJourney } from '../chambers/makman-al-ghayah/MAKMAN_FIRST_CUSTOMER_JOURNEY_PIPELINE';
import type {
  MakmanFirstCustomerJourneyRequest,
  MakmanFirstCustomerJourneyResult,
} from '../chambers/makman-al-ghayah/MAKMAN_FIRST_CUSTOMER_JOURNEY_PIPELINE';
import type { PrePublishingBoundary } from '../chambers/ras-al-amr/pre-publishing-boundary';
import type { CompiledAssemblyGraph } from '../chambers/ras-al-amr/pre-publishing-boundary';
import type { SovereignCanvas } from '../chambers/ras-al-amr/assembly-contracts';

export class SovereignOperationalEntryLayer {
  constructor(
    private readonly goalState: GoalState,
    private readonly bridge: MakmanGoalDistributionBridge,
    private readonly consumptionBoundary: PublicConsumptionBoundary,
    private readonly prePublishingBoundary: PrePublishingBoundary,
  ) {}

  /** Forwards to Makman's already-certified runFirstCustomerJourney() with a freshly-constructed, single-use Runtime. */
  public async submitCreatorGoal(
    request: MakmanFirstCustomerJourneyRequest,
  ): Promise<MakmanFirstCustomerJourneyResult> {
    const runtime = new MakmanGoalRuntime(this.goalState);
    return runFirstCustomerJourney(runtime, this.bridge, request);
  }

  /** Forwards to Makman's already-certified PublicConsumptionBoundary.requestConsumption(). */
  public async requestConsumption(
    publicationId: string,
    requesterTenantId?: string,
    isAgeVerified = false,
    isoCountryCode?: string,
  ): Promise<ConsumptionResponse> {
    return this.consumptionBoundary.requestConsumption(publicationId, requesterTenantId, isAgeVerified, isoCountryCode);
  }

  /** Forwards to RAS AL AMR's already-certified PrePublishingBoundary.compileForPublishing(). */
  public async compileCanvasForPublishing(
    canvas: SovereignCanvas,
    authenticatedTenantId: string,
  ): Promise<CompiledAssemblyGraph> {
    return this.prePublishingBoundary.compileForPublishing(canvas, authenticatedTenantId);
  }
}
