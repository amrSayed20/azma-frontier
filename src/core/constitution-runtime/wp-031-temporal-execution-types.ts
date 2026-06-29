/**
 * ════════════════════════════════════════════════════════════════════════════
 * WP-031: Temporal Execution Base Types
 * Type Definitions for Temporal Execution Patterns & Scheduling
 * ════════════════════════════════════════════════════════════════════════════
 * 
 * Foundation for WP-032-034: All temporal execution patterns
 * - Instant, Background, Scheduled execution
 * - Long-running, Checkpoint, Resume
 * - Retry, Timeout, Cancel, Recovery
 */

import { ConstitutionArticleId } from './constitution-types';

// ════════════════════════════════════════════════════════════════════════════
// EXECUTION MODE ENUMS & BASE TYPES
// ════════════════════════════════════════════════════════════════════════════

/**
 * Execution mode: When and how the request executes
 */
export enum ExecutionMode {
  INSTANT = 'INSTANT',                    // Execute now, wait for result
  BACKGROUND = 'BACKGROUND',              // Execute now, return ID
  SCHEDULED = 'SCHEDULED',                // Execute at specified time
  LONG_RUNNING = 'LONG_RUNNING',         // Multi-checkpoint execution
  CHECKPOINT = 'CHECKPOINT',              // Execute from checkpoint
  RESUME = 'RESUME',                      // Resume from previous checkpoint
  RETRY = 'RETRY',                        // Retry with backoff strategy
  TIMEOUT = 'TIMEOUT',                    // Kill if exceeds duration
  CANCEL = 'CANCEL',                      // Stop mid-execution
  RECOVERY = 'RECOVERY'                   // Resume from failure
}

/**
 * Execution status throughout lifecycle
 */
export enum ExecutionStatus {
  QUEUED = 'QUEUED',                      // Waiting to execute
  SCHEDULED = 'SCHEDULED',                // Scheduled for future
  RUNNING = 'RUNNING',                    // Currently executing
  CHECKPOINT_REACHED = 'CHECKPOINT_REACHED',  // Waiting at checkpoint
  PAUSED = 'PAUSED',                      // Paused for backoff
  SUSPENDED = 'SUSPENDED',                // Suspended pending approval
  COMPLETED = 'COMPLETED',                // Finished successfully
  FAILED = 'FAILED',                      // Failed execution
  CANCELLED = 'CANCELLED',                // User cancelled
  TIMED_OUT = 'TIMED_OUT',               // Exceeded timeout
  RECOVERING = 'RECOVERING',              // Attempting recovery
  RESUMED = 'RESUMED'                     // Resumed from checkpoint
}

/**
 * Retry strategy for failed executions
 */
export enum RetryStrategy {
  IMMEDIATE = 'IMMEDIATE',                // Retry immediately
  LINEAR_BACKOFF = 'LINEAR_BACKOFF',     // Linear backoff (1s, 2s, 3s, ...)
  EXPONENTIAL_BACKOFF = 'EXPONENTIAL_BACKOFF',  // 2^n backoff
  FIBONACCI_BACKOFF = 'FIBONACCI_BACKOFF',     // Fibonacci backoff
  CUSTOM = 'CUSTOM'                       // Custom delay function
}

/**
 * Recovery mechanism when execution fails
 */
export enum RecoveryMechanism {
  NONE = 'NONE',                          // No recovery
  AUTOMATIC_RETRY = 'AUTOMATIC_RETRY',   // Automatic retry
  CHECKPOINT_RESTORE = 'CHECKPOINT_RESTORE',  // Restore from checkpoint
  GRACEFUL_FALLBACK = 'GRACEFUL_FALLBACK',   // Fall back to alternate
  HUMAN_INTERVENTION = 'HUMAN_INTERVENTION'  // Wait for human decision
}

/**
 * Cancellation strategy when stop is requested
 */
export enum CancellationStrategy {
  IMMEDIATE = 'IMMEDIATE',               // Kill thread immediately
  GRACEFUL = 'GRACEFUL',                 // Wait for current step to finish
  CHECKPOINT = 'CHECKPOINT',             // Stop at next checkpoint
  WITH_CLEANUP = 'WITH_CLEANUP'          // Cleanup resources before stop
}

// ════════════════════════════════════════════════════════════════════════════
// TEMPORAL EXECUTION CONTEXT & CONFIGURATION
// ════════════════════════════════════════════════════════════════════════════

/**
 * Retry configuration for failed attempts
 */
export interface RetryConfiguration {
  readonly maxRetries: number;
  readonly strategy: RetryStrategy;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly customDelayFn?: (attemptNumber: number) => number;
  readonly retryableErrors?: readonly string[];  // Error types to retry on
  readonly nonRetryableErrors?: readonly string[];  // Never retry these
}

/**
 * Timeout configuration
 */
export interface TimeoutConfiguration {
  readonly totalTimeoutMs: number;       // Overall max execution time
  readonly stepTimeoutMs?: number;       // Max time per step
  readonly checkpointTimeoutMs?: number; // Max time at checkpoint
  readonly fallbackOnTimeout: boolean;   // Execute fallback if timeout
  readonly fallbackBehavior?: string;    // What to do on timeout
}

/**
 * Checkpoint definition for long-running execution
 */
export interface ExecutionCheckpoint {
  readonly checkpointId: string;
  readonly checkpointName: string;
  readonly sequence: number;             // Order in execution
  readonly description: string;
  readonly state: Record<string, unknown>;  // State at checkpoint
  readonly createdAt: number;
  readonly duration_ms: number;
  readonly dataSize: number;             // Bytes of checkpoint data
  readonly compressed: boolean;
}

/**
 * Schedule configuration for scheduled execution
 */
export interface ScheduleConfiguration {
  readonly scheduledTime: number;        // Unix timestamp when to execute
  readonly timezone?: string;
  readonly recurring?: {
    readonly pattern: 'ONCE' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
    readonly interval?: number;          // Minutes between recurrences
    readonly maxRecurrences?: number;    // Max times to repeat
  };
  readonly priority: number;             // Scheduling priority (0-100)
}

/**
 * Complete temporal execution configuration
 */
export interface TemporalExecutionConfig {
  readonly executionMode: ExecutionMode;
  readonly retryConfig: RetryConfiguration;
  readonly timeoutConfig: TimeoutConfiguration;
  readonly scheduleConfig?: ScheduleConfiguration;
  readonly recoveryMechanism: RecoveryMechanism;
  readonly cancellationStrategy: CancellationStrategy;
  readonly constitutionalBasis: ConstitutionArticleId;
  readonly preserveAuditTrail: boolean;
  readonly checkpointFrequency?: number;  // Ms between checkpoints
}

// ════════════════════════════════════════════════════════════════════════════
// EXECUTION RECORD & HISTORY
// ════════════════════════════════════════════════════════════════════════════

/**
 * Single execution attempt record
 */
export interface ExecutionAttempt {
  readonly attemptNumber: number;
  readonly startedAt: number;
  readonly completedAt?: number;
  readonly duration_ms?: number;
  readonly status: ExecutionStatus;
  readonly result?: unknown;
  readonly error?: string;
  readonly errorCode?: string;
  readonly agentId: string;
}

/**
 * Temporal execution history entry
 */
export interface TemporalExecutionHistory {
  readonly executionId: string;
  readonly requestId: string;
  readonly mode: ExecutionMode;
  readonly initiatedAt: number;
  readonly scheduledFor?: number;
  readonly startedAt?: number;
  readonly completedAt?: number;
  readonly totalDuration_ms?: number;
  readonly status: ExecutionStatus;
  readonly attempts: readonly ExecutionAttempt[];
  readonly checkpoints: readonly ExecutionCheckpoint[];
  readonly cancellationReason?: string;
  readonly cancelledAt?: number;
  readonly finalResult?: unknown;
  readonly finalError?: string;
  readonly recoveryApplied?: string;
  readonly auditTrailId: string;
}

/**
 * Execution statistics over time
 */
export interface ExecutionStatistics {
  readonly agentId: string;
  readonly totalExecutions: number;
  readonly successfulExecutions: number;
  readonly failedExecutions: number;
  readonly retriedExecutions: number;
  readonly cancelledExecutions: number;
  readonly averageExecutionTimeMs: number;
  readonly totalExecutionTimeMs: number;
  readonly longestExecutionMs: number;
  readonly shortestExecutionMs: number;
  readonly timeoutCount: number;
  readonly recoveryCount: number;
  readonly checksumErrors: number;
}

// ════════════════════════════════════════════════════════════════════════════
// TEMPORAL EXECUTION REQUEST & RESPONSE
// ════════════════════════════════════════════════════════════════════════════

/**
 * Temporal execution request extending any decision/request
 */
export interface TemporalExecutionRequest {
  readonly requestId: string;
  readonly agentId: string;
  readonly workload: unknown;             // Decision/request content
  readonly config: TemporalExecutionConfig;
  readonly createdAt: number;
  readonly conversationId?: string;       // Link to conversation history
  readonly priorityScore: number;         // 0-100 for scheduling
}

/**
 * Temporal execution response
 */
export interface TemporalExecutionResponse {
  readonly executionId: string;
  readonly requestId: string;
  readonly mode: ExecutionMode;
  readonly immediateResult?: unknown;    // For INSTANT mode
  readonly backgroundJobId?: string;      // For BACKGROUND mode
  readonly scheduledTime?: number;        // For SCHEDULED mode
  readonly status: ExecutionStatus;
  readonly createdAt: number;
  readonly expectedCompletionTime?: number;
  readonly checkpointReached?: ExecutionCheckpoint;
  readonly resumeFromCheckpointId?: string;
}

/**
 * Status check for background/scheduled executions
 */
export interface ExecutionStatusCheckResponse {
  readonly executionId: string;
  readonly status: ExecutionStatus;
  readonly progress: number;             // 0-100
  readonly currentStep?: string;
  readonly currentCheckpoint?: ExecutionCheckpoint;
  readonly estimatedRemainingMs?: number;
  readonly retriesUsed: number;
  readonly result?: unknown;
  readonly error?: string;
  readonly lastUpdateAt: number;
}

/**
 * Cancellation request for in-flight execution
 */
export interface ExecutionCancellationRequest {
  readonly executionId: string;
  readonly reason: string;
  readonly strategy: CancellationStrategy;
  readonly requestedAt: number;
  readonly requestedByAgentId: string;
}

/**
 * Cancellation result
 */
export interface ExecutionCancellationResponse {
  readonly executionId: string;
  readonly cancelled: boolean;
  readonly actualStatus: ExecutionStatus;
  readonly cancelledAt: number;
  readonly stateAtCancellation: Record<string, unknown>;
  readonly canResume: boolean;
  readonly resumeCheckpointId?: string;
}

// ════════════════════════════════════════════════════════════════════════════
// TEMPORAL EXECUTION SERVICE CONTRACT
// ════════════════════════════════════════════════════════════════════════════

/**
 * Service contract for temporal execution patterns (WP-032-034)
 */
export interface TemporalExecutionServiceContract {
  // Request execution in various modes
  executeInstant(request: TemporalExecutionRequest): Promise<TemporalExecutionResponse>;
  executeBackground(request: TemporalExecutionRequest): Promise<TemporalExecutionResponse>;
  executeScheduled(request: TemporalExecutionRequest): Promise<TemporalExecutionResponse>;
  executeLongRunning(request: TemporalExecutionRequest): Promise<TemporalExecutionResponse>;

  // Checkpoint management
  saveCheckpoint(
    executionId: string,
    checkpointName: string,
    state: Record<string, unknown>
  ): Promise<ExecutionCheckpoint>;

  resumeFromCheckpoint(executionId: string, checkpointId: string): Promise<TemporalExecutionResponse>;

  // Retry management
  retryExecution(executionId: string, strategy: RetryStrategy): Promise<TemporalExecutionResponse>;

  // Status & monitoring
  getExecutionStatus(executionId: string): Promise<ExecutionStatusCheckResponse>;
  getExecutionHistory(executionId: string): Promise<TemporalExecutionHistory>;

  // Cancellation
  cancelExecution(request: ExecutionCancellationRequest): Promise<ExecutionCancellationResponse>;

  // Recovery
  initiateRecovery(executionId: string, mechanism: RecoveryMechanism): Promise<TemporalExecutionResponse>;

  // Statistics
  getExecutionStatistics(agentId: string): Promise<ExecutionStatistics>;
}
