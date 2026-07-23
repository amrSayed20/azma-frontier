import { NextRequest, NextResponse } from 'next/server';
import { verifyWebhookSignature, handleWebhookEvent } from '../../../../src/billing';

export const dynamic = 'force-dynamic';

/**
 * Reads the RAW request body — required for Stripe's signature
 * verification, which computes an HMAC over the exact bytes Stripe
 * sent. Calling request.json() here would consume/reparse the stream
 * and break verification.
 */
export async function POST(request: NextRequest) {
  const signatureHeader = request.headers.get('stripe-signature');
  if (!signatureHeader) {
    return NextResponse.json({ status: 'failed', message: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const rawBody = await request.text();

  let event;
  try {
    event = verifyWebhookSignature(rawBody, signatureHeader);
  } catch (error) {
    return NextResponse.json(
      { status: 'failed', message: error instanceof Error ? error.message : 'Invalid webhook signature.' },
      { status: 400 },
    );
  }

  handleWebhookEvent(event);
  return NextResponse.json({ status: 'succeeded' });
}
