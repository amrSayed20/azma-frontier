import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '../../../../../src/persistent-storage';
import { getStripePaymentGateway } from '../../../../../src/economy/payment/stripe-payment-gateway';
import { handlePaymentWebhook } from '../../../../../src/economy/payment/payment-webhook-handler';

export const dynamic = 'force-dynamic';

// POST /api/sovereign/economy/payment-webhook
// Stripe sends payment events here. Signature is verified before any action.
// This handler is idempotent — replaying the same event produces the same result.
// Raw body is required for Stripe signature verification — do NOT parse as JSON first.
export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
  }

  const gateway = getStripePaymentGateway();
  if (!gateway) {
    // Webhook received but gateway not configured — return 200 to prevent Stripe retries
    // that will never succeed. Log this condition.
    console.error('[payment-webhook] Stripe gateway not configured — cannot process webhook');
    return NextResponse.json({ received: true, processed: false, reason: 'gateway_not_configured' });
  }

  // Read raw bytes — required for webhook signature verification
  const rawBody = await request.text();

  const db = getDb();
  const result = await handlePaymentWebhook(db, gateway, rawBody, signature);

  return NextResponse.json({
    received: true,
    processed: result.processed,
    reason: result.reason,
    ...(result.creatorId && { creatorId: result.creatorId }),
    ...(result.azmaUnitsGranted !== undefined && { azmaUnitsGranted: result.azmaUnitsGranted }),
  });
}
