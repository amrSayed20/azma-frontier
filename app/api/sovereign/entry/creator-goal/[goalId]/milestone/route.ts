import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * SOVEREIGN PURPOSE → MILESTONE GOAL FOUNDATION (Constitutional Package II)
 *
 * PUT — designates the specified Goal as a Milestone Goal serving the
 *        Creator's Sovereign Purpose. Snapshots the current Purpose wording
 *        into the Goal so the historical relationship survives any future
 *        Purpose edits.
 *
 * 400: Creator has no Sovereign Purpose set (must set one first).
 * 404: Goal not found or belongs to a different Creator.
 * 200: Goal successfully designated as a Milestone Goal.
 *
 * The creatorId is always sourced from the verified session — a Creator
 * can only designate their own Goals as Milestone Goals.
 */
export async function PUT(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to designate a Milestone Goal.' }, { status: 401 });
  }

  const { goalId } = await context.params;
  const outcome = soel.designateGoalAsMilestone(goalId, session.creatorId);

  if (!outcome.ok) {
    if (outcome.reason === 'NO_SOVEREIGN_PURPOSE') {
      return NextResponse.json(
        { error: 'Set a Sovereign Purpose before designating Milestone Goals.' },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'No Goal found for this Creator with that id.' },
      { status: 404 },
    );
  }

  return NextResponse.json({ goal: outcome.goal });
}
