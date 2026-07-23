/**
 * AZMA OS — THE CONSTITUTIONAL EXPRESSION
 * The Constitutional Expression Prioritizer
 * Construction Campaign
 *
 * Orders a set of gathered inputs by the Expression Registry's own
 * declared priority (expression-registry.ts) — a stable sort, never a
 * value judgment about content.
 */

import { EXPRESSION_SOURCE_PRIORITY_ORDER } from './expression-registry';
import type { ConstitutionalExpressionInput } from './types';

export function prioritizeInputs(
  inputs: readonly ConstitutionalExpressionInput[],
): readonly ConstitutionalExpressionInput[] {
  return [...inputs].sort(
    (a, b) => EXPRESSION_SOURCE_PRIORITY_ORDER.indexOf(a.sourceOrgan) - EXPRESSION_SOURCE_PRIORITY_ORDER.indexOf(b.sourceOrgan),
  );
}
