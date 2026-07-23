/**
 * AZMA OS — Sovereign Identity Orchestrator (SIO) V1.0
 * Public API — import from here, never directly from orchestrator.ts
 * or director-session.ts.
 */

export {
  getSovereignIdentity,
} from './orchestrator';

export type {
  ChamberContext,
  ToneProfile,
  ChamberScore,
  SentenceRhythm,
  SovereignConstitutionalConstants,
  SovereignIdentityBundle,
} from './orchestrator';

/**
 * Director Session (SIO-005) — coordinates ACDE's Director functions per
 * chamber. Not wired into any live page; see SIO_005_ENGINEERING_REVIEW.ts.
 */
export { DirectorSession, createDirectorSession } from './director-session';

/**
 * Director Stage (SIO-005B) — the live, mounted presentation layer for
 * Director-directed scene transitions. Mounted once in app/layout.tsx.
 * See SIO_005B_ENGINEERING_REVIEW.ts.
 */
export { DirectorStage } from './director-stage/DirectorStage';

/**
 * Route Context Resolution (SIO-005B) — resolves a pathname to its
 * constitutional ChamberContext. Previously used only internally by
 * DirectorStage; exported here (Construction Phase VI, "The Constitutional
 * Identity") so the Imperial Presence certification layer can verify
 * route coverage without duplicating this resolver. No behavior changed.
 */
export { resolveChamberContext } from './director-stage/route-context';

/**
 * Constitutional Cooperation Framework (SIO-009) — the declarative
 * Constitutional Event vocabulary, organ-reaction-mode registry, and
 * priority ordering from Dossier Chapter VI/VIII. Vocabulary only — no
 * event bus, no dispatch, wired into nothing. See
 * SIO_009_ENGINEERING_REVIEW.ts.
 */
export {
  CONSTITUTIONAL_EVENTS,
  CONSTITUTIONAL_ORGANS,
  ORGAN_REACTION_MODE,
  CONSTITUTIONAL_ORGAN_STATUS,
  CONSTITUTIONAL_PRIORITY_ORDER,
  CONSTITUTIONAL_PRIORITY_EXAMPLES,
  FUTURE_RUNTIME_CONTRACT,
} from './constitutional-cooperation';

export type {
  ConstitutionalEvent,
  ConstitutionalOrgan,
  OrganStatus,
} from './constitutional-cooperation';
