/**
 * Execution context lifecycle management.
 */

import { ExecutionContext, OrchestrationRequest } from '../types/orchestration-contracts';
import { buildId } from '../utils/ids';
import { now } from '../utils/time';

export class ExecutionContextManager {
  public create(request: OrchestrationRequest): ExecutionContext {
    return {
      contextId: buildId('ctx'),
      requestId: request.requestId,
      sessionId: request.sessionId,
      startedAt: now(),
      metadata: request.context
    };
  }
}
