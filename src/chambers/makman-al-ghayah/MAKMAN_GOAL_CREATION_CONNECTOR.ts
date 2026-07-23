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

let goalCounter = 0;
function generateGoalId(): string {
  goalCounter += 1;
  return `goal-${Date.now()}-${goalCounter}`;
}

/**
 * Converts a RAS AL AMR CompiledAssemblyGraph into a real Makman
 * GoalContract, ready for handoverGoal(). title comes directly from the
 * hydrated canvas (a real field); description/priority are caller-supplied
 * because no equivalent field exists upstream.
 */
export function createGoalFromCompiledAssembly(
  compiledGraph: CompiledAssemblyGraph,
  description: string,
  priority: GoalPriority
): GoalContract {
  const now = Date.now();

  return {
    goalId: generateGoalId(),
    title: compiledGraph.hydratedCanvas.title,
    description,
    priority,
    status: GoalStatus.CREATED,
    dependencies: [],
    metrics: [],
    createdAtMs: now,
    updatedAtMs: now,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_GOAL_CREATION_CONNECTOR_DECLARATION = {
  fieldsSourcedFromCompiledGraph: ['title (via hydratedCanvas.title)'],
  fieldsSuppliedByCaller: ['description', 'priority'],
  fieldsDefaultedHonestly: ['dependencies: [] (none established yet)', 'metrics: [] (none recorded yet)', 'status: CREATED (initial)'],
  businessLogicIntroduced: false,
  duplicateOfExistingComponent: false,
  status: 'LAUNCH FOUNDATION (MAG-LF-002), WORK PACKAGE B, GOAL CREATION CONNECTOR, complete.',
} as const;
