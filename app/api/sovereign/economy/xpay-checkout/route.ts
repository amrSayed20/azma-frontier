import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifySession } from '@/src/authentication';
import { getCreditPack, VALID_PACK_IDS } from '@/src/economy/payment/credit-packs';
import { getXPayGateway, readXPayCredentials } from '@/src/economy/payment/xpay-payment-gateway';
import { getSimulationGateway } from '@/src/economy/payment/simulation-payment-gateway';
import { recordInitiatedPurchase } from '@/src/economy/payment/purchase-order-repository';
import { PaymentSessionError } from '@/src/economy/payment/payment-gateway-contracts';
import { BALANCE_PRICING_APPROVED } from '@/src/economy/pricing/sovereign-value-balance';
import { getDb } from '@/src/persistent-storage/db';
import { verificationStateForCreator } from '@/src/persistent-storage/authentication-identity-repository';
import { isVerified } from '@/src/identity/sovereign-identity-contract';
import { returnUrl } from '@/src/economy/payment/return-destination';
// The address the Empire answers on, declared once beside the OAuth binding
// that learned this lesson first. A constant, so no request can move it.
import { PUBLIC_ORIGIN } from '@/app/api/auth/google/start/route';

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

  // ── WHICH GATEWAY, AND WHY A SIMULATION IS NEVER A SILENT SUBSTITUTE ─────
  //
  //   The real one when a credential exists — and nothing else is tried in
  //   that case, so a host that can take money never invents it.
  //
  //   Otherwise, and ONLY when this server's own environment says
  //   `AZMA_PAYMENT_SIMULATION=1`, the simulation: a gateway that charges
  //   nobody, says so on its own page, and reaches the ledger through the very
  //   same webhook handler a real payment travels. A host that sets nothing
  //   still answers «الدفع غير مُهيّأ», exactly as before.
  // ── AN OPERATOR WHO INSTALLED THE WRONG KIND OF KEY IS TOLD WHY ─────────
  //
  //   MEASURED 2026-10-20 against the real API with a publishable test key:
  //   `POST /checkout/sessions` answered 403 `permission_denied` — «Required:
  //   CHECKOUT_SESSIONS_WRITE». The key authenticates; it simply may not open
  //   a session. So the binding treats a non-`sk_` key as no key, and the
  //   reason is said HERE, in the server's log, because the gateway module is
  //   forbidden to print anything at all.
  const rawKey = process.env['XPAY_SECRET_KEY'];
  if (rawKey && !rawKey.startsWith('sk_test_') && !rawKey.startsWith('sk_live_')) {
    console.error(
      '[Economy] XPAY_SECRET_KEY is present but is not a secret key (expected sk_test_… or sk_live_…). '
      + 'A publishable key authenticates and lacks CHECKOUT_SESSIONS_WRITE, so the purchase road stays shut '
      + 'rather than opening onto a refusal the Creator would meet after deciding to buy.',
    );
  }

  const liveGateway = getXPayGateway();
  const simulated = liveGateway ? null : getSimulationGateway(readXPayCredentials() !== null);
  const gateway = liveGateway ?? simulated;
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
  //   But the server's own view of the request is not the Empire's address.
  //   MEASURED on production 2026-10-30, on a payment that fully succeeded:
  //   the card was authorised, 3-D Secure passed, the webhook credited 1,375
  //   units — and XPay returned the Creator to
  //
  //       http://localhost:3000/sovereign-balance?paid=1
  //
  //   where their browser showed ERR_CONNECTION_REFUSED. Behind nginx,
  //   `nextUrl.origin` is the private origin Next.js was proxied to. The whole
  //   purchase worked and the last instruction sent the Creator nowhere — at
  //   the one moment they most need to see that their money arrived.
  //
  //   This is the SAME fault, in the same shape, that the Google callback
  //   already carries a warning about: the lesson was written there and never
  //   applied here. PUBLIC_ORIGIN is the address the Empire answers on, and it
  //   is a constant, so no request can move it.
  const origin = PUBLIC_ORIGIN;
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

    // ── THE ORDER, WRITTEN BEFORE ANYONE PAYS ────────────────────────────
    //
    //   Until now the XPay road recorded nothing at this point: the first row
    //   in the Empire's books appeared only when money arrived. So a Creator
    //   who opened a payment page and came back had no order to point at, and
    //   nothing tied a session id to a person, a pack and a price.
    //
    //   `payment_transactions` already holds exactly these columns — the
    //   superseded Paymob road wrote them — so no table and no column is
    //   added. The row is born `initiated` and is moved by the outcome.
    recordInitiatedPurchase(getDb(), {
      creatorId: session.creatorId,
      packId: pack.packId,
      azmaUnits: pack.azmaUnits,
      amountEgp: pack.priceEgp,
      idempotencyKey,
      providerId: gateway.gatewayId,
      providerOrderId: created.sessionId,
    });

    return NextResponse.json({
      checkoutUrl: created.checkoutUrl,
      expiresAt: created.expiresAt,
      // What the Creator is buying, in the Empire's own terms. No provider
      // name, no provider unit, no cost.
      packageNameAr: pack.displayName,
      priceEgp: pack.priceEgp,
      azmaUnits: pack.azmaUnits,
      orderId: created.sessionId,
      // Said plainly, so no surface can show a simulated purchase as a real
      // one by omission.
      simulation: simulated !== null,
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
