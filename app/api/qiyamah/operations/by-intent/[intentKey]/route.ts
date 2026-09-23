import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { findOperationByIntentKey, observeOperation } from '@/src/qiyamah-generation/video-operation-lifecycle';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * GET /api/qiyamah/operations/by-intent/[intentKey] — «did my request ever start?»
 *
 * ─── THE CASE THIS ANSWERS ───────────────────────────────────────────────────
 *
 *   The acceptance itself can be lost: the edge may close the connection
 *   before the 202 carrying the operation id reaches the browser, exactly as
 *   it closed operation ce90a828's response at ~125 s. The Creator then holds
 *   only the key they minted before asking.
 *
 *   Without this, their only move is to press generate again — and a second
 *   press is a second provider charge for a production that may already be
 *   running. With it, the key finds the operation that exists.
 *
 *   The lookup is owner-scoped in SQL: a key belonging to another Creator
 *   returns nothing, so a guessed key can never reveal or attach to someone
 *   else's production. It starts nothing and costs nothing.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ intentKey: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  const { intentKey } = await context.params;
  const operationId = findOperationByIntentKey(session.creatorId, decodeURIComponent(intentKey ?? ''));
  if (!operationId) {
    // Truthfully: this Creator has no production for that intent. Nothing was
    // started, so pressing generate again is safe.
    return NextResponse.json({ status: 'succeeded', operation: null });
  }

  const observed = await observeOperation(operationId, session.creatorId);
  if (!observed) {
    return NextResponse.json({ status: 'succeeded', operation: null });
  }

  return NextResponse.json({
    status: 'succeeded',
    operation: {
      operationId: observed.operationId,
      state: observed.state,
      isTerminal: observed.isTerminal,
      producing: !observed.isTerminal,
      assetUrl: observed.assetUrl ?? null,
    },
  });
}
