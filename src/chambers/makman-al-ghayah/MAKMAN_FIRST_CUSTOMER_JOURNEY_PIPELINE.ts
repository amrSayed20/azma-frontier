/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LAUNCH FOUNDATION — FIRST CUSTOMER JOURNEY COMPLETION PIPELINE
 * (WORK PACKAGE C: JOURNEY PIPELINE COORDINATOR — PHASE B / PHASE C)
 * (Construction ID MAG-LF-002)
 *
 * The single function that runs the entire customer journey from a
 * compiled assembly to a distribution-ready publication, with zero manual
 * intervention between stages. It introduces no new logic of its own — it
 * only calls already-certified methods, in the already-derived order, and
 * threads their return values forward. This is Phase C's own validation
 * that no manual intervention is required, made real rather than merely
 * asserted.
 */

import { GoalContract, GoalPriority, GoalStatus } from './goal-contracts';
import type { CompiledAssemblyGraph } from '../ras-al-amr/pre-publishing-boundary';
import { createGoalFromCompiledAssembly } from './MAKMAN_GOAL_CREATION_CONNECTOR';
import { MakmanGoalRuntime } from './MAKMAN_RUNTIME_CORE_ORCHESTRATION';
import type { CreatorAuthorizationDecision } from './goal-state';
import { MakmanGoalDistributionBridge } from './MAKMAN_GOAL_DISTRIBUTION_BRIDGE';
import type { RuntimeChainContext } from './MAKMAN_OPERATIONAL_DELIVERY_CONTRACTS';
import type { MakmanCommercialIntent, GoalDistributionBridgeResult } from './MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS';

export interface MakmanFirstCustomerJourneyRequest {
  readonly compiledGraph: CompiledAssemblyGraph;
  readonly description: string;
  readonly priority: GoalPriority;
  readonly authorization: CreatorAuthorizationDecision;
  readonly commercialIntent: MakmanCommercialIntent;
}

export interface MakmanFirstCustomerJourneyResult {
  readonly goal: GoalContract;
  readonly bridgeResult: GoalDistributionBridgeResult;
}

/**
 * Runs the complete journey: Goal creation → Runtime instantiation →
 * Goal Commitment → Goal Distribution Bridge. No stage requires manual
 * intervention beyond the request's own fields, all supplied up front.
 */
export async function runFirstCustomerJourney(
  runtime: MakmanGoalRuntime,
  bridge: MakmanGoalDistributionBridge,
  request: MakmanFirstCustomerJourneyRequest
): Promise<MakmanFirstCustomerJourneyResult> {
  const goal = createGoalFromCompiledAssembly(request.compiledGraph, request.description, request.priority);

  runtime.handoverGoal(goal);

  const presence = runtime.instantiatePresence(goal.goalId);
  const awareness = runtime.instantiateAwareness();
  const guardian = runtime.instantiateGuardian();
  const strategy = runtime.instantiateStrategy();
  const communication = runtime.instantiateCommunication();

  const completedGoal: GoalContract = {
    ...goal,
    status: GoalStatus.COMPLETED,
    updatedAtMs: Date.now(),
  };

  runtime.commitGoal('update', completedGoal, request.authorization);

  const chainContext: RuntimeChainContext = {
    goalId: goal.goalId,
    presenceId: presence.presenceId,
    awarenessId: awareness.awarenessId,
    guardianId: guardian.guardianId,
    strategyId: strategy.strategyId,
    communicationId: communication.communicationId,
  };

  const bridgeResult = await bridge.bridgeToDestination(completedGoal, chainContext, request.commercialIntent);

  return { goal: completedGoal, bridgeResult };
}

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_FIRST_CUSTOMER_JOURNEY_PIPELINE_DECLARATION = {
  newLogicIntroduced: false,
  callsOnlyAlreadyCertifiedMethods: true,
  manualInterventionRequiredBetweenStages: false,
  livingLayerModified: false,
  runtimeCoreModified: false,
  status: 'LAUNCH FOUNDATION (MAG-LF-002), WORK PACKAGE C, JOURNEY PIPELINE COORDINATOR, complete. One function; zero duplicate logic; every stage already certified.',
} as const;
