/**
 * AZMA OS – Qiyamah Chamber
 * File: agent-health-monitor.ts
 *
 * Agent Health Monitor
 * Responsible for monitoring the health status of
 * the Genesis agent society.
 */

export type AgentHealthStatus =
  | 'healthy'
  | 'degraded'
  | 'offline';

export interface AgentHealthReport {
  readonly agentName: string;
  readonly status: AgentHealthStatus;
  readonly checkedAt: Date;
}

export class AgentHealthMonitor {
  /**
   * Creates a healthy report for an agent.
   */
  public reportHealthy(
    agentName: string
  ): AgentHealthReport {
    return {
      agentName,
      status: 'healthy',
      checkedAt: new Date(),
    };
  }

  /**
   * Creates a degraded report for an agent.
   */
  public reportDegraded(
    agentName: string
  ): AgentHealthReport {
    return {
      agentName,
      status: 'degraded',
      checkedAt: new Date(),
    };
  }

  /**
   * Creates an offline report for an agent.
   */
  public reportOffline(
    agentName: string
  ): AgentHealthReport {
    return {
      agentName,
      status: 'offline',
      checkedAt: new Date(),
    };
  }

  /**
   * Determines whether an agent is operational.
   */
  public isOperational(
    report: AgentHealthReport
  ): boolean {
    return report.status !== 'offline';
  }
}