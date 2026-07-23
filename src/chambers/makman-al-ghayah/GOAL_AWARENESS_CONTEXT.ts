/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER II — GOAL AWARENESS (LAYER COMPONENT B: AWARENESS CONTEXT)
 * (Construction ID MAG-PKG-III-L02)
 *
 * DECLARATIVE ONLY. Architects the complete Awareness Context — Current
 * Goal State, Journey State, Waiting Classification, Responsible Chamber,
 * Creator Authorization Status, External Dependency Status. Context only,
 * no interpretation beyond direct derivation. Every field is derived
 * exclusively from GOAL_PRESENCE_CONTEXT.ts (Living Layer I) — no field
 * queries goal-contracts.ts, goal-state.ts, or any other Package II file
 * directly, per MAG-CA-RULING-005.
 */

import type { GoalPresenceContext, RasAlAmrGoalWaitingReason } from './GOAL_PRESENCE_CONTEXT';

export interface GoalAwarenessContext {
  readonly currentGoalState: GoalPresenceContext['currentExecutionStatus'];
  readonly currentJourneyState: GoalPresenceContext['currentStage'];
  readonly currentWaitingClassification: RasAlAmrGoalWaitingReason;
  readonly currentResponsibleChamber: RasAlAmrMakmanResponsibleChamberInference;
  readonly currentCreatorAuthorizationStatus: 'authorized' | 'awaiting-authorization' | 'not-applicable-at-this-stage';
  readonly currentExternalDependencyStatus: 'pending' | 'none';
}

// ═══════════════════════════════════════════════════════════════════════════
// FIELD-BY-FIELD DERIVATION — every field traced to a Presence-only source
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_AWARENESS_CONTEXT_FIELD_DERIVATION = {
  currentGoalState: 'Direct pass-through of GoalPresenceContext.currentExecutionStatus — no reinterpretation.',
  currentJourneyState: 'Direct pass-through of GoalPresenceContext.currentStage — no reinterpretation.',
  currentWaitingClassification: 'Direct pass-through of GoalPresenceContext.currentWaitingReason (Living Layer I\'s 6-value enum) — Awareness classifies further in GOAL_AWARENESS_CLASSIFICATION.ts, but this field itself is unaltered from what Presence already exposes.',
  currentResponsibleChamber: 'Derived (not queried) from currentJourneyState alone: each of MAKMAN_GOAL_LIFECYCLE_ARCHITECTURE.ts\'s 6 stages names its own Responsible/Receiving Component in that already-certified Package II document; Awareness infers the responsible chamber from the Stage value Presence already exposes, rather than importing MAKMAN_EXTERNAL_INTEGRATION_ARCHITECTURE.ts or MAKMAN_CHAMBER_ARCHITECTURE.ts directly. See RAS_AL_AMR_MAKMAN_RESPONSIBLE_CHAMBER_INFERENCE below for the exact stage-to-chamber mapping.',
  currentCreatorAuthorizationStatus: '"awaiting-authorization" if currentWaitingReason === "awaiting-creator-approval"; "authorized" if the Goal has progressed past a stage requiring approval without being blocked there; "not-applicable-at-this-stage" otherwise (e.g., during Guardianship Planning, before any approval-gated action is even proposed). Derived entirely from currentWaitingReason and currentJourneyState — no new information source.',
  currentExternalDependencyStatus: '"pending" if currentWaitingReason is "awaiting-rendering-evaluation" or "awaiting-consumption-request" (both involve a party outside Makman\'s own Guardianship Planning/Progress components — Al-Watin or a consumer); "none" otherwise.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// RESPONSIBLE CHAMBER INFERENCE — derived from Journey State only
// ═══════════════════════════════════════════════════════════════════════════

export const RESPONSIBLE_CHAMBER_INFERENCE_VALUES = ['ras-al-amr', 'makman-al-ghayah', 'the-creator', 'platform-al-watin'] as const;
export type RasAlAmrMakmanResponsibleChamberInference = (typeof RESPONSIBLE_CHAMBER_INFERENCE_VALUES)[number];

export const GOAL_AWARENESS_STAGE_TO_CHAMBER_INFERENCE: Readonly<Record<string, RasAlAmrMakmanResponsibleChamberInference>> = {
  'Goal Handover': 'ras-al-amr',
  'Guardianship Planning': 'makman-al-ghayah',
  'Recommendation / Warning (as constitutionally obligated)': 'the-creator',
  'Creator-Authorized Execution': 'platform-al-watin',
  'Consumption Enforcement': 'makman-al-ghayah',
  'Goal Fulfilment (or Cancellation, or explicit Creator instruction)': 'the-creator',
} as const;

export const GOAL_AWARENESS_STAGE_TO_CHAMBER_HONESTY_NOTE = {
  note: 'This mapping was derived by reading each stage\'s already-certified "Responsible Component" and "Receiving Component" (MAKMAN_GOAL_LIFECYCLE_ARCHITECTURE.ts) once, at design time — it is a static lookup table baked into this file, not a live query of that document at Awareness-computation time. This preserves MAG-CA-RULING-005\'s "consume through Presence only" rule for every actual Awareness computation, while still being honestly grounded rather than guessed.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_AWARENESS_CONTEXT_DECLARATION = {
  interpretationBeyondDirectDerivation: false,
  directPackageIIQueryPerformed: false,
  decisionsIntroduced: false,
  status: 'LIVING LAYER II, LAYER COMPONENT B, GOAL AWARENESS CONTEXT, complete. All 6 required fields derived exclusively from GOAL_PRESENCE_CONTEXT.ts.',
} as const;

export const RAS_AL_AMR_GOAL_AWARENESS_CONTEXT = {
  fieldDerivation: GOAL_AWARENESS_CONTEXT_FIELD_DERIVATION,
  stageToChamberInference: GOAL_AWARENESS_STAGE_TO_CHAMBER_INFERENCE,
  stageToChamberHonestyNote: GOAL_AWARENESS_STAGE_TO_CHAMBER_HONESTY_NOTE,
  declaration: GOAL_AWARENESS_CONTEXT_DECLARATION,
} as const;
