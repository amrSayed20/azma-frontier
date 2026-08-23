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
const GENERATED_ASSETS_DIR = process.env['UPLOADS_DIR']
  ? join(process.env['UPLOADS_DIR'], 'generated-assets')
  : join(process.cwd(), 'public', 'generated-assets');

export interface PersistedAsset {
  readonly assetId: string;
  readonly assetUrl: string;
}

export async function persistGeneratedImage(bytes: Buffer): Promise<PersistedAsset> {
  const assetId = randomUUID();
  const fileName = `${assetId}.png`;

  await mkdir(GENERATED_ASSETS_DIR, { recursive: true });
  await writeFile(join(GENERATED_ASSETS_DIR, fileName), bytes);

  return {
    assetId,
    assetUrl: `/generated-assets/${fileName}`,
  };
}
