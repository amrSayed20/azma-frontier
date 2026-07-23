/**
 * AZMA OS — CHAMBER VISION
 * Type Definitions
 *
 * "The Registry defines the Chamber. The Vision defines the Chamber's
 * philosophy. These are separate constitutional artifacts. They shall
 * never be merged." (2026-07-23) — deliberately its own module, not a
 * field added to src/chamber-identity/'s ChamberIdentityProfile.
 * Identity answers "who am I"; Vision answers "how do I think."
 */

import type { ChamberId } from '@/src/chamber-identity';

export interface ProductionMode {
  readonly name: string;
  readonly description: string;
}

export interface ImperialVisionDocument {
  readonly chamberId: ChamberId;
  /** Chamber Philosophy — its core worldview, the belief that justifies its own existence. */
  readonly philosophy: string;
  /** Chamber Constitutional Responsibility — not Identity's factual authorityScope restated;
      a philosophical account of what that responsibility means and where it stops. */
  readonly constitutionalResponsibility: string;
  /** Chamber Personality — how its character (see TONE_PROFILES) manifests in behavior, not a repeated one-liner. */
  readonly personality: string;
  /** Creator Experience — what it subjectively feels like to be in this Chamber, honestly, including where that feeling is not yet real. */
  readonly creatorExperience: string;
  /** Production Modes — real, named operating modes, where the Chamber genuinely has more than one. null when it has exactly one continuous mode. */
  readonly productionModes: readonly ProductionMode[] | null;
  /** Entry and Exit Transformation — how the Creator is different leaving than entering, not merely the trigger or the artifact. */
  readonly entryExitTransformation: string;
  /** Unique Chamber Value — what only this Chamber provides; why no other Chamber could substitute for it. */
  readonly uniqueValue: string;
}
