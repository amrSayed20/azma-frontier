import type { Locale, Dictionary } from '../types';
import { en } from './en';
import { ar } from './ar';

const DICTIONARIES: Readonly<Record<Locale, Dictionary>> = { en, ar };

/** Extensibility point: a new locale's dictionary is added here and to locale-registry.ts, nothing else changes. */
export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** Looks up a key, substituting any `{placeholder}` tokens — falls back to the key itself if genuinely missing, never throws. */
export function t(dictionary: Dictionary, key: string, substitutions?: Readonly<Record<string, string>>): string {
  let value = dictionary[key] ?? key;
  if (substitutions) {
    for (const [token, replacement] of Object.entries(substitutions)) {
      value = value.replace(`{${token}}`, replacement);
    }
  }
  return value;
}
