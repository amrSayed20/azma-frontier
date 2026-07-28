import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { SovereignVaultManager } from '../../../../../src/vault/sovereign-vault-manager';
import { AssetFamily } from '../../../../../src/vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../../../src/core/sovereign-orchestrator/qiyamah-intent-types';
import { persistUploadedAsset } from '../../../../../src/vault/vault-asset-upload-storage';

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

// A resource-exhaustion guard, not a constitutional decision — an
// unbounded upload target would be a real denial-of-service surface.
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

function fileExtensionOf(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot === -1 ? '' : fileName.slice(lastDot);
}

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

  const capability = resolveCapability(file.type);
  if (!capability) {
    return NextResponse.json(
      { status: 'failed', reason: 'unsupported-file-type', message: `Unsupported file type: ${file.type || 'unknown'}.` },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const persisted = await persistUploadedAsset(bytes, fileExtensionOf(file.name));

  const asset = await vaultManager.depositAsset({
    operationId: persisted.assetId,
    subscriberTenantId: session.creatorId,
    capabilityTarget: capability.capabilityTarget,
    assetFamily: capability.assetFamily,
    secureStorageUri: persisted.assetUrl,
    metadata: {
      fileSizeBytes: bytes.length,
      providerId: 'creator-upload',
    },
  });

  return NextResponse.json({ status: 'succeeded', asset });
}
