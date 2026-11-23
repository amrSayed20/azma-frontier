'use client';

import type { Dictionary, Locale } from '@/src/creator-language';
import { LoginExperience } from '@/src/imperial-experience-engine';
import { LoginForm } from './LoginForm';

/**
 * RECOGNITION GATEWAY: mirrors app/signup/SignupPageClient.tsx exactly,
 * for the same reason — app/login/page.tsx is a Server Component, and
 * a function-as-children render prop cannot cross the Server→Client
 * boundary (a real bug found the hard way while building Signup's own
 * equivalent). Only dict, locale and the font's class name (plain,
 * serializable values) cross that boundary; the render-prop composition
 * happens entirely here, client-side.
 */
export function LoginPageClient({
  dict,
  locale,
  fontClass,
}: {
  readonly dict: Dictionary;
  readonly locale: Locale;
  readonly fontClass: string;
}) {
  return (
    <LoginExperience dict={dict} locale={locale} fontClass={fontClass}>
      {(onSuccess) => <LoginForm dict={dict} onSuccess={onSuccess} />}
    </LoginExperience>
  );
}
