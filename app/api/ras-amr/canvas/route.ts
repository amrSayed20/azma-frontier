/**
 * MINISTRY VI — SOVEREIGN PROJECT RESUME
 * GET  /api/ras-amr/canvas  — list saved canvases for the current Creator
 * POST /api/ras-amr/canvas  — save (or re-save) the current canvas state
 *
 * POST security: `subscriberTenantId` is force-overwritten with the
 * real, server-verified session id — the same security discipline as
 * app/api/sovereign/entry/ras-al-amr/compile/route.ts (Completion Pkg I).
 * A Creator cannot save a canvas for another tenant by sending a forged
 * subscriberTenantId.
 *
 * The full SovereignCanvas is stored as JSON — no secondary state, no
 * reconstruction. Restoration is simply loading this JSON and setting it
 * as the client's runtime state (see GET /api/ras-amr/canvas/[canvasId]).
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';
import { getDb, saveCanvas, listCanvasesForTenant } from '../../../../src/persistent-storage';
import type { SovereignCanvas } from '../../../../src/chambers/ras-al-amr/assembly-contracts';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const REQUIRED_CANVAS_FIELDS = ['canvasId', 'subscriberTenantId', 'canvasType', 'title', 'tracks'] as const;

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to access your saved projects.' },
      { status: 401 },
    );
  }

  const db = getDb();
  const canvases = listCanvasesForTenant(db, session.creatorId);
  return NextResponse.json({ status: 'succeeded', canvases });
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to save your project.' },
      { status: 401 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  if (typeof body !== 'object' || body === null || !('canvas' in body)) {
    return NextResponse.json(
      { status: 'failed', reason: 'missing-canvas', message: 'A canvas object is required.' },
      { status: 400 },
    );
  }

  const rawCanvas = (body as { canvas: unknown }).canvas;
  if (typeof rawCanvas !== 'object' || rawCanvas === null) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-canvas', message: 'canvas must be an object.' },
      { status: 400 },
    );
  }

  const missing = REQUIRED_CANVAS_FIELDS.filter((f) => !(f in rawCanvas));
  if (missing.length > 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-canvas', message: 'canvas is missing required fields.', missing },
      { status: 400 },
    );
  }

  // Force the real, session-verified tenant id — never trust whatever
  // subscriberTenantId the client sent (same discipline as the compile route).
  const canvas: SovereignCanvas = {
    ...(rawCanvas as SovereignCanvas),
    subscriberTenantId: session.creatorId,
  };

  const db = getDb();
  saveCanvas(db, canvas);

  return NextResponse.json({ status: 'succeeded', canvasId: canvas.canvasId });
}
