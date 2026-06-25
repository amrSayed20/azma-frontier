/**
 * Execution coordination across routing, dispatch, state, and timeline.
 */

import { RequestRouter } from '../routing/request-router';
import { WorkflowStateStore } from '../state/workflow-state-store';
import { ExecutionTimeline } from '../timeline/execution-timeline';
import { WorkflowStatus, WorkflowPlan, ChamberTarget, DispatchResult } from '../types/orchestration-contracts';

export class ExecutionCoordinator {
  constructor(
    private readonly router: RequestRouter,
    private readonly stateStore: WorkflowStateStore,
    private readonly timeline: ExecutionTimeline
  ) {}

  public async execute(
    requestId: string,
    plan: WorkflowPlan,
    targets: readonly ChamberTarget[]
  ): Promise<readonly DispatchResult[]> {
    this.stateStore.set(requestId, WorkflowStatus.RUNNING, 'Execution started');
    this.timeline.record(requestId, 'EXECUTION_STARTED', { steps: plan.steps.length });

    const results: DispatchResult[] = [];

    for (const step of plan.steps) {
      const target = targets.find(item => item.stepId === step.stepId);
      if (!target) {
        results.push({
          stepId: step.stepId,
          chamberId: 'unresolved',
          success: false,
          payload: {},
          errorMessage: 'No chamber target resolved for step',
          durationMs: 0
        });
        continue;
      }

      const result = await this.router.route(step, target);
      results.push(result);
      this.timeline.record(requestId, 'STEP_DISPATCHED', {
        stepId: step.stepId,
        chamberId: target.chamberId,
        success: result.success
      });
    }

    const success = results.every(result => result.success);
    this.stateStore.set(
      requestId,
      success ? WorkflowStatus.COMPLETED : WorkflowStatus.FAILED,
      success ? 'Execution completed' : 'Execution failed'
    );

    this.timeline.record(requestId, 'EXECUTION_COMPLETED', { success });
    return results;
  }
}
