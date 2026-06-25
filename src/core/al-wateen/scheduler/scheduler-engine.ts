/**
 * Core scheduler for interval and one-shot tasks.
 */

import { buildId } from '../utils/ids';

export interface ScheduledTask {
  readonly id: string;
  readonly name: string;
  readonly intervalMs: number;
  readonly run: () => Promise<void>;
}

export class SchedulerEngine {
  private readonly tasks = new Map<string, ScheduledTask>();
  private readonly timers = new Map<string, NodeJS.Timeout>();

  public schedule(name: string, intervalMs: number, run: () => Promise<void>): string {
    const id = buildId('task');
    const task: ScheduledTask = { id, name, intervalMs, run };
    this.tasks.set(id, task);

    const timer = setInterval(() => {
      void task.run();
    }, intervalMs);

    this.timers.set(id, timer);
    return id;
  }

  public cancel(taskId: string): void {
    const timer = this.timers.get(taskId);
    if (timer) {
      clearInterval(timer);
      this.timers.delete(taskId);
    }
    this.tasks.delete(taskId);
  }

  public pendingCount(): number {
    return this.tasks.size;
  }

  public stopAll(): void {
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
    this.tasks.clear();
  }
}
