/**
 * Workflow planning from orchestration requests.
 */

import {
  OrchestrationRequest,
  WorkflowPlan,
  WorkflowStep
} from '../types/orchestration-contracts';
import { buildId } from '../utils/ids';
import { now } from '../utils/time';

export class WorkflowPlanner {
  public plan(request: OrchestrationRequest): WorkflowPlan {
    const step: WorkflowStep = {
      stepId: buildId('step'),
      operation: request.operation,
      capability: request.operation,
      kind: request.kind,
      payload: request.payload
    };

    return {
      planId: buildId('plan'),
      requestId: request.requestId,
      steps: [step],
      createdAt: now()
    };
  }
}
