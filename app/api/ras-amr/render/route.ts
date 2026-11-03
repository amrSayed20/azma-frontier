/**
 * POST /api/ras-amr/render — start a real MP4 render of the Creator's canvas
 * GET  /api/ras-amr/render — the Creator's recent renders (newest first)
 *
 * RAS AL AMR EXECUTION DIRECTIVE — PHASE 4: the MP4 is produced inside Ras
 * Al-Amr's own journey. The request returns as soon as the render job is
 * accepted (FFmpeg runs as a child process); the chamber then polls
 * GET /api/ras-amr/render/[operationId]. See src/sovereign-entry/ras-al-amr-render.ts.
 *
 * The tenant always comes from the verified session cookie, never the body.
 *
 * RULED 2026-11-02, decision 2: the final export costs 100 units per second
 * of the finished film. The hold is taken here, on the Empire's own
 * computation of the timeline's length; the settlement follows the measured
 * file and happens at the status poll. See src/sovereign-entry/ras-al-amr-render.ts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import {
  RenderPaymentError,
  RenderRequestError,
  listRasAlAmrRenders,
  startRasAlAmrRender,
} from '@/src/sovereign-entry/ras-al-amr-render';
import { OPERATION_KEY_HEADER, readClientOperationKey } from '@/src/economy/paid-operation-attempts';
import type { SovereignCanvas } from '@/src/chambers/ras-al-amr/assembly-contracts';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const REQUIRED_CANVAS_FIELDS = ['canvasId', 'subscriberTenantId', 'canvasType', 'title', 'tracks'] as const;

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized', message: 'Sign in to render a production.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'failed', reason: 'invalid-request', message: 'Request body must be valid JSON.' }, { status: 400 });
  }
  const canvas = (body as { canvas?: unknown } | null)?.canvas;
  if (typeof canvas !== 'object' || canvas === null) {
    return NextResponse.json({ status: 'failed', reason: 'invalid-request', message: 'canvas must be an object.' }, { status: 400 });
  }
  const missing = REQUIRED_CANVAS_FIELDS.filter((field) => !(field in canvas));
  if (missing.length > 0) {
    return NextResponse.json({ status: 'failed', reason: 'invalid-request', message: 'canvas is missing required fields.', missing }, { status: 400 });
  }

  try {
    const { operationId, compiled, charge } = await startRasAlAmrRender(
      canvas as SovereignCanvas,
      session.creatorId,
      {
        // The role decides entitlement, and it is read from the verified
        // session — never from anything the browser chose to send.
        creatorRole: session.role,
        clientOperationKey: readClientOperationKey(request.headers.get(OPERATION_KEY_HEADER)),
      },
    );
    return NextResponse.json(
      {
        status: 'accepted',
        operationId,
        compilationId: compiled.compilationId,
        totalNodes: compiled.metadata.totalNodes,
        estimatedDurationSeconds: compiled.metadata.estimatedDurationSeconds ?? null,
        // The FILM's own length — the furthest end of the pictures. This is
        // what the charge follows, so the chamber is told it rather than
        // inferring it from the timeline figure above.
        filmDurationSeconds: compiled.metadata.filmDurationSeconds ?? null,
        // What this export cost, stated with the acceptance rather than left
        // for the Creator to work out from a changed balance.
        charge: charge ?? null,
        // The same sealed assembly the chamber hands to Makman Al-Ghayah for
        // distribution, so the published work is exactly what was rendered.
        compiledGraph: compiled,
      },
      { status: 202 },
    );
  } catch (error) {
    if (error instanceof RenderPaymentError) {
      return NextResponse.json(
        {
          status: 'failed',
          reason: error.reason,
          message: error.message,
          ...(error.requiredUnits !== undefined ? { requiredUnits: error.requiredUnits } : {}),
          ...(error.availableUnits !== undefined ? { availableUnits: error.availableUnits } : {}),
        },
        { status: error.httpStatus },
      );
    }
    if (error instanceof RenderRequestError) {
      const status = error.reason === 'forbidden' ? 403 : error.reason === 'renderer-unavailable' ? 503 : 422;
      return NextResponse.json({ status: 'failed', reason: error.reason, message: error.message }, { status });
    }
    return NextResponse.json({ status: 'failed', reason: 'render-error', message: 'The render could not start.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized', message: 'Sign in to see your renders.' }, { status: 401 });
  }
  const projectId = request.nextUrl.searchParams.get('projectId') ?? undefined;
  return NextResponse.json({ status: 'succeeded', renders: listRasAlAmrRenders(session.creatorId, 5, projectId) });
}
