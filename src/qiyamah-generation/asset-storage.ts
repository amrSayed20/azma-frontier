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
import { enforceSovereignSilence, type SilenceOutcome } from './sovereign-video-silence';

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

export interface PersistedVideo extends PersistedAsset {
  /**
   * The bytes actually written. NOT necessarily the bytes handed in — silence
   * enforcement may have removed an audio stream. Every caller must digest,
   * hash and derive from THESE, or the record would describe a file that does
   * not exist on disk.
   */
  readonly bytes: Buffer;
  readonly silence: SilenceOutcome;
}

/**
 * Keep a generated VIDEO's bytes, the way images have always been kept.
 *
 * Until 2026-09-22 the video path stored the provider's CDN download URL as
 * the asset — a URL the binding itself documents as expiring in 24 hours. A
 * sovereign asset whose bytes live only at a provider is not sovereign
 * (Constitution Art. 5: assets stay inside AZMA OS, independent of providers).
 * The bytes are fetched once, here, and the asset points at our own file.
 *
 * ─── AND THE SILENCE BOUNDARY LIVES HERE ────────────────────────────────────
 *
 *   Every sovereign video in the Empire — generated from an idea, or animated
 *   from an existing asset — becomes a file through THIS function and no other.
 *   That is why the rule is enforced here rather than at the two call sites: a
 *   boundary placed at a chokepoint cannot be forgotten by a path added later,
 *   because a path that does not call this creates no asset at all.
 *
 *   It runs after the provider's bytes have arrived and BEFORE they are written
 *   as the master, so the file that enters the Vault has already passed
 *   `audio streams = 0`. Measured 2026-09-27: the provider returns an audible
 *   track even when asked not to, so the request could never have been enough.
 *
 *   A master that arrives silent is written exactly as it arrived.
 */
export async function persistGeneratedVideo(bytes: Buffer, mimeType: string = 'video/mp4'): Promise<PersistedVideo> {
  const assetId = randomUUID();
  const ext = mimeType === 'video/webm' ? 'webm' : 'mp4';
  const fileName = `${assetId}.${ext}`;

  // Before it is a file, it must be silent. A throw here refuses the deposit
  // through the caller's existing failure handling — never a silent pass.
  const silence = await enforceSovereignSilence(bytes, ext);

  const dir = generatedAssetsDir();
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, fileName), silence.bytes);
  return { assetId, assetUrl: `/generated-assets/${fileName}`, bytes: silence.bytes, silence };
}

/** MP4 (ISO BMFF 'ftyp' at offset 4) or WebM (EBML header). Anything else is not a video we keep. */
export function detectVideoFormat(bytes: Buffer): 'video/mp4' | 'video/webm' | null {
  if (bytes.length < 12) return null;
  if (bytes[4] === 0x66 && bytes[5] === 0x74 && bytes[6] === 0x79 && bytes[7] === 0x70) return 'video/mp4';
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return 'video/webm';
  return null;
}
