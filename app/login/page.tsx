import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary } from '@/src/creator-language';
import { LoginPageClient } from './LoginPageClient';

/**
 * RECOGNITION GATEWAY: Server Component resolving locale/dictionary,
 * handed to LoginPageClient — see that file for why the composition
 * had to move into a client component.
 */
export default async function LoginPage() {
  const locale = await resolveRequestLocale();
  const dict = getDictionary(locale);
  return <LoginPageClient dict={dict} locale={locale} />;
}
