/**
 * AZMA OS — THE CONSTITUTIONAL ROUTING LAYER
 * Construction Campaign
 *
 * A pull-based processor, NOT a Bus subscriber — the identical
 * discipline Constitutional Will, Constitutional Decision, and
 * Constitutional Execution themselves established. Reads Constitutional
 * Execution's own getExecutionQueue() on demand, evaluates each exactly
 * once, and appends any resulting Routing to this append-only queue.
 * Never processes the same execution twice.
 */

import { getExecutionQueue } from '../constitutional-execution';
import { evaluateExecutionForActuation } from './actuation-evaluator';
import type { ConstitutionalRouting, RoutingRejection } from './types';

let routings: ConstitutionalRouting[] = [];
let rejections: RoutingRejection[] = [];
const processedExecutionIds = new Set<string>();

/** Pulls Execution's current queue, routes any new executions, and records any rejections — read-only toward Execution itself. */
export function processExecutionsIntoRoutings(): readonly ConstitutionalRouting[] {
  const routed: ConstitutionalRouting[] = [];
  for (const execution of getExecutionQueue()) {
    if (processedExecutionIds.has(execution.executionId)) continue;
    processedExecutionIds.add(execution.executionId);

    const { routing, rejection } = evaluateExecutionForActuation(execution);
    if (routing) {
      routings.push(routing);
      routed.push(routing);
    } else if (rejection) {
      rejections.push(rejection);
    }
  }
  return routed;
}

export function getRoutingQueue(): readonly ConstitutionalRouting[] {
  return [...routings];
}

export function getRoutingsForOrgan(organId: string): readonly ConstitutionalRouting[] {
  return routings.filter((routing) => routing.target.organId === organId);
}

export function getRoutingRejections(): readonly RoutingRejection[] {
  return [...rejections];
}

/** Test/reset utility — clears this module's own state without touching Execution itself. */
export function resetRoutingLayer(): void {
  routings = [];
  rejections = [];
  processedExecutionIds.clear();
}
