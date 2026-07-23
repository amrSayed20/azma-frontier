/**
 * AZMA OS — QIYAMAH: THE FIRST GENERATION PATH
 * The Generation Service
 *
 * Orchestrates validation, interim cost control, the Launch Provider
 * call, and binary asset persistence into one honest result — never a
 * fake success. This is the entire new capability; nothing here calls
 * or revives src/chambers/qiyamah/ or src/orchestrator/
 * fleet-materialization/.
 *
 * PERSISTENT STORAGE FOUNDATION (Engineering Package II): every
 * successful generation is now durably recorded via
 * src/persistent-storage/'s generation_records table — replacing the
 * prior disclosed gap where a generation's own metadata existed only in
 * its HTTP response. creatorId is honestly null until a future
 * Authentication Package supplies a real one.
 */

import { generateImageViaProvider } from './image-provider';
import { persistGeneratedImage } from './asset-storage';
import { isRateLimited, recordGeneration as recordRateLimitedGeneration } from './rate-limiter';
import { getDb, recordGeneration as persistGenerationRecord } from '../persistent-storage';
import type { GenerationRequest, GenerationResult } from './types';

const MAX_PROMPT_LENGTH = 1000;

function validate(request: GenerationRequest): string | null {
  const trimmed = request.prompt.trim();
  if (trimmed.length === 0) return 'A prompt is required to generate an image.';
  if (trimmed.length > MAX_PROMPT_LENGTH) return `Prompt exceeds the maximum length of ${MAX_PROMPT_LENGTH} characters.`;
  return null;
}

export async function generateImage(request: GenerationRequest): Promise<GenerationResult> {
  const validationError = validate(request);
  if (validationError) {
    return { status: 'failed', reason: 'invalid-prompt', message: validationError };
  }

  if (isRateLimited()) {
    return {
      status: 'failed',
      reason: 'rate-limited',
      message: 'The interim generation limit has been reached. Please try again later.',
    };
  }

  const style = request.style?.trim() || null;

  let providerResult;
  try {
    providerResult = await generateImageViaProvider(request.prompt.trim(), style);
  } catch (error) {
    return {
      status: 'failed',
      reason: 'provider-error',
      message: error instanceof Error ? error.message : 'The Launch Provider failed to generate an image.',
    };
  }

  try {
    const persisted = await persistGeneratedImage(providerResult.bytes);
    recordRateLimitedGeneration();
    persistGenerationRecord(getDb(), {
      creatorId: request.creatorId ?? null,
      prompt: request.prompt.trim(),
      style,
      assetUrl: persisted.assetUrl,
    });
    return {
      status: 'succeeded',
      asset: {
        assetId: persisted.assetId,
        assetUrl: persisted.assetUrl,
        prompt: request.prompt.trim(),
        style,
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    return {
      status: 'failed',
      reason: 'storage-error',
      message: error instanceof Error ? error.message : 'Failed to persist the generated image.',
    };
  }
}
