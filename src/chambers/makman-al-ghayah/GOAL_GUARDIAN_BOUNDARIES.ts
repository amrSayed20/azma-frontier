/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER III — GOAL GUARDIAN (LAYER COMPONENT C: GUARDIAN BOUNDARIES)
 * (Construction ID MAG-PKG-III-L03)
 *
 * DECLARATIVE ONLY. Defines explicitly what Guardian may do (Detect,
 * Preserve, Request escalation, Block conceptually) and what it shall
 * never do (Execute, Publish, Schedule, Rewrite Goals, Override Creator
 * decisions, Modify Goal State directly) — the directive's own exact
 * list, mapped to their constitutional sources.
 */

export const GOAL_GUARDIAN_MAY = [
  { capability: 'Detect constitutional violations.', constitutionalGrounding: 'This Package\'s own Construction Objective — reasoning over the 4 Protection Domains (GOAL_GUARDIAN_PROTECTION.ts) using only Awareness-derived fields.' },
  { capability: 'Preserve constitutional integrity.', constitutionalGrounding: 'ARTICLE X — continuous protection until Fulfilment, Cancellation, or explicit Creator instruction.' },
  { capability: 'Request escalation.', constitutionalGrounding: 'GOAL_GUARDIAN_ESCALATION.ts (Layer Component D) — escalation is a request, never a self-resolution.' },
  { capability: 'Block unconstitutional transitions conceptually.', constitutionalGrounding: 'ARTICLE VII — naming the concept of a forbidden transition is within Guardian\'s declarative authority; actually preventing one at runtime is not (no Runtime exists in this Package).' },
] as const;

export const GOAL_GUARDIAN_SHALL_NEVER = [
  { prohibition: 'Execute actions.', constitutionalGrounding: 'ARTICLE II ("never execute without explicit Creator authorization") — Guardian has no execution authority under any circumstance, same as Awareness before it.' },
  { prohibition: 'Publish.', constitutionalGrounding: 'ARTICLE VII; ARTICLE I ("purpose is not publishing").' },
  { prohibition: 'Schedule.', constitutionalGrounding: 'ARTICLE VII; ARTICLE I ("purpose is not scheduling").' },
  { prohibition: 'Rewrite Goals.', constitutionalGrounding: 'ARTICLE VII ("shall never... rewrite a Goal... replace a Goal") — this is precisely the risk Goal Integrity Protection watches for, never a risk Guardian itself may take.' },
  { prohibition: 'Override Creator decisions.', constitutionalGrounding: 'ARTICLE II, ARTICLE IX (Guardian, not ruler) — Guardian escalates; only the Creator decides.' },
  { prohibition: 'Modify Goal State directly.', constitutionalGrounding: 'ARTICLE VII, ARTICLE VIII — state changes require Creator authorization Guardian does not hold; Guardian reads currentGoalState (via Awareness), it never writes it.' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// AWARENESS-ONLY DEPENDENCY BOUNDARY
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_GUARDIAN_AWARENESS_ONLY_BOUNDARY = {
  rule: 'Living Layer III shall consume information only through Goal Awareness. Direct access to Goal Presence (Living Layer I) or Package II Architectural Components is prohibited.',
  verifiedCompliance: 'Every import across GOAL_GUARDIAN_IDENTITY.ts, GOAL_GUARDIAN_PROTECTION.ts, and GOAL_GUARDIAN_ESCALATION.ts resolves to GOAL_AWARENESS_IDENTITY.ts, GOAL_AWARENESS_CONTEXT.ts, or GOAL_AWARENESS_CLASSIFICATION.ts, or another GOAL_GUARDIAN_*.ts file — none imports GOAL_PRESENCE_*.ts, goal-contracts.ts, goal-state.ts, or any other Package II file directly.',
  source: 'Layering discipline generalized from MAG-CA-RULING-005 (Presence First Principle), extended one Layer up per this Package\'s own narrative ("Presence observes. Awareness understands. Guardian protects.").',
} as const;

export const GOAL_GUARDIAN_BOUNDARIES_DECLARATION = {
  mayListComplete: true,
  shallNeverListComplete: true,
  matchesDirectiveExactly: true,
  awarenessOnlyBoundaryRespected: true,
  packageIModified: false,
  packageIIModified: false,
  livingLayerIModified: false,
  livingLayerIIModified: false,
  status: 'LIVING LAYER III, LAYER COMPONENT C, GOAL GUARDIAN BOUNDARIES, complete.',
} as const;

export const MAKMAN_GOAL_GUARDIAN_BOUNDARIES = {
  may: GOAL_GUARDIAN_MAY,
  shallNever: GOAL_GUARDIAN_SHALL_NEVER,
  awarenessOnlyBoundary: GOAL_GUARDIAN_AWARENESS_ONLY_BOUNDARY,
  declaration: GOAL_GUARDIAN_BOUNDARIES_DECLARATION,
} as const;
