/**
 * WP-008: Layer 3 Adapter
 * Connects WP-007 (Layer 6 admission gate) to WP-008 (Layer 3 scheduling)
 * 
 * LAYER CLASSIFICATION: Layer 3 (Scheduling)
 * KERNEL DEPENDENCIES: Layer 6 (WP-007 admission gate)
 * 
 * Responsibility:
 * - Receive admitted requests from Layer 6
 * - Convert admission gate format to scheduling request format
 * - Integrate with scheduling kernel
 * - Return scheduling decisions back to admission gate
 * 
 * This adapter is the entry point for all requests into Layer 3
 */

import type { SchedulingKernelContract, SchedulingRequest, RequestPriority } from './wp-008-types';
import type { ConstitutionArticleId } from './constitution-types';
import { RequestPriority as Priority } from './wp-008-types';

/**
 * Layer 3 Adapter: Interface between Layer 6 admission gate and Layer 3 scheduling
 * 
 * Receives admitted requests and schedules them
 */
export class Layer3Adapter {
  private kernel: SchedulingKernelContract;

  constructor(kernel: SchedulingKernelContract) {
    if (kernel.layerNumber !== 3) {
      throw new Error(`Layer3Adapter requires Layer 3 kernel, got Layer ${kernel.layerNumber}`);
    }
    this.kernel = kernel;
  }

  /**
   * Receive an admitted request from Layer 6
   * 
   * Processing pipeline:
   * 1. Convert admission format to scheduling request
   * 2. Enqueue in request queue
   * 3. Assign priority
   * 4. Make scheduling decision
   * 5. Record to audit trail
   * 6. Return decision
   */
  async processAdmittedRequest(admittedRequest: {
    readonly requestId: string;
    readonly constitutionArticleId: ConstitutionArticleId;
    readonly requestMetadata: Readonly<Record<string, unknown>>;
  }): Promise<{
    readonly success: boolean;
    readonly decisionId: string;
    readonly scheduledTime: Date;
  }> {
    // Step 1: Convert to scheduling request
    const schedulingRequest: SchedulingRequest = {
      requestId: admittedRequest.requestId,
      priority: Priority.NORMAL, // Will be assigned in step 3
      constitutionArticleId: admittedRequest.constitutionArticleId,
      enqueuedAt: new Date(),
      expiresAt: new Date(Date.now() + 60000), // 1 minute TTL
      requestMetadata: admittedRequest.requestMetadata,
    };

    // Step 2: Enqueue request
    const enqueueResult = await this.kernel.requestQueueService.enqueue(schedulingRequest);
    if (!enqueueResult.success) {
      throw new Error(`Failed to enqueue request: ${admittedRequest.requestId}`);
    }

    // Step 3: Assign priority
    const assignedPriority = await this.kernel.priorityAssignmentService.assignPriority(
      schedulingRequest
    );

    // Step 4: Make scheduling decision
    const decision = await this.kernel.schedulingDecisionService.makeDecision(
      schedulingRequest,
      assignedPriority
    );

    // Step 5: Record to audit trail
    const auditTrailId = await this.kernel.schedulingDecisionService.recordDecisionToAuditTrail(
      decision
    );

    if (!auditTrailId) {
      throw new Error(`Failed to record decision to audit trail: ${decision.decisionId}`);
    }

    // Step 6: Return decision
    return {
      success: true,
      decisionId: decision.decisionId,
      scheduledTime: decision.scheduledTime,
    };
  }

  /**
   * Retrieve next batch of scheduled requests for dispatch
   * 
   * This is called by Layer 4 (Memory layer) to get next requests to execute
   */
  async getNextScheduledRequests(count: number): Promise<
    readonly {
      readonly requestId: string;
      readonly priority: RequestPriority;
      readonly scheduledTime: Date;
    }[]
  > {
    const requests = await this.kernel.requestQueueService.dequeue(count);
    return requests.map((req) => ({
      requestId: req.requestId,
      priority: req.priority,
      scheduledTime: new Date(Date.now() + 100), // Simplified - should use decision time
    }));
  }

  /**
   * Get queue health statistics
   * Exposed for observability (Layer 8)
   */
  async getQueueHealth(): Promise<{
    readonly queueLength: number;
    readonly totalEnqueued: number;
    readonly totalDispatched: number;
    readonly averageWaitTimeMs: number;
  }> {
    const stats = await this.kernel.requestQueueService.getStatistics();
    return {
      queueLength: stats.currentQueueLength,
      totalEnqueued: stats.totalEnqueued,
      totalDispatched: stats.totalDispatched,
      averageWaitTimeMs: stats.averageWaitTimeMs,
    };
  }
}

/**
 * Export factory for creating Layer 3 adapter
 * Used by orchestration layer
 */
export function createLayer3Adapter(kernel: SchedulingKernelContract): Layer3Adapter {
  return new Layer3Adapter(kernel);
}
