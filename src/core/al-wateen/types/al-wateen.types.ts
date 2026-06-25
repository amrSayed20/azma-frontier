/**
 * Sovereign core contracts for Al-Wateen runtime.
 */

export enum RuntimeStatus {
  BOOTING = 'BOOTING',
  RUNNING = 'RUNNING',
  DEGRADED = 'DEGRADED',
  RECOVERING = 'RECOVERING',
  STOPPED = 'STOPPED'
}

export enum HealthStatus {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  UNKNOWN = 'UNKNOWN'
}

export enum NotificationSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

export enum RecoveryActionType {
  RESTART_SERVICE = 'RESTART_SERVICE',
  RESET_COMPONENT = 'RESET_COMPONENT',
  TRIP_CIRCUIT = 'TRIP_CIRCUIT',
  CLEAR_QUEUE = 'CLEAR_QUEUE',
  RELOAD_PROVIDER = 'RELOAD_PROVIDER'
}

export enum ProviderStatus {
  AVAILABLE = 'AVAILABLE',
  DEGRADED = 'DEGRADED',
  UNAVAILABLE = 'UNAVAILABLE'
}

export enum EventType {
  HEARTBEAT = 'HEARTBEAT',
  HEALTH_CHECK = 'HEALTH_CHECK',
  RECOVERY = 'RECOVERY',
  TASK = 'TASK',
  TELEMETRY = 'TELEMETRY',
  NOTIFICATION = 'NOTIFICATION'
}

export interface RuntimeMetrics {
  readonly timestamp: number;
  readonly tasksExecuted: number;
  readonly tasksFailed: number;
  readonly avgTaskDurationMs: number;
  readonly providersActive: number;
  readonly schedulerBacklog: number;
}

export interface ResourceMetrics {
  readonly timestamp: number;
  readonly processUptimeSec: number;
  readonly rssBytes: number;
  readonly heapUsedBytes: number;
  readonly heapTotalBytes: number;
  readonly cpuUserMicros: number;
  readonly cpuSystemMicros: number;
}

export interface HeartbeatRecord {
  readonly sequence: number;
  readonly timestamp: number;
  readonly status: RuntimeStatus;
}

export interface HealthCheckResult {
  readonly checkId: string;
  readonly component: string;
  readonly status: HealthStatus;
  readonly message: string;
  readonly latencyMs: number;
  readonly timestamp: number;
  readonly details: Readonly<Record<string, unknown>>;
}

export interface RuntimeEvent<TPayload extends Readonly<Record<string, unknown>>> {
  readonly id: string;
  readonly type: EventType;
  readonly timestamp: number;
  readonly source: string;
  readonly payload: TPayload;
}

export interface NotificationMessage {
  readonly id: string;
  readonly timestamp: number;
  readonly severity: NotificationSeverity;
  readonly title: string;
  readonly message: string;
  readonly source: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface RecoveryAction {
  readonly id: string;
  readonly type: RecoveryActionType;
  readonly target: string;
  readonly reason: string;
  readonly createdAt: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface RecoveryResult {
  readonly action: RecoveryAction;
  readonly success: boolean;
  readonly completedAt: number;
  readonly message: string;
}

export interface ProviderDescriptor {
  readonly providerId: string;
  readonly name: string;
  readonly status: ProviderStatus;
  readonly capacity: number;
  readonly inFlight: number;
  readonly successRate: number;
  readonly averageLatencyMs: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface TelemetryRecord {
  readonly id: string;
  readonly category: string;
  readonly event: string;
  readonly timestamp: number;
  readonly success: boolean;
  readonly durationMs: number;
  readonly properties: Readonly<Record<string, unknown>>;
}

export interface RuntimeSnapshot {
  readonly timestamp: number;
  readonly status: RuntimeStatus;
  readonly health: HealthStatus;
  readonly metrics: RuntimeMetrics;
  readonly resources: ResourceMetrics;
  readonly activeProviders: readonly ProviderDescriptor[];
  readonly activeAlerts: readonly NotificationMessage[];
}

export interface ExecutiveStatusSnapshot {
  readonly generatedAt: number;
  readonly periodStart: number;
  readonly periodEnd: number;
  readonly runtimeStatus: RuntimeStatus;
  readonly healthStatus: HealthStatus;
  readonly metrics: RuntimeMetrics;
  readonly resources: ResourceMetrics;
  readonly topAlerts: readonly NotificationMessage[];
  readonly recommendations: readonly string[];
}
