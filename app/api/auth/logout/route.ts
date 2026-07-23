import { NextRequest, NextResponse } from 'next/server';
import { logOut } from '../../../../src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    logOut(sessionId);
  }

  const response = NextResponse.json({ status: 'succeeded' });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
