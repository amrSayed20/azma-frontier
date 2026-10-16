/**
 * GET /api/ras-amr/render/[operationId] — state of one Ras Al-Amr render.
 *
 * processing → the MP4 is still being encoded
 * succeeded  → the MP4 is complete and deposited in the Sovereign Vault;
 *              fileUrl plays it, downloadUrl saves it
 * failed     → a plain-language reason the Creator can act on
 *
 * Safe to poll: resolution into the Vault happens once, then the ledger's
 * DEPOSITED state answers directly. Tenant-checked against the ledger.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { RenderAccessError, getRasAlAmrRenderStatus } from '@/src/sovereign-entry/ras-al-amr-render';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ operationId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized', message: 'Sign in to check this render.' }, { status: 401 });
  }
  const { operationId } = await params;
  try {
    return NextResponse.json(await getRasAlAmrRenderStatus(operationId, session.creatorId));
  } catch (error) {
    if (error instanceof RenderAccessError) {
      return NextResponse.json(
        { status: 'failed', reason: error.kind, message: error.message },
        { status: error.kind === 'forbidden' ? 403 : 404 },
      );
    }
    return NextResponse.json({ status: 'failed', reason: 'render-error', message: 'Render status is unavailable.' }, { status: 500 });
  }
}
