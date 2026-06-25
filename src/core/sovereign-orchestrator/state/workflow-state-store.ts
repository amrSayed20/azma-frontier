/**
 * Workflow state store.
 */

import { WorkflowState, WorkflowStatus } from '../types/orchestration-contracts';
import { now } from '../utils/time';

export class WorkflowStateStore {
  private readonly states = new Map<string, WorkflowState>();

  public set(requestId: string, status: WorkflowStatus, message: string): WorkflowState {
    const state: WorkflowState = {
      requestId,
      status,
      updatedAt: now(),
      message
    };

    this.states.set(requestId, state);
    return state;
  }

  public get(requestId: string): WorkflowState | undefined {
    return this.states.get(requestId);
  }
}
