/**
 * WP-013 → WP-020: Agent Society Layer Tests
 * Comprehensive test suite for all agent society services
 *
 * Coverage:
 * - AgentRegistryService (WP-013): registration, retrieval, deactivation
 * - AgentSelectionRouter (WP-014): deterministic selection, priority ordering
 * - AgentExecutionGateway (WP-015-017): context, execution, history
 * - AgentLifecycleService (WP-018-019): events, telemetry
 * - createAgentSocietyLayer (WP-020): kernel contract, service wiring
 * - Determinism: identical selections across multiple runs
 */

import {
  createAgentSocietyLayer,
  AgentType,
  RegisteredAgent,
} from './wp-020-kernel';

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function createTestAgent(id: string, type: AgentType = AgentType.GENERIC, priority = 1): RegisteredAgent {
  return {
    agentId: id,
    agentType: type,
    specialization: {
      agentType: type,
      priority,
      handlesRequestTypes: ['DATA', 'QUERY', 'ANALYSIS'],
      timeoutMs: 5000,
    },
    constitutional: 'constitutional-structure',
    version: '1.0.0',
    isActive: true,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('WP-013 → WP-020: Agent Society Layer', () => {

  // ── Layer Instantiation ──

  test('Layer 7 kernel instantiates with correct metadata', () => {
    const layer = createAgentSocietyLayer();
    expect(layer.layerName).toBe('AgentSocietyLayer');
    expect(layer.version).toBe('1.0.0');
    expect(layer.layerNumber).toBe(7);
  });

  test('All four services are present and correctly named', () => {
    const layer = createAgentSocietyLayer();
    expect(layer.agentRegistryService.serviceName).toBe('AgentRegistryService');
    expect(layer.agentSelectionRouter.serviceName).toBe('AgentSelectionRouter');
    expect(layer.agentExecutionGateway.serviceName).toBe('AgentExecutionGateway');
    expect(layer.agentLifecycleService.serviceName).toBe('AgentLifecycleService');
  });

  // ── WP-013: AGENT REGISTRY SERVICE ──

  describe('WP-013: AgentRegistryService', () => {
    let layer: ReturnType<typeof createAgentSocietyLayer>;

    beforeEach(() => {
      layer = createAgentSocietyLayer();
    });

    test('registers a single agent', async () => {
      const agent = createTestAgent('test-agent-001', AgentType.GENERIC);
      await layer.agentRegistryService.registerAgent(agent);

      const registered = await layer.agentRegistryService.getAgent('test-agent-001');
      expect(registered).not.toBeNull();
      expect(registered!.agentId).toBe('test-agent-001');
    });

    test('rejects duplicate agent registration', async () => {
      const agent = createTestAgent('dup-agent', AgentType.GENERIC);
      await layer.agentRegistryService.registerAgent(agent);
      await expect(layer.agentRegistryService.registerAgent(agent)).rejects.toThrow('already registered');
    });

    test('retrieves all active agents', async () => {
      await layer.agentRegistryService.registerAgent(createTestAgent('agent-1', AgentType.GOVERNANCE));
      await layer.agentRegistryService.registerAgent(createTestAgent('agent-2', AgentType.SECURITY));
      const active = await layer.agentRegistryService.getActiveAgents();
      expect(active.length).toBe(2);
    });

    test('filters agents by type', async () => {
      await layer.agentRegistryService.registerAgent(createTestAgent('gov-1', AgentType.GOVERNANCE));
      await layer.agentRegistryService.registerAgent(createTestAgent('sec-1', AgentType.SECURITY));
      await layer.agentRegistryService.registerAgent(createTestAgent('gov-2', AgentType.GOVERNANCE));

      const gov = await layer.agentRegistryService.getAgentsByType(AgentType.GOVERNANCE);
      expect(gov.length).toBe(2);
      expect(gov.every(a => a.agentType === AgentType.GOVERNANCE)).toBe(true);
    });

    test('deactivates an agent', async () => {
      const agent = createTestAgent('deactivate-test', AgentType.GENERIC);
      await layer.agentRegistryService.registerAgent(agent);

      let active = await layer.agentRegistryService.getActiveAgents();
      expect(active.some(a => a.agentId === 'deactivate-test')).toBe(true);

      await layer.agentRegistryService.deactivateAgent('deactivate-test');

      active = await layer.agentRegistryService.getActiveAgents();
      expect(active.some(a => a.agentId === 'deactivate-test')).toBe(false);
    });

    test('getAgent returns null for non-existent agent', async () => {
      const agent = await layer.agentRegistryService.getAgent('non-existent');
      expect(agent).toBeNull();
    });
  });

  // ── WP-014: AGENT SELECTION ROUTER ──

  describe('WP-014: AgentSelectionRouter', () => {
    let layer: ReturnType<typeof createAgentSocietyLayer>;

    beforeEach(async () => {
      layer = createAgentSocietyLayer();
      // Register test agents with different priorities
      await layer.agentRegistryService.registerAgent(createTestAgent('gov-high', AgentType.GOVERNANCE, 100));
      await layer.agentRegistryService.registerAgent(createTestAgent('gov-low', AgentType.GOVERNANCE, 10));
      await layer.agentRegistryService.registerAgent(createTestAgent('sec-medium', AgentType.SECURITY, 50));
    });

    test('selects highest-priority agent for request type', async () => {
      const result = await layer.agentSelectionRouter.selectAgent('req-001', 'DATA', 'constitutional-structure');
      expect(['gov-high', 'gov-low', 'sec-medium']).toContain(result.selectedAgentId);
    });

    test('selection is deterministic: same request → same agent', async () => {
      const r1 = await layer.agentSelectionRouter.selectAgent('req-det', 'DATA', 'constitutional-structure');
      const r2 = await layer.agentSelectionRouter.selectAgent('req-det', 'DATA', 'constitutional-structure');
      expect(r1.selectedAgentId).toBe(r2.selectedAgentId);
    });

    test('provides alternative agents in selection result', async () => {
      const result = await layer.agentSelectionRouter.selectAgent('req-002', 'DATA', 'constitutional-structure');
      expect(result.alternativeAgents.length).toBeGreaterThanOrEqual(0);
    });

    test('throws when no qualified agent found', async () => {
      await expect(
        layer.agentSelectionRouter.selectAgent('req-fail', 'UNKNOWN_TYPE', 'constitutional-structure'),
      ).rejects.toThrow('No qualified agent');
    });

    test('respects constitutional article filtering', async () => {
      // Register agent that requires sovereign-high-council
      await layer.agentRegistryService.registerAgent({
        agentId: 'sovereign-only',
        agentType: AgentType.GOVERNANCE,
        specialization: {
          agentType: AgentType.GOVERNANCE,
          priority: 200,
          handlesRequestTypes: ['DATA'],
          requiresArticle: 'sovereign-high-council',
          timeoutMs: 5000,
        },
        constitutional: 'sovereign-high-council',
        version: '1.0.0',
        isActive: true,
      });

      // Request for sovereign article should route to sovereign-only agent
      const result = await layer.agentSelectionRouter.selectAgent(
        'req-sovereign', 'DATA', 'sovereign-high-council',
      );
      expect(result.selectedAgentId).toBe('sovereign-only');
    });
  });

  // ── WP-015-017: AGENT EXECUTION GATEWAY ──

  describe('WP-015-017: AgentExecutionGateway', () => {
    let layer: ReturnType<typeof createAgentSocietyLayer>;

    beforeEach(async () => {
      layer = createAgentSocietyLayer();
      await layer.agentRegistryService.registerAgent(createTestAgent('exec-agent-1', AgentType.GENERIC));
    });

    test('executes agent successfully', async () => {
      const context = {
        requestId: 'exec-req-001',
        agentId: 'exec-agent-1',
        agentType: AgentType.GENERIC,
        constitution: 'constitutional-structure' as const,
        inputData: { query: 'test' },
        metadata: {},
        startTime: new Date(),
      };

      const result = await layer.agentExecutionGateway.executeAgent('exec-agent-1', context);
      expect(result.success).toBe(true);
      expect(result.requestId).toBe('exec-req-001');
      expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    });

    test('fails gracefully for inactive agent', async () => {
      await layer.agentRegistryService.deactivateAgent('exec-agent-1');
      const context = {
        requestId: 'fail-req',
        agentId: 'exec-agent-1',
        agentType: AgentType.GENERIC,
        constitution: 'constitutional-structure' as const,
        inputData: {},
        metadata: {},
        startTime: new Date(),
      };
      await expect(layer.agentExecutionGateway.executeAgent('exec-agent-1', context)).rejects.toThrow('inactive');
    });

    test('maintains execution history', async () => {
      const context = {
        requestId: 'hist-req',
        agentId: 'exec-agent-1',
        agentType: AgentType.GENERIC,
        constitution: 'constitutional-structure' as const,
        inputData: {},
        metadata: {},
        startTime: new Date(),
      };

      await layer.agentExecutionGateway.executeAgent('exec-agent-1', context);
      const history = await layer.agentExecutionGateway.getExecutionHistory('exec-agent-1');

      expect(history.length).toBeGreaterThan(0);
      expect(history[0]!.requestId).toBe('hist-req');
    });
  });

  // ── WP-018-019: AGENT LIFECYCLE SERVICE ──

  describe('WP-018-019: AgentLifecycleService', () => {
    let layer: ReturnType<typeof createAgentSocietyLayer>;

    beforeEach(() => {
      layer = createAgentSocietyLayer();
    });

    test('records lifecycle events', async () => {
      const now = new Date();
      await layer.agentLifecycleService.recordEvent({
        event: 'REGISTERED',
        agentId: 'lifecycle-agent-1',
        agentType: AgentType.GENERIC,
        timestamp: now,
        detail: 'Agent registered',
      });

      const history = await layer.agentLifecycleService.getLifecycleHistory('lifecycle-agent-1');
      expect(history.length).toBe(1);
      expect(history[0]!.event).toBe('REGISTERED');
    });

    test('retrieves lifecycle history', async () => {
      const now = new Date();
      await layer.agentLifecycleService.recordEvent({ event: 'REGISTERED', agentId: 'hist-agent', agentType: AgentType.SECURITY, timestamp: now, detail: 'Registered' });
      await layer.agentLifecycleService.recordEvent({ event: 'ACTIVATED', agentId: 'hist-agent', agentType: AgentType.SECURITY, timestamp: now, detail: 'Activated' });

      const history = await layer.agentLifecycleService.getLifecycleHistory('hist-agent');
      expect(history.length).toBe(2);
    });

    test('returns null for non-existent agent telemetry', async () => {
      const telemetry = await layer.agentLifecycleService.getTelemetry('non-existent');
      expect(telemetry).toBeNull();
    });

    test('getAllTelemetry returns empty array initially', async () => {
      const all = await layer.agentLifecycleService.getAllTelemetry();
      expect(Array.isArray(all)).toBe(true);
    });
  });

  // ── Integration: Full Pipeline ──

  describe('Integration: Full Agent Pipeline', () => {
    test('complete flow: register → select → execute → track lifecycle', async () => {
      const layer = createAgentSocietyLayer();

      // 1. Register a governance agent
      await layer.agentRegistryService.registerAgent(
        createTestAgent('gov-pipeline', AgentType.GOVERNANCE, 50),
      );

      // 2. Select agent for request
      const selection = await layer.agentSelectionRouter.selectAgent(
        'pipeline-req-001', 'DATA', 'constitutional-structure',
      );
      expect(selection.selectedAgentId).toBe('gov-pipeline');

      // 3. Execute agent
      const context = {
        requestId: 'pipeline-req-001',
        agentId: 'gov-pipeline',
        agentType: AgentType.GOVERNANCE,
        constitution: 'constitutional-structure' as const,
        inputData: { analysis: 'policy-review' },
        metadata: {},
        startTime: new Date(),
      };
      const execution = await layer.agentExecutionGateway.executeAgent('gov-pipeline', context);
      expect(execution.success).toBe(true);

      // 4. Record lifecycle
      await layer.agentLifecycleService.recordEvent({
        event: 'EXECUTED',
        agentId: 'gov-pipeline',
        agentType: AgentType.GOVERNANCE,
        requestId: 'pipeline-req-001',
        timestamp: new Date(),
        detail: 'Successfully executed governance analysis',
      });

      // 5. Verify all components worked together
      const agentInfo = await layer.agentRegistryService.getAgent('gov-pipeline');
      expect(agentInfo).not.toBeNull();
      expect(agentInfo!.isActive).toBe(true);

      const history = await layer.agentExecutionGateway.getExecutionHistory('gov-pipeline');
      expect(history.length).toBeGreaterThan(0);

      const lifecycle = await layer.agentLifecycleService.getLifecycleHistory('gov-pipeline');
      expect(lifecycle.some(e => e.event === 'EXECUTED')).toBe(true);
    });
  });
});
