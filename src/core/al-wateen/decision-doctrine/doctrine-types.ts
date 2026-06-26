import { ConstitutionPriority } from '../../constitution-runtime';
import { ConstitutionalIntelligencePackage } from '../living-intelligence';

export type DecisionDoctrineHorizon = 'immediate' | 'mid-term' | 'long-term';
export type DoctrineConfidence = 'low' | 'medium' | 'high';

export interface DoctrineCandidatePath {
  readonly pathId: string;
  readonly title: string;
  readonly why: string;
  readonly whyNot: string;
  readonly constitutionalImpact: number;
  readonly strategicImpact: number;
  readonly sustainabilityImpact: number;
  readonly speedBenefit: number;
  readonly uncertainty: string;
}

export interface DecisionDoctrineInput {
  readonly requestedAt: Date;
  readonly founderIntent: string;
  readonly constitutionalPackage: ConstitutionalIntelligencePackage;
  readonly candidatePaths: readonly DoctrineCandidatePath[];
}

export interface FounderIntentSignal {
  readonly intentId: string;
  readonly intentSummary: string;
  readonly urgency: 'low' | 'normal' | 'high';
  readonly constitutionalSensitivity: 'low' | 'moderate' | 'high';
}

export interface DoctrinePriorityResolution {
  readonly constitutionalPriority: ConstitutionPriority;
  readonly longTermPriorityWeight: number;
  readonly speedPenaltyWeight: number;
}

export interface EthicalPolicyResult {
  readonly compliant: boolean;
  readonly policyNotes: readonly string[];
  readonly blockedPathIds: readonly string[];
}

export interface LongTermImpactAssessment {
  readonly pathId: string;
  readonly horizon: DecisionDoctrineHorizon;
  readonly strategicDurability: number;
  readonly constitutionalDurability: number;
  readonly sustainabilityDurability: number;
}

export interface TradeoffScore {
  readonly pathId: string;
  readonly constitutionalScore: number;
  readonly strategicScore: number;
  readonly longTermScore: number;
  readonly uncertaintyPenalty: number;
  readonly speedPenalty: number;
  readonly totalScore: number;
}

export interface RankedDoctrinePath {
  readonly pathId: string;
  readonly rank: number;
  readonly score: number;
  readonly why: string;
  readonly whyNot: string;
}

export interface RecommendationJustification {
  readonly confidence: DoctrineConfidence;
  readonly confidenceReason: string;
  readonly uncertaintyStatement: string;
  readonly constitutionalExplanation: string;
  readonly strategicExplanation: string;
  readonly longTermExplanation: string;
}

export interface DoctrineRecommendation {
  readonly recommendationId: string;
  readonly selectedPathId: string;
  readonly advisoryOnly: true;
  readonly executionAuthority: 'none';
  readonly justification: RecommendationJustification;
}

export interface ImperialDecisionDoctrinePackage {
  readonly packageId: string;
  readonly generatedAt: Date;
  readonly founderIntent: FounderIntentSignal;
  readonly priorityResolution: DoctrinePriorityResolution;
  readonly ethicalPolicy: EthicalPolicyResult;
  readonly impacts: readonly LongTermImpactAssessment[];
  readonly tradeoffs: readonly TradeoffScore[];
  readonly ranking: readonly RankedDoctrinePath[];
  readonly recommendation: DoctrineRecommendation;
  readonly immutable: true;
}

export interface DoctrineRuntimeSnapshot {
  readonly totalPackages: number;
  readonly lastPackageId?: string;
  readonly lastRecommendationId?: string;
  readonly lastGeneratedAt?: Date;
}
