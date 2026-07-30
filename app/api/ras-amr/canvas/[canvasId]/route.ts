/**
 * MINISTRY VI — SOVEREIGN PROJECT RESUME
 * GET /api/ras-amr/canvas/[canvasId] — restore a specific canvas
 *
 * Returns the full SovereignCanvas for the given canvasId, tenant-gated
 * at the SQL level (loadCanvas enforces subscriber_tenant_id match — a
 * Creator cannot load another tenant's canvas by guessing an id, and the
 * route cannot distinguish "not found" from "belongs to another tenant"
 * to prevent id enumeration).
 *
 * The returned canvas is the exact SovereignCanvas that was saved —
 * no reconstruction, no transformation. The client sets it as the
 * Direction Workspace's runtime state, and the Manual Director, Automatic
 * Director, Assembly Runtime, and Rendering Engine all resume from there.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { getDb, loadCanvas } from '../../../../../src/persistent-storage';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ canvasId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to resume your project.' },
      { status: 401 },
    );
  }

  const { canvasId } = await params;
  const db = getDb();
  const canvas = loadCanvas(db, canvasId, session.creatorId);

  if (!canvas) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'Project not found.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: 'succeeded', canvas });
}
