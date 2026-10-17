// AZMA OS — Paymob Payment Webhook Receiver
// Replaces the old Stripe webhook handler (src/billing/webhook-service.ts).
// The launch payment path is Paymob (EGP, credit-first economy).
//
// POST /api/billing/webhook
// Paymob sends a JSON payload with type='TRANSACTION' and an obj containing
// the transaction details. Paymob's documentation puts the HMAC of the
// processed callback in the callback URL's `hmac` query parameter, not in a
// header; obj.hmac in the body is accepted as a fallback.
//
// Security invariants:
// - HMAC-SHA512 verified before any data is trusted
// - Credits granted ONLY after verified successful payment event
// - Idempotent: replayed events produce no additional credit grants
// - Creator identity derived from payment_transactions lookup, never from client
// - Amount/pack derived from authoritative pack definition, never from webhook payload alone

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../src/persistent-storage/db';
import { getPaymobPaymentGateway } from '../../../../src/economy/payment/paymob-payment-gateway';
import { handlePaymentWebhook } from '../../../../src/economy/payment/payment-webhook-handler';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  let parsedForHmac: { obj?: { hmac?: unknown } };
  try {
    parsedForHmac = JSON.parse(rawBody) as { obj?: { hmac?: unknown } };
  } catch {
    return NextResponse.json(
      { status: 'failed', message: 'Invalid webhook payload: not valid JSON.' },
      { status: 400 },
    );
  }

  const hmac = request.nextUrl.searchParams.get('hmac') || parsedForHmac.obj?.hmac;
  if (typeof hmac !== 'string' || !hmac) {
    return NextResponse.json(
      { status: 'failed', message: 'Missing HMAC in webhook query or payload.' },
      { status: 400 },
    );
  }

  const db = getDb();
  const gateway = getPaymobPaymentGateway(db);
  if (!gateway) {
    // Gateway not configured — cannot verify or process. Return 200 to prevent
    // Paymob from retrying indefinitely (retries would all fail the same way).
    return NextResponse.json({ status: 'skipped', message: 'Gateway not configured.' });
  }

  const result = await handlePaymentWebhook(db, gateway, rawBody, hmac);

  // Always return 200 to Paymob — non-2xx triggers retry storms.
  // The result body is for internal audit logs only.
  return NextResponse.json({ status: 'received', ...result });
}
