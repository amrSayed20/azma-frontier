import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * SOVEREIGN KNOWLEDGE REQUEST FOUNDATION (Constitutional Foundation Package IX)
 *
 * GET — issues the formal Knowledge Request batch from Makman Al-Ghayah.
 *
 *         The batch contains one typed SovereignKnowledgeRequest per active
 *         Knowledge Requirement for this Goal. Each request carries the exact
 *         question the Empire must answer, the gap context that drove it, and
 *         the availability hint that tells Al Hujjah where to look.
 *
 *         This route does not invoke Al Hujjah. It does not search for
 *         knowledge. It does not evaluate evidence. It does not produce
 *         conclusions. It formally states what is required and stops.
 *
 *         The requests returned remain unanswered. That answer belongs
 *         to Al Hujjah Al-Damighah.
 *
 * 401: not signed in.
 * 404: Goal not found or belongs to a different Creator.
 * 422: No Fulfillment Assessment has been requested yet for this Goal.
 *         Request one via POST /fulfillment-assessment first.
 * 200: { batch }
 */

export async function GET(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to issue Knowledge Requests.' }, { status: 401 });
  }

  const { goalId } = await context.params;
  const outcome = soel.issueKnowledgeRequests(goalId, session.creatorId);

  if (!outcome.ok) {
    const status = outcome.reason === 'GOAL_NOT_FOUND' ? 404 : 422;
    return NextResponse.json({ error: outcome.reason }, { status });
  }

  return NextResponse.json({ batch: outcome.batch });
}
