/**
 * AZMA OS – Al-Wateen Assistant
 * File: health-reporter.ts
 *
 * Health reporting and analysis.
 */

import { HealthReport, HealthCheck, HealthCheckStatus, AlertSeverity } from '../types/al-wateen.types';
import { HEALTH_THRESHOLD } from '../utils/constants';

export interface HealthReporter {
  generateReport(componentId: string, componentType: string, checks: readonly HealthCheck[]): HealthReport;
  assessStatus(passedCount: number, totalCount: number): HealthCheckStatus;
}

export class AlWateenHealthReporter implements HealthReporter {
  public generateReport(
    componentId: string,
    componentType: string,
    checks: readonly HealthCheck[]
  ): HealthReport {
    const passedCount = checks.filter(c => c.passed).length;
    const totalCount = checks.length;
    const status = this.assessStatus(passedCount, totalCount);
    const severity = this.mapStatusToSeverity(status);

    return {
      componentId,
      componentType,
      status,
      timestamp: Date.now(),
      checks: checks,
      lastUpdate: Date.now(),
      severity,
      message: this.generateMessage(status, passedCount, totalCount)
    };
  }

  public assessStatus(passedCount: number, totalCount: number): HealthCheckStatus {
    if (totalCount === 0) {
      return HealthCheckStatus.UNKNOWN;
    }

    const healthRatio = passedCount / totalCount;

    if (healthRatio >= HEALTH_THRESHOLD.HEALTHY) {
      return HealthCheckStatus.HEALTHY;
    } else if (healthRatio >= HEALTH_THRESHOLD.WARNING) {
      return HealthCheckStatus.WARNING;
    } else {
      return HealthCheckStatus.CRITICAL;
    }
  }

  private mapStatusToSeverity(status: HealthCheckStatus): AlertSeverity {
    switch (status) {
      case HealthCheckStatus.HEALTHY:
        return AlertSeverity.INFO;
      case HealthCheckStatus.WARNING:
        return AlertSeverity.WARNING;
      case HealthCheckStatus.CRITICAL:
        return AlertSeverity.CRITICAL;
      case HealthCheckStatus.UNKNOWN:
        return AlertSeverity.INFO;
      default:
        return AlertSeverity.INFO;
    }
  }

  private generateMessage(
    status: HealthCheckStatus,
    passedCount: number,
    totalCount: number
  ): string {
    const percentage = totalCount > 0 ? ((passedCount / totalCount) * 100).toFixed(0) : 'unknown';
    return `Health status: ${status} (${passedCount}/${totalCount} checks passed, ${percentage}%)`;
  }

  public summarize(reports: readonly HealthReport[]): HealthReport {
    const totalChecks = reports.reduce((sum, r) => sum + r.checks.length, 0);
    const totalPassed = reports.reduce(
      (sum, r) => sum + r.checks.filter(c => c.passed).length,
      0
    );
    const status = this.assessStatus(totalPassed, totalChecks);
    const severity = this.mapStatusToSeverity(status);

    return {
      componentId: 'system',
      componentType: 'SYSTEM',
      status,
      timestamp: Date.now(),
      checks: [],
      lastUpdate: Date.now(),
      severity,
      message: `System health: ${status} (${totalPassed}/${totalChecks} checks across ${reports.length} components)`
    };
  }
}
