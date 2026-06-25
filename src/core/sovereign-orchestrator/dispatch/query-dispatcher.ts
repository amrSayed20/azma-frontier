/**
 * Query dispatch through chamber integration runtime.
 */

import { ChamberIntegrationRuntime } from '../../chamber-integration';
import { ChamberTarget, DispatchResult, WorkflowStep } from '../types/orchestration-contracts';
import { elapsed, now } from '../utils/time';

export class QueryDispatcher {
  constructor(private readonly runtime: ChamberIntegrationRuntime) {}

  public async dispatch(step: WorkflowStep, target: ChamberTarget): Promise<DispatchResult> {
    const startedAt = now();

    try {
      const payload = await this.runtime.communicate(
        'sovereign-orchestrator',
        target.chamberId,
        step.operation,
        step.payload
      );

      return {
        stepId: step.stepId,
        chamberId: target.chamberId,
        success: true,
        payload,
        durationMs: elapsed(startedAt)
      };
    } catch (error) {
      return {
        stepId: step.stepId,
        chamberId: target.chamberId,
        success: false,
        payload: {},
        errorMessage: error instanceof Error ? error.message : String(error),
        durationMs: elapsed(startedAt)
      };
    }
  }
}
