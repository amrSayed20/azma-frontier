// AZMA OS — XPay Payment Gateway adapter (the approved launch gateway).
// Implements IPaymentGateway for XPay (xpay.app), Egypt.
//
// Written from XPay's own documentation (github.com/xpayeg/docs, last
// change 2026-07-31): "API Payments", "Pay endpoint", "Prepare Amount
// endpoint", "Transaction endpoint".
//
// Flow:
//   1. [optional] POST /api/v1/payments/prepare-amount/   → total with service fees
//      (only when the XPay agreement adds the fees to the bill)
//   2. POST /api/v1/payments/pay/variable-amount          → iframe_url + transaction_uuid
//   → Redirect the Creator to iframe_url
//   3. XPay POSTs the dashboard "Callback url" and redirects the Creator to
//      the dashboard "Redirect url" with transaction_uuid in the query.
//
// Confirmation: XPay documents no signature on the callback, so its body is
// never trusted. Only its transaction UUID is used, and only when it matches
// an order this server created; the transaction is then re-read from
// GET /api/v1/communities/{community_id}/transactions/{uuid}/ with the API
// key, and units are granted only for status SUCCESSFUL with the exact
// amount and currency of that order.
//
// Environment (values live in the server's environment, never in the repo):
//   XPAY_API_KEY             — API key from the XPay dashboard
//   XPAY_COMMUNITY_ID        — the community (merchant) ID XPay assigned
//   XPAY_VARIABLE_AMOUNT_ID  — the ID of the "API Payment" created in the dashboard
//   XPAY_ENVIRONMENT         — "staging" (test) or "live"; required, no default,
//                              so a server never charges for real by accident
//   XPAY_FEES_ADDED_TO_BILL  — "true" if the agreement adds XPay's fees on top
//                              of the price (then step 1 runs); otherwise unset
//   XPAY_API_BASE_URL        — optional override of the API host, for a local
//                              test server only
//
// REAL PAYMENT TEST: NOT TESTED — no XPay account or credentials available.

import { randomUUID } from 'crypto';
import type { DatabaseSync } from 'node:sqlite';
import type {
  IPaymentGateway,
  PaymentSessionRequest,
  PaymentSessionResponse,
  WebhookVerificationResult,
} from './payment-gateway-contracts';
import { PaymentSessionError, WebhookSignatureError } from './payment-gateway-contracts';

const XPAY_HOSTS = {
  staging: 'https://staging.xpay.app',
  live: 'https://community.xpay.app',
} as const;

export type XpayEnvironment = keyof typeof XPAY_HOSTS;

const PIASTRES_PER_EGP = 100;
// XPay does not document an iframe lifetime; this bounds how long the
// checkout page treats the session as fresh.
const SESSION_FRESH_MS = 60 * 60 * 1000;

export interface XpayConfig {
  readonly apiKey: string;
  readonly communityId: string;
  readonly variableAmountId: number;
  readonly environment: XpayEnvironment;
  readonly feesAddedToBill: boolean;
  readonly baseUrl: string;
}

interface XpayEnvelope<T> {
  status?: { code?: number; message?: string; errors?: unknown[] };
  data?: T;
}

interface XpayPayData {
  iframe_url?: string | null;
  transaction_id?: number;
  transaction_uuid?: string;
  transaction_status?: string;
}

interface XpayTransactionData {
  uuid?: string;
  status?: string;
  total_amount_piasters?: number;
  total_amount_currency?: string;
}

interface PaymentTransactionRow {
  creator_id: string;
  pack_id: string;
  azma_units: number;
  amount_egp: number;
  charged_amount_piasters: number | null;
  idempotency_key: string;
  provider_order_id: string;
  status: string;
}

/** A billing name XPay accepts: two words or more. */
export function isValidXpayBillingName(name: string): boolean {
  return name.trim().split(/\s+/).filter(Boolean).length >= 2;
}

/**
 * XPay needs the phone with its country code. An Egyptian mobile typed the
 * local way (01xxxxxxxxx) is rewritten as +201xxxxxxxxx; anything else must
 * already start with +. Returns null when the number cannot be used.
 */
export function normalizeXpayPhone(raw: string): string | null {
  const compact = raw.replace(/[\s\-()]/g, '').replace(/^00/, '+');
  if (/^01[0125]\d{8}$/.test(compact)) return `+2${compact}`;
  if (/^\+\d{8,15}$/.test(compact)) return compact;
  return null;
}

export class XpayPaymentGateway implements IPaymentGateway {
  readonly gatewayId = 'xpay';
  readonly supportedCurrencies = ['egp'] as const;

  constructor(
    private readonly db: DatabaseSync,
    private readonly config: XpayConfig,
  ) {}

  async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    const name = request.customerName?.trim() ?? '';
    const phone = request.customerPhone ? normalizeXpayPhone(request.customerPhone) : null;
    if (!request.customerEmail || !isValidXpayBillingName(name) || !phone) {
      throw new PaymentSessionError(this.gatewayId, 'XPay needs the payer\'s full name, email and phone number.');
    }

    const originalAmount = request.amountEgp;
    const amount = this.config.feesAddedToBill ? await this.prepareAmount(originalAmount) : originalAmount;

    const pay = await this.call<XpayPayData>('POST', '/api/v1/payments/pay/variable-amount', {
      community_id: this.config.communityId,
      variable_amount_id: this.config.variableAmountId,
      amount,
      original_amount: originalAmount,
      currency: 'EGP',
      pay_using: 'card',
      language: 'ar',
      billing_data: { name, email: request.customerEmail, phone_number: phone },
    });
    if (!pay.iframe_url || !pay.transaction_uuid) {
      throw new PaymentSessionError(this.gatewayId, 'XPay pay response missing iframe_url or transaction_uuid');
    }

    this.storePaymentTransaction(request, pay, Math.round(amount * PIASTRES_PER_EGP));
    return {
      sessionId: pay.transaction_uuid,
      checkoutUrl: pay.iframe_url,
      expiresAt: Date.now() + SESSION_FRESH_MS,
    };
  }

  /**
   * `payload` is the callback body (or `{ "transaction_uuid": … }` built
   * from the redirect). XPay sends no signature, so the interface's
   * signature argument is not taken; the transaction is re-read from XPay.
   */
  async verifyWebhookEvent(payload: string | Buffer): Promise<WebhookVerificationResult> {
    let uuid: unknown;
    try {
      const body = JSON.parse(typeof payload === 'string' ? payload : payload.toString('utf-8')) as Record<string, unknown>;
      // The callback carries the UUID under "transaction_id"; the redirect under "transaction_uuid".
      uuid = body.transaction_uuid ?? body.transaction_id;
    } catch {
      throw new WebhookSignatureError(this.gatewayId, new Error('Malformed callback payload: invalid JSON'));
    }
    if (typeof uuid !== 'string' || !uuid) {
      throw new WebhookSignatureError(this.gatewayId, new Error('Callback payload has no transaction UUID'));
    }
    return this.verifyTransaction(uuid);
  }

  /** Re-reads a transaction this server created and classifies it. Unknown UUIDs cause no call to XPay. */
  async verifyTransaction(uuid: string): Promise<WebhookVerificationResult> {
    const row = this.db
      .prepare(`SELECT creator_id, pack_id, azma_units, amount_egp, charged_amount_piasters, idempotency_key, provider_order_id, status
                FROM payment_transactions WHERE provider_id = 'xpay' AND provider_order_id = ?`)
      .get(uuid) as unknown as PaymentTransactionRow | undefined;
    if (!row) {
      throw new WebhookSignatureError(this.gatewayId, new Error('No XPay order with this transaction UUID'));
    }

    const metadata = {
      creator_id: row.creator_id,
      pack_id: row.pack_id,
      azma_units: String(row.azma_units),
      idempotency_key: row.idempotency_key,
    };
    // Already confirmed: a replayed callback or a reloaded return page needs
    // no new call to XPay (the credit itself is idempotent).
    if (row.status === 'successful') {
      return { verified: true, eventType: 'transaction.success', paymentIntentId: uuid, metadata, amountReceived: 0, currency: 'egp' };
    }

    let tx: XpayTransactionData;
    try {
      tx = await this.call<XpayTransactionData>(
        'GET',
        `/api/v1/communities/${encodeURIComponent(this.config.communityId)}/transactions/${encodeURIComponent(uuid)}/`,
      );
    } catch (err) {
      throw new WebhookSignatureError(this.gatewayId, err);
    }

    const expectedPiastres = row.charged_amount_piasters ?? Math.round(row.amount_egp * PIASTRES_PER_EGP);
    const amountMatches = tx.total_amount_piasters === expectedPiastres
      && String(tx.total_amount_currency ?? '').toUpperCase() === 'EGP';
    const status = String(tx.status ?? '').toUpperCase();

    let eventType: string;
    let newStatus: string;
    if (status === 'SUCCESSFUL' && amountMatches) {
      eventType = 'transaction.success';
      newStatus = 'successful';
    } else if (status === 'SUCCESSFUL') {
      eventType = 'transaction.amount_mismatch';
      newStatus = 'amount_mismatch';
    } else if (status === 'PENDING') {
      eventType = 'transaction.pending';
      newStatus = 'pending';
    } else if (status === 'FAILED') {
      eventType = 'transaction.failed';
      newStatus = 'failed';
    } else {
      // Any other state (a refund, a status XPay adds later) is kept for review and grants nothing.
      eventType = `transaction.other:${status.toLowerCase() || 'unknown'}`;
      newStatus = status ? `review:${status.toLowerCase()}` : 'review:unknown';
    }

    this.db
        .prepare('UPDATE payment_transactions SET status = ?, provider_transaction_id = ?, updated_at = ? WHERE provider_id = \'xpay\' AND provider_order_id = ?')
        .run(newStatus, uuid, Date.now(), uuid);

    return {
      verified: true,
      eventType,
      paymentIntentId: uuid,
      metadata,
      amountReceived: tx.total_amount_piasters ?? 0,
      currency: String(tx.total_amount_currency ?? '').toLowerCase(),
    };
  }

  // ─── PRIVATE ───────────────────────────────────────────────────────────────

  private async prepareAmount(originalAmount: number): Promise<number> {
    const prepared = await this.call<{ total_amount?: number }>('POST', '/api/v1/payments/prepare-amount/', {
      community_id: this.config.communityId,
      amount: originalAmount,
      currency: 'EGP',
      selected_payment_method: 'card',
    });
    if (typeof prepared.total_amount !== 'number' || prepared.total_amount < originalAmount) {
      throw new PaymentSessionError(this.gatewayId, 'XPay prepare-amount response missing a valid total_amount');
    }
    return prepared.total_amount;
  }

  private async call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.config.baseUrl}${path}`, {
      method,
      headers: { 'x-api-key': this.config.apiKey, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const envelope = (await res.json().catch(() => ({}))) as XpayEnvelope<T>;
    if (!res.ok || !envelope.data) {
      const detail = envelope.status?.message || JSON.stringify(envelope.status?.errors ?? []);
      throw new PaymentSessionError(this.gatewayId, `XPay ${method} ${path.split('/').slice(0, 5).join('/')} failed: HTTP ${res.status} ${detail}`.trim());
    }
    return envelope.data;
  }

  private storePaymentTransaction(request: PaymentSessionRequest, pay: XpayPayData, chargedPiastres: number): void {
    const now = Date.now();
    this.db
      .prepare(
        `INSERT INTO payment_transactions
           (transaction_id, creator_id, pack_id, azma_units, amount_egp, charged_amount_piasters,
            idempotency_key, provider_id, provider_order_id, provider_reference,
            status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'xpay', ?, ?, 'initiated', ?, ?)
         ON CONFLICT(idempotency_key) DO NOTHING`,
      )
      .run(
        randomUUID(),
        request.creatorId,
        request.packId,
        request.azmaUnits,
        request.amountEgp,
        chargedPiastres,
        request.idempotencyKey,
        pay.transaction_uuid ?? null,
        pay.transaction_id !== undefined ? String(pay.transaction_id) : null,
        now,
        now,
      );
  }
}

// ─── CONFIGURATION ───────────────────────────────────────────────────────────

/** The XPay configuration from the environment, or null when any required value is missing. */
export function resolveXpayConfig(env: Readonly<Record<string, string | undefined>> = process.env): XpayConfig | null {
  const apiKey = env['XPAY_API_KEY'];
  const communityId = env['XPAY_COMMUNITY_ID'];
  const variableAmountId = Number.parseInt(env['XPAY_VARIABLE_AMOUNT_ID'] ?? '', 10);
  const environment = env['XPAY_ENVIRONMENT'];
  if (!apiKey || !communityId || !Number.isFinite(variableAmountId)) return null;
  if (environment !== 'staging' && environment !== 'live') return null;
  return {
    apiKey,
    communityId,
    variableAmountId,
    environment,
    feesAddedToBill: env['XPAY_FEES_ADDED_TO_BILL'] === 'true',
    baseUrl: (env['XPAY_API_BASE_URL'] || XPAY_HOSTS[environment]).replace(/\/+$/, ''),
  };
}

let xpayInstance: XpayPaymentGateway | null = null;

export function getXpayPaymentGateway(db: DatabaseSync): XpayPaymentGateway | null {
  const config = resolveXpayConfig();
  if (!config) return null;
  if (!xpayInstance) xpayInstance = new XpayPaymentGateway(db, config);
  return xpayInstance;
}

export function resetXpayGatewayForTests(): void {
  xpayInstance = null;
}
