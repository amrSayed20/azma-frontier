// AZMA OS — Sovereign Model Selection Strategy: Core Type Contracts
//
// Provider-agnostic. No Magic Hour, OpenAI, or other provider names appear here.
// Creator-facing style names do not appear here — they live in the intent builder.

export type MediaType = 'image' | 'video';
export type QualityTier = 'standard' | 'high' | 'ultra';
export type ImageResolution = '512' | '1k' | '2k' | '4k';
export type VideoResolution = '480p' | '720p' | '1080p' | '4k';

/**
 * Three-level authorization gate for model registry entries.
 *
 * approved-candidate     — Chief Architect approved for registry inclusion.
 *                          Capability data has NOT been verified against the
 *                          actual provider API. Not eligible for paid production use.
 *
 * verified               — Capability data confirmed against actual provider API.
 *                          Chief Architect production authorization still required.
 *
 * production-authorized  — Verified AND Chief Architect has explicitly authorized
 *                          for paid production generation.
 */
export type VerificationStatus =
  | 'approved-candidate'
  | 'verified'
  | 'production-authorized';

// Numeric rank for quality tier comparison: standard < high < ultra.
export const QUALITY_TIER_RANK: Readonly<Record<QualityTier, number>> = {
  standard: 0,
  high: 1,
  ultra: 2,
};

// Numeric rank for image resolution comparison.
export const IMAGE_RESOLUTION_RANK: Readonly<Record<string, number>> = {
  '512': 0,
  '1k': 1,
  '2k': 2,
  '4k': 3,
};

// Numeric rank for video resolution comparison.
export const VIDEO_RESOLUTION_RANK: Readonly<Record<string, number>> = {
  '480p': 0,
  '720p': 1,
  '1080p': 2,
  '4k': 3,
};

/**
 * Everything Qiyamah knows about what the Creator wants to create.
 * Expressed entirely in AZMA-internal terms — no provider knowledge.
 * One per generation request; immutable once built.
 */
export interface SovereignCreationIntent {
  readonly mediaType: MediaType;
  readonly prompt: string;
  readonly style: string;
  readonly qualityRequirement: QualityTier;
  readonly resolution: string;
  readonly aspectRatio: string;
  readonly characteristicHints: readonly string[];
  /**
   * A model the Creator or the capability REQUIRES, by AZMA model id. When
   * set, the selector considers that model alone: authorized and active, it
   * is selected; otherwise the selection fails with 'required-model-unavailable'.
   * Nothing is substituted underneath a requirement — a «Veo» choice is Veo
   * or a refusal, never Seedance, never the provider default. (Sovereign
   * Journey construction order §12, 2026-09-22.)
   */
  readonly requiredModelId?: string;
  // Video-specific (undefined for image)
  readonly durationSeconds?: number;
  readonly platformTarget?: string;
  readonly characterConsistencyRequired?: boolean;
  readonly audioRequired?: boolean;
  /**
   * The intent starts from an existing image (animate-asset). Only a model
   * whose supportsImageToVideo is VERIFIED true is eligible; undefined is
   * treated as not supported, as with every other capability here.
   */
  readonly imageToVideoRequired?: boolean;
}

/**
 * The concrete execution path selected by SovereignModelSelector.
 * Internal to AZMA — never exposed to the Creator.
 */
export interface ModelSelection {
  readonly gatewayId: string;        // Cost-catalog gateway key (e.g. 'magic-hour')
  readonly providerId: string;       // Adapter provider ID (e.g. 'magic-hour-image')
  readonly modelId: string;          // AZMA internal model ID
  readonly providerModelId: string;  // Provider's API model string (passed to adapter)
  readonly aspectRatio: string;
  readonly resolution: string;
  readonly qualityTier: QualityTier;
  readonly verificationStatus: VerificationStatus;
  readonly durationSeconds?: number;
}

/**
 * Full descriptor for a model in the Sovereign Media Model Registry.
 * Covers both image and video. No field is fabricated:
 * capability values marked REQUIRES_VERIFICATION must not be claimed as production-ready.
 */
export interface SovereignMediaModelDescriptor {
  // ── Identity ──────────────────────────────────────────────────────────────
  readonly modelId: string;
  readonly providerId: string;
  readonly gatewayId: string;
  /**
   * The model string sent in the provider's API payload.
   * Marked "REQUIRES_VERIFICATION" in internalNotes for approved-candidate entries.
   */
  readonly providerModelId: string;
  /**
   * An engineer's label. It carries the provider's own product name and is
   * therefore NEVER rendered to a Creator — see `sovereignNameAr`.
   */
  readonly displayName: string;
  /**
   * What this model is, in the Creator's tongue and in terms of what it does
   * for them — never who built it.
   *
   * FOUND 2026-09-25: the Founder saw two provider product names on his own
   * screen. `displayName` held «Nano Banana 2», «Seedream 4», «Veo 3.1»,
   * «Kling 3.0», and the animation chooser rendered it straight through. The
   * Knowledge Source Abstraction Principle is not a rule about knowledge
   * alone: the Empire never exposes a provider to a Creator, in any Chamber.
   */
  readonly sovereignNameAr: string;
  /** One line on what choosing it means for the work. Shown beside the name. */
  readonly sovereignNoteAr: string;
  readonly mediaType: MediaType;

  // ── Capability ───────────────────────────────────────────────────────────
  readonly capabilities: readonly string[];
  readonly qualityTier: QualityTier;
  readonly maxImageResolution?: string;
  readonly maxVideoResolution?: string;
  readonly supportedAspectRatios: readonly string[];

  // ── Video-specific (undefined = not applicable / not verified) ────────────
  readonly minDurationSeconds?: number;
  readonly maxDurationSeconds?: number;
  /**
   * The exact durations the provider accepts for this model, when it accepts
   * only a discrete set rather than a range. Veo 3.1 answered a 5-second
   * request with HTTP 422 «Possible values are 4, 6, 8, 16, 24, 32, 40, 48,
   * 56» (2026-09-22). When declared, the selector refuses any other duration
   * — a Creator's duration is never quietly altered to fit.
   */
  readonly supportedDurationsSeconds?: readonly number[];
  readonly supportsTextToVideo?: boolean;
  readonly supportsImageToVideo?: boolean;
  readonly supportsAudio?: boolean;
  readonly supportsCharacterConsistency?: boolean;

  // ── Creative characteristics ──────────────────────────────────────────────
  readonly characteristicHints: readonly string[];
  readonly supportedStyleIds: readonly string[];

  // ── Economy ───────────────────────────────────────────────────────────────
  readonly costCatalogKey: {
    readonly gatewayId: string;
    readonly capabilityTarget: string;
    readonly modelId?: string;
  };

  // ── Authorization ─────────────────────────────────────────────────────────
  readonly verificationStatus: VerificationStatus;
  readonly productionAuthorized: boolean;
  readonly active: boolean;
  readonly internalNotes?: string;
}

// ── Selection result ──────────────────────────────────────────────────────────

export type ModelSelectionFailure = {
  readonly selected: false;
  readonly reason:
    | 'no-eligible-model'
    | 'all-candidates-unverified'
    | 'quality-unavailable'
    | 'resolution-unavailable'
    | 'duration-unavailable'
    | 'capability-unavailable'
    | 'required-model-unavailable';
  readonly detail: string;
};

export type ModelSelectionSuccess = {
  readonly selected: true;
  readonly selection: ModelSelection;
};

export type ModelSelectionResult = ModelSelectionSuccess | ModelSelectionFailure;

// ── Platform adaptation ───────────────────────────────────────────────────────

export interface PlatformDimensions {
  readonly aspectRatio: string;
  readonly resolutionHint: string;
  readonly label: string;
}

/**
 * Whether an existing master asset can serve a target platform.
 * direct-reuse       — Same dimensions; no processing needed.
 * crop-adapt         — Same orientation family; cropping/reframing is viable.
 * regenerate-required — Fundamentally different composition; must regenerate.
 */
export type MasterAssetAdaptability =
  | 'direct-reuse'
  | 'crop-adapt'
  | 'regenerate-required';

/**
 * Formal decision record for a single platform adaptation evaluation.
 *
 * When requiresRegenerationApproval is true the caller MUST obtain Creator
 * cost approval before dispatching a new provider generation (Section X +
 * Section XIX of Construction Order). AZMA never silently regenerates.
 */
export interface AdaptationDecision {
  readonly adaptability: MasterAssetAdaptability;
  readonly targetPlatform: string;
  readonly targetDimensions: PlatformDimensions;
  readonly requiresRegenerationApproval: boolean;
}
