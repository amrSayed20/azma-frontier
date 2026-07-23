/**
 * AZMA OS — THE CONSTITUTIONAL WISDOM
 * The Constitutional Maturity Layer
 * Construction Phase IX
 *
 * Maturity is measured, never claimed: a simple, honest,
 * monotonically-non-decreasing count of accumulated experience (the
 * number of Advisories the Constitutional Memory has ever archived for
 * an organ). It makes no qualitative claim about how "wise" an organ
 * is — Memory's Knowledge Repository is append-only (Phase VIII), so
 * this count can only ever grow or stay the same, never decrease.
 */

import { reflectOnOrgan } from './reflection-engine';
import type { MaturityRecord } from './types';

export function getMaturityForOrgan(organId: string): MaturityRecord {
  const reflection = reflectOnOrgan(organId);
  const maturityScore = reflection.totalArchivedAdvisories;
  return {
    organId,
    maturityScore,
    evidence: `Maturity is measured as the count of archived Advisories the Constitutional Memory has accumulated for this organ (${maturityScore}) — a monotonically non-decreasing measure of accumulated experience, never a qualitative judgment of wisdom itself.`,
  };
}
