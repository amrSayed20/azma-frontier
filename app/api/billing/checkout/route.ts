// AZMA OS — Credit-Pack Checkout
// Replaces the old Stripe subscription checkout (src/billing/checkout-service.ts).
// The launch payment path is Paymob (EGP, credit-first economy).
//
// POST /api/billing/checkout
// Body: { packId: one of the approved package ids, successUrl?, cancelUrl? }
// Response: { status: 'succeeded', checkoutUrl: string, pack: { packId, displayName, azmaUnits, priceEgp } }
//         | { status: 'failed', message: string }
//
// Security:
// - Creator authenticated via session cookie before any processing
// - Pack amount and azmaUnits derived server-side from authoritative CREDIT_PACKS — never trusted from client
// - Checkout URL is Paymob's iframe URL — no sensitive data exposed to client beyond the redirect

import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';
import { getDb } from '../../../../src/persistent-storage/db';
import { getCreditPack, VALID_PACK_IDS as PACK_IDS } from '../../../../src/economy/payment/credit-packs';
import { getPaymobPaymentGateway } from '../../../../src/economy/payment/paymob-payment-gateway';
import type { CreditPackId } from '../../../../src/economy/payment/credit-packs';
import { internalReturnPath, returnUrl } from '../../../../src/economy/payment/return-destination';
import { verificationStateForCreator } from '../../../../src/persistent-storage/authentication-identity-repository';
import { isVerified } from '../../../../src/identity/sovereign-identity-contract';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
// ── ONE VOCABULARY, READ FROM THE PRICE RECORD ─────────────────────────────
//   This was a hand-written Set of three ids. When the Founder's final
//   packages replaced them on 2026-09-27 the list did not follow, and this
//   route went on accepting names the price record no longer knew — which is
//   how a checkout surface starts quoting a package that does not exist.
const VALID_PACK_IDS = new Set<CreditPackId>(PACK_IDS);

export async function POST(request: NextRequest) {
  // Authenticate Creator
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', message: 'Sign in to purchase AZMA Units.' },
      { status: 401 },
    );
  }

  // ── The trust point, moved ───────────────────────────────────────────────
  //
  // This gate used to be "a session exists". A session existed the instant
  // anyone POSTed an arbitrary email to /api/auth/signup, so the gate admitted
  // a stranger who had proven nothing. The session check is still necessary and
  // is no longer sufficient: the Empire must hold proof of who is paying.
  //
  // Nothing about the payment itself changed — same gateway, same packs, same
  // server-derived amounts. Only the question asked before reaching them.
  if (!isVerified({ verificationState: verificationStateForCreator(getDb(), session.creatorId) })) {
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'identity-not-verified',
        message: 'وثّق حسابك عبر جوجل قبل الاشتراك.',
        verifyAt: '/api/auth/google/start',
      },
      { status: 403 },
    );
  }

  // Parse request body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const rawPackId = (body as { packId?: unknown })?.packId;
  if (!rawPackId || !VALID_PACK_IDS.has(rawPackId as CreditPackId)) {
    return NextResponse.json(
      { status: 'failed', message: 'Invalid pack selection. Choose: start, create, or achieve.' },
      { status: 400 },
    );
  }

  const packId = rawPackId as CreditPackId;
  const pack = getCreditPack(packId);

  // ── Where the Creator lands afterwards ───────────────────────────────────
  //
  // These were taken from the request body with no check whatsoever, so a
  // crafted checkout could return a Creator — arriving from the payment
  // gateway, at the least suspicious moment there is — to a page an attacker
  // controls. Only an internal PATH is accepted now; the origin is the
  // server's own. See return-destination.ts for why a path, and not a
  // validated URL.
  const origin = request.nextUrl.origin;
  const rawSuccessUrl = (body as { successUrl?: unknown })?.successUrl;
  const rawCancelUrl = (body as { cancelUrl?: unknown })?.cancelUrl;

  for (const [field, raw] of [['successUrl', rawSuccessUrl], ['cancelUrl', rawCancelUrl]] as const) {
    if (raw !== undefined && internalReturnPath(raw) === null) {
      // Never echoed back to the client, and the refusal is silent: the
      // Creator asked to buy credit and still gets to, landing somewhere safe.
      console.warn(`[Checkout] refused external ${field} for creator ${session.creatorId}`);
    }
  }

  const successUrl = returnUrl(origin, rawSuccessUrl);
  const cancelUrl = returnUrl(origin, rawCancelUrl);

  // Resolve Paymob gateway — null if credentials not yet configured
  const db = getDb();
  const gateway = getPaymobPaymentGateway(db);
  if (!gateway) {
    return NextResponse.json(
      {
        status: 'failed',
        message: 'Payment gateway not configured. Please contact support.',
      },
      { status: 503 },
    );
  }

  // Build payment session request — all amounts derived server-side
  const idempotencyKey = randomUUID();
  try {
    const paymentSession = await gateway.createPaymentSession({
      creatorId: session.creatorId,
      packId,
      amountEgp: pack.priceEgp,
      azmaUnits: pack.azmaUnits,
      idempotencyKey,
      successUrl,
      cancelUrl,
    });

    return NextResponse.json({
      status: 'succeeded',
      checkoutUrl: paymentSession.checkoutUrl,
      pack: {
        packId: pack.packId,
        displayName: pack.displayName,
        azmaUnits: pack.azmaUnits,
        priceEgp: pack.priceEgp,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'failed',
        message: error instanceof Error ? error.message : 'Could not initiate payment session.',
      },
      { status: 502 },
    );
  }
}
