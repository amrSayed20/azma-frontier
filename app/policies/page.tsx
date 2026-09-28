import { PUBLISHED_POLICIES } from '@/src/policies';
import './policies.css';

/**
 * AZMA OS — the policies a Creator can actually read.
 *
 * It lists what is PUBLISHED, and nothing else. Seven documents written in
 * September live in `docs/` and never reach the server — the release artifact
 * carries `.next`, `package.json` and `package-lock.json` and nothing more —
 * so listing them here would be the Empire pointing at doors that open onto
 * a wall.
 */
export default function PoliciesIndex() {
  return (
    <main className="policy-viewport" dir="rtl">
      <header className="policy-header">
        <p className="policy-kicker">AZMA OS</p>
        <h1 className="policy-title">السياسات</h1>
      </header>

      <ul className="policy-list">
        {PUBLISHED_POLICIES.map((p) => (
          <li key={p.slug} className="policy-list-item">
            <a href={`/policies/${p.slug}`} className="policy-list-link">
              <span className="policy-list-name">{p.titleAr}</span>
              <span className="policy-list-en" lang="en">{p.titleEn}</span>
            </a>
            <span className="policy-list-meta">
              الإصدار {p.version}
              {' · '}
              {p.effectiveDate ? `سارية من ${p.effectiveDate}` : 'لم يُحدَّد تاريخ سريانها بعد'}
            </span>
          </li>
        ))}
      </ul>

      <nav className="policy-back policy-back-end">
        <a href="/">← عُد إلى البوابة</a>
      </nav>
    </main>
  );
}
