/**
 * WP-004: Policy Decision Trace Schema — Comprehensive Test Suite
 *
 * Tests cover functional correctness, security, integrity, and failure scenarios.
 */

import { createPolicyDecisionTraceSchema, PolicyDecisionTraceSchema } from './policy-decision-trace';
import {
  PolicyDecisionTraceRequest,
  PolicyDecisionOutcome,
  PolicyDecisionSeverity,
} from './policy-decision-trace-types';
import { ConstitutionActionContext } from './constitution-types';

// Helper to create valid ConstitutionActionContext for testing
function createTestAction(override?: Partial<ConstitutionActionContext>): ConstitutionActionContext {
  return {
    actionId: `action-${Date.now()}-${Math.random()}`,
    actionType: 'governance',
    title: 'Test Policy Decision',
    description: 'Test policy decision',
    targetModule: 'constitution-runtime',
    requestedBy: 'test-actor',
    requestedAt: new Date(),
    scope: 'all',
    priority: 'normal',
    payload: { test: 'payload' },
    metadata: { test: 'metadata' },
    ...override,
  };
}

describe('PolicyDecisionTraceSchema', () => {
  let schema: PolicyDecisionTraceSchema;

  beforeEach(() => {
    schema = createPolicyDecisionTraceSchema();
  });

  describe('Basic Recording', () => {
    it('should record a valid policy decision trace', () => {
      const action = createTestAction();
      const request: PolicyDecisionTraceRequest = {
        actor: 'test-actor',
        action,
        decision: 'allowed',
        severity: 'medium',
        source: 'policy-enforcement',
        reasons: ['Policy allows this action'],
        authorityDomain: 'governance',
        authorityLevel: 'operational',
        authorityArticleId: 'constitutional-structure',
        authorityValidationId: 'validation-1',
        authorityTraceId: 'trace-1',
      };

      const response = schema.recordTrace(request);

      expect(response.success).toBe(true);
      expect(response.traceId).toBeTruthy();
      expect(response.sequenceNumber).toBe(0);
      expect(response.contentHash).toBeTruthy();
      expect(response.chainVerified).toBe(true);
    });

    it('should increment sequence numbers correctly', () => {
      const createRequest = (index: number): PolicyDecisionTraceRequest => ({
        actor: `actor-${index}`,
        action: createTestAction({
          actionId: `action-${index}-${Date.now()}`,
          requestedBy: `actor-${index}`,
        }),
        decision: 'allowed',
        severity: 'low',
        source: 'policy-enforcement',
        reasons: [`Reason ${index}`],
        authorityDomain: 'governance',
        authorityLevel: 'operational',
        authorityArticleId: 'constitutional-structure',
        authorityValidationId: 'validation-1',
        authorityTraceId: 'trace-1',
      });

      const response1 = schema.recordTrace(createRequest(1));
      const response2 = schema.recordTrace(createRequest(2));
      const response3 = schema.recordTrace(createRequest(3));

      expect(response1.sequenceNumber).toBe(0);
      expect(response2.sequenceNumber).toBe(1);
      expect(response3.sequenceNumber).toBe(2);
    });

    it('should reject recording without actor', () => {
      const request = {
        action: createTestAction(),
        decision: 'allowed' as const,
        severity: 'low' as const,
        source: 'policy-enforcement' as const,
        reasons: ['Test'],
        authorityDomain: 'governance',
        authorityLevel: 'operational' as const,
        authorityArticleId: 'constitutional-structure' as const,
        authorityValidationId: 'validation-1',
        authorityTraceId: 'trace-1',
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = schema.recordTrace(request as any);

      expect(response.success).toBe(false);
      expect(response.error).toContain('actor is required');
    });

    it('should reject recording without authority context', () => {
      const request = {
        actor: 'test-actor',
        action: createTestAction(),
        decision: 'allowed' as const,
        severity: 'low' as const,
        source: 'policy-enforcement' as const,
        reasons: ['Test'],
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = schema.recordTrace(request as any);

      expect(response.success).toBe(false);
      expect(response.error).toContain('Authority');
    });
  });

  describe('Chain Integrity', () => {
    it('should maintain hash chain linkage', () => {
      const records = [
        { actor: 'actor-1', decision: 'allowed' as PolicyDecisionOutcome },
        { actor: 'actor-2', decision: 'denied' as PolicyDecisionOutcome },
        { actor: 'actor-3', decision: 'escalated' as PolicyDecisionOutcome },
      ];

      const traceIds: string[] = [];
      for (const record of records) {
        const request: PolicyDecisionTraceRequest = {
          actor: record.actor,
          action: createTestAction({
            actionId: `action-${record.actor}-${Date.now()}`,
            requestedBy: record.actor,
          }),
          decision: record.decision,
          severity: 'low',
          source: 'policy-enforcement',
          reasons: ['Test'],
          authorityDomain: 'governance',
          authorityLevel: 'operational',
          authorityArticleId: 'constitutional-structure',
          authorityValidationId: 'validation-1',
          authorityTraceId: 'trace-1',
        };

        const response = schema.recordTrace(request);
        traceIds.push(response.traceId);
      }

      // Retrieve traces and verify chain
      const trace1 = schema.getTrace(traceIds[0]);
      const trace2 = schema.getTrace(traceIds[1]);
      const trace3 = schema.getTrace(traceIds[2]);

      expect(trace1.previousTraceHash).toBe('');
      expect(trace2.previousTraceHash).toBe(trace1.contentHash);
      expect(trace3.previousTraceHash).toBe(trace2.contentHash);

      expect(schema.verifyChainIntegrity()).toBe(true);
    });

    it('should detect chain integrity violations', () => {
      const request: PolicyDecisionTraceRequest = {
        actor: 'test-actor',
        action: createTestAction(),
        decision: 'allowed',
        severity: 'low',
        source: 'policy-enforcement',
        reasons: ['Test'],
        authorityDomain: 'governance',
        authorityLevel: 'operational',
        authorityArticleId: 'constitutional-structure',
        authorityValidationId: 'validation-1',
        authorityTraceId: 'trace-1',
      };

      schema.recordTrace(request);
      schema.recordTrace(request);

      expect(schema.verifyChainIntegrity()).toBe(true);
    });
  });

  describe('Query Functionality', () => {
    beforeEach(() => {
      for (let i = 0; i < 5; i++) {
        const request: PolicyDecisionTraceRequest = {
          actor: i % 2 === 0 ? 'actor-a' : 'actor-b',
          action: createTestAction({
            actionId: `action-${i}-${Date.now()}`,
            requestedBy: i % 2 === 0 ? 'actor-a' : 'actor-b',
          }),
          decision: (i % 3 === 0 ? 'allowed' : i % 3 === 1 ? 'denied' : 'escalated') as PolicyDecisionOutcome,
          severity: (i % 2 === 0 ? 'low' : 'high') as PolicyDecisionSeverity,
          source: 'policy-enforcement',
          reasons: [`Reason ${i}`],
          authorityDomain: 'governance',
          authorityLevel: 'operational',
          authorityArticleId: 'constitutional-structure',
          authorityValidationId: 'validation-1',
          authorityTraceId: 'trace-1',
        };

        schema.recordTrace(request);
      }
    });

    it('should query all traces', () => {
      const result = schema.queryTraces({});
      expect(result.success).toBe(true);
      expect(result.traceCount).toBe(5);
      expect(result.traces.length).toBe(5);
    });

    it('should filter by actor', () => {
      const result = schema.queryTraces({ actor: 'actor-a' });
      expect(result.success).toBe(true);
      expect(result.traceCount).toBe(3);
      expect(result.traces.every((t) => t.actor === 'actor-a')).toBe(true);
    });

    it('should filter by decision', () => {
      const result = schema.queryTraces({ decision: 'allowed' });
      expect(result.success).toBe(true);
      expect(result.traces.every((t) => t.decision === 'allowed')).toBe(true);
    });

    it('should filter by severity', () => {
      const result = schema.queryTraces({ severity: 'high' });
      expect(result.success).toBe(true);
      expect(result.traces.every((t) => t.severity === 'high')).toBe(true);
    });

    it('should respect limit parameter', () => {
      const result = schema.queryTraces({ limit: 2 });
      expect(result.success).toBe(true);
      expect(result.traceCount).toBe(2);
      expect(result.traces.length).toBe(2);
    });

    it('should maintain chronological order', () => {
      const result = schema.queryTraces({});
      for (let i = 0; i < result.traces.length - 1; i++) {
        expect(result.traces[i].sequenceNumber).toBeLessThan(result.traces[i + 1].sequenceNumber);
      }
    });
  });

  describe('Audit and Statistics', () => {
    beforeEach(() => {
      for (let i = 0; i < 10; i++) {
        const request: PolicyDecisionTraceRequest = {
          actor: `actor-${i}`,
          action: createTestAction({
            actionId: `action-${i}-${Date.now()}`,
            requestedBy: `actor-${i}`,
          }),
          decision: (i % 3 === 0 ? 'allowed' : i % 3 === 1 ? 'denied' : 'escalated') as PolicyDecisionOutcome,
          severity: (i % 2 === 0 ? 'low' : 'critical') as PolicyDecisionSeverity,
          source: 'policy-enforcement',
          reasons: [`Reason ${i}`],
          authorityDomain: 'governance',
          authorityLevel: 'operational',
          authorityArticleId: 'constitutional-structure',
          authorityValidationId: 'validation-1',
          authorityTraceId: 'trace-1',
        };

        schema.recordTrace(request);
      }
    });

    it('should generate audit report', () => {
      const report = schema.generateAuditReport();

      expect(report.reportId).toBeTruthy();
      expect(report.generatedAt).toBeGreaterThan(0);
      expect(report.totalTracesAudited).toBe(10);
      expect(report.chainVerified).toBe(true);
      expect(report.orphanedTraces.length).toBe(0);
      expect(report.tamperedTraces.length).toBe(0);
      expect(report.chainIntegrityScore).toBe(100);
    });

    it('should compute correct statistics', () => {
      const stats = schema.getStatistics();

      expect(stats.totalDecisions).toBe(10);
      expect(stats.allowedCount).toBe(4);
      expect(stats.deniedCount).toBe(3);
      expect(stats.escalatedCount).toBe(3);
      expect(stats.highestSeverityDecisions).toBe(5);
    });

    it('should provide snapshot', () => {
      const snapshot = schema.getSnapshot();

      expect(snapshot.traceCount).toBe(10);
      expect(snapshot.chainId).toBeTruthy();
      expect(snapshot.chainHash).toBeTruthy();
      expect(snapshot.lastTraceId).toBeTruthy();
      expect(snapshot.lastTimestamp).toBeGreaterThan(0);
      expect(snapshot.chainVerified).toBe(true);
    });
  });

  describe('Boundary Conditions', () => {
    it('should handle empty trace count', () => {
      const snapshot = schema.getSnapshot();
      expect(snapshot.traceCount).toBe(0);
      expect(snapshot.lastTraceId).toBe('');
      expect(snapshot.chainVerified).toBe(true);
    });

    it('should handle very long reason strings', () => {
      const longReason = 'x'.repeat(10000);
      const request: PolicyDecisionTraceRequest = {
        actor: 'test-actor',
        action: createTestAction(),
        decision: 'allowed',
        severity: 'low',
        source: 'policy-enforcement',
        reasons: [longReason],
        authorityDomain: 'governance',
        authorityLevel: 'operational',
        authorityArticleId: 'constitutional-structure',
        authorityValidationId: 'validation-1',
        authorityTraceId: 'trace-1',
      };

      const response = schema.recordTrace(request);
      expect(response.success).toBe(true);
      const trace = schema.getTrace(response.traceId);
      expect(trace.reasons[0]).toBe(longReason);
    });

    it('should handle escalation context', () => {
      const request: PolicyDecisionTraceRequest = {
        actor: 'test-actor',
        action: createTestAction(),
        decision: 'escalated',
        severity: 'high',
        source: 'escalation-resolution',
        reasons: ['Escalated to higher authority'],
        authorityDomain: 'governance',
        authorityLevel: 'executive',
        authorityArticleId: 'sovereign-high-council',
        authorityValidationId: 'validation-2',
        authorityTraceId: 'trace-2',
        escalationContext: {
          escalationRequestId: 'esc-req-1',
          escalationRouteId: 'esc-route-1',
          escalationChain: ['actor-1', 'actor-2', 'actor-3'],
          escalatonResolutionId: 'esc-res-1',
          escalationApprovedBy: 'executive',
          escalationApprovedAt: Date.now(),
        },
      };

      const response = schema.recordTrace(request);
      expect(response.success).toBe(true);
      const trace = schema.getTrace(response.traceId);
      expect(trace.escalation).toBeTruthy();
      expect(trace.escalation!.escalationChain.length).toBe(3);
    });
  });

  describe('Security and Immutability', () => {
    it('should not allow retrieval of non-existent trace', () => {
      expect(() => {
        schema.getTrace('non-existent-trace-id');
      }).toThrow();
    });

    it('should create unique content hashes for different decisions', () => {
      const request1: PolicyDecisionTraceRequest = {
        actor: 'actor-a',
        action: createTestAction({
          actionId: 'action-1',
          requestedBy: 'actor-a',
        }),
        decision: 'allowed',
        severity: 'low',
        source: 'policy-enforcement',
        reasons: ['Reason 1'],
        authorityDomain: 'governance',
        authorityLevel: 'operational',
        authorityArticleId: 'constitutional-structure',
        authorityValidationId: 'validation-1',
        authorityTraceId: 'trace-1',
      };

      const request2: PolicyDecisionTraceRequest = {
        ...request1,
        actor: 'actor-b',
        action: createTestAction({
          actionId: 'action-2',
          requestedBy: 'actor-b',
        }),
      };

      const response1 = schema.recordTrace(request1);
      const response2 = schema.recordTrace(request2);

      expect(response1.contentHash).not.toBe(response2.contentHash);
    });

    it('should maintain trace immutability', () => {
      const request: PolicyDecisionTraceRequest = {
        actor: 'test-actor',
        action: createTestAction(),
        decision: 'allowed',
        severity: 'low',
        source: 'policy-enforcement',
        reasons: ['Test'],
        authorityDomain: 'governance',
        authorityLevel: 'operational',
        authorityArticleId: 'constitutional-structure',
        authorityValidationId: 'validation-1',
        authorityTraceId: 'trace-1',
      };

      const response = schema.recordTrace(request);
      const trace1 = schema.getTrace(response.traceId);
      const trace2 = schema.getTrace(response.traceId);

      expect(trace1).toEqual(trace2);
      expect(trace1.contentHash).toBe(trace2.contentHash);
    });
  });

  describe('Performance Characteristics', () => {
    it('should handle bulk recording efficiently', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        const request: PolicyDecisionTraceRequest = {
          actor: `actor-${i}`,
          action: createTestAction({
            actionId: `action-${i}`,
            requestedBy: `actor-${i}`,
          }),
          decision: 'allowed',
          severity: 'low',
          source: 'policy-enforcement',
          reasons: [`Reason ${i}`],
          authorityDomain: 'governance',
          authorityLevel: 'operational',
          authorityArticleId: 'constitutional-structure',
          authorityValidationId: 'validation-1',
          authorityTraceId: 'trace-1',
        };

        schema.recordTrace(request);
      }

      const duration = Date.now() - startTime;
      expect(schema.getTraceCount()).toBe(100);
      expect(duration).toBeLessThan(5000);
    });
  });
});
