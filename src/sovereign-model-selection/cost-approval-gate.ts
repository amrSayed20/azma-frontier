import type { ModelSelection } from './types';

/**
 * Cost disclosure shown to Creator before any paid generation executes.
 *
 * AZMA OS Economic Law (Section VII of Construction Order):
 *   SELECT MODEL → DETERMINE PARAMETERS → CALCULATE COST
 *   → DISCLOSE → AWAIT CREATOR APPROVAL → EXECUTE
 *
 * A paid generation MUST NOT proceed to provider execution without prior
 * Creator approval. Free-trial generations bypass the gate — the
 * entitlement IS the Creator's consent.
 */
export interface GenerationCostProposal {
  readonly selection: ModelSelection;
  readonly estimatedCost: number;
  readonly currency: 'azma-credits';
  readonly freeTrial: boolean;
  readonly requiresApproval: boolean;
}

/**
 * Builds the cost proposal that must be shown to the Creator before
 * a paid generation is dispatched to any provider.
 *
 * For free-trial: requiresApproval is false (entitlement = consent).
 * For paid:       requiresApproval is true  (explicit approval required).
 */
export function buildCostProposal(params: {
  readonly selection: ModelSelection;
  readonly estimatedCost: number;
  readonly freeTrial: boolean;
}): GenerationCostProposal {
  return {
    selection: params.selection,
    estimatedCost: params.estimatedCost,
    currency: 'azma-credits',
    freeTrial: params.freeTrial,
    requiresApproval: !params.freeTrial,
  };
}

/**
 * Checks whether generation is cleared to proceed to provider execution.
 *
 * Returns 'cleared' when:
 *   - generation is covered by a free-trial entitlement, OR
 *   - the Creator has explicitly approved the cost proposal.
 *
 * Returns 'blocked' when:
 *   - generation is paid AND the Creator has not approved.
 *
 * This gate applies equally to initial generations and to regenerations
 * triggered by platform-adaptation failure (Section X of Construction Order):
 * every paid provider call requires its own approved proposal.
 */
export function verifyCostApproval(
  proposal: GenerationCostProposal,
  creatorApproved: boolean,
): 'cleared' | 'blocked' {
  if (proposal.freeTrial) return 'cleared';
  return creatorApproved ? 'cleared' : 'blocked';
}
