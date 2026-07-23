/**
 * AZMA OS — THE CONSTITUTIONAL EXECUTION
 * The Constitutional Execution Queue
 * Construction Campaign
 *
 * The append-only store of every ConstitutionalExecution ever produced.
 * Populated only by execution-pipeline.ts — this file itself never
 * decides whether to add an entry, it only holds and exposes what has
 * already been decided.
 */

import type { ConstitutionalExecution } from './types';

let executions: ConstitutionalExecution[] = [];

export function appendExecution(execution: ConstitutionalExecution): void {
  executions.push(execution);
}

export function getExecutionQueue(): readonly ConstitutionalExecution[] {
  return [...executions];
}

export function getExecutionsForOrgan(organId: string): readonly ConstitutionalExecution[] {
  return executions.filter((execution) => execution.organId === organId);
}

export function hasProcessedDecision(decisionId: string): boolean {
  return executions.some((execution) => execution.sourceDecisionId === decisionId);
}

/** Test/reset utility — clears this module's own state without touching Decision itself. */
export function resetExecutionQueue(): void {
  executions = [];
}
