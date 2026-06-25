/**
 * Runtime decision engine for retry and escalation decisions.
 */

import { AggregatedResponse, DecisionOutcome, RuntimeDecision } from '../types/orchestration-contracts';

export class RuntimeDecisionEngine {
  public decide(aggregated: AggregatedResponse): RuntimeDecision {
    const failed = aggregated.results.filter(result => !result.success);

    if (failed.length === 0) {
      return {
        requestId: aggregated.requestId,
        outcome: DecisionOutcome.PROCEED,
        reason: 'All dispatch operations succeeded.',
        retryableStepIds: []
      };
    }

    const retryable = failed.filter(result => result.errorMessage !== undefined);

    if (retryable.length > 0) {
      return {
        requestId: aggregated.requestId,
        outcome: DecisionOutcome.RETRY,
        reason: 'One or more dispatch operations failed and are retryable.',
        retryableStepIds: retryable.map(result => result.stepId)
      };
    }

    return {
      requestId: aggregated.requestId,
      outcome: DecisionOutcome.ESCALATE,
      reason: 'Dispatch failures are non-retryable and require escalation.',
      retryableStepIds: []
    };
  }
}
