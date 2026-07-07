/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME STATE MODEL — Systemic Taxonomy
 * Construction Package: Living Runtime — Stage 8 of 13
 *
 * Systemic classification, visibility, synchronization, and restoration models
 * shared by all fifteen named runtime states (runtime/states.ts), refined for
 * the eleven-stage runtime lifecycle established in runtime/lifecycle.ts and
 * runtime-behavior/systemic.ts.
 *
 * Documentation only — no execution logic, no new state.
 */

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME STATE CLASSIFICATION TAXONOMY
// Five classes. Every one of the fifteen named runtime states belongs to
// exactly one, inherited from its owning entity's classification in
// STATE_CLASSIFICATION_TAXONOMY (state.ts).
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_STATE_CLASSIFICATION_TAXONOMY = {
  SCOPE_CARRIER: {
    description: 'Spans the partnership, session, and act scopes simultaneously — its sub-fields have independent reset points, never a single one.',
    members: ['RuntimeContext'],
    traceability: 'LAYER_V_TRANSFORMATION.scope.citizenship (architecture.ts): "Citizen-specific and imagination-specific."',
  },
  COMPOSED: {
    description: 'Holds no independent state of its own — entirely the composition of other runtime states.',
    members: ['ChamberRuntimeState', 'RuntimeState'],
    traceability: 'STATE_QIYAMAH_CHAMBER (state.ts), COMPOSITION_RULES (architecture.ts)',
  },
  SESSION_SCOPED: {
    description: 'Persists for the duration of one session (Beginning through Leaving). Initializes at Beginning, resets only at Leaving.',
    members: ['JourneyState', 'CreativeSessionState', 'DecisionState', 'DirectorState', 'GhostGuideState', 'CompanionState', 'ExitState'],
    traceability: 'STATE_NARRATIVE_CLOCK, STATE_PARTICIPANT_ORCHESTRATOR, STATE_STORY_COHERENCE, STATE_PARTNERSHIP_CHRONOLOGY (state.ts)',
  },
  ACT_SCOPED: {
    description: 'Persists for the duration of one creative act. Initializes on imagination receipt, resets between acts within a session.',
    members: ['IdeaState', 'PromptState', 'ReflectionState', 'RenderingState', 'CompletionState'],
    traceability: 'STATE_IMAGINATION_CLARIFIER, STATE_CROSSING_TRACKER, STATE_REVEAL_COORDINATOR (state.ts)',
  },
} as const;

export type RuntimeStateClassification = keyof typeof RUNTIME_STATE_CLASSIFICATION_TAXONOMY;

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME STATE VISIBILITY MODEL
// Reuses RuntimeStateVisibility (runtime/states.ts) verbatim; formalized here
// as a taxonomy with explicit membership.
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_STATE_VISIBILITY_MODEL = {
  INTERNAL_ONLY: {
    description: 'Never crosses to the Citizen in any form. Reachable by other runtime contracts only through a guarded accessor (facade.ts), never a raw table.',
    members: ['RuntimeContext', 'IdeaState', 'PromptState', 'DecisionState', 'DirectorState', 'GhostGuideState', 'CompanionState', 'ReflectionState', 'CompletionState'],
  },
  FELT_ONLY: {
    description: 'Its effect reaches the Citizen; the raw state value never does.',
    members: ['JourneyState', 'CreativeSessionState', 'RenderingState', 'ExitState'],
  },
  NOT_APPLICABLE: {
    description: 'No independent state exists to classify for visibility — composed entirely from other states.',
    members: ['ChamberRuntimeState', 'RuntimeState'],
  },
  traceability: 'STATE_VISIBILITY_MODEL (state.ts), RUNTIME_STATE_METADATA (runtime/states.ts)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME STATE SYNCHRONIZATION MODEL
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_STATE_SYNCHRONIZATION_MODEL = {
  single_timing_context: {
    states: ['DecisionState', 'DirectorState', 'GhostGuideState', 'CompanionState'],
    rule: 'All four must be read from the same TimingContext snapshot within one runtime tick — none may be read from a stale or independently-fetched snapshot relative to the others.',
    traceability: 'RUNTIME_SYSTEMIC_SYNCHRONIZATION.single_timing_context_rule (runtime-behavior/systemic.ts)',
  },
  stage_authority: {
    states: ['ChamberRuntimeState'],
    rule: 'ChamberRuntimeState.lifecycleStage is the single source every other state\'s implicit stage-dependence must agree with — no state may reflect a different stage than ChamberRuntimeState reports at the same instant.',
    traceability: 'RUNTIME_SYSTEMIC_SYNCHRONIZATION.stage_authority_rule (runtime-behavior/systemic.ts)',
  },
  rendering_silence: {
    states: ['RenderingState', 'DirectorState', 'GhostGuideState'],
    rule: 'Whenever RenderingState.presentation is "presenting", DirectorState.mode must be "withdrawn" and GhostGuideState.mode must be "silent" in the same tick.',
    traceability: 'RUNTIME_SYSTEMIC_SYNCHRONIZATION.rendering_silence_rule (runtime-behavior/systemic.ts)',
  },
  crossing_sequence: {
    states: ['ReflectionState', 'CompletionState'],
    rule: 'CompletionState.relationalCrossingComplete may only be true once ReflectionState.crossing reports "inward-registered" or later.',
    traceability: 'crossing_sequence_dependency (state.ts), STATE_CROSSING_TRACKER.allowed_state_transitions (state.ts)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME STATE RESTORATION MODEL
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_STATE_RESTORATION_MODEL = {
  across_act_boundary: {
    states: ['IdeaState', 'PromptState', 'ReflectionState', 'RenderingState', 'CompletionState'],
    rule: 'Deliberately not restored. Each new act initializes these fresh (null, per RuntimeState\'s optional fields) — a prior act\'s idea, prompt, reflection, rendering, or completion never carries forward.',
    traceability: 'SYSTEMIC_RESTORATION_MODEL.across_act_boundary (state.ts)',
  },
  across_session_boundary: {
    states: ['JourneyState', 'CreativeSessionState', 'DecisionState', 'DirectorState', 'GhostGuideState', 'CompanionState', 'ExitState'],
    rule: 'Deliberately not restored. Each new session initializes these fresh at Beginning — the prior session\'s specific values are never replayed, only its Layer II depth informs calibration.',
    traceability: 'SYSTEMIC_RESTORATION_MODEL.across_session_boundary (state.ts)',
  },
  scope_carrier_partial_restoration: {
    states: ['RuntimeContext'],
    rule: 'citizenId persists across the entire partnership lifetime and is never restored because never lost; sessionId is freshly assigned at each session Beginning; actId is freshly assigned (or set null) at each act boundary.',
    traceability: 'ARCHITECTURAL_LIFECYCLE (architecture.ts)',
  },
  mid_scale_interruption: {
    rule: 'If an act is interrupted before ReflectionState reaches "relational-registered", no partial value is promoted into JourneyState or CreativeSessionState — an interrupted act contributes nothing session-scoped.',
    traceability: 'mid_scale_interruption (state.ts)',
  },
} as const;
