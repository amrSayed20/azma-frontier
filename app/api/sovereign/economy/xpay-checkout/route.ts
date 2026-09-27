import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifySession } from '@/src/authentication';
import { getCreditPack, VALID_PACK_IDS } from '@/src/economy/payment/credit-packs';
import { getXPayGateway } from '@/src/economy/payment/xpay-payment-gateway';
import { PaymentSessionError } from '@/src/economy/payment/payment-gateway-contracts';
import { BALANCE_PRICING_APPROVED } from '@/src/economy/pricing/sovereign-value-balance';
import { getDb } from '@/src/persistent-storage/db';
import { verificationStateForCreator } from '@/src/persistent-storage/authentication-identity-repository';
import { isVerified } from '@/src/identity/sovereign-identity-contract';
import { returnUrl } from '@/src/economy/payment/return-destination';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';


/**
 * POST /api/sovereign/economy/xpay-checkout
 *
 * ─── THE PRICE COMES FROM AZMA, NEVER FROM THE CALLER ───────────────────────
 *
 *   The body carries a pack ID and nothing else that matters. The amount, the
 *   currency and the Balance are read from the Empire's own price record. A
 *   caller who sends an amount is ignored, because there is no field here
 *   that would receive one — which is a stronger guarantee than validating
 *   one would be.
 *
 * ─── AND NOTHING IS SOLD AT AN UNAPPROVED PRICE ─────────────────────────────
 *
 *   `BALANCE_PRICING_APPROVED` is false until the Founder ratifies the
 *   consumption and package table. While it is false this route refuses.
 *   A price that quietly works before anyone approved it is the failure this
 *   gate exists to prevent: nobody discovers it until a Creator has already
 *   been charged by it.
 */
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  /**
   * ─── A SESSION IS NOT AN IDENTITY ─────────────────────────────────────────
   *
   *   FOUND 2026-09-27 reading this route beside the one it replaced: the
   *   Paymob checkout it supersedes asks TWO questions before money — is
   *   there a session, and does the Empire hold proof of who is paying. This
   *   one asked only the first, and a session exists the instant anyone POSTs
   *   an arbitrary email to /api/auth/signup. So the newer, sanctioned path
   *   was the weaker one: the guard the Empire had already paid for did not
   *   travel with the gateway when the gateway was replaced.
   *
   *   It travels now. The question is identical to the older route's, because
   *   it is the same question.
   */
  if (!isVerified({ verificationState: verificationStateForCreator(getDb(), session.creatorId) })) {
    return NextResponse.json(
      {
        error: 'identity_not_verified',
        messageAr: 'وثّق حسابك عبر جوجل قبل الشراء.',
        verifyAt: '/api/auth/google/start',
      },
      { status: 403 },
    );
  }

  if (!BALANCE_PRICING_APPROVED) {
    return NextResponse.json(
      {
        error: 'pricing_not_approved',
        messageAr: 'التسعير لم يُعتمد بعد. لا يمكن إتمام أي عملية شراء.',
      },
      { status: 503 },
    );
  }

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const packId = (body as { packId?: unknown })?.packId;
  if (typeof packId !== 'string' || !VALID_PACK_IDS.includes(packId)) {
    return NextResponse.json({ error: 'invalid_pack_id', valid: VALID_PACK_IDS }, { status: 400 });
  }

  const gateway = getXPayGateway();
  if (!gateway) {
    return NextResponse.json(
      { error: 'payment_gateway_unavailable', messageAr: 'الدفع غير مُهيّأ على هذا الخادم.' },
      { status: 503 },
    );
  }

  // AZMA's own record. This is the only source of the amount.
  const pack = getCreditPack(packId);

  // ── AND THE LANDING PLACE IS OURS, NOT THE CALLER'S ──────────────────────
  //   This read the `Origin` HEADER, which is the caller's to write. A crafted
  //   checkout could therefore hand XPay a success URL on another host, and
  //   the Creator would arrive there straight from a real payment — the moment
  //   a person is least suspicious. The Empire already owns the rule for this
  //   (return-destination.ts); it simply was not applied here.
  //
  //   `nextUrl.origin` is the server's own view of the request, and the path
  //   is an internal one this route names itself.
  const origin = request.nextUrl.origin;
  // One key per logical purchase, so a retried press is replayed by XPay
  // rather than opening a second session for the same intent.
  const idempotencyKey = `purchase:${session.creatorId}:${packId}:${randomUUID()}`;

  try {
    const created = await gateway.createPaymentSession({
      creatorId: session.creatorId,
      packId: pack.packId,
      amountEgp: pack.priceEgp,
      azmaUnits: pack.azmaUnits,
      idempotencyKey,
      successUrl: returnUrl(origin, '/sovereign-balance?paid=1'),
      cancelUrl: returnUrl(origin, '/sovereign-balance'),
    });

    return NextResponse.json({
      checkoutUrl: created.checkoutUrl,
      expiresAt: created.expiresAt,
      // What the Creator is buying, in the Empire's own terms. No provider
      // name, no provider unit, no cost.
      packageNameAr: pack.displayName,
      priceEgp: pack.priceEgp,
    });
  } catch (err) {
    if (err instanceof PaymentSessionError) {
      return NextResponse.json(
        { error: 'payment_session_failed', messageAr: 'تعذّر فتح صفحة الدفع. لم يُخصم شيء.' },
        { status: 502 },
      );
    }
    throw err;
  }
}
