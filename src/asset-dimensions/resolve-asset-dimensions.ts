/**
 * AZMA OS — THE ONE DOOR TO «WHAT SHAPE IS THIS ASSET?»
 *
 * Every asset deposited from 2026-09-29 onward records its pixel size at the
 * deposit boundary. The assets that already existed do not, and there is no
 * honest way to give them one without reading their bytes.
 *
 * ─── WHY THERE IS NO BACKFILL SCRIPT ────────────────────────────────────────
 *
 *   A sweep over every row would have to run as a privileged one-off against
 *   the production database, and it would still leave the next legacy asset
 *   found by some path nobody swept. So the measurement happens where the
 *   question is actually asked: مكمن الغاية asks the shape of the few assets a
 *   Creator selected for a platform, this resolves them, and what it learns is
 *   written back so it is never measured twice.
 *
 *   The result: the Vault heals itself one real question at a time, no
 *   privileged runner exists to be forgotten or misfired, and an asset nobody
 *   ever publishes is never read off disk at all.
 *
 * ─── WHAT NULL MEANS HERE ───────────────────────────────────────────────────
 *
 *   «لا نعرف مقاس هذا الأصل» — the file is gone, or its format is one this
 *   Empire was never taught. It is NOT a shape, and a caller must never hand
 *   it on as one: `platform-adapter.ts`'s `getOrientation` reads an
 *   unparseable ratio as 'landscape', so passing a guess downstream would make
 *   the Chamber tell a Creator their portrait film fits YouTube.
 */

import type { DatabaseSync } from 'node:sqlite';
import type { VaultAsset } from '../vault/sovereign-vault-types';
import { readAssetHead } from '../vault/asset-bytes';
import { recordAssetDimensions } from '../persistent-storage';
import { readDimensions, type PixelDimensions } from './read-dimensions';
import { toAspectRatio } from './aspect-ratio';

/** What the Chamber learned about one asset's shape, and how. */
export interface AssetShape {
  readonly assetId: string;
  readonly dimensions: PixelDimensions | null;
  /** The word `platform-adapter.ts` compares, or null when unknown. */
  readonly aspectRatio: string | null;
  /**
   * `recorded` — the row already knew.
   * `measured` — read from the file just now, and written back.
   * `unknown`  — the bytes could not say, and nothing was invented.
   */
  readonly source: 'recorded' | 'measured' | 'unknown';
}

/**
 * The asset's shape: from its row when known, from its bytes when not.
 *
 * A measurement taken here is persisted before returning, so the next caller
 * reads it from the row. A failure persists nothing.
 */
export async function resolveAssetShape(
  db: DatabaseSync,
  asset: VaultAsset,
): Promise<AssetShape> {
  const w = asset.pixelWidth ?? null;
  const h = asset.pixelHeight ?? null;
  if (w !== null && h !== null && w > 0 && h > 0) {
    const dimensions = { width: w, height: h };
    return { assetId: asset.assetId, dimensions, aspectRatio: toAspectRatio(dimensions), source: 'recorded' };
  }

  let measured: PixelDimensions | null = null;
  try {
    const head = await readAssetHead(asset.secureStorageUri);
    measured = head ? readDimensions(head) : null;
  } catch {
    measured = null;
  }

  if (!measured) {
    return { assetId: asset.assetId, dimensions: null, aspectRatio: null, source: 'unknown' };
  }

  // Writing back is what stops this being measured on every visit. A write
  // that fails costs nothing but a repeat: the answer returned is the same.
  try {
    recordAssetDimensions(db, asset.assetId, measured.width, measured.height);
  } catch {
    /* the row keeps saying «لا نعرف»; the Creator still gets a true answer now */
  }

  return {
    assetId: asset.assetId,
    dimensions: measured,
    aspectRatio: toAspectRatio(measured),
    source: 'measured',
  };
}

/** The same question for several assets, resolved one by one. */
export async function resolveAssetShapes(
  db: DatabaseSync,
  assets: readonly VaultAsset[],
): Promise<readonly AssetShape[]> {
  const out: AssetShape[] = [];
  for (const asset of assets) out.push(await resolveAssetShape(db, asset));
  return out;
}
