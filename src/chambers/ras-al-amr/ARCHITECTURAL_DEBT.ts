/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 8 — ARCHITECTURAL CERTIFICATION PACKAGE (STEP 4 OF 4: ARCHITECTURAL DEBT)
 *
 * Documents every remaining Architectural Debt, classified as Resolved,
 * Deferred, Shared Engine, Sovereign Core, or Future Runtime. Consolidates
 * every open item accumulated since Package II began — nothing here is
 * newly invented; each traces to where it was first found.
 */

export interface RasAlAmrArchitecturalDebtItem {
  readonly item: string;
  readonly classification: 'Resolved' | 'Deferred' | 'Shared Engine' | 'Sovereign Core' | 'Future Runtime';
  readonly origin: string;
}

export const ARCHITECTURAL_DEBT: readonly RasAlAmrArchitecturalDebtItem[] = [
  { item: 'Export Confirmation enforcement missing from Implementation', classification: 'Resolved', origin: 'Discovered Stage 5 review; resolved AZMA-CA-RULING-011.' },
  { item: 'Export Confirmation enforcement unreachable through Interface', classification: 'Resolved', origin: 'Discovered Stage 6 (USER) review; resolved AZMA-CA-RULING-013/014.' },
  { item: 'Recommendation Gate Judgment Vacancy', classification: 'Deferred', origin: 'AZMA-CA-RULING-009, Finding III — an Authorized Constitutional Vacancy by design; will become Sovereign Core debt once a supplier is authorized.' },
  { item: 'AI and SharedEngines interfaces lack a corresponding Behavior', classification: 'Deferred', origin: 'CONSISTENCY.ts (Stage 7); recommended Certified Amendment to BEHAVIOR.ts not yet authorized.' },
  { item: 'Lens contract\'s weak constitutional grounding', classification: 'Deferred', origin: 'INTERFACES.ts (Stage 4); flagged, awaiting Chief Architect confirmation.' },
  { item: 'ErrorRecovery behavior\'s reframe from a literal but ungrounded name', classification: 'Deferred', origin: 'BEHAVIOR.ts (Stage 5); flagged, awaiting Chief Architect confirmation.' },
  { item: 'PRESENCE.ts / most of TIME.ts / most of SPACE.ts folded into CHAMBER_CORE for lack of a dedicated Experience domain', classification: 'Deferred', origin: "ARCHITECTURE.ts's DOCUMENTED_COVERAGE_NOTE (Stage 2 replacement); awaiting confirmation this is the intended home." },
  { item: 'OWNERSHIP.ts does not name an owner for the Dependency Package or Validation Package artifacts themselves', classification: 'Deferred', origin: 'ARCHITECTURAL_GAPS.ts (this Stage) — newly documented.' },
  { item: "TRACEABILITY.ts's master chain does not include the Validation Package", classification: 'Deferred', origin: 'ARCHITECTURAL_GAPS.ts (this Stage) — newly documented.' },
  { item: 'No individual certification ruling was issued for Stage 6 or Stage 7', classification: 'Deferred', origin: 'ARCHITECTURAL_GAPS.ts (this Stage) — newly documented.' },
  { item: 'assembly-contracts.ts, assembly-directive-payloads.ts, ras-al-amr-state-manager.ts (Legacy, Constitutional Re-Derivation)', classification: 'Future Runtime', origin: "ARCHITECTURE.ts Section VII (Legacy Artifact Architectural Disposition) — positioned under Editing/Audio/Video Domains, not yet re-derived." },
  { item: 'vault-rehydration-bridge.ts (Legacy, Shared Engine Migration)', classification: 'Shared Engine', origin: 'ARCHITECTURE.ts Section VII — Sovereign Vault boundary, held by Integration Domain.' },
  { item: 'pre-publishing-boundary.ts (Legacy, Shared Engine Migration)', classification: 'Shared Engine', origin: 'ARCHITECTURE.ts Section VII — Makman Al-Ghayah boundary, held by Integration Domain.' },
  { item: 'All AI-assisted judgment routing (Director Core, Suggestion Domain, Guidance Domain)', classification: 'Sovereign Core', origin: 'ARCHITECTURE.ts domain definitions; Operating Charter Art. XI.' },
  { item: 'Shared Memory hand-off for Director DNA persistence', classification: 'Shared Engine', origin: 'AZMA-CA-RULING-009, Finding IV; MEMORY_DOMAIN, SharedBoundaryContract.' },
] as const;

export const ARCHITECTURAL_DEBT_SUMMARY = {
  total: ARCHITECTURAL_DEBT.length,
  resolved: ARCHITECTURAL_DEBT.filter((d) => d.classification === 'Resolved').length,
  deferred: ARCHITECTURAL_DEBT.filter((d) => d.classification === 'Deferred').length,
  sharedEngine: ARCHITECTURAL_DEBT.filter((d) => d.classification === 'Shared Engine').length,
  sovereignCore: ARCHITECTURAL_DEBT.filter((d) => d.classification === 'Sovereign Core').length,
  futureRuntime: ARCHITECTURAL_DEBT.filter((d) => d.classification === 'Future Runtime').length,
} as const;

export const ARCHITECTURAL_DEBT_DECLARATION = {
  status: 'PACKAGE II — STAGE 8, STEP 4 OF 4 — ARCHITECTURAL DEBT, submitted for Chief Architect review.',
} as const;

export const RAS_AL_AMR_ARCHITECTURAL_DEBT = {
  items: ARCHITECTURAL_DEBT,
  summary: ARCHITECTURAL_DEBT_SUMMARY,
  declaration: ARCHITECTURAL_DEBT_DECLARATION,
} as const;
