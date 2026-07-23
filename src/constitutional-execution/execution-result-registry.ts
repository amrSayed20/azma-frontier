/**
 * AZMA OS — THE CONSTITUTIONAL EXECUTION
 * The Constitutional Execution Result Registry
 * Construction Campaign
 *
 * The append-only store of every ExecutionResult ever recorded. Like
 * execution-queue.ts, this file only holds and exposes what
 * execution-pipeline.ts has already recorded — it never decides
 * anything itself.
 */

import type { ExecutionResult } from './types';

let results: ExecutionResult[] = [];

export function appendExecutionResult(result: ExecutionResult): void {
  results.push(result);
}

export function getAllExecutionResults(): readonly ExecutionResult[] {
  return [...results];
}

export function getExecutionResult(executionId: string): ExecutionResult | null {
  return results.find((result) => result.executionId === executionId) ?? null;
}

/** Test/reset utility. */
export function resetExecutionResultRegistry(): void {
  results = [];
}
