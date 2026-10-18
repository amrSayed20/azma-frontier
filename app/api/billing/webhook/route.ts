// AZMA OS — XPay Payment Callback Receiver
// The approved launch gateway is XPay (EGP, credit-first economy).
//
// POST /api/billing/webhook — set as the "Callback url" of the API Payment
// in the XPay dashboard. XPay posts a JSON body with the transaction UUID
// (under "transaction_id") and its status after the customer pays.
//
// XPay documents no signature on this callback, so nothing in the body is
// trusted: only its UUID is read, and only a UUID this server created leads
// to a call back to XPay, which reports the transaction's real status and
// amount (see XpayPaymentGateway.verifyTransaction).
//
// Security invariants:
// - Units granted only for status SUCCESSFUL re-read from XPay with the API key
// - Idempotent: replayed callbacks produce no additional credit grants
// - Creator identity derived from payment_transactions, never from the body
// - Amount checked against the order this server created

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../src/persistent-storage/db';
import { getXpayPaymentGateway } from '../../../../src/economy/payment/xpay-payment-gateway';
import { handlePaymentWebhook } from '../../../../src/economy/payment/payment-webhook-handler';

export const dynamic = 'force-dynamic';

/** A callback is a small JSON note; anything larger is not from XPay. */
const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  if (Buffer.byteLength(rawBody, 'utf-8') > MAX_BODY_BYTES) {
    return NextResponse.json({ status: 'failed', message: 'Callback too large.' }, { status: 413 });
  }
  try {
    JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { status: 'failed', message: 'Invalid callback payload: not valid JSON.' },
      { status: 400 },
    );
  }

  const db = getDb();
  const gateway = getXpayPaymentGateway(db);
  if (!gateway) {
    // Gateway not configured — nothing can be verified. 200 so XPay does not retry forever.
    return NextResponse.json({ status: 'skipped', message: 'Gateway not configured.' });
  }

  // XPay has no signature to pass; verification is the re-read from XPay.
  const result = await handlePaymentWebhook(db, gateway, rawBody, '');

  // Always 200 to XPay — the result body is for internal audit logs only.
  return NextResponse.json({ status: 'received', ...result });
}
