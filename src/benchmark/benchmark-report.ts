import { BENCHMARK_VERSION } from './benchmark-version';
import { BenchmarkCapability, BenchmarkReport, BenchmarkResult, BenchmarkWeightConfig } from './benchmark-types';

// Section 12: no winner declared; evidence only.
export function buildBenchmarkReport(
  results: readonly BenchmarkResult[],
  weightConfig: BenchmarkWeightConfig = {}
): BenchmarkReport {
  return {
    reportId: `benchmark-report-${Date.now().toString(36)}`,
    benchmarkVersion: BENCHMARK_VERSION,
    generatedAt: new Date().toISOString(),
    results,
    weightConfig,
  };
}

export function groupResultsByProvider(
  report: BenchmarkReport
): Map<string, readonly BenchmarkResult[]> {
  const grouped = new Map<string, BenchmarkResult[]>();
  for (const result of report.results) {
    const key = `${result.providerId}/${result.modelId}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(result);
  }
  return grouped as Map<string, readonly BenchmarkResult[]>;
}

export function groupResultsByCapability(
  report: BenchmarkReport
): Map<BenchmarkCapability, readonly BenchmarkResult[]> {
  const grouped = new Map<BenchmarkCapability, BenchmarkResult[]>();
  for (const result of report.results) {
    if (!grouped.has(result.capability)) grouped.set(result.capability, []);
    grouped.get(result.capability)!.push(result);
  }
  return grouped as Map<BenchmarkCapability, readonly BenchmarkResult[]>;
}

// Computes average dimension scores per provider — does NOT declare a winner.
// The Chief Architect uses this evidence to decide final weighting.
export function summarizeByProvider(
  report: BenchmarkReport
): Map<string, { quality: number; cost: number; latency: number; reliability: number; successCount: number; totalCount: number }> {
  const byProvider = groupResultsByProvider(report);
  const summary = new Map<string, { quality: number; cost: number; latency: number; reliability: number; successCount: number; totalCount: number }>();

  for (const [key, results] of byProvider) {
    const count = results.length;
    if (count === 0) continue;

    summary.set(key, {
      quality: results.reduce((s, r) => s + r.dimensionScores.quality, 0) / count,
      cost: results.reduce((s, r) => s + r.dimensionScores.cost, 0) / count,
      latency: results.reduce((s, r) => s + r.dimensionScores.latency, 0) / count,
      reliability: results.reduce((s, r) => s + r.dimensionScores.reliability, 0) / count,
      successCount: results.filter((r) => r.success).length,
      totalCount: count,
    });
  }

  return summary;
}
