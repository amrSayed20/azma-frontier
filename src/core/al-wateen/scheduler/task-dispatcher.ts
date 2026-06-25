/**
 * Sequential task dispatcher with tracked history.
 */

import { AL_WATEEN_CONFIG } from '../utils/constants';
import { now } from '../utils/time';

export interface DispatchTask {
  readonly taskId: string;
  readonly execute: () => Promise<void>;
}

export interface DispatchRecord {
  readonly taskId: string;
  readonly startedAt: number;
  readonly completedAt: number;
  readonly success: boolean;
  readonly errorMessage?: string;
}

export class TaskDispatcher {
  private readonly queue: DispatchTask[] = [];
  private readonly history: DispatchRecord[] = [];
  private running = false;

  public enqueue(task: DispatchTask): void {
    this.queue.push(task);
    if (!this.running) {
      void this.drain();
    }
  }

  public backlog(): number {
    return this.queue.length;
  }

  public records(): readonly DispatchRecord[] {
    return [...this.history];
  }

  private async drain(): Promise<void> {
    this.running = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) {
        break;
      }

      const startedAt = now();
      try {
        await task.execute();
        this.pushRecord({
          taskId: task.taskId,
          startedAt,
          completedAt: now(),
          success: true
        });
      } catch (error) {
        this.pushRecord({
          taskId: task.taskId,
          startedAt,
          completedAt: now(),
          success: false,
          errorMessage: error instanceof Error ? error.message : String(error)
        });
      }
    }

    this.running = false;
  }

  private pushRecord(record: DispatchRecord): void {
    this.history.unshift(record);
    if (this.history.length > AL_WATEEN_CONFIG.TASK_HISTORY_LIMIT) {
      this.history.length = AL_WATEEN_CONFIG.TASK_HISTORY_LIMIT;
    }
  }
}
