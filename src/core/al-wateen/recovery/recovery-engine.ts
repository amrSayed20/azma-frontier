/**
 * Automatic recovery execution engine.
 */

import { RecoveryAction, RecoveryResult } from '../types/al-wateen.types';
import { now } from '../utils/time';

export type RecoveryExecutor = (action: RecoveryAction) => Promise<boolean>;

export class RecoveryEngine {
  private readonly executors = new Map<string, RecoveryExecutor>();

  public registerExecutor(actionType: string, executor: RecoveryExecutor): void {
    this.executors.set(actionType, executor);
  }

  public async execute(action: RecoveryAction): Promise<RecoveryResult> {
    const executor = this.executors.get(action.type);
    if (!executor) {
      return {
        action,
        success: false,
        completedAt: now(),
        message: `No executor registered for action type ${action.type}`
      };
    }

    const success = await executor(action);
    return {
      action,
      success,
      completedAt: now(),
      message: success ? 'Recovery action executed' : 'Recovery action failed'
    };
  }
}
