/**
 * AZMA OS – Al-Wateen Assistant
 * File: repair-engine.ts
 *
 * Repair action execution and management.
 */

import { RepairAction, RepairActionType } from '../types/al-wateen.types';
import { ILogger } from '../utils/logger';

export interface RepairExecutor {
  execute(action: RepairAction): Promise<boolean>;
  canExecute(action: RepairAction): boolean;
}

export interface RepairActionExecutor {
  executeAction(action: RepairAction): Promise<boolean>;
}

export class RepairEngine implements RepairActionExecutor {
  private executors: Map<RepairActionType, RepairExecutor> = new Map();

  constructor(private readonly logger: ILogger) {
    this.logger.info('RepairEngine', 'Initialized');
  }

  public registerExecutor(actionType: RepairActionType, executor: RepairExecutor): void {
    this.executors.set(actionType, executor);
  }

  public async executeAction(action: RepairAction): Promise<boolean> {
    const executor = this.executors.get(action.type);

    if (!executor) {
      this.logger.warn('RepairEngine', `No executor for repair action type: ${action.type}`);
      return false;
    }

    if (!executor.canExecute(action)) {
      this.logger.warn('RepairEngine', `Cannot execute repair action: ${action.actionId}`);
      return false;
    }

    try {
      this.logger.info('RepairEngine', `Executing repair action: ${action.actionId}`, {
        type: action.type,
        target: action.targetComponent
      });

      const success = await executor.execute(action);

      if (success) {
        this.logger.info('RepairEngine', `Repair action succeeded: ${action.actionId}`);
      } else {
        this.logger.warn('RepairEngine', `Repair action failed: ${action.actionId}`);
      }

      return success;
    } catch (error) {
      this.logger.error(
        'RepairEngine',
        `Error executing repair action: ${action.actionId}`,
        error instanceof Error ? error : undefined
      );
      return false;
    }
  }

  public getAvailableActionTypes(): RepairActionType[] {
    return Array.from(this.executors.keys());
  }
}
