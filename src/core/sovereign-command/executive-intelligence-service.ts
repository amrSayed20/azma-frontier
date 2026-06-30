import type { ExecutiveIntelligenceContract } from './sovereign-command-contract';
import type {
  EmpireTreasurySnapshot,
  ExecutiveRecommendation,
  OsHeartbeat,
  Prediction,
  RecommendationCategory,
  RecommendationUrgency,
  SovereignActionType,
} from './sovereign-command-types';
import { randomUUID } from 'crypto';

interface AnalysisSignal {
  readonly category: RecommendationCategory;
  readonly title: string;
  readonly rationale: string;
  readonly action: SovereignActionType;
  readonly impact: string;
  readonly urgency: RecommendationUrgency;
}

function detectSignals(
  heartbeat: OsHeartbeat,
  predictions: readonly Prediction[],
  treasury: EmpireTreasurySnapshot,
): AnalysisSignal[] {
  const signals: AnalysisSignal[] = [];

  for (const chamber of heartbeat.l10Chambers) {
    if (chamber.status !== 'HEALTHY') {
      signals.push({
        category: 'CHAMBER_OPTIMIZATION',
        title: `Chamber ${chamber.chamberId} requires attention`,
        rationale: `Chamber is reporting ${chamber.status} status. Investigate runtime health metrics.`,
        action: 'RUNTIME_INTERVENTION',
        impact: 'Active user workflows may be degraded',
        urgency: chamber.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      });
    }
  }

  for (const prediction of predictions) {
    if (prediction.severity === 'ADVISORY') continue;
    if (prediction.recommendation === null) continue;
    signals.push({
      category: prediction.recommendation.category,
      title: prediction.recommendation.title,
      rationale: prediction.recommendation.rationale,
      action: prediction.recommendation.requiredAction,
      impact: prediction.recommendation.estimatedImpact,
      urgency: prediction.recommendation.urgency,
    });
  }

  const ramPct = treasury.utilization.ram.pct;
  if (ramPct > 80) {
    signals.push({
      category: 'INFRASTRUCTURE_SCALING',
      title: 'RAM utilization exceeds 80%',
      rationale: `Heap usage is at ${ramPct.toFixed(1)}%. Scaling or optimization recommended before threshold breach.`,
      action: 'RESOURCE_REDISTRIBUTION',
      impact: 'Risk of process instability under increased load',
      urgency: ramPct > 90 ? 'CRITICAL' : 'HIGH',
    });
  }

  if (treasury.aiCosts.burnRatePerHour > 0 && treasury.aiCosts.remainingDays < 7) {
    signals.push({
      category: 'COST_REDUCTION',
      title: 'AI provider balance critical — less than 7 days remaining',
      rationale: `At current burn rate of ${treasury.aiCosts.burnRatePerHour.toFixed(2)}/hr, balance will deplete in ${treasury.aiCosts.remainingDays.toFixed(1)} days.`,
      action: 'AI_PROVIDER_SWITCH',
      impact: 'Platform AI capabilities will be suspended when balance reaches zero',
      urgency: treasury.aiCosts.remainingDays < 2 ? 'CRITICAL' : 'HIGH',
    });
  }

  if (heartbeat.l8Intelligence.availableSources === 0) {
    signals.push({
      category: 'RUNTIME_OPTIMIZATION',
      title: 'Sovereign Intelligence has no available knowledge sources',
      rationale: 'All knowledge sources are unavailable. Intelligence chamber operations will fail.',
      action: 'RUNTIME_INTERVENTION',
      impact: 'Hujjah Al-Damighah investigation requests will fail',
      urgency: 'HIGH',
    });
  }

  return signals;
}

export class ExecutiveIntelligenceService implements ExecutiveIntelligenceContract {
  readonly serviceName = 'ExecutiveIntelligenceService' as const;

  private latestRecommendations: readonly ExecutiveRecommendation[] = [];

  analyze(
    heartbeat: OsHeartbeat,
    predictions: readonly Prediction[],
    treasury: EmpireTreasurySnapshot,
  ): readonly ExecutiveRecommendation[] {
    const signals = detectSignals(heartbeat, predictions, treasury);

    const urgencyOrder: Record<RecommendationUrgency, number> = {
      CRITICAL: 0,
      HIGH: 1,
      MEDIUM: 2,
      LOW: 3,
    };

    const recommendations: ExecutiveRecommendation[] = signals.map((signal) => ({
      recommendationId: randomUUID(),
      category: signal.category,
      title: signal.title,
      rationale: signal.rationale,
      requiredAction: signal.action,
      estimatedImpact: signal.impact,
      urgency: signal.urgency,
      generatedAt: new Date(),
    }));

    recommendations.sort(
      (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency],
    );

    this.latestRecommendations = recommendations;
    return recommendations;
  }

  getLatestRecommendations(): readonly ExecutiveRecommendation[] {
    return this.latestRecommendations;
  }
}
