/**
 * AZMA OS — THE CONSTITUTIONAL RECEPTION
 * The Constitutional Attention Layer
 * Construction Campaign
 *
 * "What deserves attention. What remains silent." A mechanical,
 * non-judgmental corroboration threshold — never an evaluation of
 * whether an expression's CONTENT is good, correct, or urgent. An
 * expression deserves attention only when broadly corroborated: at
 * least `ATTENTION_THRESHOLD` of the Expression Layer's own 5 possible
 * contributing sources agree there is something real to say about an
 * organ. Everything below that threshold is queued (never dropped) but
 * not flagged.
 */

import type { ConstitutionalExpression } from '../constitutional-expression';

export const ATTENTION_THRESHOLD = 3;

export function organDeservesAttention(expression: ConstitutionalExpression): boolean {
  return expression.contributingSources.length >= ATTENTION_THRESHOLD;
}
