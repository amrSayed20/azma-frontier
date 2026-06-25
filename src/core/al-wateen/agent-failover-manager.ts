/**
 * AZMA OS – Qiyamah Chamber
 * File: agent-failover-manager.ts
 *
 * Agent Failover Manager
 * Responsible for handling agent failures and
 * switching to backup agents when necessary.
 */

import {
  AgentHealthReport
} from './agent-health-monitor';

export interface FailoverEvent {
  readonly failedAgent: string;
  readonly replacementAgent: string;
  readonly occurredAt: Date;
}

export class AgentFailoverManager {
  /**
   * Creates a failover event.
   */
  public createFailover(
    failedAgent: string,
    replacementAgent: string
  ): FailoverEvent {
    return {
      failedAgent,
      replacementAgent,
      occurredAt: new Date(),
    };
  }

  /**
   * Determines whether failover is required.
   */
  public requiresFailover(
    report: AgentHealthReport
  ): boolean {
    return (
      report.status === 'offline'
    );
  }

  /**
   * Determines whether degraded agents can continue operating.
   */
  public canContinue(
    report: AgentHealthReport
  ): boolean {
    return (
      report.status === 'healthy' ||
      report.status === 'degraded'
    );
  }

  /**
   * Determines whether the replacement was successful.
   */
  public isRecovered(
    report: AgentHealthReport
  ): boolean {
    return report.status === 'healthy';
  }
}