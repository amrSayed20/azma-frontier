import { NextRequest, NextResponse } from 'next/server';
import { logIn } from '../../../../src/authentication';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'failed', reason: 'invalid-input', message: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };
  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ status: 'failed', reason: 'invalid-input', message: 'A string email and password are required.' }, { status: 400 });
  }

  const outcome = await logIn(email, password);

  if (outcome.status === 'failed') {
    const httpStatus = outcome.reason === 'invalid-credentials' ? 401 : 400;
    return NextResponse.json(outcome, { status: httpStatus });
  }

  const response = NextResponse.json(
    { status: 'succeeded', creatorId: outcome.result.creatorId, role: outcome.result.role },
    { status: 200 },
  );
  response.cookies.set(SESSION_COOKIE, outcome.result.sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false',
    sameSite: 'lax',
    path: '/',
    expires: new Date(outcome.result.expiresAt),
  });
  return response;
}
