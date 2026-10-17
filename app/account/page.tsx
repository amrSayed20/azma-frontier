import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/src/authentication';
import { getDb, getCreator } from '@/src/persistent-storage';
import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary, t } from '@/src/creator-language';
import { ChangePasswordForm } from './ChangePasswordForm';
import '../creator-access.css';

const SESSION_COOKIE = 'azma_session';

/** A signed-in Creator's own account: email, password change, balance, and the documents they agreed to. */
export default async function AccountPage() {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) redirect('/login');
  const creator = getCreator(getDb(), session.creatorId);
  const dict = getDictionary(await resolveRequestLocale());

  return (
    <main className="creator-access-viewport">
      <div className="creator-access-card">
        <p className="creator-access-kicker">{t(dict, 'account.kicker')}</p>
        <h1 className="creator-access-title">{t(dict, 'account.title')}</h1>
        {creator?.email && <p className="creator-access-subtitle">{t(dict, 'account.emailLine', { email: creator.email })}</p>}
        {session.role !== 'founder' && (
          <p className="creator-access-links"><a href="/subscribe">{t(dict, 'account.balanceLink')}</a></p>
        )}

        <h2 className="creator-access-section-title">{t(dict, 'account.passwordHeading')}</h2>
        <ChangePasswordForm dict={dict} />

        <h2 className="creator-access-section-title">{t(dict, 'account.legalHeading')}</h2>
        <p className="creator-access-links">
          <a href="/terms">{t(dict, 'legal.terms.link')}</a>
          <a href="/privacy">{t(dict, 'legal.privacy.link')}</a>
          <a href="/refund">{t(dict, 'legal.refund.link')}</a>
        </p>
      </div>
    </main>
  );
}
