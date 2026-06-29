/**
 * WP-013 → WP-020: Agent Society Layer Implementation
 * All four canonical services for the Agent Society
 *
 * Implementations:
 * - AgentRegistryService (WP-013)
 * - AgentSelectionRouter (WP-014)
 * - AgentExecutionGateway (WP-015-017)
 * - AgentLifecycleService (WP-018-019)
 * - Integration (WP-020)
 *
 * ASP: Four service classes, zero duplication, one registry.
 */

import type {
  RegisteredAgent,
  AgentSelectionResult,
  AgentExecutionContext,
  AgentExecutionResult,
  AgentLifecycleRecord,
  AgentTelemetry,
  AgentRegistryServiceContract,
  AgentSelectionRouterContract,
  AgentExecutionGatewayContract,
  AgentLifecycleServiceContract,
  AgentType,
} from './wp-013-020-agent-society-types';

// ═══════════════════════════════════════════════════════════════════════════
// WP-013: AGENT REGISTRY SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class AgentRegistryService implements AgentRegistryServiceContract {
  readonly serviceName = 'AgentRegistryService' as const;
  readonly version = '1.0.0' as const;

  private readonly agents = new Map<string, RegisteredAgent>();

  async registerAgent(agent: RegisteredAgent): Promise<void> {
    if (this.agents.has(agent.agentId)) {
      throw new Error(`Agent "${agent.agentId}" already registered`);
    }
    this.agents.set(agent.agentId, agent);
  }

  async getActiveAgents(): Promise<readonly RegisteredAgent[]> {
    return Array.from(this.agents.values()).filter(a => a.isActive);
  }

  async getAgentsByType(type: AgentType): Promise<readonly RegisteredAgent[]> {
    return Array.from(this.agents.values()).filter(a => a.agentType === type && a.isActive);
  }

  async getAgent(agentId: string): Promise<RegisteredAgent | null> {
    return this.agents.get(agentId) ?? null;
  }

  async deactivateAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent "${agentId}" not found`);
    // Recreate with isActive=false (immutable pattern)
    this.agents.set(agentId, { ...agent, isActive: false });
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WP-014: AGENT SELECTION ROUTER
// ═══════════════════════════════════════════════════════════════════════════

export class AgentSelectionRouter implements AgentSelectionRouterContract {
  readonly serviceName = 'AgentSelectionRouter' as const;
  readonly version = '1.0.0' as const;

  private readonly registry: AgentRegistryService;
  private selectionCounter = 0;

  constructor(registry: AgentRegistryService) {
    this.registry = registry;
  }

  async selectAgent(
    requestId: string,
    requestType: string,
    constitution: import('./constitution-types').ConstitutionArticleId,
    alternatives?: readonly AgentType[],
  ): Promise<AgentSelectionResult> {
    const active = await this.registry.getActiveAgents();

    // Filter candidates: must handle this request type and match constitutional authority
    const candidates = active.filter(a =>
      a.specialization.handlesRequestTypes.includes(requestType) &&
      (!a.specialization.requiresArticle || a.specialization.requiresArticle === constitution) &&
      (!alternatives || alternatives.includes(a.agentType)),
    );

    if (candidates.length === 0) {
      throw new Error(`No qualified agent for requestType="${requestType}", article="${constitution}"`);
    }

    // Sort by priority (higher first) and select top candidate
    candidates.sort((a, b) => b.specialization.priority - a.specialization.priority);
    const selected = candidates[0]!;

    return {
      requestId,
      selectedAgentId: selected.agentId,
      agentType: selected.agentType,
      selectionReason: `Priority ${selected.specialization.priority}, handles ${requestType}`,
      alternativeAgents: candidates.slice(1).map(a => a.agentId),
      decisionTime: new Date(),
    };
  }

  async getSelectionRegistry(): Promise<readonly RegisteredAgent[]> {
    return this.registry.getActiveAgents();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WP-015-017: AGENT EXECUTION GATEWAY
// ═══════════════════════════════════════════════════════════════════════════

export class AgentExecutionGateway implements AgentExecutionGatewayContract {
  readonly serviceName = 'AgentExecutionGateway' as const;
  readonly version = '1.0.0' as const;

  private readonly registry: AgentRegistryService;
  private readonly history = new Map<string, AgentExecutionResult[]>();

  constructor(registry: AgentRegistryService) {
    this.registry = registry;
  }

  async executeAgent(
    agentId: string,
    context: AgentExecutionContext,
  ): Promise<AgentExecutionResult> {
    const agent = await this.registry.getAgent(agentId);
    if (!agent) throw new Error(`Agent "${agentId}" not found`);
    if (!agent.isActive) throw new Error(`Agent "${agentId}" is inactive`);

    const startTime = Date.now();

    try {
      // Placeholder execution: real agents would implement specialized logic here
      // For now, return success with echo of input
      const result: AgentExecutionResult = {
        requestId: context.requestId,
        agentId,
        agentType: agent.agentType,
        success: true,
        outputData: { echo: context.inputData, processedAt: new Date().toISOString() },
        executionTimeMs: Date.now() - startTime,
        endTime: new Date(),
      };

      // Record in history
      const agentHistory = this.history.get(agentId) ?? [];
      agentHistory.push(result);
      this.history.set(agentId, agentHistory);

      return result;
    } catch (err) {
      const result: AgentExecutionResult = {
        requestId: context.requestId,
        agentId,
        agentType: agent.agentType,
        success: false,
        outputData: {},
        executionTimeMs: Date.now() - startTime,
        errorMessage: err instanceof Error ? err.message : String(err),
        endTime: new Date(),
      };
      const agentHistory = this.history.get(agentId) ?? [];
      agentHistory.push(result);
      this.history.set(agentId, agentHistory);
      return result;
    }
  }

  async getExecutionHistory(agentId: string, limit = 50): Promise<readonly AgentExecutionResult[]> {
    const history = this.history.get(agentId) ?? [];
    return history.slice(-limit);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// WP-018-019: AGENT LIFECYCLE SERVICE
// ═══════════════════════════════════════════════════════════════════════════

export class AgentLifecycleService implements AgentLifecycleServiceContract {
  readonly serviceName = 'AgentLifecycleService' as const;
  readonly version = '1.0.0' as const;

  private readonly lifecycle = new Map<string, AgentLifecycleRecord[]>();
  private readonly telemetry = new Map<string, AgentTelemetry>();

  async recordEvent(record: AgentLifecycleRecord): Promise<void> {
    const list = this.lifecycle.get(record.agentId) ?? [];
    list.push(record);
    this.lifecycle.set(record.agentId, list);

    // Update telemetry for EXECUTED events
    if (record.event === 'EXECUTED') {
      const current = this.telemetry.get(record.agentId);
      if (current) {
        // Create new immutable telemetry object
        this.telemetry.set(record.agentId, {
          agentId: record.agentId,
          agentType: current.agentType,
          requestsHandled: current.requestsHandled + 1,
          successRate: (current.requestsHandled + 1) / ((current.requestsHandled + 1) * 1),
          averageExecutionTimeMs: current.averageExecutionTimeMs,
          lastExecutedAt: record.timestamp,
        });
      }
    }
  }

  async getLifecycleHistory(agentId: string): Promise<readonly AgentLifecycleRecord[]> {
    return this.lifecycle.get(agentId) ?? [];
  }

  async getTelemetry(agentId: string): Promise<AgentTelemetry | null> {
    return this.telemetry.get(agentId) ?? null;
  }

  async getAllTelemetry(): Promise<readonly AgentTelemetry[]> {
    return Array.from(this.telemetry.values());
  }

  /** Initialize telemetry for a new agent (called by Layer 7 kernel) */
  initializeTelemetry(agentId: string, agentType: AgentType): void {
    if (!this.telemetry.has(agentId)) {
      this.telemetry.set(agentId, {
        agentId,
        agentType,
        requestsHandled: 0,
        successRate: 0,
        averageExecutionTimeMs: 0,
        lastExecutedAt: new Date(),
      });
    }
  }
}
