/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER IV — GOAL STRATEGY (LAYER COMPONENT D: STRATEGY BOUNDARIES)
 * (Construction ID MAG-PKG-III-L04)
 *
 * DECLARATIVE ONLY. Defines explicitly what Strategy may do (Analyze,
 * Compare, Evaluate, Recommend) and what it shall never do (Execute,
 * Publish, Schedule, Modify Goals, Override Creator decisions, Trigger
 * notifications directly) — the directive's own exact list, mapped to
 * their constitutional sources.
 */

export const GOAL_STRATEGY_MAY = [
  { capability: 'Analyze.', constitutionalGrounding: 'ARTICLE II — inherited authority, exercised over Awareness-derived fields (GOAL_STRATEGY_ANALYSIS.ts).' },
  { capability: 'Compare.', constitutionalGrounding: 'ARTICLE II (Analyze, applied across alternatives) — this Layer\'s own distinguishing authority for Opportunity/Priority/Conflict assessment.' },
  { capability: 'Evaluate.', constitutionalGrounding: 'ARTICLE II — Risk and Feasibility assessment (GOAL_STRATEGY_ANALYSIS.ts) are evaluative, never predictive or executable.' },
  { capability: 'Recommend.', constitutionalGrounding: 'ARTICLE IV (Suggestion Principle) — architected as content-shape only in GOAL_STRATEGY_RECOMMENDATION.ts; delivery remains dependent on the still-RESERVED RECOMMENDATION_COMPONENT.' },
] as const;

export const GOAL_STRATEGY_SHALL_NEVER = [
  { prohibition: 'Execute.', constitutionalGrounding: 'ARTICLE II ("never execute without explicit Creator authorization") — Strategy has no execution authority under any circumstance, same as Awareness and Guardian before it.' },
  { prohibition: 'Publish.', constitutionalGrounding: 'ARTICLE VII; ARTICLE I ("purpose is not publishing").' },
  { prohibition: 'Schedule.', constitutionalGrounding: 'ARTICLE VII; ARTICLE I ("purpose is not scheduling").' },
  { prohibition: 'Modify Goals.', constitutionalGrounding: 'ARTICLE VII ("shall never... rewrite a Goal... replace a Goal") — Strategy reads currentGoalState (via Awareness Context), it never writes it.' },
  { prohibition: 'Override Creator decisions.', constitutionalGrounding: 'ARTICLE II, ARTICLE IX (Guardian identity, carried forward — Strategy is a strategist, not a ruler) — Strategy recommends; only the Creator decides.' },
  { prohibition: 'Trigger notifications directly.', constitutionalGrounding: 'ARTICLE V — belongs exclusively to the reserved NOTIFICATION_COMPONENT; Strategy\'s recommendations have no built delivery path, and none shall be improvised here.' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// GUARDIAN + AWARENESS-CONTEXT DEPENDENCY BOUNDARY
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_STRATEGY_DEPENDENCY_BOUNDARY = {
  rule: 'Living Layer IV shall consume Guardian (for protection-domain awareness) and, following Guardian\'s own established precedent, GOAL_AWARENESS_CONTEXT.ts / GOAL_AWARENESS_CLASSIFICATION.ts directly (for live per-Goal data). Direct access to GOAL_PRESENCE_*.ts (Living Layer I) or any Package II Architectural Component is prohibited.',
  verifiedCompliance: 'Every import across GOAL_STRATEGY_IDENTITY.ts, GOAL_STRATEGY_ANALYSIS.ts, and GOAL_STRATEGY_RECOMMENDATION.ts resolves to GOAL_GUARDIAN_IDENTITY.ts, GOAL_AWARENESS_CONTEXT.ts, GOAL_AWARENESS_CLASSIFICATION.ts, or another GOAL_STRATEGY_*.ts file — none imports GOAL_PRESENCE_*.ts, goal-contracts.ts, goal-state.ts, or any other Package II file directly.',
  source: 'Layering discipline generalized from MAG-CA-RULING-005 and Guardian\'s own precedent (GOAL_GUARDIAN_PROTECTION.ts\'s import of GoalAwarenessContext), extended one Layer up per this Package\'s own narrative.',
} as const;

export const GOAL_STRATEGY_BOUNDARIES_DECLARATION = {
  mayListComplete: true,
  shallNeverListComplete: true,
  matchesDirectiveExactly: true,
  dependencyBoundaryRespected: true,
  packageIModified: false,
  packageIIModified: false,
  livingLayerIModified: false,
  livingLayerIIModified: false,
  livingLayerIIIModified: false,
  status: 'LIVING LAYER IV, LAYER COMPONENT D, GOAL STRATEGY BOUNDARIES, complete.',
} as const;

export const MAKMAN_GOAL_STRATEGY_BOUNDARIES = {
  may: GOAL_STRATEGY_MAY,
  shallNever: GOAL_STRATEGY_SHALL_NEVER,
  dependencyBoundary: GOAL_STRATEGY_DEPENDENCY_BOUNDARY,
  declaration: GOAL_STRATEGY_BOUNDARIES_DECLARATION,
} as const;
