/**
 * AZMA OS — THE CONSTITUTIONAL DISPATCH COORDINATOR
 * Package I — The First Living Operational Cycle
 *
 * Calls the 4 downstream pull functions (Will, Decision, Execution,
 * Actuation) in one fixed, hardcoded order. Decides WHAT ORDER to run
 * them in — never WHEN (that is the Runtime Coordinator's own
 * responsibility) and never anything about their content. Each pull
 * function already enforces its own constitutional boundary (Will reads
 * only Reception; Decision reads only Will, consulting Wisdom/Memory/
 * Awareness/Law as pure context; Execution reads only Decision;
 * Actuation reads only Execution) — this file adds no new authority, it
 * only sequences calls that were already safe to make individually.
 */

import { processReceptionQueueIntoIntentions } from '../constitutional-will';
import { processIntentionsIntoDecisions } from '../constitutional-decision';
import { processDecisionsIntoExecutions } from '../constitutional-execution';
import { processExecutionsIntoRoutings } from '../constitutional-actuation';
import type { OperationalCycleResult } from './types';

export function runDispatchCycle(): OperationalCycleResult {
  const intentions = processReceptionQueueIntoIntentions();
  const decisions = processIntentionsIntoDecisions();
  const executions = processDecisionsIntoExecutions();
  const routings = processExecutionsIntoRoutings();

  return {
    intentionsFormed: intentions.length,
    decisionsIssued: decisions.length,
    executionsRecorded: executions.length,
    routingsRecorded: routings.length,
  };
}
