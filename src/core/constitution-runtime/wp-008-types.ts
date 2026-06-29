/**
 * WP-008: Scheduling Layer (Layer 3)
 * Type definitions for scheduling kernel services
 * 
 * LAYER CLASSIFICATION: Layer 3 (Scheduling)
 * KERNEL DEPENDENCIES: Layers 1-2 only (Constitution + Execution Kernel)
 * 
 * Responsibilities:
 * - Request queue management (FIFO + priority levels)
 * - Priority policy assignment
 * - Scheduling decisions with rationale
 * - Deterministic scheduling across all request types
 */

import type { ConstitutionArticleId } from './constitution-types';

/**
 * Unique identifier for audit trail entries
 * References Layer 2 immutable audit backbone
 */
export type AuditTrailId = string & { readonly __brand: 'AuditTrailId' };

/**
 * Create a branded AuditTrailId
 */
export function createAuditTrailId(value: string): AuditTrailId {
  return value as AuditTrailId;
}

/**
 * Request priority levels (inbound from admission gate)
 * Layer 6 assigns priority; Layer 3 respects and queues accordingly
 */
export enum RequestPriority {
  CRITICAL = 'CRITICAL',      // Constitutional violations, security threats
  HIGH = 'HIGH',              // Agent requests, chamber integrations
  NORMAL = 'NORMAL',          // Standard chamber requests
  LOW = 'LOW',                // Observability, telemetry, cleanup
}

/**
 * Scheduling decision trace (Layer 3 local format)
 * Simple trace format for Layer 3 internal use
 * Converts to full PolicyDecisionTrace when recording to Layer 2 audit trail
 */
export interface SchedulingDecisionTrace {
  readonly decision: string;
  readonly reasoning: readonly string[];
  readonly timestamp: Date;
}

/**
 * Request queue entry (immutable)
 * Represents a single request waiting in the scheduling queue
 */
export interface SchedulingRequest {
  readonly requestId: string;
  readonly priority: RequestPriority;
  readonly constitutionArticleId: ConstitutionArticleId;
  readonly enqueuedAt: Date;
  readonly expiresAt: Date;
  readonly requestMetadata: Readonly<Record<string, unknown>>;
}

/**
 * Priority assignment policy (immutable)
 * Defines how requests are categorized into priority levels
 * 
 * LAYER DEPENDENCY: Consumed from Layer 2 (Decision policies)
 * Each priority level has a policy reason linked to constitution
 */
export interface PriorityPolicy {
  readonly policyId: string;
  readonly priority: RequestPriority;
  readonly constitutionArticleId: ConstitutionArticleId;
  readonly criteriaFunctions: readonly ((req: SchedulingRequest) => boolean)[];
  readonly description: string;
}

/**
 * Scheduling decision (immutable)
 * Decision to dispatch a request at a specific time
 * All decisions recorded to Layer 2 audit trail
 */
export interface SchedulingDecision {
  readonly decisionId: string;
  readonly requestId: string;
  readonly priority: RequestPriority;
  readonly scheduledTime: Date;
  readonly decisionTrace: SchedulingDecisionTrace;
  readonly constitutionArticleId: ConstitutionArticleId;
  readonly auditTrailId: AuditTrailId;
}

/**
 * Queue statistics (immutable)
 * Telemetry about queue health and scheduling performance
 */
export interface QueueStatistics {
  readonly totalEnqueued: number;
  readonly totalDispatched: number;
  readonly averageWaitTimeMs: number;
  readonly p99WaitTimeMs: number;
  readonly currentQueueLength: number;
  readonly requestsByPriority: Readonly<Record<RequestPriority, number>>;
  readonly lastUpdated: Date;
}

/**
 * Scheduling error (immutable)
 * Represents failures in the scheduling process
 * All errors recorded to Layer 2 audit trail
 */
export interface SchedulingError {
  readonly errorId: string;
  readonly requestId: string | null;
  readonly errorType: 'QUEUE_FULL' | 'POLICY_VIOLATION' | 'TIMEOUT' | 'INVALID_PRIORITY' | 'UNKNOWN';
  readonly message: string;
  readonly constitutionArticleId: ConstitutionArticleId | null;
  readonly timestamp: Date;
  readonly auditTrailId: AuditTrailId;
}

/**
 * Public contract for RequestQueueService
 * Immutable exports for Layer 4+ consumers
 */
export interface RequestQueueServiceContract {
  readonly serviceName: 'RequestQueueService';
  readonly version: '1.0.0';
  
  enqueue(req: SchedulingRequest): Promise<{ readonly success: boolean; readonly decisionId: string }>;
  dequeue(maxCount: number): Promise<readonly SchedulingRequest[]>;
  getStatistics(): Promise<QueueStatistics>;
  getCurrentQueueLength(): Promise<number>;
}

/**
 * Public contract for PriorityAssignmentService
 * Immutable exports for Layer 4+ consumers
 */
export interface PriorityAssignmentServiceContract {
  readonly serviceName: 'PriorityAssignmentService';
  readonly version: '1.0.0';
  
  assignPriority(req: SchedulingRequest): Promise<RequestPriority>;
  registerPolicy(policy: PriorityPolicy): Promise<void>;
  getPolicies(): Promise<readonly PriorityPolicy[]>;
}

/**
 * Public contract for SchedulingDecisionService
 * Immutable exports for Layer 4+ consumers
 */
export interface SchedulingDecisionServiceContract {
  readonly serviceName: 'SchedulingDecisionService';
  readonly version: '1.0.0';
  
  makeDecision(req: SchedulingRequest, priority: RequestPriority): Promise<SchedulingDecision>;
  getDecision(decisionId: string): Promise<SchedulingDecision | null>;
  recordDecisionToAuditTrail(decision: SchedulingDecision): Promise<AuditTrailId>;
}

/**
 * Layer 3 Scheduling Kernel exports
 * All public contracts are readonly and immutable
 * No breaking changes allowed for version 1.0.0
 */
export interface SchedulingKernelContract {
  readonly layerName: 'SchedulingKernel';
  readonly version: '1.0.0';
  readonly layerNumber: 3;
  
  readonly requestQueueService: RequestQueueServiceContract;
  readonly priorityAssignmentService: PriorityAssignmentServiceContract;
  readonly schedulingDecisionService: SchedulingDecisionServiceContract;
}
