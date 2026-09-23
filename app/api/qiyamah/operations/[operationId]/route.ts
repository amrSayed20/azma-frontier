import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { observeOperation } from '@/src/qiyamah-generation/video-operation-lifecycle';
import { OperationState } from '@/src/orchestrator/fleet-materialization/ledger/operation-ledger-types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * GET /api/qiyamah/operations/[operationId] — what actually happened to a production.
 *
 * ─── WHY THIS EXISTS ─────────────────────────────────────────────────────────
 *
 *   Operation ce90a828 (2026-09-22) finished successfully while the Creator
 *   was told «البوابة لا تستجيب». The production's truth outlived the socket
 *   that asked for it, and there was no way to ask again. This is that way.
 *
 *   It reads the Empire's existing operation_ledger — no second state store,
 *   no new vocabulary. Owner-scoped: an operation that is not yours answers
 *   404, the same as one that does not exist, so no identifier can be probed
 *   for someone else's work.
 *
 *   It performs nothing. It starts nothing. It costs nothing.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ operationId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  const { operationId } = await context.params;
  const observed = await observeOperation(operationId, session.creatorId);
  if (!observed) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'لا توجد عمليةٌ بهذا المعرّف.' },
      { status: 404 },
    );
  }

  // Contract §5: the operation IS the response — operationId and state at the
  // top level, the sovereign asset reference when DEPOSITED, an attributable
  // reason when FAILED. Nothing here names a provider or a model (§10).
  return NextResponse.json({
    operationId: observed.operationId,
    state: observed.state,
    isTerminal: observed.isTerminal,
    // The one distinction the chamber needs and a socket cannot give it.
    producing: !observed.isTerminal,
    succeeded: observed.state === OperationState.DEPOSITED,
    createdAt: observed.createdAt,
    updatedAt: observed.updatedAt,
    resolvedAt: observed.resolvedAt ?? null,
    assetId: observed.assetId ?? null,
    assetUrl: observed.assetUrl ?? null,
    failureReason: observed.failureReason ?? null,
  });
}
