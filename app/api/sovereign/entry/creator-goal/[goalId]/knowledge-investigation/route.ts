import { NextRequest, NextResponse } from 'next/server';
import { soel } from '@/src/sovereign-entry';
import { verifySession } from '@/src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * IMPERIAL INTEGRATION PACKAGE I — MAKMAN AL GHAYAH ↔ AL HUJJAH AL DAMIGHAH
 *
 * GET — conducts the full sovereign knowledge investigation for a Milestone Goal.
 *
 *         This route closes the complete constitutional chain:
 *           Creator → Purpose → Milestone Goal → Success Criteria
 *           → Observation → Assessment → Gap → Gap Classification
 *           → Knowledge Requirement → Knowledge Request
 *           → Al Hujjah Investigation → Evidence → Knowledge
 *           → Response → Export → Makman receives the response
 *
 *         Each KnowledgeExportRecord in the response carries a Sovereign
 *         Knowledge Response addressed to MAKMAN_AL_GHAYAH. Records are
 *         produced only for criteria that have active gaps requiring
 *         external investigation (availability=REQUIRES_INVESTIGATION).
 *
 *         An empty records array is an honest outcome — it means no active
 *         gaps required investigation, or all investigations failed gracefully.
 *         The Empire does not manufacture knowledge.
 *
 * 401: not signed in.
 * 404: Goal not found or belongs to a different Creator.
 * 422: No Fulfillment Assessment has been requested yet for this Goal.
 *         Request one via POST /fulfillment-assessment first.
 * 200: { records: KnowledgeExportRecord[] }
 */

export async function GET(request: NextRequest, context: { params: Promise<{ goalId: string }> }) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'Sign in to conduct knowledge investigation.' }, { status: 401 });
  }

  const { goalId } = await context.params;
  const outcome = await soel.conductKnowledgeInvestigation(goalId, session.creatorId);

  if (!outcome.ok) {
    const status = outcome.reason === 'GOAL_NOT_FOUND' ? 404 : 422;
    return NextResponse.json({ error: outcome.reason }, { status });
  }

  return NextResponse.json({ records: outcome.records });
}
