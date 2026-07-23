/**
 * AZMA OS — THE CONSTITUTIONAL EVOLUTION (CONTINUOUS MATURITY)
 * Construction Phase X — Type Definitions
 *
 * Authority: "The Constitutional Construction of the Living Body,"
 * Construction Phase X ("The Constitutional Evolution — The Birth of
 * Continuous Maturity").
 *
 * CONTINUITY WITH THE COUNCIL'S OWN DECISION ON WISDOM: Construction
 * Phase IX's Wisdom was ruled an emergent property of Al-Wateen, the
 * Sovereign Core, Constitutional Awareness, and Constitutional Memory —
 * "Wisdom belongs to the Living Body. Not to one organ." This phase
 * follows the identical discipline: Evolution does not introduce a new
 * measurement of maturity (Phase IX's MaturityRecord already is that
 * measurement) or a new history store (Phase VIII's History Archive
 * already is that record). It only RECORDS how those existing,
 * already-certified measurements change over time, and verifies that
 * the Skeleton's own declared identity (Phase I) is never silently
 * altered while they do.
 */

export interface EvolutionPhaseRecord {
  readonly phaseId: string;
  readonly name: string;
  readonly artifactPath: string | null;
  readonly summary: string;
}

/** A single recorded reading of an organ's maturity at one point in time — an audit trail entry, not a new measurement mechanism (the score itself is read from Wisdom's own getMaturityForOrgan). */
export interface MaturitySnapshot {
  readonly organId: string;
  readonly maturityScore: number;
  readonly recordedAt: string;
}

export interface ImprovementRecord {
  readonly organId: string;
  readonly improved: boolean;
  readonly delta: number;
  readonly evidence: string;
}

export interface RefinementObservation {
  readonly organId: string | null;
  readonly delta: number;
  readonly evidence: string;
}

export interface ContinuityEvaluation {
  readonly identityIntact: boolean;
  readonly historyImmutable: boolean;
  readonly evidence: string;
}

export interface ConstitutionalEvolutionCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}
