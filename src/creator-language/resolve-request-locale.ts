import { cache } from 'react';
import { cookies } from 'next/headers';
import { verifySession } from '../authentication';
import { getDb, getCreator } from '../persistent-storage';
import { resolveLocale, LOCALE_COOKIE } from './resolve-locale';
import type { Locale } from './types';

const SESSION_COOKIE = 'azma_session';

/**
 * The one server-side locale lookup for an entire request — wrapped in
 * React's cache() so the root layout and any page beneath it that also
 * needs the locale (the Gate included) share a single Creator lookup per
 * request rather than each re-querying independently.
 */
export const resolveRequestLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const sessionId = store.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  const creator = session ? getCreator(getDb(), session.creatorId) : null;
  return resolveLocale(store.get(LOCALE_COOKIE)?.value, creator?.preferredLocale);
});
