/**
 * AZMA OS — THE CONSTITUTIONAL WISDOM (IMPERIAL MATURITY)
 * Construction Phase IX — Type Definitions
 *
 * Authority: "The Constitutional Construction of the Living Body,"
 * Construction Phase IX ("The Constitutional Wisdom — The Birth of
 * Imperial Maturity").
 *
 * FIVE-INPUT DISCLOSURE: the Mission names 5 inputs Wisdom transforms —
 * Knowledge, Memory, Awareness, Understanding, Purpose. None is invented
 * here; each maps onto an already-certified type from an earlier phase
 * (see wisdom-registry.ts for the full, evidenced mapping). "Purpose"
 * itself already has TWO existing meanings in this repository —
 * ConstitutionalOrgan.constitutionalPurpose (a fixed declarative string,
 * Phase I) and the ConstitutionalSignalType 'Purpose' (a category of
 * live signal, Phase II) — this phase reads both, disclosed explicitly
 * rather than silently picking one.
 *
 * JUDGMENT VS. KNOWLEDGE, disclosed precisely (Certification Requirement
 * 3): a ConstitutionalClaim (Phase V) is the Sovereign Core's own
 * conclusion about an organ. A ConstitutionalJudgment (this phase) never
 * re-derives or second-guesses that conclusion — doing so would be
 * "replacing the Sovereign Core," explicitly forbidden. Instead, a
 * Judgment is a narrow, structural FAITHFULNESS check: does the claim
 * cite a real, traceable source, and is its kind one of the 4 legitimate
 * ConstitutionalClaimKind values? This is provenance verification, never
 * content re-evaluation — the only way "judgment" can exist here without
 * governing.
 */

import type { ConstitutionalClaim, ConstitutionalAdvisory, ConstitutionalUnderstanding } from '../sovereign-core';
import type { OrganCondition, ConstitutionalHarmonyObservation } from '../sovereign-consciousness';
import type { ArchivedAdvisory } from '../sovereign-memory';

export type WisdomInput = 'Knowledge' | 'Memory' | 'Awareness' | 'Understanding' | 'Purpose';

export interface WisdomInputDescriptor {
  readonly input: WisdomInput;
  readonly evidenceSource: string;
}

export type ConstitutionalJudgmentVerdict = 'faithful' | 'unfaithful' | 'insufficient-evidence';

/** A structural faithfulness check about ONE Claim — never a re-derivation of its content. */
export interface ConstitutionalJudgment {
  readonly organId: string;
  readonly claimId: string;
  readonly verdict: ConstitutionalJudgmentVerdict;
  readonly reason: string;
}

export interface ReflectionSummary {
  readonly organId: string;
  readonly totalArchivedAdvisories: number;
  readonly claimKindCounts: Readonly<Record<ConstitutionalClaim['kind'], number>>;
}

export interface MaturityRecord {
  readonly organId: string;
  readonly maturityScore: number;
  readonly evidence: string;
}

export interface LearningIntegrationSummary {
  readonly organId: string;
  readonly reflection: ReflectionSummary;
  readonly wisdomEntryCount: number;
  readonly note: string;
}

export interface DecisionPrinciple {
  readonly principle: string;
  readonly rationale: string;
}

export interface ConstitutionalFaithfulnessReport {
  readonly organId: string;
  readonly judgments: readonly ConstitutionalJudgment[];
  readonly allFaithful: boolean;
}

export interface ConstitutionalWisdomCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}

export type { ConstitutionalClaim, ConstitutionalAdvisory, ConstitutionalUnderstanding, OrganCondition, ConstitutionalHarmonyObservation, ArchivedAdvisory };
