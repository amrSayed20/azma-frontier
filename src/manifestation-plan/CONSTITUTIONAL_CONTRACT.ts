/**
 * AZMA OS — THE MANIFESTATION PLAN
 * CONSTITUTIONAL ARCHITECTURAL CONTRACT
 *
 * Ratified 2026-07-18 (Awareness & Manifestation Final Architectural
 * Ruling, Article IV). This is the permanent architectural reference for
 * the Manifestation Plan — any future mission touching it must be
 * measured against this contract first.
 */

export const MANIFESTATION_PLAN_CONSTITUTIONAL_PURPOSE =
  'The Manifestation Plan is the neutral runtime contract produced by the Imperial Awareness Engine ' +
  'and consumed by the Imperial Manifestation Engine. It separates constitutional decision-making from ' +
  'presentation by belonging to neither engine.';

export const MANIFESTATION_PLAN_RESPONSIBILITIES = [
  'Declaring which constitutional capabilities are available, by id, in a given moment.',
] as const;

export const MANIFESTATION_PLAN_NON_RESPONSIBILITIES = [
  'How a capability is rendered — label, style, component shape, layout. Owned by Presentation Consumers.',
  'Why a capability is or is not available — that reasoning belongs entirely to the Imperial Awareness Engine and is not re-derivable from the Plan.',
  'Any dependency on the Imperial Awareness Engine\'s or Imperial Manifestation Engine\'s own internal types — the Plan must remain importable by either without importing the other.',
] as const;
