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

  // Only process successful payment events.
  // 'checkout.session.completed' / 'payment_intent.succeeded' = Stripe (legacy).
  // 'transaction.success' = Paymob (launch payment path).
  const relevantTypes = new Set([
    'checkout.session.completed',
    'payment_intent.succeeded',
    'transaction.success',
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
