import {
  BenchmarkDimensionScores,
  BenchmarkWeightConfig,
  CostObservation,
  LatencyObservation,
  QualityObservation,
} from './benchmark-types';

export class BenchmarkScoringEngine {
  // Weighted average of quality observations. Undefined weight defaults to 1.
  computeQualityScore(
    observations: readonly QualityObservation[],
    weights: BenchmarkWeightConfig = {}
  ): number {
    if (observations.length === 0) return 0;

    let weightedSum = 0;
    let totalWeight = 0;

    for (const obs of observations) {
      const weight = weights[obs.dimension] ?? 1;
      weightedSum += obs.score * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  // Lower latency → higher score. referenceMs is the latency that maps to 0.5.
  normalizeLatency(latencyMs: number, referenceMs = 5000): number {
    if (latencyMs <= 0) return 1;
    return 1 / (1 + latencyMs / referenceMs);
  }

  // Lower cost → higher score. referenceUsd is the cost that maps to 0.5.
  normalizeCost(costUsd: number, referenceUsd = 0.10): number {
    if (costUsd <= 0) return 1;
    return 1 / (1 + costUsd / referenceUsd);
  }

  // Build a plain key→score map from an ordered observation list.
  buildQualityMetrics(observations: readonly QualityObservation[]): Record<string, number> {
    const metrics: Record<string, number> = {};
    for (const obs of observations) {
      metrics[obs.dimension] = obs.score;
    }
    return metrics;
  }

  // Compute all six top-level dimensions from raw observations.
  // capabilityScore and sovereigntyFitnessScore are provided by the caller
  // because they depend on provider-level knowledge, not per-result computation.
  computeDimensionScores(
    qualityObservations: readonly QualityObservation[],
    latencyObservation: LatencyObservation,
    costObservation: CostObservation,
    weights: BenchmarkWeightConfig = {},
    capabilityScore = 1,
    sovereigntyFitnessScore = 1
  ): BenchmarkDimensionScores {
    return {
      quality: this.computeQualityScore(qualityObservations, weights),
      cost: this.normalizeCost(costObservation.estimatedCostUsd),
      latency: this.normalizeLatency(latencyObservation.totalLatencyMs),
      reliability: latencyObservation.success ? 1 : 0,
      capability: capabilityScore,
      sovereigntyFitness: sovereigntyFitnessScore,
    };
  }
}
