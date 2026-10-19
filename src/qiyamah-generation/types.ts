/**
 * AZMA OS — QIYAMAH: THE FIRST GENERATION PATH
 * Type Definitions
 *
 * Authority: "The Law of First Creator Value" — the certified Official
 * Generation Strategy for the First Constitutional Launch. Image
 * generation only, one Launch Provider, deliberately NOT part of the
 * legacy src/chambers/qiyamah/ orchestration tree (preserved untouched
 * as Post-Launch Evolution).
 */

export interface GenerationRequest {
  readonly prompt: string;
  readonly style?: string;
  /** Optional today: no real Authentication exists yet. When omitted, the resulting record is honestly anonymous. */
  readonly creatorId?: string;
  /** The Creator's verbatim idea, stored separately from the constructed production prompt. */
  readonly originalIdea?: string | null;
  /** One id per attempt, minted by the route; threaded to the provider and back. */
  readonly operationId?: string;
  /**
   * ── WHICH FRAME THE PICTURE IS FOR ──────────────────────────
   *
   *   A platform NAME (`tiktok`, `youtube`, `instagram`, …) that
   *   `platform-adapter.ts` already maps to an aspect ratio. It is passed
   *   through to `buildImageCreationIntent`, whose third parameter has
   *   accepted exactly this since it was written.
   *
   *   MEASURED at 369f785: that call read
   *   `buildImageCreationIntent(request.prompt.trim(), style)` — two
   *   arguments. The parameter existed and nothing ever filled it, so every
   *   generated picture came out 16:9 whatever frame the Creator had chosen.
   *
   *   A NAME, never a ratio: the map from a platform to its shape belongs to
   *   `platform-adapter.ts` and is not restated here. An unknown name, or
   *   none, resolves to that module’s documented 16:9 — so a caller that does
   *   not set this behaves exactly as every caller did before the field
   *   existed.
   */
  readonly platformTarget?: string;
  /**
   * ── TEST-ONLY MODEL BINDING ─ NOT A CREATOR OPTION ─────────────────
   *
   *   An AZMA fleet model id — never a provider string — that a Founder-gated
   *   internal test path may name so a controlled comparison can hold every
   *   other variable fixed.
   *
   *   THE PRODUCTION ROUTE NEVER SETS THIS. `app/api/qiyamah/generate` does
   *   not read it, does not forward it, and does not know it exists, so no
   *   browser request can carry it into a normal generation — not because a
   *   check rejects it, but because nothing on that path ever looks for it.
   *   That is the whole authorization design: the override lives on a
   *   separate surface, behind `verifyFounderSession`, rather than as a field
   *   a creator might learn to send.
   *
   *   It resolves through the sovereign fleet, so a dormant binding can be
   *   addressed for a test WITHOUT becoming dispatchable — the selector is
   *   not consulted and its authorized pool is not widened.
   */
  readonly testOnlyModelId?: string;
}

export interface GeneratedAsset {
  readonly assetId: string;
  readonly assetUrl: string;
  readonly prompt: string;
  readonly style: string | null;
  readonly generatedAt: string;
  /** The Creator's original idea as entered. Null for assets generated before this field was added. */
  readonly originalIdea: string | null;
  readonly operationId?: string;
  /** The provider model that actually produced these bytes, as the binding reports it. */
  readonly providerModelId?: string | null;
}

export type GenerationErrorReason =
  | 'invalid-prompt'
  | 'rate-limited'
  | 'provider-error'
  | 'storage-error';

export interface GenerationFailure {
  readonly status: 'failed';
  readonly reason: GenerationErrorReason;
  readonly message: string;
  /** Where and why it broke — see generation-observability.ts. */
  readonly operationId?: string;
  readonly stage?: string;
  readonly detail?: string;
}

export interface GenerationSuccess {
  readonly status: 'succeeded';
  readonly asset: GeneratedAsset;
}

export type GenerationResult = GenerationSuccess | GenerationFailure;

// ─── VIDEO ───────────────────────────────────────────────────────────────────

export interface VideoGenerationRequest {
  readonly prompt: string;
  readonly style?: string;
  readonly durationSeconds: number;
  /**
   * The shape of the scene — '16:9' horizontal, '9:16' vertical, '1:1' square.
   *
   * The Founder asked for it on 2026-09-25 and no field existed: the Chamber
   * could not offer a choice the request had no way to carry. Optional, so a
   * caller that does not care gets the provider's own default.
   */
  readonly aspectRatio?: string;
  readonly creatorId?: string;
  readonly originalIdea?: string | null;
  /** One id per attempt, minted by the route; threaded to the provider and back. */
  readonly operationId?: string;
  /** TEST-ONLY fleet model id — see the note on GenerationRequest. */
  readonly testOnlyModelId?: string;
}

export interface VideoGeneratedAsset {
  readonly assetId: string;
  /** CDN download URL from the video provider. May expire after ~24 hours. */
  readonly assetUrl: string;
  readonly prompt: string;
  readonly style: string | null;
  readonly durationSeconds: number;
  readonly generatedAt: string;
  readonly originalIdea: string | null;
}

/**
 * What the production itself established, as distinct from what was asked for.
 *
 * These travel back so the operation ledger's own columns — which have existed
 * unfilled since it was written — can be sealed by the lifecycle's existing
 * DEPOSITED transition. No new table, no new call, no second write.
 */
export interface ProductionFacts {
  readonly allocatedProviderId: string;
  readonly externalJobId: string | null;
  /**
   * The provider's charge IN THE PROVIDER'S OWN UNIT — never cash, and never
   * comparable with `estimated_resource_cost`, which is an AZMA constant.
   */
  readonly providerCharge: number | null;
  readonly providerChargeUnit: string | null;
  /** What the provider says it made, when it says it. */
  readonly producedSeconds: number | null;
}

export interface VideoGenerationSuccess {
  readonly status: 'succeeded';
  readonly asset: VideoGeneratedAsset;
  readonly production?: ProductionFacts;
}

export type VideoGenerationResult = VideoGenerationSuccess | GenerationFailure;
