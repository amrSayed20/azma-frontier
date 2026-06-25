/**
 * AZMA OS – Qiyamah Chamber
 * File: agent-resource-monitor.ts
 *
 * Agent Resource Monitor
 * Responsible for monitoring agent resource usage,
 * execution costs, and capacity limits.
 */

export interface AgentResourceReport {
  readonly agentName: string;
  readonly cpuUsagePercent: number;
  readonly memoryUsagePercent: number;
  readonly estimatedCost: number;
  readonly checkedAt: Date;
}

export class AgentResourceMonitor {
  /**
   * Creates a resource report.
   */
  public createReport(
    agentName: string,
    cpuUsagePercent: number,
    memoryUsagePercent: number,
    estimatedCost: number
  ): AgentResourceReport {
    return {
      agentName,
      cpuUsagePercent: this.normalize(cpuUsagePercent),
      memoryUsagePercent: this.normalize(memoryUsagePercent),
      estimatedCost,
      checkedAt: new Date(),
    };
  }

  /**
   * Determines whether the agent is under heavy load.
   */
  public isUnderHeavyLoad(
    report: AgentResourceReport
  ): boolean {
    return (
      report.cpuUsagePercent >= 80 ||
      report.memoryUsagePercent >= 80
    );
  }

  /**
   * Determines whether the agent is within safe limits.
   */
  public isHealthy(
    report: AgentResourceReport
  ): boolean {
    return (
      report.cpuUsagePercent < 90 &&
      report.memoryUsagePercent < 90
    );
  }

  /**
   * Normalizes percentage values.
   */
  private normalize(
    value: number
  ): number {
    if (value < 0) {
      return 0;
    }

    if (value > 100) {
      return 100;
    }

    return value;
  }
}