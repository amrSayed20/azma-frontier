import { cookies } from 'next/headers';
import { verifySession } from '@/src/authentication';
import { getDb, getCreator } from '@/src/persistent-storage';
import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary, t } from '@/src/creator-language';
import '../../creator-access.css';

const SESSION_COOKIE = 'azma_session';

/**
 * IMPERIAL IDENTITY CONTINUITY (Transition 7): the Empire's first chance
 * to re-establish itself after a necessary departure to Stripe's own
 * checkout. Now fully server-rendered — no client-fetch flash of
 * anonymous "Welcome." before the real name resolves, unlike the
 * Chamber's own greeting (a known, disclosed inconsistency from the
 * Simulation Report, corrected here rather than repeated).
 */
export default async function SubscribeSuccessPage() {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  const creator = session ? getCreator(getDb(), session.creatorId) : null;

  const locale = await resolveRequestLocale();
  const dict = getDictionary(locale);

  const subtitle = creator?.displayName
    ? t(dict, 'subscribeSuccess.subtitleNamed', { name: creator.displayName })
    : t(dict, 'subscribeSuccess.subtitleAnonymous');

  return (
    <main className="creator-access-viewport">
      <div className="creator-access-card">
        <p className="creator-access-kicker">{t(dict, 'subscribeSuccess.kicker')}</p>
        <h1 className="creator-access-title">{t(dict, 'subscribeSuccess.title')}</h1>
        <p className="creator-access-subtitle">{subtitle}</p>
        <a href="/imperial-foyer" className="creator-access-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          {t(dict, 'subscribeSuccess.enterButton')}
        </a>
      </div>
    </main>
  );
}
