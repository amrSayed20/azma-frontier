/**
 * AZMA OS – Al-Wateen Assistant
 * File: al-wateen-state.ts
 *
 * Centralized state management for Al-Wateen Assistant.
 */

import {
  AssistantStatus,
  ChamberStatus,
  AgentStatus,
  ServiceStatus,
  ProviderStatus,
  SystemAlert,
  SystemEvent,
  RecoveryTask,
  MonitoringSnapshot
} from '../types/al-wateen.types';

export interface AlWateenState {
  readonly assistantStatus: AssistantStatus;
  readonly startedAt: number;
  readonly uptime: number;
  readonly chamberStatuses: Readonly<Record<string, ChamberStatus>>;
  readonly agentStatuses: Readonly<Record<string, AgentStatus>>;
  readonly serviceStatuses: Readonly<Record<string, ServiceStatus>>;
  readonly providerStatuses: Readonly<Record<string, ProviderStatus>>;
  readonly activeAlerts: readonly SystemAlert[];
  readonly recentEvents: readonly SystemEvent[];
  readonly ongoingRecoveries: readonly RecoveryTask[];
  readonly lastMonitoringSnapshot?: MonitoringSnapshot;
  readonly lastHealthCheckTime: number;
}

export interface StateUpdateOptions {
  readonly timestamp?: number;
  readonly preserveHistory?: boolean;
}

export class AlWateenStateManager {
  private state: AlWateenState;

  constructor() {
    const now = Date.now();
    this.state = {
      assistantStatus: AssistantStatus.INITIALIZING,
      startedAt: now,
      uptime: 0,
      chamberStatuses: {},
      agentStatuses: {},
      serviceStatuses: {},
      providerStatuses: {},
      activeAlerts: [],
      recentEvents: [],
      ongoingRecoveries: [],
      lastHealthCheckTime: now
    };
  }

  public getState(): Readonly<AlWateenState> {
    return Object.freeze({ ...this.state });
  }

  public getAssistantStatus(): AssistantStatus {
    return this.state.assistantStatus;
  }

  public setAssistantStatus(status: AssistantStatus): void {
    this.state = { ...this.state, assistantStatus: status };
  }

  public updateChamberStatus(chamberId: string, status: ChamberStatus): void {
    this.state = {
      ...this.state,
      chamberStatuses: {
        ...this.state.chamberStatuses,
        [chamberId]: status
      }
    };
  }

  public updateAgentStatus(agentId: string, status: AgentStatus): void {
    this.state = {
      ...this.state,
      agentStatuses: {
        ...this.state.agentStatuses,
        [agentId]: status
      }
    };
  }

  public updateServiceStatus(serviceId: string, status: ServiceStatus): void {
    this.state = {
      ...this.state,
      serviceStatuses: {
        ...this.state.serviceStatuses,
        [serviceId]: status
      }
    };
  }

  public updateProviderStatus(providerId: string, status: ProviderStatus): void {
    this.state = {
      ...this.state,
      providerStatuses: {
        ...this.state.providerStatuses,
        [providerId]: status
      }
    };
  }

  public addAlert(alert: SystemAlert): void {
    this.state = {
      ...this.state,
      activeAlerts: [...this.state.activeAlerts, alert]
    };
  }

  public removeAlert(alertId: string): void {
    this.state = {
      ...this.state,
      activeAlerts: this.state.activeAlerts.filter(a => a.id !== alertId)
    };
  }

  public addEvent(event: SystemEvent): void {
    this.state = {
      ...this.state,
      recentEvents: [...this.state.recentEvents, event]
    };
  }

  public addRecoveryTask(task: RecoveryTask): void {
    this.state = {
      ...this.state,
      ongoingRecoveries: [...this.state.ongoingRecoveries, task]
    };
  }

  public removeRecoveryTask(taskId: string): void {
    this.state = {
      ...this.state,
      ongoingRecoveries: this.state.ongoingRecoveries.filter(t => t.taskId !== taskId)
    };
  }

  public updateLastMonitoringSnapshot(snapshot: MonitoringSnapshot): void {
    this.state = {
      ...this.state,
      lastMonitoringSnapshot: snapshot
    };
  }

  public updateLastHealthCheckTime(timestamp: number): void {
    this.state = {
      ...this.state,
      lastHealthCheckTime: timestamp
    };
  }

  public calculateUptime(): number {
    return Date.now() - this.state.startedAt;
  }

  public reset(): void {
    const now = Date.now();
    this.state = {
      assistantStatus: AssistantStatus.INITIALIZING,
      startedAt: now,
      uptime: 0,
      chamberStatuses: {},
      agentStatuses: {},
      serviceStatuses: {},
      providerStatuses: {},
      activeAlerts: [],
      recentEvents: [],
      ongoingRecoveries: [],
      lastHealthCheckTime: now
    };
  }
}
