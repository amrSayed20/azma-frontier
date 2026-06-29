/**
 * WP-012: Decision Layer Tests
 * Comprehensive test suite for Layer 5 policy evaluation
 *
 * Test coverage:
 * - PolicyEvaluationService: registration, evaluation, retrieval
 * - Default verdict (APPROVED when no policy matches)
 * - First-match policy ordering
 * - Duplicate policy rejection
 * - Policy factories: critical, high-priority, article-mismatch
 * - createDecisionLayer: kernel contract and service wiring
 * - Integration: evaluate after full scheduling pipeline
 * - Determinism: identical inputs produce identical verdicts
 * - Error handling: unknown evaluationId, duplicate registration
 */

import {
  PolicyEvaluationService,
  createDecisionLayer,
  createCriticalRejectionPolicy,
  createHighPriorityApprovalPolicy,
  createArticleMismatchRejectionPolicy,
} from './wp-012-kernel';
import {
  RequestPriority,
  createAuditTrailId,
} from './wp-008-types';
import type { SchedulingDecision } from './wp-008-types';

// ============================================================================
// Helpers
// ============================================================================

function makeDecision(
  requestId: string,
  priority: RequestPriority = RequestPriority.NORMAL,
  articleId: import('./constitution-types').ConstitutionArticleId = 'constitutional-structure',
): SchedulingDecision {
  return {
    decisionId: `dec-${requestId}`,
    requestId,
    priority,
    scheduledTime: new Date(),
    decisionTrace: {
      decision: 'scheduled',
      reasoning: ['priority assigned', 'queue slot found'],
      timestamp: new Date(),
    },
    constitutionArticleId: articleId,
    auditTrailId: createAuditTrailId(`audit-${requestId}`),
  };
}

// ============================================================================
// PolicyEvaluationService
// ============================================================================

describe('PolicyEvaluationService', () => {
  let svc: PolicyEvaluationService;

  beforeEach(() => {
    svc = new PolicyEvaluationService();
  });

  test('serviceName and version are correct', () => {
    expect(svc.serviceName).toBe('PolicyEvaluationService');
    expect(svc.version).toBe('1.0.0');
  });

  test('default verdict is APPROVED when no policies registered', async () => {
    const decision = makeDecision('req-default');
    const result = await svc.evaluate(decision);
    expect(result.verdict).toBe('APPROVED');
    expect(result.matchedPolicyId).toBeNull();
    expect(result.requestId).toBe('req-default');
  });

  test('default APPROVED rationale mentions constitutional default', async () => {
    const result = await svc.evaluate(makeDecision('req-no-policy'));
    expect(result.rationale).toContain('Constitutional default');
  });

  test('registers a policy successfully', async () => {
    const policy = createHighPriorityApprovalPolicy('constitutional-structure');
    await svc.registerPolicy(policy);
    const policies = await svc.getPolicies();
    expect(policies.length).toBe(1);
    expect(policies[0]!.policyId).toBe('high-priority-auto-approval');
  });

  test('rejects duplicate policyId', async () => {
    const policy = createHighPriorityApprovalPolicy('constitutional-structure');
    await svc.registerPolicy(policy);
    await expect(svc.registerPolicy(policy)).rejects.toThrow('already registered');
  });

  test('evaluates CRITICAL decision → ESCALATED via factory policy', async () => {
    await svc.registerPolicy(createCriticalRejectionPolicy('constitutional-structure'));
    const result = await svc.evaluate(makeDecision('req-critical', RequestPriority.CRITICAL));
    expect(result.verdict).toBe('ESCALATED');
    expect(result.matchedPolicyId).toBe('critical-rejection-safety');
  });

  test('evaluates HIGH decision → APPROVED via factory policy', async () => {
    await svc.registerPolicy(createHighPriorityApprovalPolicy('constitutional-structure'));
    const result = await svc.evaluate(makeDecision('req-high', RequestPriority.HIGH));
    expect(result.verdict).toBe('APPROVED');
    expect(result.matchedPolicyId).toBe('high-priority-auto-approval');
  });

  test('evaluates NORMAL decision → default APPROVED (no matching policy)', async () => {
    await svc.registerPolicy(createCriticalRejectionPolicy('constitutional-structure'));
    await svc.registerPolicy(createHighPriorityApprovalPolicy('constitutional-structure'));
    const result = await svc.evaluate(makeDecision('req-normal', RequestPriority.NORMAL));
    expect(result.verdict).toBe('APPROVED');
    expect(result.matchedPolicyId).toBeNull();
  });

  test('article-mismatch policy REJECTs decision with wrong article', async () => {
    await svc.registerPolicy(
      createArticleMismatchRejectionPolicy('sovereign-high-council', 'constitutional-structure'),
    );
    // Decision has article 'constitutional-structure' which ≠ required 'sovereign-high-council'
    const result = await svc.evaluate(makeDecision('req-mismatch', RequestPriority.NORMAL, 'constitutional-structure'));
    expect(result.verdict).toBe('REJECTED');
    expect(result.matchedPolicyId).toContain('article-mismatch');
  });

  test('article-mismatch policy passes through matching article', async () => {
    await svc.registerPolicy(
      createArticleMismatchRejectionPolicy('sovereign-high-council', 'constitutional-structure'),
    );
    // Decision governs the correct article — policy criterion does NOT match → falls through
    const result = await svc.evaluate(makeDecision('req-match', RequestPriority.NORMAL, 'sovereign-high-council'));
    expect(result.verdict).toBe('APPROVED');
  });

  test('first matching policy wins (registration order matters)', async () => {
    // Register ESCALATED policy first, APPROVED second — for CRITICAL requests
    await svc.registerPolicy(createCriticalRejectionPolicy('constitutional-structure'));     // ESCALATED
    await svc.registerPolicy(createHighPriorityApprovalPolicy('constitutional-structure')); // APPROVED (doesn't match CRITICAL)

    const result = await svc.evaluate(makeDecision('req-order', RequestPriority.CRITICAL));
    expect(result.verdict).toBe('ESCALATED');
    expect(result.matchedPolicyId).toBe('critical-rejection-safety');
  });

  test('getPolicies returns policies in registration order', async () => {
    await svc.registerPolicy(createCriticalRejectionPolicy('constitutional-structure'));
    await svc.registerPolicy(createHighPriorityApprovalPolicy('constitutional-structure'));
    const policies = await svc.getPolicies();
    expect(policies[0]!.policyId).toBe('critical-rejection-safety');
    expect(policies[1]!.policyId).toBe('high-priority-auto-approval');
  });

  test('getPolicies returns an independent copy (mutation safe)', async () => {
    await svc.registerPolicy(createHighPriorityApprovalPolicy('constitutional-structure'));
    const policies = await svc.getPolicies();
    // Mutating the copy must not affect the service
    (policies as unknown as EvaluationPolicy[]).push({} as EvaluationPolicy);
    const policies2 = await svc.getPolicies();
    expect(policies2.length).toBe(1);
  });

  test('getResult returns a previously computed evaluation', async () => {
    const result = await svc.evaluate(makeDecision('req-recall'));
    const recalled = await svc.getResult(result.evaluationId);
    expect(recalled).not.toBeNull();
    expect(recalled!.evaluationId).toBe(result.evaluationId);
    expect(recalled!.requestId).toBe('req-recall');
  });

  test('getResult returns null for unknown evaluationId', async () => {
    const recalled = await svc.getResult('ghost-eval-id');
    expect(recalled).toBeNull();
  });

  test('each evaluation gets a unique evaluationId', async () => {
    const r1 = await svc.evaluate(makeDecision('reqA'));
    const r2 = await svc.evaluate(makeDecision('reqB'));
    expect(r1.evaluationId).not.toBe(r2.evaluationId);
  });

  test('evaluation result includes auditTrailId', async () => {
    const result = await svc.evaluate(makeDecision('req-audit'));
    expect(typeof result.auditTrailId).toBe('string');
    expect(result.auditTrailId.length).toBeGreaterThan(0);
  });

  test('evaluation result includes constitutionArticleId', async () => {
    const result = await svc.evaluate(makeDecision('req-article', RequestPriority.NORMAL, 'sovereign-high-council'));
    expect(typeof result.constitutionArticleId).toBe('string');
  });

  test('determinism: same decision + same policies → same verdict on 3 runs', async () => {
    const runEval = async () => {
      const s = new PolicyEvaluationService();
      await s.registerPolicy(createCriticalRejectionPolicy('constitutional-structure'));
      await s.registerPolicy(createHighPriorityApprovalPolicy('constitutional-structure'));
      const r = await s.evaluate(makeDecision('det-req', RequestPriority.HIGH));
      return r.verdict;
    };

    const [v1, v2, v3] = await Promise.all([runEval(), runEval(), runEval()]);
    expect(v1).toBe('APPROVED');
    expect(v2).toBe('APPROVED');
    expect(v3).toBe('APPROVED');
  });
});

// ============================================================================
// createDecisionLayer / DecisionLayerContract
// ============================================================================

describe('createDecisionLayer (DecisionLayerContract)', () => {
  test('returns correct layer metadata', () => {
    const layer = createDecisionLayer();
    expect(layer.layerName).toBe('DecisionLayer');
    expect(layer.version).toBe('1.0.0');
    expect(layer.layerNumber).toBe(5);
  });

  test('exposes policyEvaluationService with correct contract fields', () => {
    const { policyEvaluationService: svc } = createDecisionLayer();
    expect(svc.serviceName).toBe('PolicyEvaluationService');
    expect(svc.version).toBe('1.0.0');
    expect(typeof svc.registerPolicy).toBe('function');
    expect(typeof svc.getPolicies).toBe('function');
    expect(typeof svc.evaluate).toBe('function');
    expect(typeof svc.getResult).toBe('function');
  });

  test('each createDecisionLayer call returns independent instances', async () => {
    const layer1 = createDecisionLayer();
    const layer2 = createDecisionLayer();

    await layer1.policyEvaluationService.registerPolicy(
      createCriticalRejectionPolicy('constitutional-structure'),
    );

    const layer2Policies = await layer2.policyEvaluationService.getPolicies();
    expect(layer2Policies.length).toBe(0); // no data leak between instances
  });
});

// ============================================================================
// Integration: Decision Layer consuming Layer 3 (Scheduling) output
// ============================================================================

describe('Decision Layer Integration (Layer 5 ← Layer 3)', () => {
  test('full pipeline: scheduling decision fed into policy evaluation', async () => {
    const layer = createDecisionLayer();
    const { policyEvaluationService: svc } = layer;

    await svc.registerPolicy(createCriticalRejectionPolicy('constitutional-structure'));
    await svc.registerPolicy(createHighPriorityApprovalPolicy('constitutional-structure'));

    const criticalDecision = makeDecision('critical-req', RequestPriority.CRITICAL);
    const highDecision = makeDecision('high-req', RequestPriority.HIGH);
    const normalDecision = makeDecision('normal-req', RequestPriority.NORMAL);

    const [crit, high, norm] = await Promise.all([
      svc.evaluate(criticalDecision),
      svc.evaluate(highDecision),
      svc.evaluate(normalDecision),
    ]);

    expect(crit.verdict).toBe('ESCALATED');
    expect(high.verdict).toBe('APPROVED');
    expect(norm.verdict).toBe('APPROVED');
    expect(norm.matchedPolicyId).toBeNull(); // fell through to default
  });

  test('high-volume: 100 evaluations all deterministic', async () => {
    const svc = new PolicyEvaluationService();
    await svc.registerPolicy(createHighPriorityApprovalPolicy('constitutional-structure'));

    const decisions = Array.from({ length: 100 }, (_, i) =>
      makeDecision(`bulk-req-${i}`, RequestPriority.HIGH),
    );

    const results = await Promise.all(decisions.map(d => svc.evaluate(d)));
    const allApproved = results.every(r => r.verdict === 'APPROVED');
    const uniqueIds = new Set(results.map(r => r.evaluationId));

    expect(allApproved).toBe(true);
    expect(uniqueIds.size).toBe(100); // all evaluation IDs unique
  });
});

// Type import needed for the mutation-safe test
import type { EvaluationPolicy } from './wp-012-types';
