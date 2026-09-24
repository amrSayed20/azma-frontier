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
import { measureOperationalState } from '../../operational-truth/measure';
import { readEmpireFacts, say } from '../../operational-truth/empire-facts';
import { getDb } from '../../persistent-storage';
import { CHAMBER_TRUTH } from '../../chamber-truth';

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

/**
 * A hall's insight must be about that hall.
 *
 * SEEN on the Council's own screen 2026-09-24: «وعي المال — الإيراد والكلفة»
 * displayed a sentence about strategic resilience while every payment key was
 * missing, and «وعي الموارد — المعالجة والذاكرة والتخزين» displayed a sentence
 * about constitutional safety while the heap sat at 96%. Every hall carried a
 * name and showed whichever runtime sentence was nearest to hand.
 *
 * The halls below that CAN be answered from measurement are answered from it,
 * and each carries the figures its claim rests on — لسان صدق وبرهان.
 */
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

  // The platform as it actually is, and what it has actually done. One
  // measurement, one read, shared with /api/health — not a second opinion.
  const operational = measureOperationalState();
  const facts = (() => {
    try { return readEmpireFacts(getDb()); } catch { return null; }
  })();
  const tierAr: Record<string, string> = { NORMAL: 'سليمة', WARNING: 'تحذير', CRITICAL: 'حرجة' };
  const missingRevenue = operational.missingRevenueProviders;

  // The Empire's own declared capabilities — the registry is the single
  // authority for what the Chambers can do, so «evolution» and «the future
  // laboratory» are answered from it rather than from a simulation id minted
  // by this request.
  const chambers = Object.values(CHAMBER_TRUTH);
  const declaredCapabilities = chambers.reduce((sum, chamber) => sum + chamber.capabilities.length, 0);
  const deferredResponsibilities = chambers.reduce((sum, chamber) => sum + chamber.deferred.length, 0);

  // What the Empire is actually unwell about, in its own words. Empty means
  // nothing measured is wrong — which is itself a truthful thing to say.
  const standingConcerns: string[] = [
    ...missingRevenue.map((provider) => `${provider.nameAr} غير مهيّأ`),
    ...(operational.memoryTier !== 'NORMAL' && operational.heapUtilizationPct !== null
      ? [`الذاكرة ${operational.heapUtilizationPct}٪ — ${tierAr[operational.memoryTier]}`] : []),
    ...(operational.diskTier !== 'NORMAL' && operational.diskUsedPct !== null
      ? [`القرص ${operational.diskUsedPct}٪ — ${tierAr[operational.diskTier]}`] : []),
    ...(facts === null ? ['تعذّرت قراءة سجلّات الإمبراطوريّة'] : []),
  ];
  const uptimeSeconds = Math.floor(process.uptime());
  const uptimeAr = uptimeSeconds >= 86400
    ? `${Math.floor(uptimeSeconds / 86400)} يوماً`
    : uptimeSeconds >= 3600
      ? `${Math.floor(uptimeSeconds / 3600)} ساعة`
      : `${Math.floor(uptimeSeconds / 60)} دقيقة`;

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
      // Was the Al-Wateen briefing summary — a sentence composed about a
      // runtime built for this one request. It now says what is actually
      // wrong, or says plainly that nothing measured is.
      headline: standingConcerns.length > 0
        ? `ما يستدعي نظرك الآن: ${standingConcerns.length}.`
        : 'لا شيء ممّا يُقاس يستدعي نظرك الآن.',
      details: standingConcerns.length > 0
        ? standingConcerns
        : [
            `الحالة التشغيليّة: ${tierAr[operational.overallTier]}`,
            `المُنشئون: ${say(facts?.creators ?? null)}`,
            `مُقاسٌ لحظةَ سؤالك، لا مُستنتَج.`,
          ],
    },
    'ch-empire-pulse': {
      // Was a bus counter belonging to this request. A pulse is the living
      // platform: how long it has stood, who is inside it, and its condition.
      headline: `الإمبراطوريّة قائمةٌ منذ ${uptimeAr} — الحالة ${tierAr[operational.overallTier]}.`,
      details: [
        `جلساتٌ قائمة: ${say(facts?.activeSessions ?? null)}`,
        `المُنشئون: ${say(facts?.creators ?? null)}`,
        operational.heapUtilizationPct === null
          ? 'الذاكرة: تعذّر القياس'
          : `الذاكرة ${operational.heapUtilizationPct}٪`,
      ],
    },
    'ch-architectural-health': {
      headline: constitutionState?.loaded
        ? `الدستور محمَّل — ${constitutionState.articleCount} مادّة و${constitutionState.policyCount} سياسة.`
        : 'الدستور غير محمَّل.',
      details: [
        `الحجرات المُعلَنة: ${chambers.length}`,
        `القدرات المُعلَنة: ${declaredCapabilities}`,
        `مسؤوليّاتٌ مؤجَّلة ومُقرّ بها: ${deferredResponsibilities}`,
      ],
    },
    'ch-infrastructure-health': {
      headline: `الحالة التشغيليّة: ${tierAr[operational.overallTier]}.`,
      details: [
        operational.heapUtilizationPct === null ? 'الذاكرة: تعذّر القياس' : `الذاكرة ${operational.heapUtilizationPct}٪`,
        operational.diskUsedPct === null ? 'القرص: تعذّر القياس' : `القرص ${operational.diskUsedPct}٪`,
        facts === null ? 'قاعدة البيانات: تعذّرت القراءة' : `قاعدة البيانات تستجيب — ${say(facts.creators)} مُنشئ`,
      ],
    },
    'ch-resource-intelligence': {
      headline: operational.heapUtilizationPct === null
        ? 'تعذّر قياس الذاكرة.'
        : `الذاكرة ${operational.heapUtilizationPct}٪ — ${tierAr[operational.memoryTier]}.`,
      details: [
        operational.diskUsedPct === null
          ? 'القرص: تعذّر القياس'
          : `القرص ${operational.diskUsedPct}٪ — ${tierAr[operational.diskTier]}`,
        `عتبة الذاكرة: تحذيرٌ عند ٧٠٪، وحرجٌ عند ٨٥٪`,
        `الأصول المحفوظة: ${say(facts?.vaultAssets ?? null)}`,
      ],
    },
    'ch-financial-intelligence': {
      headline: missingRevenue.length > 0
        ? `لا إيراد ممكن: ${missingRevenue.map((provider) => provider.nameAr).join('، ')} غير مهيّأ.`
        : `اشتراكاتٌ فاعلة: ${say(facts?.activeSubscriptions ?? null)} — مدفوعاتٌ مُستوفاة: ${say(facts?.settledPayments ?? null)}.`,
      details: [
        `الاشتراكات المسجّلة كلّها: ${say(facts?.totalSubscriptions ?? null)}`,
        `المدفوعات المُستوفاة: ${say(facts?.settledPayments ?? null)}`,
        `المُنشئون: ${say(facts?.creators ?? null)}`,
      ],
    },
    'ch-evolution-intelligence': {
      // Was a simulation id minted by this very request. Growth is what the
      // Empire can actually do, and the Truth registry is its only authority.
      headline: `${declaredCapabilities} قدرةً مُعلَنة عبر ${chambers.length} حجرات.`,
      details: chambers.map((chamber) => `${chamber.chamberId}: ${chamber.capabilities.length} قدرة`).slice(0, 5),
    },
    'ch-security-intelligence': {
      headline: `جلساتٌ قائمة: ${say(facts?.activeSessions ?? null)} لـ${say(facts?.creators ?? null)} مُنشئ.`,
      details: [
        `رسائلُ مرفوضة: ${busSnapshot.invalidMessagesBlocked}`,
        `المزوّدون المهيّأون: ${operational.providers.filter((provider) => provider.configured).length} من ${operational.providers.length}`,
        `غيرُ المهيّأ: ${operational.providers.filter((provider) => !provider.configured).map((provider) => provider.nameAr).join('، ') || 'لا شيء'}`,
      ],
    },
    'ch-founder-command': {
      // Was the doctrine engine's English justification for a path it had
      // just invented. Governance is what actually awaits a decision.
      headline: missingRevenue.length > 0
        ? `قرارٌ ينتظرك: ${missingRevenue.length} مفتاحَ دفعٍ غير مهيّأ يمنع كلّ إيراد.`
        : standingConcerns.length > 0
          ? `قرارٌ ينتظرك: ${standingConcerns[0]}.`
          : 'لا قرارَ حوكمةٍ معلّقاً ممّا يُقاس.',
      details: [
        ...missingRevenue.map((provider) => `${provider.nameAr}: يُهيَّأ في بيئة الخادم`),
        `القدرات المُعلَنة تحت حكمك: ${declaredCapabilities}`,
        `المُنشئون: ${say(facts?.creators ?? null)}`,
      ].slice(0, 4),
    },
    'ch-emergency-command': {
      headline: operational.overallTier === 'CRITICAL'
        ? `حالةٌ حرجة: ${standingConcerns[0] ?? 'غير محدّدة'}.`
        : standingConcerns.length > 0
          ? `تحذير: ${standingConcerns[0]}.`
          : 'لا حالةَ طوارئ ممّا يُقاس.',
      details: standingConcerns.length > 0
        ? standingConcerns
        : [`الحالة التشغيليّة: ${tierAr[operational.overallTier]}`],
    },
    'ch-development-observatory': {
      // «Executive packages: 1» stood here — a counter belonging to a runtime
      // built for this one request, read by the Founder as the Empire's
      // engineering output. These are the Empire's own records instead.
      headline: `ما أنتجته الإمبراطوريّة: ${say(facts?.generations ?? null)} توليداً و${say(facts?.investigations ?? null)} تحقيقاً.`,
      details: [
        `الأصول في الخزائن: ${say(facts?.vaultAssets ?? null)}`,
        `المُنشئون: ${say(facts?.creators ?? null)}`,
        facts === null ? 'تعذّرت قراءة سجلّات الإمبراطوريّة.' : 'مقروءةٌ من سجلّات الإمبراطوريّة لحظةَ السؤال.',
      ],
    },
    'ch-broadcast-center': {
      // «Routed messages: 48» counted this request's internal bus, and was
      // read as the platform's communications. The Empire keeps no record of
      // anything broadcast to Creators, so the hall says that instead of
      // borrowing a number that means something else.
      headline: 'لا سجلَّ بثٍّ إلى المُنشئين بعد.',
      details: [
        `المُنشئون الذين سيبلغهم البثّ: ${say(facts?.creators ?? null)}`,
        'لا تملك الإمبراطوريّة اليوم حدّاً يُرسل خطاباً إلى مُنشئيها.',
        'هذا إقرارٌ لا قياس.',
      ],
    },
    'ch-gift-distribution': {
      headline: missingRevenue.length > 0
        ? 'لا اشتراك ممكن — مفاتيح الدفع غير مهيّأة.'
        : `اشتراكاتٌ فاعلة: ${say(facts?.activeSubscriptions ?? null)} من ${say(facts?.totalSubscriptions ?? null)}.`,
      details: [
        `المُنشئون: ${say(facts?.creators ?? null)}`,
        `الاشتراكات الفاعلة: ${say(facts?.activeSubscriptions ?? null)}`,
        `المدفوعات المُستوفاة: ${say(facts?.settledPayments ?? null)}`,
      ],
    },
    'ch-future-laboratory': {
      // The honest future is what the Empire has written down as not yet
      // built, not a probability attached to an invented path.
      headline: deferredResponsibilities === 0
        ? 'لا مسؤوليّةَ مؤجَّلة مُعلَنة.'
        : `${deferredResponsibilities} مسؤوليّةً مؤجَّلة، مُقرٌّ بها في سجلّ الحقيقة.`,
      details: chambers
        .flatMap((chamber) => chamber.deferred.map((item) => `${chamber.chamberId}: ${item.responsibility}`))
        .slice(0, 4),
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
