import {
  AlWateenIntegrationRuntime,
  DoctrineCandidatePath,
  DoctrineRuntime,
} from '../al-wateen';
import { FutureSimulationRuntime } from '../future-simulation';
import {
  CouncilRuntimeInput,
  CouncilSynchronizationResult,
  FounderSession,
} from './runtime-types';

export class RuntimeSynchronizer {
  constructor(
    private readonly alWateenRuntime: AlWateenIntegrationRuntime,
    private readonly doctrineRuntime: DoctrineRuntime,
    private readonly futureSimulationRuntime: FutureSimulationRuntime
  ) {}

  public synchronize(
    session: FounderSession,
    input: CouncilRuntimeInput
  ): CouncilSynchronizationResult {
    const unifiedPackage = input.actionContext
      ? this.alWateenRuntime.integrateWithAction(input.actionContext, input.trigger ?? 'event-driven')
      : this.alWateenRuntime.integrate(input.trigger ?? 'manual');

    const futurePackage = input.existingFuturePackage ?? this.futureSimulationRuntime.getLatestPackage();

    const candidates = this.buildCandidatePaths(
      unifiedPackage,
      futurePackage,
      input.simulationPathCount
    );

    const doctrinePackage = this.doctrineRuntime.evaluate(
      input.founderIntent,
      unifiedPackage,
      candidates
    );

    return {
      synchronizationId: `council-sync-${Date.now().toString(36)}`,
      session: {
        ...session,
        lastSyncedAt: new Date(),
      },
      unifiedPackage,
      briefingBundle: {
        founderBriefing: unifiedPackage.founderBriefing,
        executiveBriefing: unifiedPackage.executiveBriefing,
        strategicBriefing: unifiedPackage.strategicBriefing,
      },
      futureSimulationRecommendation: {
        packageId: futurePackage?.packageId,
        recommendedPathId: futurePackage?.recommendedPathId,
        summary: futurePackage?.recommendationSummary ?? 'No future simulation package available at synchronization time.',
      },
      doctrinePackage,
      candidatePathsUsed: candidates,
      immutable: true,
    };
  }

  private buildCandidatePaths(
    unifiedPackage: ReturnType<AlWateenIntegrationRuntime['integrate']>,
    futurePackage: ReturnType<FutureSimulationRuntime['getLatestPackage']>,
    simulationPathCount: number
  ): readonly DoctrineCandidatePath[] {
    const pathLimit = Math.max(1, Math.min(10, Math.trunc(simulationPathCount || 0)));

    const futureCandidates: DoctrineCandidatePath[] =
      futurePackage?.rankedFutures.slice(0, pathLimit).map((future) => ({
        pathId: future.pathId,
        title: `Future path ${future.pathId}`,
        why: `Rank ${future.rank} with constitutional outcome ${future.constitutionalOutcome}.`,
        whyNot: `Alternative paths scored below ${future.score}.`,
        constitutionalImpact: future.constitutionalOutcome === 'best' ? 95 : future.constitutionalOutcome === 'acceptable' ? 80 : 55,
        strategicImpact: Math.min(100, Math.round(future.score)),
        sustainabilityImpact: future.riskLevel === 'low' ? 90 : future.riskLevel === 'medium' ? 75 : 60,
        speedBenefit: Math.max(10, 100 - future.rank * 20),
        uncertainty: `Probability ${future.probability.toFixed(4)} and risk level ${future.riskLevel}.`,
      })) ?? [];

    if (futureCandidates.length > 0) {
      return futureCandidates;
    }

    return [
      {
        pathId: `${unifiedPackage.packageId}-baseline-1`,
        title: 'Constitution-first stabilization path',
        why: 'Preserves constitutional coherence and synchronized advisory continuity.',
        whyNot: 'May reduce immediate speed in favor of durability.',
        constitutionalImpact: Math.min(100, unifiedPackage.correlation.constitutionalHealth),
        strategicImpact: Math.min(100, unifiedPackage.correlation.strategicReadiness),
        sustainabilityImpact: Math.min(100, unifiedPackage.correlation.futureConfidence),
        speedBenefit: 35,
        uncertainty: 'Future simulation unavailable; baseline doctrine confidence is reduced.',
      },
      {
        pathId: `${unifiedPackage.packageId}-baseline-2`,
        title: 'Balanced progression path',
        why: 'Balances executive readiness with long-term strategic durability.',
        whyNot: 'May accept moderate uncertainty in exchange for broader alignment.',
        constitutionalImpact: Math.max(55, unifiedPackage.correlation.constitutionalHealth - 8),
        strategicImpact: Math.min(100, unifiedPackage.correlation.executiveReadiness),
        sustainabilityImpact: Math.max(55, unifiedPackage.correlation.futureConfidence - 5),
        speedBenefit: 55,
        uncertainty: 'Tradeoff between pace and constitutional conservatism requires monitoring.',
      },
    ];
  }
}
