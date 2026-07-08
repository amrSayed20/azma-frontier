/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 9 — RUNTIME FOUNDATION PACKAGE (STEP 1 OF 5: RUNTIME CONTEXT)
 *
 * POINTER FILE, NOT A NEW DEFINITION. RUNTIME.ts already defines the
 * constitutional runtime-awareness carrier (`RuntimeContext`: creatorId,
 * sessionId, projectId) that every runtime construct in this Chamber
 * travels with. Restating it here under a new name would create exactly
 * the parallel-authority problem RAS-BLOCKER-01 first resolved for this
 * Chamber, and that CERTIFICATION_RULES.ts's rule5_pointerNotDuplicate now
 * makes explicit. This file re-exports RUNTIME.ts's own type — it does not
 * define a second one.
 */

export type { RuntimeContext } from './RUNTIME';

export const RUNTIME_CONTEXT_POINTER = {
  definedIn: 'RUNTIME.ts',
  exportName: 'RuntimeContext',
  reason: 'The scope carrier every runtime call travels with — identity only, never content. Already established when RUNTIME.ts was originally certified (AZMA-CA-RULING-005).',
  fieldsCarried: ['creatorId', 'sessionId', 'projectId'],
  ownership: 'Cross-cutting runtime infrastructure used solely for correlation and execution context — recognized as possessing no constitutional authority, no architectural ownership, and never containing constitutional state (Finding III, the ruling that certified RUNTIME.ts).',
  status: 'PACKAGE II — STAGE 9, STEP 1 OF 5 — RUNTIME CONTEXT, submitted for Chief Architect review. No new type introduced.',
} as const;
