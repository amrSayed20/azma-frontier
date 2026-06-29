/**
 * WP-021 → WP-028: Agent Decision Society Type Definitions & Contracts
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Complete type system for constitutionally-grounded agent decision-making.
 * Every agent exposes 8 canonical contracts for identity, authority, capability,
 * and decision traceability through the constitutional hierarchy.
 * 
 * LAYER CLASSIFICATION: Layer 7 Extended (Agent Decision Society)
 * DEPENDENCIES: Layer 1 (Constitution), Layer 5 (Decision), Wave 3 (Agent Society)
 * 
 * Contracts (8):
 * 1. AgentIdentity (WP-021) — Unique agent identification
 * 2. AgentRole (WP-022) — Role classification
 * 3. AgentConstitutionalAuthority (WP-022) — Authority grants from constitution
 * 4. AgentDecisionCapability (WP-023) — Decision types this agent can make
 * 5. AgentWorkingMemory (WP-024) — Per-agent memory store
 * 6. AgentRuntimeState (WP-025) — Current operational state
 * 7. AgentToolRegistry (WP-026) — Available tools/functions
 * 8. AgentDecisionHistory (WP-027) — Decision audit trail
 * 
 * Orchestration (WP-028): Multi-agent decision routing with constitutional authority
 */

import type { ConstitutionArticleId } from './constitution-types';

// ════════════════════════════════════════════════════════════════════════════
// CONTRACT 1: AGENT IDENTITY (WP-021)
// ════════════════════════════════════════════════════════════════════════════

export interface AgentIdentity {
  readonly agentId: string;
  readonly agentName: string;
  readonly agentVersion: string;
  readonly registeredAt: number; // timestamp
  readonly createdBy: string; // creator agent or system
}

// ════════════════════════════════════════════════════════════════════════════
// CONTRACT 2: AGENT ROLE (WP-022 Part 1)
// ════════════════════════════════════════════════════════════════════════════

export enum AgentRoleType {
  GOVERNANCE = 'GOVERNANCE',
  SECURITY = 'SECURITY',
  PERFORMANCE = 'PERFORMANCE',
  OBSERVABILITY = 'OBSERVABILITY',
  ORCHESTRATION = 'ORCHESTRATION',
  LEARNING = 'LEARNING',
  SPECIALIST = 'SPECIALIST',
  COORDINATOR = 'COORDINATOR',
}

export interface AgentRole {
  readonly roleType: AgentRoleType;
  readonly roleDescription: string;
  readonly responsibilities: readonly string[];
  readonly authority_level: number; // 0-10 scale
}

// ════════════════════════════════════════════════════════════════════════════
// CONTRACT 3: AGENT CONSTITUTIONAL AUTHORITY (WP-022 Part 2)
// ════════════════════════════════════════════════════════════════════════════

export interface ConstitutionalAuthorityGrant {
  readonly grantedArticle: ConstitutionArticleId;
  readonly grantedAt: number;
  readonly authorityScope: 'FULL' | 'PARTIAL' | 'READ_ONLY';
  readonly delegationAllowed: boolean;
}

export interface AgentConstitutionalAuthority {
  readonly agentId: string;
  readonly grants: readonly ConstitutionalAuthorityGrant[];
  readonly delegatedFrom?: string; // if delegated from another agent
  readonly delegatedTo?: readonly string[]; // if delegating to others
}

// ════════════════════════════════════════════════════════════════════════════
// CONTRACT 4: AGENT DECISION CAPABILITY (WP-023)
// ════════════════════════════════════════════════════════════════════════════

export type DecisionType = 
  | 'POLICY_EVALUATION'
  | 'RESOURCE_ALLOCATION'
  | 'SECURITY_DECISION'
  | 'PERFORMANCE_OPTIMIZATION'
  | 'GOVERNANCE_RULING'
  | 'CONFLICT_RESOLUTION'
  | 'ESCALATION_DECISION'
  | 'CUSTOM';

export type DecisionConfidence = 'CERTAIN' | 'HIGH' | 'MODERATE' | 'LOW' | 'UNCERTAIN';

export interface AgentDecision {
  readonly decisionId: string;
  readonly decisionType: DecisionType;
  readonly timestamp: number;
  readonly agentId: string;
  readonly inputData: Record<string, unknown>;
  readonly outputDecision: Record<string, unknown>;
  readonly confidence: DecisionConfidence;
  readonly rationale: string;
  readonly constitutionalBasis?: ConstitutionArticleId;
  readonly reversible: boolean;
}

export interface AgentDecisionCapability {
  readonly agentId: string;
  readonly supportedDecisionTypes: readonly DecisionType[];
  readonly minConfidenceThreshold: DecisionConfidence;
  readonly decisionTimeoutMs: number;
  readonly requiresConstitutionalBasis: boolean;
  readonly canDelegate: boolean;
}

// ════════════════════════════════════════════════════════════════════════════
// CONTRACT 5: AGENT WORKING MEMORY (WP-024)
// ════════════════════════════════════════════════════════════════════════════

export interface WorkingMemoryEntry {
  readonly entryId: string;
  readonly timestamp: number;
  readonly category: 'CONTEXT' | 'DECISION' | 'OBSERVATION' | 'REASONING' | 'RESULT';
  readonly data: Record<string, unknown>;
  readonly ttlMs?: number;
  readonly expiresAt?: number;
}

export interface AgentWorkingMemory {
  readonly agentId: string;
  readonly entries: readonly WorkingMemoryEntry[];
  readonly maxEntriesPerAgent: number;
  readonly totalEntriesStored: number;
}

// ════════════════════════════════════════════════════════════════════════════
// CONTRACT 6: AGENT RUNTIME STATE (WP-025)
// ════════════════════════════════════════════════════════════════════════════

export type AgentOperationalState = 
  | 'IDLE'
  | 'RECEIVING_REQUEST'
  | 'DECIDING'
  | 'DELEGATING'
  | 'WAITING_FOR_DELEGATION'
  | 'EXECUTING'
  | 'UPDATING_MEMORY'
  | 'RECORDING_DECISION'
  | 'COMPLETED'
  | 'FAILED'
  | 'OFFLINE';

export interface AgentRuntimeState {
  readonly agentId: string;
  readonly currentState: AgentOperationalState;
  readonly lastStateChange: number;
  readonly requestsInProgress: number;
  readonly errorsCount: number;
  readonly successCount: number;
  readonly lastErrorMessage?: string;
  readonly uptime_ms: number;
}

// ════════════════════════════════════════════════════════════════════════════
// CONTRACT 7: AGENT TOOL REGISTRY (WP-026)
// ════════════════════════════════════════════════════════════════════════════

export interface AgentTool {
  readonly toolId: string;
  readonly toolName: string;
  readonly description: string;
  readonly inputSchema: Record<string, unknown>;
  readonly outputSchema: Record<string, unknown>;
  readonly requiresAuth: boolean;
  readonly authorized: boolean;
}

export interface AgentToolRegistry {
  readonly agentId: string;
  readonly tools: readonly AgentTool[];
  readonly totalToolCount: number;
  readonly authorizedToolCount: number;
}

// ════════════════════════════════════════════════════════════════════════════
// CONTRACT 8: AGENT DECISION HISTORY (WP-027)
// ════════════════════════════════════════════════════════════════════════════

export interface DecisionHistoryEntry {
  readonly decisionId: string;
  readonly agentId: string;
  readonly timestamp: number;
  readonly requestId: string;
  readonly decisionType: DecisionType;
  readonly constitution_article?: ConstitutionArticleId;
  readonly confidence: DecisionConfidence;
  readonly decision: Record<string, unknown>;
  readonly reversed?: boolean;
  readonly reversalTimestamp?: number;
}

export interface AgentDecisionHistory {
  readonly agentId: string;
  readonly totalDecisionsMade: number;
  readonly averageConfidence: DecisionConfidence;
  readonly lastDecisionAt: number;
  readonly reversalCount: number;
  readonly decisionsByType: Record<DecisionType, number>;
}

// ════════════════════════════════════════════════════════════════════════════
// UNIFIED AGENT DECISION CONTEXT (Used across WP-021-028)
// ════════════════════════════════════════════════════════════════════════════

export interface AgentDecisionContext {
  readonly agentId: string;
  readonly requestId: string;
  readonly decisionType: DecisionType;
  readonly inputData: Record<string, unknown>;
  readonly constitutionalArticle?: ConstitutionArticleId;
  readonly requiredConfidence: DecisionConfidence;
  readonly metadata: Record<string, unknown>;
}

export interface AgentDecisionResult {
  readonly requestId: string;
  readonly agentId: string;
  readonly decision: AgentDecision;
  readonly success: boolean;
  readonly errorMessage?: string;
  readonly delegatedToAgents?: readonly string[];
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICE CONTRACTS (WP-028: Orchestration)
// ════════════════════════════════════════════════════════════════════════════

export interface AgentIdentityServiceContract {
  registerAgentIdentity(identity: AgentIdentity): Promise<void>;
  getAgentIdentity(agentId: string): Promise<AgentIdentity | null>;
  getAllAgentIdentities(): Promise<readonly AgentIdentity[]>;
}

export interface AgentRoleServiceContract {
  registerAgentRole(agentId: string, role: AgentRole): Promise<void>;
  getAgentRole(agentId: string): Promise<AgentRole | null>;
  getAgentsByRole(roleType: AgentRoleType): Promise<readonly string[]>;
}

export interface AgentConstitutionalAuthorityServiceContract {
  grantAuthority(agentId: string, grant: ConstitutionalAuthorityGrant): Promise<void>;
  getAgentAuthority(agentId: string): Promise<AgentConstitutionalAuthority | null>;
  verifyAuthority(agentId: string, article: ConstitutionArticleId): Promise<boolean>;
  revokeAuthority(agentId: string, article: ConstitutionArticleId): Promise<void>;
}

export interface AgentDecisionCapabilityServiceContract {
  registerCapability(agentId: string, capability: AgentDecisionCapability): Promise<void>;
  getCapability(agentId: string): Promise<AgentDecisionCapability | null>;
  canAgentDecide(agentId: string, decisionType: DecisionType): Promise<boolean>;
}

export interface AgentWorkingMemoryServiceContract {
  addMemoryEntry(agentId: string, entry: WorkingMemoryEntry): Promise<void>;
  getMemory(agentId: string): Promise<AgentWorkingMemory | null>;
  clearExpiredEntries(agentId: string): Promise<number>;
}

export interface AgentRuntimeStateServiceContract {
  setState(agentId: string, state: AgentOperationalState): Promise<void>;
  getState(agentId: string): Promise<AgentRuntimeState | null>;
  getAllStates(): Promise<readonly AgentRuntimeState[]>;
}

export interface AgentToolRegistryServiceContract {
  registerTool(agentId: string, tool: AgentTool): Promise<void>;
  getTools(agentId: string): Promise<AgentToolRegistry | null>;
  authorizeToolForAgent(agentId: string, toolId: string): Promise<void>;
}

export interface AgentDecisionHistoryServiceContract {
  recordDecision(agentId: string, entry: DecisionHistoryEntry): Promise<void>;
  getHistory(agentId: string): Promise<AgentDecisionHistory | null>;
  getDecision(decisionId: string): Promise<DecisionHistoryEntry | null>;
  reverseDecision(decisionId: string): Promise<void>;
}

// ════════════════════════════════════════════════════════════════════════════
// AGENT DECISION SOCIETY ORCHESTRATION SERVICE (WP-028)
// ════════════════════════════════════════════════════════════════════════════

export interface AgentDecisionSocietyServiceContract {
  /**
   * Route a decision request through the Agent Decision Society
   * Multi-agent selection and decision-making with constitutional authority
   */
  makeConstitutionalDecision(
    context: AgentDecisionContext,
    candidateAgents?: readonly string[], // if null, select all qualified agents
  ): Promise<AgentDecisionResult>;

  /**
   * Compare decisions from multiple agents
   * Used for conflict resolution and validation
   */
  compareAgentDecisions(
    decisionIds: readonly string[],
  ): Promise<{
    readonly decisions: readonly AgentDecision[];
    readonly consensus: boolean;
    readonly recommendedDecision: AgentDecision;
  }>;

  /**
   * Delegate a decision from one agent to another
   * Preserves constitutional authority chain
   */
  delegateDecision(
    originalDecisionId: string,
    fromAgentId: string,
    toAgentId: string,
    reason: string,
  ): Promise<void>;

  /**
   * Get full decision trace (constitutional authority chain)
   */
  getDecisionTrace(
    decisionId: string,
  ): Promise<{
    readonly decision: AgentDecision;
    readonly authorityChain: readonly ConstitutionArticleId[];
    readonly agentChain: readonly string[];
    readonly policyChain: readonly string[];
  }>;
}

// ════════════════════════════════════════════════════════════════════════════
// COMPLETE AGENT DECISION SOCIETY CONTRACT (WP-028: Unified Interface)
// ════════════════════════════════════════════════════════════════════════════

export interface AgentDecisionSocietyLayerContract {
  readonly layerName: 'AgentDecisionSocietyLayer';
  readonly version: '1.0.0';
  readonly layerNumber: 7;
  
  // 8 Required Services
  readonly agentIdentityService: AgentIdentityServiceContract;
  readonly agentRoleService: AgentRoleServiceContract;
  readonly agentAuthorityService: AgentConstitutionalAuthorityServiceContract;
  readonly agentCapabilityService: AgentDecisionCapabilityServiceContract;
  readonly agentMemoryService: AgentWorkingMemoryServiceContract;
  readonly agentStateService: AgentRuntimeStateServiceContract;
  readonly agentToolService: AgentToolRegistryServiceContract;
  readonly agentHistoryService: AgentDecisionHistoryServiceContract;
  
  // Orchestration Service
  readonly agentDecisionSociety: AgentDecisionSocietyServiceContract;
}
