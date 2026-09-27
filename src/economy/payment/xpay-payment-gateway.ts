/**
 * AZMA OS — XPay, bound as a payment provider and nothing more.
 *
 * ─── WHERE THIS SITS ────────────────────────────────────────────────────────
 *
 *   AZMA Sovereign Billing → IPaymentGateway → this file → XPay
 *
 *   The arrow never runs the other way. Nothing above this file knows the
 *   word «XPay», no XPay object name crosses the boundary, and the Balance a
 *   Creator holds is denominated in ميزان القيمة السيادي whatever provider is
 *   bound here. Replacing XPay means writing a sibling of this file.
 *
 * ─── THE CONTRACT, READ FROM XPAY'S OWN DOCUMENTATION ───────────────────────
 *
 *   Verified against docs.xpay.app on 2026-09-27 — not from memory, and not
 *   from a tutorial:
 *
 *     POST https://api.xpay.app/checkout/sessions
 *       Authorization: Bearer sk_test_* | sk_live_*
 *       Idempotency-Key: <uuid>                  (replayed, never repeated)
 *       { afterCompletion: { type: 'redirect', redirect: { url } },
 *         lineItems: [{ priceData: { currency, unitAmount, productData },
 *                       quantity }],
 *         metadata }
 *       → { id: 'cs_*', url, amountTotal, currency, status }
 *
 *     Webhook  XPay-Signature: t=<unix>,v1=<hex>
 *              HMAC-SHA256( `${t}.${rawBody}` , whsec_* )
 *              events: checkout.session.completed
 *                      checkout.session.async_payment_succeeded
 *              fulfil only when data.object.paymentStatus === 'paid'
 *
 *   TWO THINGS THE DOCUMENTATION IS EXPLICIT ABOUT, AND THIS FILE OBEYS:
 *
 *   · `unitAmount` is in MINOR UNITS. 149900 is 1,499.00 EGP. Sending pounds
 *     where piastres are expected would undercharge by a hundred times, and
 *     it would look completely normal in every log.
 *
 *   · The signature covers the RAW BYTES. Re-serialising the parsed JSON does
 *     not reproduce what XPay signed, so the raw payload is carried through
 *     untouched and is never round-tripped through JSON.parse first.
 *
 *   · Test and live mode are decided BY THE KEY, not by a URL. One code path
 *     serves both, and the key's own prefix is what says which mode this is.
 */

import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';
import type {
  IPaymentGateway, PaymentSessionRequest, PaymentSessionResponse, WebhookVerificationResult,
} from './payment-gateway-contracts';
import { PaymentSessionError, WebhookSignatureError } from './payment-gateway-contracts';

const XPAY_API = 'https://api.xpay.app';
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;   // documented: sessions expire after 24h
const SIGNATURE_TOLERANCE_SECONDS = 300;      // documented replay window

/** The events that mean money actually arrived. Nothing else fulfils. */
const PAID_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
]);

export interface XPayCredentials {
  readonly secretKey: string;      // sk_test_* | sk_live_*
  readonly webhookSecret: string;  // whsec_*
}

/**
 * Credentials come from the environment and are read at CALL TIME, never at
 * module load, so a key is never captured into a bundle and a deployment can
 * change one without a rebuild.
 */
export function readXPayCredentials(): XPayCredentials | null {
  const secretKey = process.env['XPAY_SECRET_KEY'];
  const webhookSecret = process.env['XPAY_WEBHOOK_SECRET'];
  if (!secretKey || !webhookSecret) return null;
  return { secretKey, webhookSecret };
}

/** Test or live, decided by the key itself — the documented rule. */
export function xpayMode(secretKey: string): 'test' | 'live' | 'unknown' {
  if (secretKey.startsWith('sk_test_')) return 'test';
  if (secretKey.startsWith('sk_live_')) return 'live';
  return 'unknown';
}

export class XPayNotConfiguredError extends Error {
  constructor() {
    super(
      'XPay is not configured: XPAY_SECRET_KEY and XPAY_WEBHOOK_SECRET are absent. ' +
      'No payment can be taken, and none is simulated.',
    );
    this.name = 'XPayNotConfiguredError';
  }
}

interface XPaySessionResponse {
  id?: string;
  url?: string;
  status?: string;
  amountTotal?: number;
  currency?: string;
  error?: { message?: string };
  message?: string;
}

export class XPayPaymentGateway implements IPaymentGateway {
  readonly gatewayId = 'xpay';
  /** EGP is what a Creator is charged, and XPay is an Egyptian processor. */
  readonly supportedCurrencies = ['EGP'] as const;

  constructor(private readonly credentials: XPayCredentials) {}

  /**
   * One Checkout Session. The amount is taken from the request AZMA built
   * from its own price record — this gateway never reads a price from a
   * browser, and has no code that could.
   */
  async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    // MINOR UNITS. 99 EGP is 9900 piastres. Rounded because a fractional
    // piastre is not a thing that can be charged.
    const unitAmount = Math.round(request.amountEgp * 100);
    if (!Number.isFinite(unitAmount) || unitAmount <= 0) {
      throw new PaymentSessionError(this.gatewayId, `refusing a non-positive amount: ${request.amountEgp} EGP`);
    }

    let response: Response;
    try {
      response = await fetch(`${XPAY_API}/checkout/sessions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.credentials.secretKey}`,
          'Content-Type': 'application/json',
          // AZMA's own key, so a retry of the SAME purchase is replayed by
          // XPay rather than creating a second session.
          'Idempotency-Key': request.idempotencyKey || randomUUID(),
        },
        body: JSON.stringify({
          afterCompletion: { type: 'redirect', redirect: { url: request.successUrl } },
          lineItems: [{
            priceData: {
              currency: 'EGP',
              unitAmount,
              productData: { name: request.packId },
            },
            quantity: 1,
          }],
          // Carried back on the webhook. It is EVIDENCE, never authority:
          // the handler re-derives the amount and the Balance from AZMA's own
          // record and refuses if this disagrees.
          metadata: {
            creator_id: request.creatorId,
            pack_id: request.packId,
            azma_units: String(request.azmaUnits),
            idempotency_key: request.idempotencyKey,
            ...(request.metadata ?? {}),
          },
        }),
      });
    } catch (err) {
      throw new PaymentSessionError(this.gatewayId, `could not reach XPay: ${err instanceof Error ? err.message : String(err)}`);
    }

    let body: XPaySessionResponse;
    try { body = await response.json() as XPaySessionResponse; } catch {
      throw new PaymentSessionError(this.gatewayId, `XPay returned a non-JSON response (HTTP ${response.status})`);
    }

    if (!response.ok || !body.id || !body.url) {
      const detail = body.error?.message ?? body.message ?? `HTTP ${response.status}`;
      throw new PaymentSessionError(this.gatewayId, detail);
    }

    return {
      sessionId: body.id,
      checkoutUrl: body.url,
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
  }

  /**
   * Verify, then read. In that order, and never the other way round.
   *
   * The raw bytes are what XPay signed, so they are what is hashed. Nothing
   * in this method parses the body before the signature has been checked.
   */
  async verifyWebhookEvent(payload: string | Buffer, signature: string): Promise<WebhookVerificationResult> {
    const raw = typeof payload === 'string' ? payload : payload.toString('utf8');

    const parts = new Map<string, string>();
    for (const kv of (signature ?? '').split(',')) {
      const i = kv.indexOf('=');
      if (i > 0) parts.set(kv.slice(0, i).trim(), kv.slice(i + 1).trim());
    }
    const timestamp = parts.get('t');
    const provided = parts.get('v1');
    if (!timestamp || !provided) {
      throw new WebhookSignatureError(this.gatewayId, new Error('XPay-Signature header is missing t or v1'));
    }

    // Replay protection, the documented 5-minute window.
    const skew = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(skew) || skew > SIGNATURE_TOLERANCE_SECONDS) {
      throw new WebhookSignatureError(this.gatewayId, new Error(`timestamp outside the ${SIGNATURE_TOLERANCE_SECONDS}s tolerance`));
    }

    const expected = createHmac('sha256', this.credentials.webhookSecret)
      .update(`${timestamp}.${raw}`)
      .digest('hex');

    const a = Buffer.from(provided, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    // timingSafeEqual throws on a length mismatch, so length is checked first
    // — and a wrong length is a wrong signature either way.
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new WebhookSignatureError(this.gatewayId, new Error('signature does not match'));
    }

    // Only now is the body read.
    let event: {
      type?: string;
      data?: { object?: {
        id?: string; paymentStatus?: string; amountTotal?: number; currency?: string;
        metadata?: Record<string, string>; paymentIntent?: { id?: string };
      } };
    };
    try { event = JSON.parse(raw); } catch {
      throw new WebhookSignatureError(this.gatewayId, new Error('signed payload is not JSON'));
    }

    const session = event.data?.object ?? {};
    const isPaid = PAID_EVENTS.has(event.type ?? '') && session.paymentStatus === 'paid';

    return {
      verified: true,
      // NORMALISED to AZMA's own word. The billing boundary above must never
      // have to know what XPay calls its objects — that is the dependency the
      // Sovereign Architecture forbids, and emitting XPay's own event name
      // here would have created it quietly.
      //
      // An event that is not a completed, PAID checkout is reported under a
      // type the handler ignores: a signed event is not a paid one.
      eventType: isPaid ? 'payment.succeeded' : `unfulfilled:${event.type ?? 'unknown'}`,
      // The session id is the fulfilment key XPay's own documentation names.
      paymentIntentId: session.id ?? session.paymentIntent?.id ?? '',
      metadata: session.metadata ?? {},
      // Minor units, exactly as received. Converted by the handler, which is
      // where AZMA's own price record lives to compare it against.
      amountReceived: typeof session.amountTotal === 'number' ? session.amountTotal : 0,
      currency: (session.currency ?? '').toUpperCase(),
    };
  }
}

/** The bound gateway, or null when no credentials exist. Never a fake. */
export function getXPayGateway(): XPayPaymentGateway | null {
  const credentials = readXPayCredentials();
  return credentials ? new XPayPaymentGateway(credentials) : null;
}
