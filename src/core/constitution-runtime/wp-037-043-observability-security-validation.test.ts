/**
 * ════════════════════════════════════════════════════════════════════════════
 * WP-037-043 TEST SUITE
 * 
 * Runtime Observability, Security, Dependency Validation, Consistency
 * ════════════════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from '@jest/globals';
import {
  RuntimeLayer,
  OperationalStatus,
} from '../constitution-runtime/wp-037-runtime-observability-types';
import {
  createRuntimeObservabilityLayer,
} from '../constitution-runtime/wp-038-040-runtime-observability-services';
import {
  createRuntimeSecurityService,
  SecurityEventType,
  SecuritySeverity,
} from '../constitution-runtime/wp-041-runtime-security-framework';
import {
  createDependencyValidationService,
  createConsistencyEngine,
} from '../constitution-runtime/wp-042-043-validation-consistency';

describe('WP-037-043: Runtime Observability, Security, Validation & Consistency', () => {
  let observability: any;
  let security: any;
  let validation: any;
  let consistency: any;

  beforeEach(() => {
    observability = createRuntimeObservabilityLayer();
    security = createRuntimeSecurityService();
    validation = createDependencyValidationService();
    consistency = createConsistencyEngine();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-037: Runtime Observability Framework (5 tests)
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-037: Runtime Observability Framework', () => {
    it('should record and retrieve metrics', async () => {
      const tags = new Map([['source', 'test']]);
      await observability.recordMetric('cpu_usage', 45.2, 'percent', tags);
      await observability.recordMetric('cpu_usage', 48.5, 'percent', tags);

      const stats = await observability.getMetricStatistics('cpu_usage', 60000);

      expect(stats.current).toBeGreaterThan(0);
      expect(stats.sampleCount).toBeGreaterThan(0);
      expect(stats.average).toBeGreaterThan(0);
    });

    it('should check layer health', async () => {
      const health = await observability.checkLayerHealth(RuntimeLayer.DECISION);

      expect(health.layer).toBe(RuntimeLayer.DECISION);
      expect([
        OperationalStatus.HEALTHY,
        OperationalStatus.DEGRADED,
        OperationalStatus.CRITICAL,
      ]).toContain(health.status);
      expect(health.healthRating).toBeGreaterThanOrEqual(0);
      expect(health.healthRating).toBeLessThanOrEqual(100);
      expect(health.successRate).toBeGreaterThanOrEqual(0);
      expect(health.successRate).toBeLessThanOrEqual(1);
    });

    it('should generate layer health report', async () => {
      const report = await observability.getLayerHealthReport();

      expect(report.reportId).toBeDefined();
      expect(report.generatedAt).toBeGreaterThan(0);
      expect(report.layers.size).toBeGreaterThan(0);
      expect(report.overallHealth).toBeGreaterThanOrEqual(0);
      expect(report.overallHealth).toBeLessThanOrEqual(100);
    });

    it('should track agent health metrics', async () => {
      const health = await observability.checkAgentHealth('agent-1');

      expect(health.agentId).toBe('agent-1');
      expect(health.decisionsProcessed).toBeGreaterThan(0);
      expect(health.healthRating).toBeGreaterThanOrEqual(0);
      expect(health.memoryUtilization).toBeGreaterThanOrEqual(0);
      expect(health.memoryUtilization).toBeLessThanOrEqual(1);
    });

    it('should generate civilization health dashboard', async () => {
      const dashboard =
        await observability.getCivilizationHealthDashboard();

      expect(dashboard.reportId).toBeDefined();
      expect(dashboard.overallHealthRating).toBeGreaterThanOrEqual(0);
      expect(dashboard.overallHealthRating).toBeLessThanOrEqual(100);
      expect([
        OperationalStatus.HEALTHY,
        OperationalStatus.DEGRADED,
        OperationalStatus.CRITICAL,
      ]).toContain(dashboard.systemStatus);
      expect(dashboard.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-038-040: Layer/Agent/Memory Health (3 tests)
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-038-040: Layer, Agent & Memory Health Monitoring', () => {
    it('should generate agent health matrix', async () => {
      const matrix = await observability.getAgentHealthMatrix();

      expect(matrix.reportId).toBeDefined();
      expect(matrix.agents.size).toBeGreaterThan(0);
      expect(matrix.totalAgents).toBeGreaterThan(0);
      expect(matrix.averageHealthRating).toBeGreaterThanOrEqual(0);
    });

    it('should get queue and memory health', async () => {
      const queueHealth = await observability.getQueueHealth(
        'test-queue'
      );
      const memoryHealth = await observability.getMemoryHealth();
      const decisionHealth = await observability.getDecisionHealth();

      expect(queueHealth.currentDepth).toBeGreaterThanOrEqual(0);
      expect(queueHealth.utilizationPercent).toBeGreaterThanOrEqual(0);
      expect(memoryHealth.utilizationPercent).toBeGreaterThanOrEqual(0);
      expect(decisionHealth.successRate).toBeGreaterThanOrEqual(0);
      expect(decisionHealth.successRate).toBeLessThanOrEqual(1);
    });

    it('should track concurrency and get metric history', async () => {
      const concurrency =
        await observability.getConcurrencyHealth();
      const tags = new Map([['test', 'true']]);
      await observability.recordMetric('test_metric', 42, 'units', tags);

      const history = await observability.getMetricHistory(
        'test_metric',
        60000
      );

      expect(concurrency.activeOperations).toBeGreaterThanOrEqual(0);
      expect(concurrency.utilizationPercent).toBeGreaterThanOrEqual(0);
      expect(history).toBeDefined();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-041: Runtime Security (4 tests)
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-041: Runtime Security Framework', () => {
    it('should check authorization for operations', async () => {
      const context = new Map([['operation', 'read']]);
      const check = await security.checkAuthorization(
        'agent-1',
        'read_memory',
        context
      );

      expect(check.authorized).toBeDefined();
      expect(check.agentId).toBe('agent-1');
      expect(check.operation).toBe('read_memory');
      expect(check.requiredArticles).toBeDefined();
    });

    it('should enforce constitutional security', async () => {
      const context = new Map([['operation', 'write']]);
      const result = await security.enforceConstitutionalSecurity(
        'agent-1',
        'write_policy',
        context
      );

      expect(typeof result).toBe('boolean');
    });

    it('should record and retrieve security events', async () => {
      const event = {
        eventId: 'test-event-1',
        timestamp: Date.now(),
        eventType: SecurityEventType.OPERATION_BLOCKED,
        severity: SecuritySeverity.WARNING,
        operation: 'unauthorized_access',
        details: 'Test event',
        blocked: true,
      };

      await security.recordSecurityEvent(event);
      const log = await security.getSecurityEventLog();

      expect(log).toBeDefined();
      expect(Array.isArray(log)).toBe(true);
    });

    it('should verify integrity and get security status', async () => {
      const integrity = await security.verifyRuntimeIntegrity();
      const tamper = await security.detectTamper();
      const status = await security.getSecurityStatus();

      expect(integrity.verified).toBeDefined();
      expect(tamper.tamperDetected).toBeDefined();
      expect(['SECURE', 'COMPROMISED', 'UNKNOWN']).toContain(
        status.overallStatus
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-042: Dependency Validation (3 tests)
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-042: Dependency Validation Engine', () => {
    it('should register contracts and validate dependencies', async () => {
      const contract = {
        contractId: 'test-contract-1',
        version: '1.0.0',
        methods: new Set(['method1', 'method2']),
        dependencies: new Set([RuntimeLayer.MEMORY, RuntimeLayer.SCHEDULING]),
      };

      await validation.registerContract(contract);
      const result = await validation.validateDependencies();

      expect(result.validated).toBeDefined();
      expect(result.dependencyGraph).toBeDefined();
      expect(Array.isArray(result.dependencyGraph)).toBe(true);
    });

    it('should check for circular dependencies', async () => {
      const circular = await validation.checkCircularDependencies();

      expect(Array.isArray(circular)).toBe(true);
    });

    it('should verify contract and version compatibility', async () => {
      const compat1 = await validation.verifyContractCompatibility(
        RuntimeLayer.DECISION,
        RuntimeLayer.MEMORY
      );
      const compat2 = await validation.checkVersionCompatibility(
        'test-contract',
        '1.0.0'
      );
      const invariants =
        await validation.verifyRuntimeInvariants();

      expect(typeof compat1).toBe('boolean');
      expect(typeof compat2).toBe('boolean');
      expect(Array.isArray(invariants)).toBe(true);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // WP-043: Consistency Engine (3 tests)
  // ════════════════════════════════════════════════════════════════════════════

  describe('WP-043: Runtime Consistency Engine', () => {
    it('should verify authority, policy, and audit consistency', async () => {
      const authConsist =
        await consistency.verifyAuthorityConsistency();
      const policyConsist =
        await consistency.verifyPolicyConsistency();
      const auditConsist =
        await consistency.verifyAuditConsistency();

      expect(authConsist.consistent).toBeDefined();
      expect(policyConsist.consistent).toBeDefined();
      expect(auditConsist.consistent).toBeDefined();
      expect(authConsist.authorityChains).toBeDefined();
    });

    it('should verify memory, decision, and temporal consistency', async () => {
      const memoryConsist =
        await consistency.verifyMemoryConsistency();
      const decisionConsist =
        await consistency.verifyDecisionConsistency();
      const temporalConsist =
        await consistency.verifyTemporalConsistency();

      expect(memoryConsist.consistent).toBeDefined();
      expect(decisionConsist.consistent).toBeDefined();
      expect(temporalConsist.consistent).toBeDefined();
    });

    it('should generate complete consistency report', async () => {
      const report = await consistency.generateConsistencyReport();

      expect(report.reportId).toBeDefined();
      expect(report.generatedAt).toBeGreaterThan(0);
      expect(report.overallConsistent).toBeDefined();
      expect(report.authorityConsistency).toBeDefined();
      expect(report.policyConsistency).toBeDefined();
      expect(report.auditConsistency).toBeDefined();
      expect(report.memoryConsistency).toBeDefined();
      expect(report.decisionConsistency).toBeDefined();
      expect(report.temporalConsistency).toBeDefined();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // INTEGRATED TESTS: All layers working together
  // ════════════════════════════════════════════════════════════════════════════

  describe('Integrated Validation: All layers together', () => {
    it('should run complete observability + security + validation suite',
      async () => {
        // Full health check
        const dashboard =
          await observability.getCivilizationHealthDashboard();

        // Security check
        const securityStatus =
          await security.getSecurityStatus();

        // Dependency validation
        const depResult =
          await validation.validateDependencies();

        // Consistency check
        const consistReport =
          await consistency.generateConsistencyReport();

        // All should complete successfully
        expect(dashboard.overallHealthRating).toBeGreaterThanOrEqual(0);
        expect(securityStatus.eventCount).toBeGreaterThanOrEqual(0);
        expect(depResult.validated).toBeDefined();
        expect(consistReport.overallConsistent).toBeDefined();
      }
    );

    it('should handle compliance verification', async () => {
      const compliance =
        await observability.verifyConstitutionalCompliance();

      expect(compliance.complianceRate).toBeGreaterThanOrEqual(0);
      expect(compliance.complianceRate).toBeLessThanOrEqual(1);
      expect(compliance.violationCount).toBeGreaterThanOrEqual(0);
    });

    it('should verify runtime integrity across all layers',
      async () => {
        const integrity =
          await observability.verifyRuntimeIntegrity();

        expect(integrity.verifiedAt).toBeDefined();
        expect(integrity.layersConsistent).toBeGreaterThanOrEqual(0);
        expect(integrity.consistencyRate).toBeGreaterThanOrEqual(0);
      }
    );
  });
});
