import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * AUTHENTICATION FOUNDATION (Execution Package III): replaces the prior
 * placeholder, which unconditionally returned authorized: true. This
 * endpoint's response shape (authorized, founderId) is preserved for
 * its existing consumer (app/sovereign-high-council/page.tsx) — only
 * its correctness changed. It now requires a real, active session
 * belonging to a Founder-role account (provisioned only via
 * src/authentication/founder-bootstrap.ts, never public sign-up).
 */
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    return NextResponse.json({ authorized: false });
  }

  const session = verifySession(sessionId);
  if (!session || session.role !== 'founder') {
    return NextResponse.json({ authorized: false });
  }

  return NextResponse.json({ authorized: true, founderId: session.creatorId });
}
