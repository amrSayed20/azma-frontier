import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifySession } from '../../../../../src/authentication';
import { getCreditPack, resolveStripePriceId } from '../../../../../src/economy/payment/credit-packs';
import { getStripePaymentGateway } from '../../../../../src/economy/payment/stripe-payment-gateway';
import { PaymentSessionError } from '../../../../../src/economy/payment/payment-gateway-contracts';
import type { CreditPackId } from '../../../../../src/economy/payment/credit-packs';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const VALID_PACK_IDS: readonly CreditPackId[] = ['start', 'create', 'achieve'];

// POST /api/sovereign/economy/purchase
// Initiates a one-time credit pack purchase via Stripe Checkout (mode: 'payment').
// Body: { packId: 'start' | 'create' | 'achieve' }
// Returns: { checkoutUrl } — redirect the Creator to this URL.
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const packId = (body as { packId?: unknown })?.packId;

  if (typeof packId !== 'string' || !VALID_PACK_IDS.includes(packId as CreditPackId)) {
    return NextResponse.json({ error: 'invalid_pack_id', valid: VALID_PACK_IDS }, { status: 400 });
  }

  const gateway = getStripePaymentGateway();
  if (!gateway) {
    return NextResponse.json(
      { error: 'payment_gateway_unavailable', message: 'Payment is not configured on this server.' },
      { status: 503 },
    );
  }

  const pack = getCreditPack(packId as CreditPackId);
  const stripePriceId = resolveStripePriceId(packId as CreditPackId);

  if (!stripePriceId) {
    return NextResponse.json(
      { error: 'pack_not_configured', message: `Credit pack '${packId}' is not yet configured in the payment gateway.` },
      { status: 503 },
    );
  }

  const origin = request.headers.get('origin') ?? process.env['NEXT_PUBLIC_BASE_URL'] ?? 'http://localhost:3000';
  const idempotencyKey = `purchase:${session.creatorId}:${packId}:${randomUUID()}`;

  let sessionResponse;
  try {
    sessionResponse = await gateway.createPaymentSession({
      creatorId: session.creatorId,
      packId: pack.packId,
      amountEgp: pack.priceEgp,
      azmaUnits: pack.azmaUnits,
      idempotencyKey,
      successUrl: `${origin}/imperial-foyer?purchase=success&pack=${pack.packId}`,
      cancelUrl: `${origin}/imperial-foyer?purchase=cancelled`,
      metadata: {
        creator_id: session.creatorId,
        pack_id: pack.packId,
        azma_units: String(pack.azmaUnits),
      },
    });
  } catch (err) {
    if (err instanceof PaymentSessionError) {
      return NextResponse.json({ error: 'payment_session_error', message: err.message }, { status: 502 });
    }
    throw err;
  }

  return NextResponse.json({
    checkoutUrl: sessionResponse.checkoutUrl,
    sessionId: sessionResponse.sessionId,
    packId: pack.packId,
    azmaUnits: pack.azmaUnits,
    priceEgp: pack.priceEgp,
    expiresAt: sessionResponse.expiresAt,
  });
}
