/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER I — GOAL PRESENCE (LAYER COMPONENT B: PRESENCE CONTEXT)
 * (Construction ID MAG-PKG-III)
 *
 * DECLARATIVE ONLY. Architects the complete contextual picture of a Goal —
 * Current Goal, Current Stage, Current Owner, Current Destination, Current
 * Waiting Reason, Current Execution Status. Context only — no decisions.
 * Zero modification to Package I or Package II; every field points to an
 * already-defined construct rather than redefining one.
 */

import type { GoalContract, GoalStatus } from './goal-contracts';

export interface GoalPresenceContext {
  readonly currentGoal: GoalContract;
  readonly currentStage: string;
  readonly currentOwner: 'The Creator';
  readonly currentDestination: string | null;
  readonly currentWaitingReason: RasAlAmrGoalWaitingReason | null;
  readonly currentExecutionStatus: GoalStatus;
}

export const GOAL_PRESENCE_CONTEXT_FIELD_GROUNDING = {
  currentGoal: 'goal-contracts.ts, GoalContract — re-used by reference, not redefined.',
  currentStage: 'MAKMAN_GOAL_LIFECYCLE_ARCHITECTURE.ts\'s 6 named stages (Goal Handover, Guardianship Planning, Recommendation/Warning, Creator-Authorized Execution, Consumption Enforcement, Goal Fulfilment) — Presence observes which stage the Goal currently occupies, it does not decide stage transitions.',
  currentOwner: 'Always and only "The Creator" (ARTICLE VII, IX) — this field exists to make the ownership fact continuously visible, never to suggest it could be anything else.',
  currentDestination: 'ARTICLE I ("destination chosen by the Creator") — null until the Creator has chosen one; Presence observes the choice, it never makes or suggests one.',
  currentExecutionStatus: 'goal-contracts.ts, GoalStatus (CREATED/PLANNED/IN_PROGRESS/BLOCKED/COMPLETED/FAILED) — re-used by reference; Presence reflects goal-state.ts\'s stored value, it never assigns one.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CURRENT WAITING REASON — genuinely new, honestly grounded
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_WAITING_REASONS = [
  'awaiting-creator-approval',
  'awaiting-recommendation-delivery',
  'awaiting-notification-delivery',
  'awaiting-rendering-evaluation',
  'awaiting-consumption-request',
  'not-waiting',
] as const;
export type RasAlAmrGoalWaitingReason = (typeof GOAL_WAITING_REASONS)[number];

export const GOAL_WAITING_REASON_GROUNDING: Readonly<Record<RasAlAmrGoalWaitingReason, string>> = {
  'awaiting-creator-approval': 'ARTICLE VIII — the Goal cannot proceed to Creator-Authorized Execution until one of the 8 named approvals is given.',
  'awaiting-recommendation-delivery': 'ARTICLE IV — RECOMMENDATION_COMPONENT is RESERVED (MAKMAN_CHAMBER_ARCHITECTURE.ts); a Goal may be constitutionally due a recommendation that cannot yet be delivered because the component does not exist.',
  'awaiting-notification-delivery': 'ARTICLE V — same disposition as above, for NOTIFICATION_COMPONENT.',
  'awaiting-rendering-evaluation': 'DESTINATION_EXECUTION_COMPONENT (rendering-bridge.ts) has not yet completed its dynamic-serve-vs-hard-render decision.',
  'awaiting-consumption-request': 'The Goal has reached Consumption Enforcement (MAKMAN_GOAL_LIFECYCLE_ARCHITECTURE.ts, Stage 5) but no consumer has yet requested access.',
  'not-waiting': 'The Goal is actively progressing through Guardianship Planning or has reached a terminal stage.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_PRESENCE_CONTEXT_DECLARATION = {
  decisionsIntroduced: false,
  executionIntroduced: false,
  intelligenceIntroduced: false,
  packageIModified: false,
  packageIIModified: false,
  status: 'LIVING LAYER I, LAYER COMPONENT B, GOAL PRESENCE CONTEXT, complete. Context only — every field is an observation of an already-defined construct.',
} as const;

export const RAS_AL_AMR_GOAL_PRESENCE_CONTEXT = {
  fieldGrounding: GOAL_PRESENCE_CONTEXT_FIELD_GROUNDING,
  waitingReasons: GOAL_WAITING_REASONS,
  waitingReasonGrounding: GOAL_WAITING_REASON_GROUNDING,
  declaration: GOAL_PRESENCE_CONTEXT_DECLARATION,
} as const;
