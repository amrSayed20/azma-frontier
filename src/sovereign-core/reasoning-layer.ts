/**
 * AZMA OS — THE SOVEREIGN CORE
 * The Constitutional Reasoning Layer
 * Construction Phase V
 *
 * Turns one organ's Understanding into a list of typed Constitutional
 * Claims — each explicitly tagged fact, inference, uncertainty, or
 * recommendation (Certification Requirement 3). Every rule here is
 * deterministic and grounded in already-known constitutional inputs (the
 * Organ Registry's own implementationStatus, the Heart's continuity
 * formula, the Nervous System's signal history) — no AI-provider call,
 * no free-form judgment, no invented fact (this phase's own Out of Scope
 * explicitly forbids AI-provider integration and LLM orchestration).
 * Reasoning never governs: a "recommendation" claim is only ever a
 * proposed next step for the Council/Creator to weigh — this layer never
 * acts on its own recommendations, which would be the exact authority
 * this phase's Constitutional Limits forbid the Core from exercising.
 */

import type { ConstitutionalClaim, ConstitutionalUnderstanding } from './types';

let claimSequence = 0;
function nextClaimId(organId: string): string {
  claimSequence += 1;
  return `claim-${organId}-${claimSequence}`;
}

export function reasonAboutOrgan(understanding: ConstitutionalUnderstanding): readonly ConstitutionalClaim[] {
  const { organId, knowledge, continuity, memory } = understanding;
  const claims: ConstitutionalClaim[] = [];

  if (!knowledge) {
    // UNCERTAINTY — the organ id has no constitutional home at all. Nothing
    // further can be honestly claimed, so reasoning stops here rather than
    // fabricating facts about an organ the Skeleton has never registered.
    claims.push({
      claimId: nextClaimId(organId),
      organId,
      kind: 'uncertainty',
      statement: `No Organ Registry entry exists for "${organId}" — the Core cannot ground any further claim about it.`,
      basedOn: 'src/sovereign-body/organ-registry.ts (absence)',
    });
    return claims;
  }

  // FACT — drawn directly from the Skeleton's own recorded truth.
  claims.push({
    claimId: nextClaimId(organId),
    organId,
    kind: 'fact',
    statement: `${knowledge.name} is recorded as "${knowledge.implementationStatus}" in the Skeleton's Organ Registry.`,
    basedOn: 'src/sovereign-body/organ-registry.ts',
  });

  // FACT — the Heart's own continuity determination, reused verbatim, never re-derived.
  claims.push({
    claimId: nextClaimId(organId),
    organId,
    kind: 'fact',
    statement: `Al-Wateen records this organ's continuity as "${continuity.status}"${continuity.lastSeenAt ? ` (last seen ${continuity.lastSeenAt})` : ' (never observed)'}.`,
    basedOn: 'src/sovereign-heart/continuity-tracker.ts',
  });

  // INFERENCE — derived from the continuity fact above, not an independent observation.
  if (continuity.status === 'silent') {
    claims.push({
      claimId: nextClaimId(organId),
      organId,
      kind: 'inference',
      statement: `${knowledge.name} was reporting constitutional signals but has since fallen silent beyond the Heart's configured threshold.`,
      basedOn: 'inference from the continuity fact above',
    });
  }

  // UNCERTAINTY — genuinely unknown, not an inference dressed up as one.
  if (continuity.status === 'never-observed') {
    claims.push({
      claimId: nextClaimId(organId),
      organId,
      kind: 'uncertainty',
      statement: `${knowledge.name} has never emitted a single constitutional signal — whether it is dormant, unwired, or unbuilt cannot be distinguished from constitutional history alone.`,
      basedOn: 'absence of any signal for this organ in the Nervous System Signal Log',
    });
  }

  // RECOMMENDATION — advisory only; the Core never acts on this itself.
  if (knowledge.implementationStatus === 'implemented-but-unconsumed' && memory.length === 0) {
    claims.push({
      claimId: nextClaimId(organId),
      organId,
      kind: 'recommendation',
      statement: `${knowledge.name} is built but has no recorded constitutional signal history — consider a future Integration Package to wire it to the Nervous System, as was already done for Hujjah Al-Damighah, Ras Al-Amr, and Makman Al-Ghayah.`,
      basedOn: 'Organ Registry status "implemented-but-unconsumed" combined with an empty Constitutional Memory',
    });
  }

  return claims;
}
