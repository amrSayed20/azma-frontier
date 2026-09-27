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
import { persistGeneratedImage, persistGeneratedVideo, detectVideoFormat, type PersistedVideo } from './asset-storage';
import { getGenerationOrchestrator } from '../core/sovereign-ai-integration/provider-bootstrap';
import { isRateLimited, recordGeneration as recordRateLimitedGeneration } from './rate-limiter';
import { getDb, recordGeneration as persistGenerationRecord, linkGenerationToVaultAsset } from '../persistent-storage';
import { digestOf } from '../vault/sovereign-asset-mutation';
import { SovereignVaultManager } from '../vault/sovereign-vault-manager';
import { AssetFamily, SourceChamber, SovereignDepositError } from '../vault/sovereign-vault-types';
import { CapabilityTarget } from '../core/sovereign-orchestrator/qiyamah-intent-types';
import { buildImageCreationIntent, buildVideoCreationIntent, getProductionSelector } from '../sovereign-model-selection';
import { IMAGE_MODEL_FLEET } from '../sovereign-model-selection/image-model-fleet';
import { VIDEO_MODEL_FLEET } from '../sovereign-model-selection/video-model-fleet';
import { beginOperation, safeDetail } from './generation-observability';
import type { OperationTrail, FailureCategory } from './generation-observability';
import type { GenerationRequest, GenerationResult, GenerationFailure, VideoGenerationRequest, VideoGenerationResult } from './types';

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

/** A failure that knows where it happened. `message` stays Creator-safe. */
function failAt(
  trail: OperationTrail,
  reason: GenerationFailure['reason'],
  stage: string,
  category: FailureCategory,
  message: string,
  detail: string,
  data?: Record<string, unknown>,
): GenerationFailure {
  const f = trail.fail(stage, category, detail, data);
  return { status: 'failed', reason, message, operationId: f.operationId, stage: f.stage, detail: f.detail };
}

async function depositGeneratedAssetIntoVault(params: {
  readonly assetId: string;
  readonly creatorId: string;
  readonly assetUrl: string;
  readonly prompt: string;
  readonly style: string | null;
  readonly resolvedProviderId: string;
  /** The provider model that produced the bytes — recorded, never assumed. */
  readonly providerModelId: string | null;
  readonly operationId: string;
  /** The provider's own job identity, so a charge stays reconstructable. */
  readonly providerJobId: string | null;
  /** The provider's actual charge, IN THE PROVIDER'S OWN UNIT. Never cash. */
  readonly providerCreditsCharged: number | null;
  /** SHA-256 of the bytes that were actually kept. */
  readonly contentDigest: string;
}): Promise<string | null> {
  try {
    const deposited = await vaultManager.depositAsset({
      // The operation that made it, not the file it became — the same repair
      // the video deposit needed, for the same reason.
      operationId: params.operationId,
      subscriberTenantId: params.creatorId,
      capabilityTarget: CapabilityTarget.VISUAL,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: params.assetUrl,
      // The chamber that materially produced this asset. Article 10.
      creationChamber: SourceChamber.QIYAMAH,

      contentDigest: params.contentDigest,
      metadata: {
        providerId: params.resolvedProviderId,
        ...(params.providerModelId ? { generationModel: params.providerModelId } : {}),
        generationOperationId: params.operationId,
        generationPrompt: params.prompt,
        // The unit travels with the number, always.
        ...(params.providerCreditsCharged !== null
          ? { providerCreditsCharged: params.providerCreditsCharged, providerCreditUnit: 'magic-hour-credits' }
          : {}),
        ...(params.providerJobId ? { providerJobId: params.providerJobId } : {}),
        contentDigest: params.contentDigest,
        ...(params.style ? { generationStyle: params.style } : {}),
      },
    });
    // The Vault mints its own id. Returning it is what lets the generation
    // record point at the asset that EXISTS, instead of at the file id — the
    // fault that made every fresh picture un-editable.
    return deposited.assetId;
  } catch (err) {
    //   A Creator PAID for this production. If the Vault refuses it because
    //   they already own these exact bytes, the right answer is the asset
    //   they already have — not silence, and not a second copy. Any other
    //   refusal degrades honestly: a Vault failure must never turn an
    //   already-successful generation into a reported failure.
    if (err instanceof SovereignDepositError && err.rejection === 'DUPLICATE_CONTENT' && err.existingAssetId) {
      return err.existingAssetId;
    }
    console.error('[VaultDeposit] deposit failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
}

async function depositVideoAssetIntoVault(params: {
  readonly assetId: string;
  readonly creatorId: string;
  readonly assetUrl: string;
  readonly prompt: string;
  readonly style: string | null;
  /** What the Creator ASKED FOR. */
  readonly durationSeconds: number;
  /** What the provider says it MADE. Null when the provider did not state it. */
  readonly producedSeconds: number | null;
  readonly resolvedProviderId: string;
  readonly providerModelId: string | null;
  readonly operationId: string;
  /** The provider's own job identity, so cost stays reconstructable. */
  readonly providerJobId: string | null;
  /** The provider's actual charge, IN THE PROVIDER'S OWN UNIT. Never cash. */
  readonly providerCreditsCharged: number | null;
  /**
   * The conditions the charge was incurred under. A quantity without its
   * conditions is not a cost: 1008 credits means nothing until it is known to
   * be 6 seconds at 1280×720 and 24fps. Absent when the provider did not say.
   */
  readonly outputWidth: number | null;
  readonly outputHeight: number | null;
  readonly outputFps: number | null;
  /** SHA-256 of the bytes that were actually kept. */
  readonly contentDigest: string;
}): Promise<string | null> {
  try {
    const deposited = await vaultManager.depositAsset({
      // ── THE OPERATION THAT MADE IT, NOT THE FILE IT BECAME ───────────
      //   MEASURED 2026-09-26: this column held the FILE id on 104 of 119
      //   assets, while the true operation id sat beside it in metadata. The
      //   column named for the operation now holds the operation.
      operationId: params.operationId,
      subscriberTenantId: params.creatorId,
      capabilityTarget: CapabilityTarget.MOTION,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: params.assetUrl,
      // The chamber that materially produced this asset. Article 10.
      creationChamber: SourceChamber.QIYAMAH,

      contentDigest: params.contentDigest,
      metadata: {
        providerId: params.resolvedProviderId,
        ...(params.providerModelId ? { generationModel: params.providerModelId } : {}),
        generationOperationId: params.operationId,
        generationPrompt: params.prompt,
        // ── REQUESTED AND PRODUCED ARE TWO FACTS ─────────────────────────
        //   MEASURED 2026-09-26: this asset recorded `durationSeconds: 6`
        //   while its own file is 4.096 seconds. The request was written and
        //   described as the result. Both are kept now, and neither is
        //   inferred from the other.
        durationSeconds: params.durationSeconds,
        ...(params.producedSeconds !== null ? { producedSeconds: params.producedSeconds } : {}),
        // ── THE CHARGE, IN THE PROVIDER'S OWN UNIT ───────────────────────
        //   672 of these is 672 MagicHour credits. It is NOT 672 of anything
        //   else, and above all it is not dollars. The unit travels with the
        //   number so no later reader can mistake one for the other.
        ...(params.providerCreditsCharged !== null
          ? { providerCreditsCharged: params.providerCreditsCharged, providerCreditUnit: 'magic-hour-credits' }
          : {}),
        ...(params.providerJobId ? { providerJobId: params.providerJobId } : {}),
        ...(params.outputWidth !== null ? { outputWidth: params.outputWidth } : {}),
        ...(params.outputHeight !== null ? { outputHeight: params.outputHeight } : {}),
        ...(params.outputFps !== null ? { outputFps: params.outputFps } : {}),
        contentDigest: params.contentDigest,
        ...(params.style ? { generationStyle: params.style } : {}),
      },
    });
    return deposited.assetId;
  } catch (err) {
    // Same rule as the image deposit: a paid production is never lost to the
    // duplicate guard — the Creator is given the asset they already own.
    if (err instanceof SovereignDepositError && err.rejection === 'DUPLICATE_CONTENT' && err.existingAssetId) {
      return err.existingAssetId;
    }
    console.error('[VaultDeposit] video deposit failed:', err instanceof Error ? err.message : String(err));
    return null;
  }
}


/**
 * ── A TEST-ONLY BINDING, RESOLVED THROUGH THE SOVEREIGN FLEET ───────────
 *
 *   Registered under the Controlled Model Test Enablement order of 2026-09-27
 *   so that exactly two controlled comparisons can hold every variable fixed
 *   but the model.
 *
 *   It resolves an AZMA FLEET ID and returns that entry's own binding. An
 *   arbitrary provider string cannot pass through here: a caller naming
 *   'minimax-h3-turbo' or 'gpt-image-2' gets null, because those are not
 *   fleet ids. That is the guarantee section V of the order asks for —
 *   provider model names stay implementation details of a registered binding.
 *
 *   It deliberately does NOT consult the selector. The selector's authorized
 *   pool is `productionAuthorized && active`, and widening it — even
 *   conditionally — would put a dormant model one boolean away from normal
 *   routing. Nothing here touches that pool, so a dormant binding stays
 *   undispatchable by every ordinary path while remaining addressable by name
 *   on this one.
 */
function resolveTestOnlyBinding(
  modelId: string,
  mediaType: 'image' | 'video',
): { providerId: string; modelId: string; providerModelId: string } | null {
  const fleet = mediaType === 'video' ? VIDEO_MODEL_FLEET : IMAGE_MODEL_FLEET;
  const entry = fleet.find((m) => m.modelId === modelId);
  if (!entry) return null;
  return { providerId: entry.providerId, modelId: entry.modelId, providerModelId: entry.providerModelId };
}

const MAX_PROMPT_LENGTH = 1000;

function validate(request: GenerationRequest): string | null {
  const trimmed = request.prompt.trim();
  if (trimmed.length === 0) return 'A prompt is required to generate an image.';
  if (trimmed.length > MAX_PROMPT_LENGTH) return `Prompt exceeds the maximum length of ${MAX_PROMPT_LENGTH} characters.`;
  return null;
}

export async function generateImage(request: GenerationRequest): Promise<GenerationResult> {
  const trail = beginOperation({
    operationId: request.operationId ?? crypto.randomUUID(),
    kind: 'image-generation',
    ownerId: request.creatorId ?? null,
  });
  const validationError = validate(request);
  if (validationError) {
    return failAt(trail, 'invalid-prompt', 'validate', 'invalid-input', validationError, validationError);
  }

  if (isRateLimited()) {
    return failAt(trail, 'rate-limited', 'rate-limit', 'rate-limited',
      'The interim generation limit has been reached. Please try again later.', 'interim rate limit reached');
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
  // A Founder-gated controlled test may name the binding. With no override
  // this expression IS the selector call, unchanged, so normal production
  // resolves exactly as it did before this field existed.
  const testBinding = request.testOnlyModelId
    ? resolveTestOnlyBinding(request.testOnlyModelId, 'image')
    : null;
  if (request.testOnlyModelId && !testBinding) {
    return failAt(trail, 'provider-error', 'select', 'selection',
      'The requested capability is not available.',
      `test-only model '${request.testOnlyModelId}' is not a registered AZMA fleet id`);
  }
  const selectionResult = testBinding
    ? ({ selected: true, selection: testBinding } as ReturnType<ReturnType<typeof getProductionSelector>['select']>)
    : getProductionSelector().select(creationIntent);
  trail.stage('selected', selectionResult.selected
    ? { providerId: selectionResult.selection.providerId, modelId: selectionResult.selection.modelId, providerModelId: selectionResult.selection.providerModelId }
    : { selected: false, reason: selectionResult.reason });

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
    return failAt(trail, 'provider-error', 'select', 'selection',
      'The requested quality or resolution is not currently available. ' +
        'Please try a different style or check back later.',
      `${selectionResult.reason}: ${selectionResult.detail}`);
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
      requestId: trail.operationId,
      requestedBy: request.creatorId ?? 'azma-anonymous',
      prompt: request.prompt.trim(),
      taskHint: 'image',
      chamberId: 'qiyamah',
      purpose: 'Sovereign image generation for Creator',
      preferredProviderId,
      preferredModelId,
      metadata: orchestrationMetadata,
    });
  } catch (err) {
    // Until 2026-09-22 this was `catch {}` — the one place a provider's own
    // words were thrown away, and the reason a failed attempt could not be
    // explained. The words are kept now, trimmed and without secrets.
    return failAt(trail, 'provider-error', 'submit', 'provider-unavailable',
      'No image generation provider was available. The capability may require an API credential to be configured.',
      safeDetail(err));
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

  const providerMeta = orchestrationResult.response.providerMetadata ?? {};
  const executedModel = typeof providerMeta['providerModelId'] === 'string' ? (providerMeta['providerModelId'] as string) : null;
  trail.stage('provider-done', {
    providerId: orchestrationResult.response.providerId,
    providerModelId: executedModel,
    providerJobId: providerMeta['magicHourJobId'] ?? null,
    finishReason: orchestrationResult.response.finishReason,
    latencyMs: orchestrationResult.response.latencyMs,
  });
  if (orchestrationResult.response.finishReason !== 'completed') {
    const providerWords = [providerMeta['magicHourErrorCode'], providerMeta['magicHourErrorMessage']].filter(Boolean).join(': ');
    return failAt(trail, 'provider-error', 'provider', 'provider-failed',
      'No image generation provider was available. The capability may require an API credential to be configured.',
      providerWords || `finishReason=${orchestrationResult.response.finishReason}`,
      { providerJobId: providerMeta['magicHourJobId'] ?? null });
  }

  let rawBytes: Buffer;
  try {
    rawBytes = Buffer.from(orchestrationResult.response.content, 'base64');
  } catch (err) {
    return failAt(trail, 'provider-error', 'download', 'download',
      'The image generation response could not be decoded.', safeDetail(err));
  }

  // Integrity gate: reject URL-as-bytes corruption, empty content, and unrecognized formats.
  // Accepts PNG, JPEG, and WebP — the formats Magic Hour CDN may return.
  // Catches MagicHourVideoAdapter misrouting (video URL decoded as base64 = small garbage buffer).
  const detectedFormat = detectImageFormat(rawBytes);
  if (!detectedFormat) {
    return failAt(trail, 'provider-error', 'validate-output', 'invalid-output',
      'The provider returned invalid or corrupted image data.', `${rawBytes.length} bytes, no known image signature`);
  }
  trail.stage('downloaded', { bytes: rawBytes.length, mimeType: detectedFormat });

  const providerResult = { bytes: rawBytes, mimeType: detectedFormat };

  try {
    const persisted = await persistGeneratedImage(providerResult.bytes, providerResult.mimeType);
    trail.stage('file-persisted', { assetId: persisted.assetId });
    recordRateLimitedGeneration();
    const generationRecord = persistGenerationRecord(getDb(), {
      creatorId: request.creatorId ?? null,
      prompt: request.prompt.trim(),
      style,
      assetUrl: persisted.assetUrl,
      // The asset this became. It was known here all along and written only
      // into the observability trail, so the gallery — the one thing a
      // Creator reads — could not act on what the Chamber had just created.
      assetId: persisted.assetId,
      originalIdea: request.originalIdea ?? null,
    });
    // Until the Vault answers, the file id is all that is known. It is
    // replaced the moment the deposit returns the sovereign one.
    let sovereignAssetId = persisted.assetId;
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
      const vaultAssetId = await depositGeneratedAssetIntoVault({
        assetId: persisted.assetId,
        creatorId: request.creatorId,
        assetUrl: persisted.assetUrl,
        prompt: request.prompt.trim(),
        style,
        resolvedProviderId,
        providerModelId: executedModel,
        operationId: trail.operationId,
        providerJobId: typeof providerMeta['magicHourJobId'] === 'string'
          ? (providerMeta['magicHourJobId'] as string) : null,
        providerCreditsCharged: typeof providerMeta['magicHourCreditsCharged'] === 'number'
          ? (providerMeta['magicHourCreditsCharged'] as number) : null,
        // The digest of the bytes actually kept — never of the prompt, never
        // of anything the provider said about them.
        contentDigest: digestOf(rawBytes),
      });
      trail.stage('asset-deposited', { assetId: persisted.assetId, providerModelId: executedModel });
      // ── THE ID THAT EXISTS, NOT THE ID THAT WAS CONVENIENT ─────────────
      //   MEASURED ON PRODUCTION 2026-09-26: the record and the response both
      //   carried `persisted.assetId` — the FILE id — while the Vault minted
      //   its own. Editing, animating or upscaling a picture the Chamber had
      //   just made answered `404 الأصل غير موجود`. Both now carry the id the
      //   Vault actually holds.
      if (vaultAssetId) {
        sovereignAssetId = vaultAssetId;
        // Honest degrade, for the same reason the deposit degrades: a link
        // written late must never turn a succeeded generation into a failure.
        try {
          if (generationRecord?.recordId) {
            linkGenerationToVaultAsset(getDb(), generationRecord.recordId, vaultAssetId);
          }
        } catch (err) {
          console.error('[VaultLink] could not link generation to asset:', err instanceof Error ? err.message : String(err));
        }
      }
    }
    trail.done({ assetId: sovereignAssetId });
    return {
      status: 'succeeded',
      asset: {
        assetId: sovereignAssetId,
        assetUrl: persisted.assetUrl,
        prompt: request.prompt.trim(),
        style,
        generatedAt: new Date().toISOString(),
        originalIdea: request.originalIdea ?? null,
        operationId: trail.operationId,
        providerModelId: executedModel,
      },
    };
  } catch (error) {
    return failAt(trail, 'storage-error', 'persist', 'storage',
      error instanceof Error ? error.message : 'Failed to persist the generated image.', safeDetail(error));
  }
}

// ─── VIDEO GENERATION ─────────────────────────────────────────────────────────

export async function generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
  const trail = beginOperation({
    operationId: request.operationId ?? crypto.randomUUID(),
    kind: 'video-generation',
    ownerId: request.creatorId ?? null,
  });
  const trimmedPrompt = request.prompt.trim();
  if (!trimmedPrompt) {
    return failAt(trail, 'invalid-prompt', 'validate', 'invalid-input', 'A prompt is required to generate a video.', 'empty prompt');
  }
  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return failAt(trail, 'invalid-prompt', 'validate', 'invalid-input',
      `Prompt exceeds the maximum length of ${MAX_PROMPT_LENGTH} characters.`, `prompt length ${trimmedPrompt.length}`);
  }

  const style = request.style?.trim() || null;

  const creationIntent = buildVideoCreationIntent(trimmedPrompt, style, request.durationSeconds);
  // Same seam as the image path: absent an override, this is the selector
  // call verbatim.
  const testBinding = request.testOnlyModelId
    ? resolveTestOnlyBinding(request.testOnlyModelId, 'video')
    : null;
  if (request.testOnlyModelId && !testBinding) {
    return failAt(trail, 'provider-error', 'select', 'selection',
      'The requested capability is not available.',
      `test-only model '${request.testOnlyModelId}' is not a registered AZMA fleet id`);
  }
  const selectionResult = testBinding
    ? ({ selected: true, selection: testBinding } as ReturnType<ReturnType<typeof getProductionSelector>['select']>)
    : getProductionSelector().select(creationIntent);
  trail.stage('selected', selectionResult.selected
    ? { providerId: selectionResult.selection.providerId, modelId: selectionResult.selection.modelId, providerModelId: selectionResult.selection.providerModelId }
    : { selected: false, reason: selectionResult.reason });

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
    ...(request.aspectRatio ? { aspectRatio: request.aspectRatio } : {}),
  };

  if (selectionResult.selected) {
    preferredProviderId = selectionResult.selection.providerId;
    preferredModelId = selectionResult.selection.modelId;
    orchestrationMetadata['providerModelId'] = selectionResult.selection.providerModelId;
  } else if (selectionResult.reason !== 'all-candidates-unverified') {
    return failAt(trail, 'provider-error', 'select', 'selection',
      'The requested video quality or duration is not currently available. Please try a different duration.',
      `${selectionResult.reason}: ${selectionResult.detail}`);
  }

  let orchestrationResult: Awaited<ReturnType<ReturnType<typeof getGenerationOrchestrator>['orchestrate']>>;
  try {
    orchestrationResult = await getGenerationOrchestrator().orchestrate({
      requestId: trail.operationId,
      requestedBy: request.creatorId ?? 'azma-anonymous',
      prompt: trimmedPrompt,
      taskHint: 'video',
      chamberId: 'qiyamah',
      purpose: 'Sovereign video generation for Creator',
      preferredProviderId,
      preferredModelId,
      metadata: orchestrationMetadata,
    });
  } catch (err) {
    return failAt(trail, 'provider-error', 'submit', 'provider-unavailable',
      'No video generation provider was available. The capability may require an API credential to be configured.',
      safeDetail(err));
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

  const providerMeta = orchestrationResult.response.providerMetadata ?? {};
  const executedModel = typeof providerMeta['providerModelId'] === 'string' ? (providerMeta['providerModelId'] as string) : null;
  trail.stage('provider-done', {
    providerId: orchestrationResult.response.providerId,
    providerModelId: executedModel,
    providerJobId: providerMeta['magicHourJobId'] ?? null,
    finishReason: orchestrationResult.response.finishReason,
    latencyMs: orchestrationResult.response.latencyMs,
  });
  if (orchestrationResult.response.finishReason !== 'completed') {
    const providerWords = [providerMeta['magicHourErrorCode'], providerMeta['magicHourErrorMessage']].filter(Boolean).join(': ');
    return failAt(trail, 'provider-error', 'provider', 'provider-failed',
      'No video generation provider was available. The capability may require an API credential to be configured.',
      providerWords || `finishReason=${orchestrationResult.response.finishReason}`,
      { providerJobId: providerMeta['magicHourJobId'] ?? null });
  }

  // VIDEO CONTRACT: The MagicHourVideoAdapter returns the CDN download URL directly in
  // content — NOT base64-encoded bytes. Never call Buffer.from(content, 'base64') here.
  const videoUrl = orchestrationResult.response.content;
  if (!videoUrl || !videoUrl.startsWith('http')) {
    return failAt(trail, 'provider-error', 'download', 'download', 'The provider returned an invalid video URL.', 'content is not an http url');
  }

  // The bytes are OURS from here. Until 2026-09-22 the provider's 24-hour
  // download URL was stored as the asset itself — see persistGeneratedVideo.
  let videoBytes: Buffer;
  try {
    const download = await fetch(videoUrl);
    if (!download.ok) throw new Error(`HTTP ${download.status}`);
    videoBytes = Buffer.from(await download.arrayBuffer());
  } catch (err) {
    return failAt(trail, 'provider-error', 'download', 'download', 'The generated video could not be retrieved from the provider.', safeDetail(err));
  }
  const videoFormat = detectVideoFormat(videoBytes);
  if (!videoFormat) {
    return failAt(trail, 'provider-error', 'validate-output', 'invalid-output',
      'The provider returned data that is not a video.', `${videoBytes.length} bytes, no MP4/WebM signature`);
  }
  trail.stage('downloaded', { bytes: videoBytes.length, mimeType: videoFormat });

  // The silence boundary runs inside persistGeneratedVideo, before the bytes
  // become a file. A provider master that cannot be made silent is refused
  // here, by the storage-error path that already existed — never deposited.
  let persisted: PersistedVideo;
  try {
    persisted = await persistGeneratedVideo(videoBytes, videoFormat);
  } catch (err) {
    return failAt(trail, 'storage-error', 'persist', 'storage', 'Failed to keep the generated video.', safeDetail(err));
  }
  trail.stage('file-persisted', {
    assetId: persisted.assetId,
    // What the boundary found and what it did about it.
    providerAudioStreams: persisted.silence.before.audioStreams,
    audioStreamsRemoved: persisted.silence.audioStreamsRemoved,
    finalAudioStreams: persisted.silence.after.audioStreams,
  });
  const assetId = persisted.assetId;
  const storedUrl = persisted.assetUrl;

  try {
    const generationRecord = persistGenerationRecord(getDb(), {
      creatorId: request.creatorId ?? null,
      prompt: trimmedPrompt,
      style,
      assetUrl: storedUrl,
      assetId,
      originalIdea: request.originalIdea ?? null,
      mediaType: 'video',
    });
    let sovereignAssetId = assetId;
    trail.stage('record-inserted', { assetId });

    console.log(
      '[SovereignGeneration] video-generation-record',
      JSON.stringify({
        status: 'succeeded',
        creatorId: request.creatorId ?? null,
        assetId,
        assetUrl: storedUrl,
        style,
        durationSeconds: request.durationSeconds,
      }),
    );

    if (request.creatorId) {
      const resolvedProviderId = orchestrationResult.response.providerId ?? 'magic-hour-video';
      // Everything below is already in hand at this point. None of it was
      // read before, so all of it was lost the moment this function returned.
      const providerJobId = typeof providerMeta['magicHourJobId'] === 'string'
        ? (providerMeta['magicHourJobId'] as string) : null;
      const providerCreditsCharged = typeof providerMeta['magicHourCreditsCharged'] === 'number'
        ? (providerMeta['magicHourCreditsCharged'] as number) : null;
      const producedSeconds = typeof providerMeta['magicHourProducedSeconds'] === 'number'
        ? (providerMeta['magicHourProducedSeconds'] as number) : null;

      const vaultAssetId = await depositVideoAssetIntoVault({
        assetId,
        creatorId: request.creatorId,
        assetUrl: storedUrl,
        prompt: trimmedPrompt,
        style,
        durationSeconds: request.durationSeconds,
        producedSeconds,
        resolvedProviderId,
        providerModelId: executedModel,
        operationId: trail.operationId,
        providerJobId,
        providerCreditsCharged,
        outputWidth: typeof providerMeta['magicHourWidth'] === 'number'
          ? (providerMeta['magicHourWidth'] as number) : null,
        outputHeight: typeof providerMeta['magicHourHeight'] === 'number'
          ? (providerMeta['magicHourHeight'] as number) : null,
        outputFps: typeof providerMeta['magicHourFps'] === 'number'
          ? (providerMeta['magicHourFps'] as number) : null,
        // The digest of the bytes actually kept — not of the prompt, not of
        // anything the provider said about them, and NOT of what the provider
        // sent when silence enforcement had to remove an audio stream from it.
        contentDigest: digestOf(persisted.bytes),
      });
      trail.stage('asset-deposited', {
        assetId, providerModelId: executedModel, providerJobId,
        // The charge enters the Empire's own record here for the first time,
        // named in the provider's unit so it can never read as cash.
        providerCreditsCharged, providerCreditUnit: 'magic-hour-credits',
        requestedSeconds: request.durationSeconds, producedSeconds,
      });

      if (vaultAssetId) {
        sovereignAssetId = vaultAssetId;
        // Honest degrade, for the same reason the deposit degrades: a link
        // written late must never turn a succeeded generation into a failure.
        try {
          if (generationRecord?.recordId) {
            linkGenerationToVaultAsset(getDb(), generationRecord.recordId, vaultAssetId);
          }
        } catch (err) {
          console.error('[VaultLink] could not link generation to asset:', err instanceof Error ? err.message : String(err));
        }
      }
    }
    trail.done({ assetId: sovereignAssetId });

    return {
      status: 'succeeded',
      asset: {
        // The sovereign id, so the Chamber can act on the clip it just made.
        assetId: sovereignAssetId,
        assetUrl: storedUrl,
        prompt: trimmedPrompt,
        style,
        durationSeconds: request.durationSeconds,
        generatedAt: new Date().toISOString(),
        originalIdea: request.originalIdea ?? null,
      },
      production: {
        allocatedProviderId: orchestrationResult.response.providerId ?? 'magic-hour-video',
        externalJobId: typeof providerMeta['magicHourJobId'] === 'string'
          ? (providerMeta['magicHourJobId'] as string) : null,
        providerCharge: typeof providerMeta['magicHourCreditsCharged'] === 'number'
          ? (providerMeta['magicHourCreditsCharged'] as number) : null,
        providerChargeUnit: typeof providerMeta['magicHourCreditsCharged'] === 'number'
          ? 'magic-hour-credits' : null,
        producedSeconds: typeof providerMeta['magicHourProducedSeconds'] === 'number'
          ? (providerMeta['magicHourProducedSeconds'] as number) : null,
      },
    };
  } catch (error) {
    return failAt(trail, 'storage-error', 'record', 'record',
      error instanceof Error ? error.message : 'Failed to record the generated video.', safeDetail(error));
  }
}
