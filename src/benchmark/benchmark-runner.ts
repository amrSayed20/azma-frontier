import { BENCHMARK_VERSION, FIXTURE_VERSION } from './benchmark-version';
import {
  BenchmarkExecutionOutcome,
  BenchmarkExecutorFn,
  BenchmarkFailureCategory,
  BenchmarkProviderDescriptor,
  BenchmarkResult,
  BenchmarkWeightConfig,
  CostObservation,
  LatencyObservation,
  QualityObservation,
} from './benchmark-types';
import type { BenchmarkSpec } from './benchmark-types';
import { BenchmarkScoringEngine } from './benchmark-scoring-engine';

const DEFAULT_TIMEOUT_MS = 120_000;

export class BenchmarkRunner {
  constructor(private readonly scoringEngine: BenchmarkScoringEngine) {}

  // Validates the spec and provider descriptor, returns a skeleton result with
  // failureCategory: 'credential-missing'. Used when credentials are absent.
  dryRun(spec: BenchmarkSpec, provider: BenchmarkProviderDescriptor): BenchmarkResult {
    const now = Date.now();

    const latencyObservation: LatencyObservation = {
      requestStartMs: now,
      requestCompletionMs: now,
      totalLatencyMs: 0,
      success: false,
      failureCategory: 'credential-missing',
      retryCount: 0,
    };

    const costObservation: CostObservation = {
      providerId: provider.providerId,
      modelId: provider.modelId,
      operation: spec.capability,
      estimatedCostUsd: 0,
      freeTierUsed: false,
    };

    const dimensionScores = this.scoringEngine.computeDimensionScores(
      [],
      latencyObservation,
      costObservation
    );

    return {
      providerId: provider.providerId,
      modelId: provider.modelId,
      capability: spec.capability,
      testId: spec.testId,
      qualityMetrics: {},
      qualityObservations: [],
      costObservation,
      latencyObservation,
      dimensionScores,
      latencyMs: 0,
      estimatedCost: 0,
      success: false,
      failureCategory: 'credential-missing',
      timestamp: new Date(now).toISOString(),
      benchmarkVersion: BENCHMARK_VERSION,
      testVersion: spec.version,
      promptVersion: FIXTURE_VERSION,
      resolutionRequested: spec.input.resolution,
      generationParameters: spec.input.parameters,
    };
  }

  // Full run: calls executor with timeout, wraps result with quality observations
  // and cost data provided by the caller (from evaluator or provider response).
  async run(
    spec: BenchmarkSpec,
    provider: BenchmarkProviderDescriptor,
    executor: BenchmarkExecutorFn,
    qualityObservations: readonly QualityObservation[],
    costObservation: CostObservation,
    weights?: BenchmarkWeightConfig,
    timeoutMs = DEFAULT_TIMEOUT_MS
  ): Promise<BenchmarkResult> {
    const startMs = Date.now();
    let outcome: BenchmarkExecutionOutcome;

    try {
      outcome = await Promise.race([
        executor(spec, provider),
        this.makeTimeoutOutcome(timeoutMs, startMs),
      ]);
    } catch {
      outcome = {
        success: false,
        latencyMs: Date.now() - startMs,
        failureCategory: 'provider-error' as BenchmarkFailureCategory,
      };
    }

    const completionMs = Date.now();

    const latencyObservation: LatencyObservation = {
      requestStartMs: startMs,
      requestCompletionMs: completionMs,
      totalLatencyMs: outcome.latencyMs,
      success: outcome.success,
      failureCategory: outcome.failureCategory ?? null,
      retryCount: 0,
    };

    const dimensionScores = this.scoringEngine.computeDimensionScores(
      qualityObservations,
      latencyObservation,
      costObservation,
      weights
    );

    return {
      providerId: provider.providerId,
      modelId: provider.modelId,
      capability: spec.capability,
      testId: spec.testId,
      qualityMetrics: this.scoringEngine.buildQualityMetrics(qualityObservations),
      qualityObservations,
      costObservation,
      latencyObservation,
      dimensionScores,
      latencyMs: outcome.latencyMs,
      estimatedCost: costObservation.estimatedCostUsd,
      success: outcome.success,
      failureCategory: outcome.failureCategory ?? null,
      timestamp: new Date().toISOString(),
      benchmarkVersion: BENCHMARK_VERSION,
      testVersion: spec.version,
      promptVersion: FIXTURE_VERSION,
      resolutionRequested: spec.input.resolution,
      generationParameters: spec.input.parameters,
    };
  }

  private makeTimeoutOutcome(
    timeoutMs: number,
    startMs: number
  ): Promise<BenchmarkExecutionOutcome> {
    return new Promise((resolve) => {
      const handle = setTimeout(() => {
        resolve({
          success: false,
          latencyMs: Date.now() - startMs,
          failureCategory: 'timeout',
        });
      }, timeoutMs);
      // Allow the process to exit cleanly if no other work remains
      if (typeof handle === 'object' && handle !== null && 'unref' in handle) {
        (handle as { unref(): void }).unref();
      }
    });
  }
}
