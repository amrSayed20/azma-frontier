import {
  ConstitutionDecision,
  ConstitutionEvaluationResult,
  ConstitutionPriority,
  ConstitutionStateSnapshot,
} from '../constitution-runtime';
import { ExecutiveDecisionPackage, ExecutiveRuntimeStateSnapshot } from '../executive-intelligence';
import { StrategicIntelligencePackage, StrategicRuntimeStateSnapshot } from '../strategic-intelligence';

export type SimulationDecisionActor = 'founder' | 'executive' | 'strategic';
export type SimulationRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface SimulationInput {
  readonly simulationId: string;
  readonly requestedAt: Date;
  readonly pathCount: number;
  readonly constitutionState: ConstitutionStateSnapshot;
  readonly constitutionEvaluation?: ConstitutionEvaluationResult;
  readonly executiveState?: ExecutiveRuntimeStateSnapshot;
  readonly latestExecutivePackage?: ExecutiveDecisionPackage;
  readonly strategicState?: StrategicRuntimeStateSnapshot;
  readonly latestStrategicPackage?: StrategicIntelligencePackage;
}

export interface SimulatedDecision {
  readonly actor: SimulationDecisionActor;
  readonly decision: ConstitutionDecision | 'approve' | 'reject' | 'defer' | 'escalate' | 'observe';
  readonly confidence: number;
  readonly rationale: string;
}

export interface SimulationScenario {
  readonly scenarioId: string;
  readonly title: string;
  readonly assumptions: readonly string[];
  readonly founderDecision: SimulatedDecision;
  readonly executiveDecision: SimulatedDecision;
  readonly strategicDecision: SimulatedDecision;
}

export interface SimulationPath {
  readonly pathId: string;
  readonly scenarioId: string;
  readonly sequence: readonly string[];
  readonly constitutionalOutcomeScore: number;
  readonly resourceConsumptionScore: number;
  readonly financialImpactScore: number;
  readonly securityImpactScore: number;
  readonly infrastructureImpactScore: number;
}

export interface PathProbability {
  readonly pathId: string;
  readonly probability: number;
}

export interface RiskProjection {
  readonly pathId: string;
  readonly level: SimulationRiskLevel;
  readonly score: number;
  readonly summary: string;
}

export interface OpportunityProjection {
  readonly pathId: string;
  readonly score: number;
  readonly summary: string;
}

export interface FutureTimelinePoint {
  readonly yearOffset: number;
  readonly constitutionalHealth: number;
  readonly resourcePressure: number;
  readonly securityStability: number;
  readonly infrastructureResilience: number;
}

export interface FutureTimeline {
  readonly pathId: string;
  readonly points: readonly FutureTimelinePoint[];
}

export interface DecisionImpact {
  readonly pathId: string;
  readonly founderImpact: number;
  readonly executiveImpact: number;
  readonly strategicImpact: number;
  readonly aggregateImpact: number;
}

export interface ConstitutionalOutcome {
  readonly pathId: string;
  readonly outcomeLabel: 'best' | 'acceptable' | 'risky' | 'unconstitutional';
  readonly constitutionalScore: number;
  readonly alignsWithConstitution: boolean;
}

export interface RankedFuture {
  readonly pathId: string;
  readonly rank: number;
  readonly score: number;
  readonly probability: number;
  readonly riskLevel: SimulationRiskLevel;
  readonly constitutionalOutcome: ConstitutionalOutcome['outcomeLabel'];
}

export interface FutureSimulationPackage {
  readonly packageId: string;
  readonly simulationId: string;
  readonly generatedAt: Date;
  readonly scenarios: readonly SimulationScenario[];
  readonly paths: readonly SimulationPath[];
  readonly probabilities: readonly PathProbability[];
  readonly risks: readonly RiskProjection[];
  readonly opportunities: readonly OpportunityProjection[];
  readonly timelines: readonly FutureTimeline[];
  readonly impacts: readonly DecisionImpact[];
  readonly constitutionalOutcomes: readonly ConstitutionalOutcome[];
  readonly rankedFutures: readonly RankedFuture[];
  readonly recommendedPathId: string;
  readonly recommendationSummary: string;
  readonly executionDirective: 'simulation-only';
}

export interface SimulationRuntimeStateSnapshot {
  readonly totalPackages: number;
  readonly totalSimulatedPaths: number;
  readonly totalSimulatedScenarios: number;
  readonly lastPackageId?: string;
  readonly lastSimulationId?: string;
  readonly lastGeneratedAt?: Date;
}
