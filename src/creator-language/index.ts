/**
 * AZMA OS — CREATOR LANGUAGE EXPERIENCE
 * Public API — import from here, never directly from the individual
 * files, WITH ONE DISCLOSED EXCEPTION: resolveRequestLocale (see
 * resolve-request-locale.ts) is deliberately NOT re-exported here. It
 * transitively imports next/headers, Authentication, and Persistent
 * Storage (node:sqlite) — server-only. A shared barrel that both Server
 * and Client Components import from would otherwise drag that
 * server-only graph into the browser bundle the moment any Client
 * Component imported anything from this file (a real build failure,
 * found by actually running `next build`, not by inspection). Server
 * Components import resolveRequestLocale directly from its own file.
 *
 * The constitutional foundation approved by the Council: one selection
 * point (the Imperial Gate), one persisted decision, consumed by every
 * page and chamber through the root layout. See ENGINEERING_NOTE below
 * for what this deliberately does and does not cover.
 *
 * ENGINEERING NOTE: this mission builds the mechanism and translates the
 * Gate and Creator Access Experience. Qiyamah's and Hujjah's ceremonial
 * copy is not translated here — both already consume resolveLocale()
 * through the root layout (correct <html lang dir>), so adding their own
 * dictionary coverage later requires no architectural change, only new
 * dictionary entries.
 */

export type { Locale, LocaleDefinition, Dictionary } from './types';
export { SUPPORTED_LOCALES, DEFAULT_LOCALE, isSupportedLocale, getLocaleDefinition } from './locale-registry';
export { resolveLocale, LOCALE_COOKIE } from './resolve-locale';
export { getDictionary, t } from './dictionary';
export { LocaleSwitcher } from './LocaleSwitcher';
