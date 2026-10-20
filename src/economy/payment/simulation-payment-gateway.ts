/**
 * AZMA OS — بوّابةُ دفعٍ للمحاكاة، مُعلَنةٌ بأنّها محاكاة.
 *
 * ─── WHY THIS EXISTS, AND WHAT IT IS NOT ────────────────────────────────────
 *
 *   The Founder, 2026-10-20: a payment journey that can be shown to XPay and
 *   to the bank — pack chosen, order summarised, payment attempted, units
 *   landing in a real balance — «مع توضيح أنها بيئة اختبار وليست عملية خصم
 *   مالي حقيقية».
 *
 *   So this is a GATEWAY, implementing the same interface the real ones do,
 *   and it is the only thing in the Empire that fulfils a payment nobody
 *   actually made. Everything downstream of it is the production road,
 *   untouched: the same `handlePaymentWebhook`, which re-checks the pack, the
 *   amount in piastres, the currency, and grants through the same ledger with
 *   the same unique idempotency key.
 *
 * ─── HOW A CREATOR CANNOT GRANT THEMSELVES A BALANCE ────────────────────────
 *
 *   Three locks, and none of them is in the browser:
 *
 *   1 · IT DOES NOT EXIST UNLESS THE SERVER SAYS SO. `AZMA_PAYMENT_SIMULATION`
 *       must be `1` in the server's own environment. A production host that
 *       never sets it has no simulation gateway at all — not a disabled one.
 *   2 · IT REFUSES TO STAND BESIDE REAL MONEY. If a live XPay key is present,
 *       this gateway is not offered: an environment that can take real money
 *       must not also be able to invent it.
 *   3 · ITS SUCCESS IS SIGNED. The «paid» event is built on the server and
 *       signed with a secret the browser never sees, then verified by the same
 *       HMAC path a real webhook goes through. A crafted request from a
 *       console is rejected by `WebhookSignatureError` exactly as a forged
 *       XPay callback would be.
 *
 *   The signing secret is generated per process and never persisted. It is not
 *   a credential to anything: it exists so that the one road into the ledger
 *   is the same road for a real payment and a simulated one.
 */

import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type {
  IPaymentGateway, PaymentSessionRequest, PaymentSessionResponse, WebhookVerificationResult,
} from './payment-gateway-contracts';
import { WebhookSignatureError } from './payment-gateway-contracts';

export const SIMULATION_GATEWAY_ID = 'payment-simulation' as const;

/** The environment variable that must say `1` for any of this to exist. */
export const SIMULATION_FLAG = 'AZMA_PAYMENT_SIMULATION' as const;

const SESSION_TTL_MS = 60 * 60 * 1000;
const SIGNATURE_TOLERANCE_SECONDS = 300;

/**
 * Per-process, never written down. A restart invalidates every outstanding
 * simulated event, which is the correct behaviour for something that is not
 * money.
 */
let processSecret: string | null = null;
function secret(): string {
  if (!processSecret) processSecret = randomUUID() + randomUUID();
  return processSecret;
}

/** Only for tests that need two processes' worth of behaviour in one. */
export function resetSimulationSecretForTests(): void {
  processSecret = null;
}

export class SimulationPaymentGateway implements IPaymentGateway {
  readonly gatewayId = SIMULATION_GATEWAY_ID;
  readonly supportedCurrencies = ['EGP'] as const;

  /**
   * The Creator is sent to a page THIS Empire serves, which says in its own
   * words that no money moves. No external host is contacted, so nothing can
   * be charged by accident.
   */
  async createPaymentSession(request: PaymentSessionRequest): Promise<PaymentSessionResponse> {
    const sessionId = `sim_${randomUUID()}`;
    const params = new URLSearchParams({
      session: sessionId,
      pack: request.packId,
      units: String(request.azmaUnits),
      egp: String(request.amountEgp),
      key: request.idempotencyKey,
      success: request.successUrl,
      cancel: request.cancelUrl,
    });
    return {
      sessionId,
      checkoutUrl: `/m/payment-simulation?${params.toString()}`,
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
  }

  /**
   * The same shape XPay signs: `t=<unix>,v1=<hex of HMAC(t.rawBody)>`, with the
   * signature over the RAW BYTES — re-serialising parsed JSON would not
   * reproduce what was signed, and a tolerance window bounds replay.
   */
  async verifyWebhookEvent(
    payload: string | Buffer,
    signature: string,
  ): Promise<WebhookVerificationResult> {
    const raw = typeof payload === 'string' ? payload : payload.toString('utf8');
    const parts = new Map(
      signature.split(',').map((p) => {
        const at = p.indexOf('=');
        return [p.slice(0, at).trim(), p.slice(at + 1).trim()] as const;
      }),
    );
    const timestamp = parts.get('t');
    const provided = parts.get('v1');
    if (!timestamp || !provided) throw new WebhookSignatureError(this.gatewayId);

    const age = Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp));
    if (!Number.isFinite(age) || age > SIGNATURE_TOLERANCE_SECONDS) {
      throw new WebhookSignatureError(this.gatewayId);
    }

    const expected = createHmac('sha256', secret()).update(`${timestamp}.${raw}`).digest('hex');
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(provided, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new WebhookSignatureError(this.gatewayId);
    }

    const event = JSON.parse(raw) as {
      type?: string;
      data?: { object?: Record<string, unknown> };
    };
    const object = event.data?.object ?? {};
    return {
      verified: true,
      eventType: String(event.type ?? ''),
      paymentIntentId: String(object['id'] ?? ''),
      metadata: (object['metadata'] as Record<string, string>) ?? {},
      amountReceived: Number(object['amountTotal'] ?? 0),
      currency: String(object['currency'] ?? ''),
    };
  }

  /**
   * Build the event the Empire would have received, and sign it.
   *
   * Called ONLY from the server-side simulation route. It is the single reason
   * the simulated road can end in a granted balance, and it is why a browser
   * cannot: the browser has no secret to sign with.
   */
  signEvent(event: Record<string, unknown>): { body: string; signature: string } {
    const body = JSON.stringify(event);
    const t = Math.floor(Date.now() / 1000);
    const v1 = createHmac('sha256', secret()).update(`${t}.${body}`).digest('hex');
    return { body, signature: `t=${t},v1=${v1}` };
  }

  /** The «money arrived» event for one simulated purchase. */
  paidEvent(params: {
    readonly sessionId: string;
    readonly creatorId: string;
    readonly packId: string;
    readonly azmaUnits: number;
    readonly amountEgp: number;
    readonly idempotencyKey: string;
  }): Record<string, unknown> {
    return {
      type: 'payment.succeeded',
      data: {
        object: {
          id: params.sessionId,
          // Minor units — piastres. The handler compares this against the
          // pack's own price converted the same way, and refuses a near-miss.
          amountTotal: Math.round(params.amountEgp * 100),
          currency: 'EGP',
          paymentStatus: 'paid',
          simulated: true,
          metadata: {
            creator_id: params.creatorId,
            pack_id: params.packId,
            azma_units: String(params.azmaUnits),
            idempotency_key: params.idempotencyKey,
            simulation: 'true',
          },
        },
      },
    };
  }
}

/**
 * The simulation gateway, or null — and null is the normal answer.
 *
 * `liveKeyPresent` is passed in rather than read here, so this module never
 * learns another gateway's credential name and the refusal to stand beside
 * real money stays a single, readable condition.
 */
export function getSimulationGateway(liveKeyPresent: boolean): SimulationPaymentGateway | null {
  if (process.env[SIMULATION_FLAG] !== '1') return null;
  if (liveKeyPresent) return null;
  return new SimulationPaymentGateway();
}

/** Whether this server is running a payment simulation at all. */
export function simulationIsEnabled(liveKeyPresent: boolean): boolean {
  return getSimulationGateway(liveKeyPresent) !== null;
}
