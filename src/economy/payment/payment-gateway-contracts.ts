// AZMA OS — Payment Gateway abstraction.
// Q3 answer: EGP as Creator-facing currency; this interface accepts amount in EGP.
// If a gateway cannot process EGP, the implementing class must throw GatewayEgpUnsupportedError.

export interface PaymentSessionRequest {
  readonly creatorId: string;
  readonly packId: string;
  readonly amountEgp: number;
  readonly azmaUnits: number;
  readonly idempotencyKey: string;       // prevents duplicate sessions
  readonly successUrl: string;
  readonly cancelUrl: string;
  readonly metadata?: Record<string, string>;
}

export interface PaymentSessionResponse {
  readonly sessionId: string;            // gateway-assigned session/payment-intent ID
  readonly checkoutUrl: string;          // redirect the Creator to this URL
  readonly expiresAt: number;            // Unix ms — when the session expires
}

export interface WebhookVerificationResult {
  readonly verified: boolean;
  readonly eventType: string;
  readonly paymentIntentId: string;
  readonly metadata: Record<string, string>;
  readonly amountReceived: number;       // in gateway's minor unit (e.g. cents/piastres)
  readonly currency: string;
}

export interface IPaymentGateway {
  readonly gatewayId: string;
  readonly supportedCurrencies: readonly string[];

  // Creates a one-time payment session (mode: 'payment', not subscription).
  // Throws GatewayEgpUnsupportedError if EGP is not supported.
  createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse>;

  // Verifies a webhook signature and extracts event data.
  // Throws WebhookSignatureError if signature is invalid.
  verifyWebhookEvent(payload: string | Buffer, signature: string): Promise<WebhookVerificationResult>;
}

export class GatewayEgpUnsupportedError extends Error {
  constructor(readonly gatewayId: string) {
    super(
      `Payment gateway '${gatewayId}' does not support EGP (Egyptian Pound). ` +
      'STOP: Per Construction Directive Q3, if the gateway cannot process EGP, ' +
      'report this to the Chief Architect before proceeding.',
    );
    this.name = 'GatewayEgpUnsupportedError';
  }
}

export class WebhookSignatureError extends Error {
  constructor(readonly gatewayId: string, cause?: unknown) {
    super(`Webhook signature verification failed for gateway '${gatewayId}'`);
    this.name = 'WebhookSignatureError';
    if (cause instanceof Error) this.cause = cause;
  }
}

export class PaymentSessionError extends Error {
  constructor(readonly gatewayId: string, message: string) {
    super(`Payment session error from '${gatewayId}': ${message}`);
    this.name = 'PaymentSessionError';
  }
}
