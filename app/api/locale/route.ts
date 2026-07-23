import { NextRequest, NextResponse } from 'next/server';
import { isSupportedLocale, LOCALE_COOKIE } from '../../../src/creator-language';
import { verifySession } from '../../../src/authentication';
import { getDb, updateCreatorPreferredLocale } from '../../../src/persistent-storage';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const LOCALE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // one year — "persist across future visits"

/**
 * CREATOR LANGUAGE EXPERIENCE — the one write path for the Council's
 * "selected once, from the Gate" requirement. Sets the cookie every
 * anonymous or authenticated visitor is resolved against; additionally
 * persists to the Creator's own record when a session exists, so the
 * choice survives across devices, not just across visits to one browser.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'failed', message: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const locale = (body as { locale?: unknown })?.locale;
  if (!isSupportedLocale(locale)) {
    return NextResponse.json({ status: 'failed', message: 'Unsupported locale.' }, { status: 400 });
  }

  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (session) {
    updateCreatorPreferredLocale(getDb(), session.creatorId, locale);
  }

  const response = NextResponse.json({ status: 'succeeded', locale });
  response.cookies.set(LOCALE_COOKIE, locale, {
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
  });
  return response;
}
