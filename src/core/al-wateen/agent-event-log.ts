/**
 * AZMA OS – Qiyamah Chamber
 * File: agent-event-log.ts
 *
 * Agent Event Log
 * Responsible for recording diagnostic events
 * occurring inside the Genesis agent society.
 */

export type AgentEventSeverity =
  | 'info'
  | 'warning'
  | 'error';

export interface AgentEvent {
  readonly agentName: string;
  readonly message: string;
  readonly severity: AgentEventSeverity;
  readonly timestamp: Date;
}

export class AgentEventLog {
  private readonly events: AgentEvent[] = [];

  /**
   * Records a new event.
   */
  public record(
    agentName: string,
    message: string,
    severity: AgentEventSeverity = 'info'
  ): void {
    this.events.push({
      agentName,
      message,
      severity,
      timestamp: new Date(),
    });
  }

  /**
   * Returns all recorded events.
   */
  public getEvents(): readonly AgentEvent[] {
    return [...this.events];
  }

  /**
   * Returns events belonging to a specific agent.
   */
  public getAgentEvents(
    agentName: string
  ): readonly AgentEvent[] {
    return this.events.filter(
      (event) => event.agentName === agentName
    );
  }

  /**
   * Clears all events.
   */
  public clear(): void {
    this.events.length = 0;
  }
}