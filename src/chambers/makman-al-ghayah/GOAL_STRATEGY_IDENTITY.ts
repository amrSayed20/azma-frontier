/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER IV — GOAL STRATEGY (LAYER COMPONENT A: STRATEGY IDENTITY)
 * (Construction ID MAG-PKG-III-L04)
 *
 * DECLARATIVE ONLY. Defines the constitutional identity of Goal Strategy:
 * purpose, scope, authority, ownership, lifetime, and its relationship
 * with Guardian. Zero modification to any certified Package or to Living
 * Layers I/II/III.
 *
 * HONESTY CHECK performed before writing: Guardian (Living Layer III) was
 * not given its own live per-Goal Context file by its directive — it only
 * produced static Protection Domain / Escalation Trigger definitions
 * (GOAL_GUARDIAN_PROTECTION.ts, GOAL_GUARDIAN_ESCALATION.ts). Guardian's
 * own Protection Domains therefore already reach past itself into
 * GOAL_AWARENESS_CONTEXT.ts for live per-Goal fields (see
 * RasAlAmrGoalGuardianProtectionInputFields in GOAL_GUARDIAN_PROTECTION.ts)
 * — Guardian consumes Awareness's Context directly, not merely Guardian's
 * own identity. Strategy follows this same, already-established precedent:
 * it consumes Guardian (for protection-domain awareness and escalation
 * grounding) and, following Guardian's own precedent, GOAL_AWARENESS_CONTEXT.ts
 * / GOAL_AWARENESS_CLASSIFICATION.ts directly for live per-Goal data — never
 * GOAL_PRESENCE_*.ts or any Package II Architectural Component directly.
 */

import type { GoalGuardianIdentity } from './GOAL_GUARDIAN_IDENTITY';

export interface GoalStrategyIdentity {
  readonly guardianId: GoalGuardianIdentity['guardianId'];
  readonly strategyId: string;
}

export const GOAL_STRATEGY_PURPOSE = {
  statement: 'Goal Strategy exists to continuously study the entrusted Goal and prepare the best constitutional path toward its fulfilment. It transforms constitutional Protection-awareness into constitutional Planning. It shall never decide for the Creator.',
  distinctFromGuardian: 'Guardian answers "Is what is happening to the Goal still constitutional?" (Article II\'s Protect verb). Strategy answers "What is the best constitutional path forward?" — the Article II verb it exercises is Plan, shared textually with GUARDIANSHIP_PLANNING_COMPONENT but exercised here purely declaratively (analysis and recommendation architecture, never an executable plan). Guardian watches for violation risk; Strategy studies the path forward. Neither decides; only the Creator decides.',
} as const;

export const GOAL_STRATEGY_SCOPE = {
  statement: 'One Goal Strategy covers exactly one Goal Guardian — never a Goal Awareness or Goal Presence directly, and never more than one Guardian at a time.',
  constitutionalGrounding: 'Layering discipline generalized from GOAL_GUARDIAN_RELATIONSHIP_WITH_AWARENESS (Living Layer III), extended one Layer up per this Package\'s own narrative ("Presence observes. Awareness understands. Guardian protects. Strategy plans.").',
} as const;

export const GOAL_STRATEGY_AUTHORITY = {
  statement: 'Goal Strategy holds exactly the four verbs this Package\'s own Constitutional Purpose names: Analyze, Compare, Evaluate, Propose. It holds none of Article II\'s remaining verbs (Observe, Recommend as a delivered act, Warn, Re-evaluate as a tracked act, Protect). "Strategy shall never decide for the Creator" — it owns no execution, no publishing, no scheduling, no notification delivery, no decision replacement.',
  constitutionalGrounding: 'ARTICLE II; ARTICLE IV (Suggestion Principle); this Package\'s own Constitutional Purpose.',
} as const;

export const GOAL_STRATEGY_OWNERSHIP = {
  strategyItself: 'Makman Al-Ghayah owns the Strategy (the analysis/recommendation-architecture mechanism).',
  theRecommendation: 'Makman owns the recommendation\'s content and justification; it never owns its acceptance, rejection, or execution — those remain the Creator\'s.',
  theGoal: 'The Creator owns the Goal exclusively — unchanged from Package I/II and Living Layers I/II/III.',
  constitutionalGrounding: 'ARTICLE VII, ARTICLE IX (carried forward unchanged).',
} as const;

export const GOAL_STRATEGY_LIFETIME = {
  beginsAndEnds: 'Identical to its one Guardian\'s lifetime (GOAL_GUARDIAN_LIFETIME, Living Layer III), which is itself identical to Awareness\'s and Presence\'s lifetime — Strategy cannot begin before its Guardian exists, and cannot outlive it. No independent lifetime is introduced.',
  constitutionalGrounding: 'ARTICLE X, applied identically across all four Layers.',
} as const;

export const GOAL_STRATEGY_RELATIONSHIP_WITH_GUARDIAN = {
  statement: 'Strategy consumes Guardian for protection-domain awareness and escalation grounding. Following Guardian\'s own established precedent, Strategy also consumes GOAL_AWARENESS_CONTEXT.ts / GOAL_AWARENESS_CLASSIFICATION.ts directly for live per-Goal data, since Guardian itself was not given a live per-Goal Context of its own and already reaches to Awareness\'s Context for exactly this reason. Strategy never queries GOAL_PRESENCE_*.ts (Living Layer I) or any Package II Architectural Component directly.',
  constitutionalGrounding: 'Layering discipline generalized from Guardian\'s own precedent (GOAL_GUARDIAN_PROTECTION.ts\'s import of GoalAwarenessContext).',
  verifiedCompliance: 'Every import in this file and its sibling GOAL_STRATEGY_*.ts files resolves to GOAL_GUARDIAN_IDENTITY.ts, GOAL_GUARDIAN_PROTECTION.ts, GOAL_AWARENESS_CONTEXT.ts, or GOAL_AWARENESS_CLASSIFICATION.ts — confirmed by direct inspection of every import statement before this Layer was written.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_STRATEGY_IDENTITY_DECLARATION = {
  decisionAuthorityIntroduced: false,
  executionAuthorityIntroduced: false,
  creatorAuthorityOverridden: false,
  directPresenceOrPackageIIAccess: false,
  packageIModified: false,
  packageIIModified: false,
  livingLayerIModified: false,
  livingLayerIIModified: false,
  livingLayerIIIModified: false,
  status: 'LIVING LAYER IV, LAYER COMPONENT A, GOAL STRATEGY IDENTITY, complete.',
} as const;

export const MAKMAN_GOAL_STRATEGY_IDENTITY = {
  purpose: GOAL_STRATEGY_PURPOSE,
  scope: GOAL_STRATEGY_SCOPE,
  authority: GOAL_STRATEGY_AUTHORITY,
  ownership: GOAL_STRATEGY_OWNERSHIP,
  lifetime: GOAL_STRATEGY_LIFETIME,
  relationshipWithGuardian: GOAL_STRATEGY_RELATIONSHIP_WITH_GUARDIAN,
  declaration: GOAL_STRATEGY_IDENTITY_DECLARATION,
} as const;
