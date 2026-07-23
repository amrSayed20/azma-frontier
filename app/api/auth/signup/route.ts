import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '../../../../src/authentication';
import { getDb, updateCreatorPreferredLocale } from '../../../../src/persistent-storage';
import { isSupportedLocale, LOCALE_COOKIE } from '../../../../src/creator-language';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'failed', reason: 'invalid-input', message: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const { email, password, displayName } = (body ?? {}) as { email?: unknown; password?: unknown; displayName?: unknown };
  if (typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ status: 'failed', reason: 'invalid-input', message: 'A string email and password are required.' }, { status: 400 });
  }

  const outcome = await signUp(email, password, typeof displayName === 'string' ? displayName : undefined);

  if (outcome.status === 'failed') {
    const httpStatus = outcome.reason === 'email-taken' ? 409 : 400;
    return NextResponse.json(outcome, { status: httpStatus });
  }

  // CREATOR LANGUAGE EXPERIENCE: "selected once, from the Gate, from that
  // moment onward the language of the entire Empire" — a language chosen
  // before this Creator ever had an account must carry into the new
  // account, not be silently lost the moment identity exists.
  const existingLocaleCookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (isSupportedLocale(existingLocaleCookie)) {
    updateCreatorPreferredLocale(getDb(), outcome.result.creatorId, existingLocaleCookie);
  }

  const response = NextResponse.json(
    { status: 'succeeded', creatorId: outcome.result.creatorId, role: outcome.result.role },
    { status: 201 },
  );
  response.cookies.set(SESSION_COOKIE, outcome.result.sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(outcome.result.expiresAt),
  });
  return response;
}
