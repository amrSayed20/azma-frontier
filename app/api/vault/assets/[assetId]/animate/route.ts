import { NextRequest, NextResponse } from 'next/server';
import { join, basename } from 'path';
import { readFile, unlink } from 'fs/promises';
import { verifySession } from '@/src/authentication';
import { getDb, getVaultAsset, recordGeneration as persistGenerationRecord } from '@/src/persistent-storage';
import { persistGeneratedVideo, detectVideoFormat } from '@/src/qiyamah-generation/asset-storage';
import { beginOperation, safeDetail } from '@/src/qiyamah-generation/generation-observability';
import { deriveAsset, mutationRejectionSpokenAr } from '@/src/vault/sovereign-asset-mutation';
import { SourceChamber, DerivationKind, isDerivable, isLegacyAsset } from '@/src/vault/sovereign-vault-types';
import { CapabilityTarget } from '@/src/core/sovereign-orchestrator/qiyamah-intent-types';
import { buildAnimationIntent, getProductionSelector } from '@/src/sovereign-model-selection';
import {
  animateImageViaProvider,
  imageToVideoIsConfigured,
} from '@/src/core/sovereign-ai-integration/adapters/magic-hour-image-to-video';
import { ImageEditError } from '@/src/core/sovereign-ai-integration/adapters/magic-hour-image-editing';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const MAX_INSTRUCTION = 1_000;
const MIN_SECONDS = 1;
const MAX_SECONDS = 8;

/**
 * POST /api/vault/assets/[assetId]/animate — the boundary of `animate-asset`.
 *
 * ─── THE CAPABILITY THIS PERFORMS ────────────────────────────────────────────
 *
 *   Chamber Truth, Qiyamah: «Transforms an existing sovereign visual asset
 *   into a time-based video through an authorized motion-generation provider
 *   binding.» Distinct from edit-inside-asset — an edit changes what an image
 *   shows; an animation brings it into time and produces a VIDEO. Article 4.5:
 *   inside the asset, so Qiyamah's; the video it yields is what Ras Al Amr
 *   may later assemble with others.
 *
 * ─── THE SHAPE OF THE OPERATION ──────────────────────────────────────────────
 *
 *   existing sovereign image (owned, derivable)
 *     → the Creator's motion instruction
 *     → a model the Creator REQUIRES, answered by the selector or refused
 *     → the provider binding renders a video
 *     → bytes are ours: downloaded, validated as MP4/WebM, kept as our file
 *     → a derived sovereign asset: parent = the image, root = its root,
 *       derivation ANIMATED, target MOTION, provenance = the model executed
 *     → a generation record describing the animation itself
 *
 *   The source image is read and never written. deriveAsset writes nothing
 *   until the output exists and differs from the input; a refusal leaves no
 *   row and no file behind.
 *
 * ─── WHAT IS DELIBERATELY NOT HERE ───────────────────────────────────────────
 *
 *   No default model. The Creator names one (`modelId`, an AZMA fleet id);
 *   a name the fleet does not authorize and activate for image-to-video is
 *   refused with the selector's reason, never quietly replaced.
 */
function uploadsDir(): string {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), 'public', 'uploads');
}

function resolveOnDisk(secureStorageUri: string): string | null {
  const name = basename(secureStorageUri);
  if (!name || name === '.' || name === '..') return null;
  if (secureStorageUri.startsWith('/generated-assets/')) return join(uploadsDir(), 'generated-assets', name);
  if (secureStorageUri.startsWith('/uploads/')) return join(uploadsDir(), name);
  return null;
}

function extensionOf(uri: string): string {
  const name = basename(uri);
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ assetId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' }, { status: 401 });
  }

  const { assetId } = await context.params;
  const trail = beginOperation({
    operationId: crypto.randomUUID(),
    kind: 'image-animation',
    ownerId: session.creatorId,
    sourceAssetId: assetId,
  });
  const refuse = (http: number, reason: string, message: string, stage: string, detail: string) => {
    const f = trail.fail(stage, http === 503 ? 'provider-unavailable' : http === 422 || http === 408 ? 'provider-failed' : 'invalid-input', detail);
    return NextResponse.json({ status: 'failed', reason, message, operationId: f.operationId, stage: f.stage }, { status: http });
  };

  let body: unknown;
  try { body = await request.json(); } catch {
    return refuse(400, 'invalid-input', 'الطلب غير صالح.', 'validate', 'body is not JSON');
  }
  const b = (body ?? {}) as { instruction?: unknown; modelId?: unknown; durationSeconds?: unknown };
  const instruction = typeof b.instruction === 'string' ? b.instruction.trim() : '';
  if (instruction.length === 0) {
    return refuse(400, 'empty-instruction', 'اكتب كيف تريد أن تتحرّك الصورة.', 'validate', 'empty instruction');
  }
  if (instruction.length > MAX_INSTRUCTION) {
    return refuse(400, 'instruction-too-long', 'الوصف أطول من المسموح.', 'validate', `instruction length ${instruction.length}`);
  }
  const modelId = typeof b.modelId === 'string' ? b.modelId.trim() : '';
  if (modelId.length === 0) {
    return refuse(400, 'model-required', 'اختر نموذج الحركة.', 'validate', 'no modelId');
  }
  const durationSeconds =
    typeof b.durationSeconds === 'number' && Number.isFinite(b.durationSeconds)
      ? Math.round(b.durationSeconds)
      : 5;
  if (durationSeconds < MIN_SECONDS || durationSeconds > MAX_SECONDS) {
    return refuse(400, 'invalid-duration', `المدّة بين ${MIN_SECONDS} و${MAX_SECONDS} ثوانٍ.`, 'validate', `durationSeconds ${durationSeconds}`);
  }
  if (!imageToVideoIsConfigured()) {
    return refuse(503, 'capability-unavailable', 'تحريك الصور غير متاحٍ حالياً.', 'configure', 'no provider credential');
  }

  // ── The model: required, answered or refused ───────────────────────────────
  const selection = getProductionSelector().select(buildAnimationIntent(instruction, modelId, durationSeconds));
  if (!selection.selected) {
    return refuse(409, 'model-unavailable', 'هذا النموذج غير متاحٍ لتحريك الصور.', 'select', `${selection.reason}: ${selection.detail}`);
  }
  trail.stage('selected', { modelId: selection.selection.modelId, providerModelId: selection.selection.providerModelId });

  // ── The source: owned, an image, derivable ─────────────────────────────────
  const db = getDb();
  const parent = getVaultAsset(db, assetId);
  if (!parent || parent.subscriberTenantId !== session.creatorId) {
    return refuse(404, 'not-found', 'الأصل غير موجود.', 'ownership', 'not owned or absent');
  }
  if (parent.capabilityTarget !== CapabilityTarget.VISUAL) {
    return refuse(400, 'not-an-image', 'هذا الأصل ليس صورة.', 'validate-source', `target ${parent.capabilityTarget}`);
  }
  if (isLegacyAsset(parent) && !isDerivable(parent)) {
    return refuse(409, 'requires-adoption', mutationRejectionSpokenAr('PARENT_REQUIRES_ADOPTION'), 'validate-source', 'legacy, not adopted');
  }
  if (!isDerivable(parent)) {
    return refuse(409, 'not-derivable', mutationRejectionSpokenAr('PARENT_NOT_DERIVABLE'), 'validate-source', 'derivation withheld');
  }
  const diskPath = resolveOnDisk(parent.secureStorageUri);
  if (!diskPath) {
    return refuse(400, 'source-unreadable', 'تعذّر الوصول إلى هذه الصورة.', 'read-source', 'no disk path');
  }
  let parentBytes: Buffer;
  try {
    parentBytes = await readFile(diskPath);
  } catch (err) {
    return refuse(500, 'source-unreadable', 'تعذّر قراءة الصورة الأصلية.', 'read-source', safeDetail(err));
  }

  // ── The provider ───────────────────────────────────────────────────────────
  trail.stage('submit', { providerModelId: selection.selection.providerModelId, durationSeconds });
  let produced;
  try {
    produced = await animateImageViaProvider(parentBytes, extensionOf(parent.secureStorageUri), instruction, {
      providerModelId: selection.selection.providerModelId,
      endSeconds: durationSeconds,
    });
  } catch (err) {
    const rejection = err instanceof ImageEditError ? err.rejection : null;
    if (rejection === 'NO_CREDIT') {
      return refuse(503, 'capability-unavailable', 'تحريك الصور متوقّفٌ مؤقّتاً لنفاد رصيد الإمبراطوريّة. لا شأن لصورتك بذلك.', 'provider', safeDetail(err));
    }
    if (rejection === 'TIMED_OUT') {
      return refuse(408, 'timed-out', 'استغرق التحريك وقتاً طويلاً. أعد المحاولة.', 'provider', safeDetail(err));
    }
    // 422, not 502: the edge replaces a 5xx with its own HTML page and the
    // Creator never sees the operation id or the provider's words. Measured
    // 2026-09-22 — the Veo refusal reached the browser as «<!DOCTYPE».
    return refuse(422, 'animation-failed', 'تعذّر تنفيذ التحريك. لم يُحفظ شيء.', 'provider', safeDetail(err));
  }
  trail.stage('provider-done', { providerJobId: produced.providerJobId, providerModelId: produced.providerModelId, bytes: produced.bytes.length });

  const videoFormat = detectVideoFormat(produced.bytes);
  if (!videoFormat) {
    return refuse(422, 'animation-failed', 'أعاد المزوّد ما ليس فيديو. لم يُحفظ شيء.', 'validate-output', `${produced.bytes.length} bytes, no MP4/WebM signature`);
  }

  // ── Ours from here ─────────────────────────────────────────────────────────
  const persisted = await persistGeneratedVideo(produced.bytes, videoFormat);
  trail.stage('file-persisted', { assetId: persisted.assetId });

  const outcome = await deriveAsset({
    parentAssetId: parent.assetId,
    ownerId: session.creatorId,
    parentBytes,
    outputBytes: produced.bytes,
    outputStorageUri: persisted.assetUrl,
    chamber: SourceChamber.QIYAMAH,
    derivation: DerivationKind.ANIMATED,
    outputCapabilityTarget: CapabilityTarget.MOTION,
    instructionAr: instruction,
    operationId: persisted.assetId,
    actorId: session.creatorId,
    providerProvenance: {
      providerId: produced.providerId,
      providerModelId: produced.providerModelId,
      providerJobId: produced.providerJobId,
    },
  });
  if (!outcome.ok) {
    try { await unlink(join(uploadsDir(), 'generated-assets', basename(persisted.assetUrl))); } catch { /* already gone */ }
    const f = trail.fail('derive', 'deposit', outcome.rejection);
    return NextResponse.json(
      { status: 'failed', reason: outcome.rejection, message: mutationRejectionSpokenAr(outcome.rejection), operationId: f.operationId, stage: f.stage },
      { status: outcome.rejection === 'OUTPUT_IDENTICAL_TO_PARENT' ? 409 : 400 },
    );
  }
  trail.stage('asset-deposited', { assetId: outcome.asset.assetId, providerModelId: produced.providerModelId });

  // The generation record describes the ANIMATION — its own instruction,
  // its own model — never the source image's generation.
  persistGenerationRecord(db, {
    creatorId: session.creatorId,
    prompt: instruction,
    style: 'animate-asset',
    assetUrl: persisted.assetUrl,
    originalIdea: instruction,
    mediaType: 'video',
  });
  trail.stage('record-inserted', { assetId: outcome.asset.assetId });
  trail.done({ assetId: outcome.asset.assetId });

  return NextResponse.json({
    status: 'succeeded',
    operationId: trail.operationId,
    asset: outcome.asset,
    lineage: {
      parentAssetId: outcome.asset.parentAssetId,
      rootAssetId: outcome.asset.rootAssetId,
      version: outcome.asset.version,
      derivation: DerivationKind.ANIMATED,
    },
    provider: {
      providerId: produced.providerId,
      providerModelId: produced.providerModelId,
      providerJobId: produced.providerJobId,
      fps: produced.fps,
      width: produced.width,
      height: produced.height,
    },
  });
}
