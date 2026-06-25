/**
 * AZMA OS – Al-Wateen Assistant
 * File: report-builder.ts
 *
 * Report generation and formatting.
 */

import {
  ExecutiveReport,
  HealthReport,
  UsageMetrics,
  CostMetrics,
  ResourceMetrics,
  SystemAlert,
  SystemEvent,
  RepairAction,
  AssistantStatus
} from '../types/al-wateen.types';

export interface ReportBuilder {
  buildExecutiveReport(
    assistantStatus: AssistantStatus,
    systemHealth: HealthReport,
    operationalMetrics: UsageMetrics,
    costMetrics: CostMetrics,
    resourceMetrics: ResourceMetrics,
    alerts: readonly SystemAlert[],
    events: readonly SystemEvent[],
    actions: readonly RepairAction[]
  ): ExecutiveReport;
}

export class AlWateenReportBuilder implements ReportBuilder {
  public buildExecutiveReport(
    assistantStatus: AssistantStatus,
    systemHealth: HealthReport,
    operationalMetrics: UsageMetrics,
    costMetrics: CostMetrics,
    resourceMetrics: ResourceMetrics,
    alerts: readonly SystemAlert[],
    events: readonly SystemEvent[],
    actions: readonly RepairAction[]
  ): ExecutiveReport {
    const now = Date.now();
    const period = {
      start: now - 3600000,
      end: now
    };

    const recommendations = this.generateRecommendations(
      systemHealth,
      operationalMetrics,
      costMetrics,
      resourceMetrics
    );

    return {
      reportId: this.generateReportId(),
      timestamp: now,
      period,
      assistantStatus,
      systemHealth,
      operationalMetrics,
      costMetrics,
      resourceMetrics,
      criticalAlerts: alerts.filter(a => a.severity === 'CRITICAL'),
      recentEvents: events.slice(-20),
      recoveryActions: actions.slice(-10),
      recommendations
    };
  }

  private generateRecommendations(
    health: HealthReport,
    metrics: UsageMetrics,
    costs: CostMetrics,
    resources: ResourceMetrics
  ): string[] {
    const recommendations: string[] = [];

    if (health.status === 'CRITICAL') {
      recommendations.push('Immediate system health remediation required');
    } else if (health.status === 'WARNING') {
      recommendations.push('Monitor system health and consider preventive measures');
    }

    if (metrics.successRate < 0.95) {
      recommendations.push('Error rate is elevated; investigate recent failures');
    }

    if (metrics.successRate < 0.85) {
      recommendations.push('Critical error rate detected; immediate investigation required');
    }

    if (resources.memoryUsage > resources.memoryLimit * 0.8) {
      recommendations.push('Memory utilization is high; consider scaling or optimization');
    }

    if (costs.estimatedMonthlyTotal > 10000) {
      recommendations.push('Monthly cost projection is high; review resource consumption');
    }

    if (metrics.averageResponseTime > 5000) {
      recommendations.push('Average response time is degraded; check for bottlenecks');
    }

    return recommendations;
  }

  private generateReportId(): string {
    return `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
