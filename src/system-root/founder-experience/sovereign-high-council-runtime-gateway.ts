import {
  ConstitutionActionContext,
  ConstitutionRuntime,
} from '../../core/constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../../core/executive-intelligence';
import { StrategicIntelligenceRuntime } from '../../core/strategic-intelligence';
import { FutureSimulationRuntime } from '../../core/future-simulation';
import { SovereignIntelligenceBusApi } from '../../core/sovereign-intelligence-bus';
import { SovereignPerceptionRuntime } from '../../core/sovereign-perception';
import {
  AlWateenIntegrationRuntime,
  DoctrineRuntime,
  PersonalityRuntime,
} from '../../core/al-wateen';
import { createCouncilRuntime } from '../../core/sovereign-high-council-runtime';

export type RuntimeHealth = 'healthy' | 'degraded' | 'critical';

export interface HallRuntimeInsight {
  readonly headline: string;
  readonly details: readonly string[];
}

export interface FounderBriefingView {
  readonly summary: string;
  readonly keySignals: readonly string[];
}

export interface DoctrineRankingView {
  readonly pathId: string;
  readonly score: number;
  readonly why: string;
  readonly whyNot: string;
}

export interface SovereignHighCouncilRuntimeView {
  readonly generatedAt: string;
  readonly founderId: string;
  readonly systemStatus: RuntimeHealth;
  readonly founderBriefings: {
    readonly founder: FounderBriefingView;
    readonly executive: FounderBriefingView;
    readonly strategic: FounderBriefingView;
  };
  readonly constitutionalIntelligenceSummary: string;
  readonly strategicRecommendations: readonly string[];
  readonly doctrine: {
    readonly selectedPathId: string;
    readonly confidence: string;
    readonly confidenceReason: string;
    readonly rankings: readonly DoctrineRankingView[];
  };
  readonly simulation: {
    readonly summary: string;
    readonly recommendedPathId?: string;
    readonly topFutures: readonly {
      readonly pathId: string;
      readonly rank: number;
      readonly score: number;
      readonly riskLevel: string;
      readonly probability: number;
    }[];
  };
  readonly personality: {
    readonly greeting: string;
    readonly assessment: string;
    readonly recommendation: string;
    readonly constitutionalAnchor: string;
  };
  readonly runtimeSnapshots: {
    readonly constitutionLoaded: boolean;
    readonly executivePackages: number;
    readonly strategicPackages: number;
    readonly simulationPackages: number;
    readonly busMessagesRouted: number;
    readonly perceptionPackages: number;
    readonly alWateenPackages: number;
    readonly doctrinePackages: number;
    readonly councilSynchronizations: number;
  };
  readonly hallInsights: Readonly<Record<string, HallRuntimeInsight>>;
}

function createActionContext(founderId: string, founderIntent: string): ConstitutionActionContext {
  return {
    actionId: `founder-action-${Date.now().toString(36)}`,
    actionType: 'founder-interaction',
    title: 'Founder Council Synchronization',
    description: founderIntent,
    targetModule: 'sovereign-high-council',
    requestedBy: founderId,
    requestedAt: new Date(),
    scope: 'founder-interaction',
    priority: 'constitutional',
    payload: {
      intent: founderIntent,
    },
    metadata: {
      surface: 'sovereign-high-council-page',
    },
  };
}

function deriveSystemStatus(input: {
  readonly busHealthy: boolean;
  readonly alWateenHealthy: boolean;
  readonly coherenceScore: number;
  readonly blockedMessages: number;
}): RuntimeHealth {
  if (!input.busHealthy || !input.alWateenHealthy || input.coherenceScore < 50 || input.blockedMessages > 0) {
    return 'critical';
  }

  if (input.coherenceScore < 70) {
    return 'degraded';
  }

  return 'healthy';
}

export function buildSovereignHighCouncilRuntimeView(input?: {
  readonly founderId?: string;
  readonly founderIntent?: string;
  readonly simulationPathCount?: number;
  readonly trigger?: 'manual' | 'scheduled' | 'event-driven';
}): SovereignHighCouncilRuntimeView {
  const founderId = input?.founderId ?? 'founder-imperial';
  const founderIntent =
    input?.founderIntent ??
    'Maintain constitutional coherence while selecting the most durable strategic path for the empire.';
  const simulationPathCount = Math.max(1, Math.min(10, input?.simulationPathCount ?? 3));
  const trigger = input?.trigger ?? 'manual';

  const constitutionRuntime = new ConstitutionRuntime();
  constitutionRuntime.loadConstitution();

  const action = createActionContext(founderId, founderIntent);
  const evaluation = constitutionRuntime.evaluate(action);

  const executiveRuntime = new ExecutiveIntelligenceRuntime(constitutionRuntime);
  executiveRuntime.processDecision(action, evaluation);

  const strategicRuntime = new StrategicIntelligenceRuntime(constitutionRuntime, executiveRuntime);
  const strategicPackage = strategicRuntime.generatePackage();

  const futureSimulationRuntime = new FutureSimulationRuntime(
    constitutionRuntime,
    executiveRuntime,
    strategicRuntime
  );
  const futurePackage = futureSimulationRuntime.simulateAction(
    action,
    `founder-sim-${Date.now().toString(36)}`,
    simulationPathCount
  );

  const busApi = new SovereignIntelligenceBusApi(
    constitutionRuntime,
    executiveRuntime,
    strategicRuntime,
    futureSimulationRuntime
  );
  busApi.synchronize();

  const perceptionRuntime = new SovereignPerceptionRuntime(
    constitutionRuntime,
    executiveRuntime,
    strategicRuntime,
    futureSimulationRuntime,
    busApi
  );
  perceptionRuntime.perceive();

  const alWateenRuntime = new AlWateenIntegrationRuntime(
    constitutionRuntime,
    executiveRuntime,
    strategicRuntime,
    futureSimulationRuntime,
    busApi,
    perceptionRuntime
  );
  const unifiedPackage = alWateenRuntime.integrateWithAction(action, trigger);
  const alWateenDiagnostics = alWateenRuntime.diagnostics();

  const personalityRuntime = new PersonalityRuntime();
  const personality = personalityRuntime.engage(
    `founder-session-${Date.now().toString(36)}`,
    founderId,
    unifiedPackage
  );

  const doctrineRuntime = new DoctrineRuntime();
  const councilRuntime = createCouncilRuntime(
    alWateenRuntime,
    doctrineRuntime,
    futureSimulationRuntime
  );
  const councilResult = councilRuntime.synchronizeFounderSession({
    founderId,
    founderIntent,
    simulationPathCount,
    actionContext: action,
    existingFuturePackage: futurePackage,
    trigger,
  });

  const constitutionState = constitutionRuntime.getState();
  const executiveSnapshot = executiveRuntime.getSnapshot();
  const strategicSnapshot = strategicRuntime.getSnapshot();
  const futureSnapshot = futureSimulationRuntime.getSnapshot();
  const busDiagnostics = busApi.diagnostics();
  const busSnapshot = busApi.snapshot();
  const perceptionSnapshot = perceptionRuntime.snapshot();
  const doctrineSnapshot = doctrineRuntime.snapshot();
  const councilSnapshot = councilRuntime.snapshot();

  const hallInsights: Readonly<Record<string, HallRuntimeInsight>> = {
    'ch-sovereign-assistant': {
      headline: councilResult.unifiedPackage.founderBriefing.summary,
      details: councilResult.unifiedPackage.founderBriefing.keySignals,
    },
    'ch-empire-pulse': {
      headline: `Bus healthy: ${busDiagnostics.healthy ? 'yes' : 'no'} | Coherence: ${councilResult.unifiedPackage.correlation.coherenceScore}`,
      details: [
        `Published messages: ${busSnapshot.totalPublishedMessages}`,
        `Routed messages: ${busSnapshot.totalRoutedMessages}`,
        `Synchronization cycles: ${busSnapshot.totalSynchronizationCycles}`,
      ],
    },
    'ch-architectural-health': {
      headline: `Constitution loaded: ${constitutionState?.loaded ? 'yes' : 'no'}`,
      details: [
        `Articles: ${constitutionState?.articleCount ?? 0}`,
        `Policies: ${constitutionState?.policyCount ?? 0}`,
        `Events: ${constitutionState?.eventCount ?? 0}`,
      ],
    },
    'ch-infrastructure-health': {
      headline: `Perception observations: ${perceptionSnapshot.totalObservations}`,
      details: [
        `Perception packages: ${perceptionSnapshot.totalPackages}`,
        `Last observed package: ${perceptionSnapshot.lastPackageId ?? 'none'}`,
      ],
    },
    'ch-resource-intelligence': {
      headline: futurePackage.recommendationSummary,
      details: futurePackage.risks.slice(0, 3).map((risk) => `${risk.pathId}: ${risk.level} (${risk.score})`),
    },
    'ch-financial-intelligence': {
      headline: strategicPackage.forecast.narrative,
      details: strategicPackage.recommendations.map((recommendation) => recommendation.summary).slice(0, 3),
    },
    'ch-evolution-intelligence': {
      headline: `Recommended future path: ${futurePackage.recommendedPathId}`,
      details: futurePackage.rankedFutures.slice(0, 3).map((future) => `${future.pathId} rank ${future.rank} score ${future.score.toFixed(2)}`),
    },
    'ch-security-intelligence': {
      headline: `Invalid messages blocked: ${busSnapshot.invalidMessagesBlocked}`,
      details: [
        `Queue depth: ${busDiagnostics.queueDepth}`,
        `Bus healthy: ${busDiagnostics.healthy ? 'yes' : 'no'}`,
      ],
    },
    'ch-founder-command': {
      headline: councilResult.doctrinePackage.recommendation.justification.constitutionalExplanation,
      details: councilResult.doctrinePackage.ranking.slice(0, 3).map((ranked) => `${ranked.pathId}: ${ranked.why}`),
    },
    'ch-emergency-command': {
      headline: councilResult.unifiedPackage.understanding.constitutionalSummary,
      details: councilResult.unifiedPackage.recommendations.map((recommendation) => recommendation.summary).slice(0, 3),
    },
    'ch-development-observatory': {
      headline: `Executive packages: ${executiveSnapshot.totalDecisionPackages}`,
      details: [
        `Observed events: ${executiveSnapshot.totalObservedEvents}`,
        `Latest package: ${executiveSnapshot.lastPackageId ?? 'none'}`,
      ],
    },
    'ch-broadcast-center': {
      headline: `Routed messages: ${busSnapshot.totalRoutedMessages}`,
      details: busApi.recentRouted(3).map((message) => `${message.source} -> ${message.target} (${message.priority})`),
    },
    'ch-gift-distribution': {
      headline: `Strategic recommendations: ${strategicPackage.recommendations.length}`,
      details: strategicPackage.recommendations.map((recommendation) => recommendation.title).slice(0, 3),
    },
    'ch-future-laboratory': {
      headline: futurePackage.recommendationSummary,
      details: futurePackage.rankedFutures.slice(0, 3).map((future) => `${future.pathId} probability ${future.probability.toFixed(3)}`),
    },
  };

  return {
    generatedAt: new Date().toISOString(),
    founderId,
    systemStatus: deriveSystemStatus({
      busHealthy: busDiagnostics.healthy,
      alWateenHealthy: alWateenDiagnostics.healthy,
      coherenceScore: councilResult.unifiedPackage.correlation.coherenceScore,
      blockedMessages: busSnapshot.invalidMessagesBlocked,
    }),
    founderBriefings: {
      founder: {
        summary: councilResult.briefingBundle.founderBriefing.summary,
        keySignals: councilResult.briefingBundle.founderBriefing.keySignals,
      },
      executive: {
        summary: councilResult.briefingBundle.executiveBriefing.summary,
        keySignals: councilResult.briefingBundle.executiveBriefing.keySignals,
      },
      strategic: {
        summary: councilResult.briefingBundle.strategicBriefing.summary,
        keySignals: councilResult.briefingBundle.strategicBriefing.keySignals,
      },
    },
    constitutionalIntelligenceSummary: councilResult.unifiedPackage.understanding.constitutionalSummary,
    strategicRecommendations: strategicPackage.recommendations.map((recommendation) => recommendation.summary),
    doctrine: {
      selectedPathId: councilResult.doctrinePackage.recommendation.selectedPathId,
      confidence: councilResult.doctrinePackage.recommendation.justification.confidence,
      confidenceReason: councilResult.doctrinePackage.recommendation.justification.confidenceReason,
      rankings: councilResult.doctrinePackage.ranking.map((ranked) => ({
        pathId: ranked.pathId,
        score: ranked.score,
        why: ranked.why,
        whyNot: ranked.whyNot,
      })),
    },
    simulation: {
      summary: councilResult.futureSimulationRecommendation.summary,
      recommendedPathId: councilResult.futureSimulationRecommendation.recommendedPathId,
      topFutures: futurePackage.rankedFutures.slice(0, 3).map((future) => ({
        pathId: future.pathId,
        rank: future.rank,
        score: future.score,
        riskLevel: future.riskLevel,
        probability: future.probability,
      })),
    },
    personality: {
      greeting: personality.response.greeting,
      assessment: personality.response.assessment,
      recommendation: personality.response.recommendation,
      constitutionalAnchor: personality.response.constitutionalAnchor,
    },
    runtimeSnapshots: {
      constitutionLoaded: constitutionState?.loaded ?? false,
      executivePackages: executiveSnapshot.totalDecisionPackages,
      strategicPackages: strategicSnapshot.totalPackages,
      simulationPackages: futureSnapshot.totalPackages,
      busMessagesRouted: busSnapshot.totalRoutedMessages,
      perceptionPackages: perceptionSnapshot.totalPackages,
      alWateenPackages: alWateenRuntime.snapshot().totalPackages,
      doctrinePackages: doctrineSnapshot.totalPackages,
      councilSynchronizations: councilSnapshot.state.totalSynchronizations,
    },
    hallInsights,
  };
}
