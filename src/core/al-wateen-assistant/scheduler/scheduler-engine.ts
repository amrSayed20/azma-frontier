/**
 * AZMA OS – Al-Wateen Assistant
 * File: scheduler-engine.ts
 *
 * Task scheduling and execution.
 */

import { ILogger } from '../utils/logger';

export interface ScheduledTask {
  readonly taskId: string;
  readonly name: string;
  readonly execute: () => Promise<void>;
  readonly intervalMs: number;
  readonly enabled: boolean;
}

export interface SchedulerEngine {
  scheduleTask(task: ScheduledTask): void;
  unscheduleTask(taskId: string): void;
  enableTask(taskId: string): void;
  disableTask(taskId: string): void;
  start(): void;
  stop(): void;
}

export class AlWateenSchedulerEngine implements SchedulerEngine {
  private tasks: Map<string, ScheduledTask & { interval: NodeJS.Timeout | null }> = new Map();
  private isRunning: boolean = false;

  constructor(private readonly logger: ILogger) {
    this.logger.info('AlWateenSchedulerEngine', 'Initialized');
  }

  public scheduleTask(task: ScheduledTask): void {
    if (this.tasks.has(task.taskId)) {
      this.logger.warn('AlWateenSchedulerEngine', `Task already scheduled: ${task.taskId}`);
      return;
    }

    const entry = {
      ...task,
      interval: null as NodeJS.Timeout | null
    };

    this.tasks.set(task.taskId, entry);

    if (this.isRunning && task.enabled) {
      this.startTask(task.taskId);
    }

    this.logger.info('AlWateenSchedulerEngine', `Task scheduled: ${task.taskId}`, {
      name: task.name,
      intervalMs: task.intervalMs
    });
  }

  public unscheduleTask(taskId: string): void {
    const entry = this.tasks.get(taskId);

    if (entry) {
      if (entry.interval) {
        clearInterval(entry.interval);
      }

      this.tasks.delete(taskId);
      this.logger.info('AlWateenSchedulerEngine', `Task unscheduled: ${taskId}`);
    }
  }

  public enableTask(taskId: string): void {
    const entry = this.tasks.get(taskId);

    if (entry) {
      if (!entry.enabled) {
        if (this.isRunning) {
          this.startTask(taskId);
        }

        this.logger.info('AlWateenSchedulerEngine', `Task enabled: ${taskId}`);
      }
    }
  }

  public disableTask(taskId: string): void {
    const entry = this.tasks.get(taskId);

    if (entry) {
      if (entry.enabled) {
        if (entry.interval) {
          clearInterval(entry.interval);
          entry.interval = null;
        }

        this.logger.info('AlWateenSchedulerEngine', `Task disabled: ${taskId}`);
      }
    }
  }

  public start(): void {
    if (this.isRunning) {
      this.logger.warn('AlWateenSchedulerEngine', 'Scheduler already running');
      return;
    }

    this.isRunning = true;
    this.logger.info('AlWateenSchedulerEngine', 'Starting scheduler');

    this.tasks.forEach((entry, taskId) => {
      if (entry.enabled) {
        this.startTask(taskId);
      }
    });
  }

  public stop(): void {
    if (!this.isRunning) {
      this.logger.warn('AlWateenSchedulerEngine', 'Scheduler not running');
      return;
    }

    this.isRunning = false;
    this.logger.info('AlWateenSchedulerEngine', 'Stopping scheduler');

    this.tasks.forEach(entry => {
      if (entry.interval) {
        clearInterval(entry.interval);
        entry.interval = null;
      }
    });
  }

  private startTask(taskId: string): void {
    const entry = this.tasks.get(taskId);

    if (!entry || entry.interval) {
      return;
    }

    entry.interval = setInterval(async () => {
      try {
        await entry.execute();
      } catch (error) {
        this.logger.error(
          'AlWateenSchedulerEngine',
          `Error executing task: ${taskId}`,
          error instanceof Error ? error : undefined
        );
      }
    }, entry.intervalMs);
  }

  public getTaskStatus(taskId: string): { enabled: boolean; running: boolean } | undefined {
    const entry = this.tasks.get(taskId);

    if (entry) {
      return {
        enabled: entry.enabled,
        running: this.isRunning && entry.enabled && entry.interval !== null
      };
    }

    return undefined;
  }

  public shutdown(): void {
    this.stop();
    this.tasks.clear();
  }
}
