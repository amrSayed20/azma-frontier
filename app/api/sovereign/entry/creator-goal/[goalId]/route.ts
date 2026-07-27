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
 *
 * PACKAGE XII — FULL MAKMAN COMMERCIAL INTENT READ DECISION: this route
 * used to serialize `goal` verbatim, which meant the full
 * `MakmanCommercialIntent` (including `publisherTenantId` and a redundant
 * full `compiledAssemblyGraph`) was already being sent over the network
 * to the browser on every fetch, even though the only real caller
 * (app/ras-amr/page.tsx, via decideCinematicDirection ->
 * deriveCreatorGoalFromFormalContract) only ever reads accessPolicy/
 * coverArtUri afterward — durability had quietly become default network
 * exposure. A repo-wide investigation (see automatic-director-
 * constitution.ts's own FULL_COMMERCIAL_INTENT_READ_DECISION) found no
 * real consumer anywhere that needs the two dropped fields back off a
 * stored Goal. The response below is now narrowed to the same scoped
 * commercialIntent view Ras Al Amr already uses — every other GoalContract
 * field is still returned in full, since nothing about those is over-
 * exposed.
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

  const responseGoal = {
    ...goal,
    commercialIntent: goal.commercialIntent
      ? { accessPolicy: goal.commercialIntent.accessPolicy, coverArtUri: goal.commercialIntent.coverArtUri }
      : undefined,
  };

  return NextResponse.json({ goal: responseGoal });
}
