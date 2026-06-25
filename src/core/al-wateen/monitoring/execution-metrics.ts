/**
 * Runtime execution metric aggregator.
 */

import { RuntimeMetrics } from '../types/al-wateen.types';
import { now } from '../utils/time';

export class ExecutionMetricsTracker {
  private tasksExecuted = 0;
  private tasksFailed = 0;
  private totalDurationMs = 0;
  private providersActive = 0;
  private schedulerBacklog = 0;

  public recordTask(durationMs: number, success: boolean): void {
    this.tasksExecuted += 1;
    if (!success) {
      this.tasksFailed += 1;
    }
    this.totalDurationMs += Math.max(0, durationMs);
  }

  public setProvidersActive(value: number): void {
    this.providersActive = Math.max(0, value);
  }

  public setSchedulerBacklog(value: number): void {
    this.schedulerBacklog = Math.max(0, value);
  }

  public snapshot(): RuntimeMetrics {
    return {
      timestamp: now(),
      tasksExecuted: this.tasksExecuted,
      tasksFailed: this.tasksFailed,
      avgTaskDurationMs: this.tasksExecuted > 0 ? this.totalDurationMs / this.tasksExecuted : 0,
      providersActive: this.providersActive,
      schedulerBacklog: this.schedulerBacklog
    };
  }
}
