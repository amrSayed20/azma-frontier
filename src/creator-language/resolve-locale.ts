/**
 * AZMA OS — CREATOR LANGUAGE EXPERIENCE
 * Locale Resolution
 *
 * One rule, consumed everywhere: an authenticated Creator's own stored
 * preference wins; otherwise the cookie set at the Gate wins; otherwise
 * the Empire's default. No page re-derives this — every Server Component
 * that needs a locale calls resolveLocale() with whatever it already has
 * on hand (a cookie value, a Creator record), never re-implementing the
 * fallback order itself.
 */

import { DEFAULT_LOCALE, isSupportedLocale } from './locale-registry';
import type { Locale } from './types';

export const LOCALE_COOKIE = 'azma_locale';

export function resolveLocale(cookieValue: string | undefined | null, creatorPreferredLocale?: string | null): Locale {
  if (isSupportedLocale(creatorPreferredLocale)) return creatorPreferredLocale;
  if (isSupportedLocale(cookieValue)) return cookieValue;
  return DEFAULT_LOCALE;
}
