import Stripe from 'stripe';
import type {
  IPaymentGateway,
  PaymentSessionRequest,
  PaymentSessionResponse,
  WebhookVerificationResult,
} from './payment-gateway-contracts';
import {
  GatewayEgpUnsupportedError,
  PaymentSessionError,
  WebhookSignatureError,
} from './payment-gateway-contracts';

// Stripe supports EGP (Egyptian Pound) as a zero-decimal currency.
// Amounts in EGP must be passed as whole piastres (100 piastres = 1 EGP).
// Stripe currency code: 'egp'.
const STRIPE_SUPPORTED_CURRENCIES = ['egp', 'usd', 'eur'] as const;
const EGP_CURRENCY_CODE = 'egp';

// EGP is zero-decimal in some regions but Stripe treats it as 2-decimal.
// 99 EGP = 9900 in Stripe's smallest unit (piastres).
const EGP_TO_SMALLEST_UNIT = 100;

export class StripePaymentGateway implements IPaymentGateway {
  readonly gatewayId = 'stripe';
  readonly supportedCurrencies = STRIPE_SUPPORTED_CURRENCIES;

  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor(secretKey: string, webhookSecret: string) {
    this.stripe = new Stripe(secretKey, { apiVersion: '2026-06-24.dahlia' });
    this.webhookSecret = webhookSecret;

    if (!STRIPE_SUPPORTED_CURRENCIES.includes(EGP_CURRENCY_CODE as never)) {
      throw new GatewayEgpUnsupportedError(this.gatewayId);
    }
  }

  async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    const amountInPiastres = Math.round(request.amountEgp * EGP_TO_SMALLEST_UNIT);

    let session: Stripe.Checkout.Session;
    try {
      session = await this.stripe.checkout.sessions.create({
        mode: 'payment', // one-time, NOT subscription
        currency: EGP_CURRENCY_CODE,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: EGP_CURRENCY_CODE,
              unit_amount: amountInPiastres,
              product_data: {
                name: `AZMA Units — ${request.azmaUnits} units`,
                description: `Credit pack: ${request.packId}`,
                metadata: {
                  pack_id: request.packId,
                  azma_units: String(request.azmaUnits),
                },
              },
            },
          },
        ],
        payment_intent_data: {
          metadata: {
            creator_id: request.creatorId,
            pack_id: request.packId,
            azma_units: String(request.azmaUnits),
            idempotency_key: request.idempotencyKey,
            ...request.metadata,
          },
        },
        metadata: {
          creator_id: request.creatorId,
          pack_id: request.packId,
          azma_units: String(request.azmaUnits),
          idempotency_key: request.idempotencyKey,
        },
        success_url: request.successUrl,
        cancel_url: request.cancelUrl,
        // idempotency key prevents duplicate sessions from double-clicks / retries
      },
      {
        idempotencyKey: request.idempotencyKey,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new PaymentSessionError(this.gatewayId, msg);
    }

    if (!session.url) {
      throw new PaymentSessionError(this.gatewayId, 'Stripe session missing checkout URL');
    }

    return {
      sessionId: session.id,
      checkoutUrl: session.url,
      expiresAt: (session.expires_at ?? 0) * 1000, // Stripe returns seconds
    };
  }

  async verifyWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Promise<WebhookVerificationResult> {
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, this.webhookSecret);
    } catch (err) {
      throw new WebhookSignatureError(this.gatewayId, err);
    }

    if (event.type !== 'checkout.session.completed' && event.type !== 'payment_intent.succeeded') {
      return {
        verified: true,
        eventType: event.type,
        paymentIntentId: '',
        metadata: {},
        amountReceived: 0,
        currency: '',
      };
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      return {
        verified: true,
        eventType: event.type,
        paymentIntentId: typeof session.payment_intent === 'string'
          ? session.payment_intent
          : (session.payment_intent?.id ?? ''),
        metadata: (session.metadata ?? {}) as Record<string, string>,
        amountReceived: session.amount_total ?? 0,
        currency: session.currency ?? '',
      };
    }

    // payment_intent.succeeded
    const intent = event.data.object as Stripe.PaymentIntent;
    return {
      verified: true,
      eventType: event.type,
      paymentIntentId: intent.id,
      metadata: (intent.metadata ?? {}) as Record<string, string>,
      amountReceived: intent.amount_received ?? 0,
      currency: intent.currency ?? '',
    };
  }
}

let stripeGatewayInstance: StripePaymentGateway | null = null;

export function getStripePaymentGateway(): StripePaymentGateway | null {
  const secretKey = process.env['STRIPE_SECRET_KEY'];
  const webhookSecret = process.env['STRIPE_WEBHOOK_SECRET'];

  if (!secretKey || !webhookSecret) return null;
  if (!stripeGatewayInstance) {
    stripeGatewayInstance = new StripePaymentGateway(secretKey, webhookSecret);
  }
  return stripeGatewayInstance;
}

export function resetStripeGatewayForTests(): void {
  stripeGatewayInstance = null;
}
