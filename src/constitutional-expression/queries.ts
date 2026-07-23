/**
 * AZMA OS — THE CONSTITUTIONAL EXPRESSION
 * Read-only Query Layer
 * Construction Campaign
 *
 * Whole-Body views over the Expression Pipeline and its own 5
 * Certification Requirements — used for Council review, never for
 * decision-making.
 */

import { filterOrgansWithSufficientEvidence } from './expression-filter';
import { composeExpressionForOrgan } from './expression-composer';
import {
  verifyExpressionOriginatesFromRealEvidence,
  verifyExpressionNeverAltersTruth,
  verifyMultipleOrgansBecomeOneVoice,
  verifyExpressionPreservesDignity,
  verifyNoOrganBypassesExpressionLayer,
} from './certification';
import type { ConstitutionalExpression, ConstitutionalExpressionCertification } from './types';

/** Composes an expression for every organ with at least `minimumSources` of real evidence. */
export function composeExpressionsForRelevantOrgans(minimumSources: number = 1): readonly ConstitutionalExpression[] {
  return filterOrgansWithSufficientEvidence(minimumSources)
    .map((organId) => composeExpressionForOrgan(organId))
    .filter((expression): expression is ConstitutionalExpression => expression !== null);
}

export function getConstitutionalExpressionCertificationReport(organId: string): readonly ConstitutionalExpressionCertification[] {
  return [
    verifyExpressionOriginatesFromRealEvidence(organId),
    verifyExpressionNeverAltersTruth(organId),
    verifyMultipleOrgansBecomeOneVoice(organId),
    verifyExpressionPreservesDignity(organId),
    verifyNoOrganBypassesExpressionLayer(organId),
  ];
}
