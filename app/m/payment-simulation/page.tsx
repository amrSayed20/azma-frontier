/**
 * AZMA OS — صفحةُ الدفعِ التجريبيّة.
 *
 * ─── WHAT A CREATOR SEES, AND WHAT IT MUST NEVER PRETEND ────────────────────
 *
 *   This is the page a simulated checkout sends a Creator to. It is AZMA's own
 *   page on AZMA's own host — no external gateway is contacted and no card is
 *   ever asked for — and it says so at the top, before the amount, so nobody
 *   can mistake a rehearsal for a charge.
 *
 *   The two buttons do not decide anything by themselves. Each posts the ORDER
 *   ID to `/api/sovereign/economy/simulate-payment`, and the server reads the
 *   pack, the price and the units from its own books, signs the event, and
 *   runs it through the same webhook handler a real XPay callback travels. A
 *   console that posts «succeeded» for somebody else's order is answered 404.
 */

import { Suspense } from 'react';
import PaymentSimulationClient from './PaymentSimulationClient';
import '@/src/imperial-experience-engine/dihliz/dihliz-member-surface.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'محاكاة الدفع | AZMA OS',
  description: 'بيئة اختبار لرحلة الدفع — لا يُخصَم فيها مال.',
};

export default function PaymentSimulationPage() {
  return (
    <Suspense fallback={<main className="pay-sim-shell"><p className="pay-sim-loading">يُحضَّر…</p></main>}>
      <PaymentSimulationClient />
    </Suspense>
  );
}
