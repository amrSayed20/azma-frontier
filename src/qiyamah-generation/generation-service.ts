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
 *
 * INTEGRATION PACKAGE I — THE FIRST LIVING CONNECTION (2026-07-25): a
 * successful generation is now also deposited into the real, already-
 * correct SovereignVaultManager via its existing depositAsset() path —
 * the one connection the Constitutional Audit found missing. This does
 * NOT call or revive FleetDispatcher/AsynchronousResolutionGateway/
 * FleetMaterializationRuntime — SovereignVaultManager is called
 * directly, exactly as any other real caller of its own public API
 * would. A Vault deposit failure never turns an already-successful
 * generation into a reported failure — the Creator's real asset and
 * gallery entry are unaffected either way; the deposit is a genuine
 * addition, not a new point of fragility in existing behavior.
 */

import { randomUUID } from 'crypto';
import { persistGeneratedImage } from './asset-storage';
import { getGenerationOrchestrator } from '../core/sovereign-ai-integration/provider-bootstrap';
import { isRateLimited, recordGeneration as recordRateLimitedGeneration } from './rate-limiter';
import { getDb, recordGeneration as persistGenerationRecord } from '../persistent-storage';
import { SovereignVaultManager } from '../vault/sovereign-vault-manager';
import { AssetFamily } from '../vault/sovereign-vault-types';
import { CapabilityTarget } from '../core/sovereign-orchestrator/qiyamah-intent-types';
import { buildImageCreationIntent, buildVideoCreationIntent, getProductionSelector } from '../sovereign-model-selection';
import type { GenerationRequest, GenerationResult, VideoGenerationRequest, VideoGenerationResult } from './types';

// ─── IMAGE FORMAT INTEGRITY GATE ─────────────────────────────────────────────

// Minimum bytes required to read the WebP container header (the widest check below).
const MIN_VALID_IMAGE_BYTES = 12;

// Returns the detected MIME type from binary magic bytes, or null if unrecognized.
// Supports the three CDN formats Magic Hour may return: PNG, JPEG, WebP.
function detectImageFormat(buf: Buffer): 'image/png' | 'image/jpeg' | 'image/webp' | null {
  if (buf.length < MIN_VALID_IMAGE_BYTES) return null;
  // PNG: ISO/IEC 15948 §5.2 — 8-byte signature
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
      buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) return 'image/png';
  // JPEG: SOI marker
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  // WebP: RIFF....WEBP container (RFC 6386)
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp';
  return null;
}

const vaultManager = new SovereignVaultManager();

async function depositGeneratedAssetIntoVault(params: {
  readonly assetId: string;
  readonly creatorId: string;
  readonly assetUrl: string;
  readonly prompt: string;
  readonly style: string | null;
  readonly resolvedProviderId: string;
}): Promise<void> {
  try {
    await vaultManager.depositAsset({
      operationId: params.assetId,
      subscriberTenantId: params.creatorId,
      capabilityTarget: CapabilityTarget.VISUAL,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: params.assetUrl,
      metadata: {
        providerId: params.resolvedProviderId,
        generationPrompt: params.prompt,
        ...(params.style ? { generationStyle: params.style } : {}),
      },
    });
  } catch (err) {
    // Honest degrade — a Vault deposit failure must never turn an
    // already-successful generation into a reported failure.
    console.error('[VaultDeposit] deposit failed:', err instanceof Error ? err.message : String(err));
  }
}

async function depositVideoAssetIntoVault(params: {
  readonly assetId: string;
  readonly creatorId: string;
  readonly assetUrl: string;
  readonly prompt: string;
  readonly style: string | null;
  readonly durationSeconds: number;
  readonly resolvedProviderId: string;
}): Promise<void> {
  try {
    await vaultManager.depositAsset({
      operationId: params.assetId,
      subscriberTenantId: params.creatorId,
      capabilityTarget: CapabilityTarget.MOTION,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: params.assetUrl,
      metadata: {
        providerId: params.resolvedProviderId,
        generationPrompt: params.prompt,
        durationSeconds: params.durationSeconds,
        ...(params.style ? { generationStyle: params.style } : {}),
      },
    });
  } catch (err) {
    console.error('[VaultDeposit] video deposit failed:', err instanceof Error ? err.message : String(err));
  }
}

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

  // ── Sovereign Model Selection ─────────────────────────────────────────────
  // Build a creation intent from the request and ask the selector for the
  // optimal model. When no production-authorized model is available (all
  // candidates are approved-candidate, awaiting verification), the selector
  // returns 'all-candidates-unverified' and we fall through to the legacy
  // orchestration path (no preferredProviderId/modelId — the orchestrator
  // uses whatever registered adapter is available, currently flux-schnell).
  //
  // Hard requirement failures (quality-unavailable, resolution-unavailable,
  // duration-unavailable) are surfaced as provider-error — AZMA never
  // silently downgrades a Creator requirement.
  const creationIntent = buildImageCreationIntent(request.prompt.trim(), style);
  const selectionResult = getProductionSelector().select(creationIntent);

  // Production observability — internal only, never Creator-facing
  console.log(
    '[SovereignGeneration] model-selection',
    JSON.stringify(
      selectionResult.selected
        ? {
            selected: true,
            providerId: selectionResult.selection.providerId,
            modelId: selectionResult.selection.modelId,
            providerModelId: selectionResult.selection.providerModelId,
            qualityTier: selectionResult.selection.qualityTier,
            aspectRatio: selectionResult.selection.aspectRatio,
            resolution: selectionResult.selection.resolution,
          }
        : {
            selected: false,
            reason: selectionResult.reason,
            detail: selectionResult.detail,
          },
    ),
  );

  let preferredProviderId: string | undefined;
  let preferredModelId: string | undefined;
  const orchestrationMetadata: Record<string, unknown> = style ? { style } : {};

  if (selectionResult.selected) {
    preferredProviderId = selectionResult.selection.providerId;
    preferredModelId = selectionResult.selection.modelId;
    orchestrationMetadata['aspectRatio'] = selectionResult.selection.aspectRatio;
    orchestrationMetadata['resolution'] = selectionResult.selection.resolution;
    orchestrationMetadata['providerModelId'] = selectionResult.selection.providerModelId;
  } else if (selectionResult.reason !== 'all-candidates-unverified') {
    // Hard requirement not satisfiable — quality or resolution cannot be met.
    // Do NOT silently fall back to a lower-quality model.
    return {
      status: 'failed',
      reason: 'provider-error',
      message:
        'The requested quality or resolution is not currently available. ' +
        'Please try a different style or check back later.',
    };
  }
  // 'all-candidates-unverified': fall through without model preference (legacy path).

  // ── Orchestration ─────────────────────────────────────────────────────────
  // Route through the sovereign orchestration path — provider selection,
  // constitutional routing, and fallback are all handled by the existing
  // DNAOrchestratorRuntime.  The adapter returns base64-encoded bytes in
  // NormalizedAIResponse.content; we decode back to Buffer here.
  let orchestrationResult: Awaited<ReturnType<ReturnType<typeof getGenerationOrchestrator>['orchestrate']>>;
  try {
    orchestrationResult = await getGenerationOrchestrator().orchestrate({
      requestId: crypto.randomUUID(),
      requestedBy: request.creatorId ?? 'azma-anonymous',
      prompt: request.prompt.trim(),
      taskHint: 'image',
      chamberId: 'qiyamah',
      purpose: 'Sovereign image generation for Creator',
      preferredProviderId,
      preferredModelId,
      metadata: orchestrationMetadata,
    });
  } catch {
    return {
      status: 'failed',
      reason: 'provider-error',
      message:
        'No image generation provider was available. The capability may require an API credential to be configured.',
    };
  }

  // Log orchestration result for post-test audit (job ID + credits logged by adapter)
  console.log(
    '[SovereignGeneration] orchestration-result',
    JSON.stringify({
      finishReason: orchestrationResult.response.finishReason,
      providerId: orchestrationResult.response.providerId,
      selectedProviderId: orchestrationResult.selection?.selectedProviderId,
      selectedModelId: orchestrationResult.selection?.selectedModelId,
      latencyMs: orchestrationResult.response.latencyMs,
    }),
  );

  if (orchestrationResult.response.finishReason !== 'completed') {
    return {
      status: 'failed',
      reason: 'provider-error',
      message:
        'No image generation provider was available. The capability may require an API credential to be configured.',
    };
  }

  let rawBytes: Buffer;
  try {
    rawBytes = Buffer.from(orchestrationResult.response.content, 'base64');
  } catch {
    return {
      status: 'failed',
      reason: 'provider-error',
      message: 'The image generation response could not be decoded.',
    };
  }

  // Integrity gate: reject URL-as-bytes corruption, empty content, and unrecognized formats.
  // Accepts PNG, JPEG, and WebP — the formats Magic Hour CDN may return.
  // Catches MagicHourVideoAdapter misrouting (video URL decoded as base64 = small garbage buffer).
  const detectedFormat = detectImageFormat(rawBytes);
  if (!detectedFormat) {
    return {
      status: 'failed',
      reason: 'provider-error',
      message: 'The provider returned invalid or corrupted image data.',
    };
  }

  const providerResult = { bytes: rawBytes, mimeType: detectedFormat };

  try {
    const persisted = await persistGeneratedImage(providerResult.bytes, providerResult.mimeType);
    recordRateLimitedGeneration();
    persistGenerationRecord(getDb(), {
      creatorId: request.creatorId ?? null,
      prompt: request.prompt.trim(),
      style,
      assetUrl: persisted.assetUrl,
      originalIdea: request.originalIdea ?? null,
    });
    console.log(
      '[SovereignGeneration] generation-record',
      JSON.stringify({
        status: 'succeeded',
        creatorId: request.creatorId ?? null,
        assetId: persisted.assetId,
        assetUrl: persisted.assetUrl,
        style,
        prompt: request.prompt.trim().slice(0, 80),
      }),
    );
    if (request.creatorId) {
      // Use the actual provider ID from the orchestration response when available;
      // fall back to the legacy Magic Hour image provider ID.
      const resolvedProviderId =
        orchestrationResult.response.providerId ?? 'magic-hour-image';
      await depositGeneratedAssetIntoVault({
        assetId: persisted.assetId,
        creatorId: request.creatorId,
        assetUrl: persisted.assetUrl,
        prompt: request.prompt.trim(),
        style,
        resolvedProviderId,
      });
    }
    return {
      status: 'succeeded',
      asset: {
        assetId: persisted.assetId,
        assetUrl: persisted.assetUrl,
        prompt: request.prompt.trim(),
        style,
        generatedAt: new Date().toISOString(),
        originalIdea: request.originalIdea ?? null,
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

// ─── VIDEO GENERATION ─────────────────────────────────────────────────────────

export async function generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
  const trimmedPrompt = request.prompt.trim();
  if (!trimmedPrompt) {
    return { status: 'failed', reason: 'invalid-prompt', message: 'A prompt is required to generate a video.' };
  }
  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return { status: 'failed', reason: 'invalid-prompt', message: `Prompt exceeds the maximum length of ${MAX_PROMPT_LENGTH} characters.` };
  }

  const style = request.style?.trim() || null;

  const creationIntent = buildVideoCreationIntent(trimmedPrompt, style, request.durationSeconds);
  const selectionResult = getProductionSelector().select(creationIntent);

  console.log(
    '[SovereignGeneration] video-model-selection',
    JSON.stringify(
      selectionResult.selected
        ? {
            selected: true,
            providerId: selectionResult.selection.providerId,
            modelId: selectionResult.selection.modelId,
            providerModelId: selectionResult.selection.providerModelId,
          }
        : { selected: false, reason: selectionResult.reason, detail: selectionResult.detail },
    ),
  );

  let preferredProviderId: string | undefined;
  let preferredModelId: string | undefined;
  const orchestrationMetadata: Record<string, unknown> = {
    ...(style ? { style } : {}),
    durationSeconds: request.durationSeconds,
  };

  if (selectionResult.selected) {
    preferredProviderId = selectionResult.selection.providerId;
    preferredModelId = selectionResult.selection.modelId;
    orchestrationMetadata['providerModelId'] = selectionResult.selection.providerModelId;
  } else if (selectionResult.reason !== 'all-candidates-unverified') {
    return {
      status: 'failed',
      reason: 'provider-error',
      message: 'The requested video quality or duration is not currently available. Please try a different duration.',
    };
  }

  let orchestrationResult: Awaited<ReturnType<ReturnType<typeof getGenerationOrchestrator>['orchestrate']>>;
  try {
    orchestrationResult = await getGenerationOrchestrator().orchestrate({
      requestId: crypto.randomUUID(),
      requestedBy: request.creatorId ?? 'azma-anonymous',
      prompt: trimmedPrompt,
      taskHint: 'video',
      chamberId: 'qiyamah',
      purpose: 'Sovereign video generation for Creator',
      preferredProviderId,
      preferredModelId,
      metadata: orchestrationMetadata,
    });
  } catch {
    return {
      status: 'failed',
      reason: 'provider-error',
      message: 'No video generation provider was available. The capability may require an API credential to be configured.',
    };
  }

  console.log(
    '[SovereignGeneration] video-orchestration-result',
    JSON.stringify({
      finishReason: orchestrationResult.response.finishReason,
      providerId: orchestrationResult.response.providerId,
      selectedProviderId: orchestrationResult.selection?.selectedProviderId,
      latencyMs: orchestrationResult.response.latencyMs,
    }),
  );

  if (orchestrationResult.response.finishReason !== 'completed') {
    return {
      status: 'failed',
      reason: 'provider-error',
      message: 'No video generation provider was available. The capability may require an API credential to be configured.',
    };
  }

  // VIDEO CONTRACT: The MagicHourVideoAdapter returns the CDN download URL directly in
  // content — NOT base64-encoded bytes. Never call Buffer.from(content, 'base64') here.
  const videoUrl = orchestrationResult.response.content;
  if (!videoUrl || !videoUrl.startsWith('http')) {
    return {
      status: 'failed',
      reason: 'provider-error',
      message: 'The provider returned an invalid video URL.',
    };
  }

  const assetId = randomUUID();

  try {
    persistGenerationRecord(getDb(), {
      creatorId: request.creatorId ?? null,
      prompt: trimmedPrompt,
      style,
      assetUrl: videoUrl,
      originalIdea: request.originalIdea ?? null,
      mediaType: 'video',
    });

    console.log(
      '[SovereignGeneration] video-generation-record',
      JSON.stringify({
        status: 'succeeded',
        creatorId: request.creatorId ?? null,
        assetId,
        assetUrl: videoUrl.slice(0, 80),
        style,
        durationSeconds: request.durationSeconds,
      }),
    );

    if (request.creatorId) {
      const resolvedProviderId = orchestrationResult.response.providerId ?? 'magic-hour-video';
      await depositVideoAssetIntoVault({
        assetId,
        creatorId: request.creatorId,
        assetUrl: videoUrl,
        prompt: trimmedPrompt,
        style,
        durationSeconds: request.durationSeconds,
        resolvedProviderId,
      });
    }

    return {
      status: 'succeeded',
      asset: {
        assetId,
        assetUrl: videoUrl,
        prompt: trimmedPrompt,
        style,
        durationSeconds: request.durationSeconds,
        generatedAt: new Date().toISOString(),
        originalIdea: request.originalIdea ?? null,
      },
    };
  } catch (error) {
    return {
      status: 'failed',
      reason: 'storage-error',
      message: error instanceof Error ? error.message : 'Failed to record the generated video.',
    };
  }
}
