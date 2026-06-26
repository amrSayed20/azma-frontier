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
export type FounderExperienceLevel = 'low' | 'medium' | 'high' | 'critical';

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

export interface RuntimeHealthIndicatorView {
  readonly system: string;
  readonly status: RuntimeHealth;
  readonly summary: string;
  readonly metric: string;
}

export interface SovereignHighCouncilRuntimeView {
  readonly generatedAt: string;
  readonly founderId: string;
  readonly systemStatus: RuntimeHealth;
  readonly constitutionalStatus: {
    readonly loaded: boolean;
    readonly version: string;
    readonly complianceStatus: string;
    readonly decision: string;
    readonly complianceScore: number;
    readonly priority: string;
    readonly reason: string;
  };
  readonly founderBriefings: {
    readonly founder: FounderBriefingView;
    readonly executive: FounderBriefingView;
    readonly strategic: FounderBriefingView;
  };
  readonly executiveBriefing: {
    readonly summary: string;
    readonly overallRisk: string;
    readonly planStatus: string;
    readonly priority: string;
    readonly recommendations: readonly string[];
  };
  readonly strategicBriefing: {
    readonly summary: string;
    readonly forecastConfidence: number;
    readonly leadingOpportunity: string;
    readonly leadingThreat: string;
    readonly objectives: readonly string[];
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
  readonly founderExperience: {
    readonly doctrineRecommendation: string;
    readonly why: string;
    readonly whyNot: string;
    readonly confidenceLevel: string;
    readonly riskLevel: FounderExperienceLevel;
    readonly opportunityLevel: FounderExperienceLevel;
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
  readonly synchronizationStatus: {
    readonly synchronized: boolean;
    readonly busHealthy: boolean;
    readonly alWateenHealthy: boolean;
    readonly coherenceScore: number;
    readonly queueDepth: number;
    readonly invalidMessagesBlocked: number;
    readonly lastBusSynchronizationAt?: string;
    readonly lastCouncilSynchronizationAt?: string;
  };
  readonly systemHealthIndicators: readonly RuntimeHealthIndicatorView[];
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

function deriveRiskLevel(riskLevel: string | undefined): FounderExperienceLevel {
  if (riskLevel === 'critical' || riskLevel === 'high' || riskLevel === 'medium' || riskLevel === 'low') {
    return riskLevel;
  }

  return 'medium';
}

function deriveOpportunityLevel(score: number | undefined): FounderExperienceLevel {
  if (score === undefined) {
    return 'medium';
  }

  if (score >= 85) {
    return 'critical';
  }

  if (score >= 70) {
    return 'high';
  }

  if (score >= 45) {
    return 'medium';
  }

  return 'low';
}

function deriveHealthStatus(value: number, degradedAt: number, criticalAt: number): RuntimeHealth {
  if (value <= criticalAt) {
    return 'critical';
  }

  if (value <= degradedAt) {
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
  const selectedRanking =
    councilResult.doctrinePackage.ranking.find(
      (ranked) => ranked.pathId === councilResult.doctrinePackage.recommendation.selectedPathId
    ) ?? councilResult.doctrinePackage.ranking[0];
  const selectedFuture =
    futurePackage.rankedFutures.find((future) => future.pathId === futurePackage.recommendedPathId) ??
    futurePackage.rankedFutures[0];
  const selectedOpportunity = futurePackage.opportunities.find(
    (opportunity) => opportunity.pathId === futurePackage.recommendedPathId
  );
  const leadingOpportunity =
    strategicPackage.opportunities[0]?.title ?? selectedOpportunity?.summary ?? 'Runtime opportunity synthesis unavailable';
  const leadingThreat = strategicPackage.threats[0];
  const executivePackage = executiveRuntime.getLatestDecisionPackage();
  const synchronizationHealthy =
    busDiagnostics.healthy &&
    alWateenDiagnostics.healthy &&
    councilResult.unifiedPackage.correlation.coherenceScore >= 70 &&
    busDiagnostics.invalidMessagesBlocked === 0;
  const systemHealthIndicators: readonly RuntimeHealthIndicatorView[] = [
    {
      system: 'Constitution Runtime',
      status: constitutionState?.loaded ? 'healthy' : 'critical',
      summary: `Version ${constitutionState?.constitutionVersion ?? 'unknown'} with ${constitutionState?.articleCount ?? 0} articles loaded.`,
      metric: `${constitutionState?.policyCount ?? 0} policies`,
    },
    {
      system: 'Executive Intelligence',
      status: deriveHealthStatus(executiveSnapshot.totalDecisionPackages, 0, -1),
      summary: executivePackage?.situation.constitutionalSignals[0] ?? 'Executive package stream active.',
      metric: `${executiveSnapshot.totalDecisionPackages} packages`,
    },
    {
      system: 'Strategic Intelligence',
      status: deriveHealthStatus(strategicPackage.forecast.confidence, 55, 35),
      summary: strategicPackage.forecast.narrative,
      metric: `${strategicSnapshot.totalPackages} packages`,
    },
    {
      system: 'Future Simulation',
      status: deriveRiskLevel(selectedFuture?.riskLevel) === 'critical' ? 'critical' : selectedFuture?.riskLevel === 'high' ? 'degraded' : 'healthy',
      summary: futurePackage.recommendationSummary,
      metric: `${futureSnapshot.totalSimulatedPaths} paths`,
    },
    {
      system: 'Sovereign Intelligence Bus',
      status: busDiagnostics.healthy ? 'healthy' : 'critical',
      summary: `Queue depth ${busDiagnostics.queueDepth}; invalid messages blocked ${busDiagnostics.invalidMessagesBlocked}.`,
      metric: `${busSnapshot.totalRoutedMessages} routed`,
    },
    {
      system: 'Sovereign Perception Layer',
      status: deriveHealthStatus(perceptionSnapshot.totalPackages, 0, -1),
      summary: `Observation coverage includes ${perceptionSnapshot.totalObservations} runtime signals.`,
      metric: `${perceptionSnapshot.totalPackages} packages`,
    },
    {
      system: 'Al-Wateen Living Intelligence',
      status: alWateenDiagnostics.healthy ? 'healthy' : 'critical',
      summary: councilResult.unifiedPackage.understanding.perceptionSummary,
      metric: `${alWateenRuntime.snapshot().totalPackages} packages`,
    },
    {
      system: 'Imperial Decision Doctrine',
      status: councilResult.doctrinePackage.ethicalPolicy.compliant ? 'healthy' : 'critical',
      summary: councilResult.doctrinePackage.recommendation.justification.constitutionalExplanation,
      metric: `${doctrineSnapshot.totalPackages} packages`,
    },
    {
      system: 'Sovereign High Council Runtime',
      status: synchronizationHealthy ? 'healthy' : 'degraded',
      summary: `Founder session ${councilResult.session.sessionId} synchronized.`,
      metric: `${councilSnapshot.state.totalSynchronizations} syncs`,
    },
  ];

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
    constitutionalStatus: {
      loaded: constitutionState?.loaded ?? false,
      version: constitutionState?.constitutionVersion ?? 'unknown',
      complianceStatus: evaluation.status,
      decision: evaluation.decision,
      complianceScore: evaluation.complianceScore,
      priority: constitutionState?.lastPriority ?? action.priority,
      reason: evaluation.reasons[0] ?? 'Constitution Runtime completed evaluation.',
    },
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
    executiveBriefing: {
      summary: councilResult.unifiedPackage.understanding.executiveSummary,
      overallRisk: executivePackage?.risks.overallRisk ?? 'medium',
      planStatus: executivePackage?.plan.status ?? 'pending-founder-review',
      priority: executivePackage?.priority.executivePriority ?? action.priority,
      recommendations: executivePackage?.recommendations.map((recommendation) => recommendation.summary) ?? [],
    },
    strategicBriefing: {
      summary: councilResult.unifiedPackage.understanding.strategicSummary,
      forecastConfidence: strategicPackage.forecast.confidence,
      leadingOpportunity,
      leadingThreat: leadingThreat
        ? `${leadingThreat.title}: ${leadingThreat.rationale}`
        : 'Strategic threat stream reports no leading threat.',
      objectives: strategicPackage.objectives.map((objective) => `${objective.title}: ${objective.status}`),
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
    founderExperience: {
      doctrineRecommendation: councilResult.doctrinePackage.recommendation.justification.constitutionalExplanation,
      why: selectedRanking?.why ?? councilResult.doctrinePackage.recommendation.justification.strategicExplanation,
      whyNot: selectedRanking?.whyNot ?? councilResult.doctrinePackage.recommendation.justification.uncertaintyStatement,
      confidenceLevel: councilResult.doctrinePackage.recommendation.justification.confidence,
      riskLevel: deriveRiskLevel(selectedFuture?.riskLevel),
      opportunityLevel: deriveOpportunityLevel(selectedOpportunity?.score),
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
    synchronizationStatus: {
      synchronized: synchronizationHealthy,
      busHealthy: busDiagnostics.healthy,
      alWateenHealthy: alWateenDiagnostics.healthy,
      coherenceScore: councilResult.unifiedPackage.correlation.coherenceScore,
      queueDepth: busDiagnostics.queueDepth,
      invalidMessagesBlocked: busDiagnostics.invalidMessagesBlocked,
      lastBusSynchronizationAt: busSnapshot.lastSynchronizationAt?.toISOString(),
      lastCouncilSynchronizationAt: councilSnapshot.state.lastSyncedAt?.toISOString(),
    },
    systemHealthIndicators,
    hallInsights,
  };
}
