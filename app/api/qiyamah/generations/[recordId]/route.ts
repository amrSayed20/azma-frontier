import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import {
  getDb,
  getGenerationRecord,
  deleteGenerationRecord,
  deleteVaultAssetByStorageUri,
} from '../../../../../src/persistent-storage';
import path from 'path';
import { unlinkSync } from 'fs';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const UPLOADS_DIR = '/var/www/azma-uploads';

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

  // Delete physical file.
  // Generated images are stored at UPLOADS_DIR/generated-assets/uuid.png.
  // path.join('/var/www/azma-uploads', '/generated-assets/uuid.png')
  //   = '/var/www/azma-uploads/generated-assets/uuid.png' (Node.js joins, not resolves).
  const filePath = path.join(UPLOADS_DIR, record.assetUrl);
  try { unlinkSync(filePath); } catch { /* file may already be absent */ }

  // Remove vault entry (by storage URI + tenant — no orphaned asset)
  deleteVaultAssetByStorageUri(db, record.assetUrl, session.creatorId);

  // Remove durable generation record
  deleteGenerationRecord(db, recordId, session.creatorId);

  return NextResponse.json({ status: 'succeeded', deletedRecordId: recordId });
}
