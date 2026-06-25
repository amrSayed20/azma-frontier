/**
 * Aggregates dispatch results into orchestration response body.
 */

import { AggregatedResponse, DispatchResult } from '../types/orchestration-contracts';

export class ResponseAggregator {
  public aggregate(requestId: string, results: readonly DispatchResult[]): AggregatedResponse {
    const startedAt = results.length > 0 ? Date.now() - Math.max(...results.map(r => r.durationMs)) : Date.now();
    const completedAt = Date.now();

    return {
      requestId,
      success: results.every(result => result.success),
      results: [...results],
      startedAt,
      completedAt
    };
  }
}
