/**
 * AZMA OS — QIYAMAH: THE FIRST GENERATION PATH
 * Public API — import from here, never directly from the individual
 * files.
 *
 * The Official Generation Strategy for the First Constitutional
 * Launch ("The Law of First Creator Value"). Image generation only,
 * one Launch Provider (OpenAI), deliberately independent of the
 * preserved legacy orchestration tree.
 */

export type {
  GenerationRequest,
  GeneratedAsset,
  GenerationResult,
  GenerationSuccess,
  GenerationFailure,
  GenerationErrorReason,
  VideoGenerationRequest,
  VideoGeneratedAsset,
  VideoGenerationResult,
  VideoGenerationSuccess,
} from './types';

export { generateImage, generateVideo } from './generation-service';
export { isRateLimited, recordGeneration, resetRateLimiterForTests } from './rate-limiter';
export { resetProviderClientForTests } from './image-provider';
