/**
 * AZMA OS — CREATOR LANGUAGE EXPERIENCE
 * Locale Registry
 *
 * The extensibility point named by the Council's own requirement: a
 * third language is added here, as one entry plus one dictionary file
 * (see dictionary/), without touching the Gate, the root layout, the
 * cookie mechanism, or any consuming page. Arabic is the default — the
 * Empire's own original, native voice across the Gate and every
 * ceremonial chamber — English is the one alternative currently offered.
 */

import type { Locale, LocaleDefinition } from './types';

export const SUPPORTED_LOCALES: readonly LocaleDefinition[] = [
  { id: 'ar', nativeName: 'العربية', direction: 'rtl' },
  { id: 'en', nativeName: 'English', direction: 'ltr' },
];

export const DEFAULT_LOCALE: Locale = 'ar';

export function isSupportedLocale(value: unknown): value is Locale {
  return SUPPORTED_LOCALES.some((locale) => locale.id === value);
}

export function getLocaleDefinition(locale: Locale): LocaleDefinition {
  const definition = SUPPORTED_LOCALES.find((candidate) => candidate.id === locale);
  // Every member of the Locale union has a registry entry by construction — this is unreachable in practice.
  if (!definition) throw new Error(`No registry entry for locale "${locale}".`);
  return definition;
}
