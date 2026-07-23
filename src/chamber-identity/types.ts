/**
 * AZMA OS — CHAMBER IDENTITY
 * Type Definitions
 *
 * A Chamber Identity Profile is a constitutional asset, not UI copy — it
 * answers five questions a Chamber must be able to answer about itself,
 * for a future consumer (the eventual Imperial Chamber Gateway, or any
 * other system) to present honestly, not five lines of marketing text
 * written independently of what the Chamber actually does today.
 */

import type { ChamberContext } from '@/src/core/tongue';

/** The five real Chambers — every ChamberContext except 'universal', which names no Chamber. */
export type ChamberId = Exclude<ChamberContext, 'universal'>;

export interface ChamberIdentityProfile {
  readonly chamberId: ChamberId;
  /** Who is it — the Chamber's role in one sentence. Cites CONTEXT_ROLES; not a duplicate invention. */
  readonly who: string;
  /** Why does it exist — the purpose that justifies the Chamber, distinct from what it currently does. */
  readonly why: string;
  /** What can it do — grounded in real, evidenced capability (authority-registry.ts, the Sovereign Capability
      Diwan), not aspiration. Must stay honest when a Chamber's real capability is partial or disconnected. */
  readonly whatItCanDo: string;
  /** When should the Creator enter it — the real condition that makes this Chamber the right next step. */
  readonly whenToEnter: string;
  /** What will the Creator leave with — the real, current outcome, not the eventual one once every gap is closed. */
  readonly whatYouLeaveWith: string;
  /** Which existing constitutional records this profile was built from — so a reader can verify, not just trust. */
  readonly sourceCitations: readonly string[];
}

/**
 * CHAMBER IDENTITY V2 (2026-07-23): every field below except
 * `entryCondition`/`exitCondition` is DERIVED at query time from an
 * already-existing registry — never hand-duplicated here. See
 * queries.ts's getChamberIdentityProfileV2 for exactly where each one
 * comes from. This keeps V1 (a frozen, approved snapshot) untouched and
 * ensures V2 cannot go stale the way a second hand-copied source could.
 */
export interface ChamberIdentityProfileV2 extends ChamberIdentityProfile {
  /** From src/sovereign-body's boundary-registry.ts (ConstitutionalBoundary.prohibitions). */
  readonly constitutionalBoundaries: readonly string[];
  /** Identical source to constitutionalBoundaries — a prohibition list already IS a non-responsibility list. */
  readonly nonResponsibilities: readonly string[];
  /** From src/core/tongue's TONE_PROFILES[chamber].character. */
  readonly personality: string;
  /** Composed from TONE_PROFILES[chamber]'s vocabularyChar/sentenceRhythm/questionStyle. */
  readonly communicationStyle: string;
  /** From src/sovereign-body's relationship-registry.ts, filtered to this chamber — may be empty; an empty list is an honest finding, not a gap. */
  readonly relationships: readonly { readonly otherChamberOrOrganId: string; readonly kind: string; readonly evidenceNote: string }[];
  /** Derived from src/design-system/direction.ts's CHAMBER_SCORES — the arc's register plus the chamber's own pacing mode. */
  readonly emotionalExperience: string;
  readonly entryCondition: string;
  readonly exitCondition: string;
}
