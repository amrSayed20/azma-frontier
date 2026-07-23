/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER I — GOAL PRESENCE (LAYER COMPONENT D: PRESENCE BOUNDARIES)
 * (Construction ID MAG-PKG-III)
 *
 * DECLARATIVE ONLY. Defines explicitly what Presence may do (observe,
 * remember, expose state) and what it shall never do (execute, recommend,
 * modify, publish, schedule, authorize) — the directive's own exact list,
 * mapped to their constitutional sources.
 */

export const GOAL_PRESENCE_MAY = [
  { capability: 'Observe.', constitutionalGrounding: 'ARTICLE II.' },
  { capability: 'Remember (within Journey/Goal/Creator Continuity\'s exact bounds — see GOAL_PRESENCE_CONTINUITY.ts).', constitutionalGrounding: 'ARTICLE X (continuous protection); this Package\'s Constitutional Purpose.' },
  { capability: 'Expose state (GoalPresenceContext\'s fields) to other components.', constitutionalGrounding: 'This Package\'s Architectural Ruling — Presence is "the constitutional bridge between Goal Architecture and all future Living Layers."' },
] as const;

export const GOAL_PRESENCE_SHALL_NEVER = [
  { prohibition: 'Execute.', constitutionalGrounding: 'ARTICLE II ("It shall never execute without explicit Creator authorization") — Presence has no authorization to execute under any circumstance, not even a Creator-approved one; execution belongs to DESTINATION_EXECUTION_COMPONENT.' },
  { prohibition: 'Recommend.', constitutionalGrounding: 'ARTICLE IV — recommendation belongs exclusively to the reserved RECOMMENDATION_COMPONENT, not built in this Layer.' },
  { prohibition: 'Modify.', constitutionalGrounding: 'ARTICLE VII ("shall never... rewrite a Goal... replace a Goal").' },
  { prohibition: 'Publish.', constitutionalGrounding: 'ARTICLE VII ("shall never publish without authorization"); ARTICLE I ("purpose is not publishing").' },
  { prohibition: 'Schedule.', constitutionalGrounding: 'ARTICLE VII ("shall never modify schedules without authorization"); ARTICLE I ("purpose is not scheduling").' },
  { prohibition: 'Authorize.', constitutionalGrounding: 'ARTICLE VIII — authorization is the Creator\'s exclusive act; Presence may observe that an authorization occurred, it may never grant one.' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// PRESENCE AS MANDATORY BRIDGE (Architectural Ruling)
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_PRESENCE_MANDATORY_BRIDGE_RULING = {
  ruling: 'The Living Presence Layer shall become the constitutional bridge between Goal Architecture and all future Living Layers. No future Layer shall bypass Presence. Presence is mandatory.',
  meansConcretely: 'Any future Living Layer (Guardian, Scheduler, Publisher, Intelligence, etc.) that needs to know a Goal\'s current stage, owner, destination, waiting reason, or execution status must read that information through GOAL_PRESENCE_CONTEXT.ts — not by querying GOAL_CUSTODY_COMPONENT or any other Package II component directly.',
  architecturalImplication: 'This does not change MAKMAN_INTERNAL_COMMUNICATION_ARCHITECTURE.ts\'s already-verified import graph (Package II, unmodified) — it establishes a rule for FUTURE construction, not a retroactive rewiring of existing files.',
} as const;

export const GOAL_PRESENCE_BOUNDARIES_DECLARATION = {
  mayListComplete: true,
  shallNeverListComplete: true,
  matchesDirectiveExactly: true,
  packageIModified: false,
  packageIIModified: false,
  status: 'LIVING LAYER I, LAYER COMPONENT D, GOAL PRESENCE BOUNDARIES, complete.',
} as const;

export const RAS_AL_AMR_GOAL_PRESENCE_BOUNDARIES = {
  may: GOAL_PRESENCE_MAY,
  shallNever: GOAL_PRESENCE_SHALL_NEVER,
  mandatoryBridgeRuling: GOAL_PRESENCE_MANDATORY_BRIDGE_RULING,
  declaration: GOAL_PRESENCE_BOUNDARIES_DECLARATION,
} as const;
