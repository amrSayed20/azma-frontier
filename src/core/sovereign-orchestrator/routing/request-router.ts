/**
 * Request routing to command or query dispatcher.
 */

import { CommandDispatcher } from '../dispatch/command-dispatcher';
import { QueryDispatcher } from '../dispatch/query-dispatcher';
import {
  ChamberTarget,
  DispatchResult,
  RequestKind,
  WorkflowStep
} from '../types/orchestration-contracts';

export class RequestRouter {
  constructor(
    private readonly commandDispatcher: CommandDispatcher,
    private readonly queryDispatcher: QueryDispatcher
  ) {}

  public async route(step: WorkflowStep, target: ChamberTarget): Promise<DispatchResult> {
    if (step.kind === RequestKind.COMMAND) {
      return this.commandDispatcher.dispatch(step, target);
    }

    return this.queryDispatcher.dispatch(step, target);
  }
}
