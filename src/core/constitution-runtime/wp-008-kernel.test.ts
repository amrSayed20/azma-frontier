/**
 * WP-008: Scheduling Kernel Tests
 * Comprehensive test suite for Layer 3 scheduling services
 * 
 * Test coverage:
 * - RequestQueueService (enqueue, dequeue, statistics, determinism)
 * - PriorityAssignmentService (policy registration, priority assignment)
 * - SchedulingDecisionService (decision making, audit recording)
 * - Integration tests (full scheduling pipeline)
 * - Error handling and edge cases
 */

import {
  RequestQueueService,
  PriorityAssignmentService,
  SchedulingDecisionService,
  createCriticalPriorityPolicy,
  createHighPriorityPolicy,
  createNormalPriorityPolicy,
  createLowPriorityPolicy,
  RequestPriority as Priority,
  createAuditTrailId,
} from './wp-008-kernel';
import type { SchedulingRequest } from './wp-008-types';

/**
 * Helper: Create a test request
 */
function createTestRequest(
  id: string,
  priority: Priority = Priority.NORMAL,
  metadata: Record<string, unknown> = {}
): SchedulingRequest {
  return {
    requestId: id,
    priority,
    constitutionArticleId: 'constitutional-structure',
    enqueuedAt: new Date(),
    expiresAt: new Date(Date.now() + 60000), // 1 minute from now
    requestMetadata: metadata,
  };
}

// ============================================================================
// RequestQueueService Tests
// ============================================================================

describe('RequestQueueService', () => {
  let service: RequestQueueService;

  beforeEach(() => {
    service = new RequestQueueService();
  });

  test('should enqueue a single request', async () => {
    const req = createTestRequest('req-1', Priority.NORMAL);
    const result = await service.enqueue(req);

    expect(result.success).toBe(true);
    expect(result.decisionId).toContain('sched-1-req-1');
  });

  test('should enqueue multiple requests', async () => {
    const req1 = createTestRequest('req-1', Priority.NORMAL);
    const req2 = createTestRequest('req-2', Priority.HIGH);
    const req3 = createTestRequest('req-3', Priority.LOW);

    await service.enqueue(req1);
    await service.enqueue(req2);
    await service.enqueue(req3);

    const stats = await service.getStatistics();
    expect(stats.totalEnqueued).toBe(3);
  });

  test('should dequeue in priority order (CRITICAL > HIGH > NORMAL > LOW)', async () => {
    const low = createTestRequest('low', Priority.LOW);
    const normal = createTestRequest('normal', Priority.NORMAL);
    const high = createTestRequest('high', Priority.HIGH);
    const critical = createTestRequest('critical', Priority.CRITICAL);

    // Enqueue in reverse priority order
    await service.enqueue(low);
    await service.enqueue(normal);
    await service.enqueue(high);
    await service.enqueue(critical);

    // Dequeue should return in priority order
    const batch1 = await service.dequeue(1);
    expect(batch1[0]?.requestId).toBe('critical');

    const batch2 = await service.dequeue(1);
    expect(batch2[0]?.requestId).toBe('high');

    const batch3 = await service.dequeue(1);
    expect(batch3[0]?.requestId).toBe('normal');

    const batch4 = await service.dequeue(1);
    expect(batch4[0]?.requestId).toBe('low');
  });

  test('should return empty array when dequeueing from empty queue', async () => {
    const result = await service.dequeue(10);
    expect(result).toEqual([]);
  });

  test('should track queue statistics', async () => {
    const req1 = createTestRequest('req-1', Priority.HIGH);
    const req2 = createTestRequest('req-2', Priority.NORMAL);
    const req3 = createTestRequest('req-3', Priority.LOW);

    await service.enqueue(req1);
    await service.enqueue(req2);
    await service.enqueue(req3);

    const stats = await service.getStatistics();

    expect(stats.totalEnqueued).toBe(3);
    expect(stats.currentQueueLength).toBe(3);
    expect(stats.requestsByPriority.HIGH).toBe(1);
    expect(stats.requestsByPriority.NORMAL).toBe(1);
    expect(stats.requestsByPriority.LOW).toBe(1);
    expect(stats.requestsByPriority.CRITICAL).toBe(0);
  });

  test('should calculate wait time statistics', async () => {
    const req = createTestRequest('req-1', Priority.NORMAL);
    await service.enqueue(req);

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 10));

    await service.dequeue(1);

    const stats = await service.getStatistics();
    expect(stats.averageWaitTimeMs).toBeGreaterThanOrEqual(10);
    expect(stats.p99WaitTimeMs).toBeGreaterThanOrEqual(10);
  });

  test('should reject enqueue when queue is full', async () => {
    // Fill queue to max (10000)
    for (let i = 0; i < 10000; i++) {
      const req = createTestRequest(`req-${i}`, Priority.NORMAL);
      await service.enqueue(req);
    }

    // Next enqueue should fail
    const req = createTestRequest('overflow', Priority.NORMAL);
    await expect(service.enqueue(req)).rejects.toThrow('Queue is full');
  });

  test('should provide deterministic dequeue order', async () => {
    // Same set of requests should dequeue in same order every time
    const req1 = createTestRequest('req-1', Priority.HIGH);
    const req2 = createTestRequest('req-2', Priority.HIGH);
    const req3 = createTestRequest('req-3', Priority.HIGH);

    await service.enqueue(req1);
    await service.enqueue(req2);
    await service.enqueue(req3);

    const batch = await service.dequeue(3);
    expect(batch.map((r) => r.requestId)).toEqual(['req-1', 'req-2', 'req-3']);
  });
});

// ============================================================================
// PriorityAssignmentService Tests
// ============================================================================

describe('PriorityAssignmentService', () => {
  let service: PriorityAssignmentService;

  beforeEach(() => {
    service = new PriorityAssignmentService();
  });

  test('should register a priority policy', async () => {
    const policy = createCriticalPriorityPolicy('constitutional-structure');
    await service.registerPolicy(policy);

    const policies = await service.getPolicies();
    expect(policies.length).toBe(1);
  });

  test('should reject duplicate policy registration', async () => {
    const policy = createCriticalPriorityPolicy('constitutional-structure');
    await service.registerPolicy(policy);

    await expect(service.registerPolicy(policy)).rejects.toThrow('Policy already registered');
  });

  test('should assign CRITICAL priority based on policy', async () => {
    const policy = createCriticalPriorityPolicy('constitutional-structure');
    await service.registerPolicy(policy);

    const req = createTestRequest('req-1', Priority.NORMAL, {
      threatLevel: 'CRITICAL',
    });

    const priority = await service.assignPriority(req);
    expect(priority).toBe(Priority.CRITICAL);
  });

  test('should assign HIGH priority based on policy', async () => {
    const policy = createHighPriorityPolicy('constitutional-structure');
    await service.registerPolicy(policy);

    const req = createTestRequest('req-1', Priority.NORMAL, {
      requestType: 'AGENT',
    });

    const priority = await service.assignPriority(req);
    expect(priority).toBe(Priority.HIGH);
  });

  test('should default to NORMAL when no policy matches', async () => {
    const req = createTestRequest('req-1', Priority.NORMAL, {
      requestType: 'UNKNOWN',
    });

    const priority = await service.assignPriority(req);
    expect(priority).toBe(Priority.NORMAL);
  });

  test('should evaluate policies in registration order', async () => {
    const criticalPolicy = createCriticalPriorityPolicy('constitutional-structure');
    const highPolicy = createHighPriorityPolicy('constitutional-structure');

    await service.registerPolicy(criticalPolicy);
    await service.registerPolicy(highPolicy);

    // Request that matches both policies should get CRITICAL (first registered)
    const req = createTestRequest('req-1', Priority.NORMAL, {
      threatLevel: 'CRITICAL',
      requestType: 'AGENT',
    });

    const priority = await service.assignPriority(req);
    expect(priority).toBe(Priority.CRITICAL);
  });

  test('should handle policies with multiple criteria (AND logic)', async () => {
    const policy = createHighPriorityPolicy('constitutional-structure');
    await service.registerPolicy(policy);

    // Request with only requestType = AGENT matches
    const req1 = createTestRequest('req-1', Priority.NORMAL, {
      requestType: 'AGENT',
    });

    const priority1 = await service.assignPriority(req1);
    expect(priority1).toBe(Priority.HIGH);

    // Request without requestType = AGENT doesn't match
    const req2 = createTestRequest('req-2', Priority.NORMAL, {
      requestType: 'UNKNOWN',
    });

    const priority2 = await service.assignPriority(req2);
    expect(priority2).toBe(Priority.NORMAL);
  });
});

// ============================================================================
// SchedulingDecisionService Tests
// ============================================================================

describe('SchedulingDecisionService', () => {
  let service: SchedulingDecisionService;

  beforeEach(() => {
    service = new SchedulingDecisionService();
  });

  test('should make a scheduling decision for a request', async () => {
    const req = createTestRequest('req-1', Priority.HIGH);
    const decision = await service.makeDecision(req, Priority.HIGH);

    expect(decision.decisionId).toBeDefined();
    expect(decision.requestId).toBe('req-1');
    expect(decision.priority).toBe(Priority.HIGH);
    expect(decision.scheduledTime).toBeDefined();
  });

  test('should retrieve a previously made decision', async () => {
    const req = createTestRequest('req-1', Priority.NORMAL);
    const decision = await service.makeDecision(req, Priority.NORMAL);

    const retrieved = await service.getDecision(decision.decisionId);
    expect(retrieved).toEqual(decision);
  });

  test('should return null for non-existent decision', async () => {
    const retrieved = await service.getDecision('nonexistent-id');
    expect(retrieved).toBeNull();
  });

  test('should have deterministic scheduling delay for each priority', async () => {
    const criticalReq = createTestRequest('critical', Priority.CRITICAL);
    const highReq = createTestRequest('high', Priority.HIGH);
    const normalReq = createTestRequest('normal', Priority.NORMAL);
    const lowReq = createTestRequest('low', Priority.LOW);

    const now = Date.now();
    const criticalDecision = await service.makeDecision(criticalReq, Priority.CRITICAL);
    const highDecision = await service.makeDecision(highReq, Priority.HIGH);
    const normalDecision = await service.makeDecision(normalReq, Priority.NORMAL);
    const lowDecision = await service.makeDecision(lowReq, Priority.LOW);

    // CRITICAL should be scheduled almost immediately
    expect(criticalDecision.scheduledTime.getTime() - now).toBeLessThan(10);

    // HIGH should have ~10ms delay
    expect(highDecision.scheduledTime.getTime() - now).toBeLessThan(50);

    // NORMAL should have ~100ms delay
    expect(normalDecision.scheduledTime.getTime() - now).toBeLessThan(200);

    // LOW should have ~1000ms delay
    expect(lowDecision.scheduledTime.getTime() - now).toBeLessThan(2000);
  });

  test('should record decision to audit trail', async () => {
    const req = createTestRequest('req-1', Priority.NORMAL);
    const decision = await service.makeDecision(req, Priority.NORMAL);

    const auditTrailId = await service.recordDecisionToAuditTrail(decision);
    expect(auditTrailId).toBeDefined();
    expect(auditTrailId).toContain('audit-trail');
  });

  test('should reject audit recording for non-existent decision', async () => {
    const fakeDecision = {
      decisionId: 'nonexistent',
      requestId: 'req-1',
      priority: Priority.NORMAL,
      scheduledTime: new Date(),
      decisionTrace: { decision: 'test', reasoning: [], timestamp: new Date() },
      constitutionArticleId: 'constitutional-structure' as const,
      auditTrailId: createAuditTrailId('audit-1'),
    };

    await expect(service.recordDecisionToAuditTrail(fakeDecision)).rejects.toThrow(
      'Decision not found'
    );
  });

  test('should include constitutional authority in decision trace', async () => {
    const req = createTestRequest('req-1', Priority.NORMAL);
    const decision = await service.makeDecision(req, Priority.NORMAL);

    expect(decision.decisionTrace.reasoning).toContain('Constitutional authority: constitutional-structure');
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Scheduling Kernel Integration', () => {
  let queueService: RequestQueueService;
  let priorityService: PriorityAssignmentService;
  let decisionService: SchedulingDecisionService;

  beforeEach(() => {
    queueService = new RequestQueueService();
    priorityService = new PriorityAssignmentService();
    decisionService = new SchedulingDecisionService();
  });

  test('complete scheduling pipeline: enqueue -> assign priority -> decide -> audit', async () => {
    // Register policies
    await priorityService.registerPolicy(createCriticalPriorityPolicy('constitutional-structure'));
    await priorityService.registerPolicy(createHighPriorityPolicy('constitutional-structure'));
    await priorityService.registerPolicy(createNormalPriorityPolicy('constitutional-structure'));

    // Create and enqueue request
    const req = createTestRequest('req-1', Priority.NORMAL, {
      requestType: 'AGENT',
    });
    const enqueueResult = await queueService.enqueue(req);
    expect(enqueueResult.success).toBe(true);

    // Assign priority
    const assignedPriority = await priorityService.assignPriority(req);
    expect(assignedPriority).toBe(Priority.HIGH); // AGENT gets HIGH priority

    // Make scheduling decision
    const decision = await decisionService.makeDecision(req, assignedPriority);
    expect(decision.decisionId).toBeDefined();

    // Record to audit trail
    const auditTrailId = await decisionService.recordDecisionToAuditTrail(decision);
    expect(auditTrailId).toBeDefined();

    // Verify queue stats
    const stats = await queueService.getStatistics();
    expect(stats.totalEnqueued).toBe(1);
  });

  test('should handle high-volume scheduling correctly', async () => {
    // Register all priority policies
    await priorityService.registerPolicy(createCriticalPriorityPolicy('constitutional-structure'));
    await priorityService.registerPolicy(createHighPriorityPolicy('constitutional-structure'));
    await priorityService.registerPolicy(createNormalPriorityPolicy('constitutional-structure'));
    await priorityService.registerPolicy(createLowPriorityPolicy('constitutional-structure'));

    // Enqueue 1000 requests
    for (let i = 0; i < 1000; i++) {
      const priority = [Priority.CRITICAL, Priority.HIGH, Priority.NORMAL, Priority.LOW][
        i % 4
      ] as Priority;
      const req = createTestRequest(`req-${i}`, priority);
      await queueService.enqueue(req);
    }

    // Dequeue in batches
    const batch1 = await queueService.dequeue(100);
    expect(batch1.length).toBe(100);

    const batch2 = await queueService.dequeue(100);
    expect(batch2.length).toBe(100);

    // Verify stats
    const stats = await queueService.getStatistics();
    expect(stats.totalEnqueued).toBe(1000);
    expect(stats.totalDispatched).toBe(200);
    expect(stats.currentQueueLength).toBe(800);
  });

  test('should maintain determinism across multiple runs', async () => {
    const requests = [
      createTestRequest('req-1', Priority.HIGH),
      createTestRequest('req-2', Priority.NORMAL),
      createTestRequest('req-3', Priority.LOW),
      createTestRequest('req-4', Priority.CRITICAL),
    ];

    // Register policies once
    await priorityService.registerPolicy(createNormalPriorityPolicy('constitutional-structure'));

    // First run: enqueue in specific order
    for (const req of requests) {
      await queueService.enqueue(req);
    }

    const firstRun = await queueService.dequeue(4);

    // Reset and run again
    queueService = new RequestQueueService();
    for (const req of requests) {
      await queueService.enqueue(req);
    }

    const secondRun = await queueService.dequeue(4);

    // Both runs should have same order
    expect(firstRun.map((r) => r.requestId)).toEqual(
      secondRun.map((r) => r.requestId)
    );
  });
});

// ============================================================================
// Error Handling and Edge Cases
// ============================================================================

describe('Error Handling and Edge Cases', () => {
  test('should handle empty policy list', async () => {
    const service = new PriorityAssignmentService();
    const req = createTestRequest('req-1', Priority.NORMAL);

    // Should default to NORMAL
    const priority = await service.assignPriority(req);
    expect(priority).toBe(Priority.NORMAL);
  });

  test('should handle policy with failing criteria function', async () => {
    const service = new PriorityAssignmentService();

    // Policy with failing criteria
    const badPolicy = {
      policyId: 'bad-policy',
      priority: Priority.CRITICAL,
      constitutionArticleId: 'constitutional-structure' as const,
      criteriaFunctions: [
        () => {
          throw new Error('Criteria error');
        },
      ],
      description: 'Policy with error',
    };

    await service.registerPolicy(badPolicy);

    const req = createTestRequest('req-1', Priority.NORMAL);
    const priority = await service.assignPriority(req);

    // Should treat failed criteria as non-matching
    expect(priority).toBe(Priority.NORMAL);
  });

  test('should handle dequeue with count greater than queue size', async () => {
    const service = new RequestQueueService();
    const req1 = createTestRequest('req-1', Priority.NORMAL);
    const req2 = createTestRequest('req-2', Priority.NORMAL);

    await service.enqueue(req1);
    await service.enqueue(req2);

    // Request 100 but only 2 in queue
    const result = await service.dequeue(100);
    expect(result.length).toBe(2);
  });

  test('should handle zero dequeue count', async () => {
    const service = new RequestQueueService();
    const req = createTestRequest('req-1', Priority.NORMAL);
    await service.enqueue(req);

    const result = await service.dequeue(0);
    expect(result.length).toBe(0);
  });
});
