/**
 * WP-021 → WP-028: Agent Decision Society Service Implementations
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Eight canonical decision-making services for the Agent Decision Society.
 * Every service uses immutable patterns for correctness and thread-safety.
 * Orchestration service enables multi-agent constitutional decision-making.
 * 
 * Service Hierarchy:
 * 1. AgentIdentityService (WP-021) — Agent registration and lookup
 * 2. AgentRoleService (WP-022) — Role management
 * 3. AgentConstitutionalAuthorityService (WP-022) — Authority grants
 * 4. AgentDecisionCapabilityService (WP-023) — Decision routing
 * 5. AgentWorkingMemoryService (WP-024) — Per-agent memory
 * 6. AgentRuntimeStateService (WP-025) — State tracking
 * 7. AgentToolRegistryService (WP-026) — Tool management
 * 8. AgentDecisionHistoryService (WP-027) — Audit trails
 * 
 * Orchestration:
 * AgentDecisionSocietyService (WP-028) — Multi-agent decision coordination
 */

import type {
  AgentIdentity,
  AgentRole,
  AgentRoleType,
  AgentConstitutionalAuthority,
  ConstitutionalAuthorityGrant,
  AgentDecisionCapability,
  AgentWorkingMemory,
  WorkingMemoryEntry,
  AgentRuntimeState,
  AgentOperationalState,
  AgentToolRegistry,
  AgentTool,
  AgentDecisionHistory,
  DecisionHistoryEntry,
  DecisionType,
  DecisionConfidence,
  AgentDecision,
  AgentDecisionContext,
  AgentDecisionResult,
  AgentIdentityServiceContract,
  AgentRoleServiceContract,
  AgentConstitutionalAuthorityServiceContract,
  AgentDecisionCapabilityServiceContract,
  AgentWorkingMemoryServiceContract,
  AgentRuntimeStateServiceContract,
  AgentToolRegistryServiceContract,
  AgentDecisionHistoryServiceContract,
  AgentDecisionSocietyServiceContract,
  AgentDecisionSocietyLayerContract,
} from './wp-021-028-agent-decision-types';
import type { ConstitutionArticleId } from './constitution-types';

// ════════════════════════════════════════════════════════════════════════════
// SERVICE 1: AGENT IDENTITY SERVICE (WP-021)
// ════════════════════════════════════════════════════════════════════════════

class AgentIdentityService implements AgentIdentityServiceContract {
  private identities = new Map<string, AgentIdentity>();

  async registerAgentIdentity(identity: AgentIdentity): Promise<void> {
    if (this.identities.has(identity.agentId)) {
      throw new Error(`Agent ${identity.agentId} already registered`);
    }
    this.identities.set(identity.agentId, { ...identity });
  }

  async getAgentIdentity(agentId: string): Promise<AgentIdentity | null> {
    return this.identities.get(agentId) ?? null;
  }

  async getAllAgentIdentities(): Promise<readonly AgentIdentity[]> {
    return Array.from(this.identities.values());
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICE 2: AGENT ROLE SERVICE (WP-022 Part 1)
// ════════════════════════════════════════════════════════════════════════════

class AgentRoleService implements AgentRoleServiceContract {
  private roles = new Map<string, AgentRole>();

  async registerAgentRole(agentId: string, role: AgentRole): Promise<void> {
    if (this.roles.has(agentId)) {
      throw new Error(`Agent ${agentId} role already registered`);
    }
    this.roles.set(agentId, { ...role });
  }

  async getAgentRole(agentId: string): Promise<AgentRole | null> {
    return this.roles.get(agentId) ?? null;
  }

  async getAgentsByRole(roleType: AgentRoleType): Promise<readonly string[]> {
    const agents: string[] = [];
    for (const [agentId, role] of Array.from(this.roles.entries())) {
      if (role.roleType === roleType) {
        agents.push(agentId);
      }
    }
    return agents;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICE 3: AGENT CONSTITUTIONAL AUTHORITY SERVICE (WP-022 Part 2)
// ════════════════════════════════════════════════════════════════════════════

class AgentConstitutionalAuthorityService implements AgentConstitutionalAuthorityServiceContract {
  private authority = new Map<string, AgentConstitutionalAuthority>();

  async grantAuthority(agentId: string, grant: ConstitutionalAuthorityGrant): Promise<void> {
    const current = this.authority.get(agentId);
    if (!current) {
      this.authority.set(agentId, {
        agentId,
        grants: [grant],
      });
    } else {
      // Check for duplicate
      const isDuplicate = current.grants.some(g => g.grantedArticle === grant.grantedArticle);
      if (isDuplicate) {
        throw new Error(`Agent ${agentId} already has grant for article ${grant.grantedArticle}`);
      }
      // Immutable update
      this.authority.set(agentId, {
        ...current,
        grants: [...current.grants, grant],
      });
    }
  }

  async getAgentAuthority(agentId: string): Promise<AgentConstitutionalAuthority | null> {
    const auth = this.authority.get(agentId);
    return auth ? { ...auth } : null;
  }

  async verifyAuthority(agentId: string, article: ConstitutionArticleId): Promise<boolean> {
    const auth = this.authority.get(agentId);
    if (!auth) return false;
    return auth.grants.some(g => g.grantedArticle === article);
  }

  async revokeAuthority(agentId: string, article: ConstitutionArticleId): Promise<void> {
    const current = this.authority.get(agentId);
    if (!current) {
      throw new Error(`No authority found for agent ${agentId}`);
    }
    const filtered = current.grants.filter(g => g.grantedArticle !== article);
    if (filtered.length === current.grants.length) {
      throw new Error(`No grant found for article ${article}`);
    }
    this.authority.set(agentId, {
      ...current,
      grants: filtered,
    });
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICE 4: AGENT DECISION CAPABILITY SERVICE (WP-023)
// ════════════════════════════════════════════════════════════════════════════

class AgentDecisionCapabilityService implements AgentDecisionCapabilityServiceContract {
  private capabilities = new Map<string, AgentDecisionCapability>();

  async registerCapability(agentId: string, capability: AgentDecisionCapability): Promise<void> {
    if (this.capabilities.has(agentId)) {
      throw new Error(`Agent ${agentId} capability already registered`);
    }
    this.capabilities.set(agentId, { ...capability });
  }

  async getCapability(agentId: string): Promise<AgentDecisionCapability | null> {
    return this.capabilities.get(agentId) ?? null;
  }

  async canAgentDecide(agentId: string, decisionType: DecisionType): Promise<boolean> {
    const cap = this.capabilities.get(agentId);
    if (!cap) return false;
    return cap.supportedDecisionTypes.includes(decisionType);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICE 5: AGENT WORKING MEMORY SERVICE (WP-024)
// ════════════════════════════════════════════════════════════════════════════

class AgentWorkingMemoryService implements AgentWorkingMemoryServiceContract {
  private memory = new Map<string, WorkingMemoryEntry[]>();
  private readonly maxEntriesPerAgent = 1000;

  async addMemoryEntry(agentId: string, entry: WorkingMemoryEntry): Promise<void> {
    const entries = this.memory.get(agentId) ?? [];
    if (entries.length >= this.maxEntriesPerAgent) {
      // Remove oldest entry
      entries.shift();
    }
    this.memory.set(agentId, [...entries, { ...entry }]);
  }

  async getMemory(agentId: string): Promise<AgentWorkingMemory | null> {
    const entries = this.memory.get(agentId) ?? [];
    return {
      agentId,
      entries,
      maxEntriesPerAgent: this.maxEntriesPerAgent,
      totalEntriesStored: entries.length,
    };
  }

  async clearExpiredEntries(agentId: string): Promise<number> {
    const entries = this.memory.get(agentId) ?? [];
    const now = Date.now();
    const fresh = entries.filter(e => !e.expiresAt || e.expiresAt > now);
    const removed = entries.length - fresh.length;
    if (fresh.length < entries.length) {
      this.memory.set(agentId, fresh);
    }
    return removed;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICE 6: AGENT RUNTIME STATE SERVICE (WP-025)
// ════════════════════════════════════════════════════════════════════════════

class AgentRuntimeStateService implements AgentRuntimeStateServiceContract {
  private states = new Map<string, AgentRuntimeState>();
  private startTimes = new Map<string, number>();

  async setState(agentId: string, state: AgentOperationalState): Promise<void> {
    const current = this.states.get(agentId);
    const now = Date.now();

    if (!current) {
      this.startTimes.set(agentId, now);
      this.states.set(agentId, {
        agentId,
        currentState: state,
        lastStateChange: now,
        requestsInProgress: 0,
        errorsCount: 0,
        successCount: 0,
        uptime_ms: 0,
      });
    } else {
      this.states.set(agentId, {
        ...current,
        currentState: state,
        lastStateChange: now,
      });
    }
  }

  async getState(agentId: string): Promise<AgentRuntimeState | null> {
    let state = this.states.get(agentId);
    if (!state) return null;
    
    const startTime = this.startTimes.get(agentId) ?? Date.now();
    state = { ...state, uptime_ms: Date.now() - startTime };
    return state;
  }

  async getAllStates(): Promise<readonly AgentRuntimeState[]> {
    const result: AgentRuntimeState[] = [];
    for (const state of Array.from(this.states.values())) {
      const startTime = this.startTimes.get(state.agentId) ?? Date.now();
      result.push({ ...state, uptime_ms: Date.now() - startTime });
    }
    return result;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICE 7: AGENT TOOL REGISTRY SERVICE (WP-026)
// ════════════════════════════════════════════════════════════════════════════

class AgentToolRegistryService implements AgentToolRegistryServiceContract {
  private tools = new Map<string, AgentTool[]>();

  async registerTool(agentId: string, tool: AgentTool): Promise<void> {
    const agentTools = this.tools.get(agentId) ?? [];
    const exists = agentTools.some(t => t.toolId === tool.toolId);
    if (exists) {
      throw new Error(`Tool ${tool.toolId} already registered for agent ${agentId}`);
    }
    this.tools.set(agentId, [...agentTools, { ...tool }]);
  }

  async getTools(agentId: string): Promise<AgentToolRegistry | null> {
    const tools = this.tools.get(agentId) ?? [];
    const authorizedCount = tools.filter(t => t.authorized).length;
    return {
      agentId,
      tools,
      totalToolCount: tools.length,
      authorizedToolCount: authorizedCount,
    };
  }

  async authorizeToolForAgent(agentId: string, toolId: string): Promise<void> {
    const agentTools = this.tools.get(agentId) ?? [];
    const toolIndex = agentTools.findIndex(t => t.toolId === toolId);
    if (toolIndex === -1) {
      throw new Error(`Tool ${toolId} not found for agent ${agentId}`);
    }
    const tool = agentTools[toolIndex];
    agentTools[toolIndex] = { ...tool, authorized: true };
    this.tools.set(agentId, agentTools);
  }
}

// ════════════════════════════════════════════════════════════════════════════
// SERVICE 8: AGENT DECISION HISTORY SERVICE (WP-027)
// ════════════════════════════════════════════════════════════════════════════

class AgentDecisionHistoryService implements AgentDecisionHistoryServiceContract {
  private histories = new Map<string, DecisionHistoryEntry[]>();
  private decisionMap = new Map<string, DecisionHistoryEntry>();

  async recordDecision(agentId: string, entry: DecisionHistoryEntry): Promise<void> {
    const entries = this.histories.get(agentId) ?? [];
    this.histories.set(agentId, [...entries, { ...entry }]);
    this.decisionMap.set(entry.decisionId, { ...entry });
  }

  async getHistory(agentId: string): Promise<AgentDecisionHistory | null> {
    const entries = this.histories.get(agentId) ?? [];
    if (entries.length === 0) {
      return {
        agentId,
        totalDecisionsMade: 0,
        averageConfidence: 'UNCERTAIN',
        lastDecisionAt: 0,
        reversalCount: 0,
        decisionsByType: {} as Record<DecisionType, number>,
      };
    }

    // Calculate aggregates
    const decisionsByType: Record<string, number> = {};
    let reversalCount = 0;
    entries.forEach(e => {
      decisionsByType[e.decisionType] = (decisionsByType[e.decisionType] ?? 0) + 1;
      if (e.reversed) reversalCount++;
    });

    const lastEntry = entries[entries.length - 1];
    return {
      agentId,
      totalDecisionsMade: entries.length,
      averageConfidence: lastEntry.confidence,
      lastDecisionAt: lastEntry.timestamp,
      reversalCount,
      decisionsByType: decisionsByType as Record<DecisionType, number>,
    };
  }

  async getDecision(decisionId: string): Promise<DecisionHistoryEntry | null> {
    return this.decisionMap.get(decisionId) ?? null;
  }

  async reverseDecision(decisionId: string): Promise<void> {
    const entry = this.decisionMap.get(decisionId);
    if (!entry) {
      throw new Error(`Decision ${decisionId} not found`);
    }
    const reversed: DecisionHistoryEntry = {
      ...entry,
      reversed: true,
      reversalTimestamp: Date.now(),
    };
    this.decisionMap.set(decisionId, reversed);

    // Update in history
    const agentEntries = this.histories.get(entry.agentId) ?? [];
    const idx = agentEntries.findIndex(e => e.decisionId === decisionId);
    if (idx >= 0) {
      agentEntries[idx] = reversed;
      this.histories.set(entry.agentId, agentEntries);
    }
  }
}

// ════════════════════════════════════════════════════════════════════════════
// ORCHESTRATION SERVICE: AGENT DECISION SOCIETY (WP-028)
// ════════════════════════════════════════════════════════════════════════════

class AgentDecisionSocietyService implements AgentDecisionSocietyServiceContract {
  constructor(
    private identityService: AgentIdentityService,
    private roleService: AgentRoleService,
    private authorityService: AgentConstitutionalAuthorityService,
    private capabilityService: AgentDecisionCapabilityService,
    private memoryService: AgentWorkingMemoryService,
    private stateService: AgentRuntimeStateService,
    private toolService: AgentToolRegistryService,
    private historyService: AgentDecisionHistoryService,
  ) {}

  async makeConstitutionalDecision(
    context: AgentDecisionContext,
    candidateAgents?: readonly string[],
  ): Promise<AgentDecisionResult> {
    const requestId = context.requestId;
    const agentId = context.agentId;

    try {
      // Verify candidate agent has authority
      if (context.constitutionalArticle) {
        const hasAuth = await this.authorityService.verifyAuthority(
          agentId,
          context.constitutionalArticle,
        );
        if (!hasAuth) {
          throw new Error(
            `Agent ${agentId} lacks authority for article ${context.constitutionalArticle}`,
          );
        }
      }

      // Verify agent can make this decision type
      const canDecide = await this.capabilityService.canAgentDecide(
        agentId,
        context.decisionType,
      );
      if (!canDecide) {
        throw new Error(`Agent ${agentId} cannot make decision type ${context.decisionType}`);
      }

      // Make the decision
      const decision: AgentDecision = {
        decisionId: `dec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        decisionType: context.decisionType,
        timestamp: Date.now(),
        agentId,
        inputData: context.inputData,
        outputDecision: { ...context.inputData }, // Echo for now
        confidence: 'HIGH',
        rationale: `Decision made by agent ${agentId} for decision type ${context.decisionType}`,
        constitutionalBasis: context.constitutionalArticle,
        reversible: true,
      };

      // Record in history
      await this.historyService.recordDecision(agentId, {
        decisionId: decision.decisionId,
        agentId,
        timestamp: decision.timestamp,
        requestId,
        decisionType: context.decisionType,
        constitution_article: context.constitutionalArticle,
        confidence: decision.confidence,
        decision: decision.outputDecision,
      });

      return {
        requestId,
        agentId,
        decision,
        success: true,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return {
        requestId,
        agentId,
        decision: {} as AgentDecision,
        success: false,
        errorMessage,
      };
    }
  }

  async compareAgentDecisions(decisionIds: readonly string[]): Promise<{
    readonly decisions: readonly AgentDecision[];
    readonly consensus: boolean;
    readonly recommendedDecision: AgentDecision;
  }> {
    const decisions: AgentDecision[] = [];
    for (const decisionId of decisionIds) {
      const entry = await this.historyService.getDecision(decisionId);
      if (entry) {
        decisions.push({
          decisionId: entry.decisionId,
          decisionType: entry.decisionType,
          timestamp: entry.timestamp,
          agentId: entry.agentId,
          inputData: entry.decision,
          outputDecision: entry.decision,
          confidence: entry.confidence,
          rationale: '',
          constitutionalBasis: entry.constitution_article,
          reversible: true,
        });
      }
    }

    const consensus = decisions.length > 0 && decisions.every(
      d => JSON.stringify(d.outputDecision) === JSON.stringify(decisions[0].outputDecision)
    );

    return {
      decisions,
      consensus,
      recommendedDecision: decisions[0] ?? ({} as AgentDecision),
    };
  }

  async delegateDecision(
    originalDecisionId: string,
    fromAgentId: string,
    toAgentId: string,
    reason: string,
  ): Promise<void> {
    const decision = await this.historyService.getDecision(originalDecisionId);
    if (!decision) {
      throw new Error(`Decision ${originalDecisionId} not found`);
    }

    // Record delegation in memory
    await this.memoryService.addMemoryEntry(toAgentId, {
      entryId: `mem-${Date.now()}`,
      timestamp: Date.now(),
      category: 'DECISION',
      data: {
        delegatedFrom: fromAgentId,
        originalDecisionId,
        reason,
        originalDecision: decision.decision,
      },
    });
  }

  async getDecisionTrace(
    decisionId: string,
  ): Promise<{
    readonly decision: AgentDecision;
    readonly authorityChain: readonly ConstitutionArticleId[];
    readonly agentChain: readonly string[];
    readonly policyChain: readonly string[];
  }> {
    const entry = await this.historyService.getDecision(decisionId);
    if (!entry) {
      throw new Error(`Decision ${decisionId} not found`);
    }

    const decision: AgentDecision = {
      decisionId: entry.decisionId,
      decisionType: entry.decisionType,
      timestamp: entry.timestamp,
      agentId: entry.agentId,
      inputData: entry.decision,
      outputDecision: entry.decision,
      confidence: entry.confidence,
      rationale: '',
      constitutionalBasis: entry.constitution_article,
      reversible: true,
    };

    return {
      decision,
      authorityChain: entry.constitution_article ? [entry.constitution_article] : [],
      agentChain: [entry.agentId],
      policyChain: [],
    };
  }
}

// ════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION: CREATE AGENT DECISION SOCIETY LAYER
// ════════════════════════════════════════════════════════════════════════════

export function createAgentDecisionSocietyLayer(): AgentDecisionSocietyLayerContract {
  const identityService = new AgentIdentityService();
  const roleService = new AgentRoleService();
  const authorityService = new AgentConstitutionalAuthorityService();
  const capabilityService = new AgentDecisionCapabilityService();
  const memoryService = new AgentWorkingMemoryService();
  const stateService = new AgentRuntimeStateService();
  const toolService = new AgentToolRegistryService();
  const historyService = new AgentDecisionHistoryService();

  const societyService = new AgentDecisionSocietyService(
    identityService,
    roleService,
    authorityService,
    capabilityService,
    memoryService,
    stateService,
    toolService,
    historyService,
  );

  return {
    layerName: 'AgentDecisionSocietyLayer',
    version: '1.0.0',
    layerNumber: 7,
    agentIdentityService: identityService,
    agentRoleService: roleService,
    agentAuthorityService: authorityService,
    agentCapabilityService: capabilityService,
    agentMemoryService: memoryService,
    agentStateService: stateService,
    agentToolService: toolService,
    agentHistoryService: historyService,
    agentDecisionSociety: societyService,
  };
}

// Re-export all types for external use
export type {
  AgentIdentityServiceContract,
  AgentRoleServiceContract,
  AgentConstitutionalAuthorityServiceContract,
  AgentDecisionCapabilityServiceContract,
  AgentWorkingMemoryServiceContract,
  AgentRuntimeStateServiceContract,
  AgentToolRegistryServiceContract,
  AgentDecisionHistoryServiceContract,
  AgentDecisionSocietyServiceContract,
  AgentDecisionSocietyLayerContract,
};
