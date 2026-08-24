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
}

export interface GeneratedAsset {
  readonly assetId: string;
  readonly assetUrl: string;
  readonly prompt: string;
  readonly style: string | null;
  readonly generatedAt: string;
  /** The Creator's original idea as entered. Null for assets generated before this field was added. */
  readonly originalIdea: string | null;
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
}

export interface GenerationSuccess {
  readonly status: 'succeeded';
  readonly asset: GeneratedAsset;
}

export type GenerationResult = GenerationSuccess | GenerationFailure;
