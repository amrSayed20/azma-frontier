/**
 * AZMA OS — THE IMPERIAL AWARENESS ENGINE (IAE)
 * CONSTITUTIONAL ARCHITECTURAL CONTRACT
 *
 * Ratified 2026-07-18 (Awareness & Manifestation Final Architectural
 * Ruling). This is the permanent architectural reference for IAE — any
 * future IAE mission must be measured against this contract before
 * implementation begins.
 */

export const IAE_CONSTITUTIONAL_PURPOSE =
  'IAE is the Runtime Context Intelligence of AZMA OS — it understands the current Creator, Chamber, ' +
  'Page, Workflow Stage, Transition State, Goal State, and Runtime Context, and decides what SHOULD ' +
  'become available. It never renders an interface.';

export const IAE_RESPONSIBILITIES = [
  'Resolving real-time constitutional context into a Manifestation Plan (see src/manifestation-plan/).',
  'Owning the single decision of what is available, for every Creator-facing threshold in AZMA OS.',
] as const;

export const IAE_NON_RESPONSIBILITIES = [
  'How an available capability is rendered — owned by the Imperial Manifestation Engine and its Presentation Consumers.',
  'Copy, in any language — owned by the Creator Language Experience (src/creator-language/).',
  'Authentication, entitlement, or billing logic itself — IAE consumes their already-certified answers as input, exactly as the Button Engine did before this migration.',
  'Aggregating or exposing constitutional self-description data — owned by Constitutional Aggregation (formerly named Manifestation Engine; see Article II of the ratifying Decree).',
] as const;

export const IAE_NOT_TO_BE_CONFUSED_WITH = [
  'EmpireAwarenessEngine (src/core/strategic-intelligence/empire-awareness-engine.ts) — a Founder-only, empire-wide strategic observation class. Different domain, different consumer, unrenamed and untouched.',
  'GOAL_AWARENESS (src/chambers/makman-al-ghayah/GOAL_AWARENESS_*.ts) — Makman\'s own goal-classification layer, limited to the Analyze verb. Different domain, different consumer, unrenamed and untouched.',
] as const;
