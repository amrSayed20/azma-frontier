import { BenchmarkRunner } from '../benchmark-runner';
import { BenchmarkScoringEngine } from '../benchmark-scoring-engine';
import { BENCHMARK_VERSION, FIXTURE_VERSION } from '../benchmark-version';
import type {
  BenchmarkExecutionOutcome,
  BenchmarkProviderDescriptor,
  BenchmarkSpec,
  CostObservation,
  QualityObservation,
} from '../benchmark-types';

const engine = new BenchmarkScoringEngine();
const runner = new BenchmarkRunner(engine);

function makeSpec(overrides: Partial<BenchmarkSpec> = {}): BenchmarkSpec {
  return {
    testId: 'test-spec-001',
    version: '1.0.0',
    capability: 'image-generation',
    name: 'Test Spec',
    description: 'A test specification.',
    scoringDimensions: ['photorealism', 'detail'],
    input: {
      prompt: 'A test prompt.',
      parameters: { aspectRatio: '1:1' },
      resolution: '1024x1024',
    },
    evaluationGuidance: 'Score everything.',
    ...overrides,
  };
}

function makeProvider(overrides: Partial<BenchmarkProviderDescriptor> = {}): BenchmarkProviderDescriptor {
  return {
    providerId: 'test-provider',
    modelId: 'test-model-v1',
    displayName: 'Test Provider',
    capability: 'image-generation',
    hostingType: 'hosted-api',
    ...overrides,
  };
}

function makeCostObs(estimatedCostUsd = 0.04): CostObservation {
  return {
    providerId: 'test-provider',
    modelId: 'test-model-v1',
    operation: 'image-generation',
    estimatedCostUsd,
    freeTierUsed: false,
  };
}

// ─── dryRun ───────────────────────────────────────────────────────────────────

describe('BenchmarkRunner.dryRun', () => {
  it('returns a result with failureCategory: credential-missing', () => {
    const result = runner.dryRun(makeSpec(), makeProvider());
    expect(result.failureCategory).toBe('credential-missing');
    expect(result.success).toBe(false);
  });

  it('carries the correct benchmark and test version', () => {
    const result = runner.dryRun(makeSpec(), makeProvider());
    expect(result.benchmarkVersion).toBe(BENCHMARK_VERSION);
    expect(result.testVersion).toBe('1.0.0');
    expect(result.promptVersion).toBe(FIXTURE_VERSION);
  });

  it('carries the provider and model IDs', () => {
    const result = runner.dryRun(makeSpec(), makeProvider());
    expect(result.providerId).toBe('test-provider');
    expect(result.modelId).toBe('test-model-v1');
  });

  it('carries the spec capability and testId', () => {
    const result = runner.dryRun(makeSpec(), makeProvider());
    expect(result.capability).toBe('image-generation');
    expect(result.testId).toBe('test-spec-001');
  });

  it('carries the resolution from spec input', () => {
    const result = runner.dryRun(makeSpec(), makeProvider());
    expect(result.resolutionRequested).toBe('1024x1024');
  });

  it('carries the generation parameters from spec input', () => {
    const result = runner.dryRun(makeSpec(), makeProvider());
    expect(result.generationParameters).toEqual({ aspectRatio: '1:1' });
  });

  it('has empty quality metrics and observations', () => {
    const result = runner.dryRun(makeSpec(), makeProvider());
    expect(result.qualityMetrics).toEqual({});
    expect(result.qualityObservations).toHaveLength(0);
  });

  it('latencyMs is 0 in dry run', () => {
    const result = runner.dryRun(makeSpec(), makeProvider());
    expect(result.latencyMs).toBe(0);
  });

  it('has a valid ISO timestamp', () => {
    const result = runner.dryRun(makeSpec(), makeProvider());
    expect(() => new Date(result.timestamp)).not.toThrow();
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });

  it('all six dimension scores are present', () => {
    const result = runner.dryRun(makeSpec(), makeProvider());
    const { quality, cost, latency, reliability, capability, sovereigntyFitness } = result.dimensionScores;
    expect(typeof quality).toBe('number');
    expect(typeof cost).toBe('number');
    expect(typeof latency).toBe('number');
    expect(typeof reliability).toBe('number');
    expect(typeof capability).toBe('number');
    expect(typeof sovereigntyFitness).toBe('number');
  });

  it('hostingType open-weight does not change the dry run output', () => {
    const result = runner.dryRun(makeSpec(), makeProvider({ hostingType: 'open-weight' }));
    expect(result.failureCategory).toBe('credential-missing');
  });
});

// ─── run ──────────────────────────────────────────────────────────────────────

describe('BenchmarkRunner.run', () => {
  const qualityObs: readonly QualityObservation[] = [
    { dimension: 'photorealism', score: 0.85 },
    { dimension: 'detail', score: 0.70 },
  ];

  function makeSuccessExecutor(latencyMs = 1200): () => Promise<BenchmarkExecutionOutcome> {
    return async () => ({ success: true, latencyMs });
  }

  function makeFailureExecutor(category: BenchmarkExecutionOutcome['failureCategory'] = 'provider-error'): () => Promise<BenchmarkExecutionOutcome> {
    return async () => ({ success: false, latencyMs: 100, failureCategory: category });
  }

  it('returns success:true when executor succeeds', async () => {
    const result = await runner.run(makeSpec(), makeProvider(), makeSuccessExecutor(), qualityObs, makeCostObs());
    expect(result.success).toBe(true);
    expect(result.failureCategory).toBeNull();
  });

  it('records quality observations and metrics correctly', async () => {
    const result = await runner.run(makeSpec(), makeProvider(), makeSuccessExecutor(), qualityObs, makeCostObs());
    expect(result.qualityObservations).toEqual(qualityObs);
    expect(result.qualityMetrics).toEqual({ photorealism: 0.85, detail: 0.70 });
  });

  it('records measured latency from executor outcome', async () => {
    const result = await runner.run(makeSpec(), makeProvider(), makeSuccessExecutor(800), qualityObs, makeCostObs());
    expect(result.latencyMs).toBe(800);
    expect(result.latencyObservation.totalLatencyMs).toBe(800);
  });

  it('records cost from the provided cost observation', async () => {
    const result = await runner.run(makeSpec(), makeProvider(), makeSuccessExecutor(), qualityObs, makeCostObs(0.06));
    expect(result.estimatedCost).toBe(0.06);
    expect(result.costObservation.estimatedCostUsd).toBe(0.06);
  });

  it('returns success:false and the correct failure category when executor reports failure', async () => {
    const result = await runner.run(makeSpec(), makeProvider(), makeFailureExecutor('rate-limited'), [], makeCostObs());
    expect(result.success).toBe(false);
    expect(result.failureCategory).toBe('rate-limited');
  });

  it('handles an executor that throws — returns provider-error category', async () => {
    const throwingExecutor = async () => { throw new Error('network down'); };
    const result = await runner.run(makeSpec(), makeProvider(), throwingExecutor, [], makeCostObs());
    expect(result.success).toBe(false);
    expect(result.failureCategory).toBe('provider-error');
  });

  it('returns a timeout outcome when executor exceeds the timeout', async () => {
    const slowExecutor = (): Promise<BenchmarkExecutionOutcome> =>
      new Promise((resolve) => setTimeout(() => resolve({ success: true, latencyMs: 999 }), 200));

    const result = await runner.run(makeSpec(), makeProvider(), slowExecutor, [], makeCostObs(), {}, 50);
    expect(result.success).toBe(false);
    expect(result.failureCategory).toBe('timeout');
  }, 5000);

  it('dimension scores include reliability:1 on success and reliability:0 on failure', async () => {
    const success = await runner.run(makeSpec(), makeProvider(), makeSuccessExecutor(), qualityObs, makeCostObs());
    const failure = await runner.run(makeSpec(), makeProvider(), makeFailureExecutor(), [], makeCostObs());
    expect(success.dimensionScores.reliability).toBe(1);
    expect(failure.dimensionScores.reliability).toBe(0);
  });

  it('quality dimension score reflects weighted average of observations', async () => {
    const result = await runner.run(
      makeSpec(),
      makeProvider(),
      makeSuccessExecutor(),
      qualityObs,
      makeCostObs(),
      {}
    );
    // unweighted: (0.85 + 0.70) / 2 = 0.775
    expect(result.dimensionScores.quality).toBeCloseTo(0.775, 5);
  });

  it('carries benchmark and test version through to result', async () => {
    const result = await runner.run(makeSpec(), makeProvider(), makeSuccessExecutor(), [], makeCostObs());
    expect(result.benchmarkVersion).toBe(BENCHMARK_VERSION);
    expect(result.testVersion).toBe('1.0.0');
  });
});
