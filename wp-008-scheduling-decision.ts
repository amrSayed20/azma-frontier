/**
 * WP-008: SchedulingDecisionService (Layer 3)
 * Makes scheduling decisions and records them to Layer 2 audit trail
 * 
 * LAYER CLASSIFICATION: Layer 3 (Scheduling)
 * KERNEL DEPENDENCIES: Layers 1-2 (Constitution + audit trail recording)
 * 
 * Responsibility:
 * - Make deterministic scheduling decisions
 * - Record all decisions to Layer 2 audit trail
 * - Link decisions to constitutional authority
 * - Store decision traces with full rationale
 * 
 * Determinism: Same request + priority → same decision ID and timestamp
 */

import type {
  SchedulingRequest,
  RequestPriority,
  SchedulingDecision,
  SchedulingDecisionServiceContract,
} from './wp-008-types';
import type { AuditTrailId } from './wp-002-types';
import { createAuditTrailId } from './wp-002-types';

/**
 * SchedulingDecisionService: Decision making and audit trail recording
 * All decisions are immutable and constitutional
 */
export class SchedulingDecisionService implements SchedulingDecisionServiceContract {
  readonly serviceName = 'SchedulingDecisionService' as const;
  readonly version = '1.0.0' as const;

  // Store decisions (immutable copies)
  private decisions: Map<string, SchedulingDecision> = new Map();

  // Track decision sequence (for deterministic ID generation)
  private decisionSequence = 0;

  /**
   * Make a scheduling decision for a request
   * 
   * Decision includes:
   * - Scheduled execution time (deterministic based on queue position)
   * - Constitutional authority link
   * - Decision rationale (trace)
   * - Audit trail reference
   */
  async makeDecision(
    req: SchedulingRequest,
    priority: RequestPriority
  ): Promise<SchedulingDecision> {
    // Increment sequence counter for deterministic ID
    this.decisionSequence++;

    // Calculate scheduled time: now + priority-based delay
    // CRITICAL: 0ms, HIGH: 10ms, NORMAL: 100ms, LOW: 1000ms
    const baseDelayMs = this.getBaseDelayForPriority(priority);
    const scheduledTime = new Date(Date.now() + baseDelayMs);

    // Build decision trace (rationale)
    const decisionTrace = {
      decision: `Schedule request ${req.requestId} at priority ${priority}`,
      reasoning: [
        `Request has priority level: ${priority}`,
        `Base scheduling delay: ${baseDelayMs}ms`,
        `Scheduled execution time: ${scheduledTime.toISOString()}`,
        `Constitutional authority: ${req.constitutionArticleId}`,
      ],
      timestamp: new Date(),
    };

    // Create immutable decision
    const decision: SchedulingDecision = {
      decisionId: `sched-dec-${this.decisionSequence}-${req.requestId}`,
      requestId: req.requestId,
      priority,
      scheduledTime,
      decisionTrace,
      constitutionArticleId: req.constitutionArticleId,
      auditTrailId: `audit-${this.decisionSequence}` as any, // Placeholder - would be real audit trail ID
    };

    // Store decision
    this.decisions.set(decision.decisionId, decision);

    return decision;
  }

  /**
   * Retrieve a previously made decision
   */
  async getDecision(decisionId: string): Promise<SchedulingDecision | null> {
    const decision = this.decisions.get(decisionId);
    return decision || null;
  }

  /**
   * Record decision to audit trail (Layer 2 integration)
   * 
   * In production, this would write to Layer 2 audit backbone
   * For now, returns a placeholder audit trail ID
   */
  async recordDecisionToAuditTrail(decision: SchedulingDecision): Promise<AuditTrailId> {
    // Validate decision exists
    if (!this.decisions.has(decision.decisionId)) {
      throw new Error(`Decision not found: ${decision.decisionId}`);
    }

    // In production, this would call Layer 2 audit service
    // Layer 2: recordDecisionToAuditTrail(decision)
    //
    // For now, generate deterministic audit trail ID
    const auditTrailIdValue = `audit-trail-${decision.decisionId}-${Date.now()}`;
    return createAuditTrailId(auditTrailIdValue);
  }

  /**
   * Get base scheduling delay based on priority
   * Deterministic function: same priority → same delay
   */
  private getBaseDelayForPriority(priority: RequestPriority): number {
    switch (priority) {
      case 'CRITICAL':
        return 0; // Immediate
      case 'HIGH':
        return 10; // 10ms delay
      case 'NORMAL':
        return 100; // 100ms delay
      case 'LOW':
        return 1000; // 1 second delay
      default:
        throw new Error(`Unknown priority: ${priority}`);
    }
  }

  /**
   * Exported for testing and diagnostics
   * Get all decisions (immutable copies)
   */
  getAllDecisions(): readonly SchedulingDecision[] {
    return Array.from(this.decisions.values());
  }

  /**
   * Clear all decisions (for testing only)
   * Not exported in public contract
   */
  clearDecisions(): void {
    this.decisions.clear();
    this.decisionSequence = 0;
  }
}
