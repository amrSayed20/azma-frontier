import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary } from '@/src/creator-language';
import { Readex_Pro } from 'next/font/google';
import { LoginPageClient } from './LoginPageClient';

/*
 * «الدِّهليز» SETS ITS OWN TYPE — AND ONLY ITS OWN.
 *
 *   The platform's typography law binds every chamber to IBM Plex Sans
 *   Arabic through `app/layout.tsx`, and that file is not this page's to
 *   touch: it is loaded by every surface in the Empire, and the Founder's
 *   rule of 2026-11-21 keeps it closed without his word.
 *
 *   `next/font` does not require the layout. Declared here, the face is
 *   hashed, self-hosted and preloaded for THIS route alone, and handed down
 *   as a variable the vestibule's own stylesheet reads. No chamber sees it.
 *
 *   The same face the courtyard and the hall use, under this route's own
 *   variable name — a Creator walking /signup → /login must not feel the
 *   type change between two doors of one house.
 */
const vestibuleFont = Readex_Pro({
  variable: '--dihliz-font',
  subsets: ['arabic', 'latin'],
  weight: ['200', '300', '400', '500', '600'],
  display: 'swap',
});

/**
 * RECOGNITION GATEWAY: Server Component resolving locale/dictionary,
 * handed to LoginPageClient — see that file for why the composition
 * had to move into a client component.
 */
export default async function LoginPage() {
  const locale = await resolveRequestLocale();
  const dict = getDictionary(locale);
  return <LoginPageClient dict={dict} locale={locale} fontClass={vestibuleFont.variable} />;
}
