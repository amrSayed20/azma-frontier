import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage/db';
import { readXPayCredentials } from '@/src/economy/payment/xpay-payment-gateway';
import { getSimulationGateway } from '@/src/economy/payment/simulation-payment-gateway';
import { handlePaymentWebhook } from '@/src/economy/payment/payment-webhook-handler';
import {
  findPurchaseForCreator,
  settlePurchase,
} from '@/src/economy/payment/purchase-order-repository';
import { CreatorCreditRepository } from '@/src/economy/credit-ledger/credit-ledger-repository';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * POST /api/sovereign/economy/simulate-payment
 *
 * ─── THE ONLY DOOR A SIMULATED PAYMENT MAY ENTER BY ─────────────────────────
 *
 *   The Founder, 2026-10-20: «يجب أن يكون مصدر نجاح العملية التجريبية محددًا
 *   وقابلًا للتدقيق، وألا يستطيع المستخدم العادي منح نفسه رصيدًا عبر تعديل
 *   واجهة المتصفح أو إرسال طلب غير موثوق.»
 *
 *   So nothing here trusts the caller for anything that decides money:
 *
 *     · the SERVER must be running a simulation at all — `AZMA_PAYMENT_
 *       SIMULATION=1` and no live key — or this route does not exist (404);
 *     · the ORDER must be one this session's Creator placed, read from the
 *       Empire's own books by id AND owner;
 *     · the UNITS and the PRICE come from that order, never from the body;
 *     · the event is built and SIGNED here, then verified and fulfilled by the
 *       same `handlePaymentWebhook` a real XPay callback travels — which
 *       re-checks the pack, the amount in piastres, the currency, and grants
 *       through one unique idempotency key.
 *
 *   The body carries one thing the caller is allowed to decide: which outcome
 *   to rehearse. Choosing «failed» grants nothing, which is the point.
 */
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { error: 'unauthorized', messageAr: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  const gateway = getSimulationGateway(readXPayCredentials() !== null);
  if (!gateway) {
    // Not «forbidden» — ABSENT. A server that takes real money, or one that
    // was never told to rehearse, has no such road at all.
    return NextResponse.json(
      { error: 'not_found', messageAr: 'لا توجد محاكاةُ دفعٍ على هذا الخادم.' },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null) as {
    orderId?: unknown;
    outcome?: unknown;
  } | null;
  const orderId = typeof body?.orderId === 'string' ? body.orderId : '';
  const outcome = body?.outcome === 'failed' || body?.outcome === 'cancelled'
    ? body.outcome
    : body?.outcome === 'succeeded' ? 'succeeded' : null;

  if (!orderId || !outcome) {
    return NextResponse.json(
      { error: 'invalid_request', messageAr: 'الطلب غير مكتمل.' },
      { status: 400 },
    );
  }

  const db = getDb();
  const order = findPurchaseForCreator(db, orderId, session.creatorId);
  if (!order) {
    // Absent and not-yours answer alike, so an order id cannot be probed.
    return NextResponse.json(
      { error: 'not_found', messageAr: 'لا يوجد طلبٌ بهذا المعرّف.' },
      { status: 404 },
    );
  }

  const credits = new CreatorCreditRepository(db);
  const balanceBefore = credits.getBalance(session.creatorId).availableUnits;

  // ── A REHEARSED FAILURE, AND NOTHING ELSE HAPPENS ───────────────────────
  if (outcome !== 'succeeded') {
    const moved = settlePurchase(db, order.transactionId, outcome);
    const balanceAfter = credits.getBalance(session.creatorId).availableUnits;
    return NextResponse.json({
      simulation: true,
      outcome,
      orderId: order.transactionId,
      settled: moved,
      unitsGranted: 0,
      balanceBefore,
      balanceAfter,
      messageAr: outcome === 'cancelled'
        ? 'أُلغيت عمليّةُ الدفعِ التجريبيّة. لم تُضَف أيُّ وحدات، ويمكنك المحاولةُ من جديد.'
        : 'لم تنجح عمليّةُ الدفعِ التجريبيّة. لم تُضَف أيُّ وحدات، ويمكنك المحاولةُ من جديد.',
    });
  }

  // ── A REHEARSED SUCCESS, THROUGH THE REAL ROAD ──────────────────────────
  const event = gateway.paidEvent({
    sessionId: order.providerOrderId ?? order.transactionId,
    creatorId: order.creatorId,
    packId: order.packId,
    azmaUnits: order.azmaUnits,
    amountEgp: order.amountEgp,
    idempotencyKey: order.idempotencyKey,
  });
  const signed = gateway.signEvent(event);

  const result = await handlePaymentWebhook(db, gateway, signed.body, signed.signature);
  const balanceAfter = credits.getBalance(session.creatorId).availableUnits;

  // `processed: false, reason: 'duplicate…'` is the ledger refusing to pay
  // twice, which is a correct outcome and not an error. The order is already
  // terminal in that case, so `settled` answers false and says so.
  // The provider's own id for what settled it — here, the simulated session.
  const settled = settlePurchase(
    db, order.transactionId, 'succeeded', order.providerOrderId ?? order.transactionId,
  );

  return NextResponse.json({
    simulation: true,
    outcome: 'succeeded',
    orderId: order.transactionId,
    settled,
    processed: result.processed,
    reason: result.reason,
    packId: order.packId,
    amountEgp: order.amountEgp,
    unitsGranted: balanceAfter - balanceBefore,
    balanceBefore,
    balanceAfter,
    reference: order.idempotencyKey,
    messageAr: balanceAfter > balanceBefore
      ? `نجحت عمليّةُ الدفعِ التجريبيّة. أُضيفت ${order.azmaUnits} وحدة إلى رصيدك.`
      : 'هذه العمليّةُ محسوبةٌ من قبل. لم تُضَف وحداتٌ مرّةً أخرى.',
  });
}
