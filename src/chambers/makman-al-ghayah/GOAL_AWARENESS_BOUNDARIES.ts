/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER II — GOAL AWARENESS (LAYER COMPONENT D: AWARENESS BOUNDARIES)
 * (Construction ID MAG-PKG-III-L02)
 *
 * DECLARATIVE ONLY. Defines explicitly what Awareness may do (Observe,
 * Understand, Classify, Expose constitutional state) and what it shall
 * never do (Recommend, Prioritize, Warn, Notify, Schedule, Publish,
 * Execute, Modify Goals, Change Goal State) — the directive's own exact
 * list, mapped to their constitutional sources.
 */

export const GOAL_AWARENESS_MAY = [
  { capability: 'Observe.', constitutionalGrounding: 'ARTICLE II — inherited from Presence, which Awareness consumes exclusively (MAG-CA-RULING-005).' },
  { capability: 'Understand.', constitutionalGrounding: 'ARTICLE II\'s Analyze verb — this Layer\'s own distinguishing authority (GOAL_AWARENESS_AUTHORITY, Layer Component A).' },
  { capability: 'Classify.', constitutionalGrounding: 'This Package\'s own Constitutional Purpose — the 7 named classifications in GOAL_AWARENESS_CLASSIFICATION.ts.' },
  { capability: 'Expose constitutional state.', constitutionalGrounding: 'GOAL_PRESENCE_MANDATORY_BRIDGE_RULING (Living Layer I) — Awareness, like Presence, exists so future Layers need not query Package II directly.' },
] as const;

export const GOAL_AWARENESS_SHALL_NEVER = [
  { prohibition: 'Recommend.', constitutionalGrounding: 'ARTICLE IV — belongs exclusively to the reserved RECOMMENDATION_COMPONENT.' },
  { prohibition: 'Prioritize.', constitutionalGrounding: 'GUARDIANSHIP_PLANNING_COMPONENT\'s exclusive responsibility (MAKMAN_CHAMBER_ARCHITECTURE.ts) — Awareness classifies the current condition, it never re-orders Goals.' },
  { prohibition: 'Warn.', constitutionalGrounding: 'ARTICLE V — belongs exclusively to the reserved NOTIFICATION_COMPONENT.' },
  { prohibition: 'Notify.', constitutionalGrounding: 'ARTICLE V, same as above.' },
  { prohibition: 'Schedule.', constitutionalGrounding: 'ARTICLE VII ("shall never modify schedules without authorization"); ARTICLE I ("purpose is not scheduling").' },
  { prohibition: 'Publish.', constitutionalGrounding: 'ARTICLE VII; ARTICLE I ("purpose is not publishing").' },
  { prohibition: 'Execute.', constitutionalGrounding: 'ARTICLE II ("never execute without explicit Creator authorization") — Awareness has no execution authority under any circumstance.' },
  { prohibition: 'Modify Goals.', constitutionalGrounding: 'ARTICLE VII ("shall never... rewrite a Goal... replace a Goal").' },
  { prohibition: 'Change Goal State.', constitutionalGrounding: 'ARTICLE VII, ARTICLE VIII — state changes require Creator authorization Awareness does not hold; Awareness reads currentGoalState, it never writes it.' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// PRESENCE-ONLY DEPENDENCY BOUNDARY (MAG-CA-RULING-005)
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_AWARENESS_PRESENCE_ONLY_BOUNDARY = {
  rule: 'Living Layer II shall consume information only through Goal Presence. Direct access to Package II Architectural Components is prohibited.',
  verifiedCompliance: 'Every import across GOAL_AWARENESS_IDENTITY.ts, GOAL_AWARENESS_CONTEXT.ts, and GOAL_AWARENESS_CLASSIFICATION.ts resolves to GOAL_PRESENCE_IDENTITY.ts, GOAL_PRESENCE_CONTEXT.ts, or another GOAL_AWARENESS_*.ts file — none imports goal-contracts.ts, goal-state.ts, or any other Package II file directly.',
  source: 'MAG-CA-RULING-005 (Presence First Principle).',
} as const;

export const GOAL_AWARENESS_BOUNDARIES_DECLARATION = {
  mayListComplete: true,
  shallNeverListComplete: true,
  matchesDirectiveExactly: true,
  presenceOnlyBoundaryRespected: true,
  packageIModified: false,
  packageIIModified: false,
  livingLayerIModified: false,
  status: 'LIVING LAYER II, LAYER COMPONENT D, GOAL AWARENESS BOUNDARIES, complete.',
} as const;

export const RAS_AL_AMR_GOAL_AWARENESS_BOUNDARIES = {
  may: GOAL_AWARENESS_MAY,
  shallNever: GOAL_AWARENESS_SHALL_NEVER,
  presenceOnlyBoundary: GOAL_AWARENESS_PRESENCE_ONLY_BOUNDARY,
  declaration: GOAL_AWARENESS_BOUNDARIES_DECLARATION,
} as const;
