import {
  ConstitutionActionContext,
  ConstitutionEvaluationResult,
  ConstitutionPriority,
  ConstitutionStateSnapshot,
} from '../../constitution-runtime';
import {
  ExecutiveDecisionPackage,
  ExecutiveRuntimeStateSnapshot,
} from '../../executive-intelligence';
import {
  StrategicIntelligencePackage,
  StrategicRuntimeStateSnapshot,
} from '../../strategic-intelligence';
import {
  FutureSimulationPackage,
  SimulationRuntimeStateSnapshot,
} from '../../future-simulation';
import {
  BusDiagnostics,
  BusRuntimeSnapshot,
  RoutedBusMessage,
} from '../../sovereign-intelligence-bus';
import {
  PerceptionRuntimeSnapshot,
  SovereignPerceptionPackage,
} from '../../sovereign-perception';

export interface AlWateenIntegrationInput {
  readonly requestedAt: Date;
  readonly trigger: 'manual' | 'scheduled' | 'event-driven';
  readonly actionContext?: ConstitutionActionContext;
}

export interface AlWateenIntelligenceStreams {
  readonly constitutionState?: ConstitutionStateSnapshot;
  readonly constitutionEvaluation?: ConstitutionEvaluationResult;
  readonly executiveState: ExecutiveRuntimeStateSnapshot;
  readonly latestExecutivePackage?: ExecutiveDecisionPackage;
  readonly strategicState: StrategicRuntimeStateSnapshot;
  readonly latestStrategicPackage?: StrategicIntelligencePackage;
  readonly futureSimulationState: SimulationRuntimeStateSnapshot;
  readonly latestFutureSimulationPackage?: FutureSimulationPackage;
  readonly busState: BusRuntimeSnapshot;
  readonly busDiagnostics: BusDiagnostics;
  readonly busSynchronization: readonly RoutedBusMessage[];
  readonly perceptionState: PerceptionRuntimeSnapshot;
  readonly latestPerceptionPackage?: SovereignPerceptionPackage;
}

export interface CorrelatedIntelligenceView {
  readonly constitutionalHealth: number;
  readonly executiveReadiness: number;
  readonly strategicReadiness: number;
  readonly futureConfidence: number;
  readonly synchronizationHealth: number;
  readonly perceptionCoverage: number;
  readonly coherenceScore: number;
}

export interface ConstitutionalUnderstanding {
  readonly understandingId: string;
  readonly generatedAt: Date;
  readonly dominantPriority: ConstitutionPriority;
  readonly constitutionalSummary: string;
  readonly executiveSummary: string;
  readonly strategicSummary: string;
  readonly futureSummary: string;
  readonly busSummary: string;
  readonly perceptionSummary: string;
}

export interface IntelligenceBriefing {
  readonly briefingId: string;
  readonly audience: 'founder' | 'executive' | 'strategic';
  readonly summary: string;
  readonly keySignals: readonly string[];
  readonly recommendedFocus: readonly string[];
}

export interface AlWateenRecommendation {
  readonly recommendationId: string;
  readonly summary: string;
  readonly priority: ConstitutionPriority;
  readonly advisoryOnly: true;
  readonly executionAuthority: 'none';
}

export interface ConstitutionalIntelligencePackage {
  readonly packageId: string;
  readonly generatedAt: Date;
  readonly streams: AlWateenIntelligenceStreams;
  readonly correlation: CorrelatedIntelligenceView;
  readonly understanding: ConstitutionalUnderstanding;
  readonly founderBriefing: IntelligenceBriefing;
  readonly executiveBriefing: IntelligenceBriefing;
  readonly strategicBriefing: IntelligenceBriefing;
  readonly recommendations: readonly AlWateenRecommendation[];
  readonly immutable: true;
  readonly directive: 'advisory-only';
}

export interface AlWateenRuntimeSnapshot {
  readonly totalPackages: number;
  readonly lastPackageId?: string;
  readonly lastGeneratedAt?: Date;
  readonly lastCoherenceScore?: number;
}
