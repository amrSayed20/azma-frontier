import {
  AlWateenIntegrationInput,
  AlWateenRuntimeSnapshot,
  ConstitutionalIntelligencePackage,
  DoctrineCandidatePath,
  ImperialDecisionDoctrinePackage,
  IntelligenceBriefing,
} from '../al-wateen';
import { FutureSimulationPackage } from '../future-simulation';

export interface FounderSession {
  readonly sessionId: string;
  readonly founderId: string;
  readonly startedAt: Date;
  readonly lastSyncedAt?: Date;
  readonly trigger?: AlWateenIntegrationInput['trigger'];
}

export interface CouncilBriefingBundle {
  readonly founderBriefing: IntelligenceBriefing;
  readonly executiveBriefing: IntelligenceBriefing;
  readonly strategicBriefing: IntelligenceBriefing;
}

export interface CouncilSynchronizationResult {
  readonly synchronizationId: string;
  readonly session: FounderSession;
  readonly unifiedPackage: ConstitutionalIntelligencePackage;
  readonly briefingBundle: CouncilBriefingBundle;
  readonly futureSimulationRecommendation: {
    readonly packageId?: string;
    readonly recommendedPathId?: string;
    readonly summary: string;
  };
  readonly doctrinePackage: ImperialDecisionDoctrinePackage;
  readonly candidatePathsUsed: readonly DoctrineCandidatePath[];
  readonly immutable: true;
}

export interface CouncilRuntimeStateSnapshot {
  readonly totalSessions: number;
  readonly totalSynchronizations: number;
  readonly lastSessionId?: string;
  readonly lastSynchronizationId?: string;
  readonly lastSyncedAt?: Date;
}

export interface SovereignCouncilRuntimeSnapshot {
  readonly state: CouncilRuntimeStateSnapshot;
  readonly alWateenRuntime?: AlWateenRuntimeSnapshot;
}

export interface CouncilRuntimeInput {
  readonly founderId: string;
  readonly trigger?: AlWateenIntegrationInput['trigger'];
  readonly founderIntent: string;
  readonly simulationPathCount: number;
  readonly actionContext?: AlWateenIntegrationInput['actionContext'];
  readonly existingFuturePackage?: FutureSimulationPackage;
}
