/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LAUNCH FOUNDATION — FIRST CUSTOMER JOURNEY COMPLETION PIPELINE
 * (WORK PACKAGE B: GOAL CREATION CONNECTOR — PHASE B)
 * (Construction ID MAG-LF-002)
 *
 * Closes the single largest gap found in Phase A: no function anywhere
 * converted a RAS AL AMR CompiledAssemblyGraph into a Makman GoalContract.
 * This file does exactly that and nothing else — a pure field mapping, no
 * business logic, no duplicate of any existing component.
 *
 * HONESTY CHECK: CompiledAssemblyGraph (and its hydratedCanvas) carries no
 * description field — SovereignCanvas never had one. description is
 * therefore accepted as a caller-supplied parameter, the same "supply
 * exactly what's missing" pattern already established for
 * MakmanCommercialIntent (MAG-LF-001) and RuntimeChainContext (MAG-OPF-002).
 */

import { GoalContract, GoalPriority, GoalStatus } from './goal-contracts';
import type { CompiledAssemblyGraph } from '../ras-al-amr/pre-publishing-boundary';
import type { MakmanCommercialIntent } from './MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS';

let goalCounter = 0;
function generateGoalId(): string {
  goalCounter += 1;
  return `goal-${Date.now()}-${goalCounter}`;
}

/**
 * Converts a RAS AL AMR CompiledAssemblyGraph into a real Makman
 * GoalContract, ready for handoverGoal(). title and subscriberTenantId
 * come directly from the compiled graph (real fields); description/
 * priority are caller-supplied because no equivalent field exists
 * upstream.
 *
 * PACKAGE IX: subscriberTenantId is sourced from compiledGraph's own
 * already-verified field (PrePublishingBoundary already enforced that
 * this tenant genuinely owns the canvas before compiling it) — not a
 * new trust decision, just carrying an already-authenticated value
 * forward onto the Goal it produces.
 *
 * PACKAGE XI — COMMERCIAL INTENT DURABLE STORAGE: commercialIntent is
 * now also carried onto the Goal at creation, the same treatment every
 * other field here already receives. It was already a caller-supplied
 * value at this exact call site (MAKMAN_FIRST_CUSTOMER_JOURNEY_PIPELINE.
 * ts's own request.commercialIntent) — nothing new is fetched or
 * invented; it previously flowed only into the distribution bridge and
 * was discarded afterward, never onto the Goal itself.
 */
export function createGoalFromCompiledAssembly(
  compiledGraph: CompiledAssemblyGraph,
  description: string,
  priority: GoalPriority,
  commercialIntent: MakmanCommercialIntent
): GoalContract {
  const now = Date.now();

  return {
    goalId: generateGoalId(),
    subscriberTenantId: compiledGraph.subscriberTenantId,
    title: compiledGraph.hydratedCanvas.title,
    description,
    priority,
    status: GoalStatus.CREATED,
    dependencies: [],
    metrics: [],
    createdAtMs: now,
    updatedAtMs: now,
    commercialIntent,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_GOAL_CREATION_CONNECTOR_DECLARATION = {
  fieldsSourcedFromCompiledGraph: ['title (via hydratedCanvas.title)', 'subscriberTenantId (Package IX)'],
  fieldsSuppliedByCaller: ['description', 'priority'],
  fieldsDefaultedHonestly: ['dependencies: [] (none established yet)', 'metrics: [] (none recorded yet)', 'status: CREATED (initial)'],
  businessLogicIntroduced: false,
  duplicateOfExistingComponent: false,
  status: 'LAUNCH FOUNDATION (MAG-LF-002), WORK PACKAGE B, GOAL CREATION CONNECTOR, complete.',
} as const;
