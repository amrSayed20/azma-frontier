/**
 * WP-008: Scheduling Kernel (Layer 3)
 * Orchestrates all scheduling services
 * 
 * LAYER CLASSIFICATION: Layer 3 (Scheduling)
 * KERNEL DEPENDENCIES: Layers 1-2 only
 * 
 * Exports:
 * - RequestQueueService (FIFO queue management)
 * - PriorityAssignmentService (policy-based priority)
 * - SchedulingDecisionService (decision + audit recording)
 * 
 * This is the canonical entry point for Layer 4+ consumers
 */

import type { SchedulingKernelContract } from './wp-008-types';
import { RequestQueueService } from './wp-008-request-queue';
import { PriorityAssignmentService } from './wp-008-priority-assignment';
import { SchedulingDecisionService } from './wp-008-scheduling-decision';

/**
 * Create and initialize the Scheduling Kernel
 * Returns the immutable public contract
 */
export function createSchedulingKernel(): SchedulingKernelContract {
  const requestQueueService = new RequestQueueService();
  const priorityAssignmentService = new PriorityAssignmentService();
  const schedulingDecisionService = new SchedulingDecisionService();

  // Return public contract (all services are readonly)
  return {
    layerName: 'SchedulingKernel',
    version: '1.0.0',
    layerNumber: 3,
    requestQueueService,
    priorityAssignmentService,
    schedulingDecisionService,
  } as const;
}

/**
 * Export all types for consumers
 */
export * from './wp-008-types';

/**
 * Export all service implementations (for testing)
 */
export { RequestQueueService } from './wp-008-request-queue';
export { PriorityAssignmentService } from './wp-008-priority-assignment';
export { SchedulingDecisionService } from './wp-008-scheduling-decision';
export {
  createCriticalPriorityPolicy,
  createHighPriorityPolicy,
  createNormalPriorityPolicy,
  createLowPriorityPolicy,
} from './wp-008-priority-assignment';
