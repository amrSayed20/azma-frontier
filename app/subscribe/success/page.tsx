import { cookies } from 'next/headers';
import { verifySession } from '@/src/authentication';
import { getDb, getCreator } from '@/src/persistent-storage';
import { CreatorCreditRepository } from '@/src/economy/credit-ledger/credit-ledger-repository';
import { getXpayPaymentGateway } from '@/src/economy/payment/xpay-payment-gateway';
import { handlePaymentWebhook } from '@/src/economy/payment/payment-webhook-handler';
import { resolveRequestLocale } from '@/src/creator-language/resolve-request-locale';
import { getDictionary, t } from '@/src/creator-language';
import '../../creator-access.css';

const SESSION_COOKIE = 'azma_session';

/**
 * IMPERIAL IDENTITY CONTINUITY (Transition 7): the Empire's first chance
 * to re-establish itself after a necessary departure to the payment
 * gateway's own checkout. Returning here proves nothing about the
 * payment: XPay's redirect carries the transaction UUID, and the page asks
 * XPay itself for that transaction (the same check as the callback, so a
 * slow callback does not leave the Creator waiting) before showing the
 * real balance. Only a transaction this Creator started is checked. Now fully server-rendered — no client-fetch flash of
 * anonymous "Welcome." before the real name resolves, unlike the
 * Chamber's own greeting (a known, disclosed inconsistency from the
 * Simulation Report, corrected here rather than repeated).
 */
type PaymentOutcome = 'credited' | 'pending' | 'failed' | 'unknown';

async function confirmReturningPayment(creatorId: string, transactionUuid: string | undefined): Promise<PaymentOutcome | null> {
  if (!transactionUuid) return null;
  const db = getDb();
  const owned = db
    .prepare("SELECT 1 FROM payment_transactions WHERE provider_id = 'xpay' AND provider_order_id = ? AND creator_id = ?")
    .get(transactionUuid, creatorId);
  const gateway = getXpayPaymentGateway(db);
  if (!owned || !gateway) return null;
  const result = await handlePaymentWebhook(db, gateway, JSON.stringify({ transaction_uuid: transactionUuid }), '');
  if (result.processed) return 'credited';
  if (result.reason.includes('transaction.pending')) return 'pending';
  if (result.reason.includes('transaction.failed')) return 'failed';
  return 'unknown';
}

export default async function SubscribeSuccessPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  const creator = session ? getCreator(getDb(), session.creatorId) : null;
  const rawUuid = (await searchParams).transaction_uuid;
  const outcome = session ? await confirmReturningPayment(session.creatorId, typeof rawUuid === 'string' ? rawUuid : undefined) : null;
  const balance = session ? new CreatorCreditRepository(getDb()).getBalance(session.creatorId) : null;

  const locale = await resolveRequestLocale();
  const dict = getDictionary(locale);

  const subtitle = creator?.displayName
    ? t(dict, 'subscribeSuccess.subtitleNamed', { name: creator.displayName })
    : t(dict, 'subscribeSuccess.subtitleAnonymous');

  return (
    <main className="creator-access-viewport">
      <div className="creator-access-card">
        <p className="creator-access-kicker">{t(dict, 'subscribeSuccess.kicker')}</p>
        <h1 className="creator-access-title">{t(dict, 'subscribeSuccess.title')}</h1>
        <p className="creator-access-subtitle">{subtitle}</p>
        {outcome && (
          <p className={outcome === 'failed' ? 'creator-access-error' : 'creator-access-success'} role="status">
            {t(dict, `subscribeSuccess.outcome.${outcome}`)}
          </p>
        )}
        {balance && (
          <p className="creator-access-balance" role="status">
            {t(dict, 'subscribeSuccess.balance', { units: String(balance.availableUnits) })}
          </p>
        )}
        <a href="/imperial-foyer" className="creator-access-submit" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>
          {t(dict, 'subscribeSuccess.enterButton')}
        </a>
      </div>
    </main>
  );
}
