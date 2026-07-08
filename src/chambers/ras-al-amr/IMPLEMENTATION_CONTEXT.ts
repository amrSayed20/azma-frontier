/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 11 — IMPLEMENTATION FOUNDATION PACKAGE (STEP 1 OF 5: IMPLEMENTATION CONTEXT)
 * (Construction ID RAS-II-10. Certified as Stage 11, not Stage 10, per Chief
 * Architect ruling: this package sits at hierarchy position 21, between
 * Runtime[20] and Implementation — the unbroken stage=position-10 rule
 * holding across Stages 3-9 makes that Stage 11; Stage 10 is Runtime's own
 * already-certified number.)
 *
 * POINTER FILE, NOT A NEW DEFINITION. IMPLEMENTATION.ts already carries
 * RUNTIME.ts's own `RuntimeContext` directly (see buildChamberTransformationUpdate's
 * `context: RuntimeContext` parameter) — it never defined a second, Implementation-
 * specific context type. Defining one here would create exactly the parallel-
 * authority problem RAS-BLOCKER-01 first resolved for this Chamber, restated
 * for CERTIFICATION_RULES.ts's rule5_pointerNotDuplicate. This file re-exports
 * RUNTIME.ts's own type — it does not define a second one.
 */

export type { RuntimeContext } from './RUNTIME';

export const IMPLEMENTATION_CONTEXT_POINTER = {
  definedIn: 'RUNTIME.ts',
  exportName: 'RuntimeContext',
  reason: 'Implementation performs no work of its own scope-tracking — every function that needs runtime-awareness (buildChamberTransformationUpdate) accepts the same RuntimeContext RUNTIME.ts already defines, unchanged.',
  fieldsCarried: ['creatorId', 'sessionId', 'projectId'],
  ownership: 'Cross-cutting runtime infrastructure used solely for correlation and execution context — recognized as possessing no constitutional authority, no architectural ownership, and never containing constitutional state (Finding III, the ruling that certified RUNTIME.ts; reaffirmed unchanged when IMPLEMENTATION.ts was itself certified under AZMA-CA-RULING-006).',
  status: 'PACKAGE II — STAGE 11, STEP 1 OF 5 — IMPLEMENTATION CONTEXT, submitted for Chief Architect review. No new type introduced.',
} as const;
