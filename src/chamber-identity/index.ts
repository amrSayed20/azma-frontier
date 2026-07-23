/**
 * AZMA OS — CHAMBER IDENTITY
 * Public API — import from here, never directly from the individual files.
 *
 * IMPERIAL CHAMBER UNIFICATION PROGRAM — CHAMBER IDENTITY (2026-07-23):
 * "The Empire shall evolve from living pages... to living Chambers." A
 * Chamber Identity Profile answers, per Chamber: who is it, why does it
 * exist, what can it do, when should the Creator enter it, and what will
 * the Creator leave with. These are constitutional assets, not UI copy —
 * this module owns none of the underlying truth (voice/tone stays with
 * src/core/tongue/, capability enumeration stays with
 * src/sovereign-capability/, implementation status stays with
 * src/sovereign-body/'s organ-registry.ts) and instead synthesizes a
 * single, honest, citable answer to five questions none of those sources
 * answer directly. Not yet consumed by any route or UI — this package
 * establishes the data a future Imperial Chamber Gateway (or any other
 * consumer) can present, rather than inventing presentation copy ahead
 * of it. constitutional-aggregation (src/constitutional-aggregation/)
 * would be a natural place to later register this as a third source
 * (per its own stated purpose of aggregating constitutional
 * self-description) — deliberately not done in this package, to keep
 * this a data-only addition.
 *
 * CHAMBER IDENTITY V2 (2026-07-23): V1 above is frozen exactly as
 * approved. getChamberIdentityProfileV2 adds Constitutional Boundaries,
 * Non-Responsibilities, Personality, Communication Style, Chamber
 * Relationships, and Emotional Experience — every one of them DERIVED at
 * query time from an already-existing registry (boundary-registry.ts,
 * relationship-registry.ts, TONE_PROFILES, CHAMBER_SCORES), never
 * hand-duplicated. Only Entry Condition and Exit Condition are genuinely
 * new authored content (entry-exit-conditions.ts) — nothing else in the
 * constitution answered those two questions. "Imperial Vision Documents"
 * (the separate "how do I think" artifact) remain unscoped — not started.
 */

export type { ChamberId, ChamberIdentityProfile, ChamberIdentityProfileV2 } from './types';
export { CHAMBER_IDENTITY_PROFILES } from './chamber-identity-registry';
export type { ChamberEntryExitConditions } from './entry-exit-conditions';
export { CHAMBER_ENTRY_EXIT_CONDITIONS } from './entry-exit-conditions';
export {
  getChamberIdentityProfile,
  listChamberIdentityProfiles,
  getChamberIdentityProfileV2,
  listChamberIdentityProfilesV2,
} from './queries';
