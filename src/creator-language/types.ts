/**
 * AZMA OS — CREATOR LANGUAGE EXPERIENCE
 * Type Definitions
 *
 * The constitutional foundation for a platform-wide language choice: one
 * selection point (the Imperial Gate), one persisted decision, consumed
 * identically by every page and chamber through the root layout. See
 * locale-registry.ts for the extensibility guarantee — adding a third
 * language later means adding one entry and one dictionary file here,
 * nothing else in the platform changes shape.
 */

export type Locale = 'ar' | 'en';

export interface LocaleDefinition {
  readonly id: Locale;
  readonly nativeName: string;
  readonly direction: 'rtl' | 'ltr';
}

export type Dictionary = Readonly<Record<string, string>>;
