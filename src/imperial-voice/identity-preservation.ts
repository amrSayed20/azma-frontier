/**
 * AZMA OS — THE IMPERIAL VOICE
 * Identity Preservation Check
 *
 * A pure READ of src/imperial-presence/'s own already-certified Identity
 * Certification Report — never a re-derivation. Same discipline as
 * constitutional-aggregation's own identity-preservation.ts (renamed from
 * constitutional-manifestation): each
 * constitutional module reads the one canonical source directly rather
 * than depending on a sibling module.
 */

import { getConstitutionalIdentityCertificationReport } from '../imperial-presence';

export function isIdentityCurrentlyPreserved(): boolean {
  const report = getConstitutionalIdentityCertificationReport();
  return report.length > 0 && report.every((entry) => entry.verified);
}
