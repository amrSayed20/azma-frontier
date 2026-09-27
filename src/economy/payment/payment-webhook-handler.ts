import type { DatabaseSync } from 'node:sqlite';
import type { IPaymentGateway } from './payment-gateway-contracts';
import { WebhookSignatureError } from './payment-gateway-contracts';
import { CreatorCreditRepository } from '../credit-ledger/credit-ledger-repository';
import { getCreditPack } from './credit-packs';
import type { CreditPackId } from './credit-packs';

export interface WebhookHandlerResult {
  readonly processed: boolean;
  readonly reason: string;
  readonly creatorId?: string;
  readonly azmaUnitsGranted?: number;
}

// Idempotent: the same paymentIntentId processed twice is a no-op (DB idempotency_key).
export async function handlePaymentWebhook(
  db: DatabaseSync,
  gateway: IPaymentGateway,
  rawPayload: string | Buffer,
  signature: string,
): Promise<WebhookHandlerResult> {
  let event;
  try {
    event = await gateway.verifyWebhookEvent(rawPayload, signature);
  } catch (err) {
    if (err instanceof WebhookSignatureError) {
      return { processed: false, reason: 'signature_invalid' };
    }
    throw err;
  }

  // ── ONE SOVEREIGN EVENT NAME, AND THE PROVIDER NAMES THAT PREDATE IT ─────
  //
  //   'payment.succeeded' is AZMA's own word for «the money arrived». A
  //   binding normalises to it, so this file never has to learn a provider's
  //   object vocabulary — which is the dependency the architecture forbids.
  //
  //   The three strings below it are provider object names from the Stripe
  //   and Paymob bindings, which were written before this boundary had a word
  //   of its own. They are kept so those paths keep working, and they are the
  //   shape a future normalisation should remove. The XPay binding does not
  //   use them.
  const relevantTypes = new Set([
    'payment.succeeded',
    'checkout.session.completed',   // legacy: Stripe binding
    'payment_intent.succeeded',     // legacy: Stripe binding
    'transaction.success',          // legacy: Paymob binding
  ]);
  if (!relevantTypes.has(event.eventType)) {
    return { processed: false, reason: `ignored_event_type:${event.eventType}` };
  }

  const creatorId = event.metadata['creator_id'];
  const packId = event.metadata['pack_id'] as CreditPackId;
  const idempotencyKey = event.metadata['idempotency_key'] ?? event.paymentIntentId;
  const azmaUnitsStr = event.metadata['azma_units'];

  if (!creatorId || !packId || !azmaUnitsStr) {
    return { processed: false, reason: 'missing_required_metadata' };
  }

  const azmaUnits = parseInt(azmaUnitsStr, 10);
  if (isNaN(azmaUnits) || azmaUnits <= 0) {
    return { processed: false, reason: 'invalid_azma_units_metadata' };
  }

  // Verify pack consistency — guard against tampered metadata
  let pack;
  try {
    pack = getCreditPack(packId);
  } catch {
    return { processed: false, reason: `unknown_pack_id:${packId}` };
  }

  if (pack.azmaUnits !== azmaUnits) {
    return {
      processed: false,
      reason: `units_mismatch:metadata_says_${azmaUnits}_pack_definition_says_${pack.azmaUnits}`,
    };
  }

  // ── THE AMOUNT AND THE CURRENCY, AGAINST AZMA'S OWN PRICE RECORD ──────────
  //
  //   Until now this handler checked the UNITS a payment claimed and granted
  //   them without ever asking what was actually PAID. A session created for
  //   1 EGP, or settled in another currency, carried metadata saying 6000
  //   units and would have been honoured.
  //
  //   The gateway reports the amount in MINOR UNITS — piastres for EGP — so
  //   the pack's own price is converted the same way and the two integers are
  //   compared exactly. No tolerance: a payment that is not the price is not
  //   the payment, and a near-miss is the shape a tampered one takes.
  const expectedMinorUnits = Math.round(pack.priceEgp * 100);
  if (event.amountReceived !== expectedMinorUnits) {
    return {
      processed: false,
      reason: `amount_mismatch:received_${event.amountReceived}_expected_${expectedMinorUnits}`,
    };
  }
  if (event.currency.toUpperCase() !== 'EGP') {
    return { processed: false, reason: `currency_mismatch:received_${event.currency}_expected_EGP` };
  }

  // Credit units — idempotent via idempotencyKey unique constraint
  const repo = new CreatorCreditRepository(db);
  const webhookIdempotencyKey = `webhook:${gateway.gatewayId}:${idempotencyKey}`;

  repo.creditUnits(
    creatorId,
    azmaUnits,
    'purchase',
    webhookIdempotencyKey,
    event.paymentIntentId,
    { packId, gatewayEventType: event.eventType, gatewayId: gateway.gatewayId },
  );

  return {
    processed: true,
    reason: 'credited',
    creatorId,
    azmaUnitsGranted: azmaUnits,
  };
}
