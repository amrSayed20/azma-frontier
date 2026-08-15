import { BenchmarkScoringEngine } from '../benchmark-scoring-engine';
import type { CostObservation, LatencyObservation, QualityObservation } from '../benchmark-types';

const engine = new BenchmarkScoringEngine();

function makeLatencyObs(overrides: Partial<LatencyObservation> = {}): LatencyObservation {
  return {
    requestStartMs: 1000,
    requestCompletionMs: 2000,
    totalLatencyMs: 1000,
    success: true,
    failureCategory: null,
    retryCount: 0,
    ...overrides,
  };
}

function makeCostObs(estimatedCostUsd = 0): CostObservation {
  return {
    providerId: 'test-provider',
    modelId: 'test-model',
    operation: 'image-generation',
    estimatedCostUsd,
    freeTierUsed: false,
  };
}

// ─── computeQualityScore ──────────────────────────────────────────────────────

describe('BenchmarkScoringEngine.computeQualityScore', () => {
  it('returns 0 for empty observations', () => {
    expect(engine.computeQualityScore([])).toBe(0);
  });

  it('returns the single observation score when there is only one', () => {
    const obs: QualityObservation[] = [{ dimension: 'photorealism', score: 0.75 }];
    expect(engine.computeQualityScore(obs)).toBe(0.75);
  });

  it('returns the unweighted average when weights are not provided', () => {
    const obs: QualityObservation[] = [
      { dimension: 'photorealism', score: 0.8 },
      { dimension: 'detail', score: 0.6 },
    ];
    expect(engine.computeQualityScore(obs)).toBeCloseTo(0.7, 5);
  });

  it('applies weights correctly — higher-weighted dimension has more impact', () => {
    const obs: QualityObservation[] = [
      { dimension: 'promptAdherence', score: 1.0 },
      { dimension: 'typography', score: 0.0 },
    ];
    // weights: promptAdherence=1.5, typography=0.5
    // weighted sum = 1.0*1.5 + 0.0*0.5 = 1.5; totalWeight = 2.0; result = 0.75
    expect(engine.computeQualityScore(obs, { promptAdherence: 1.5, typography: 0.5 })).toBeCloseTo(0.75, 5);
  });

  it('uses weight of 1 for dimensions not present in the weight config', () => {
    const obs: QualityObservation[] = [
      { dimension: 'mystery-dimension', score: 0.5 },
    ];
    expect(engine.computeQualityScore(obs, {})).toBe(0.5);
  });

  it('handles a zero-score observation correctly', () => {
    const obs: QualityObservation[] = [
      { dimension: 'photorealism', score: 0 },
      { dimension: 'detail', score: 0 },
    ];
    expect(engine.computeQualityScore(obs)).toBe(0);
  });

  it('handles a perfect score across all dimensions', () => {
    const obs: QualityObservation[] = [
      { dimension: 'a', score: 1 },
      { dimension: 'b', score: 1 },
      { dimension: 'c', score: 1 },
    ];
    expect(engine.computeQualityScore(obs)).toBe(1);
  });
});

// ─── normalizeLatency ─────────────────────────────────────────────────────────

describe('BenchmarkScoringEngine.normalizeLatency', () => {
  it('returns 1 for zero latency', () => {
    expect(engine.normalizeLatency(0)).toBe(1);
  });

  it('returns 1 for negative latency (guard)', () => {
    expect(engine.normalizeLatency(-100)).toBe(1);
  });

  it('returns 0.5 at the reference latency', () => {
    // reference = 5000ms: 1 / (1 + 5000/5000) = 1/2 = 0.5
    expect(engine.normalizeLatency(5000)).toBeCloseTo(0.5, 5);
  });

  it('returns lower score for higher latency', () => {
    const fast = engine.normalizeLatency(1000);
    const slow = engine.normalizeLatency(10000);
    expect(fast).toBeGreaterThan(slow);
  });

  it('uses custom reference latency when supplied', () => {
    // reference = 2000ms: latency=2000 → 0.5
    expect(engine.normalizeLatency(2000, 2000)).toBeCloseTo(0.5, 5);
  });

  it('converges toward 0 for very high latency', () => {
    expect(engine.normalizeLatency(500_000)).toBeLessThan(0.02);
  });
});

// ─── normalizeCost ────────────────────────────────────────────────────────────

describe('BenchmarkScoringEngine.normalizeCost', () => {
  it('returns 1 for zero cost', () => {
    expect(engine.normalizeCost(0)).toBe(1);
  });

  it('returns 1 for negative cost (guard)', () => {
    expect(engine.normalizeCost(-0.01)).toBe(1);
  });

  it('returns 0.5 at the reference cost', () => {
    // reference = $0.10: 1 / (1 + 0.10/0.10) = 0.5
    expect(engine.normalizeCost(0.10)).toBeCloseTo(0.5, 5);
  });

  it('returns lower score for higher cost', () => {
    const cheap = engine.normalizeCost(0.01);
    const expensive = engine.normalizeCost(1.00);
    expect(cheap).toBeGreaterThan(expensive);
  });

  it('uses custom reference cost when supplied', () => {
    expect(engine.normalizeCost(0.05, 0.05)).toBeCloseTo(0.5, 5);
  });
});

// ─── buildQualityMetrics ──────────────────────────────────────────────────────

describe('BenchmarkScoringEngine.buildQualityMetrics', () => {
  it('returns an empty object for no observations', () => {
    expect(engine.buildQualityMetrics([])).toEqual({});
  });

  it('maps dimension names to their scores', () => {
    const obs: QualityObservation[] = [
      { dimension: 'photorealism', score: 0.9 },
      { dimension: 'detail', score: 0.7 },
    ];
    expect(engine.buildQualityMetrics(obs)).toEqual({ photorealism: 0.9, detail: 0.7 });
  });

  it('last value wins when duplicate dimension names exist', () => {
    const obs: QualityObservation[] = [
      { dimension: 'photorealism', score: 0.5 },
      { dimension: 'photorealism', score: 0.9 },
    ];
    expect(engine.buildQualityMetrics(obs).photorealism).toBe(0.9);
  });
});

// ─── computeDimensionScores ───────────────────────────────────────────────────

describe('BenchmarkScoringEngine.computeDimensionScores', () => {
  it('reliability is 1 on success and 0 on failure', () => {
    const successScores = engine.computeDimensionScores(
      [],
      makeLatencyObs({ success: true }),
      makeCostObs()
    );
    const failureScores = engine.computeDimensionScores(
      [],
      makeLatencyObs({ success: false }),
      makeCostObs()
    );
    expect(successScores.reliability).toBe(1);
    expect(failureScores.reliability).toBe(0);
  });

  it('quality reflects observation scores', () => {
    const obs: QualityObservation[] = [
      { dimension: 'photorealism', score: 0.8 },
      { dimension: 'detail', score: 0.6 },
    ];
    const scores = engine.computeDimensionScores(obs, makeLatencyObs(), makeCostObs());
    expect(scores.quality).toBeCloseTo(0.7, 5);
  });

  it('uses provided capabilityScore and sovereigntyFitnessScore', () => {
    const scores = engine.computeDimensionScores(
      [],
      makeLatencyObs(),
      makeCostObs(),
      {},
      0.85,
      0.70
    );
    expect(scores.capability).toBe(0.85);
    expect(scores.sovereigntyFitness).toBe(0.70);
  });

  it('all six dimensions are present in the result', () => {
    const scores = engine.computeDimensionScores([], makeLatencyObs(), makeCostObs());
    expect(Object.keys(scores)).toEqual(
      expect.arrayContaining(['quality', 'cost', 'latency', 'reliability', 'capability', 'sovereigntyFitness'])
    );
  });

  it('all dimension scores are in the 0–1 range', () => {
    const obs: QualityObservation[] = [{ dimension: 'detail', score: 0.9 }];
    const scores = engine.computeDimensionScores(
      obs,
      makeLatencyObs({ totalLatencyMs: 2000 }),
      makeCostObs(0.05)
    );
    for (const value of Object.values(scores)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });
});
