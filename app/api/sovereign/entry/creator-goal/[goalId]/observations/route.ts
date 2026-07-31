import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * REALITY OBSERVATION FOUNDATION (Constitutional Foundation Package IV)
 *
 * GET — returns all Observations recorded for a Milestone Goal, most recent first.
 *       An Observation is a statement of reality (a real platform signal),
 *       constitutionally distinct from a SuccessCriterion (definition) or any
 *       future Fulfillment Assessment (judgment). No signal = no observation.
 *
 * 401: not signed in.
 * 404: Goal not found or belongs to a different Creator.
 * 200: { observations: ObservationRecord[] }
 */
export async function GET(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to view Observations.' }, { status: 401 });
  }

  const { goalId } = await context.params;

  const goal = soel.getCreatorGoal(goalId, session.creatorId);
  if (!goal) {
    return NextResponse.json({ error: 'No Goal found for this Creator with that id.' }, { status: 404 });
  }

  const observations = soel.listObservationsForGoal(goalId, session.creatorId);
  return NextResponse.json({ observations });
}
