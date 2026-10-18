/**
 * AZMA OS — Sovereign Vault: Creator Upload Storage
 *
 * PACKAGE XIX — MEDIA INGESTION LAYER: writes a Creator-uploaded file's
 * real bytes to disk under public/uploads/ and returns a servable URL
 * path — the exact same disk-write pattern
 * src/qiyamah-generation/asset-storage.ts's persistGeneratedImage()
 * already uses for Qiyamah-generated images, reused here rather than
 * duplicated. This lives in src/vault/, not src/qiyamah-generation/,
 * because a Creator's own file upload is a Ras Al Amr / Vault intake
 * concern, never a Qiyamah generation concern — per the Sovereign
 * Direction State ruling (2026-07-28): "If a Creator imports an external
 * sound file, it belongs to Ras Al Amr."
 *
 * DISCLOSED LIMITATION (same as persistGeneratedImage): local filesystem
 * storage is durable for a single, long-running server process, but does
 * not survive across separate serverless instances or ephemeral
 * deployments. Real, durable, shared object storage belongs to a future,
 * separately-authorized Persistent Storage Engineering Package.
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

/**
 * Read at CALL time, never frozen into a module constant.
 *
 * An environment variable captured at import time is a latent bug by
 * construction: whatever sets it afterwards is ignored, and the module keeps
 * the value it happened to see first. It cost eight failing tests in the image
 * edit route, after the same mistake had already been found and fixed in db.ts.
 * Four places in this repository held the pattern; this is one of them.
 */
function uploadedAssetsDir(): string {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), 'public', 'uploads');
}

/** Only a short, alphanumeric extension is honored — anything else (including path-traversal attempts hidden in a Creator-supplied filename) is dropped rather than trusted. */
const SAFE_EXTENSION_PATTERN = /^\.[a-zA-Z0-9]{1,10}$/;

export interface PersistedUpload {
  readonly assetId: string;
  readonly assetUrl: string;
  /**
   * Where the bytes were written on this server.
   *
   * Returned so the caller can ask the FILE what it carries before filing it.
   * A browser reports a type from the extension, and an audio-only `.webm` —
   * a microphone recording — arrives as `video/webm`. Without this path the
   * Vault had nothing to probe, so it filed a sound as a picture.
   */
  readonly filePath: string;
}

export async function persistUploadedAsset(bytes: Buffer, fileExtension: string): Promise<PersistedUpload> {
  const assetId = randomUUID();
  const safeExtension = SAFE_EXTENSION_PATTERN.test(fileExtension) ? fileExtension : '';
  const fileName = `${assetId}${safeExtension}`;

  // The directory is resolved at CALL time — see uploadedAssetsDir() above for
  // why a module constant here is a latent bug. The branch that added
  // `filePath` still had the frozen constant; this keeps both corrections.
  const dir = uploadedAssetsDir();
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, fileName);
  await writeFile(filePath, bytes);

  return {
    assetId,
    assetUrl: `/uploads/${fileName}`,
    filePath,
  };
}
