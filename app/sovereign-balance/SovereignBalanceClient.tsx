'use client';

import { useState } from 'react';
import './sovereign-balance.css';

/**
 * Exactly the shape the server hands down — see the page's own header for why
 * this component may not import the pricing module itself.
 */
interface CreatorFacingPackageView {
  readonly packageId: string;
  readonly nameAr: string;
  readonly priceEgp: number;
  readonly balanceUnits: number;
  readonly validityAr: string;
}

interface Props {
  readonly packages: readonly CreatorFacingPackageView[];
  readonly unitNameAr: string;
  readonly notices: {
    readonly standardValidity: string;
    readonly carryForward: string;
    readonly notASubscription: string;
    readonly riyadaValidity: string;
    readonly chargedOnRequested: string;
    readonly notTransferable: string;
  };
  readonly giftNoticeAr: string;
  readonly availableUnits: number | null;
  readonly authenticated: boolean;
  readonly identityVerified: boolean;
  readonly purchaseAvailable: boolean;
}

/**
 * ─── WESTERN DIGITS FOR FIGURES, ARABIC-INDIC FOR PROSE ─────────────────────
 *
 *   The approved policy tables print «99 ج.م» and «16,670», while their prose
 *   reads «٢٨ يوماً». That split is deliberate and it is kept here: a price a
 *   Creator may compare, quote or dispute is written the way the policy writes
 *   it, so the same number is never printed two ways by the Empire. `ar-EG`
 *   would render ٩٩ — correct Arabic, and a different-looking price from the
 *   one in the document a Creator is held to.
 */
const figure = (n: number) => n.toLocaleString('en-US');

/**
 * ─── THE WORD «اشتراك» DOES NOT APPEAR HERE ─────────────────────────────────
 *
 *   The Empire's own /subscribe vocabulary (`subscribe.*` in the dictionary)
 *   calls this an اشتراك. The approved Balance is explicitly not one — no
 *   renewal, no recurring charge, nothing to cancel — and the policy says so
 *   in as many words. So this surface does not borrow that vocabulary: a
 *   label that contradicts the policy beneath it is a false statement no
 *   matter which shared module it came from.
 */
export function SovereignBalanceClient({
  packages, unitNameAr, notices, giftNoticeAr,
  availableUnits, authenticated, identityVerified, purchaseAvailable,
}: Props) {
  const [pending, setPending] = useState<string | null>(null);
  const [failureAr, setFailureAr] = useState<string | null>(null);

  const buy = async (packageId: string) => {
    setFailureAr(null);
    setPending(packageId);
    try {
      const res = await fetch('/api/sovereign/economy/xpay-checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ packId: packageId }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && typeof data.checkoutUrl === 'string') {
        window.location.href = data.checkoutUrl;
        return;
      }

      // The route already says what happened, in Arabic. Its sentence is
      // preferred over one written again here, so a Creator and the server
      // never give two different accounts of the same refusal.
      setFailureAr(
        typeof data.messageAr === 'string' && data.messageAr.length > 0
          ? data.messageAr
          : 'تعذّر بدء الشراء الآن. لم يُخصم شيء.',
      );
    } catch {
      setFailureAr('البوابة لا تستجيب. لم يُخصم شيء.');
    } finally {
      setPending(null);
    }
  };

  return (
    <main className="balance-viewport" dir="rtl">
      <header className="balance-header">
        <p className="balance-kicker">وحدة القيمة داخل الإمبراطورية</p>
        <h1 className="balance-title">{unitNameAr}</h1>
        {availableUnits !== null && (
          <p className="balance-current">
            رصيدك الآن <strong>{figure(availableUnits)}</strong> وحدة
          </p>
        )}
      </header>

      <section className="balance-packages" aria-label="الباقات المعتمدة">
        {packages.map((p) => {
          const busy = pending === p.packageId;
          return (
            <article key={p.packageId} className="balance-package">
              <h2 className="balance-package-name">{p.nameAr}</h2>
              <p className="balance-package-price">
                <span className="balance-package-amount">{figure(p.priceEgp)}</span>
                <span className="balance-package-currency">ج.م</span>
              </p>
              <p className="balance-package-units">
                <strong>{figure(p.balanceUnits)}</strong> وحدة
              </p>
              <p className="balance-package-validity">صلاحيّتها {p.validityAr}</p>

              {purchaseAvailable && authenticated && identityVerified ? (
                <button
                  type="button"
                  className="balance-package-buy"
                  onClick={() => void buy(p.packageId)}
                  disabled={pending !== null}
                >
                  {busy ? 'يُفتح الدفع…' : 'اختر هذه الباقة'}
                </button>
              ) : (
                // No button that cannot work. What stands in its place is the
                // actual reason, and where the Creator's hand should go next.
                <p className="balance-package-shut">
                  {!authenticated
                    ? <>للشراء <a href="/login">ادخل بحسابك</a></>
                    : !identityVerified
                      ? <>للشراء <a href="/api/auth/google/start">وثّق حسابك</a></>
                      : 'الشراء غير مُهيّأ على هذا الخادم بعد.'}
                </p>
              )}
            </article>
          );
        })}
      </section>

      {failureAr && <p className="balance-failure" role="alert">{failureAr}</p>}

      <section className="balance-rules" aria-labelledby="balance-rules-title">
        <h2 id="balance-rules-title" className="balance-section-title">قواعد الرصيد</h2>
        <p>{notices.standardValidity}</p>
        <p>{notices.carryForward}</p>
        <p className="balance-rule-emphatic">{notices.notASubscription}</p>
        <p>{notices.riyadaValidity}</p>
        <p>{notices.chargedOnRequested}</p>
        <p>{notices.notTransferable}</p>
      </section>

      <section className="balance-gift" aria-labelledby="balance-gift-title">
        <h2 id="balance-gift-title" className="balance-section-title">وحدات الهدية</h2>
        <p>{giftNoticeAr}</p>
      </section>

      {/*
        SEEN, not reasoned about: this room had no way out. A Creator sent here
        by the paywall arrived at a page with four prices and no door — and the
        Empire is a living city, not a funnel. Where the door leads follows who
        is standing in it.
      */}
      <nav className="balance-exit">
        <a href={authenticated ? '/imperial-foyer' : '/'}>
          {authenticated ? '← عُد إلى البهو الإمبراطوري' : '← عُد إلى البوابة'}
        </a>
      </nav>
    </main>
  );
}
