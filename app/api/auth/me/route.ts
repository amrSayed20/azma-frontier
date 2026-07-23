import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';
import { getDb, getCreator } from '../../../../src/persistent-storage';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * A small, additive, Creator-facing session-awareness endpoint — reuses
 * verifySession() exactly as /api/sovereign/auth and
 * /api/qiyamah/generate already do. Distinct from /api/sovereign/auth,
 * which is Founder-only and shaped around that page's own
 * `authorized`/`founderId` contract; this one reports any authenticated
 * Creator or Founder, for the new Creator Access Experience pages.
 *
 * IMPERIAL IDENTITY CONTINUITY (Mandate: every threshold acknowledges
 * the Creator): displayName was already stored at signup but never
 * surfaced anywhere — added here so pages can greet a Creator by name
 * instead of only checking whether they're allowed through.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  const creator = getCreator(getDb(), session.creatorId);
  return NextResponse.json({
    authenticated: true,
    creatorId: session.creatorId,
    role: session.role,
    displayName: creator?.displayName ?? null,
  });
}
