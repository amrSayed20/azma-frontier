/**
 * AZMA OS – Al-Wateen Assistant
 * File: al-wateen.types.ts
 *
 * Sovereign Contract of Al-Wateen Assistant.
 * Core type definitions for continuous operating intelligence.
 */

/**
 * Assistant operational states.
 */
export enum AssistantStatus {
  INITIALIZING = 'INITIALIZING',
  RUNNING = 'RUNNING',
  MONITORING = 'MONITORING',
  PAUSED = 'PAUSED',
  RECOVERING = 'RECOVERING',
  DEGRADED = 'DEGRADED',
  OFFLINE = 'OFFLINE',
  SHUTDOWN = 'SHUTDOWN'
}

/**
 * Chamber operational states.
 */
export enum ChamberStatus {
  ACTIVE = 'ACTIVE',
  IDLE = 'IDLE',
  BUSY = 'BUSY',
  DEGRADED = 'DEGRADED',
  ERROR = 'ERROR',
  RECOVERING = 'RECOVERING',
  OFFLINE = 'OFFLINE'
}

/**
 * Agent operational states.
 */
export enum AgentStatus {
  AVAILABLE = 'AVAILABLE',
  WORKING = 'WORKING',
  BLOCKED = 'BLOCKED',
  FAILED = 'FAILED',
  RECOVERING = 'RECOVERING',
  OFFLINE = 'OFFLINE'
}

/**
 * Service operational states.
 */
export enum ServiceStatus {
  RUNNING = 'RUNNING',
  STARTING = 'STARTING',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
  FAILED = 'FAILED',
  DEGRADED = 'DEGRADED',
  RECOVERING = 'RECOVERING'
}

/**
 * Provider operational states.
 */
export enum ProviderStatus {
  AVAILABLE = 'AVAILABLE',
  UNAVAILABLE = 'UNAVAILABLE',
  DEGRADED = 'DEGRADED',
  INITIALIZING = 'INITIALIZING',
  ERROR = 'ERROR',
  RECOVERING = 'RECOVERING'
}

/**
 * Recovery task severity levels.
 */
export enum RecoveryTaskSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Recovery task status states.
 */
export enum RecoveryTaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

/**
 * Notification priority levels.
 */
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * Notification types.
 */
export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  ALERT = 'ALERT'
}

/**
 * Health check result states.
 */
export enum HealthCheckStatus {
  HEALTHY = 'HEALTHY',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
  UNKNOWN = 'UNKNOWN'
}

/**
 * System alert severity levels.
 */
export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  CRITICAL = 'CRITICAL'
}

/**
 * System event types.
 */
export enum SystemEventType {
  STARTUP = 'STARTUP',
  SHUTDOWN = 'SHUTDOWN',
  CHAMBER_STATE_CHANGE = 'CHAMBER_STATE_CHANGE',
  AGENT_STATE_CHANGE = 'AGENT_STATE_CHANGE',
  SERVICE_STATE_CHANGE = 'SERVICE_STATE_CHANGE',
  ERROR_OCCURRED = 'ERROR_OCCURRED',
  RECOVERY_INITIATED = 'RECOVERY_INITIATED',
  RECOVERY_COMPLETED = 'RECOVERY_COMPLETED',
  PERFORMANCE_DEGRADED = 'PERFORMANCE_DEGRADED',
  RESOURCE_EXHAUSTED = 'RESOURCE_EXHAUSTED',
  DEPENDENCY_FAILURE = 'DEPENDENCY_FAILURE'
}

/**
 * AI provider types.
 */
export enum AIProviderType {
  LOCAL = 'LOCAL',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID'
}

/**
 * Repair action types.
 */
export enum RepairActionType {
  RESTART = 'RESTART',
  RESET = 'RESET',
  RECONFIGURE = 'RECONFIGURE',
  REINSTALL = 'REINSTALL',
  FALLBACK = 'FALLBACK',
  ISOLATE = 'ISOLATE'
}

/**
 * Resource metrics snapshot.
 */
export interface ResourceMetrics {
  readonly timestamp: number;
  readonly cpuUsage: number;
  readonly memoryUsage: number;
  readonly memoryLimit: number;
  readonly diskUsage: number;
  readonly diskLimit: number;
  readonly networkIn: number;
  readonly networkOut: number;
  readonly activeConnections: number;
  readonly openFileHandles: number;
}

/**
 * Cost metrics snapshot.
 */
export interface CostMetrics {
  readonly timestamp: number;
  readonly computeCost: number;
  readonly storageCost: number;
  readonly networkCost: number;
  readonly providerCost: number;
  readonly totalCost: number;
  readonly costPerOperation: number;
  readonly estimatedMonthlyTotal: number;
}

/**
 * Usage metrics snapshot.
 */
export interface UsageMetrics {
  readonly timestamp: number;
  readonly operationsCount: number;
  readonly requestsCount: number;
  readonly errorsCount: number;
  readonly warningsCount: number;
  readonly averageResponseTime: number;
  readonly peakResponseTime: number;
  readonly throughput: number;
  readonly successRate: number;
}

/**
 * Health report for a component.
 */
export interface HealthReport {
  readonly componentId: string;
  readonly componentType: string;
  readonly status: HealthCheckStatus;
  readonly timestamp: number;
  readonly checks: readonly HealthCheck[];
  readonly lastUpdate: number;
  readonly severity: AlertSeverity;
  readonly message: string;
}

/**
 * Individual health check result.
 */
export interface HealthCheck {
  readonly name: string;
  readonly passed: boolean;
  readonly duration: number;
  readonly message: string;
  readonly timestamp: number;
}

/**
 * System alert.
 */
export interface SystemAlert {
  readonly id: string;
  readonly timestamp: number;
  readonly severity: AlertSeverity;
  readonly type: string;
  readonly message: string;
  readonly source: string;
  readonly acknowledged: boolean;
  readonly acknowledgedAt?: number;
  readonly resolvedAt?: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * System event.
 */
export interface SystemEvent {
  readonly id: string;
  readonly timestamp: number;
  readonly type: SystemEventType;
  readonly source: string;
  readonly data: Readonly<Record<string, unknown>>;
  readonly severity: AlertSeverity;
  readonly relatedAlerts: readonly string[];
}

/**
 * Monitoring snapshot capturing system state.
 */
export interface MonitoringSnapshot {
  readonly timestamp: number;
  readonly assistantStatus: AssistantStatus;
  readonly chamberStatuses: Readonly<Record<string, ChamberStatus>>;
  readonly agentStatuses: Readonly<Record<string, AgentStatus>>;
  readonly serviceStatuses: Readonly<Record<string, ServiceStatus>>;
  readonly providerStatuses: Readonly<Record<string, ProviderStatus>>;
  readonly resourceMetrics: ResourceMetrics;
  readonly costMetrics: CostMetrics;
  readonly usageMetrics: UsageMetrics;
  readonly activeAlerts: readonly SystemAlert[];
  readonly recentEvents: readonly SystemEvent[];
}

/**
 * Executive report for system administrators.
 */
export interface ExecutiveReport {
  readonly reportId: string;
  readonly timestamp: number;
  readonly period: {
    readonly start: number;
    readonly end: number;
  };
  readonly assistantStatus: AssistantStatus;
  readonly systemHealth: HealthReport;
  readonly operationalMetrics: UsageMetrics;
  readonly costMetrics: CostMetrics;
  readonly resourceMetrics: ResourceMetrics;
  readonly criticalAlerts: readonly SystemAlert[];
  readonly recentEvents: readonly SystemEvent[];
  readonly recoveryActions: readonly RepairAction[];
  readonly recommendations: readonly string[];
}

/**
 * Notification message.
 */
export interface Notification {
  readonly id: string;
  readonly timestamp: number;
  readonly type: NotificationType;
  readonly priority: NotificationPriority;
  readonly title: string;
  readonly message: string;
  readonly source: string;
  readonly read: boolean;
  readonly readAt?: number;
  readonly actionUrl?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Recovery task to repair system issues.
 */
export interface RecoveryTask {
  readonly taskId: string;
  readonly timestamp: number;
  readonly status: RecoveryTaskStatus;
  readonly severity: RecoveryTaskSeverity;
  readonly description: string;
  readonly targetComponent: string;
  readonly targetComponentType: string;
  readonly actions: readonly RepairAction[];
  readonly initiatedAt: number;
  readonly completedAt?: number;
  readonly failureReason?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * AI provider configuration and status.
 */
export interface AIProvider {
  readonly providerId: string;
  readonly name: string;
  readonly type: AIProviderType;
  readonly status: ProviderStatus;
  readonly endpoint: string;
  readonly capacity: number;
  readonly activeRequests: number;
  readonly successRate: number;
  readonly averageResponseTime: number;
  readonly lastHealthCheck: number;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Repair action to be executed.
 */
export interface RepairAction {
  readonly actionId: string;
  readonly timestamp: number;
  readonly type: RepairActionType;
  readonly targetComponent: string;
  readonly targetComponentType: string;
  readonly description: string;
  readonly executed: boolean;
  readonly executedAt?: number;
  readonly success?: boolean;
  readonly errorMessage?: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/**
 * Telemetry record for analytics and monitoring.
 */
export interface TelemetryRecord {
  readonly recordId: string;
  readonly timestamp: number;
  readonly category: string;
  readonly event: string;
  readonly duration: number;
  readonly success: boolean;
  readonly error?: string;
  readonly userId?: string;
  readonly sessionId?: string;
  readonly resourceMetrics: ResourceMetrics;
  readonly properties: Readonly<Record<string, unknown>>;
}
