import { NextRequest, NextResponse } from 'next/server';
import { ingestCirculatedSignal } from '@/src/sovereign-circulation';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

/**
 * Public API Surface for the Constitutional Circulation's cross-runtime
 * transport (Construction Phase III). Receives a signal draft from a
 * browser-side circulateFromClient() call and ingests it into this
 * server process's Perception Bus, closing the browser→server gap
 * disclosed in the Integration Package "The First Constitutional
 * Signals." Performs only structural validation of the request shape —
 * the same origin-legitimacy check every other emission path already
 * uses (assertLegitimateSignalOrigin, called inside emitSignal) governs
 * whether the signal is actually accepted.
 *
 * This route interprets nothing about the signal's content — it is
 * transport, not a business endpoint, per Phase III's Constitutional
 * Rules ("the Circulation shall never interpret").
 *
 * ─── A SESSION IS REQUIRED, AND WAS NOT ─────────────────────────────────────
 *
 *   This route accepted a body from anyone and fed it into the Perception Bus,
 *   whose signal log had no ceiling. Found by hunting: an unauthenticated
 *   visitor could push entries into the live process until it exhausted memory
 *   and PM2 restarted it — an unauthenticated denial of service.
 *
 *   Transport is not the same as public. Every browser that legitimately calls
 *   circulateFromClient() is a signed-in Creator, so requiring a session costs
 *   no real caller anything and closes the path to everyone else. The signal
 *   log is bounded as well — see perception-bus.ts — because one layer is a
 *   hope and two are a guard.
 */
const REQUIRED_FIELDS = ['origin', 'signalType', 'reportingAuthority', 'purpose'] as const;

const SESSION_COOKIE = 'azma_session';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId || !verifySession(sessionId)) {
    // No detail: a transport endpoint tells an anonymous caller nothing about
    // itself beyond the refusal.
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();

    if (typeof body !== 'object' || body === null) {
      return NextResponse.json({ error: 'Request body must be a JSON object' }, { status: 400 });
    }

    const missing = REQUIRED_FIELDS.filter((field) => !(field in body));
    if (missing.length > 0) {
      return NextResponse.json({ error: 'Missing required field(s)', missing }, { status: 400 });
    }

    const result = ingestCirculatedSignal(
      body as Parameters<typeof ingestCirculatedSignal>[0],
    );

    if (!result.circulated) {
      return NextResponse.json({ error: 'Circulation ingestion failed', reason: result.reason }, { status: 400 });
    }

    return NextResponse.json({ circulated: true, signalId: result.signal?.signalId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown circulation ingestion error';
    return NextResponse.json({ error: 'Constitutional Circulation ingestion failed', message }, { status: 500 });
  }
}
