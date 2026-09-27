import { cookies } from 'next/headers';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage';
import { CreatorCreditRepository } from '@/src/economy/credit-ledger/credit-ledger-repository';
import { verificationStateForCreator } from '@/src/persistent-storage/authentication-identity-repository';
import { isVerified } from '@/src/identity/sovereign-identity-contract';
import { getXPayGateway } from '@/src/economy/payment/xpay-payment-gateway';
import {
  creatorFacingPackages,
  BALANCE_NOTICES_AR,
  GIFT_BALANCE,
  SOVEREIGN_VALUE_BALANCE,
  BALANCE_PRICING_APPROVED,
} from '@/src/economy/pricing/sovereign-value-balance';
import { SovereignBalanceClient } from './SovereignBalanceClient';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * AZMA OS — ميزان القيمة السيادي · the Creator's own Balance.
 *
 * ─── WHY THIS PAGE EXISTS, AND WHY IT IS A SERVER COMPONENT ─────────────────
 *
 *   FOUND 2026-09-27: the Founder's four approved packages existed in the
 *   repository and on NO surface in the Empire. The one purchase page that did
 *   exist — /subscribe — sold a single plan that is not among the four, through
 *   a payment provider the Founder had already replaced. The repository is the
 *   sole UI authority, and what it authorised was unreachable while what it no
 *   longer authorised was one click away.
 *
 *   It is a Server Component because the pricing module imports the cost-truth
 *   table: provider credit rates, the dollar acquisition cost, the FX rate.
 *   A `'use client'` import of it would publish the Empire's provider costs
 *   inside a JavaScript bundle any visitor can open. Only
 *   `creatorFacingPackages()` — four names, prices, balances and an Arabic
 *   validity — crosses to the browser.
 *
 * ─── AND WHY IT DOES NOT DEMAND A SESSION ───────────────────────────────────
 *
 *   The Founder, 2026-09-27: «تعرض الباقات فى نهايه رحله الزائر وليس بعد
 *   تسجيل الدخول». A visitor may read what the Empire's power costs. Only the
 *   purchase itself needs an identity, and the page says which is which
 *   instead of turning a reader away at the door.
 */
export default async function SovereignBalancePage() {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  const db = session ? getDb() : null;
  const balance = session && db
    ? new CreatorCreditRepository(db).getBalance(session.creatorId)
    : null;
  const identityVerified = session && db
    ? isVerified({ verificationState: verificationStateForCreator(db, session.creatorId) })
    : false;

  /**
   * Whether a press can actually open a payment page.
   *
   * MEASURED, not assumed: the checkout route refuses with
   * `payment_gateway_unavailable` while no gateway secret exists on this
   * server, and today none does. A button that cannot work is not offered as
   * though it could — the Empire says the door is shut rather than letting a
   * Creator discover it by pressing.
   */
  const purchaseAvailable = BALANCE_PRICING_APPROVED && getXPayGateway() !== null;

  return (
    <SovereignBalanceClient
      packages={creatorFacingPackages()}
      unitNameAr={SOVEREIGN_VALUE_BALANCE.nameAr}
      notices={BALANCE_NOTICES_AR}
      giftNoticeAr={GIFT_BALANCE.noticeAr}
      availableUnits={balance?.availableUnits ?? null}
      authenticated={!!session}
      identityVerified={identityVerified}
      purchaseAvailable={purchaseAvailable}
    />
  );
}
