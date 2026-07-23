/**
 * AZMA OS — THE CONSTITUTIONAL CONSCIOUSNESS
 * The Constitutional Awareness Registry
 * Construction Phase VII
 *
 * A pure, declarative vocabulary: the 4 dimensions of awareness this
 * phase's own Constitutional Responsibilities name ("Recognize
 * constitutional condition... Detect constitutional imbalance...
 * Recognize constitutional harmony... Recognize constitutional
 * change"), each mapped to the real, already-existing evidence source
 * it is read from. No new signal types, no new transport — every source
 * cited here already exists and is unmodified by this phase.
 */

import type { AwarenessDimensionDescriptor } from './types';

export const CONSTITUTIONAL_AWARENESS_DIMENSIONS: readonly AwarenessDimensionDescriptor[] = [
  {
    dimension: 'Condition',
    description: "One organ's complete, currently-known observable state and presence.",
    evidenceSource:
      'src/sovereign-nervous-system/state-registry.ts (observeOrganState) + src/sovereign-heart/continuity-tracker.ts (getOrganContinuity)',
  },
  {
    dimension: 'Harmony',
    description: 'Whether every currently-observed organ shares the same presence status — a structural, non-evaluative fact.',
    evidenceSource: 'src/sovereign-heart/continuity-tracker.ts (listAllOrganContinuity), aggregated across all Skeleton organs',
  },
  {
    dimension: 'Imbalance',
    description: 'The same structural fact as Harmony, read the other way: at least one organ\'s presence status diverges from the rest.',
    evidenceSource: 'src/sovereign-heart/continuity-tracker.ts (listAllOrganContinuity), aggregated across all Skeleton organs',
  },
  {
    dimension: 'Change',
    description:
      "A recognized transition in one organ's presence status, observed at the moment a signal arrives from that organ — recorded, never interpreted. DISCLOSED LIMITATION: this is event-driven, not polling, so it reliably recognizes an organ's arrival (never-observed to continuous) but cannot, by construction, notice an organ passively falling silent — that would require a timer of its own, which would risk duplicating the Heart's own rhythm (Constitutional Limits: \"shall never replace the Heart\"). See observation-layer.ts.",
    evidenceSource: 'observation-layer.ts\'s own live subscription to src/sovereign-nervous-system (observeAll), comparing each new reading against the last one recognized',
  },
] as const;
