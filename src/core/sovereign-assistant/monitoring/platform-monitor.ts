/**
 * AZMA OS - Sovereign Assistant
 * Platform Monitoring System
 */

import {
  SystemComponent,
  ComponentHealth,
  SystemHealthSnapshot,
  HealthStatus,
  PlatformMetrics,
  ResourceMetrics,
  FinancialMetrics,
} from '../types/sovereign-types';

/**
 * Collects and maintains platform health metrics.
 * Continuously monitors all system components.
 */
export class PlatformMonitor {
  private readonly healthHistory: SystemHealthSnapshot[] = [];
  private readonly componentThresholds: Map<SystemComponent, number>;

  constructor(thresholds?: Partial<Record<SystemComponent, number>>) {
    this.componentThresholds = new Map([
      ['cpu', 85],
      ['ram', 85],
      ['gpu', 90],
      ['storage', 90],
      ['api-limits', 95],
      ['error-rate', 5],
      ...Object.entries(thresholds || {}),
    ] as [SystemComponent, number][]);
  }

  /**
   * Creates a comprehensive health snapshot of all system components.
   */
  public async captureHealthSnapshot(
    componentMetrics: Map<SystemComponent, number>
  ): Promise<SystemHealthSnapshot> {
    const componentHealth: ComponentHealth[] = [];

    for (const [component, metric] of componentMetrics.entries()) {
      const threshold = this.componentThresholds.get(component) || 80;
      let status: HealthStatus = 'healthy';

      if (metric >= threshold * 1.2) {
        status = 'critical';
      } else if (metric >= threshold) {
        status = 'degraded';
      }

      componentHealth.push({
        component,
        status,
        lastCheckedAt: new Date(),
        metricValue: metric,
        metricUnit: this.getMetricUnit(component),
        threshold,
        message: this.generateHealthMessage(component, metric, threshold),
      });
    }

    const overallStatus = this.calculateOverallStatus(componentHealth);

    const snapshot: SystemHealthSnapshot = {
      snapshotId: `snapshot_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`,
      timestamp: new Date(),
      overallStatus,
      componentHealth: componentHealth as readonly ComponentHealth[],
    };

    this.healthHistory.push(snapshot);
    return snapshot;
  }

  /**
   * Returns the most recent health snapshot.
   */
  public getLatestSnapshot(): SystemHealthSnapshot | undefined {
    return this.healthHistory[this.healthHistory.length - 1];
  }

  /**
   * Returns health history (last N snapshots).
   */
  public getHealthHistory(limit: number = 24): readonly SystemHealthSnapshot[] {
    return this.healthHistory.slice(-limit);
  }

  /**
   * Analyzes trend in specific component health.
   */
  public analyzeComponentTrend(component: SystemComponent, limit: number = 10): {
    readonly trend: 'improving' | 'stable' | 'degrading';
    readonly avgValue: number;
    readonly minValue: number;
    readonly maxValue: number;
  } {
    const recent = this.healthHistory
      .slice(-limit)
      .flatMap(s => s.componentHealth)
      .filter(c => c.component === component)
      .map(c => c.metricValue);

    if (recent.length === 0) {
      return { trend: 'stable', avgValue: 0, minValue: 0, maxValue: 0 };
    }

    const sorted = [...recent].sort((a, b) => a - b);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    let trend: 'improving' | 'stable' | 'degrading' = 'stable';
    if (secondAvg < firstAvg * 0.95) {
      trend = 'improving';
    } else if (secondAvg > firstAvg * 1.05) {
      trend = 'degrading';
    }

    return {
      trend,
      avgValue: avg,
      minValue: sorted[0],
      maxValue: sorted[sorted.length - 1],
    };
  }

  /**
   * Calculates overall platform health status.
   */
  private calculateOverallStatus(
    components: readonly ComponentHealth[]
  ): HealthStatus {
    const critical = components.filter(c => c.status === 'critical').length;
    const degraded = components.filter(c => c.status === 'degraded').length;

    if (critical > 0) return 'critical';
    if (degraded > components.length * 0.3) return 'degraded';
    if (degraded > 0) return 'degraded';

    return 'healthy';
  }

  /**
   * Gets appropriate unit for component metric.
   */
  private getMetricUnit(component: SystemComponent): string {
    switch (component) {
      case 'cpu':
      case 'ram':
      case 'gpu':
      case 'storage':
        return '%';
      case 'memory':
        return 'MB';
      case 'sessions':
      case 'workers':
        return 'count';
      default:
        return 'value';
    }
  }

  /**
   * Generates human-readable health message.
   */
  private generateHealthMessage(
    component: SystemComponent,
    metric: number,
    threshold: number
  ): string {
    if (metric >= threshold * 1.2) {
      return `${component} is at critical level (${metric.toFixed(1)}% of ${threshold}%)`;
    } else if (metric >= threshold) {
      return `${component} is degraded (${metric.toFixed(1)}% of ${threshold}%)`;
    }
    return `${component} is operating normally`;
  }
}

/**
 * Intelligence engine for platform metrics analysis.
 */
export class MetricsIntelligence {
  public analyzePlatformMetrics(metrics: PlatformMetrics): {
    readonly healthScore: number;
    readonly recommendation: string;
  } {
    const score = metrics.successRate * 0.5 + (100 - metrics.errorRate) * 0.3 + (100 - (metrics.avgProcessingTimeMs / 10)) * 0.2;
    const normalizedScore = Math.max(0, Math.min(100, score));

    let recommendation = 'Platform performing optimally';
    if (normalizedScore < 70) {
      recommendation = 'Investigate error patterns and optimize processing';
    } else if (normalizedScore < 85) {
      recommendation = 'Monitor performance trends closely';
    }

    return {
      healthScore: normalizedScore,
      recommendation,
    };
  }

  public analyzeResourceMetrics(metrics: ResourceMetrics): {
    readonly bottleneck?: string;
    readonly urgency: 'low' | 'medium' | 'high';
  } {
    const critical = [
      metrics.cpuUsagePercent,
      metrics.memoryUsagePercent,
      metrics.storageUsagePercent,
    ].filter(m => m > 85);

    if (critical.length > 1) {
      return { bottleneck: 'Multiple resources constrained', urgency: 'high' };
    }

    if (metrics.storageUsagePercent > 85) {
      return { bottleneck: 'Storage capacity critical', urgency: 'high' };
    }

    if (metrics.cpuUsagePercent > 85) {
      return { bottleneck: 'CPU constrained', urgency: 'medium' };
    }

    return { urgency: 'low' };
  }

  public analyzeFinancialMetrics(metrics: FinancialMetrics): {
    readonly status: 'healthy' | 'concerning' | 'critical';
    readonly recommendation: string;
  } {
    const marginPercentage = metrics.marginPercentage;

    if (marginPercentage < 0) {
      return {
        status: 'critical',
        recommendation: 'Costs exceed revenue. Immediate action required.',
      };
    }

    if (marginPercentage < 15) {
      return {
        status: 'concerning',
        recommendation: 'Optimize costs or increase revenue to improve margins.',
      };
    }

    return {
      status: 'healthy',
      recommendation: 'Financial metrics within healthy range.',
    };
  }
}
