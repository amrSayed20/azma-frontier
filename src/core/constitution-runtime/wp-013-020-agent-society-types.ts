/**
 * WP-013 → WP-020: Runtime Agent Society Layer (Layer 7)
 * Type definitions and contracts for canonical agent routing, selection, and execution
 *
 * LAYER CLASSIFICATION: Layer 7 (Agent Society)
 * KERNEL DEPENDENCIES: Layers 1-6 (full OS stack)
 *
 * IMPLEMENTATION SCOPE (One coherent layer, 8 WPs expand it progressively):
 *
 * WP-013: Agent Registry + Routing Contracts
 * WP-014: Specialized Agent Selection
 * WP-015: Agent Execution Gateway
 * WP-016: Agent State Context
 * WP-017: Agent Result Aggregation
 * WP-018: Agent Lifecycle Management
 * WP-019: Agent Observability
 * WP-020: Lifecycle Integration
 *
 * ASP PRINCIPLE: One service registry, one selection router, one execution gateway.
 * All 100+ agent types register via one canonical interface.
 * All agents execute through one canonical pipeline.
 * No per-agent infrastructure duplication.
 */

import type { ConstitutionArticleId } from './constitution-types';

// ═══════════════════════════════════════════════════════════════════════════
// WP-013: AGENT REGISTRY & ROUTING CONTRACTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Canonical agent types that may be routed to specialized agents
 * Extensible: new agent types register via AgentRegistryService.registerAgentType()
 */
export enum AgentType {
  GENERIC = 'generic',                    // Default: no specialization
  GOVERNANCE = 'governance',              // Policy analysis, constitutional review
  SECURITY = 'security',                  // Threat detection, violation response
  PERFORMANCE = 'performance',            // Load analysis, optimization
  OBSERVABILITY = 'observability',        // Telemetry aggregation, alerting
  ORCHESTRATION = 'orchestration',        // System coordination, scheduling
  LEARNING = 'learning',                  // Pattern extraction, prediction
  // Future: RESEARCH, SIMULATION, AUDIT, RECOVERY, etc.
}

/**
 * Agent specialization capability (per WP-014)
 * Each specialized agent declares what request types it handles
 */
export interface AgentSpecialization {
  readonly agentType: AgentType;
  readonly priority: number;              // Higher = selected first
  readonly handlesRequestTypes: readonly string[];
  readonly requiresArticle?: ConstitutionArticleId;
  readonly timeoutMs: number;
}

/**
 * Registered specialized agent (per WP-013)
 * Immutable agent definition in the registry
 */
export interface RegisteredAgent {
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly specialization: AgentSpecialization;
  readonly constitutional: ConstitutionArticleId;
  readonly version: string;
  readonly isActive: boolean;
}

/**
 * Agent selection result (per WP-014)
 * Contains the chosen agent and routing decision rationale
 */
export interface AgentSelectionResult {
  readonly requestId: string;
  readonly selectedAgentId: string;
  readonly agentType: AgentType;
  readonly selectionReason: string;
  readonly alternativeAgents: readonly string[];
  readonly decisionTime: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// WP-015: AGENT EXECUTION GATEWAY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Agent execution context (per WP-016)
 * State passed through the agent pipeline
 */
export interface AgentExecutionContext {
  readonly requestId: string;
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly constitution: ConstitutionArticleId;
  readonly inputData: Readonly<Record<string, unknown>>;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly startTime: Date;
}

/**
 * Agent execution result (per WP-017)
 * Output produced by specialized agent
 */
export interface AgentExecutionResult {
  readonly requestId: string;
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly success: boolean;
  readonly outputData: Readonly<Record<string, unknown>>;
  readonly executionTimeMs: number;
  readonly errorMessage?: string;
  readonly endTime: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// WP-018: AGENT LIFECYCLE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

export type AgentLifecycleEvent = 'REGISTERED' | 'ACTIVATED' | 'SELECTED' | 'EXECUTED' | 'COMPLETED' | 'FAILED' | 'DEACTIVATED';

/**
 * Agent lifecycle record (per WP-018)
 * Tracks agent state transitions through execution
 */
export interface AgentLifecycleRecord {
  readonly event: AgentLifecycleEvent;
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly requestId?: string;
  readonly timestamp: Date;
  readonly detail: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// WP-019: AGENT OBSERVABILITY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Agent telemetry (per WP-019)
 * Statistics for agent society observability
 */
export interface AgentTelemetry {
  readonly agentId: string;
  readonly agentType: AgentType;
  readonly requestsHandled: number;
  readonly successRate: number;
  readonly averageExecutionTimeMs: number;
  readonly lastExecutedAt: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// WP-013: AGENT REGISTRY SERVICE CONTRACT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Canonical registry for all specialized agents
 * Single service: no per-agent infrastructure
 */
export interface AgentRegistryServiceContract {
  readonly serviceName: 'AgentRegistryService';
  readonly version: '1.0.0';

  /** Register a new specialized agent type */
  registerAgent(agent: RegisteredAgent): Promise<void>;

  /** Retrieve all active agents */
  getActiveAgents(): Promise<readonly RegisteredAgent[]>;

  /** Query agents by type */
  getAgentsByType(type: AgentType): Promise<readonly RegisteredAgent[]>;

  /** Get agent by ID */
  getAgent(agentId: string): Promise<RegisteredAgent | null>;

  /** Deactivate an agent */
  deactivateAgent(agentId: string): Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// WP-014: AGENT SELECTION ROUTER SERVICE CONTRACT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Canonical router for specialized agent selection (per WP-014)
 * Deterministic, constitutional, observable
 */
export interface AgentSelectionRouterContract {
  readonly serviceName: 'AgentSelectionRouter';
  readonly version: '1.0.0';

  /**
   * Select the best specialized agent for a request
   * Selection criteria: request type, priority, constitution, agent availability
   */
  selectAgent(
    requestId: string,
    requestType: string,
    constitution: ConstitutionArticleId,
    alternatives?: readonly AgentType[],
  ): Promise<AgentSelectionResult>;

  /** Get all registered agents and their selection priority */
  getSelectionRegistry(): Promise<readonly RegisteredAgent[]>;
}

// ═══════════════════════════════════════════════════════════════════════════
// WP-015/016/017: AGENT EXECUTION GATEWAY SERVICE CONTRACT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Canonical execution gateway for all specialized agents (per WP-015-017)
 * Coordinates context, execution, and result aggregation
 */
export interface AgentExecutionGatewayContract {
  readonly serviceName: 'AgentExecutionGateway';
  readonly version: '1.0.0';

  /**
   * Execute a request through the selected specialized agent
   * Coordinates: context building (WP-016), execution, result aggregation (WP-017)
   */
  executeAgent(
    agentId: string,
    context: AgentExecutionContext,
  ): Promise<AgentExecutionResult>;

  /** Get execution history for observability */
  getExecutionHistory(agentId: string, limit?: number): Promise<readonly AgentExecutionResult[]>;
}

// ═══════════════════════════════════════════════════════════════════════════
// WP-018/019: AGENT LIFECYCLE & OBSERVABILITY SERVICE CONTRACT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Combined lifecycle management and observability service (per WP-018-019)
 */
export interface AgentLifecycleServiceContract {
  readonly serviceName: 'AgentLifecycleService';
  readonly version: '1.0.0';

  /** Record a lifecycle event */
  recordEvent(record: AgentLifecycleRecord): Promise<void>;

  /** Get lifecycle history for an agent */
  getLifecycleHistory(agentId: string): Promise<readonly AgentLifecycleRecord[]>;

  /** Get telemetry for an agent */
  getTelemetry(agentId: string): Promise<AgentTelemetry | null>;

  /** Get telemetry for all agents */
  getAllTelemetry(): Promise<readonly AgentTelemetry[]>;
}

// ═══════════════════════════════════════════════════════════════════════════
// WP-020: AGENT SOCIETY LAYER KERNEL CONTRACT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Layer 7 Agent Society Kernel (per WP-020)
 * Orchestrates all agent society services
 */
export interface AgentSocietyLayerContract {
  readonly layerName: 'AgentSocietyLayer';
  readonly version: '1.0.0';
  readonly layerNumber: 7;

  readonly agentRegistryService: AgentRegistryServiceContract;
  readonly agentSelectionRouter: AgentSelectionRouterContract;
  readonly agentExecutionGateway: AgentExecutionGatewayContract;
  readonly agentLifecycleService: AgentLifecycleServiceContract;
}
