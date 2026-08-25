import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { getDb, deleteVaultAssetById } from '../../../../../src/persistent-storage';
import path from 'path';
import { unlinkSync } from 'fs';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

// Uploaded files are stored directly in UPLOADS_DIR (no subdirectory),
// served at /uploads/filename.
const UPLOADS_DIR = process.env.UPLOADS_DIR ?? path.join(process.cwd(), 'public', 'uploads');

/**
 * DELETE /api/vault/assets/[assetId]
 *
 * Permanently removes a vault asset owned by the authenticated Creator:
 *   1. Verifies the Creator owns the asset (subscriberTenantId match).
 *   2. Deletes the physical file from disk (tolerates already-missing files).
 *   3. Removes the vault_assets record.
 *
 * This covers Creator-uploaded assets. Generated assets are deleted via
 * DELETE /api/qiyamah/generations/[recordId] which also cleans the
 * generation_records table. Both routes use the same ownership model.
 *
 * Returns { status: 'succeeded', deletedAssetId } on success.
 * Returns 404 if not found or owned by another Creator.
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

  // deleteVaultAssetById verifies ownership and returns the deleted asset
  // (so we have secureStorageUri for file deletion), or null if not found/not owned.
  const deleted = deleteVaultAssetById(db, assetId, session.creatorId);
  if (!deleted) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'Asset not found.' },
      { status: 404 },
    );
  }

  // Delete the physical file.
  // Uploaded files are stored at UPLOADS_DIR/basename(secureStorageUri).
  // secureStorageUri = /uploads/uuid.ext → basename = uuid.ext → UPLOADS_DIR/uuid.ext.
  const filename = path.basename(deleted.secureStorageUri);
  const filePath = path.join(UPLOADS_DIR, filename);
  try { unlinkSync(filePath); } catch { /* file may already be absent */ }

  return NextResponse.json({ status: 'succeeded', deletedAssetId: assetId });
}
