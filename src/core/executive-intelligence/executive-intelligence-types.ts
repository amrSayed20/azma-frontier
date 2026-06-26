import {
  ConstitutionActionContext,
  ConstitutionComplianceStatus,
  ConstitutionDecision,
  ConstitutionEvaluationResult,
  ConstitutionEventRecord,
  ConstitutionPriority,
} from '../constitution-runtime';

export type ExecutiveEventIntent = 'observe' | 'analyze' | 'recommend' | 'submit';
export type ExecutiveRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ExecutivePlanStatus = 'pending-founder-review' | 'awaiting-founder-approval';

export interface ExecutiveObservedEvent {
  readonly eventId: string;
  readonly sourceEventType: ConstitutionEventRecord['eventType'];
  readonly actionId?: string;
  readonly recordedAt: Date;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface ExecutivePipelineInput {
  readonly observedEvent: ExecutiveObservedEvent;
  readonly action: ConstitutionActionContext;
  readonly evaluation: ConstitutionEvaluationResult;
}

export interface ExecutiveSituationUnderstanding {
  readonly actionId: string;
  readonly constitutionalDecision: ConstitutionDecision;
  readonly complianceStatus: ConstitutionComplianceStatus;
  readonly opportunities: readonly string[];
  readonly constraints: readonly string[];
  readonly constitutionalSignals: readonly string[];
}

export interface ExecutiveRisk {
  readonly riskId: string;
  readonly level: ExecutiveRiskLevel;
  readonly title: string;
  readonly impact: string;
  readonly mitigation: string;
}

export interface ExecutiveRiskAssessment {
  readonly actionId: string;
  readonly overallRisk: ExecutiveRiskLevel;
  readonly risks: readonly ExecutiveRisk[];
}

export interface ExecutivePriorityProfile {
  readonly actionId: string;
  readonly constitutionalPriority: ConstitutionPriority;
  readonly executivePriority: ConstitutionPriority;
  readonly weight: number;
  readonly rationale: string;
}

export interface ExecutiveRecommendation {
  readonly recommendationId: string;
  readonly actionId: string;
  readonly title: string;
  readonly summary: string;
  readonly requiresFounderApproval: boolean;
  readonly targetDecision: 'approve' | 'reject' | 'defer' | 'escalate';
  readonly executionConstraints: readonly string[];
}

export interface ExecutivePlanStep {
  readonly stepId: string;
  readonly order: number;
  readonly intent: ExecutiveEventIntent;
  readonly title: string;
  readonly blocking: boolean;
}

export interface ExecutiveDecisionPlan {
  readonly planId: string;
  readonly actionId: string;
  readonly status: ExecutivePlanStatus;
  readonly priority: ConstitutionPriority;
  readonly steps: readonly ExecutivePlanStep[];
  readonly submissionNote: string;
}

export interface ExecutiveDecisionPackage {
  readonly packageId: string;
  readonly input: ExecutivePipelineInput;
  readonly situation: ExecutiveSituationUnderstanding;
  readonly risks: ExecutiveRiskAssessment;
  readonly priority: ExecutivePriorityProfile;
  readonly recommendations: readonly ExecutiveRecommendation[];
  readonly plan: ExecutiveDecisionPlan;
  readonly submittedToFounderAt: Date;
}

export interface ExecutiveRuntimeStateSnapshot {
  readonly processedEventIds: readonly string[];
  readonly totalObservedEvents: number;
  readonly totalDecisionPackages: number;
  readonly lastActionId?: string;
  readonly lastPackageId?: string;
  readonly lastUpdatedAt?: Date;
}
