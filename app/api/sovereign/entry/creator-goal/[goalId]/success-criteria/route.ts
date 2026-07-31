import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * MILESTONE SUCCESS DEFINITION FOUNDATION (Constitutional Package III)
 *
 * PUT — sets the Creator's explicit Success Definition for a Goal.
 *        Replaces any prior criteria list entirely.
 *        Body: { criteria: { description: string }[] }
 *
 * CONSTITUTIONAL NOTE: GoalStatus.COMPLETED is production completion —
 * a constitutionally distinct event from any SuccessCriterion being
 * satisfied. This route records the Creator's intent; assessment is future.
 *
 * 400: body is invalid or no criteria provided.
 * 404: Goal not found or belongs to a different Creator.
 * 200: Success Definition recorded.
 */
export async function PUT(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to define Success Criteria.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 });
  }

  if (body === null || typeof body !== 'object' || !('criteria' in body) || !Array.isArray((body as { criteria: unknown }).criteria)) {
    return NextResponse.json({ error: 'Body must be { criteria: { description: string }[] }.' }, { status: 400 });
  }

  const rawCriteria = (body as { criteria: unknown[] }).criteria;

  if (rawCriteria.length === 0) {
    return NextResponse.json({ error: 'At least one criterion is required.' }, { status: 400 });
  }

  const descriptions: string[] = [];
  for (const item of rawCriteria) {
    if (item === null || typeof item !== 'object' || typeof (item as { description?: unknown }).description !== 'string' || ((item as { description: string }).description).trim().length === 0) {
      return NextResponse.json({ error: 'Each criterion must have a non-empty description string.' }, { status: 400 });
    }
    descriptions.push(((item as { description: string }).description).trim());
  }

  const { goalId } = await context.params;
  const outcome = soel.defineSuccessCriteria(goalId, session.creatorId, descriptions);

  if (!outcome.ok) {
    return NextResponse.json({ error: 'No Goal found for this Creator with that id.' }, { status: 404 });
  }

  return NextResponse.json({ goal: outcome.goal });
}
