/**
 * AZMA OS — Sovereign Operational Entry Layer (SOEL) V1.0
 * Public API — import from here, never directly from soel.ts/composition.ts.
 */

export { SovereignOperationalEntryLayer } from './soel';
export { soel } from './composition';
// PACKAGE IX: re-exported so a consumer (e.g. Ras Al-Amr's Automatic
// Director) can type a genuinely-fetched Goal without importing from
// src/chambers/makman-al-ghayah directly — SOEL remains the one boundary.
export type { GoalContract, GoalPriority } from '../chambers/makman-al-ghayah/goal-contracts';
// PACKAGE XV: PacingPreference re-exported through the same boundary so
// a consumer can type GoalContract.pacingPreference without a direct
// import into Makman's chamber.
export type { PacingPreference } from '../chambers/makman-al-ghayah/goal-contracts';
// PACKAGE XI: AccessPolicy re-exported through the same boundary so a
// consumer can type GoalContract.commercialIntent's own accessPolicy
// field without a direct import into Makman's chamber.
export type { AccessPolicy } from '../chambers/makman-al-ghayah/publication-contracts';
