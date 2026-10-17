// AZMA OS — Credit-Pack Checkout
// Replaces the old Stripe subscription checkout (src/billing/checkout-service.ts).
// The launch payment path is Paymob (EGP, credit-first economy).
//
// POST /api/billing/checkout
// Body: { packId: 'start' | 'create' | 'achieve', successUrl?: string, cancelUrl?: string }
// Response: { status: 'succeeded', checkoutUrl: string, pack: { packId, displayName, azmaUnits, priceEgp } }
//         | { status: 'failed', reason: 'unauthorized' | 'invalid-pack' | 'gateway-unavailable' | 'gateway-error', message: string }
// `reason` is what the page translates; `message` stays for logs and API callers.
//
// Security:
// - Creator authenticated via session cookie before any processing
// - Pack amount and azmaUnits derived server-side from authoritative CREDIT_PACKS — never trusted from client
// - Checkout URL is Paymob's iframe URL — no sensitive data exposed to client beyond the redirect

import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../src/authentication';
import { getDb } from '../../../../src/persistent-storage/db';
import { getCreator } from '../../../../src/persistent-storage/creator-repository';
import { getCreditPack } from '../../../../src/economy/payment/credit-packs';
import { getPaymobPaymentGateway } from '../../../../src/economy/payment/paymob-payment-gateway';
import type { CreditPackId } from '../../../../src/economy/payment/credit-packs';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const VALID_PACK_IDS = new Set<CreditPackId>(['start', 'create', 'achieve']);

/** A return URL must stay on this site; anything else falls back to `fallback`. */
function sameOriginUrl(raw: unknown, origin: string, fallback: string): string {
  if (typeof raw !== 'string') return fallback;
  try {
    const url = new URL(raw, origin);
    return url.origin === origin ? url.toString() : fallback;
  } catch {
    return fallback;
  }
}

export async function POST(request: NextRequest) {
  // Authenticate Creator
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to purchase AZMA Units.' },
      { status: 401 },
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
      { status: 'failed', reason: 'invalid-pack', message: 'Invalid pack selection. Choose: start, create, or achieve.' },
      { status: 400 },
    );
  }

  const packId = rawPackId as CreditPackId;
  const pack = getCreditPack(packId);

  // Resolve URLs — default to sovereign-vault-palace (natural post-purchase destination)
  const origin = request.nextUrl.origin;
  const rawSuccessUrl = (body as { successUrl?: unknown })?.successUrl;
  const rawCancelUrl = (body as { cancelUrl?: unknown })?.cancelUrl;
  const successUrl = sameOriginUrl(rawSuccessUrl, origin, `${origin}/sovereign-vault-palace`);
  const cancelUrl = sameOriginUrl(rawCancelUrl, origin, `${origin}/sovereign-vault-palace`);

  // Resolve Paymob gateway — null if credentials not yet configured
  const db = getDb();
  const gateway = getPaymobPaymentGateway(db);
  if (!gateway) {
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'gateway-unavailable',
        message: 'Payment gateway not configured. Please contact support.',
      },
      { status: 503 },
    );
  }

  // Build payment session request — all amounts derived server-side
  const idempotencyKey = randomUUID();
  const creator = getCreator(db, session.creatorId);
  try {
    const paymentSession = await gateway.createPaymentSession({
      creatorId: session.creatorId,
      packId,
      amountEgp: pack.priceEgp,
      azmaUnits: pack.azmaUnits,
      idempotencyKey,
      successUrl,
      cancelUrl,
      customerEmail: creator?.email ?? undefined,
      customerName: creator?.displayName ?? undefined,
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
        reason: 'gateway-error',
        message: error instanceof Error ? error.message : 'Could not initiate payment session.',
      },
      { status: 502 },
    );
  }
}
