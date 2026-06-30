// ── Enumerated domains ───────────────────────────────────────────────────────

export type SovereignActionType =
  | 'SOVEREIGN_GRANT'
  | 'RUNTIME_INTERVENTION'
  | 'EMERGENCY_RECOVERY'
  | 'RESOURCE_REDISTRIBUTION'
  | 'AI_PROVIDER_SWITCH'
  | 'COST_OPTIMIZATION'
  | 'PLATFORM_COMMAND'
  | 'CONSTITUTIONAL_OVERRIDE';

export type PredictionSubject =
  | 'RESOURCE_EXHAUSTION'
  | 'AI_COST'
  | 'RUNTIME_OVERLOAD'
  | 'STORAGE_LIMIT'
  | 'QUEUE_CONGESTION'
  | 'MODEL_SATURATION';

export type PredictionSeverity = 'ADVISORY' | 'WARNING' | 'CRITICAL';

export type RecommendationCategory =
  | 'MODEL_ROUTING'
  | 'INFRASTRUCTURE_SCALING'
  | 'RUNTIME_OPTIMIZATION'
  | 'COST_REDUCTION'
  | 'RESOURCE_REDISTRIBUTION'
  | 'CHAMBER_OPTIMIZATION';

export type ReportType =
  | 'DAILY'
  | 'WEEKLY'
  | 'MONTHLY'
  | 'EMERGENCY'
  | 'PERFORMANCE'
  | 'REVENUE'
  | 'RUNTIME'
  | 'INFRASTRUCTURE'
  | 'RESOURCE_CONSUMPTION'
  | 'AI_USAGE'
  | 'KNOWLEDGE_ACTIVITY'
  | 'GROWTH';

export type GrantType =
  | 'CREDITS'
  | 'SUBSCRIPTION'
  | 'LIFETIME_ACCESS'
  | 'FEATURE_ACCESS'
  | 'CHAMBER_ACCESS'
  | 'PLATFORM_ACCESS';

export type VitalityStatus = 'ALIVE' | 'DEGRADED' | 'CRITICAL' | 'OFFLINE';

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'UNKNOWN';

// ── Shared value objects ─────────────────────────────────────────────────────

export interface ResourceUtilization {
  readonly used: number;
  readonly total: number;
  readonly pct: number;
}

export interface AiProviderBalance {
  readonly providerId: string;
  readonly providerName: string;
  readonly balance: number;
  readonly currency: string;
  readonly lastUpdated: Date;
}

// ── Platform vitality ────────────────────────────────────────────────────────

export interface FiveQuestions {
  readonly isAlive: boolean;
  readonly isHealthy: boolean;
  readonly isProfitable: boolean;
  readonly areUsersSucceeding: boolean;
  readonly attentionRequired: readonly string[];
}

export interface PlatformVitalitySignal {
  readonly signalId: string;
  readonly status: VitalityStatus;
  readonly message: string;
  readonly fiveQuestions: FiveQuestions;
  readonly checkedAt: Date;
}

// ── OS heartbeat ─────────────────────────────────────────────────────────────

export interface ChamberHeartbeat {
  readonly chamberId: string;
  readonly status: string;
  readonly metrics: Readonly<Record<string, number>>;
  readonly message: string;
}

export interface OsHeartbeat {
  readonly heartbeatId: string;
  readonly timestamp: Date;
  readonly l3Scheduling: {
    readonly layerNumber: 3;
    readonly queueLength: number;
    readonly totalEnqueued: number;
  };
  readonly l4Memory: {
    readonly layerNumber: 4;
    readonly cacheEntries: number;
    readonly constitutionalMemorySize: number;
  };
  readonly l7AgentSociety: {
    readonly layerNumber: 7;
    readonly activeAgents: number;
  };
  readonly l8Intelligence: {
    readonly layerNumber: 8;
    readonly availableSources: number;
  };
  readonly l10Chambers: readonly ChamberHeartbeat[];
  readonly overallStatus: HealthStatus;
}

// ── Runtime observatory ──────────────────────────────────────────────────────

export type RuntimeEventType =
  | 'CHAMBER_REQUEST'
  | 'AGENT_ACTION'
  | 'KNOWLEDGE_QUERY'
  | 'SYSTEM_EVENT'
  | 'HEALTH_CHECK'
  | 'GRANT_ISSUED'
  | 'APPROVAL_SUBMITTED'
  | 'APPROVAL_RESOLVED'
  | 'INCIDENT_DETECTED'
  | 'INCIDENT_RESOLVED';

export interface RuntimeEvent {
  readonly eventId: string;
  readonly eventType: RuntimeEventType;
  readonly source: string;
  readonly detail: string;
  readonly timestamp: Date;
}

// ── Incident intelligence ────────────────────────────────────────────────────

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'OPEN' | 'RESOLVED';

export interface Incident {
  readonly incidentId: string;
  readonly severity: IncidentSeverity;
  readonly chamberId: string | null;
  readonly what: string;
  readonly why: string;
  readonly resolution: string;
  readonly usersAffected: boolean;
  readonly recommendation: string;
  readonly detectedAt: Date;
  readonly resolvedAt: Date | null;
  readonly status: IncidentStatus;
}

// ── Sovereign reporting ──────────────────────────────────────────────────────

export interface ReportSection {
  readonly sectionId: string;
  readonly title: string;
  readonly metrics: Readonly<Record<string, number | string>>;
}

export interface SovereignReport {
  readonly reportId: string;
  readonly type: ReportType;
  readonly generatedAt: Date;
  readonly period: { readonly from: Date; readonly to: Date };
  readonly title: string;
  readonly sections: readonly ReportSection[];
  readonly summary: string;
}

// ── Sovereign grants ─────────────────────────────────────────────────────────

export interface SovereignGrant {
  readonly grantId: string;
  readonly grantType: GrantType;
  readonly targetUserId: string;
  readonly grantedBy: 'FOUNDER';
  readonly value: string;
  readonly reason: string;
  readonly grantedAt: Date;
  readonly expiresAt: Date | null;
  readonly status: 'ACTIVE' | 'EXPIRED' | 'REVOKED';
}

export interface GrantParams {
  readonly grantType: GrantType;
  readonly targetUserId: string;
  readonly value: string;
  readonly reason: string;
  readonly expiresAt: Date | null;
}

// ── Empire chronicle ─────────────────────────────────────────────────────────

export type ChronicleCategory =
  | 'MILESTONE'
  | 'INCIDENT'
  | 'DECISION'
  | 'GRANT'
  | 'REPORT'
  | 'COMMAND';

export type ChronicleSignificance = 'ROUTINE' | 'NOTABLE' | 'HISTORIC';

export interface ChronicleEntry {
  readonly entryId: string;
  readonly timestamp: Date;
  readonly category: ChronicleCategory;
  readonly title: string;
  readonly narrative: string;
  readonly significance: ChronicleSignificance;
}

// ── Executive intelligence ───────────────────────────────────────────────────

export type RecommendationUrgency = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface ExecutiveRecommendation {
  readonly recommendationId: string;
  readonly category: RecommendationCategory;
  readonly title: string;
  readonly rationale: string;
  readonly requiredAction: SovereignActionType;
  readonly estimatedImpact: string;
  readonly urgency: RecommendationUrgency;
  readonly generatedAt: Date;
}

// ── Empire treasury ──────────────────────────────────────────────────────────

export interface EmpireTreasurySnapshot {
  readonly snapshotId: string;
  readonly generatedAt: Date;
  readonly revenue: {
    readonly daily: number;
    readonly monthly: number;
    readonly annual: number;
  };
  readonly subscriptions: {
    readonly active: number;
    readonly churned: number;
    readonly mrr: number;
  };
  readonly aiCosts: {
    readonly providerBalances: readonly AiProviderBalance[];
    readonly dailyCost: number;
    readonly monthlyCost: number;
    readonly burnRatePerHour: number;
    readonly remainingDays: number;
  };
  readonly utilization: {
    readonly storage: ResourceUtilization;
    readonly gpu: ResourceUtilization;
    readonly cpu: ResourceUtilization;
    readonly ram: ResourceUtilization;
    readonly queue: ResourceUtilization;
  };
}

// ── Predictive command ───────────────────────────────────────────────────────

export interface Prediction {
  readonly predictionId: string;
  readonly subject: PredictionSubject;
  readonly confidence: number;
  readonly estimatedTimeToEventMs: number;
  readonly currentValue: number;
  readonly thresholdValue: number;
  readonly severity: PredictionSeverity;
  readonly recommendation: ExecutiveRecommendation | null;
  readonly generatedAt: Date;
}

// ── Founder approval gate ────────────────────────────────────────────────────

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface PendingApproval {
  readonly approvalId: string;
  readonly actionType: SovereignActionType;
  readonly recommendedBy: string;
  readonly recommendation: ExecutiveRecommendation;
  readonly submittedAt: Date;
  readonly status: ApprovalStatus;
  readonly resolvedAt: Date | null;
  readonly rejectionReason: string | null;
}

export interface ApprovalResult {
  readonly approvalId: string;
  readonly status: 'APPROVED';
  readonly approvedAt: Date;
  readonly executionToken: string;
}

