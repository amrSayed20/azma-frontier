// ─── Capability Domain ────────────────────────────────────────────────────────
// Benchmark-only taxonomy. Does NOT modify AICapabilityType in provider-contracts.ts.
// Includes domains (image-upscaling, video-generation, voice-cloning) that do not
// yet have a corresponding AICapabilityType constitutional entry.

export type BenchmarkCapability =
  | 'image-generation'
  | 'image-editing'
  | 'image-upscaling'
  | 'video-generation'
  | 'text-to-speech'
  | 'voice-cloning';

// Section 14 — all provider hosting models supported without schema change
export type BenchmarkHostingType =
  | 'hosted-api'
  | 'marketplace-hosted'
  | 'open-weight'
  | 'self-hosted';

// Section 9 — normalized failure categories; no raw provider error strings here
export type BenchmarkFailureCategory =
  | 'provider-error'
  | 'timeout'
  | 'invalid-response'
  | 'content-filtered'
  | 'credential-missing'
  | 'rate-limited'
  | 'network-error'
  | 'unknown';

// ─── Provider ─────────────────────────────────────────────────────────────────

export interface BenchmarkProviderDescriptor {
  readonly providerId: string;
  readonly modelId: string;
  readonly displayName: string;
  readonly capability: BenchmarkCapability;
  readonly hostingType: BenchmarkHostingType;
}

// ─── Spec ─────────────────────────────────────────────────────────────────────

export interface BenchmarkInput {
  readonly prompt: string;
  // Human-readable description of reference material (source image/audio needed for
  // editing and cloning tests). Never embed binary content here.
  readonly referenceDescription?: string;
  readonly parameters: Readonly<Record<string, unknown>>;
  readonly resolution?: string;
}

// A single test case. testId + version together identify a reproducible prompt.
export interface BenchmarkSpec {
  readonly testId: string;
  readonly version: string;
  readonly capability: BenchmarkCapability;
  readonly name: string;
  readonly description: string;
  readonly scoringDimensions: readonly string[];
  readonly input: BenchmarkInput;
  readonly evaluationGuidance: string;
}

// ─── Observations ─────────────────────────────────────────────────────────────

// One quality observation per scoring dimension; 0.0–1.0 range.
// Provided by a human evaluator or an automated evaluation model — not the
// generation provider itself.
export interface QualityObservation {
  readonly dimension: string;
  readonly score: number;
  readonly evaluatorNote?: string;
}

// Section 8 — cost observation; no credentials, no secrets
export interface CostObservation {
  readonly providerId: string;
  readonly modelId: string;
  readonly operation: BenchmarkCapability;
  readonly inputUnits?: number;
  readonly outputUnits?: number;
  readonly estimatedCostUsd: number;
  readonly actualCostUsd?: number;
  readonly freeTierUsed: boolean;
}

// Section 9 — latency and reliability
export interface LatencyObservation {
  readonly requestStartMs: number;
  readonly requestCompletionMs: number;
  readonly totalLatencyMs: number;
  readonly success: boolean;
  readonly failureCategory: BenchmarkFailureCategory | null;
  readonly retryCount: number;
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

// Section 6 — six top-level dimensions kept separate so the Chief Architect can
// change weights without rerunning historical tests.
export interface BenchmarkDimensionScores {
  readonly quality: number;
  readonly cost: number;
  readonly latency: number;
  readonly reliability: number;
  readonly capability: number;
  readonly sovereigntyFitness: number;
}

// Section 7 — configurable weights; undefined entries use default weight of 1.
// These are NOT declared constitutional. The Chief Architect sets final weights.
export type BenchmarkWeightConfig = Readonly<Record<string, number | undefined>>;

export const DEFAULT_IMAGE_WEIGHTS: BenchmarkWeightConfig = {
  photorealism:    1.0,
  detail:          1.0,
  promptAdherence: 1.5,
  consistency:     1.0,
  editingPrecision:1.0,
  typography:      0.5,
  resolution:      0.5,
};

export const DEFAULT_VIDEO_WEIGHTS: BenchmarkWeightConfig = {
  promptAdherence:       1.5,
  characterConsistency:  1.0,
  sceneConsistency:      1.0,
  cameraMovement:        0.75,
  motionCoherence:       1.0,
  physicalPlausibility:  1.0,
  temporalConsistency:   1.0,
  detailPreservation:    0.75,
  outputQuality:         1.0,
};

export const DEFAULT_AUDIO_WEIGHTS: BenchmarkWeightConfig = {
  intelligibility:         1.5,
  naturalness:             1.0,
  emotionalExpression:     0.75,
  arabicPronunciation:     1.0,
  voiceIdentityConsistency:1.0,
  cloningFidelity:         1.0,
  productionQuality:       1.0,
};

// ─── Result ───────────────────────────────────────────────────────────────────

// Section 10 — normalized result; Section 11 — reproducibility fields included
export interface BenchmarkResult {
  readonly providerId: string;
  readonly modelId: string;
  readonly capability: BenchmarkCapability;
  readonly testId: string;
  // Raw per-dimension scores kept separate; do not collapse prematurely
  readonly qualityMetrics: Readonly<Record<string, number>>;
  readonly qualityObservations: readonly QualityObservation[];
  readonly costObservation: CostObservation;
  readonly latencyObservation: LatencyObservation;
  readonly dimensionScores: BenchmarkDimensionScores;
  readonly latencyMs: number;
  readonly estimatedCost: number;
  readonly success: boolean;
  readonly failureCategory: BenchmarkFailureCategory | null;
  readonly timestamp: string;
  readonly benchmarkVersion: string;
  readonly testVersion: string;
  readonly promptVersion: string;
  readonly resolutionRequested?: string;
  readonly generationParameters: Readonly<Record<string, unknown>>;
}

// ─── Pipeline — Section 13 ────────────────────────────────────────────────────
// Distinguishes generation resolution from post-generation refinement so that
// Generation → Editing → Upscaling → Mastering can be measured as a pipeline.

export interface BenchmarkPipelineStep {
  readonly stepId: string;
  readonly capability: BenchmarkCapability;
  readonly specId: string;
  readonly dependsOnStepId?: string;
}

export interface BenchmarkPipeline {
  readonly pipelineId: string;
  readonly version: string;
  readonly name: string;
  readonly steps: readonly BenchmarkPipelineStep[];
}

// ─── Report ───────────────────────────────────────────────────────────────────

// Section 12 — no automatic winner; evidence only; Chief Architect decides weights
export interface BenchmarkReport {
  readonly reportId: string;
  readonly benchmarkVersion: string;
  readonly generatedAt: string;
  readonly results: readonly BenchmarkResult[];
  readonly weightConfig: BenchmarkWeightConfig;
}

// ─── Executor contract ────────────────────────────────────────────────────────

export interface BenchmarkExecutionOutcome {
  readonly success: boolean;
  readonly latencyMs: number;
  readonly failureCategory?: BenchmarkFailureCategory;
}

export type BenchmarkExecutorFn = (
  spec: BenchmarkSpec,
  provider: BenchmarkProviderDescriptor
) => Promise<BenchmarkExecutionOutcome>;
