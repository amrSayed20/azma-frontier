/**
 * Failure escalation engine for orchestrator-level critical failures.
 */

import { AggregatedResponse, FailureEscalation } from '../types/orchestration-contracts';
import { buildId } from '../utils/ids';
import { now } from '../utils/time';

export class FailureEscalationEngine {
  public escalate(aggregated: AggregatedResponse, reason: string): FailureEscalation {
    return {
      escalationId: buildId('escalation'),
      requestId: aggregated.requestId,
      reason,
      failedSteps: aggregated.results.filter(result => !result.success).map(result => result.stepId),
      createdAt: now()
    };
  }
}
