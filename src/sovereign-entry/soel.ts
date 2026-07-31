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
 *
 * EXTENDED (PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE): getCreatorGoal()
 * is the sanctioned read forward for a Goal previously created via
 * submitCreatorGoal() — one of the three prerequisites the Chief
 * Architect ruled must close together (the other two: GoalContract's
 * new subscriberTenantId field, and the goalId link written back onto
 * the originating VaultAsset — see app/api/sovereign/entry/creator-goal/
 * route.ts and src/vault/sovereign-vault-manager.ts). SOEL now forwards
 * four already-certified capabilities, not two.
 */

import { GoalState } from '../chambers/makman-al-ghayah/goal-state';
import type { GoalContract } from '../chambers/makman-al-ghayah/goal-contracts';
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
import type { ISovereignPurposeStore, SovereignPurpose } from '../chambers/makman-al-ghayah/sovereign-purpose';
import type { SuccessCriterion } from '../chambers/makman-al-ghayah/goal-contracts';

export type MilestoneDesignationOutcome =
  | { readonly ok: true; readonly goal: GoalContract }
  | { readonly ok: false; readonly reason: 'NO_SOVEREIGN_PURPOSE' | 'GOAL_NOT_FOUND' };

export type DefineSuccessCriteriaOutcome =
  | { readonly ok: true; readonly goal: GoalContract }
  | { readonly ok: false; readonly reason: 'GOAL_NOT_FOUND' };

export class SovereignOperationalEntryLayer {
  constructor(
    private readonly goalState: GoalState,
    private readonly bridge: MakmanGoalDistributionBridge,
    private readonly consumptionBoundary: PublicConsumptionBoundary,
    private readonly prePublishingBoundary: PrePublishingBoundary,
    private readonly purposeStore?: ISovereignPurposeStore,
  ) {}

  /** Forwards to Makman's already-certified runFirstCustomerJourney() with a freshly-constructed, single-use Runtime. */
  public async submitCreatorGoal(
    request: MakmanFirstCustomerJourneyRequest,
  ): Promise<MakmanFirstCustomerJourneyResult> {
    const runtime = new MakmanGoalRuntime(this.goalState);
    return runFirstCustomerJourney(runtime, this.bridge, request);
  }

  /**
   * PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE: the sanctioned read
   * forward Package VIII found missing. Returns undefined for both "no
   * such Goal" and "this Goal belongs to another tenant" — deliberately
   * indistinguishable, so a caller learns nothing about another
   * Creator's Goals even by probing ids.
   */
  public getCreatorGoal(goalId: string, requesterTenantId: string): GoalContract | undefined {
    const goal = this.goalState.getGoal(goalId);
    if (!goal || goal.subscriberTenantId !== requesterTenantId) return undefined;
    return goal;
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

  /**
   * SOVEREIGN PURPOSE FOUNDATION — Constitutional Foundation Package I.
   * Returns the Creator's Sovereign Purpose, or null if never stated.
   * A Creator can only read their own Purpose — the creatorId is always
   * sourced from the verified session, never from a caller-supplied value.
   */
  public getSovereignPurpose(creatorId: string): SovereignPurpose | null {
    return this.purposeStore?.getSovereignPurpose(creatorId) ?? null;
  }

  /**
   * SOVEREIGN PURPOSE FOUNDATION — Constitutional Foundation Package I.
   * Records the Creator's Sovereign Purpose durably. Only the Creator
   * themselves may set their own Purpose — creatorId is always sourced
   * from the verified session. Returns the persisted SovereignPurpose.
   */
  public setSovereignPurpose(creatorId: string, purposeStatement: string): SovereignPurpose {
    if (!this.purposeStore) {
      throw new Error('Sovereign Purpose store is not wired — setSovereignPurpose() requires a configured ISovereignPurposeStore.');
    }
    return this.purposeStore.setSovereignPurpose(creatorId, purposeStatement);
  }

  /**
   * MILESTONE SUCCESS DEFINITION FOUNDATION (Constitutional Package III).
   * Records the Creator's explicit definition of what must become observably
   * true for a Goal to be considered successful. Replaces any prior criteria
   * list on the Goal. Each description becomes one SuccessCriterion with a
   * server-generated criterionId and definedAtMs timestamp.
   *
   * GoalStatus.COMPLETED ≠ any criterion being satisfied. These remain
   * constitutionally distinct: this method defines intent; assessment is future.
   */
  public defineSuccessCriteria(
    goalId: string,
    creatorId: string,
    descriptions: readonly string[],
  ): DefineSuccessCriteriaOutcome {
    const goal = this.goalState.getGoal(goalId);
    if (!goal || goal.subscriberTenantId !== creatorId) {
      return { ok: false, reason: 'GOAL_NOT_FOUND' };
    }
    const now = Date.now();
    const successCriteria: readonly SuccessCriterion[] = descriptions.map((description, index) => ({
      criterionId: `${now}-${index}`,
      description,
      definedAtMs: now,
    }));
    const updated: GoalContract = { ...goal, successCriteria, updatedAtMs: now };
    this.goalState.update(updated, { isAuthorized: true });
    return { ok: true, goal: updated };
  }

  /**
   * SOVEREIGN PURPOSE → MILESTONE GOAL FOUNDATION (Constitutional Package II).
   * Designates an existing Goal as a Milestone Goal serving the Creator's
   * Sovereign Purpose. Snapshots the current Purpose wording into the Goal
   * so the historical relationship survives any future Purpose edits.
   * Returns ok:false rather than throwing for the two expected failure modes
   * so the API route can produce the correct HTTP status without catching.
   */
  public designateGoalAsMilestone(goalId: string, creatorId: string): MilestoneDesignationOutcome {
    const purpose = this.purposeStore?.getSovereignPurpose(creatorId) ?? null;
    if (!purpose) return { ok: false, reason: 'NO_SOVEREIGN_PURPOSE' };

    const goal = this.goalState.getGoal(goalId);
    if (!goal || goal.subscriberTenantId !== creatorId) return { ok: false, reason: 'GOAL_NOT_FOUND' };

    const updated: GoalContract = {
      ...goal,
      sovereignPurposeStatement: purpose.purposeStatement,
      updatedAtMs: Date.now(),
    };
    this.goalState.update(updated, { isAuthorized: true });
    return { ok: true, goal: updated };
  }
}
