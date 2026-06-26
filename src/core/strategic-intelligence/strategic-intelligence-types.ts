import {
  ConstitutionComplianceStatus,
  ConstitutionDecision,
  ConstitutionEventRecord,
  ConstitutionPriority,
  ConstitutionStateSnapshot,
} from '../constitution-runtime';
import { ExecutiveRuntimeStateSnapshot } from '../executive-intelligence';

export type StrategicHorizon = 'annual' | 'multi-year' | 'long-term';
export type StrategicRiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type StrategicSignalPolarity = 'positive' | 'neutral' | 'negative';

export interface StrategicSignal {
  readonly signalId: string;
  readonly source: 'constitution-runtime' | 'executive-intelligence';
  readonly category: 'constitutional-health' | 'architectural-health' | 'infrastructure-health' | 'platform-evolution';
  readonly polarity: StrategicSignalPolarity;
  readonly strength: number;
  readonly summary: string;
}

export interface StrategicSituationSnapshot {
  readonly observedAt: Date;
  readonly horizon: StrategicHorizon;
  readonly constitutionalHealth: number;
  readonly architecturalHealth: number;
  readonly infrastructureHealth: number;
  readonly platformEvolutionHealth: number;
  readonly strategicSignals: readonly StrategicSignal[];
  readonly eventCount: number;
  readonly executivePackageCount: number;
}

export interface StrategicOpportunity {
  readonly opportunityId: string;
  readonly title: string;
  readonly confidence: number;
  readonly impactHorizon: StrategicHorizon;
  readonly rationale: string;
}

export interface StrategicThreat {
  readonly threatId: string;
  readonly title: string;
  readonly level: StrategicRiskLevel;
  readonly urgencyHorizon: StrategicHorizon;
  readonly rationale: string;
  readonly mitigationDirection: string;
}

export interface StrategicForecast {
  readonly forecastId: string;
  readonly horizon: StrategicHorizon;
  readonly confidence: number;
  readonly projectedConstitutionalHealth: number;
  readonly projectedArchitecturalHealth: number;
  readonly projectedInfrastructureHealth: number;
  readonly projectedPlatformEvolutionHealth: number;
  readonly narrative: string;
}

export interface StrategicTrend {
  readonly trendId: string;
  readonly title: string;
  readonly direction: 'up' | 'flat' | 'down';
  readonly strength: number;
  readonly evidence: readonly string[];
}

export interface StrategicObjective {
  readonly objectiveId: string;
  readonly title: string;
  readonly owner: 'strategic-intelligence';
  readonly status: 'on-track' | 'watch' | 'at-risk';
  readonly progress: number;
  readonly rationale: string;
}

export interface StrategicRecommendation {
  readonly recommendationId: string;
  readonly title: string;
  readonly summary: string;
  readonly targetAudience: 'founder' | 'executive-intelligence';
  readonly advisoryOnly: true;
  readonly requiresFounderApproval: boolean;
}

export interface StrategicIntelligenceInput {
  readonly constitutionState: ConstitutionStateSnapshot;
  readonly constitutionEvents: readonly ConstitutionEventRecord[];
  readonly executiveState?: ExecutiveRuntimeStateSnapshot;
}

export interface StrategicIntelligencePackage {
  readonly packageId: string;
  readonly generatedAt: Date;
  readonly constitutionalDecisionContext?: ConstitutionDecision;
  readonly constitutionalComplianceContext?: ConstitutionComplianceStatus;
  readonly strategicSituation: StrategicSituationSnapshot;
  readonly opportunities: readonly StrategicOpportunity[];
  readonly threats: readonly StrategicThreat[];
  readonly forecast: StrategicForecast;
  readonly trends: readonly StrategicTrend[];
  readonly objectives: readonly StrategicObjective[];
  readonly recommendations: readonly StrategicRecommendation[];
  readonly executionDirective: 'advisory-only';
  readonly constitutionalPriority: ConstitutionPriority;
}

export interface StrategicRuntimeStateSnapshot {
  readonly totalPackages: number;
  readonly totalSignals: number;
  readonly lastPackageId?: string;
  readonly lastGeneratedAt?: Date;
  readonly constitutionalHealthHistory: readonly number[];
  readonly architecturalHealthHistory: readonly number[];
  readonly infrastructureHealthHistory: readonly number[];
  readonly platformEvolutionHistory: readonly number[];
}
