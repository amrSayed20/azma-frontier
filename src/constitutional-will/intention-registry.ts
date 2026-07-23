/**
 * AZMA OS — THE CONSTITUTIONAL WILL
 * The Constitutional Intention Registry
 * Construction Campaign
 *
 * Names the one and only readiness state this module recognizes.
 * Deliberately a single-value union (see types.ts) — there is no
 * 'executing' or 'executed' state, because this module never executes
 * anything.
 */

export const CONSTITUTIONAL_INTENTION_READINESS_STATES = ['formed'] as const;

export const CONSTITUTIONAL_INTENTION_FORMATION_RULE =
  'A ConstitutionalIntention is formed only when its source ReceivedExpression is traceable to Constitutional Reception (a real receptionId), was marked attention-worthy by Reception\'s own Attention Layer, and carries an expression whose dignity was already approved by the Constitutional Expression Layer. None of these three facts is re-derived here — all are read, unmodified, from what Reception already recorded.';
