/**
 * AZMA OS — THE SOVEREIGN CORE
 * The Constitutional Planning Layer
 * Construction Phase V
 *
 * Orders the Reasoning Layer's own recommendation-kind Claims into a
 * sequential, advisory Plan. A Plan is inert data — nothing in this file,
 * or anywhere else in this module, ever invokes a step. Producing the
 * ordered list IS the entirety of this layer's responsibility.
 */

import type { ConstitutionalClaim, ConstitutionalPlan } from './types';

let stepSequence = 0;
function nextStepId(organId: string): string {
  stepSequence += 1;
  return `step-${organId}-${stepSequence}`;
}

export function planForOrgan(organId: string, claims: readonly ConstitutionalClaim[]): ConstitutionalPlan {
  const steps = claims
    .filter((claim) => claim.kind === 'recommendation')
    .map((claim) => ({
      stepId: nextStepId(organId),
      description: claim.statement,
      justifiedByClaimId: claim.claimId,
    }));
  return { organId, steps };
}
