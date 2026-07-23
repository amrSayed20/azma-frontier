/**
 * AZMA OS — THE CONSTITUTIONAL MANIFESTATION SYSTEM
 * The Manifestation Composer
 * Constitutional Package II
 *
 * Assembles every registered source's own input for one subject into a
 * single ConstitutionalManifestation — never creating, judging,
 * recommending, prioritizing, or filtering constitutional truth
 * (Constitutional Limits). Every source that has real data is included,
 * in registration order; none is dropped for being "less significant"
 * (that would be filtering/prioritizing, forbidden here — the opposite
 * of src/constitutional-expression/'s own, differently-bounded design).
 */

import { gatherFromAllSources } from './source-adapters';
import { isIdentityCurrentlyPreserved } from './identity-preservation';
import type { ConstitutionalManifestation } from './types';

let manifestationSequence = 0;

export function composeManifestationForSubject(subjectKey: string): ConstitutionalManifestation | null {
  const sources = gatherFromAllSources(subjectKey);
  if (sources.length === 0) return null;

  manifestationSequence += 1;
  return {
    manifestationId: `manifestation-${subjectKey}-${manifestationSequence}`,
    subjectKey,
    sources,
    identityPreserved: isIdentityCurrentlyPreserved(),
    generatedAt: new Date().toISOString(),
  };
}
