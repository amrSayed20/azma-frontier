/**
 * Central runtime state management with immutable snapshots.
 */

import {
  HealthStatus,
  NotificationMessage,
  ProviderDescriptor,
  ResourceMetrics,
  RuntimeMetrics,
  RuntimeSnapshot,
  RuntimeStatus
} from '../types/al-wateen.types';
import { now } from '../utils/time';

export interface RuntimeState {
  readonly status: RuntimeStatus;
  readonly health: HealthStatus;
  readonly metrics: RuntimeMetrics;
  readonly resources: ResourceMetrics;
  readonly providers: readonly ProviderDescriptor[];
  readonly alerts: readonly NotificationMessage[];
}

export class RuntimeStateStore {
  private state: RuntimeState;

  constructor() {
    const timestamp = now();
    this.state = {
      status: RuntimeStatus.BOOTING,
      health: HealthStatus.UNKNOWN,
      metrics: {
        timestamp,
        tasksExecuted: 0,
        tasksFailed: 0,
        avgTaskDurationMs: 0,
        providersActive: 0,
        schedulerBacklog: 0
      },
      resources: {
        timestamp,
        processUptimeSec: 0,
        rssBytes: 0,
        heapUsedBytes: 0,
        heapTotalBytes: 0,
        cpuUserMicros: 0,
        cpuSystemMicros: 0
      },
      providers: [],
      alerts: []
    };
  }

  public getState(): Readonly<RuntimeState> {
    return {
      ...this.state,
      providers: [...this.state.providers],
      alerts: [...this.state.alerts]
    };
  }

  public updateStatus(status: RuntimeStatus): void {
    this.state = { ...this.state, status };
  }

  public updateHealth(health: HealthStatus): void {
    this.state = { ...this.state, health };
  }

  public updateMetrics(metrics: RuntimeMetrics): void {
    this.state = { ...this.state, metrics };
  }

  public updateResources(resources: ResourceMetrics): void {
    this.state = { ...this.state, resources };
  }

  public updateProviders(providers: readonly ProviderDescriptor[]): void {
    this.state = { ...this.state, providers: [...providers] };
  }

  public addAlert(alert: NotificationMessage): void {
    this.state = {
      ...this.state,
      alerts: [alert, ...this.state.alerts]
    };
  }

  public clearAlert(alertId: string): void {
    this.state = {
      ...this.state,
      alerts: this.state.alerts.filter(alert => alert.id !== alertId)
    };
  }

  public snapshot(): RuntimeSnapshot {
    return {
      timestamp: now(),
      status: this.state.status,
      health: this.state.health,
      metrics: this.state.metrics,
      resources: this.state.resources,
      activeProviders: [...this.state.providers],
      activeAlerts: [...this.state.alerts]
    };
  }
}
