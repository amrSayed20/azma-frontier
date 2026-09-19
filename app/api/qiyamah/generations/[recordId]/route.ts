import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import {
  getDb,
  getGenerationRecord,
  deleteGenerationRecord,
  deleteVaultAssetByStorageUri,
  findVaultAssetByStorageUri,
  recordTombstone,
  listPublicLinksForOwner,
} from '../../../../../src/persistent-storage';
import { PublishedProtection, isLive } from '../../../../../src/sovereign-projects/sovereign-project-contracts';
import path from 'path';
import { unlinkSync } from 'fs';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
/**
 * A HARDCODED PRODUCTION PATH, found while hunting and removed.
 *
 * This route carried `'/var/www/azma-uploads'` as a literal. Outside
 * production it pointed at a directory that does not exist, so the unlink
 * silently failed and the file survived a "successful" deletion — and no
 * environment could ever be configured differently.
 *
 * Read at call time, like every other storage path in the repository now is.
 */
function uploadsDir(): string {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), 'public', 'uploads');
}

/**
 * DELETE /api/qiyamah/generations/[recordId]
 *
 * Permanently removes a generation record from the platform:
 *   1. Verifies the Creator owns the record (by creator_id match)
 *   2. Deletes the physical file from disk (tolerates already-missing files)
 *   3. Removes the matching vault_assets entry (no orphans)
 *   4. Removes the generation_records row
 *
 * Returns { status: 'succeeded', deletedRecordId } on success.
 * Returns 404 if the record doesn't exist or belongs to another Creator.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ recordId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to delete generations.' },
      { status: 401 },
    );
  }

  const { recordId } = await context.params;
  if (!recordId) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-input', message: 'recordId is required.' },
      { status: 400 },
    );
  }

  const db = getDb();
  const record = getGenerationRecord(db, recordId, session.creatorId);
  if (!record) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'Generation not found.' },
      { status: 404 },
    );
  }

  // ── THE SECOND DELETION PATH — Constitution Articles 6.3, 6.4 ────────────
  //
  //   Phase C integrated tombstones into DELETE /api/vault/assets/[assetId]
  //   and left this route untouched, so a generated asset could still be
  //   destroyed with no record and no publication check. One door closed, the
  //   other open — a gap in my own work, found by hunting rather than reported.
  //
  //   The order here is the one Phase C established: read → check publication
  //   → record → destroy. Nothing is destroyed before the record exists.
  const asset = findVaultAssetByStorageUri(db, record.assetUrl);
  if (asset && asset.subscriberTenantId === session.creatorId) {
    // Article 6.4 — a live published work protects its asset.
    const protectingLink = listPublicLinksForOwner(db, session.creatorId)
      .find((link) => link.finalWorkAssetId === asset.assetId && isLive(link));

    if (protectingLink) {
      recordTombstone(db, {
        assetId: asset.assetId,
        ownerId: asset.subscriberTenantId,
        assetFamily: asset.assetFamily,
        capabilityTarget: asset.capabilityTarget,
        parentAssetId: asset.parentAssetId ?? null,
        rootAssetId: asset.rootAssetId ?? null,
        projectId: asset.projectId ?? null,
        creationChamber: asset.creationChamber ?? null,
        deletedBy: session.creatorId,
        deletionReason: 'refused: referenced by a live published work',
        publishedProtection: PublishedProtection.PROTECTED_BY_PUBLICATION,
        metadataSnapshot: asset.metadata,
      });
      return NextResponse.json(
        {
          status: 'failed',
          reason: 'protected-by-publication',
          message: 'هذا الأصل منشورٌ الآن. اسحب النشر أوّلاً ثم احذفه.',
        },
        { status: 409 },
      );
    }

    try {
      recordTombstone(db, {
        assetId: asset.assetId,
        ownerId: asset.subscriberTenantId,
        assetFamily: asset.assetFamily,
        capabilityTarget: asset.capabilityTarget,
        parentAssetId: asset.parentAssetId ?? null,
        rootAssetId: asset.rootAssetId ?? null,
        projectId: asset.projectId ?? null,
        creationChamber: asset.creationChamber ?? null,
        deletedBy: session.creatorId,
        publishedProtection: PublishedProtection.NOT_PROTECTED,
        metadataSnapshot: asset.metadata,
      });
    } catch (err) {
      // Nothing destroyed. Article 12: no success is reported without a record.
      console.error('[GenerationDelete] tombstone failed; nothing deleted:', err);
      return NextResponse.json(
        { status: 'failed', reason: 'tombstone-failed', message: 'تعذّر تسجيل الحذف. لم يُحذف شيء.' },
        { status: 500 },
      );
    }
  }

  // Delete physical file.
  // Generated images are stored at UPLOADS_DIR/generated-assets/uuid.png.
  // path.join('/var/www/azma-uploads', '/generated-assets/uuid.png')
  //   = '/var/www/azma-uploads/generated-assets/uuid.png' (Node.js joins, not resolves).
  const filePath = path.join(uploadsDir(), record.assetUrl);
  try { unlinkSync(filePath); } catch { /* file may already be absent */ }

  // Remove vault entry (by storage URI + tenant — no orphaned asset)
  deleteVaultAssetByStorageUri(db, record.assetUrl, session.creatorId);

  // Remove durable generation record
  deleteGenerationRecord(db, recordId, session.creatorId);

  return NextResponse.json({ status: 'succeeded', deletedRecordId: recordId });
}
