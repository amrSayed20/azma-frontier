/**
 * AZMA OS – Al-Wateen Assistant
 * File: recovery-engine.ts
 *
 * Core recovery orchestration.
 */

import { RecoveryTask, RecoveryTaskStatus, RecoveryTaskSeverity, RepairAction } from '../types/al-wateen.types';
import { ILogger } from '../utils/logger';
import { ASSISTANT_CONFIG } from '../utils/constants';

export interface RecoveryStrategy {
  canHandle(componentType: string): boolean;
  createRecoveryPlan(componentId: string, componentType: string, error: string): RepairAction[];
}

export interface RecoveryEngine {
  initiateRecovery(componentId: string, componentType: string, severity: RecoveryTaskSeverity, reason: string): Promise<RecoveryTask>;
  getRecoveryStatus(taskId: string): RecoveryTask | undefined;
  getActiveRecoveries(): readonly RecoveryTask[];
}

export class AlWateenRecoveryEngine implements RecoveryEngine {
  private recoveryTasks: Map<string, RecoveryTask> = new Map();
  private strategies: RecoveryStrategy[] = [];
  private maxConcurrentRecoveries = ASSISTANT_CONFIG.MAX_CONCURRENT_REPAIRS;

  constructor(private readonly logger: ILogger) {
    this.logger.info('AlWateenRecoveryEngine', 'Initialized');
  }

  public registerStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
  }

  public async initiateRecovery(
    componentId: string,
    componentType: string,
    severity: RecoveryTaskSeverity,
    reason: string
  ): Promise<RecoveryTask> {
    const taskId = this.generateTaskId();
    const timestamp = Date.now();

    const activeCount = Array.from(this.recoveryTasks.values()).filter(
      t => t.status === RecoveryTaskStatus.IN_PROGRESS
    ).length;

    if (activeCount >= this.maxConcurrentRecoveries) {
      this.logger.warn('AlWateenRecoveryEngine', 'Max concurrent recoveries reached, queuing task');
    }

    const actions = this.createRecoveryPlan(componentId, componentType, reason);

    const task: RecoveryTask = {
      taskId,
      timestamp,
      status: RecoveryTaskStatus.PENDING,
      severity,
      description: `Recovery task for ${componentType} ${componentId}`,
      targetComponent: componentId,
      targetComponentType: componentType,
      actions,
      initiatedAt: timestamp,
      metadata: { reason }
    };

    this.recoveryTasks.set(taskId, task);

    this.logger.info('AlWateenRecoveryEngine', `Recovery task created: ${taskId}`, {
      component: componentId,
      severity,
      actionCount: actions.length
    });

    return task;
  }

  public getRecoveryStatus(taskId: string): RecoveryTask | undefined {
    return this.recoveryTasks.get(taskId);
  }

  public getActiveRecoveries(): readonly RecoveryTask[] {
    return Array.from(this.recoveryTasks.values()).filter(
      t => t.status === RecoveryTaskStatus.IN_PROGRESS || t.status === RecoveryTaskStatus.PENDING
    );
  }

  private createRecoveryPlan(componentId: string, componentType: string, reason: string): RepairAction[] {
    const actions: RepairAction[] = [];
    const timestamp = Date.now();

    const matchedStrategy = this.strategies.find(s => s.canHandle(componentType));

    if (matchedStrategy) {
      const strategicActions = matchedStrategy.createRecoveryPlan(componentId, componentType, reason);
      actions.push(...strategicActions);
    } else {
      const defaultAction: RepairAction = {
        actionId: this.generateActionId(),
        timestamp,
        type: 'RESTART' as any,
        targetComponent: componentId,
        targetComponentType: componentType,
        description: `Default restart for ${componentType}`,
        executed: false,
        metadata: { reason }
      };
      actions.push(defaultAction);
    }

    return actions;
  }

  public completeRecoveryTask(taskId: string, success: boolean, errorMessage?: string): void {
    const task = this.recoveryTasks.get(taskId);

    if (task) {
      const updated: RecoveryTask = {
        ...task,
        status: success ? RecoveryTaskStatus.COMPLETED : RecoveryTaskStatus.FAILED,
        completedAt: Date.now(),
        failureReason: errorMessage
      };

      this.recoveryTasks.set(taskId, updated);

      this.logger.info('AlWateenRecoveryEngine', `Recovery task ${success ? 'completed' : 'failed'}: ${taskId}`);
    }
  }

  private generateTaskId(): string {
    return `recovery-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateActionId(): string {
    return `action-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public shutdown(): void {
    this.recoveryTasks.clear();
  }
}
