import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/persistent-storage';
import { getXPayGateway } from '@/src/economy/payment/xpay-payment-gateway';
import { handlePaymentWebhook } from '@/src/economy/payment/payment-webhook-handler';

export const dynamic = 'force-dynamic';

/**
 * POST /api/sovereign/economy/xpay-webhook
 *
 * ─── THIS IS WHERE PAYMENT BECOMES TRUE ─────────────────────────────────────
 *
 *   Not the browser redirect. A Creator can close the tab before returning,
 *   or reach the return URL without having paid at all, so the redirect is a
 *   courtesy to the eye and never evidence. The signed event that arrives
 *   here is the only thing that grants Balance.
 *
 *   The body is read as RAW TEXT and handed on untouched. XPay signs the
 *   bytes it sent; parsing and re-serialising them produces different bytes
 *   and the signature would never match again.
 *
 *   Everything after the signature — the amount, the currency, the Balance
 *   granted — is re-derived from AZMA's own price record inside
 *   handlePaymentWebhook. Nothing a caller sends decides what is granted.
 */
export async function POST(request: NextRequest) {
  // The header name XPay's documentation specifies. Header lookup is
  // case-insensitive, so this matches whatever casing arrives.
  const signature = request.headers.get('xpay-signature');
  if (!signature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
  }

  const gateway = getXPayGateway();
  if (!gateway) {
    // No credentials: nothing is granted and nothing is pretended. A 503 is
    // honest and lets XPay retry once the server is actually configured — a
    // 200 here would tell XPay this event was handled when it was not.
    return NextResponse.json(
      { received: true, processed: false, reason: 'gateway_not_configured' },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  const result = await handlePaymentWebhook(getDb(), gateway, rawBody, signature);

  // An invalid signature is a 400, so a forged call is refused rather than
  // quietly absorbed with a 200.
  if (result.reason === 'signature_invalid') {
    return NextResponse.json({ received: true, processed: false, reason: result.reason }, { status: 400 });
  }

  return NextResponse.json({
    received: true,
    processed: result.processed,
    reason: result.reason,
    ...(result.azmaUnitsGranted !== undefined && { balanceGranted: result.azmaUnitsGranted }),
  });
}
