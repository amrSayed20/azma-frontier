'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import './payment-simulation.css';

interface Settlement {
  readonly outcome: string;
  readonly unitsGranted: number;
  readonly balanceBefore: number;
  readonly balanceAfter: number;
  readonly reference?: string;
  readonly orderId?: string;
  readonly messageAr: string;
  readonly processed?: boolean;
}

/**
 * The rehearsal, as a Creator meets it.
 *
 * Every number shown here comes back from the server's own answer — the units
 * granted, the balance before and after, the reference. Nothing is computed in
 * this file, because a page that computes a balance is a page that can show a
 * balance nobody has.
 */
export default function PaymentSimulationClient() {
  const params = useSearchParams();
  const router = useRouter();
  const [working, setWorking] = useState<string | null>(null);
  const [settled, setSettled] = useState<Settlement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const orderId = params.get('session') ?? '';
  const packId = params.get('pack') ?? '';
  const units = Number(params.get('units') ?? 0);
  const egp = Number(params.get('egp') ?? 0);
  const successUrl = params.get('success') ?? '/sovereign-balance';

  const PACK_NAMES: Record<string, string> = {
    asas: 'الأساس', irtiqaa: 'الارتقاء', ihtiraf: 'الاحتراف', riyada: 'الريادة',
  };

  const settle = async (outcome: 'succeeded' | 'failed' | 'cancelled') => {
    setWorking(outcome);
    setError(null);
    try {
      const res = await fetch('/api/sovereign/economy/simulate-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, outcome }),
      });
      const body = await res.json() as Settlement & { messageAr?: string; error?: string };
      if (!res.ok) {
        setError(body.messageAr ?? 'تعذّر إتمام المحاكاة.');
        return;
      }
      setSettled(body);
    } catch {
      setError('تعذّر الوصول إلى الخادم. أعد المحاولة.');
    } finally {
      setWorking(null);
    }
  };

  return (
    <main className="pay-sim-shell" dir="rtl">
      <section className="pay-sim-card" data-testid="payment-simulation">
        {/* The first thing read, before the amount: this is not a charge. */}
        <div className="pay-sim-banner" data-testid="pay-sim-banner">
          ⚠ بيئةُ اختبار — محاكاةُ دفع. لا يُخصَم أيُّ مبلغٍ حقيقيّ، ولا تُطلَب أيُّ بطاقة.
        </div>

        <h1 className="pay-sim-title">مراجعةُ الطلب</h1>

        <dl className="pay-sim-summary">
          <div><dt>الباقة</dt><dd data-testid="pay-sim-pack">{PACK_NAMES[packId] ?? packId}</dd></div>
          <div><dt>الوحدات</dt><dd data-testid="pay-sim-units">{units.toLocaleString('ar-EG')} وحدة</dd></div>
          <div><dt>السعر</dt><dd data-testid="pay-sim-price">{egp.toLocaleString('ar-EG')} جنيهاً مصريّاً</dd></div>
          <div><dt>حالةُ الطلب</dt><dd>{settled ? 'مُنتهٍ' : 'بانتظارِ الدفع'}</dd></div>
          <div><dt>رقمُ الطلب</dt><dd className="pay-sim-mono">{orderId}</dd></div>
        </dl>

        {!settled && (
          <>
            <p className="pay-sim-note">
              اختر نتيجةَ الدفعِ التي تريد تجربتَها. النتيجةُ تُحسَم على الخادم، لا في هذه الصفحة.
            </p>
            <div className="pay-sim-actions">
              <button
                type="button"
                className="pay-sim-btn pay-sim-btn-pay"
                data-testid="pay-sim-succeed"
                disabled={working !== null}
                onClick={() => void settle('succeeded')}
              >
                {working === 'succeeded' ? '⏳ يُعالَج…' : '✔ ادفع (محاكاةُ نجاح)'}
              </button>
              <button
                type="button"
                className="pay-sim-btn pay-sim-btn-fail"
                data-testid="pay-sim-fail"
                disabled={working !== null}
                onClick={() => void settle('failed')}
              >
                {working === 'failed' ? '⏳ يُعالَج…' : '✖ محاكاةُ فشلِ الدفع'}
              </button>
              <button
                type="button"
                className="pay-sim-btn pay-sim-btn-cancel"
                data-testid="pay-sim-cancel"
                disabled={working !== null}
                onClick={() => void settle('cancelled')}
              >
                ↩ إلغاء
              </button>
            </div>
          </>
        )}

        {error && <p className="pay-sim-error" data-testid="pay-sim-error">{error}</p>}

        {settled && (
          <div
            className={`pay-sim-result ${settled.unitsGranted > 0 ? 'pay-sim-ok' : 'pay-sim-no'}`}
            data-testid="pay-sim-result"
          >
            <p className="pay-sim-result-line">{settled.messageAr}</p>
            <dl className="pay-sim-summary">
              <div><dt>الوحداتُ المضافة</dt><dd data-testid="pay-sim-granted">{settled.unitsGranted.toLocaleString('ar-EG')}</dd></div>
              <div><dt>الرصيدُ السابق</dt><dd data-testid="pay-sim-before">{settled.balanceBefore.toLocaleString('ar-EG')}</dd></div>
              <div><dt>الرصيدُ الجديد</dt><dd data-testid="pay-sim-after">{settled.balanceAfter.toLocaleString('ar-EG')}</dd></div>
              {settled.reference && (
                <div><dt>الرقمُ المرجعيّ</dt><dd className="pay-sim-mono" data-testid="pay-sim-reference">{settled.reference}</dd></div>
              )}
            </dl>
            <div className="pay-sim-actions">
              <button
                type="button"
                className="pay-sim-btn pay-sim-btn-pay"
                data-testid="pay-sim-to-balance"
                onClick={() => router.push(successUrl.startsWith('/') ? successUrl : '/sovereign-balance')}
              >
                ◆ إلى ميزانِ القيمة
              </button>
              {settled.unitsGranted === 0 && (
                <button
                  type="button"
                  className="pay-sim-btn pay-sim-btn-cancel"
                  data-testid="pay-sim-retry"
                  onClick={() => router.push('/sovereign-balance')}
                >
                  ↻ أعد المحاولة من الباقات
                </button>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
