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

/**
 * ─── THE DOOR OUT, AND THE DOOR BACK ────────────────────────────────────────
 *
 *   FOUNDER, 2026-09-29: «امنع تكدس الاصول والغايات بصفه عامه داخل الحجره».
 *
 *   MEASURED that day on production: this route had GET and nothing else, the
 *   list route had no removal verb, and مكمن الغاية rendered zero controls
 *   matching حذف / أرشفة / إزالة. 21 goals and 54.4KB travelled on every open
 *   of the chamber and not one of them could ever be put away.
 *
 *   PATCH does exactly one thing and refuses everything else: it sets or
 *   clears `archived`. It is Article 6.1's «الحذف التشغيلي» — hidden from
 *   ordinary display, the act recorded, fully restorable — and it is
 *   deliberately NOT a general-purpose goal editor, because a verb that can
 *   change anything is a verb whose blast radius nobody can state.
 *
 *   THERE IS NO DELETE, AND THERE WILL NOT BE ONE. Article 6.5: «الحذف
 *   التشغيلي لا يساوي الإتلاف النهائي». `GoalRepository.deleteById` exists
 *   and keeps no caller: a Creator may put a goal away, never destroy it.
 */
export async function PATCH(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ status: 'failed', message: 'سجّل دخولك أوّلاً.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'failed', message: 'الطلب غير مفهوم.' }, { status: 400 });
  }

  const archived = (body as { archived?: unknown } | null)?.archived;
  if (typeof archived !== 'boolean') {
    // Named plainly rather than coerced: a missing field is not a false one,
    // and guessing here would archive a goal nobody asked to archive.
    return NextResponse.json(
      { status: 'failed', message: 'حدّد «archived» صراحةً: true للطيّ، false للاستعادة.' },
      { status: 400 },
    );
  }

  const { goalId } = await context.params;
  const outcome = soel.setGoalArchived(goalId, session.creatorId, archived);

  if (!outcome.ok) {
    // The same answer for "no such goal" and "not yours", as GET above, so a
    // Creator learns nothing about another's goals by probing ids.
    return NextResponse.json({ status: 'failed', message: 'لا توجد غاية بهذا المعرّف.' }, { status: 404 });
  }

  return NextResponse.json({
    status: 'succeeded',
    archived,
    message: archived ? 'طُويت الغاية — تستعيدها متى شئت.' : 'استُعيدت الغاية.',
  });
}
