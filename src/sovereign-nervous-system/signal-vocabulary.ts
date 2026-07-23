/**
 * AZMA OS — THE CONSTITUTIONAL NERVOUS SYSTEM
 * The Constitutional Signal Vocabulary
 * Construction Phase II
 *
 * Per the Constitutional Principle of Inheritance, the Constitutional
 * Event vocabulary is NOT redefined here — it is inherited verbatim from
 * src/sovereign-identity (built SIO-009, itself sourced from the
 * Sovereign Identity Dossier's Chapter VI). Re-exporting it from this
 * module only makes it discoverable alongside the Nervous System's own,
 * genuinely new Signal Types (defined in types.ts, Phase II Article
 * III) — it is the same constant, not a copy.
 *
 * Imported directly from constitutional-cooperation.ts, deliberately NOT
 * from the Sovereign Identity barrel (src/sovereign-identity/index.ts) —
 * that barrel also re-exports DirectorStage, a React component with its
 * own CSS import, which is unnecessary and (as discovered while writing
 * this phase's tests) unsafe baggage for a module that only needs one
 * type and one constant: Jest cannot parse a bare .css import outside
 * Next.js's own build pipeline.
 */

export { CONSTITUTIONAL_EVENTS } from '../sovereign-identity/constitutional-cooperation';
export type { ConstitutionalEvent } from '../sovereign-identity/constitutional-cooperation';

export { CONSTITUTIONAL_SIGNAL_TYPES } from './types';
export type { ConstitutionalSignalType } from './types';
