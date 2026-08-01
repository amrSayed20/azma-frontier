import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * SOVEREIGN FULFILLMENT GAP FOUNDATION (Constitutional Foundation Package VI)
 *
 * GET — derives the Fulfillment Gap report from the latest persisted
 *         Fulfillment Assessment for a Milestone Goal.
 *
 *         The Gap is not persisted separately — it is derived on demand from
 *         an immutable assessment, which is already persisted. Same assessment
 *         in, same report structure out.
 *
 *         The report states what remains unproven, contradicted, or unresolved
 *         relative to each Success Criterion. It does not recommend a remedy.
 *         It does not diagnose a cause. It names the Gap truthfully, then stops.
 *
 * 401: not signed in.
 * 404: Goal not found or belongs to a different Creator.
 * 422: No Fulfillment Assessment has been requested yet for this Goal.
 *         Request one via POST /fulfillment-assessment first.
 * 200: { gapReport }
 */

export async function GET(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to view the Fulfillment Gap.' }, { status: 401 });
  }

  const { goalId } = await context.params;
  const outcome = soel.requestGapReport(goalId, session.creatorId);

  if (!outcome.ok) {
    const status = outcome.reason === 'GOAL_NOT_FOUND' ? 404 : 422;
    return NextResponse.json({ error: outcome.reason }, { status });
  }

  return NextResponse.json({ gapReport: outcome.gapReport });
}
