import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * SOVEREIGN GAP INVESTIGATION FOUNDATION (Constitutional Foundation Package VIII)
 *
 * GET — derives the Knowledge Requirement report from the latest persisted
 *         Fulfillment Assessment for a Milestone Goal.
 *
 *         Knowledge Requirements name what the Empire must learn to understand
 *         each active Fulfillment Gap, and where that knowledge can currently
 *         be obtained. They do not obtain the knowledge. They do not invoke
 *         Al Hujjah. They do not recommend a remedy.
 *
 *         The report is derived on demand — it is a pure function of the
 *         immutable Gap report, which is itself a pure function of the
 *         immutable Fulfillment Assessment.
 *
 * 401: not signed in.
 * 404: Goal not found or belongs to a different Creator.
 * 422: No Fulfillment Assessment has been requested yet for this Goal.
 *         Request one via POST /fulfillment-assessment first.
 * 200: { requirements }
 */

export async function GET(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to view Gap Knowledge Requirements.' }, { status: 401 });
  }

  const { goalId } = await context.params;
  const outcome = soel.requestKnowledgeRequirements(goalId, session.creatorId);

  if (!outcome.ok) {
    const status = outcome.reason === 'GOAL_NOT_FOUND' ? 404 : 422;
    return NextResponse.json({ error: outcome.reason }, { status });
  }

  return NextResponse.json({ requirements: outcome.requirements });
}
