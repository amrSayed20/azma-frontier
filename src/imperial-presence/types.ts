/**
 * AZMA OS — THE CONSTITUTIONAL IDENTITY (THE IMPERIAL PRESENCE)
 * Construction Phase VI — Type Definitions
 *
 * Authority: "The Constitutional Construction of the Living Body,"
 * Construction Phase VI ("The Constitutional Identity — The Birth of the
 * Imperial Presence").
 *
 * NAMING DISCLOSURE: this phase's own name, "The Constitutional
 * Identity," is not a new organ. A dedicated investigation performed
 * before any code in this module was written confirmed that all 9 of
 * this phase's Primary Objectives (Face, Voice, Tongue, Motion Authority,
 * Lighting Authority, Typography Authority, Color Authority, Cinematic
 * Director, Presence Layer) already have complete, certified, live prior
 * art: the Skeleton's own "sovereign-identity-layer" organ
 * (src/sovereign-identity/, implemented-and-live since SIO-001 through
 * SIO-009) and "sovereign-tongue" organ (src/core/tongue/,
 * implemented-and-live since SIO-002) together already cover every one
 * of them — confirmed by system-registry.ts's own purpose string for
 * system-of-identity: "Expresses the Empire — its Face, Voice, Tongue,
 * Motion, Light, Typography, Cinematic Presence, Sound."
 *
 * This module is therefore NOT named src/sovereign-identity/ — that name
 * is already taken by the certified organ this phase would otherwise
 * collide with, the same collision risk already seen once this campaign
 * with Al-Watin/Al-Wateen. It is named for this phase's own subtitle
 * instead ("The Birth of the Imperial Presence") and built as a
 * certification/unification layer — proving, by real test, that ONE
 * Constitutional Identity already exists and is inherited by every
 * chamber — exactly what this phase's own Certification Requirements ask
 * to VERIFY, not to construct from scratch. See
 * objective-registry.ts for the full 9-objective-to-artifact mapping.
 */

import type { ChamberContext } from '../sovereign-identity/orchestrator';

export type ConstitutionalIdentityObjective =
  | 'Face'
  | 'Voice'
  | 'Tongue'
  | 'Motion Authority'
  | 'Lighting Authority'
  | 'Typography Authority'
  | 'Color Authority'
  | 'Cinematic Director'
  | 'Presence Layer';

export interface ObjectiveArtifactMapping {
  readonly objective: ConstitutionalIdentityObjective;
  readonly existingArtifact: string;
  readonly sourceModule: string;
  readonly evidenceNote: string;
}

export interface ConstitutionalIdentityCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}

export interface ChamberIdentityCoverage {
  readonly pathname: string;
  readonly resolvedContext: ChamberContext;
  readonly hasCompleteIdentity: boolean;
}
