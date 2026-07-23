/**
 * AZMA OS — THE CONSTITUTIONAL RECEPTION
 * Constitutional Delivery
 * Construction Campaign
 *
 * The one function that ever "delivers" a ReceivedExpression to a named
 * recipient — enforcing that only an authorized RecipientId (per
 * recipient-registry.ts) may ever receive anything. This does not
 * render, notify, or present anything (Out of Scope) — it only decides,
 * mechanically, whether the attempt is authorized, returning a result
 * either way. No unauthorized recipient id can ever succeed.
 */

import { isAuthorizedRecipient } from './recipient-registry';
import type { DeliveryResult, ReceivedExpression, RecipientId } from './types';

export function deliverToRecipient(recipientId: string, entry: ReceivedExpression): DeliveryResult {
  if (!isAuthorizedRecipient(recipientId)) {
    return {
      delivered: false,
      recipientId: null,
      reason: `"${recipientId}" is not a registered, authorized recipient — delivery refused.`,
    };
  }
  return {
    delivered: true,
    recipientId: recipientId as RecipientId,
    reason: `Delivered reception "${entry.receptionId}" to authorized recipient "${recipientId}".`,
  };
}
