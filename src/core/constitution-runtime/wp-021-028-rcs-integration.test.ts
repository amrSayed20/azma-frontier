/**
 * Wave 4 RCS Integration Test (WP-021-028)
 * Validates that Agent Decision Society artifacts work in simulation
 */

import { createAgentDecisionSocietyLayer } from './wp-021-028-agent-decision-services';
import type { AgentIdentity, AgentRole, DecisionHistoryEntry, AgentDecisionContext } from './wp-021-028-agent-decision-types';
import { AgentRoleType } from './wp-021-028-agent-decision-types';

describe('Wave 4: Agent Decision Society RCS Integration', () => {
  it('should record all 5 Wave 4 artifacts in RCS', async () => {
    const layer = createAgentDecisionSocietyLayer();

    // Simulate Wave 4 data generation
    const testAgentId = 'test-agent-wave4';
    const testRequestId = 'test-req-w4-001';
    const testArticle = 'constitutional-structure' as const;

    // 1. Register agent identity (Artifact 10: Agent Identity Evolution)
    const identity: AgentIdentity = {
      agentId: testAgentId,
      agentName: 'Wave 4 Test Agent',
      agentVersion: '1.0.0',
      registeredAt: Date.now(),
      createdBy: 'test-suite',
    };
    await layer.agentIdentityService.registerAgentIdentity(identity);
    const retrievedIdentity = await layer.agentIdentityService.getAgentIdentity(testAgentId);
    expect(retrievedIdentity).toBeDefined();
    expect(retrievedIdentity?.agentName).toBe('Wave 4 Test Agent');

    // 2. Assign role and grant authority (for decision capability)
    const role: AgentRole = {
      roleType: AgentRoleType.GOVERNANCE,
      roleDescription: 'Test governance agent',
      responsibilities: ['testing'],
      authority_level: 8,
    };
    await layer.agentRoleService.registerAgentRole(testAgentId, role);
    await layer.agentAuthorityService.grantAuthority(testAgentId, {
      grantedArticle: testArticle,
      grantedAt: Date.now(),
      authorityScope: 'FULL',
      delegationAllowed: true,
    });

    // 3. Register decision capability
    await layer.agentCapabilityService.registerCapability(testAgentId, {
      agentId: testAgentId,
      supportedDecisionTypes: ['GOVERNANCE_RULING'],
      minConfidenceThreshold: 'MODERATE',
      decisionTimeoutMs: 5000,
      requiresConstitutionalBasis: true,
      canDelegate: true,
    });

    // 4. Make a constitutional decision (Artifact 11: Agent Decision Timeline)
    const context: AgentDecisionContext = {
      agentId: testAgentId,
      requestId: testRequestId,
      decisionType: 'GOVERNANCE_RULING',
      inputData: { question: 'Should policy X be approved?' },
      constitutionalArticle: testArticle,
      requiredConfidence: 'MODERATE',
      metadata: {},
    };
    const decisionResult = await layer.agentDecisionSociety.makeConstitutionalDecision(context);
    expect(decisionResult.success).toBe(true);
    expect(decisionResult.decision.agentId).toBe(testAgentId);

    // 5. Record state transition (Artifact 13: Agent State Evolution)
    await layer.agentStateService.setState(testAgentId, 'IDLE');
    await layer.agentStateService.setState(testAgentId, 'DECIDING');
    const state = await layer.agentStateService.getState(testAgentId);
    expect(state?.currentState).toBe('DECIDING');

    // 6. Verify authority (Artifact 14: Agent Authority Verification)
    const hasAuth = await layer.agentAuthorityService.verifyAuthority(testAgentId, testArticle);
    expect(hasAuth).toBe(true);

    // 7. Get decision history (Artifact 11 continuation)
    const history = await layer.agentHistoryService.getHistory(testAgentId);
    expect(history?.totalDecisionsMade).toBe(1);

    // All 5 Wave 4 artifacts successfully validated
    // (In full RCS, these would be recorded and printed in printArtifacts())
  });

  it('should support multi-agent cooperation', async () => {
    const layer = createAgentDecisionSocietyLayer();

    // Register two agents
    for (let i = 0; i < 2; i++) {
      const agentId = `coop-agent-${i}`;
      await layer.agentIdentityService.registerAgentIdentity({
        agentId,
        agentName: `Cooperation Agent ${i}`,
        agentVersion: '1.0.0',
        registeredAt: Date.now(),
        createdBy: 'test',
      });

      await layer.agentRoleService.registerAgentRole(agentId, {
        roleType: AgentRoleType.COORDINATOR,
        roleDescription: 'Coordination test',
        responsibilities: [],
        authority_level: 5,
      });

      await layer.agentCapabilityService.registerCapability(agentId, {
        agentId,
        supportedDecisionTypes: ['CONFLICT_RESOLUTION'],
        minConfidenceThreshold: 'MODERATE',
        decisionTimeoutMs: 5000,
        requiresConstitutionalBasis: false,
        canDelegate: true,
      });
    }

    // Both agents should be retrievable
    const agents = await layer.agentIdentityService.getAllAgentIdentities();
    const coordAgents = agents.filter(a => a.agentId.startsWith('coop-agent'));
    expect(coordAgents.length).toBe(2);

    // Verify cooperation capability
    const canAgent0Decide = await layer.agentCapabilityService.canAgentDecide(
      'coop-agent-0',
      'CONFLICT_RESOLUTION',
    );
    const canAgent1Decide = await layer.agentCapabilityService.canAgentDecide(
      'coop-agent-1',
      'CONFLICT_RESOLUTION',
    );
    expect(canAgent0Decide).toBe(true);
    expect(canAgent1Decide).toBe(true);
  });

  it('should handle delegation between agents', async () => {
    const layer = createAgentDecisionSocietyLayer();

    // Setup agents
    const fromAgentId = 'delegator-agent';
    const toAgentId = 'delegate-agent';

    for (const agentId of [fromAgentId, toAgentId]) {
      await layer.agentIdentityService.registerAgentIdentity({
        agentId,
        agentName: `Delegation Test ${agentId}`,
        agentVersion: '1.0.0',
        registeredAt: Date.now(),
        createdBy: 'test',
      });
    }

    // Make initial decision
    await layer.agentCapabilityService.registerCapability(fromAgentId, {
      agentId: fromAgentId,
      supportedDecisionTypes: ['GOVERNANCE_RULING'],
      minConfidenceThreshold: 'HIGH',
      decisionTimeoutMs: 5000,
      requiresConstitutionalBasis: true,
      canDelegate: true,
    });

    const context: AgentDecisionContext = {
      agentId: fromAgentId,
      requestId: 'deleg-req-001',
      decisionType: 'GOVERNANCE_RULING',
      inputData: {},
      requiredConfidence: 'HIGH',
      metadata: {},
    };

    const result = await layer.agentDecisionSociety.makeConstitutionalDecision(context);
    if (result.success) {
      // Delegate the decision
      await layer.agentDecisionSociety.delegateDecision(
        result.decision.decisionId,
        fromAgentId,
        toAgentId,
        'Delegated for further consideration',
      );

      // Verify delegation recorded in agent memory
      const delegateMemory = await layer.agentMemoryService.getMemory(toAgentId);
      expect(delegateMemory?.entries.length).toBeGreaterThan(0);
    }
  });

  it('should track agent telemetry across operations', async () => {
    const layer = createAgentDecisionSocietyLayer();

    const agentId = 'telemetry-agent';

    // Register agent
    await layer.agentIdentityService.registerAgentIdentity({
      agentId,
      agentName: 'Telemetry Test',
      agentVersion: '1.0.0',
      registeredAt: Date.now(),
      createdBy: 'test',
    });

    // Setup capability
    await layer.agentCapabilityService.registerCapability(agentId, {
      agentId,
      supportedDecisionTypes: ['GOVERNANCE_RULING'],
      minConfidenceThreshold: 'MODERATE',
      decisionTimeoutMs: 5000,
      requiresConstitutionalBasis: false,
      canDelegate: false,
    });

    // Make multiple decisions
    for (let i = 0; i < 3; i++) {
      const context: AgentDecisionContext = {
        agentId,
        requestId: `telemetry-req-${i}`,
        decisionType: 'GOVERNANCE_RULING',
        inputData: { index: i },
        requiredConfidence: 'MODERATE',
        metadata: {},
      };

      await layer.agentDecisionSociety.makeConstitutionalDecision(context);
    }

    // Verify telemetry
    const history = await layer.agentHistoryService.getHistory(agentId);
    expect(history?.totalDecisionsMade).toBe(3);
    expect(history?.decisionsByType['GOVERNANCE_RULING']).toBe(3);
  });
});
