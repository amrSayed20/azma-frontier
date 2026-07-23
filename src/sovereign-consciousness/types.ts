/**
 * AZMA OS — THE CONSTITUTIONAL CONSCIOUSNESS (THE LIVING AWARENESS)
 * Construction Phase VII — Type Definitions
 *
 * Authority: "The Constitutional Construction of the Living Body,"
 * Construction Phase VII ("The Constitutional Consciousness — The Birth
 * of the Living Awareness").
 *
 * DRIFT FOUND AND DISCLOSED before any code was written: the Skeleton's
 * own organ-registry.ts already registers exactly one organ for
 * region-of-consciousness/system-of-consciousness — 'global-ui-runtime',
 * named "The Constitutional Nervous System (Global UI Runtime)," whose
 * constitutionalPurpose text cites "(Phase II, Article I)" and whose
 * Boundary explicitly reads "Shall never become the Mind... Shall never
 * become the Heart" (an almost verbatim match to this phase's own
 * Constitutional Limits). Phase II (Construction of src/sovereign-
 * nervous-system/) already fulfilled the TRANSPORT half of this organ's
 * purpose ("carry constitutional perception between organs"), but the
 * Organ Registry's implementationStatus was never updated afterward —
 * it still read 'not-yet-implemented' with an evidenceNote citing a
 * repository search from BEFORE Phase II existed (SIO-010,
 * 2026-07-11). This phase corrects that drift (see
 * organ-registry.ts) and completes the organ's remaining, AWARENESS
 * half: region-of-consciousness's own purpose text reads "Recognizes
 * the condition of the Empire... observes, understands, awakens
 * constitutional perception" and system-of-consciousness's purpose
 * reads "Allows the Empire to recognize itself — observation, awareness,
 * presence, constitutional perception. This system awakens before
 * judgment" — i.e. transport (Phase II) and awareness (this phase) are
 * two layers of the SAME organ, not two competing organs.
 *
 * NAMING DISCLOSURE — "Presence": this phase's own "Constitutional
 * Presence Layer" objective is the 4th distinct use of the word
 * "Presence" found across this repository this campaign (after ACDE's
 * narrow DirectorPresence, Makman's unrelated "Living Presence Layer"
 * goal-architecture bridge, and Construction Phase VI's cinematic
 * Imperial Presence). Scoped here narrowly and only to: whether an organ
 * is currently PRESENT — i.e. actively observed/reporting — in the
 * Sovereign Body. This is exactly what the Heart's own Continuity
 * Tracker (Phase IV) already computes; presence-layer.ts is a thin,
 * disclosed lens over it, not a second continuity mechanism.
 */

import type { ConstitutionalSignal, ConstitutionalSignalType } from '../sovereign-nervous-system';
import type { OrganContinuityStatus } from '../sovereign-heart';

export type AwarenessDimension = 'Condition' | 'Harmony' | 'Imbalance' | 'Change';

export interface AwarenessDimensionDescriptor {
  readonly dimension: AwarenessDimension;
  readonly description: string;
  readonly evidenceSource: string;
}

/** One organ's complete, read-only observable condition — state + presence, never interpreted. */
export interface OrganCondition {
  readonly organId: string;
  readonly knownState: Partial<Record<ConstitutionalSignalType, ConstitutionalSignal>>;
  readonly presenceStatus: OrganContinuityStatus;
}

export interface ConstitutionalHarmonyObservation {
  readonly harmonious: boolean;
  readonly statusCounts: Readonly<Record<OrganContinuityStatus, number>>;
  readonly evidence: string;
}

export interface ConstitutionalChangeRecord {
  readonly organId: string;
  readonly from: OrganContinuityStatus | null;
  readonly to: OrganContinuityStatus;
  readonly recognizedAt: string;
}

export interface SelfRecognitionResult {
  readonly organId: 'global-ui-runtime';
  readonly hasCompleteConstitutionalHome: boolean;
  readonly evidence: string;
}

export interface ConstitutionalAwarenessCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}
