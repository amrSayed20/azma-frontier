/**
 * Immutable contracts for sovereign orchestration runtime.
 */

export enum RequestKind {
  COMMAND = 'COMMAND',
  QUERY = 'QUERY'
}

export enum WorkflowStatus {
  CREATED = 'CREATED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum DecisionOutcome {
  PROCEED = 'PROCEED',
  RETRY = 'RETRY',
  ESCALATE = 'ESCALATE'
}

export interface OrchestrationRequest {
  readonly requestId: string;
  readonly sessionId: string;
  readonly kind: RequestKind;
  readonly operation: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly context: Readonly<Record<string, unknown>>;
  readonly timestamp: number;
}

export interface WorkflowStep {
  readonly stepId: string;
  readonly operation: string;
  readonly capability: string;
  readonly kind: RequestKind;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface WorkflowPlan {
  readonly planId: string;
  readonly requestId: string;
  readonly steps: readonly WorkflowStep[];
  readonly createdAt: number;
}

export interface ChamberTarget {
  readonly stepId: string;
  readonly chamberId: string;
  readonly capability: string;
}

export interface DispatchResult {
  readonly stepId: string;
  readonly chamberId: string;
  readonly success: boolean;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly errorMessage?: string;
  readonly durationMs: number;
}

export interface AggregatedResponse {
  readonly requestId: string;
  readonly success: boolean;
  readonly results: readonly DispatchResult[];
  readonly startedAt: number;
  readonly completedAt: number;
}

export interface ExecutionContext {
  readonly contextId: string;
  readonly requestId: string;
  readonly sessionId: string;
  readonly startedAt: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface SessionState {
  readonly sessionId: string;
  readonly activeContextId?: string;
  readonly requestCount: number;
  readonly lastActivityAt: number;
}

export interface WorkflowState {
  readonly requestId: string;
  readonly status: WorkflowStatus;
  readonly updatedAt: number;
  readonly message: string;
}

export interface TimelineEntry {
  readonly entryId: string;
  readonly requestId: string;
  readonly phase: string;
  readonly timestamp: number;
  readonly details: Readonly<Record<string, unknown>>;
}

export interface FailureEscalation {
  readonly escalationId: string;
  readonly requestId: string;
  readonly reason: string;
  readonly failedSteps: readonly string[];
  readonly createdAt: number;
}

export interface RuntimeDecision {
  readonly requestId: string;
  readonly outcome: DecisionOutcome;
  readonly reason: string;
  readonly retryableStepIds: readonly string[];
}

export interface OrchestrationResponse {
  readonly requestId: string;
  readonly success: boolean;
  readonly aggregated: AggregatedResponse;
  readonly decision: RuntimeDecision;
  readonly escalation?: FailureEscalation;
  readonly timeline: readonly TimelineEntry[];
}
