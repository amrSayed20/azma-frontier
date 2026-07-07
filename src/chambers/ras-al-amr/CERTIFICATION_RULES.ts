/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 8 — ARCHITECTURAL CERTIFICATION PACKAGE (STEP 1 OF 4: CERTIFICATION RULES)
 *
 * Defines the constitutional certification rules governing the Architecture
 * — the standard every Stage of Package II has actually been held to since
 * Stage 1, now made explicit rather than left implicit.
 */

export const CERTIFICATION_RULES = {
  rule1_constitutionalTraceability: {
    rule: 'Every artifact must trace to an approved constitutional article, or to an explicitly-flagged application/reframe of one.',
    enforcedBy: 'TRACEABILITY.ts cross-validation; VALIDATION_RULES.ts well-formedness rules.',
  },
  rule2_noNewAuthority: {
    rule: 'No Stage may introduce new constitutional, architectural, runtime, or implementation authority without an explicit Chief Architect directive or ruling.',
    enforcedBy: "Every Stage's own declaration object (introducesNewConstitutionalAuthority: false, etc.).",
  },
  rule3_engineeringValidation: {
    rule: 'Every Stage must pass TSC, ESLint, and Build before submission. Findings are never hidden to make a Stage appear to pass.',
    enforcedBy: 'Run at the end of every Stage in this Package, reported honestly including warnings found and fixed (e.g. the unused-var warning in IMPLEMENTATION.ts, Stage 5).',
  },
  rule4_gapsDocumentedNotRepaired: {
    rule: 'A gap discovered in an already-certified Stage is documented and escalated; it is never silently repaired by a Stage that holds no authority over the certified one.',
    enforcedBy: 'Every Certified Amendment in this Chamber\'s history (AZMA-CA-RULING-011, AZMA-CA-RULING-013) followed exactly this path.',
  },
  rule5_pointerNotDuplicate: {
    rule: 'A Stage documenting another Stage\'s content does so by pointer/reference, never by restating it in full — restating creates parallel authority.',
    enforcedBy: 'hierarchy.ts\'s "Not described here by design" pattern for every constructed position; OWNERSHIP.ts\'s "= <Domain>" inheritance pattern.',
  },
  rule6_flagUncertaintyExplicitly: {
    rule: 'Where a grounding is an application rather than a literal citation, or a name requires reframing, the artifact must say so in its own text — never presented with false confidence.',
    enforcedBy: 'Lens (INTERFACES.ts), ErrorRecovery (BEHAVIOR.ts).',
  },
  rule7_oneUnitPerStage: {
    rule: 'Where a Chief Architect directive authorizes multiple files as "one Architectural Work Package," they occupy exactly one Hierarchy position, not one each.',
    enforcedBy: 'DEPENDENCY_PACKAGE (position 16), VALIDATION_PACKAGE (position 17).',
  },
} as const;

export const CERTIFICATION_RULES_DECLARATION = {
  totalRules: Object.keys(CERTIFICATION_RULES).length,
  status: 'PACKAGE II — STAGE 8, STEP 1 OF 4 — CERTIFICATION RULES, submitted for Chief Architect review.',
} as const;
