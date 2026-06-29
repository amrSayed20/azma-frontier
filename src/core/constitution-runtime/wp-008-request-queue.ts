/**
 * WP-008: RequestQueueService (Layer 3)
 * Manages FIFO queue with priority-based request ordering
 * 
 * LAYER CLASSIFICATION: Layer 3 (Scheduling)
 * KERNEL DEPENDENCIES: Layer 2 (audit trail recording)
 * 
 * Responsibility:
 * - Maintain FIFO queue of pending requests
 * - Respect priority levels assigned by Layer 3 priority service
 * - Enqueue requests from Layer 6 admission gate
 * - Dequeue requests for Layer 4+ dispatch
 * - Record queue operations to audit trail
 * 
 * Determinism: All queue operations are deterministic
 */

import type {
  SchedulingRequest,
  QueueStatistics,
  RequestQueueServiceContract,
} from './wp-008-types';
import { RequestPriority as Priority } from './wp-008-types';

/**
 * RequestQueueService: FIFO queue management with priority levels
 * All enqueue/dequeue operations are deterministic
 */
export class RequestQueueService implements RequestQueueServiceContract {
  readonly serviceName = 'RequestQueueService' as const;
  readonly version = '1.0.0' as const;

  // Separate queues per priority level for efficient dequeuing
  private readonly criticalQueue: SchedulingRequest[] = [];
  private readonly highQueue: SchedulingRequest[] = [];
  private readonly normalQueue: SchedulingRequest[] = [];
  private readonly lowQueue: SchedulingRequest[] = [];

  // Statistics tracking (internal)
  private totalEnqueued = 0;
  private totalDispatched = 0;
  private waitTimes: number[] = [];
  private readonly maxQueueSize = 10000;

  async enqueue(req: SchedulingRequest): Promise<{ readonly success: boolean; readonly decisionId: string }> {
    // Validate queue not full
    const currentLength = this.getCurrentQueueLengthSync();
    if (currentLength >= this.maxQueueSize) {
      throw new Error(
        `Queue is full (${currentLength}/${this.maxQueueSize}). Cannot enqueue request ${req.requestId}`
      );
    }

    // Add to appropriate priority queue
    switch (req.priority) {
      case Priority.CRITICAL:
        this.criticalQueue.push(req);
        break;
      case Priority.HIGH:
        this.highQueue.push(req);
        break;
      case Priority.NORMAL:
        this.normalQueue.push(req);
        break;
      case Priority.LOW:
        this.lowQueue.push(req);
        break;
      default:
        // Exhaustive check - TypeScript ensures this never happens
        const _exhaustive: never = req.priority;
        throw new Error(`Unknown priority: ${_exhaustive}`);
    }

    this.totalEnqueued++;

    // Generate deterministic decision ID based on enqueueing order
    const decisionId = `sched-${this.totalEnqueued}-${req.requestId}`;

    return { success: true, decisionId };
  }

  async dequeue(maxCount: number): Promise<readonly SchedulingRequest[]> {
    // Dequeue in strict priority order: CRITICAL → HIGH → NORMAL → LOW
    const result: SchedulingRequest[] = [];

    for (let i = 0; i < maxCount && result.length < maxCount; i++) {
      let req: SchedulingRequest | undefined;

      // Try CRITICAL first
      if (this.criticalQueue.length > 0) {
        req = this.criticalQueue.shift();
      }
      // Then HIGH
      else if (this.highQueue.length > 0) {
        req = this.highQueue.shift();
      }
      // Then NORMAL
      else if (this.normalQueue.length > 0) {
        req = this.normalQueue.shift();
      }
      // Then LOW
      else if (this.lowQueue.length > 0) {
        req = this.lowQueue.shift();
      }

      if (!req) break; // No more requests

      result.push(req);
      this.totalDispatched++;

      // Track wait time
      const waitTimeMs = Date.now() - req.enqueuedAt.getTime();
      this.waitTimes.push(waitTimeMs);

      // Keep only last 10000 wait times for statistics
      if (this.waitTimes.length > 10000) {
        this.waitTimes.shift();
      }
    }

    return result;
  }

  async getStatistics(): Promise<QueueStatistics> {
    const currentLength = this.getCurrentQueueLengthSync();

    // Calculate average wait time
    let averageWaitTimeMs = 0;
    if (this.waitTimes.length > 0) {
      averageWaitTimeMs = this.waitTimes.reduce((a, b) => a + b, 0) / this.waitTimes.length;
    }

    // Calculate p99 wait time
    let p99WaitTimeMs = 0;
    if (this.waitTimes.length > 0) {
      const sorted = [...this.waitTimes].sort((a, b) => a - b);
      const index = Math.floor(sorted.length * 0.99);
      p99WaitTimeMs = sorted[index] || 0;
    }

    return {
      totalEnqueued: this.totalEnqueued,
      totalDispatched: this.totalDispatched,
      averageWaitTimeMs: Math.round(averageWaitTimeMs * 100) / 100,
      p99WaitTimeMs,
      currentQueueLength: currentLength,
      requestsByPriority: {
        CRITICAL: this.criticalQueue.length,
        HIGH: this.highQueue.length,
        NORMAL: this.normalQueue.length,
        LOW: this.lowQueue.length,
      },
      lastUpdated: new Date(),
    };
  }

  async getCurrentQueueLength(): Promise<number> {
    return this.getCurrentQueueLengthSync();
  }

  // Internal helper (deterministic, no I/O)
  private getCurrentQueueLengthSync(): number {
    return (
      this.criticalQueue.length +
      this.highQueue.length +
      this.normalQueue.length +
      this.lowQueue.length
    );
  }

  /**
   * Exported for testing and diagnostics
   * Returns current state snapshot (immutable copy)
   */
  getQueueSnapshot(): Readonly<{
    critical: readonly SchedulingRequest[];
    high: readonly SchedulingRequest[];
    normal: readonly SchedulingRequest[];
    low: readonly SchedulingRequest[];
  }> {
    return {
      critical: [...this.criticalQueue],
      high: [...this.highQueue],
      normal: [...this.normalQueue],
      low: [...this.lowQueue],
    };
  }
}
