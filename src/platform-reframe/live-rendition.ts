import type { DatabaseSync } from 'node:sqlite';
import type { VaultAsset } from '../vault/sovereign-vault-types';
import { getVaultAsset } from '../persistent-storage';

/**
 * AZMA OS — هل يَملِك هذا المبدعُ نسخةً حيّةً لهذه المنصّة؟
 *
 * ─── THE QUESTION THIS ASKS, AND THE ONE IT REFUSES TO ASK ──────────────────
 *
 *   It asks «do you HAVE the file?». It does not ask «did you ask before?».
 *
 *   That distinction is the whole policy. A Creator whose answer was lost to
 *   a dead socket and a Creator who deliberately pressed again both already
 *   own the rendition — so both are answered with it, and neither is charged.
 *   A Creator whose rendition has expired owns nothing, so a new charge is
 *   due. One question settles all three cases, and no key has to outlive the
 *   thing it names.
 *
 * ─── WHY `expiresAtMs > now` AND NOT «the row exists» ───────────────────────
 *
 *   The sweeper runs on its own schedule, so an expired rendition can still
 *   be sitting in the table. Treating a row's mere presence as ownership
 *   would make the MOMENT THE SWEEPER LAST RAN decide whether a Creator pays
 *   — the clock deciding money by the back door, which is the one thing the
 *   economy's own rules forbid. Validity is a reading of the stamp the
 *   rendition was born with, never of the sweeper's timing.
 *
 * ─── AND EVERY READ IS SCOPED TO THE ASKING CREATOR ─────────────────────────
 *
 *   Both the master and the rendition are matched on `subscriber_tenant_id`.
 *   A Creator cannot discover, reuse, or avoid a charge by naming an asset
 *   that is not theirs: the lookup simply finds nothing, and the act is
 *   priced as new work on an asset they will then fail to own anyway.
 */

export interface LiveRendition {
  readonly assetId: string;
  readonly secureStorageUri: string;
  readonly platform: string;
  readonly expiresAtMs: number;
}

/**
 * The master this Creator owns, or null.
 *
 * Separated so a caller can tell «not your asset» from «no rendition yet»,
 * which are two different answers to a Creator.
 */
export function ownedMaster(
  db: DatabaseSync,
  assetId: string,
  creatorId: string,
): VaultAsset | null {
  const asset = getVaultAsset(db, assetId);
  if (!asset || asset.subscriberTenantId !== creatorId) return null;
  return asset;
}

/**
 * The live, unexpired rendition of `sourceAssetId` for `platform`, or null.
 *
 * `now` is a parameter so a test can stand at any instant without touching a
 * clock, and so the one comparison that decides money is always explicit.
 */
export function liveRenditionFor(params: {
  readonly db: DatabaseSync;
  readonly creatorId: string;
  readonly sourceAssetId: string;
  readonly platform: string;
  readonly now?: number;
}): LiveRendition | null {
  const { db, creatorId, sourceAssetId, platform } = params;
  const now = params.now ?? Date.now();

  const rows = db
    .prepare(
      `SELECT asset_id, secure_storage_uri, metadata, expires_at_ms
         FROM vault_assets
        WHERE subscriber_tenant_id = ?
          AND parent_asset_id = ?
          AND expires_at_ms IS NOT NULL
          AND expires_at_ms > ?
        ORDER BY created_at DESC, rowid DESC`,
    )
    .all(creatorId, sourceAssetId, now) as {
      asset_id: string;
      secure_storage_uri: string;
      metadata: string | null;
      expires_at_ms: number;
    }[];

  for (const row of rows) {
    // The platform lives in the rendition's own metadata, written when it was
    // deposited. Read defensively: a row whose metadata will not parse is not
    // a rendition this function may claim as a Creator's property.
    let declared: unknown;
    try {
      declared = row.metadata === null ? null : (JSON.parse(row.metadata) as { reframedForPlatform?: unknown })
        .reframedForPlatform;
    } catch {
      continue;
    }
    if (declared !== platform) continue;

    return {
      assetId: row.asset_id,
      secureStorageUri: row.secure_storage_uri,
      platform,
      expiresAtMs: row.expires_at_ms,
    };
  }

  return null;
}
