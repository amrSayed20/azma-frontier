/**
 * AZMA OS — THE CONSTITUTIONAL EXPRESSION
 * The Constitutional Expression Composer
 * Construction Campaign
 *
 * "Merge constitutional understanding... Express one unified
 * constitutional voice." Mechanically concatenates the prioritized
 * inputs' own already-produced summaries — never rephrases, never
 * invents new interpretation, never calls an AI provider (Out of
 * Scope). "Protect constitutional dignity" reuses the Sovereign Tongue's
 * own validateDignity() (Article XXII, pre-existing) rather than
 * inventing a second dignity check.
 */

import { validateDignity } from '../core/tongue';
import { gatherAllForOrgan } from './gathering';
import { prioritizeInputs } from './expression-prioritizer';
import type { ConstitutionalExpression } from './types';

export function composeExpressionForOrgan(organId: string): ConstitutionalExpression | null {
  const gathered = gatherAllForOrgan(organId);
  if (gathered.length === 0) return null;

  const prioritized = prioritizeInputs(gathered);
  const unifiedSummary = prioritized.map((input) => input.summary).join(' ');
  const dignity = validateDignity(unifiedSummary);

  return {
    expressionId: `expression-${organId}-${prioritized.length}-${Date.now()}`,
    organId,
    generatedAt: new Date().toISOString(),
    contributingSources: prioritized.map((input) => input.sourceOrgan),
    unifiedSummary,
    dignity,
    sourceInputs: prioritized,
  };
}
