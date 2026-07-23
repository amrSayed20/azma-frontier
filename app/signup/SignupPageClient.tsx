'use client';

import type { Dictionary, Locale } from '@/src/creator-language';
import { SignupExperience } from '@/src/imperial-experience-engine';
import { SignupForm } from './SignupForm';

/**
 * REGISTRATION GATEWAY, PACKAGE II — a real bug caught only by actually
 * loading the page, not by tsc/eslint: app/signup/page.tsx is a Server
 * Component, and React Server Components cannot serialize a function
 * (the onSuccess render-prop SignupExperience needs) across the
 * server→client boundary — "Functions are not valid as a child of
 * Client Components." This thin client component is the fix: dict and
 * locale (plain, serializable values) cross the one real RSC boundary,
 * and the function-as-children composition happens entirely within the
 * client tree from here on, never crossing back through a server
 * component.
 */
export function SignupPageClient({ dict, locale }: { readonly dict: Dictionary; readonly locale: Locale }) {
  return (
    <SignupExperience dict={dict} locale={locale}>
      {(onSuccess) => <SignupForm dict={dict} onSuccess={onSuccess} />}
    </SignupExperience>
  );
}
