import { ConstitutionPriority } from '../../constitution-runtime';
import { ConstitutionalIntelligencePackage } from '../living-intelligence';

export type PersonalityTrait =
  | 'calm'
  | 'wise'
  | 'constitutional'
  | 'honest'
  | 'transparent'
  | 'strategic'
  | 'respectful';

export type CertaintyLevel = 'low' | 'medium' | 'high';
export type AdvisoryTone = 'stabilizing' | 'guiding' | 'cautionary' | 'protective';

export interface PersonalityContext {
  readonly sessionId: string;
  readonly founderId: string;
  readonly generatedAt: Date;
  readonly constitutionalPackage: ConstitutionalIntelligencePackage;
}

export interface ConstitutionalConsciousnessSignal {
  readonly signalId: string;
  readonly constitutionalPriority: ConstitutionPriority;
  readonly coherenceScore: number;
  readonly constitutionalRisk: 'low' | 'moderate' | 'elevated';
  readonly summary: string;
}

export interface FounderRelationshipState {
  readonly founderId: string;
  readonly trustScore: number;
  readonly constitutionalConsistencyScore: number;
  readonly respectfulChallengeCount: number;
  readonly lastUpdatedAt: Date;
}

export interface AdvisoryStyle {
  readonly tone: AdvisoryTone;
  readonly certainty: CertaintyLevel;
  readonly confidenceReason: string;
  readonly uncertaintyDisclosure?: string;
}

export interface CommunicationPolicyResult {
  readonly compliant: boolean;
  readonly blockedPatterns: readonly string[];
  readonly notes: readonly string[];
}

export interface ComposedResponse {
  readonly responseId: string;
  readonly greeting: string;
  readonly assessment: string;
  readonly recommendation: string;
  readonly caution?: string;
  readonly uncertaintyStatement?: string;
  readonly constitutionalAnchor: string;
  readonly tone: AdvisoryTone;
}

export interface PersonalityInteraction {
  readonly interactionId: string;
  readonly context: PersonalityContext;
  readonly consciousness: ConstitutionalConsciousnessSignal;
  readonly relationship: FounderRelationshipState;
  readonly style: AdvisoryStyle;
  readonly policy: CommunicationPolicyResult;
  readonly response: ComposedResponse;
  readonly traits: readonly PersonalityTrait[];
}

export interface PersonalityRuntimeSnapshot {
  readonly totalInteractions: number;
  readonly lastInteractionId?: string;
  readonly averageTrustScore: number;
  readonly lastUpdatedAt?: Date;
}
