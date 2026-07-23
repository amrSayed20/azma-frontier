/**
 * AZMA OS — THE CONSTITUTIONAL FAILURE DETECTION LAYER
 * Package I — The First Living Operational Cycle
 *
 * "Monitor operational failures" — aggregates each stage's own
 * already-recorded rejection log (Will/Decision/Execution/Actuation each
 * refuse candidates that fail their own gate, recording a disclosed
 * reason). Reception has no rejection concept of its own — it queues
 * everything Expression produces unconditionally — so it contributes
 * none here. This file never re-evaluates WHY something was rejected,
 * only counts what each stage already decided.
 */

import { getIntentionRejections } from '../constitutional-will';
import { getDecisionRejections } from '../constitutional-decision';
import { getExecutionRejections } from '../constitutional-execution';
import { getRoutingRejections } from '../constitutional-actuation';
import type { OperationalFailureSnapshot } from './types';

export function getOperationalFailureSnapshot(): OperationalFailureSnapshot {
  const willRejectionCount = getIntentionRejections().length;
  const decisionRejectionCount = getDecisionRejections().length;
  const executionRejectionCount = getExecutionRejections().length;
  const actuationRejectionCount = getRoutingRejections().length;
  return {
    willRejectionCount,
    decisionRejectionCount,
    executionRejectionCount,
    actuationRejectionCount,
    totalRejectionCount: willRejectionCount + decisionRejectionCount + executionRejectionCount + actuationRejectionCount,
  };
}
