/**
 * AZMA OS — QIYAMAH: THE FIRST GENERATION PATH
 * Binary Asset Persistence
 *
 * Writes the generated image to disk under public/generated-assets/ and
 * returns a servable URL path. This is "binary asset persistence" per
 * the certified design — deliberately NOT Persistent Metadata Storage
 * (out of Boundaries for this Package). DISCLOSED LIMITATION: local
 * filesystem storage is durable for a single, long-running server
 * process, but does not survive across separate serverless instances
 * or ephemeral deployments — the same durability caveat already named
 * for the platform's other in-memory/local state. Real, durable,
 * shared object storage belongs to a future, separately-authorized
 * Persistent Storage Engineering Package.
 */

import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

// In production UPLOADS_DIR=/var/www/azma-uploads (Nginx-served, www-data accessible).
// In development fallback: public/generated-assets (Next.js static, dev only).
/** Read at call time — see the note in vault-asset-upload-storage.ts. */
function generatedAssetsDir(): string {
  return process.env['UPLOADS_DIR']
    ? join(process.env['UPLOADS_DIR'], 'generated-assets')
    : join(process.cwd(), 'public', 'generated-assets');
}

export interface PersistedAsset {
  readonly assetId: string;
  readonly assetUrl: string;
}

const MIME_TO_EXT: Record<string, string> = {
  'image/png':  'png',
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

export async function persistGeneratedImage(
  bytes: Buffer,
  mimeType: string = 'image/png',
): Promise<PersistedAsset> {
  const assetId = randomUUID();
  const ext = MIME_TO_EXT[mimeType] ?? 'png';
  const fileName = `${assetId}.${ext}`;

  const dir = generatedAssetsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, fileName), bytes);

  return {
    assetId,
    assetUrl: `/generated-assets/${fileName}`,
  };
}

/**
 * Keep a generated VIDEO's bytes, the way images have always been kept.
 *
 * Until 2026-09-22 the video path stored the provider's CDN download URL as
 * the asset — a URL the binding itself documents as expiring in 24 hours. A
 * sovereign asset whose bytes live only at a provider is not sovereign
 * (Constitution Art. 5: assets stay inside AZMA OS, independent of providers).
 * The bytes are fetched once, here, and the asset points at our own file.
 */
export async function persistGeneratedVideo(bytes: Buffer, mimeType: string = 'video/mp4'): Promise<PersistedAsset> {
  const assetId = randomUUID();
  const ext = mimeType === 'video/webm' ? 'webm' : 'mp4';
  const fileName = `${assetId}.${ext}`;
  const dir = generatedAssetsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, fileName), bytes);
  return { assetId, assetUrl: `/generated-assets/${fileName}` };
}

/** MP4 (ISO BMFF 'ftyp' at offset 4) or WebM (EBML header). Anything else is not a video we keep. */
export function detectVideoFormat(bytes: Buffer): 'video/mp4' | 'video/webm' | null {
  if (bytes.length < 12) return null;
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return 'video/mp4';
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return 'video/webm';
  return null;
}
