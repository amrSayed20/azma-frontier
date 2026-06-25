/**
 * AZMA OS - Sovereign Assistant
 * Core Type Definitions and Contracts
 *
 * AL-WATEEN AL-MUSAED AL-SIYADI
 * (The Sovereign Assistant)
 *
 * A permanent Core architectural component for supervisory intelligence
 * across the entire AZMA OS platform.
 */

// ============================================================
// SYSTEM HEALTH & STATUS TYPES
// ============================================================

export type SystemComponent = 
  | 'core'
  | 'chambers'
  | 'domains'
  | 'responsibilities'
  | 'agents'
  | 'workers'
  | 'sessions'
  | 'memory'
  | 'cpu'
  | 'ram'
  | 'gpu'
  | 'storage'
  | 'redis'
  | 'database'
  | 'queues'
  | 'api-limits'
  | 'runtime'
  | 'communication'
  | 'boundaries'
  | 'layers'
  | 'registrations';

export type HealthStatus = 'healthy' | 'degraded' | 'critical' | 'offline';

export type UrgencyLevel = 'info' | 'warning' | 'critical' | 'emergency';

export interface ComponentHealth {
  readonly component: SystemComponent;
  readonly status: HealthStatus;
  readonly lastCheckedAt: Date;
  readonly metricValue: number;
  readonly metricUnit: string;
  readonly threshold: number;
  readonly message: string;
}

export interface SystemHealthSnapshot {
  readonly snapshotId: string;
  readonly timestamp: Date;
  readonly overallStatus: HealthStatus;
  readonly componentHealth: readonly ComponentHealth[];
}

// ============================================================
// PLATFORM INTELLIGENCE & METRICS
// ============================================================

export interface PlatformMetrics {
  readonly activeUsers: number;
  readonly activeSessions: number;
  readonly totalProcessed: number;
  readonly avgProcessingTimeMs: number;
  readonly errorRate: number;
  readonly successRate: number;
}

export interface FinancialMetrics {
  readonly monthlyRecurringRevenue: number;
  readonly totalCosts: number;
  readonly costPerUser: number;
  readonly marginPercentage: number;
}

export interface ResourceMetrics {
  readonly cpuUsagePercent: number;
  readonly memoryUsagePercent: number;
  readonly storageUsagePercent: number;
  readonly networkBandwidthPercent: number;
}

// ============================================================
// EVOLUTION & RECOMMENDATIONS
// ============================================================

export interface PlatformRecommendation {
  readonly recommendationId: string;
  readonly category: 'ai-model' | 'infrastructure' | 'optimization' | 'security';
  readonly title: string;
  readonly description: string;
  readonly urgency: UrgencyLevel;
  readonly estimatedImpact: string;
  readonly estimatedEffort: 'low' | 'medium' | 'high';
  readonly estimatedCost?: number;
  readonly createdAt: Date;
}

export interface EvolutionCandidate {
  readonly candidateId: string;
  readonly name: string;
  readonly type: 'model' | 'library' | 'infrastructure';
  readonly currentVersion?: string;
  readonly candidateVersion: string;
  readonly benchmarkScore: number;
  readonly estimatedBenefit: string;
  readonly estimatedRisk: string;
  readonly approvalRequired: boolean;
}

// ============================================================
// NOTIFICATIONS & ALERTS
// ============================================================

export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'critical';

export interface Notification {
  readonly notificationId: string;
  readonly userId: string;
  readonly title: string;
  readonly message: string;
  readonly priority: NotificationPriority;
  readonly category: string;
  readonly readAt?: Date;
  readonly createdAt: Date;
}

export interface NotificationPreferences {
  readonly userId: string;
  readonly enabledChannels: readonly NotificationChannel[];
  readonly priorities: Partial<Record<NotificationPriority, readonly NotificationChannel[]>>;
  readonly categories: Partial<Record<string, boolean>>;
}

// ============================================================
// FOUNDER COMMAND & GOVERNANCE
// ============================================================

export type FounderCapability = 
  | 'create-content'
  | 'generate-video'
  | 'generate-image'
  | 'manage-users'
  | 'grant-credits'
  | 'grant-subscriptions'
  | 'grant-gifts'
  | 'broadcast'
  | 'approve-migrations'
  | 'system-configuration';

export interface FounderSession {
  readonly sessionId: string;
  readonly userId: string;
  readonly startedAt: Date;
  readonly expiresAt: Date;
  readonly authorizedCapabilities: readonly FounderCapability[];
  readonly ipAddress: string;
  readonly userAgent: string;
}

export interface BroadcastMessage {
  readonly broadcastId: string;
  readonly title: string;
  readonly content: string;
  readonly targetAudience: 'all-users' | 'premium-users' | 'specific-users';
  readonly targetUserIds?: readonly string[];
  readonly createdAt: Date;
  readonly publishedAt?: Date;
  readonly status: 'draft' | 'scheduled' | 'published' | 'archived';
}

// ============================================================
// ARCHITECTURAL INTEGRITY
// ============================================================

export interface ArchitecturalDriftAlert {
  readonly alertId: string;
  readonly severity: UrgencyLevel;
  readonly violationType: 'boundary' | 'layer' | 'responsibility' | 'dependency' | 'registration';
  readonly location: string;
  readonly description: string;
  readonly detectedAt: Date;
  readonly resolvedAt?: Date;
}

export interface IntegrityCheckResult {
  readonly checkId: string;
  readonly timestamp: Date;
  readonly passedChecks: number;
  readonly failedChecks: number;
  readonly driftAlerts: readonly ArchitecturalDriftAlert[];
}

// ============================================================
// COMMAND HALL TYPES
// ============================================================

export type CommandHallType =
  | 'sovereign-assistant'
  | 'empire-pulse'
  | 'architectural-health'
  | 'infrastructure-health'
  | 'resource-intelligence'
  | 'financial-intelligence'
  | 'evolution-intelligence'
  | 'security-intelligence'
  | 'founder-command'
  | 'emergency-command'
  | 'development-observatory'
  | 'broadcast-center'
  | 'gift-distribution'
  | 'future-laboratory';

export interface CommandHall {
  readonly hallId: string;
  readonly name: string;
  readonly type: CommandHallType;
  readonly description: string;
  readonly lastAccessedAt?: Date;
  readonly accessibleTo: readonly string[];
}

// ============================================================
// HIGH COUNCIL STATUS
// ============================================================

export interface SovereignHighCouncilStatus {
  readonly councilId: string;
  readonly lastUpdateAt: Date;
  readonly operationalStatus: HealthStatus;
  readonly commandHalls: readonly CommandHall[];
  readonly activeAlerts: number;
  readonly pendingRecommendations: number;
  readonly systemScore: number;
}
