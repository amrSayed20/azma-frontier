'use client';

import Link from 'next/link';
import './creator-access.css';

/**
 * Shown when a page throws while rendering. Without it Next.js shows its
 * bare default error screen. A client component cannot read the
 * creator's language on the server, so both languages appear.
 */
export default function ErrorPage({ reset }: { readonly error: Error & { digest?: string }; readonly reset: () => void }) {
  return (
    <main className="creator-access-viewport">
      <div className="creator-access-card">
        <p className="creator-access-kicker">بوابة العبور السيادي</p>
        <h1 className="creator-access-title">تعثّرت هذه الصفحة</h1>
        <p className="creator-access-subtitle">
          حدث خطأ أثناء عرضها. أعمالك المحفوظة لم تتأثر. أعد المحاولة، أو عُد إلى البوابة.
        </p>
        <p className="creator-access-status" lang="en" dir="ltr">
          Something went wrong on this page. Your saved work is not affected.
        </p>
        <button type="button" className="creator-access-submit" onClick={reset}>
          أعد المحاولة
        </button>
        <p className="creator-access-footer">
          <Link href="/">العودة إلى البوابة</Link>
        </p>
      </div>
    </main>
  );
}
