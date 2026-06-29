/**
 * WP-012: Decision Layer Kernel (Layer 5)
 * Orchestrates the PolicyEvaluationService
 *
 * LAYER CLASSIFICATION: Layer 5 (Decision)
 * KERNEL DEPENDENCIES: Layers 1-4 (consumed; not re-exported here)
 *
 * This is the canonical entry point for Layer 6+ consumers of Layer 5.
 *
 * ASP: Factory function, single service, zero inheritance.
 */

import type { DecisionLayerContract } from './wp-012-types';
import { PolicyEvaluationService } from './wp-012-policy-evaluation';

/**
 * Create and initialize the Decision Layer (Layer 5)
 * Returns the immutable public contract for Layer 6+ consumers
 */
export function createDecisionLayer(): DecisionLayerContract {
  return {
    layerName: 'DecisionLayer',
    version: '1.0.0',
    layerNumber: 5,
    policyEvaluationService: new PolicyEvaluationService(),
  } as const;
}

// Re-export all Layer 5 types for consumers
export * from './wp-012-types';

// Re-export policy factories for direct use and testing
export {
  PolicyEvaluationService,
  createCriticalRejectionPolicy,
  createHighPriorityApprovalPolicy,
  createArticleMismatchRejectionPolicy,
} from './wp-012-policy-evaluation';
