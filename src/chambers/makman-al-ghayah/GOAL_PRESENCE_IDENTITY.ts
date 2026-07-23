/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER I — GOAL PRESENCE (LAYER COMPONENT A: PRESENCE IDENTITY)
 * (Construction ID MAG-PKG-III)
 *
 * DECLARATIVE ONLY — no function, no class, no execution. Defines the
 * constitutional identity of a Living Goal Presence: what it is, what it
 * covers, who owns it, what authority it holds (none beyond Observe), and
 * how long it lives. Zero modification to Package I (Constitutional
 * Foundation) or Package II (Chamber Architecture) — both are cited by
 * reference only.
 *
 * HONESTY CHECK performed before writing: GOAL_SESSION_COMPONENT
 * (MAKMAN_CHAMBER_ARCHITECTURE.ts, Package II) already provides
 * session-scoped custody for Goal-management *activity*. Goal Presence is
 * NOT a restatement of that — Presence Scope (below) is explicitly the
 * Goal's *entire* lifecycle (Handover through Fulfilment), continuous
 * across any number of sessions, while a GoalSession is transient and
 * activity-scoped. The two are distinct by design, not by accident.
 */

import type { GoalContract } from './goal-contracts';

export interface GoalPresenceIdentity {
  readonly goalId: GoalContract['goalId'];
  readonly presenceId: string;
}

export const GOAL_PRESENCE_IDENTITY_GROUNDING = {
  goalId: 'goal-contracts.ts, GoalContract.goalId — the Goal\'s own identity, re-used by reference, never redefined.',
  presenceId: 'New: a Presence-specific identifier distinct from goalId, since one Goal possesses exactly one continuous Presence for its entire entrusted lifetime (see PRESENCE_LIFETIME below) — the distinction exists so a future Living Layer can reference "this act of awareness" separately from "this Goal," the same separation RAS AL AMR\'s own Package IV drew between RuntimeContext and a session.',
} as const;

export const GOAL_PRESENCE_SCOPE = {
  statement: 'One Goal Presence covers exactly one Goal, continuously, from Goal Handover until Goal Fulfilment, Goal Cancellation, or explicit Creator instruction — the Goal\'s entire entrusted lifetime, never less.',
  distinctFromGoalSession: 'GOAL_SESSION_COMPONENT (MAKMAN_CHAMBER_ARCHITECTURE.ts) is transient and activity-scoped (goal-session.ts, goal-session-store.ts, goal-session-manager.ts). Goal Presence is continuous and lifetime-scoped. A single Goal Presence may span many Goal Sessions; no Goal Session may outlive its Goal Presence.',
  constitutionalGrounding: 'ARTICLE X ("continuous constitutional protection until: Goal Fulfilment, Goal Cancellation, or explicit Creator instruction").',
} as const;

export const GOAL_PRESENCE_OWNERSHIP = {
  presenceItself: 'Makman Al-Ghayah owns the Presence (the awareness mechanism).',
  theGoal: 'The Creator owns the Goal exclusively — Presence never acquires ownership merely by being aware.',
  constitutionalGrounding: 'ARTICLE VII ("shall never own a Goal"); ARTICLE IX ("neither the author of the Goal, nor its owner, nor its ruler. It is its Guardian.").',
} as const;

export const GOAL_PRESENCE_AUTHORITY = {
  statement: 'Goal Presence holds exactly one authority: Observe (Article II). It holds none of Article II\'s other six verbs (Analyze, Recommend, Warn, Re-evaluate, Plan, Protect) — those belong to other components (GUARDIANSHIP_PLANNING_COMPONENT, the reserved RECOMMENDATION_COMPONENT/NOTIFICATION_COMPONENT). Presence is awareness of existence, not decision, not execution, not intelligence.',
  constitutionalGrounding: 'ARTICLE II; this Package\'s own Constitutional Purpose ("Presence is awareness of existence. Not decision. Not execution. Not intelligence.").',
} as const;

export const GOAL_PRESENCE_LIFETIME = {
  begins: 'Goal Handover (MAKMAN_GOAL_LIFECYCLE_ARCHITECTURE.ts, Stage 1) — the moment GOAL_CUSTODY_COMPONENT registers the Goal.',
  ends: 'Goal Fulfilment, Goal Cancellation, or explicit Creator instruction (MAKMAN_GOAL_LIFECYCLE_ARCHITECTURE.ts, Stage 6) — the same three terminal conditions Article X names, no fourth invented.',
  duringLifetime: 'Presence exists continuously across every intervening stage (Guardianship Planning, Recommendation/Warning, Creator-Authorized Execution, Consumption Enforcement) — it does not pause or reset between stages.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_PRESENCE_IDENTITY_DECLARATION = {
  runtimeBehaviorIntroduced: false,
  decisionAuthorityIntroduced: false,
  executionAuthorityIntroduced: false,
  packageIModified: false,
  packageIIModified: false,
  status: 'LIVING LAYER I, LAYER COMPONENT A, GOAL PRESENCE IDENTITY, complete.',
} as const;

export const RAS_AL_AMR_GOAL_PRESENCE_IDENTITY = {
  scope: GOAL_PRESENCE_SCOPE,
  ownership: GOAL_PRESENCE_OWNERSHIP,
  authority: GOAL_PRESENCE_AUTHORITY,
  lifetime: GOAL_PRESENCE_LIFETIME,
  identityGrounding: GOAL_PRESENCE_IDENTITY_GROUNDING,
  declaration: GOAL_PRESENCE_IDENTITY_DECLARATION,
} as const;
