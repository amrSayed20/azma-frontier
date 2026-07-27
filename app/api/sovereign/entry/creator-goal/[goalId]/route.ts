import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE
 *
 * The sanctioned read path for a previously-created Goal, closing the
 * gap Package VIII found: `GoalState.getGoal()` always worked, but no
 * boundary-respecting forward of it existed. Imports only from SOEL —
 * never from src/chambers/makman-al-ghayah directly — same Runtime
 * Boundary rule the POST route in the parent folder already follows.
 *
 * Returns 404 for both "no such Goal" and "this Goal belongs to another
 * tenant" — SOEL's own getCreatorGoal() already collapses both cases to
 * `undefined` so this route cannot leak which one occurred.
 */
export async function GET(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to read a Goal.' }, { status: 401 });
  }

  const { goalId } = await context.params;
  const goal = soel.getCreatorGoal(goalId, session.creatorId);

  if (!goal) {
    return NextResponse.json({ error: 'No Goal found for this Creator with that id.' }, { status: 404 });
  }

  return NextResponse.json({ goal });
}
