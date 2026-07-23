'use client';

import type { Dictionary, Locale } from '@/src/creator-language';
import { LoginExperience } from '@/src/imperial-experience-engine';
import { LoginForm } from './LoginForm';

/**
 * RECOGNITION GATEWAY: mirrors app/signup/SignupPageClient.tsx exactly,
 * for the same reason — app/login/page.tsx is a Server Component, and
 * a function-as-children render prop cannot cross the Server→Client
 * boundary (a real bug found the hard way while building Signup's own
 * equivalent). Only dict/locale (plain, serializable values) cross
 * that boundary; the render-prop composition happens entirely here,
 * client-side.
 */
export function LoginPageClient({ dict, locale }: { readonly dict: Dictionary; readonly locale: Locale }) {
  return (
    <LoginExperience dict={dict} locale={locale}>
      {(onSuccess) => <LoginForm dict={dict} onSuccess={onSuccess} />}
    </LoginExperience>
  );
}
