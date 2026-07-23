import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary, t } from '@/src/creator-language';
import { ConstitutionalLink } from '@/src/constitutional-navigation';
import './creator-access.css';

/**
 * PACKAGE IV — LIVING EXPERIENCE FOUNDATION
 * Investigation finding F6: no custom not-found.tsx existed anywhere in
 * the app tree — any dead or mistyped route fell through to Next.js's
 * bare default 404, the single largest identity break the Investigation
 * found. Rendered inside the root layout like every other route, so
 * DirectorStage / HeartPulse / CoreThought / the rest of the mounted
 * organs still apply automatically here — this file only supplies the
 * page-specific content, reusing the Creator Access Experience's own
 * CSS and the Creator Language dictionary rather than inventing either.
 */
export default async function NotFound() {
  const locale = await resolveRequestLocale();
  const dict = getDictionary(locale);

  return (
    <main className="creator-access-viewport">
      <div className="creator-access-card">
        <p className="creator-access-kicker">{t(dict, 'notFound.kicker')}</p>
        <h1 className="creator-access-title">{t(dict, 'notFound.title')}</h1>
        <p className="creator-access-subtitle">{t(dict, 'notFound.subtitle')}</p>
        <ConstitutionalLink
          to="/"
          className="creator-access-submit"
          style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
        >
          {t(dict, 'notFound.returnButton')}
        </ConstitutionalLink>
      </div>
    </main>
  );
}
