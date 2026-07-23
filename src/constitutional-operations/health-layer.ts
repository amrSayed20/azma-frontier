/**
 * AZMA OS — THE CONSTITUTIONAL OPERATIONAL HEALTH LAYER
 * Package I — The First Living Operational Cycle
 *
 * "Monitor operational health" — a purely descriptive snapshot of each
 * stage's own current queue length, reusing each stage's own
 * already-certified query function. No threshold, no judgment about
 * whether a length is "good" — that would be Constitutional Reasoning,
 * out of this Package's own scope.
 */

import { getReceptionQueue } from '../constitutional-reception';
import { getIntentionQueue } from '../constitutional-will';
import { getDecisionQueue } from '../constitutional-decision';
import { getExecutionQueue } from '../constitutional-execution';
import { getRoutingQueue } from '../constitutional-actuation';
import type { OperationalHealthSnapshot } from './types';

export function getOperationalHealthSnapshot(): OperationalHealthSnapshot {
  return {
    receptionQueueLength: getReceptionQueue().length,
    intentionQueueLength: getIntentionQueue().length,
    decisionQueueLength: getDecisionQueue().length,
    executionQueueLength: getExecutionQueue().length,
    routingQueueLength: getRoutingQueue().length,
  };
}
