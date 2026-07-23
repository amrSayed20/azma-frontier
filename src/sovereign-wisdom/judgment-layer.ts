/**
 * AZMA OS — THE CONSTITUTIONAL WISDOM
 * The Constitutional Judgment Layer
 * Construction Phase IX
 *
 * See types.ts's own "JUDGMENT VS. KNOWLEDGE" disclosure: a Judgment
 * never re-derives or second-guesses a Claim's own conclusion — it only
 * verifies the Claim's structural provenance (does it cite real,
 * traceable grounding, and is its kind one of the 4 legitimate
 * ConstitutionalClaimKind values). This is the only way "judgment" can
 * exist here without governing, which this phase's Constitutional Limits
 * explicitly forbid.
 */

import type { ConstitutionalClaim, ConstitutionalAdvisory, ConstitutionalJudgment, ConstitutionalJudgmentVerdict } from './types';

const LEGITIMATE_CLAIM_KINDS: readonly ConstitutionalClaim['kind'][] = ['fact', 'inference', 'uncertainty', 'recommendation'];

export function judgeClaim(organId: string, claim: ConstitutionalClaim): ConstitutionalJudgment {
  let verdict: ConstitutionalJudgmentVerdict;
  let reason: string;

  if (!claim.basedOn || claim.basedOn.trim().length === 0) {
    verdict = 'insufficient-evidence';
    reason = 'Claim carries no basedOn citation — cannot be judged faithful without traceable grounding.';
  } else if (!LEGITIMATE_CLAIM_KINDS.includes(claim.kind)) {
    verdict = 'unfaithful';
    reason = `Claim kind "${claim.kind}" is not one of the 4 legitimate ConstitutionalClaimKind values.`;
  } else {
    verdict = 'faithful';
    reason = `Claim is grounded in "${claim.basedOn}" and carries a legitimate kind ("${claim.kind}").`;
  }

  return { organId, claimId: claim.claimId, verdict, reason };
}

/** Judges every claim in one Advisory — never the Advisory's own conclusion as a whole, only each claim's individual provenance. */
export function judgeAdvisory(organId: string, advisory: ConstitutionalAdvisory): readonly ConstitutionalJudgment[] {
  return advisory.claims.map((claim) => judgeClaim(organId, claim));
}
