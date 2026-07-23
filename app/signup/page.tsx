import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary } from '@/src/creator-language';
import { SignupPageClient } from './SignupPageClient';

/**
 * REGISTRATION GATEWAY: this Server Component resolves locale and
 * dictionary, then hands both (plain, serializable values) to
 * SignupPageClient — see that file for why the SignupExperience/
 * SignupForm composition had to move into a client component.
 */
export default async function SignupPage() {
  const locale = await resolveRequestLocale();
  const dict = getDictionary(locale);
  return <SignupPageClient dict={dict} locale={locale} />;
}
