/**
 * AZMA OS – Al-Wateen Assistant
 * File: dashboard-contracts.ts
 *
 * UI and dashboard contracts for system visualization.
 */

import {
  AssistantStatus,
  ChamberStatus,
  AgentStatus,
  ServiceStatus,
  ProviderStatus,
  HealthCheckStatus,
  SystemAlert,
  SystemEvent,
  ExecutiveReport
} from '../types/al-wateen.types';

export interface DashboardComponentStatus {
  readonly componentId: string;
  readonly componentType: string;
  readonly status: AssistantStatus | ChamberStatus | AgentStatus | ServiceStatus | ProviderStatus;
  readonly lastUpdate: number;
  readonly uptime?: number;
}

export interface DashboardHealthPanel {
  readonly overallStatus: HealthCheckStatus;
  readonly componentCount: number;
  readonly healthyCount: number;
  readonly warningCount: number;
  readonly criticalCount: number;
  readonly lastCheck: number;
}

export interface DashboardMetricsPanel {
  readonly timestamp: number;
  readonly cpuUsage: number;
  readonly memoryUsage: number;
  readonly networkActivity: number;
  readonly activeConnections: number;
  readonly operationsPerSecond: number;
}

export interface DashboardAlertsPanel {
  readonly activeAlerts: readonly SystemAlert[];
  readonly totalAlerts: number;
  readonly criticalCount: number;
  readonly errorCount: number;
  readonly warningCount: number;
}

export interface DashboardEventsPanel {
  readonly recentEvents: readonly SystemEvent[];
  readonly totalEvents: number;
  readonly lastEventTime: number;
}

export interface DashboardReportsPanel {
  readonly lastReport?: ExecutiveReport;
  readonly lastReportTime?: number;
  readonly reportFrequency: number;
}

export interface DashboardData {
  readonly timestamp: number;
  readonly assistantStatus: AssistantStatus;
  readonly components: readonly DashboardComponentStatus[];
  readonly health: DashboardHealthPanel;
  readonly metrics: DashboardMetricsPanel;
  readonly alerts: DashboardAlertsPanel;
  readonly events: DashboardEventsPanel;
  readonly reports: DashboardReportsPanel;
}

export interface DashboardProvider {
  getDashboardData(): DashboardData;
  getComponentHistory(componentId: string, hours: number): readonly DashboardComponentStatus[];
  getMetricsHistory(hours: number): readonly DashboardMetricsPanel[];
  exportDashboardData(format: 'json' | 'csv'): string;
}

export class DashboardContractsValidator {
  public static validateDashboardData(data: DashboardData): boolean {
    return (
      typeof data.timestamp === 'number' &&
      data.timestamp > 0 &&
      Array.isArray(data.components) &&
      typeof data.assistantStatus === 'string'
    );
  }

  public static validateComponentStatus(status: DashboardComponentStatus): boolean {
    return (
      typeof status.componentId === 'string' &&
      status.componentId.length > 0 &&
      typeof status.componentType === 'string' &&
      status.componentType.length > 0 &&
      typeof status.lastUpdate === 'number' &&
      status.lastUpdate > 0
    );
  }

  public static validateHealthPanel(panel: DashboardHealthPanel): boolean {
    return (
      typeof panel.overallStatus === 'string' &&
      typeof panel.componentCount === 'number' &&
      panel.componentCount >= 0 &&
      typeof panel.healthyCount === 'number' &&
      panel.healthyCount >= 0 &&
      panel.healthyCount <= panel.componentCount
    );
  }

  public static validateMetricsPanel(panel: DashboardMetricsPanel): boolean {
    return (
      typeof panel.timestamp === 'number' &&
      panel.timestamp > 0 &&
      typeof panel.cpuUsage === 'number' &&
      panel.cpuUsage >= 0 &&
      panel.cpuUsage <= 1 &&
      typeof panel.memoryUsage === 'number' &&
      panel.memoryUsage >= 0 &&
      panel.memoryUsage <= 1
    );
  }
}
