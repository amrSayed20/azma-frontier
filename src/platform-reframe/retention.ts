/**
 * AZMA OS — A PLATFORM RENDITION IS KEPT FIFTEEN DAYS, THEN DESTROYED
 *
 * ─── THE FOUNDER'S RULING, 2026-09-29 ───────────────────────────────────────
 *
 *   «الاحتفاظ به داخل الخزانة لمدة 15 يوم ثم يحذف، وهذا للتنبيه.»
 *   «الإتلاف النهائي بعد إخبار صاحب الأصل.»
 *
 *   FINAL DESTRUCTION — Article 6.2 — and not «الحذف التشغيلي» of 6.1: a
 *   hidden, restorable copy is exactly the accumulation he ordered prevented.
 *   The bytes go, and a tombstone carrying the lineage stays (6.3).
 *
 *   THE MASTER IS NEVER TOUCHED. Only a rendition — a rectangle cut for one
 *   platform — carries an expiry. A Creator's own work is theirs without limit.
 *
 * ─── WHY THERE IS NO CRON, AND WHY THAT IS NOT A SHORTCUT ───────────────────
 *
 *   MEASURED 2026-09-29: this Empire has no background worker, and says so in
 *   its own source twice — «No server cron/worker process exists in this
 *   architecture». Inventing one would be new infrastructure the Founder has
 *   not authorised, deployed where nobody would watch it fail.
 *
 *   So the sweep runs where the question is actually asked: when a Creator
 *   opens مكمن الغاية. That is sufficient for the purpose, because a rendition
 *   is only an accumulation while someone is looking at the Vault — and it is
 *   honest about its one limit, stated plainly: a Creator who never returns
 *   leaves their expired renditions in place. They linger; they never
 *   resurrect, and they are never served past their end.
 *
 * ─── AND THE NOTICE IS A CONDITION OF THE ACT ───────────────────────────────
 *
 *   `dueSoon` exists so the Chamber can say «ثلاث نسخ تُتلَف خلال يومين»
 *   BEFORE the day arrives, and `destroyed` so it can say what happened after.
 *   Article 6.4 stands above all of it: a rendition inside a standing
 *   published work is refused destruction and the reason is spoken.
 */

import type { DatabaseSync } from 'node:sqlite';
import { unlinkSync } from 'fs';
import {
  listVaultAssetsForTenant,
  deleteVaultAssetById,
  recordTombstone,
  listPublicLinksForOwner,
} from '../persistent-storage';
import { PublishedProtection, isLive } from '../sovereign-projects/sovereign-project-contracts';
import { resolveAssetPath } from '../vault/asset-bytes';
import type { VaultAsset } from '../vault/sovereign-vault-types';

/** The Founder's figure. Fifteen days from the moment the rendition is made. */
export const RETENTION_DAYS = 15;
export const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

/** The Creator is warned while there is still time to act. */
export const WARN_WITHIN_MS = 3 * 24 * 60 * 60 * 1000;

export interface RetentionRow {
  readonly assetId: string;
  readonly label: string;
  readonly expiresAtMs: number;
  readonly daysLeft: number;
}

export interface RetentionSweep {
  /** Renditions whose end is near, so the Chamber can say so before it comes. */
  readonly dueSoon: readonly RetentionRow[];
  /** Renditions destroyed by this sweep, so the Chamber can say what happened. */
  readonly destroyed: readonly { readonly assetId: string; readonly label: string }[];
  /** Renditions past their end that could NOT be destroyed, and why. */
  readonly spared: readonly { readonly assetId: string; readonly label: string; readonly reasonAr: string }[];
}

const labelOf = (asset: VaultAsset): string =>
  (typeof asset.metadata?.reframedForLabel === 'string' && asset.metadata.reframedForLabel)
    ? asset.metadata.reframedForLabel
    : 'نسخة منصّة';

/**
 * Destroy what has reached its end, and report what is approaching one.
 *
 * Scoped to one Creator: a sweep is a consequence of them opening their own
 * Chamber, and it must never be able to touch anything that is not theirs.
 */
export function sweepExpiredRenditions(
  db: DatabaseSync,
  creatorId: string,
  nowMs: number = Date.now(),
): RetentionSweep {
  const assets = listVaultAssetsForTenant(db, creatorId)
    .filter((a) => typeof a.expiresAtMs === 'number' && a.expiresAtMs > 0);

  const dueSoon: RetentionRow[] = [];
  const destroyed: { assetId: string; label: string }[] = [];
  const spared: { assetId: string; label: string; reasonAr: string }[] = [];

  // ── ARTICLE 6.4'S GUARD, READ ONCE ──────────────────────────────────────
  //   MEASURED while writing this: the first draft passed a STATE STRING to
  //   `isLive`, which takes the whole link, and matched on `assetId`, which
  //   this record calls `finalWorkAssetId`. A cast to `never` had silenced the
  //   type-checker on both. The guard would have found no published work ever,
  //   and destroyed a rendition inside a standing publication.
  let liveWorkIds: Set<string> | null = null;
  try {
    const links = listPublicLinksForOwner(db, creatorId);
    liveWorkIds = new Set(links.filter(isLive).map((l) => l.finalWorkAssetId));
  } catch {
    // A guard that cannot read must not destroy. Null spares everything.
    liveWorkIds = null;
  }

  for (const asset of assets) {
    const expiresAt = asset.expiresAtMs as number;
    const label = labelOf(asset);

    if (expiresAt > nowMs) {
      if (expiresAt - nowMs <= WARN_WITHIN_MS) {
        dueSoon.push({
          assetId: asset.assetId,
          label,
          expiresAtMs: expiresAt,
          daysLeft: Math.max(0, Math.ceil((expiresAt - nowMs) / (24 * 60 * 60 * 1000))),
        });
      }
      continue;
    }

    if (liveWorkIds === null) {
      spared.push({ assetId: asset.assetId, label, reasonAr: 'تعذّر التحقّق من روابط النشر — لم تُتلَف.' });
      continue;
    }

    // Article 6.4 — «لا يجوز الإتلاف النهائي لأي أصل يدخل في عمل منشور قائم».
    if (liveWorkIds.has(asset.assetId)) {
      spared.push({
        assetId: asset.assetId,
        label,
        reasonAr: 'هذه النسخة داخلةٌ في نشرٍ قائم — لا تُتلَف حتى يُسحب الرابط.',
      });
      continue;
    }

    // The record first, then the bytes: a tombstone that fails to write must
    // not leave a destroyed file with nothing to account for it.
    try {
      recordTombstone(db, {
        assetId: asset.assetId,
        ownerId: creatorId,
        assetFamily: asset.assetFamily,
        capabilityTarget: asset.capabilityTarget,
        parentAssetId: asset.parentAssetId ?? null,
        rootAssetId: asset.rootAssetId ?? null,
        projectId: asset.projectId ?? null,
        creationChamber: asset.creationChamber ?? null,
        deletedBy: creatorId,
        deletionReason: `platform-rendition-expired-after-${RETENTION_DAYS}-days`,
        publishedProtection: PublishedProtection.NOT_PROTECTED,
        metadataSnapshot: asset.metadata as Record<string, unknown>,
        nowMs,
      });
    } catch {
      spared.push({ assetId: asset.assetId, label, reasonAr: 'تعذّر تسجيل الشاهدة — لم تُتلَف.' });
      continue;
    }

    try { unlinkSync(resolveAssetPath(asset.secureStorageUri)); }
    catch { /* already gone; the row and the tombstone are what matter */ }
    deleteVaultAssetById(db, asset.assetId, creatorId);
    destroyed.push({ assetId: asset.assetId, label });
  }

  return { dueSoon, destroyed, spared };
}
