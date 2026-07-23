import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';
import { getDb, listGenerationsForCreator } from '../../../../src/persistent-storage';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * IMPERIAL FIRST CREATOR IMPLEMENTATION — Storage → Completion (Article
 * III / IX, B6 minimum form). listGenerationsForCreator was already
 * built and tested by the Persistent Storage Foundation but had no
 * route exposing it. This is that route — a real record of what a
 * Creator has made, not the fabricated Vault Palace. No new business
 * logic: this only surfaces data the platform already durably records
 * on every successful generation.
 */
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized', message: 'Sign in to see your generations.' }, { status: 401 });
  }

  const generations = listGenerationsForCreator(getDb(), session.creatorId);
  return NextResponse.json({ status: 'succeeded', generations });
}
