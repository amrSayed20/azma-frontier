import { notFound } from 'next/navigation';
import { policyBySlug, PUBLISHED_POLICIES } from '@/src/policies';
import '../policies.css';

/**
 * AZMA OS — one published policy, read by anyone.
 *
 * ─── WHY IT IS A STATIC PAGE AND NOT A FETCH ────────────────────────────────
 *
 *   A payment provider will ask for this URL and a regulator may read it a
 *   year from now. It must answer without a session, without a database, and
 *   without the Empire being awake in any particular way — so the text is
 *   compiled into the build and served from it.
 *
 *   The body is rendered as PRE-FORMATTED TEXT, deliberately. A policy is a
 *   ratified instrument: it is displayed exactly as it was written, with its
 *   own line breaks and its own numbering, and nothing between the Founder's
 *   words and the reader's eye reinterprets them.
 */

export function generateStaticParams() {
  return PUBLISHED_POLICIES.map((p) => ({ slug: p.slug }));
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const policy = policyBySlug(slug);
  if (!policy) notFound();

  const isArabic = policy.language === 'ar';

  return (
    <main className="policy-viewport" dir={isArabic ? 'rtl' : 'ltr'} lang={policy.language}>
      <nav className="policy-back">
        <a href="/policies">{isArabic ? '← كل السياسات' : '← All policies'}</a>
      </nav>

      <header className="policy-header">
        <h1 className="policy-title">{isArabic ? policy.titleAr : policy.titleEn}</h1>
        <p className="policy-meta">
          {isArabic ? 'الإصدار' : 'Version'} {policy.version}
          {' · '}
          {/*
            A policy with no effective date does not govern yet, and saying so
            is not a caveat — it is the difference between a document and a
            promise. It is never rendered as though it were in force.
          */}
          {policy.effectiveDate
            ? `${isArabic ? 'سارية من' : 'Effective'} ${policy.effectiveDate}`
            : (isArabic ? 'لم يُحدَّد تاريخ سريانها بعد' : 'Effective date not yet set')}
        </p>
      </header>

      <article className="policy-body">{policy.body}</article>
    </main>
  );
}
