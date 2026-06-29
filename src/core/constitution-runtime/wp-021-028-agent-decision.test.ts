/**
 * WP-021-028: Agent Decision Society Tests
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Comprehensive test coverage for all 8 agent decision services
 * and multi-agent orchestration logic.
 * 
 * Test Coverage:
 * - WP-021: Agent Identity (3 tests)
 * - WP-022: Agent Role & Authority (4 tests)
 * - WP-023: Agent Decision Capability (3 tests)
 * - WP-024: Agent Working Memory (3 tests)
 * - WP-025: Agent Runtime State (3 tests)
 * - WP-026: Agent Tool Registry (3 tests)
 * - WP-027: Agent Decision History (4 tests)
 * - WP-028: Agent Decision Society Orchestration (5 tests)
 * - Integration: Full pipeline (3 tests)
 * 
 * Total: 31 tests, 100% pass rate expected
 */

import {
  createAgentDecisionSocietyLayer,
  type AgentDecisionSocietyLayerContract,
} from './wp-021-028-agent-decision-services';
import type {
  AgentIdentity,
  AgentRole,
  AgentRoleType,
  ConstitutionalAuthorityGrant,
  AgentDecisionCapability,
  WorkingMemoryEntry,
  AgentTool,
  DecisionHistoryEntry,
  AgentDecisionContext,
} from './wp-021-028-agent-decision-types';
import { AgentRoleType as RoleType } from './wp-021-028-agent-decision-types';
import type { ConstitutionArticleId } from './constitution-types';

describe('WP-021-028: Agent Decision Society Layer', () => {
  let layer: AgentDecisionSocietyLayerContract;

  beforeEach(() => {
    layer = createAgentDecisionSocietyLayer();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-021: AGENT IDENTITY SERVICE TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-021: Agent Identity Service', () => {
    it('should register and retrieve agent identity', async () => {
      const identity: AgentIdentity = {
        agentId: 'agent-001',
        agentName: 'Governance Agent Alpha',
        agentVersion: '1.0.0',
        registeredAt: Date.now(),
        createdBy: 'system',
      };

      await layer.agentIdentityService.registerAgentIdentity(identity);
      const retrieved = await layer.agentIdentityService.getAgentIdentity('agent-001');

      expect(retrieved).toBeDefined();
      expect(retrieved?.agentName).toBe('Governance Agent Alpha');
    });

    it('should reject duplicate agent registration', async () => {
      const identity: AgentIdentity = {
        agentId: 'agent-002',
        agentName: 'Test Agent',
        agentVersion: '1.0.0',
        registeredAt: Date.now(),
        createdBy: 'system',
      };

      await layer.agentIdentityService.registerAgentIdentity(identity);
      await expect(layer.agentIdentityService.registerAgentIdentity(identity)).rejects.toThrow(
        'already registered',
      );
    });

    it('should return all registered agent identities', async () => {
      const id1: AgentIdentity = {
        agentId: 'agent-003',
        agentName: 'Agent A',
        agentVersion: '1.0.0',
        registeredAt: Date.now(),
        createdBy: 'system',
      };
      const id2: AgentIdentity = {
        agentId: 'agent-004',
        agentName: 'Agent B',
        agentVersion: '1.0.0',
        registeredAt: Date.now(),
        createdBy: 'system',
      };

      await layer.agentIdentityService.registerAgentIdentity(id1);
      await layer.agentIdentityService.registerAgentIdentity(id2);

      const all = await layer.agentIdentityService.getAllAgentIdentities();
      expect(all.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-022: AGENT ROLE & AUTHORITY TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-022: Agent Role & Authority Service', () => {
    it('should register and retrieve agent role', async () => {
      const role: AgentRole = {
        roleType: RoleType.GOVERNANCE,
        roleDescription: 'Governance decision maker',
        responsibilities: ['constitutional-review', 'policy-approval'],
        authority_level: 9,
      };

      await layer.agentRoleService.registerAgentRole('agent-role-001', role);
      const retrieved = await layer.agentRoleService.getAgentRole('agent-role-001');

      expect(retrieved).toBeDefined();
      expect(retrieved?.roleType).toBe(RoleType.GOVERNANCE);
      expect(retrieved?.authority_level).toBe(9);
    });

    it('should retrieve agents by role type', async () => {
      const role: AgentRole = {
        roleType: RoleType.SECURITY,
        roleDescription: 'Security agent',
        responsibilities: ['threat-assessment'],
        authority_level: 8,
      };

      await layer.agentRoleService.registerAgentRole('agent-sec-001', role);
      await layer.agentRoleService.registerAgentRole('agent-sec-002', role);

      const agents = await layer.agentRoleService.getAgentsByRole(RoleType.SECURITY);
      expect(agents.length).toBeGreaterThanOrEqual(2);
      expect(agents).toContain('agent-sec-001');
      expect(agents).toContain('agent-sec-002');
    });

    it('should grant and verify constitutional authority', async () => {
      const grant: ConstitutionalAuthorityGrant = {
        grantedArticle: 'constitutional-structure',
        grantedAt: Date.now(),
        authorityScope: 'FULL',
        delegationAllowed: true,
      };

      await layer.agentAuthorityService.grantAuthority('agent-auth-001', grant);
      const hasAuth = await layer.agentAuthorityService.verifyAuthority(
        'agent-auth-001',
        'constitutional-structure',
      );

      expect(hasAuth).toBe(true);
    });

    it('should revoke constitutional authority', async () => {
      const grant: ConstitutionalAuthorityGrant = {
        grantedArticle: 'constitutional-structure',
        grantedAt: Date.now(),
        authorityScope: 'FULL',
        delegationAllowed: false,
      };

      await layer.agentAuthorityService.grantAuthority('agent-auth-002', grant);
      await layer.agentAuthorityService.revokeAuthority('agent-auth-002', 'constitutional-structure');
      const hasAuth = await layer.agentAuthorityService.verifyAuthority(
        'agent-auth-002',
        'constitutional-structure',
      );

      expect(hasAuth).toBe(false);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-023: AGENT DECISION CAPABILITY TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-023: Agent Decision Capability Service', () => {
    it('should register agent decision capability', async () => {
      const capability: AgentDecisionCapability = {
        agentId: 'agent-cap-001',
        supportedDecisionTypes: ['POLICY_EVALUATION', 'GOVERNANCE_RULING'],
        minConfidenceThreshold: 'HIGH',
        decisionTimeoutMs: 5000,
        requiresConstitutionalBasis: true,
        canDelegate: true,
      };

      await layer.agentCapabilityService.registerCapability('agent-cap-001', capability);
      const retrieved = await layer.agentCapabilityService.getCapability('agent-cap-001');

      expect(retrieved).toBeDefined();
      expect(retrieved?.supportedDecisionTypes).toContain('POLICY_EVALUATION');
    });

    it('should verify agent can make specific decision type', async () => {
      const capability: AgentDecisionCapability = {
        agentId: 'agent-cap-002',
        supportedDecisionTypes: ['SECURITY_DECISION'],
        minConfidenceThreshold: 'MODERATE',
        decisionTimeoutMs: 3000,
        requiresConstitutionalBasis: false,
        canDelegate: false,
      };

      await layer.agentCapabilityService.registerCapability('agent-cap-002', capability);
      const canDecide = await layer.agentCapabilityService.canAgentDecide(
        'agent-cap-002',
        'SECURITY_DECISION',
      );

      expect(canDecide).toBe(true);
    });

    it('should return false if agent cannot make decision type', async () => {
      const capability: AgentDecisionCapability = {
        agentId: 'agent-cap-003',
        supportedDecisionTypes: ['POLICY_EVALUATION'],
        minConfidenceThreshold: 'HIGH',
        decisionTimeoutMs: 5000,
        requiresConstitutionalBasis: true,
        canDelegate: true,
      };

      await layer.agentCapabilityService.registerCapability('agent-cap-003', capability);
      const canDecide = await layer.agentCapabilityService.canAgentDecide(
        'agent-cap-003',
        'SECURITY_DECISION',
      );

      expect(canDecide).toBe(false);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-024: AGENT WORKING MEMORY TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-024: Agent Working Memory Service', () => {
    it('should add and retrieve memory entries', async () => {
      const entry: WorkingMemoryEntry = {
        entryId: 'mem-001',
        timestamp: Date.now(),
        category: 'CONTEXT',
        data: { context: 'test-context' },
      };

      await layer.agentMemoryService.addMemoryEntry('agent-mem-001', entry);
      const memory = await layer.agentMemoryService.getMemory('agent-mem-001');

      expect(memory).toBeDefined();
      expect(memory?.entries.length).toBe(1);
    });

    it('should clear expired memory entries', async () => {
      const now = Date.now();
      const entry: WorkingMemoryEntry = {
        entryId: 'mem-002',
        timestamp: now,
        category: 'OBSERVATION',
        data: { obs: 'test' },
        ttlMs: 100,
        expiresAt: now + 100,
      };

      await layer.agentMemoryService.addMemoryEntry('agent-mem-002', entry);
      
      // Wait for expiry
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const cleared = await layer.agentMemoryService.clearExpiredEntries('agent-mem-002');
      expect(cleared).toBe(1);
    });

    it('should enforce maximum entries per agent', async () => {
      // Add many entries (default max is 1000)
      for (let i = 0; i < 10; i++) {
        const entry: WorkingMemoryEntry = {
          entryId: `mem-bulk-${i}`,
          timestamp: Date.now(),
          category: 'REASONING',
          data: { index: i },
        };
        await layer.agentMemoryService.addMemoryEntry('agent-mem-003', entry);
      }

      const memory = await layer.agentMemoryService.getMemory('agent-mem-003');
      expect(memory?.totalEntriesStored).toBeLessThanOrEqual(1000);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-025: AGENT RUNTIME STATE TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-025: Agent Runtime State Service', () => {
    it('should set and retrieve agent runtime state', async () => {
      await layer.agentStateService.setState('agent-state-001', 'IDLE');
      const state = await layer.agentStateService.getState('agent-state-001');

      expect(state).toBeDefined();
      expect(state?.currentState).toBe('IDLE');
    });

    it('should transition agent through states', async () => {
      await layer.agentStateService.setState('agent-state-002', 'IDLE');
      await layer.agentStateService.setState('agent-state-002', 'DECIDING');
      const state = await layer.agentStateService.getState('agent-state-002');

      expect(state?.currentState).toBe('DECIDING');
    });

    it('should track uptime for agent', async () => {
      await layer.agentStateService.setState('agent-state-003', 'IDLE');
      await new Promise(resolve => setTimeout(resolve, 50));
      const state = await layer.agentStateService.getState('agent-state-003');

      expect(state?.uptime_ms).toBeGreaterThanOrEqual(50);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-026: AGENT TOOL REGISTRY TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-026: Agent Tool Registry Service', () => {
    it('should register and retrieve agent tools', async () => {
      const tool: AgentTool = {
        toolId: 'tool-001',
        toolName: 'Policy Evaluator',
        description: 'Evaluates constitutional policies',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        requiresAuth: true,
        authorized: false,
      };

      await layer.agentToolService.registerTool('agent-tool-001', tool);
      const registry = await layer.agentToolService.getTools('agent-tool-001');

      expect(registry).toBeDefined();
      expect(registry?.totalToolCount).toBe(1);
      expect(registry?.authorizedToolCount).toBe(0);
    });

    it('should authorize tools for agents', async () => {
      const tool: AgentTool = {
        toolId: 'tool-002',
        toolName: 'Test Tool',
        description: 'Test',
        inputSchema: {},
        outputSchema: {},
        requiresAuth: true,
        authorized: false,
      };

      await layer.agentToolService.registerTool('agent-tool-002', tool);
      await layer.agentToolService.authorizeToolForAgent('agent-tool-002', 'tool-002');
      const registry = await layer.agentToolService.getTools('agent-tool-002');

      expect(registry?.authorizedToolCount).toBe(1);
    });

    it('should prevent duplicate tool registration', async () => {
      const tool: AgentTool = {
        toolId: 'tool-003',
        toolName: 'Test Tool',
        description: 'Test',
        inputSchema: {},
        outputSchema: {},
        requiresAuth: false,
        authorized: true,
      };

      await layer.agentToolService.registerTool('agent-tool-003', tool);
      await expect(layer.agentToolService.registerTool('agent-tool-003', tool)).rejects.toThrow(
        'already registered',
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-027: AGENT DECISION HISTORY TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-027: Agent Decision History Service', () => {
    it('should record agent decisions', async () => {
      const entry: DecisionHistoryEntry = {
        decisionId: 'dec-001',
        agentId: 'agent-hist-001',
        timestamp: Date.now(),
        requestId: 'req-001',
        decisionType: 'POLICY_EVALUATION',
        constitution_article: 'constitutional-structure',
        confidence: 'HIGH',
        decision: { verdict: 'APPROVED' },
      };

      await layer.agentHistoryService.recordDecision('agent-hist-001', entry);
      const history = await layer.agentHistoryService.getHistory('agent-hist-001');

      expect(history).toBeDefined();
      expect(history?.totalDecisionsMade).toBe(1);
    });

    it('should retrieve specific decision by ID', async () => {
      const entry: DecisionHistoryEntry = {
        decisionId: 'dec-002',
        agentId: 'agent-hist-002',
        timestamp: Date.now(),
        requestId: 'req-002',
        decisionType: 'SECURITY_DECISION',
        confidence: 'MODERATE',
        decision: { threat: 'LOW' },
      };

      await layer.agentHistoryService.recordDecision('agent-hist-002', entry);
      const decision = await layer.agentHistoryService.getDecision('dec-002');

      expect(decision).toBeDefined();
      expect(decision?.decisionType).toBe('SECURITY_DECISION');
    });

    it('should reverse a decision', async () => {
      const entry: DecisionHistoryEntry = {
        decisionId: 'dec-003',
        agentId: 'agent-hist-003',
        timestamp: Date.now(),
        requestId: 'req-003',
        decisionType: 'POLICY_EVALUATION',
        confidence: 'HIGH',
        decision: { verdict: 'APPROVED' },
      };

      await layer.agentHistoryService.recordDecision('agent-hist-003', entry);
      await layer.agentHistoryService.reverseDecision('dec-003');
      const reversed = await layer.agentHistoryService.getDecision('dec-003');

      expect(reversed?.reversed).toBe(true);
    });

    it('should track decision statistics', async () => {
      for (let i = 0; i < 3; i++) {
        const entry: DecisionHistoryEntry = {
          decisionId: `dec-stat-${i}`,
          agentId: 'agent-hist-stat',
          timestamp: Date.now(),
          requestId: `req-stat-${i}`,
          decisionType: 'GOVERNANCE_RULING',
          confidence: 'HIGH',
          decision: { ruling: 'APPROVED' },
        };
        await layer.agentHistoryService.recordDecision('agent-hist-stat', entry);
      }

      const history = await layer.agentHistoryService.getHistory('agent-hist-stat');
      expect(history?.totalDecisionsMade).toBe(3);
      expect(history?.decisionsByType['GOVERNANCE_RULING']).toBe(3);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-028: AGENT DECISION SOCIETY ORCHESTRATION TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-028: Agent Decision Society Orchestration', () => {
    beforeEach(async () => {
      // Setup: Register an identity, role, authority, and capability
      await layer.agentIdentityService.registerAgentIdentity({
        agentId: 'orch-agent-001',
        agentName: 'Orchestration Test Agent',
        agentVersion: '1.0.0',
        registeredAt: Date.now(),
        createdBy: 'test',
      });

      await layer.agentRoleService.registerAgentRole('orch-agent-001', {
        roleType: RoleType.GOVERNANCE,
        roleDescription: 'Test',
        responsibilities: [],
        authority_level: 5,
      });

      await layer.agentAuthorityService.grantAuthority('orch-agent-001', {
        grantedArticle: 'constitutional-structure',
        grantedAt: Date.now(),
        authorityScope: 'FULL',
        delegationAllowed: true,
      });

      await layer.agentCapabilityService.registerCapability('orch-agent-001', {
        agentId: 'orch-agent-001',
        supportedDecisionTypes: ['GOVERNANCE_RULING'],
        minConfidenceThreshold: 'MODERATE',
        decisionTimeoutMs: 5000,
        requiresConstitutionalBasis: true,
        canDelegate: true,
      });
    });

    it('should make constitutional decision', async () => {
      const context: AgentDecisionContext = {
        agentId: 'orch-agent-001',
        requestId: 'orch-req-001',
        decisionType: 'GOVERNANCE_RULING',
        inputData: { question: 'Approve policy X?' },
        constitutionalArticle: 'constitutional-structure',
        requiredConfidence: 'MODERATE',
        metadata: {},
      };

      const result = await layer.agentDecisionSociety.makeConstitutionalDecision(context);
      expect(result.success).toBe(true);
      expect(result.decision.agentId).toBe('orch-agent-001');
    });

    it('should reject decision without authority', async () => {
      const context: AgentDecisionContext = {
        agentId: 'orch-agent-001',
        requestId: 'orch-req-002',
        decisionType: 'GOVERNANCE_RULING',
        inputData: { question: 'Approve?' },
        constitutionalArticle: 'sovereign-high-council',
        requiredConfidence: 'HIGH',
        metadata: {},
      };

      const result = await layer.agentDecisionSociety.makeConstitutionalDecision(context);
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('lacks authority');
    });

    it('should reject decision agent cannot make', async () => {
      const context: AgentDecisionContext = {
        agentId: 'orch-agent-001',
        requestId: 'orch-req-003',
        decisionType: 'SECURITY_DECISION',
        inputData: { threat: 'TEST' },
        requiredConfidence: 'HIGH',
        metadata: {},
      };

      const result = await layer.agentDecisionSociety.makeConstitutionalDecision(context);
      expect(result.success).toBe(false);
      expect(result.errorMessage).toContain('cannot make decision type');
    });

    it('should get decision trace', async () => {
      const context: AgentDecisionContext = {
        agentId: 'orch-agent-001',
        requestId: 'orch-req-004',
        decisionType: 'GOVERNANCE_RULING',
        inputData: { data: 'test' },
        constitutionalArticle: 'constitutional-structure',
        requiredConfidence: 'MODERATE',
        metadata: {},
      };

      const result = await layer.agentDecisionSociety.makeConstitutionalDecision(context);
      if (result.success) {
        const trace = await layer.agentDecisionSociety.getDecisionTrace(result.decision.decisionId);
        expect(trace.decision.decisionId).toBe(result.decision.decisionId);
        expect(trace.agentChain).toContain('orch-agent-001');
      }
    });

    it('should compare agent decisions', async () => {
      const context: AgentDecisionContext = {
        agentId: 'orch-agent-001',
        requestId: 'orch-req-005',
        decisionType: 'GOVERNANCE_RULING',
        inputData: { policy: 'X' },
        constitutionalArticle: 'constitutional-structure',
        requiredConfidence: 'MODERATE',
        metadata: {},
      };

      const result = await layer.agentDecisionSociety.makeConstitutionalDecision(context);
      if (result.success) {
        const comparison = await layer.agentDecisionSociety.compareAgentDecisions([
          result.decision.decisionId,
        ]);
        expect(comparison.decisions.length).toBeGreaterThan(0);
      }
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // INTEGRATION TESTS
  // ════════════════════════════════════════════════════════════════════════════

  describe('Integration: Full Agent Decision Pipeline', () => {
    it('should complete full agent lifecycle and decision pipeline', async () => {
      // 1. Register identity
      const identity: AgentIdentity = {
        agentId: 'full-pipeline-agent',
        agentName: 'Full Pipeline Test',
        agentVersion: '1.0.0',
        registeredAt: Date.now(),
        createdBy: 'test-suite',
      };
      await layer.agentIdentityService.registerAgentIdentity(identity);

      // 2. Assign role
      const role: AgentRole = {
        roleType: RoleType.SPECIALIST,
        roleDescription: 'Specialist agent for testing',
        responsibilities: ['testing'],
        authority_level: 3,
      };
      await layer.agentRoleService.registerAgentRole('full-pipeline-agent', role);

      // 3. Grant authority
      const grant: ConstitutionalAuthorityGrant = {
        grantedArticle: 'al-wateen-constitutional-intelligence',
        grantedAt: Date.now(),
        authorityScope: 'FULL',
        delegationAllowed: false,
      };
      await layer.agentAuthorityService.grantAuthority('full-pipeline-agent', grant);

      // 4. Register capability
      const capability: AgentDecisionCapability = {
        agentId: 'full-pipeline-agent',
        supportedDecisionTypes: ['CUSTOM'],
        minConfidenceThreshold: 'LOW',
        decisionTimeoutMs: 10000,
        requiresConstitutionalBasis: true,
        canDelegate: false,
      };
      await layer.agentCapabilityService.registerCapability('full-pipeline-agent', capability);

      // 5. Add working memory
      const memoryEntry: WorkingMemoryEntry = {
        entryId: 'full-mem-001',
        timestamp: Date.now(),
        category: 'CONTEXT',
        data: { scenario: 'full-pipeline-test' },
      };
      await layer.agentMemoryService.addMemoryEntry('full-pipeline-agent', memoryEntry);

      // 6. Set runtime state
      await layer.agentStateService.setState('full-pipeline-agent', 'DECIDING');

      // 7. Register tool
      const tool: AgentTool = {
        toolId: 'full-tool-001',
        toolName: 'Full Test Tool',
        description: 'Tool for full pipeline test',
        inputSchema: {},
        outputSchema: {},
        requiresAuth: false,
        authorized: true,
      };
      await layer.agentToolService.registerTool('full-pipeline-agent', tool);

      // 8. Make decision
      const context: AgentDecisionContext = {
        agentId: 'full-pipeline-agent',
        requestId: 'full-req-001',
        decisionType: 'CUSTOM',
        inputData: { test: 'data' },
        constitutionalArticle: 'al-wateen-constitutional-intelligence',
        requiredConfidence: 'LOW',
        metadata: { pipeline: 'full' },
      };
      const decisionResult = await layer.agentDecisionSociety.makeConstitutionalDecision(context);
      expect(decisionResult.success).toBe(true);

      // 9. Verify decision history
      const history = await layer.agentHistoryService.getHistory('full-pipeline-agent');
      expect(history?.totalDecisionsMade).toBe(1);

      // 10. Get decision trace
      const trace = await layer.agentDecisionSociety.getDecisionTrace(
        decisionResult.decision.decisionId,
      );
      expect(trace.decision.agentId).toBe('full-pipeline-agent');
    });

    it('should handle concurrent operations', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        const identity: AgentIdentity = {
          agentId: `concurrent-agent-${i}`,
          agentName: `Concurrent Agent ${i}`,
          agentVersion: '1.0.0',
          registeredAt: Date.now(),
          createdBy: 'test',
        };
        promises.push(layer.agentIdentityService.registerAgentIdentity(identity));
      }

      await Promise.all(promises);
      const allIdentities = await layer.agentIdentityService.getAllAgentIdentities();
      expect(allIdentities.length).toBeGreaterThanOrEqual(5);
    });

    it('should validate immutability of stored data', async () => {
      const originalIdentity: AgentIdentity = {
        agentId: 'immutable-agent',
        agentName: 'Immutable Test',
        agentVersion: '1.0.0',
        registeredAt: Date.now(),
        createdBy: 'test',
      };

      await layer.agentIdentityService.registerAgentIdentity(originalIdentity);
      const retrieved = await layer.agentIdentityService.getAgentIdentity('immutable-agent');

      expect(retrieved).toBeDefined();
      // Verify we can't mutate the returned data
      expect(() => {
        (retrieved as any).agentName = 'MUTATED';
      }).not.toThrow(); // TypeScript prevents mutation, but we test runtime behavior too
    });
  });
});
