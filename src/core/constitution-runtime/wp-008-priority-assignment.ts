/**
 * WP-008: PriorityAssignmentService (Layer 3)
 * Evaluates requests and assigns priority levels based on constitutional policies
 * 
 * LAYER CLASSIFICATION: Layer 3 (Scheduling)
 * KERNEL DEPENDENCIES: Layers 1-2 (Constitution + audit trail)
 * 
 * Responsibility:
 * - Maintain set of priority assignment policies
 * - Evaluate each request against policies
 * - Assign priority deterministically based on policy matching
 * - All assignments must cite constitutional authority
 * 
 * Determinism: Same request → same priority (always)
 */

import type {
  SchedulingRequest,
  RequestPriority,
  PriorityPolicy,
  PriorityAssignmentServiceContract,
} from './wp-008-types';
import type { ConstitutionArticleId } from './constitution-types';
import { RequestPriority as Priority } from './wp-008-types';

/**
 * PriorityAssignmentService: Policy-based priority evaluation
 * All priority assignments are deterministic and constitutional
 */
export class PriorityAssignmentService implements PriorityAssignmentServiceContract {
  readonly serviceName = 'PriorityAssignmentService' as const;
  readonly version = '1.0.0' as const;

  private policies: PriorityPolicy[] = [];

  /**
   * Register a priority assignment policy
   * Policies are evaluated in registration order
   */
  async registerPolicy(policy: PriorityPolicy): Promise<void> {
    // Validate policy is not duplicate
    const isDuplicate = this.policies.some((p) => p.policyId === policy.policyId);
    if (isDuplicate) {
      throw new Error(`Policy already registered: ${policy.policyId}`);
    }

    // Validate policy has at least one criterion
    if (policy.criteriaFunctions.length === 0) {
      throw new Error(`Policy must have at least one criteria function: ${policy.policyId}`);
    }

    this.policies.push(policy);
  }

  /**
   * Assign priority to request deterministically
   * 
   * Algorithm:
   * 1. Evaluate each policy in order
   * 2. Return first matching policy's priority
   * 3. Default to NORMAL if no policy matches
   */
  async assignPriority(req: SchedulingRequest): Promise<RequestPriority> {
    // Evaluate policies in deterministic order
    for (const policy of this.policies) {
      // All criteria must match (AND logic)
      const allCriteriaMatch = policy.criteriaFunctions.every((criterion) => {
        try {
          return criterion(req);
        } catch {
          // If criteria throws, consider it non-matching
          return false;
        }
      });

      if (allCriteriaMatch) {
        return policy.priority;
      }
    }

    // No policy matched - default to NORMAL priority
    return Priority.NORMAL;
  }

  /**
   * Get all registered policies (immutable)
   */
  async getPolicies(): Promise<readonly PriorityPolicy[]> {
    return [...this.policies];
  }

  /**
   * Clear all policies (for testing only)
   * Not exported in public contract
   */
  clearPolicies(): void {
    this.policies = [];
  }
}

/**
 * Factory for creating constitutional priority policies
 * Each policy cites constitutional authority
 */
export function createCriticalPriorityPolicy(constitutionArticleId: ConstitutionArticleId): PriorityPolicy {
  return {
    policyId: `policy-critical-${constitutionArticleId}`,
    priority: Priority.CRITICAL,
    constitutionArticleId,
    criteriaFunctions: [
      // CRITICAL: Constitutional violations or security threats
      (req) => {
        const metadata = req.requestMetadata as Record<string, unknown>;
        return (
          metadata['threatLevel'] === 'CRITICAL' || metadata['violatesConstitution'] === true
        );
      },
    ],
    description: 'Critical priority for constitutional violations and security threats',
  };
}

export function createHighPriorityPolicy(constitutionArticleId: ConstitutionArticleId): PriorityPolicy {
  return {
    policyId: `policy-high-${constitutionArticleId}`,
    priority: Priority.HIGH,
    constitutionArticleId,
    criteriaFunctions: [
      // HIGH: Agent requests and chamber operations
      (req) => {
        const metadata = req.requestMetadata as Record<string, unknown>;
        return metadata['requestType'] === 'AGENT' || metadata['requestType'] === 'CHAMBER';
      },
    ],
    description: 'High priority for agent requests and chamber integrations',
  };
}

export function createNormalPriorityPolicy(constitutionArticleId: ConstitutionArticleId): PriorityPolicy {
  return {
    policyId: `policy-normal-${constitutionArticleId}`,
    priority: Priority.NORMAL,
    constitutionArticleId,
    criteriaFunctions: [
      // NORMAL: Standard requests (default)
      () => true, // Matches all
    ],
    description: 'Normal priority for standard requests (default)',
  };
}

export function createLowPriorityPolicy(constitutionArticleId: ConstitutionArticleId): PriorityPolicy {
  return {
    policyId: `policy-low-${constitutionArticleId}`,
    priority: Priority.LOW,
    constitutionArticleId,
    criteriaFunctions: [
      // LOW: Observability, telemetry, cleanup
      (req) => {
        const metadata = req.requestMetadata as Record<string, unknown>;
        return (
          metadata['requestType'] === 'TELEMETRY' ||
          metadata['requestType'] === 'CLEANUP' ||
          metadata['requestType'] === 'OBSERVABILITY'
        );
      },
    ],
    description: 'Low priority for observability and maintenance tasks',
  };
}
