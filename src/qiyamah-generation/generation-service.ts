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

import { persistGeneratedImage } from './asset-storage';
import { getGenerationOrchestrator } from '../core/sovereign-ai-integration/provider-bootstrap';
import { isRateLimited, recordGeneration as recordRateLimitedGeneration } from './rate-limiter';
import { getDb, recordGeneration as persistGenerationRecord } from '../persistent-storage';
import { SovereignVaultManager } from '../vault/sovereign-vault-manager';
import { AssetFamily } from '../vault/sovereign-vault-types';
import { CapabilityTarget } from '../core/sovereign-orchestrator/qiyamah-intent-types';
import { buildImageCreationIntent, getProductionSelector } from '../sovereign-model-selection';
import type { GenerationRequest, GenerationResult } from './types';

// ─── PNG INTEGRITY GATE ───────────────────────────────────────────────────────

// ISO/IEC 15948 §5.2 — PNG file signature (8 bytes).
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
// Minimum physically-possible PNG: signature(8) + IHDR(25) + IDAT(≥13) + IEND(12) = 58 bytes.
// Gate at 67 — any real generated image is orders of magnitude larger; sub-67 is always corrupt.
const MIN_VALID_PNG_BYTES = 67;

function hasValidPngSignature(buf: Buffer): boolean {
  if (buf.length < MIN_VALID_PNG_BYTES) return false;
  for (let i = 0; i < PNG_SIGNATURE.length; i++) {
    if (buf[i] !== PNG_SIGNATURE[i]) return false;
  }
  return true;
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

  let providerResult: { bytes: Buffer; mimeType: string };
  try {
    providerResult = {
      bytes: Buffer.from(orchestrationResult.response.content, 'base64'),
      mimeType: 'image/png',
    };
  } catch {
    return {
      status: 'failed',
      reason: 'provider-error',
      message: 'The image generation response could not be decoded.',
    };
  }

  // Integrity gate: reject URL-as-bytes corruption, empty content, and non-PNG payloads.
  // Catches MagicHourVideoAdapter misrouting (video URL decoded as base64 = 56 bytes of garbage).
  if (!hasValidPngSignature(providerResult.bytes)) {
    return {
      status: 'failed',
      reason: 'provider-error',
      message: 'The provider returned invalid or corrupted image data.',
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
