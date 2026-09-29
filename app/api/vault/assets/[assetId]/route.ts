import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import {
  getDb,
  getVaultAsset,
  deleteVaultAssetById,
  recordTombstone,
  findTombstoneByAssetId,
  listPublicLinksForOwner,
} from '../../../../../src/persistent-storage';
import { PublishedProtection } from '../../../../../src/sovereign-projects/sovereign-project-contracts';
import { isLive } from '../../../../../src/sovereign-projects/sovereign-project-contracts';
import path from 'path';
import { unlinkSync } from 'fs';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

// Uploaded files are stored directly in UPLOADS_DIR (no subdirectory),
// served at /uploads/filename.
/**
 * Read at CALL time, never frozen into a module constant.
 *
 * An environment variable captured at import time is a latent bug by
 * construction: whatever sets it afterwards is ignored, and the module keeps
 * the value it happened to see first. It cost eight failing tests in the image
 * edit route, after the same mistake had already been found and fixed in db.ts.
 * Four places in this repository held the pattern; this is one of them.
 */
function uploadsDir(): string {
  return process.env.UPLOADS_DIR ?? path.join(process.cwd(), 'public', 'uploads');
}

/**
 * GET /api/vault/assets/[assetId] — one asset, asked for by name.
 *
 * ─── A LIST FETCHED TO ANSWER A QUESTION ABOUT ONE ROW ──────────────────────
 *
 *   FOUNDER, 2026-09-29: «امنع تكدس الاصول والغايات بصفه عامه داخل الحجره».
 *
 *   MEASURED that day: مكمن الغاية downloaded the Creator's ENTIRE vault — 128
 *   assets, 131KB — on every open, for one reason: to find a single asset by
 *   its id and read the creation demand out of its metadata. The resource had
 *   a route already; the route had DELETE and not its most basic verb, so the
 *   only way to read one asset was to receive all of them.
 *
 *   That cost grows with the Creator. A Creator with a thousand assets would
 *   have paid a megabyte to read one string.
 *
 *   Ownership is checked here and the answer is 404 either way, exactly as
 *   DELETE below does it, so "not yours" and "does not exist" stay
 *   indistinguishable from outside.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ assetId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  const { assetId } = await context.params;
  const asset = getVaultAsset(getDb(), assetId);

  if (!asset || asset.subscriberTenantId !== session.creatorId) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'لا يوجد أصل بهذا المعرّف في خزانتك.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: 'succeeded', asset });
}

/**
 * DELETE /api/vault/assets/[assetId]
 *
 * ─── PHASE C: DELETION NOW LEAVES A RECORD ──────────────────────────────────
 *
 *   This route used to delete the row and unlink the file in the same request,
 *   leaving nothing behind. Constitution Article 6.3 requires a tombstone, and
 *   Article 5.4 requires that no derived asset be orphaned — which is exactly
 *   what happened the moment an asset with children was destroyed.
 *
 *   The order below is deliberate and is the whole safety of the operation:
 *
 *     1. Read the asset (ownership enforced) — before anything is destroyed.
 *     2. Refuse if a live published work depends on it (Article 6.4).
 *     3. Record the tombstone, carrying the lineage.
 *     4. Only then delete the row and the file.
 *
 *   If step 3 fails, nothing is destroyed and the request reports failure.
 *   Article 12 of the directive: «Do not report deletion success if the
 *   tombstone was not recorded».
 *
 *   The tombstone carries NO storage path — `recordTombstone` strips one even
 *   if a caller passes it, and this route does not pass one.
 *
 * Returns { status: 'succeeded', deletedAssetId } on success.
 * Returns 404 if not found or owned by another Creator.
 * Returns 409 if a live published work protects it.
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ assetId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to delete assets.' },
      { status: 401 },
    );
  }

  const { assetId } = await context.params;
  if (!assetId) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-input', message: 'assetId is required.' },
      { status: 400 },
    );
  }

  const db = getDb();

  // 1 ── Read before destroying. The tombstone needs the lineage, and the
  //      lineage is only readable while the row still exists.
  const asset = getVaultAsset(db, assetId);
  if (!asset || asset.subscriberTenantId !== session.creatorId) {
    // Absent and not-yours answer alike, so ownership cannot be probed.
    // A repeated delete of an already-deleted asset lands here too, which is
    // the truthful answer: it is not there.
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'Asset not found.' },
      { status: 404 },
    );
  }

  // 2 ── Article 6.4: an asset inside a live published work may not be
  //      destroyed, and the refusal is explained rather than silent.
  const protectingLink = listPublicLinksForOwner(db, session.creatorId)
    .find((link) => link.finalWorkAssetId === assetId && isLive(link));

  if (protectingLink) {
    // Recorded so an audit can tell an ordinary deletion from one that was
    // argued with — and nothing is destroyed.
    recordTombstone(db, {
      assetId,
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

  // 3 ── The record must exist before the thing it records is gone.
  try {
    recordTombstone(db, {
      assetId,
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
    // Nothing has been destroyed at this point. Refusing here keeps the asset
    // whole rather than destroying it without a record.
    console.error('[VaultDelete] tombstone failed; asset NOT deleted:', err);
    return NextResponse.json(
      { status: 'failed', reason: 'tombstone-failed', message: 'تعذّر تسجيل الحذف. لم يُحذف شيء.' },
      { status: 500 },
    );
  }

  // 4 ── Now, and only now, destroy.
  const deleted = deleteVaultAssetById(db, assetId, session.creatorId);
  if (!deleted) {
    // The row vanished between the read and the delete. The tombstone stands,
    // which is correct: the asset is gone either way.
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'Asset not found.' },
      { status: 404 },
    );
  }

  // Delete the physical file.
  // Uploaded files are stored at UPLOADS_DIR/basename(secureStorageUri).
  // secureStorageUri = /uploads/uuid.ext → basename = uuid.ext → UPLOADS_DIR/uuid.ext.
  const filename = path.basename(deleted.secureStorageUri);
  const filePath = path.join(uploadsDir(), filename);
  try { unlinkSync(filePath); } catch { /* file may already be absent */ }

  // Proof, not assumption: the response says a tombstone exists because one was
  // read back, not because the write did not throw.
  const tombstone = findTombstoneByAssetId(db, assetId, session.creatorId);
  return NextResponse.json({
    status: 'succeeded',
    deletedAssetId: assetId,
    tombstoneRecorded: tombstone !== null,
  });
}
