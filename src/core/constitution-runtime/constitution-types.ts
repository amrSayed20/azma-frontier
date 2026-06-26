export type ConstitutionVersion = '1.0';

export type ConstitutionArticleId =
  | 'constitutional-structure'
  | 'sovereign-high-council'
  | 'al-wateen-constitutional-intelligence'
  | 'empire-consciousness'
  | 'living-digital-twin'
  | 'strategic-intelligence'
  | 'sovereign-constitutional-memory'
  | 'architectural-dna'
  | 'imperial-memory-timeline'
  | 'constitutional-ethics'
  | 'sovereign-future-simulation-engine'
  | 'imperial-dream-layer'
  | 'founder-experience'
  | 'human-ai-conversation-model'
  | 'security-layers'
  | 'visual-hierarchy'
  | 'motion-philosophy'
  | 'lighting-philosophy'
  | 'notification-philosophy'
  | 'ai-brain-architecture'
  | 'expansion-zones'
  | 'integration-with-chambers'
  | 'integration-with-infrastructure'
  | 'integration-with-ai-providers'
  | 'long-term-evolution-strategy'
  | 'constitutional-synthesis'
  | 'ratification-principle';

export type ConstitutionLayerName =
  | 'constitutional-knowledge'
  | 'runtime-behavior'
  | 'living-memory'
  | 'executive-intelligence'
  | 'founder-guidance'
  | 'architectural-protection';

export type ConstitutionModuleOwner =
  | 'constitution-runtime'
  | 'sovereign-high-council'
  | 'al-wateen'
  | 'sovereign-orchestrator'
  | 'chamber-integration'
  | 'shared-constitutional'
  | 'system-root';

export type ConstitutionExecutionFrequency = 'continuous' | 'event-driven' | 'periodic' | 'on-demand';
export type ConstitutionActionType =
  | 'governance'
  | 'security'
  | 'memory'
  | 'simulation'
  | 'evolution'
  | 'provider-management'
  | 'communication'
  | 'infrastructure'
  | 'chamber-interaction'
  | 'founder-interaction'
  | 'compliance-check';
export type ConstitutionPriority = 'low' | 'normal' | 'high' | 'critical' | 'constitutional';
export type ConstitutionDecision = 'allow' | 'deny' | 'defer' | 'escalate';
export type ConstitutionComplianceStatus = 'compliant' | 'non-compliant' | 'partial' | 'pending';
export type ConstitutionEventType =
  | 'constitution-loaded'
  | 'article-registered'
  | 'policy-registered'
  | 'action-evaluated'
  | 'permission-resolved'
  | 'priority-resolved'
  | 'validation-passed'
  | 'validation-failed'
  | 'state-updated'
  | 'history-recorded'
  | 'compliance-published';
export type ConstitutionPolicyMode = 'allow' | 'deny' | 'prioritize' | 'require';
export type ConstitutionScope =
  | 'all'
  | 'governance'
  | 'security'
  | 'simulation'
  | 'evolution'
  | 'memory'
  | 'provider-management'
  | 'founder-interaction'
  | 'communication'
  | 'infrastructure'
  | 'chamber-interaction';

export interface ConstitutionActionContext {
  readonly actionId: string;
  readonly actionType: ConstitutionActionType;
  readonly title: string;
  readonly description: string;
  readonly targetModule: ConstitutionModuleOwner;
  readonly targetChamber?: string;
  readonly requestedBy: string;
  readonly requestedAt: Date;
  readonly scope: ConstitutionScope;
  readonly priority: ConstitutionPriority;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface ConstitutionArticleDefinition {
  readonly articleId: ConstitutionArticleId;
  readonly articleNumber: number;
  readonly title: string;
  readonly summary: string;
  readonly layer: ConstitutionLayerName;
  readonly coreOwner: ConstitutionModuleOwner;
  readonly runtimeBehavior: string;
  readonly executionFrequency: ConstitutionExecutionFrequency;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly dependencies: readonly string[];
  readonly communicationPath: string;
  readonly eventSources: readonly string[];
  readonly eventConsumers: readonly string[];
  readonly memoryInteraction: string;
  readonly aiInteraction: string;
  readonly founderInteraction: string;
  readonly failureBehavior: string;
  readonly recoveryBehavior: string;
  readonly evolutionPath: string;
  readonly constitutionalRules: readonly string[];
  readonly allowedActionTypes: readonly ConstitutionActionType[];
  readonly prohibitedActionTypes: readonly ConstitutionActionType[];
  readonly consumingChambers: readonly string[];
}

export interface ConstitutionPolicyDefinition {
  readonly policyId: string;
  readonly articleId: ConstitutionArticleId;
  readonly name: string;
  readonly description: string;
  readonly mode: ConstitutionPolicyMode;
  readonly scope: ConstitutionScope;
  readonly priority: ConstitutionPriority;
  readonly rules: readonly string[];
  readonly effects: readonly string[];
  readonly constitutionalJustification: string;
}

export interface ConstitutionEvaluationResult {
  readonly actionId: string;
  readonly articleId?: ConstitutionArticleId;
  readonly status: ConstitutionComplianceStatus;
  readonly decision: ConstitutionDecision;
  readonly complianceScore: number;
  readonly priorityScore: number;
  readonly permissions: readonly string[];
  readonly prohibitions: readonly string[];
  readonly violations: readonly ConstitutionViolation[];
  readonly appliedPolicies: readonly string[];
  readonly reasons: readonly string[];
  readonly evaluatedAt: Date;
}

export interface ConstitutionPermissionResult {
  readonly actionId: string;
  readonly articleId?: ConstitutionArticleId;
  readonly decision: ConstitutionDecision;
  readonly allowed: readonly string[];
  readonly denied: readonly string[];
  readonly escalated: readonly string[];
  readonly reasons: readonly string[];
}

export interface ConstitutionPriorityResult {
  readonly actionId: string;
  readonly articleId?: ConstitutionArticleId;
  readonly priority: ConstitutionPriority;
  readonly weight: number;
  readonly reason: string;
}

export interface ConstitutionEventRecord {
  readonly eventId: string;
  readonly eventType: ConstitutionEventType;
  readonly source: ConstitutionModuleOwner;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly actionId?: string;
  readonly articleId?: ConstitutionArticleId;
  readonly timestamp: Date;
}

export interface ConstitutionViolation {
  readonly violationId: string;
  readonly articleId: ConstitutionArticleId;
  readonly rule: string;
  readonly severity: ConstitutionPriority;
  readonly message: string;
  readonly remediation: string;
}

export interface ConstitutionStateSnapshot {
  readonly constitutionVersion: ConstitutionVersion;
  readonly loaded: boolean;
  readonly articleCount: number;
  readonly policyCount: number;
  readonly eventCount: number;
  readonly historyCount: number;
  readonly lastLoadedAt?: Date;
  readonly lastEvaluatedAt?: Date;
  readonly lastActionId?: string;
  readonly lastDecision?: ConstitutionDecision;
  readonly lastComplianceStatus?: ConstitutionComplianceStatus;
  readonly lastPriority?: ConstitutionPriority;
}

export interface ConstitutionHistoryEntry {
  readonly historyId: string;
  readonly actionId: string;
  readonly articleId?: ConstitutionArticleId;
  readonly decision: ConstitutionDecision;
  readonly status: ConstitutionComplianceStatus;
  readonly complianceScore: number;
  readonly priorityScore: number;
  readonly recordedAt: Date;
  readonly reasons: readonly string[];
  readonly violations: readonly ConstitutionViolation[];
}

export interface ConstitutionLoadResult {
  readonly constitutionVersion: ConstitutionVersion;
  readonly articleCount: number;
  readonly policyCount: number;
  readonly loadedAt: Date;
  readonly articleIds: readonly ConstitutionArticleId[];
}
