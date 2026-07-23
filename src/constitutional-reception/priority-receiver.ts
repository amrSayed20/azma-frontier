/**
 * AZMA OS — THE CONSTITUTIONAL RECEPTION
 * The Constitutional Priority Receiver
 * Construction Campaign
 *
 * Orders an already-queued set of ReceivedExpressions for delivery:
 * attention-worthy entries first (oldest attention-worthy first), then
 * everything else in the order it was received. Never re-evaluates
 * `deservesAttention` itself — that determination belongs solely to
 * attention-layer.ts, computed once at reception time.
 */

import type { ReceivedExpression } from './types';

export function prioritizeReceivedExpressions(
  entries: readonly ReceivedExpression[],
): readonly ReceivedExpression[] {
  const attentionWorthy = entries.filter((entry) => entry.deservesAttention);
  const silent = entries.filter((entry) => !entry.deservesAttention);
  return [...attentionWorthy, ...silent];
}
