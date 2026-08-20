// AZMA OS — Paymob Payment Gateway adapter.
// Implements IPaymentGateway for the Egyptian Paymob payment provider.
// EGP is Paymob's native currency — no conversion needed.
//
// Paymob API flow (3-step):
//   1. POST /auth/tokens              → auth_token
//   2. POST /ecommerce/orders         → order_id  (merchant_order_id = our idempotencyKey)
//   3. POST /acceptance/payment_keys  → payment_token
//   → Redirect Creator to iframe URL with payment_token
//
// Webhook verification: HMAC-SHA512 over a specific concatenated field list.
// The hmac value lives inside the webhook JSON body (obj.hmac), not in a header.
//
// Required environment variables:
//   PAYMOB_API_KEY         — API key from the Paymob merchant dashboard
//   PAYMOB_INTEGRATION_ID  — card payment integration ID
//   PAYMOB_IFRAME_ID       — checkout iframe ID
//   PAYMOB_HMAC_SECRET     — secret for webhook HMAC verification
//
// REAL PAYMENT TEST: NOT TESTED — credentials not yet available.

import { createHmac, randomUUID } from 'crypto';
import type { DatabaseSync } from 'node:sqlite';
import type {
  IPaymentGateway,
  PaymentSessionRequest,
  PaymentSessionResponse,
  WebhookVerificationResult,
} from './payment-gateway-contracts';
import {
  PaymentSessionError,
  WebhookSignatureError,
} from './payment-gateway-contracts';

const PAYMOB_BASE_URL = 'https://accept.paymob.com/api';
const PAYMOB_SUPPORTED_CURRENCIES = ['egp'] as const;
const EGP_TO_PIASTRES = 100;
// Paymob payment keys expire after 1 hour by default
const PAYMENT_KEY_EXPIRY_MS = 60 * 60 * 1000;

// ─── PAYMOB API RESPONSE SHAPES ──────────────────────────────────────────────

interface PaymobAuthResponse {
  token: string;
}

interface PaymobOrderResponse {
  id: number;
}

interface PaymobPaymentKeyResponse {
  token: string;
}

// Paymob transaction object delivered in webhook payload
interface PaymobTransactionObj {
  id: number;
  amount_cents: number;
  currency: string;
  success: boolean;
  pending: boolean;
  error_occured: boolean;
  is_auth: boolean;
  is_capture: boolean;
  is_standalone_payment: boolean;
  is_voided: boolean;
  is_refunded: boolean;
  is_3d_secure: boolean;
  has_parent_transaction: boolean;
  created_at: string;
  integration_id: number;
  owner: number;
  order: {
    id: number;
    merchant_order_id: string;
  };
  source_data: {
    pan: string;
    sub_type: string;
    type: string;
  };
  hmac: string;
}

interface PaymobWebhookPayload {
  type: string;
  obj: PaymobTransactionObj;
}

// ─── DB ROW SHAPE ────────────────────────────────────────────────────────────

interface PaymentTransactionRow {
  transaction_id: string;
  creator_id: string;
  pack_id: string;
  azma_units: number;
  amount_egp: number;
  idempotency_key: string;
  status: string;
}

// ─── GATEWAY ─────────────────────────────────────────────────────────────────

export class PaymobPaymentGateway implements IPaymentGateway {
  readonly gatewayId = 'paymob';
  readonly supportedCurrencies = PAYMOB_SUPPORTED_CURRENCIES;

  private readonly db: DatabaseSync;
  private readonly apiKey: string;
  private readonly integrationId: number;
  private readonly iframeId: string;
  private readonly hmacSecret: string;

  constructor(
    db: DatabaseSync,
    apiKey: string,
    integrationId: string,
    iframeId: string,
    hmacSecret: string,
  ) {
    this.db = db;
    this.apiKey = apiKey;
    this.integrationId = parseInt(integrationId, 10);
    this.iframeId = iframeId;
    this.hmacSecret = hmacSecret;
  }

  async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    const amountInPiastres = Math.round(request.amountEgp * EGP_TO_PIASTRES);

    try {
      const authToken = await this.authenticate();
      const orderId = await this.createOrder(authToken, amountInPiastres, request);
      const paymentToken = await this.createPaymentKey(authToken, amountInPiastres, orderId, request);

      // Store reconciliation record — Paymob cannot carry arbitrary metadata natively
      this.storePaymentTransaction(request, orderId);

      return {
        sessionId: String(orderId),
        checkoutUrl: `${PAYMOB_BASE_URL}/acceptance/iframes/${this.iframeId}?payment_token=${paymentToken}`,
        expiresAt: Date.now() + PAYMENT_KEY_EXPIRY_MS,
      };
    } catch (err) {
      if (err instanceof PaymentSessionError) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      throw new PaymentSessionError(this.gatewayId, msg);
    }
  }

  async verifyWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Promise<WebhookVerificationResult> {
    let parsed: PaymobWebhookPayload;
    try {
      const raw = typeof payload === 'string' ? payload : payload.toString('utf-8');
      parsed = JSON.parse(raw) as PaymobWebhookPayload;
    } catch {
      throw new WebhookSignatureError(this.gatewayId, new Error('Malformed webhook payload: invalid JSON'));
    }

    if (!parsed.obj || typeof parsed.obj !== 'object') {
      throw new WebhookSignatureError(this.gatewayId, new Error('Webhook payload missing obj field'));
    }

    const obj = parsed.obj;

    // Verify HMAC — Paymob computes SHA512 over a fixed field list
    const computedHmac = this.computeHmac(obj);
    if (computedHmac !== signature) {
      throw new WebhookSignatureError(this.gatewayId);
    }

    // Look up our reconciliation record by merchant_order_id
    const merchantOrderId = obj.order?.merchant_order_id;
    if (!merchantOrderId) {
      return this.unknownTransactionResult(obj, 'missing_merchant_order_id');
    }

    const txRow = this.db
      .prepare('SELECT * FROM payment_transactions WHERE idempotency_key = ?')
      .get(merchantOrderId) as unknown as PaymentTransactionRow | undefined;

    if (!txRow) {
      return this.unknownTransactionResult(obj, 'transaction_not_found');
    }

    // Classify event
    let eventType: string;
    let newStatus: string;
    if (obj.success && !obj.pending) {
      eventType = 'transaction.success';
      newStatus = 'successful';
    } else if (obj.pending) {
      eventType = 'transaction.pending';
      newStatus = 'pending';
    } else {
      eventType = 'transaction.failed';
      newStatus = 'failed';
    }

    // Update status in payment_transactions
    this.db
      .prepare(
        'UPDATE payment_transactions SET status = ?, provider_transaction_id = ?, updated_at = ? WHERE idempotency_key = ?',
      )
      .run(newStatus, String(obj.id), Date.now(), merchantOrderId);

    return {
      verified: true,
      eventType,
      paymentIntentId: String(obj.id),
      metadata: {
        creator_id: txRow.creator_id,
        pack_id: txRow.pack_id,
        azma_units: String(txRow.azma_units),
        idempotency_key: txRow.idempotency_key,
      },
      amountReceived: obj.amount_cents,
      currency: (obj.currency ?? '').toLowerCase(),
    };
  }

  // ─── PRIVATE ───────────────────────────────────────────────────────────────

  private async authenticate(): Promise<string> {
    const res = await fetch(`${PAYMOB_BASE_URL}/auth/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: this.apiKey }),
    });
    if (!res.ok) {
      throw new PaymentSessionError(this.gatewayId, `Paymob auth failed: HTTP ${res.status}`);
    }
    const data = (await res.json()) as PaymobAuthResponse;
    if (!data.token) {
      throw new PaymentSessionError(this.gatewayId, 'Paymob auth response missing token');
    }
    return data.token;
  }

  private async createOrder(
    authToken: string,
    amountInPiastres: number,
    request: PaymentSessionRequest,
  ): Promise<number> {
    const res = await fetch(`${PAYMOB_BASE_URL}/ecommerce/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: amountInPiastres,
        currency: 'EGP',
        merchant_order_id: request.idempotencyKey,
        items: [
          {
            name: `AZMA Units — ${request.azmaUnits}`,
            amount_cents: amountInPiastres,
            description: `Pack: ${request.packId}`,
            quantity: 1,
          },
        ],
      }),
    });
    if (!res.ok) {
      throw new PaymentSessionError(this.gatewayId, `Paymob order creation failed: HTTP ${res.status}`);
    }
    const data = (await res.json()) as PaymobOrderResponse;
    if (!data.id) {
      throw new PaymentSessionError(this.gatewayId, 'Paymob order response missing id');
    }
    return data.id;
  }

  private async createPaymentKey(
    authToken: string,
    amountInPiastres: number,
    orderId: number,
    request: PaymentSessionRequest,
  ): Promise<string> {
    const res = await fetch(`${PAYMOB_BASE_URL}/acceptance/payment_keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        auth_token: authToken,
        amount_cents: amountInPiastres,
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: 'NA',
          email: 'creator@azma-os.com',
          floor: 'NA',
          first_name: 'AZMA',
          street: 'NA',
          building: 'NA',
          phone_number: '+20123456789',
          shipping_method: 'NA',
          postal_code: 'NA',
          city: 'Cairo',
          country: 'EG',
          last_name: 'Creator',
          state: 'Cairo',
        },
        currency: 'EGP',
        integration_id: this.integrationId,
        lock_order_when_paid: true,
      }),
    });
    if (!res.ok) {
      throw new PaymentSessionError(this.gatewayId, `Paymob payment key creation failed: HTTP ${res.status}`);
    }
    const data = (await res.json()) as PaymobPaymentKeyResponse;
    if (!data.token) {
      throw new PaymentSessionError(this.gatewayId, 'Paymob payment key response missing token');
    }
    return data.token;
  }

  private storePaymentTransaction(request: PaymentSessionRequest, orderId: number): void {
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO payment_transactions
           (transaction_id, creator_id, pack_id, azma_units, amount_egp,
            idempotency_key, provider_id, provider_order_id, provider_reference,
            status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, 'paymob', ?, ?, 'initiated', ?, ?)
         ON CONFLICT(idempotency_key) DO NOTHING`,
      )
      .run(
        randomUUID(),
        request.creatorId,
        request.packId,
        request.azmaUnits,
        request.amountEgp,
        request.idempotencyKey,
        String(orderId),
        request.idempotencyKey,
        now,
        now,
      );
  }

  // HMAC-SHA512 over the exact field list Paymob specifies.
  // Field order is mandated by Paymob — do not reorder.
  private computeHmac(obj: PaymobTransactionObj): string {
    const concat = [
      String(obj.amount_cents),
      String(obj.created_at),
      String(obj.currency),
      String(obj.error_occured),
      String(obj.has_parent_transaction),
      String(obj.id),
      String(obj.integration_id),
      String(obj.is_3d_secure),
      String(obj.is_auth),
      String(obj.is_capture),
      String(obj.is_refunded),
      String(obj.is_standalone_payment),
      String(obj.is_voided),
      String(obj.order?.id ?? ''),
      String(obj.owner),
      String(obj.pending),
      String(obj.source_data?.pan ?? ''),
      String(obj.source_data?.sub_type ?? ''),
      String(obj.source_data?.type ?? ''),
      String(obj.success),
    ].join('');
    return createHmac('sha512', this.hmacSecret).update(concat).digest('hex');
  }

  private unknownTransactionResult(
    obj: PaymobTransactionObj,
    reason: string,
  ): WebhookVerificationResult {
    return {
      verified: true,
      eventType: `transaction.unknown:${reason}`,
      paymentIntentId: String(obj.id ?? ''),
      metadata: {},
      amountReceived: obj.amount_cents ?? 0,
      currency: (obj.currency ?? '').toLowerCase(),
    };
  }
}

// ─── SINGLETON ───────────────────────────────────────────────────────────────

let paymobInstance: PaymobPaymentGateway | null = null;

export function getPaymobPaymentGateway(db: DatabaseSync): PaymobPaymentGateway | null {
  const apiKey = process.env['PAYMOB_API_KEY'];
  const integrationId = process.env['PAYMOB_INTEGRATION_ID'];
  const iframeId = process.env['PAYMOB_IFRAME_ID'];
  const hmacSecret = process.env['PAYMOB_HMAC_SECRET'];

  if (!apiKey || !integrationId || !iframeId || !hmacSecret) return null;
  if (!paymobInstance) {
    paymobInstance = new PaymobPaymentGateway(db, apiKey, integrationId, iframeId, hmacSecret);
  }
  return paymobInstance;
}

export function resetPaymobGatewayForTests(): void {
  paymobInstance = null;
}
