import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * FULFILLMENT ASSESSMENT FOUNDATION (Constitutional Foundation Package V)
 *
 * POST — requests a new Fulfillment Assessment for a Milestone Goal.
 *         Computes the Empire's honest judgment from available evidence and
 *         persists the result as an immutable historical record.
 *         CONSTITUTIONAL NOTE: with current signals (CONSUMPTION_ATTEMPT only),
 *         all criteria receive INSUFFICIENT_EVIDENCE or ASSESSMENT_NOT_POSSIBLE.
 *         No certainty is manufactured. No recommendation is generated.
 *
 * GET  — returns all persisted Fulfillment Assessments, most recent first.
 *         Each is a historical snapshot valid for the moment it was drawn.
 *
 * 401: not signed in.
 * 404: Goal not found or belongs to a different Creator.
 * 200: { assessment } (POST) or { assessments } (GET)
 */

export async function POST(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to request a Fulfillment Assessment.' }, { status: 401 });
  }

  const { goalId } = await context.params;
  const outcome = soel.requestFulfillmentAssessment(goalId, session.creatorId);

  if (!outcome.ok) {
    return NextResponse.json({ error: 'No Goal found for this Creator with that id.' }, { status: 404 });
  }

  return NextResponse.json({ assessment: outcome.assessment });
}

export async function GET(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to view Fulfillment Assessments.' }, { status: 401 });
  }

  const { goalId } = await context.params;

  const goal = soel.getCreatorGoal(goalId, session.creatorId);
  if (!goal) {
    return NextResponse.json({ error: 'No Goal found for this Creator with that id.' }, { status: 404 });
  }

  const assessments = soel.listFulfillmentAssessments(goalId, session.creatorId);
  return NextResponse.json({ assessments });
}
