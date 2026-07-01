// ── Layer identifier ─────────────────────────────────────────────────────────

export type SovereignLayer = 2 | 3 | 4 | 5 | 7 | 8 | 9 | 10;

// ── Event type registry ──────────────────────────────────────────────────────

export type SovereignEventType =
  | 'RUNTIME_STARTED'
  | 'RUNTIME_STOPPED'
  | 'CHAMBER_ACTIVATED'
  | 'CHAMBER_DEACTIVATED'
  | 'CHAMBER_FAILED'
  | 'KNOWLEDGE_PACKAGE_PUBLISHED'
  | 'CREATIVE_ASSET_GENERATED'
  | 'GRANT_ISSUED'
  | 'FOUNDER_APPROVED_ACTION'
  | 'PREDICTION_GENERATED'
  | 'INCIDENT_DETECTED'
  | 'INCIDENT_RESOLVED'
  | 'AI_PROVIDER_SWITCHED'
  | 'MEMORY_UPDATED'
  | 'QUEUE_CONGESTED'
  | 'PLATFORM_HEALTH_CHANGED'
  | 'SCHEDULING_DECISION_MADE'
  | 'AGENT_EXECUTED'
  | 'INTELLIGENCE_QUERIED'
  | 'APPROVAL_SUBMITTED'
  | 'APPROVAL_RESOLVED'
  | 'JOURNEY_STARTED'
  | 'JOURNEY_CHAPTER_ENTERED'
  | 'JOURNEY_CHAPTER_COMPLETED'
  | 'JOURNEY_CHAPTER_SKIPPED'
  | 'JOURNEY_PAUSED'
  | 'JOURNEY_RESUMED'
  | 'JOURNEY_COMPLETED'
  | 'JOURNEY_ABANDONED'
  | 'USER_INTENT_PROFILED';

// ── Typed payload map ─────────────────────────────────────────────────────────

export interface SovereignEventPayloadMap {
  RUNTIME_STARTED: {
    readonly version: string;
    readonly startedAt: Date;
    readonly activeChambers: readonly string[];
  };
  RUNTIME_STOPPED: {
    readonly reason: string;
    readonly stoppedAt: Date;
  };
  CHAMBER_ACTIVATED: {
    readonly chamberId: string;
  };
  CHAMBER_DEACTIVATED: {
    readonly chamberId: string;
    readonly reason: string;
  };
  CHAMBER_FAILED: {
    readonly chamberId: string;
    readonly error: string;
  };
  KNOWLEDGE_PACKAGE_PUBLISHED: {
    readonly packageId: string;
    readonly query: string;
    readonly domain: string;
    readonly fromCache: boolean;
  };
  CREATIVE_ASSET_GENERATED: {
    readonly assetId: string;
    readonly assetType: string;
    readonly chamberId: string;
  };
  GRANT_ISSUED: {
    readonly grantId: string;
    readonly grantType: string;
    readonly targetUserId: string;
  };
  FOUNDER_APPROVED_ACTION: {
    readonly approvalId: string;
    readonly actionType: string;
    readonly executionToken: string;
  };
  PREDICTION_GENERATED: {
    readonly predictionId: string;
    readonly subject: string;
    readonly severity: string;
    readonly confidence: number;
    readonly estimatedTimeToEventMs: number;
  };
  INCIDENT_DETECTED: {
    readonly incidentId: string;
    readonly chamberId: string | null;
    readonly severity: string;
    readonly what: string;
  };
  INCIDENT_RESOLVED: {
    readonly incidentId: string;
    readonly resolution: string;
  };
  AI_PROVIDER_SWITCHED: {
    readonly fromProvider: string;
    readonly toProvider: string;
    readonly reason: string;
  };
  MEMORY_UPDATED: {
    readonly requestId: string;
    readonly articleId: string;
  };
  QUEUE_CONGESTED: {
    readonly queueLength: number;
    readonly threshold: number;
  };
  PLATFORM_HEALTH_CHANGED: {
    readonly previousStatus: string;
    readonly currentStatus: string;
  };
  SCHEDULING_DECISION_MADE: {
    readonly decisionId: string;
    readonly requestId: string;
    readonly priority: string;
  };
  AGENT_EXECUTED: {
    readonly agentId: string;
    readonly agentType: string;
    readonly requestId: string;
  };
  INTELLIGENCE_QUERIED: {
    readonly query: string;
    readonly domain: string;
    readonly fromCache: boolean;
  };
  APPROVAL_SUBMITTED: {
    readonly approvalId: string;
    readonly actionType: string;
    readonly urgency: string;
  };
  APPROVAL_RESOLVED: {
    readonly approvalId: string;
    readonly status: 'APPROVED' | 'REJECTED';
  };
  JOURNEY_STARTED: {
    readonly sessionId: string;
    readonly journeyId: string;
    readonly journeyTypeId: string;
  };
  JOURNEY_CHAPTER_ENTERED: {
    readonly sessionId: string;
    readonly journeyId: string;
    readonly chapterId: string;
    readonly chamberHint: string | null;
  };
  JOURNEY_CHAPTER_COMPLETED: {
    readonly sessionId: string;
    readonly journeyId: string;
    readonly chapterId: string;
  };
  JOURNEY_CHAPTER_SKIPPED: {
    readonly sessionId: string;
    readonly journeyId: string;
    readonly chapterId: string;
  };
  JOURNEY_PAUSED: {
    readonly sessionId: string;
    readonly journeyId: string;
    readonly chapterId: string | null;
  };
  JOURNEY_RESUMED: {
    readonly sessionId: string;
    readonly journeyId: string;
    readonly chapterId: string | null;
  };
  JOURNEY_COMPLETED: {
    readonly sessionId: string;
    readonly journeyId: string;
    readonly journeyTypeId: string;
    readonly durationMs: number;
  };
  JOURNEY_ABANDONED: {
    readonly sessionId: string;
    readonly journeyId: string;
    readonly lastPhase: string;
  };
  USER_INTENT_PROFILED: {
    readonly sessionId: string;
    readonly language: string;
    readonly experienceLevel: string;
    readonly intent: string;
  };
}

// ── Strongly-typed event envelope ─────────────────────────────────────────────

export interface SovereignBusEvent<TType extends SovereignEventType = SovereignEventType> {
  readonly eventId: string;
  readonly eventType: TType;
  readonly sourceLayer: SovereignLayer;
  readonly sourceService: string;
  readonly publishedAt: Date;
  readonly correlationId: string | null;
  readonly payload: Readonly<SovereignEventPayloadMap[TType]>;
}

// Discriminated union of every concrete event shape — used for wildcard handlers
export type AnySovereignEvent = {
  [TType in SovereignEventType]: SovereignBusEvent<TType>;
}[SovereignEventType];

// Convenience: payload type for a specific event
export type PayloadOf<TType extends SovereignEventType> = SovereignEventPayloadMap[TType];

// Input shape for bus.publish() — omits fields filled by the bus itself
export type SovereignEventInput<TType extends SovereignEventType> = {
  readonly eventType: TType;
  readonly sourceLayer: SovereignLayer;
  readonly sourceService: string;
  readonly correlationId: string | null;
  readonly payload: PayloadOf<TType>;
};
