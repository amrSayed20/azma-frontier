import { randomUUID } from 'crypto';
import type { PredictiveCommandContract } from './sovereign-command-contract';
import type {
  EmpireTreasurySnapshot,
  ExecutiveRecommendation,
  OsHeartbeat,
  Prediction,
  PredictionSeverity,
  PredictionSubject,
  RecommendationCategory,
  SovereignActionType,
} from './sovereign-command-types';

interface ThresholdConfig {
  readonly subject: PredictionSubject;
  readonly warningPct: number;
  readonly criticalPct: number;
  readonly recommendationCategory: RecommendationCategory;
  readonly requiredAction: SovereignActionType;
}

const THRESHOLDS: readonly ThresholdConfig[] = [
  {
    subject: 'RESOURCE_EXHAUSTION',
    warningPct: 70,
    criticalPct: 90,
    recommendationCategory: 'INFRASTRUCTURE_SCALING',
    requiredAction: 'RESOURCE_REDISTRIBUTION',
  },
  {
    subject: 'QUEUE_CONGESTION',
    warningPct: 70,
    criticalPct: 85,
    recommendationCategory: 'RUNTIME_OPTIMIZATION',
    requiredAction: 'RUNTIME_INTERVENTION',
  },
  {
    subject: 'STORAGE_LIMIT',
    warningPct: 75,
    criticalPct: 90,
    recommendationCategory: 'INFRASTRUCTURE_SCALING',
    requiredAction: 'RESOURCE_REDISTRIBUTION',
  },
];

function severityFor(pct: number, warning: number, critical: number): PredictionSeverity {
  if (pct >= critical) return 'CRITICAL';
  if (pct >= warning) return 'WARNING';
  return 'ADVISORY';
}

function confidenceFor(pct: number, threshold: number): number {
  const ratio = pct / threshold;
  return Math.min(ratio, 1.0);
}

function msUntilThreshold(current: number, threshold: number, ratePerMs: number): number {
  if (ratePerMs <= 0 || current >= threshold) return 0;
  return (threshold - current) / ratePerMs;
}

function makeRecommendation(
  subject: PredictionSubject,
  severity: PredictionSeverity,
  category: RecommendationCategory,
  action: SovereignActionType,
): ExecutiveRecommendation {
  return {
    recommendationId: randomUUID(),
    category,
    title: `${severity} ${subject.replace(/_/g, ' ').toLowerCase()} predicted`,
    rationale: `Current utilization trends indicate ${subject} threshold will be reached. Proactive action recommended.`,
    requiredAction: action,
    estimatedImpact: severity === 'CRITICAL' ? 'Platform stability at risk' : 'Performance degradation possible',
    urgency: severity === 'CRITICAL' ? 'CRITICAL' : severity === 'WARNING' ? 'HIGH' : 'MEDIUM',
    generatedAt: new Date(),
  };
}

export class PredictiveCommandService implements PredictiveCommandContract {
  readonly serviceName = 'PredictiveCommandService' as const;

  private activePredictions: readonly Prediction[] = [];

  generatePredictions(
    heartbeat: OsHeartbeat,
    treasury: EmpireTreasurySnapshot,
  ): readonly Prediction[] {
    const predictions: Prediction[] = [];
    const now = Date.now();

    const ramPct = treasury.utilization.ram.pct;
    const queuePct = treasury.utilization.queue.pct;
    const storagePct = treasury.utilization.storage.pct;

    const utilizationMap: Record<PredictionSubject, number> = {
      RESOURCE_EXHAUSTION: ramPct,
      QUEUE_CONGESTION: queuePct,
      STORAGE_LIMIT: storagePct,
      AI_COST: treasury.aiCosts.burnRatePerHour > 0 ? 50 : 0,
      RUNTIME_OVERLOAD: heartbeat.l3Scheduling.totalEnqueued > 100 ? 60 : 10,
      MODEL_SATURATION: heartbeat.l8Intelligence.availableSources === 0 ? 80 : 5,
    };

    for (const config of THRESHOLDS) {
      const currentPct = utilizationMap[config.subject] ?? 0;
      if (currentPct < 50) continue;

      const severity = severityFor(currentPct, config.warningPct, config.criticalPct);
      const confidence = confidenceFor(currentPct, config.criticalPct);

      const growthRatePerMs = currentPct / (process.uptime() * 1_000);
      const timeToEvent = msUntilThreshold(currentPct, config.criticalPct, growthRatePerMs);

      const prediction: Prediction = {
        predictionId: randomUUID(),
        subject: config.subject,
        confidence,
        estimatedTimeToEventMs: timeToEvent,
        currentValue: currentPct,
        thresholdValue: config.criticalPct,
        severity,
        recommendation:
          severity !== 'ADVISORY'
            ? makeRecommendation(
                config.subject,
                severity,
                config.recommendationCategory,
                config.requiredAction,
              )
            : null,
        generatedAt: new Date(now),
      };
      predictions.push(prediction);
    }

    this.activePredictions = predictions;
    return predictions;
  }

  getActivePredictions(): readonly Prediction[] {
    return this.activePredictions;
  }
}
