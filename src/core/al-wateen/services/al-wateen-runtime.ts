/**
 * Runtime facade for sovereign core operations.
 */

import { HealthStatus, NotificationSeverity, RuntimeStatus } from '../types/al-wateen.types';
import { buildId } from '../utils/ids';
import { now } from '../utils/time';
import { AlWateenServices } from './runtime-services';

export class AlWateenRuntime {
  constructor(private readonly services: AlWateenServices) {}

  public start(): void {
    this.services.stateStore.updateStatus(RuntimeStatus.RUNNING);
    this.services.heartbeat.start(() => this.services.stateStore.getState().status);
    this.services.watchdog.start();
    this.services.health.start();
    this.services.telemetryEngine.start();

    this.services.scheduler.schedule('monitoring-refresh', 5000, async () => {
      this.services.monitoring.refreshState();
    });

    this.services.scheduler.schedule('health-to-state', 6000, async () => {
      this.services.stateStore.updateHealth(this.services.health.currentHealth());
      const currentHealth = this.services.health.currentHealth();
      if (currentHealth === HealthStatus.CRITICAL) {
        this.services.stateStore.updateStatus(RuntimeStatus.RECOVERING);
      }
    });
  }

  public stop(): void {
    this.services.heartbeat.stop();
    this.services.watchdog.stop();
    this.services.health.stop();
    this.services.telemetryEngine.stop();
    this.services.scheduler.stopAll();
    this.services.stateStore.updateStatus(RuntimeStatus.STOPPED);
  }

  public async dispatchTask(taskName: string, action: () => Promise<void>): Promise<void> {
    const taskId = buildId('dispatch');
    const start = now();

    this.services.dispatcher.enqueue({
      taskId,
      execute: async () => {
        try {
          await action();
          this.services.telemetryCollector.record('task', taskName, true, now() - start, { taskId });
        } catch (error) {
          this.services.telemetryCollector.record('task', taskName, false, now() - start, {
            taskId,
            error: error instanceof Error ? error.message : String(error)
          });

          this.services.notifications.dispatch(
            NotificationSeverity.ERROR,
            'Task failure',
            `Task ${taskName} failed`,
            'dispatcher',
            { taskId }
          );

          throw error;
        }
      }
    });
  }
}
