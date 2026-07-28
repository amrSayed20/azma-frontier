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

const UPLOADED_ASSETS_DIR = join(process.cwd(), 'public', 'uploads');

/** Only a short, alphanumeric extension is honored — anything else (including path-traversal attempts hidden in a Creator-supplied filename) is dropped rather than trusted. */
const SAFE_EXTENSION_PATTERN = /^\.[a-zA-Z0-9]{1,10}$/;

export interface PersistedUpload {
  readonly assetId: string;
  readonly assetUrl: string;
}

export async function persistUploadedAsset(bytes: Buffer, fileExtension: string): Promise<PersistedUpload> {
  const assetId = randomUUID();
  const safeExtension = SAFE_EXTENSION_PATTERN.test(fileExtension) ? fileExtension : '';
  const fileName = `${assetId}${safeExtension}`;

  await mkdir(UPLOADED_ASSETS_DIR, { recursive: true });
  await writeFile(join(UPLOADED_ASSETS_DIR, fileName), bytes);

  return {
    assetId,
    assetUrl: `/uploads/${fileName}`,
  };
}
