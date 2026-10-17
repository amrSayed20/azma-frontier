import Link from 'next/link';
import '../creator-access.css';

export interface LegalSection {
  readonly heading: string;
  readonly paragraphs?: readonly string[];
  readonly items?: readonly string[];
}

/**
 * A legal page drafted from what the platform's code actually does.
 * Every page carries the draft notice until counsel and the Chief
 * Architect approve the text; bracketed lines are decisions not yet made.
 */
export function LegalDocument({ title, sections }: { readonly title: string; readonly sections: readonly LegalSection[] }) {
  return (
    <main className="creator-access-viewport" dir="rtl" lang="ar">
      <article className="creator-access-card legal-doc">
        <p className="creator-access-kicker">بوابة العبور السيادي</p>
        <h1 className="creator-access-title">{title}</h1>
        <p className="legal-draft-notice" role="note">
          مسودة غير معتمدة. كُتبت من سلوك المنصة الفعلي كما هو في الكود، وتحتاج مراجعة قانونية واعتماد كبير المعماريين قبل الإطلاق.
          ما بين [معقوفين] قرار لم يُتخذ بعد.
        </p>
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="creator-access-section-title">{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.items && (
              <ul>
                {section.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </section>
        ))}
        <p className="creator-access-links">
          <a href="/terms">شروط الاستخدام</a>
          <a href="/privacy">سياسة الخصوصية</a>
          <a href="/refund">سياسة الاسترداد</a>
          <Link href="/">البوابة</Link>
        </p>
      </article>
    </main>
  );
}
