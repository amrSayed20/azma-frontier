/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * SOVEREIGN PURPOSE FOUNDATION — Constitutional Foundation Package I
 *
 * The constitutional root of the relationship CREATOR → SOVEREIGN PURPOSE.
 * A Sovereign Purpose is not a Goal and not a project. It is the durable
 * expression of why a Creator is here — the living statement the Empire
 * remembers across every session, every Asset, every fulfilled Goal.
 *
 * ISovereignPurposeStore is declared here so Makman's chamber defines the
 * contract it needs. persistent-storage/sovereign-purpose-repository.ts
 * implements it. The chamber never imports from persistent-storage directly
 * — same inversion-of-dependency pattern as IGoalRepository/ICinematicLedger.
 *
 * CONSTITUTIONAL HIERARCHY (from the Chief Architect's Construction Decree):
 * CREATOR → SOVEREIGN PURPOSE → MILESTONE GOALS → PROJECTS/ASSETS →
 * REAL-WORLD OUTCOMES → FULFILLMENT ASSESSMENT → GAP DETECTION →
 * RECOMMENDATION → CREATOR DECISION → NEXT ACTION → REASSESSMENT
 *
 * This Package builds only the root: CREATOR → SOVEREIGN PURPOSE.
 * Every layer above it is future work, not this Package's responsibility.
 */

/**
 * The durable expression of a Creator's sovereign intent.
 * Belongs to exactly one Creator; survives restart, deployment, and
 * multi-instance execution. A Creator who has never stated their Sovereign
 * Purpose has no SovereignPurpose record — null is the honest state.
 */
export interface SovereignPurpose {
  readonly creatorId: string;
  readonly purposeStatement: string;
  readonly createdAtMs: number;
  readonly updatedAtMs: number;
}

/**
 * Constitutional persistence contract for Sovereign Purpose.
 * Declared in the chamber; implemented in persistent-storage.
 * SOEL depends on this interface, never on the concrete repository.
 */
export interface ISovereignPurposeStore {
  getSovereignPurpose(creatorId: string): SovereignPurpose | null;
  setSovereignPurpose(creatorId: string, purposeStatement: string): SovereignPurpose;
}
