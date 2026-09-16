import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { SovereignVaultManager } from '../../../../../src/vault/sovereign-vault-manager';
import { AssetFamily } from '../../../../../src/vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../../../src/core/sovereign-orchestrator/qiyamah-intent-types';
import { persistUploadedAsset } from '../../../../../src/vault/vault-asset-upload-storage';
import { validateUploadContent, rejectionSpokenAr, MAX_UPLOAD_BYTES } from '../../../../../src/vault/upload-content-validation';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const vaultManager = new SovereignVaultManager();

// PACKAGE XIX — MEDIA INGESTION LAYER: a real, honest mapping from what a
// browser actually reports as a file's MIME type to the platform's own
// already-real CapabilityTarget/AssetFamily vocabulary — never a guess.
// A type outside this list is rejected (400), not silently miscategorized.
const MIME_CAPABILITY_MAP: ReadonlyArray<{
  readonly prefix: string;
  readonly capabilityTarget: CapabilityTarget;
  readonly assetFamily: AssetFamily;
}> = [
  { prefix: 'image/', capabilityTarget: CapabilityTarget.VISUAL, assetFamily: AssetFamily.MEDIA },
  { prefix: 'video/', capabilityTarget: CapabilityTarget.MOTION, assetFamily: AssetFamily.MEDIA },
  { prefix: 'audio/', capabilityTarget: CapabilityTarget.AUDIO, assetFamily: AssetFamily.MEDIA },
  { prefix: 'text/', capabilityTarget: CapabilityTarget.WRITING, assetFamily: AssetFamily.STRUCTURAL },
  { prefix: 'application/json', capabilityTarget: CapabilityTarget.WRITING, assetFamily: AssetFamily.STRUCTURAL },
];

function resolveCapability(mimeType: string) {
  return MIME_CAPABILITY_MAP.find((entry) => mimeType.startsWith(entry.prefix)) ?? null;
}

// The ceiling and the extension now both live with the content validator, so
// the byte check and the size check cannot drift apart — one file decides what
// an acceptable upload is.

/**
 * PACKAGE XIX — MEDIA INGESTION LAYER: the real, honest Creator-upload
 * path the Sovereign Direction State ruling named as a required input
 * source. Reuses SovereignVaultManager.depositAsset() — the exact same
 * boundary Qiyamah generation already deposits through
 * (src/qiyamah-generation/generation-service.ts) — so an uploaded file
 * becomes a real VaultAsset, fetched by the same GET /api/vault/assets
 * this Chamber's UI already reads, and addable to the Narrative Canvas
 * through the exact same, already-existing ADD_NODE path. No parallel
 * ingestion pipeline, no new asset registry.
 */
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to upload to your Vault.' },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return NextResponse.json(
      { status: 'failed', reason: 'missing-file', message: 'A file is required under the "file" form field.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { status: 'failed', reason: 'file-too-large', message: `File exceeds the maximum upload size of ${MAX_UPLOAD_BYTES} bytes.` },
      { status: 400 },
    );
  }

  // ── SECURITY CLOSURE — the type is decided by the bytes ───────────────────
  //
  // This route used to decide everything from `file.type`, a string the browser
  // supplies and the uploader controls, and took the extension from the
  // filename. Nothing ever read the file. That is what let arbitrary bytes be
  // stored as an image and later handed to an image decoder.
  //
  // The content is now identified by its signature, and the declared type and
  // the filename must agree with what the bytes say. Both the capability and
  // the stored extension come from the identified content — never from the
  // request.
  const bytes = Buffer.from(await file.arrayBuffer());
  const validation = validateUploadContent(bytes, file.type ?? '', file.name ?? '');
  if (!validation.ok) {
    return NextResponse.json(
      {
        status: 'failed',
        reason: validation.rejection,
        // The Creator's own tongue, saying what to do. It names no decoder, no
        // library and no advisory.
        message: rejectionSpokenAr(validation.rejection),
      },
      { status: 400 },
    );
  }

  const capability = resolveCapability(validation.identity.mimeType);
  if (!capability) {
    return NextResponse.json(
      { status: 'failed', reason: 'unsupported-file-type', message: rejectionSpokenAr('unsupported-format') },
      { status: 400 },
    );
  }

  const persisted = await persistUploadedAsset(bytes, validation.identity.extension);

  // MINISTRY I — VOICE ECOSYSTEM: a real, Creator-declared "this is a
  // voice" flag, only ever meaningful for real audio uploads — never
  // inferred, never applied to a non-audio file. `voiceDisplayName` is
  // trimmed and only kept when the Creator actually provided one.
  const isVoice = capability.capabilityTarget === CapabilityTarget.AUDIO && formData.get('isVoice') === 'true';
  const voiceDisplayNameRaw = formData.get('voiceDisplayName');
  const voiceDisplayName =
    isVoice && typeof voiceDisplayNameRaw === 'string' && voiceDisplayNameRaw.trim().length > 0
      ? voiceDisplayNameRaw.trim()
      : undefined;

  const asset = await vaultManager.depositAsset({
    operationId: persisted.assetId,
    subscriberTenantId: session.creatorId,
    capabilityTarget: capability.capabilityTarget,
    assetFamily: capability.assetFamily,
    secureStorageUri: persisted.assetUrl,
    metadata: {
      fileSizeBytes: bytes.length,
      providerId: 'creator-upload',
      ...(isVoice ? { isVoiceAsset: true } : {}),
      ...(voiceDisplayName ? { voiceDisplayName } : {}),
    },
  });

  return NextResponse.json({ status: 'succeeded', asset });
}
