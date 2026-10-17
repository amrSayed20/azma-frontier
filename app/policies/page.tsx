import { PUBLISHED_POLICIES } from '@/src/policies';
import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary, t } from '@/src/creator-language';
import './policies.css';

/**
 * AZMA OS — the policies a Creator can actually read.
 *
 * It lists what is PUBLISHED, and nothing else. Seven documents written in
 * September live in `docs/` and never reach the server — the release artifact
 * carries `.next`, `package.json` and `package-lock.json` and nothing more —
 * so listing them here would be the Empire pointing at doors that open onto
 * a wall.
 *
 * ─── THE READER'S TONGUE, AND THE DOCUMENT'S ────────────────────────────────
 *
 *   MEASURED on the live release: a Creator who chose English arrived here
 *   and found «السياسات» and «← عُد إلى البوابة». Every label on this page was
 *   written into it rather than read from the dictionary, so the page could
 *   not answer in any tongue but one.
 *
 *   These two are different questions and are answered differently:
 *
 *     · THE PAGE speaks the READER's language — it is furniture, and
 *       furniture should be in the language of whoever is sitting on it.
 *     · A POLICY speaks its OWN language, and its page is laid out in that
 *       language's direction. A ratified Arabic instrument framed in English
 *       chrome would suggest an English version exists. None does.
 */
export default async function PoliciesIndex() {
  const locale = await resolveRequestLocale();
  const dict = getDictionary(locale);
  const isAr = locale === 'ar';

  return (
    <main className="policy-viewport" dir={isAr ? 'rtl' : 'ltr'} lang={locale}>
      <header className="policy-header">
        <p className="policy-kicker">AZMA OS</p>
        <h1 className="policy-title">{t(dict, 'policies.indexTitle')}</h1>
      </header>

      <ul className="policy-list">
        {PUBLISHED_POLICIES.map((p) => (
          <li key={p.slug} className="policy-list-item">
            <a href={`/policies/${p.slug}`} className="policy-list-link">
              {/* The reader's tongue leads; the other is kept beside it, since
                  a policy is looked up by either name. */}
              <span className="policy-list-name">{isAr ? p.titleAr : p.titleEn}</span>
              <span className="policy-list-en" lang={isAr ? 'en' : 'ar'}>
                {isAr ? p.titleEn : p.titleAr}
              </span>
            </a>
            <span className="policy-list-meta">
              {t(dict, 'policies.version')} {p.version}
              {' · '}
              {p.effectiveDate
                ? `${t(dict, 'policies.effectiveFrom')} ${p.effectiveDate}`
                : t(dict, 'policies.noEffectiveDate')}
            </span>
            {/* Said BEFORE they open it, not after they have read a page they
                cannot follow: this document is Arabic, and the Arabic governs. */}
            {!isAr && p.language === 'ar' && (
              <span className="policy-list-governing">{t(dict, 'policies.arabicIsGoverning')}</span>
            )}
          </li>
        ))}
      </ul>

      <nav className="policy-back policy-back-end">
        <a href="/">{t(dict, 'policies.backToGate')}</a>
      </nav>
    </main>
  );
}
