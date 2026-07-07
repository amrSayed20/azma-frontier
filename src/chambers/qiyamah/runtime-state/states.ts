/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME STATE MODEL — Per-State Architecture
 * Construction Package: Living Runtime — Stage 8 of 13
 *
 * Defines the complete state architecture for each of the fifteen named runtime
 * states already typed in runtime/states.ts (Stage 5): ownership,
 * classification, lifecycle, visibility, transitions, synchronization,
 * restoration, invariants, guards, and traceability.
 *
 * Documentation only — no execution logic, no new state, no new guard function.
 * Every guard named below already exists in runtime-interfaces/facade.ts
 * (Stage 6); none is created here.
 */

import type { RuntimeStateClassification } from './taxonomy';
import type { RuntimeStateVisibility } from '../runtime/states';

export interface RuntimeStateArchitecture {
  readonly name: string;
  readonly state_ownership: { readonly ownerEntity: string; readonly ownerContract: string };
  readonly state_classification: RuntimeStateClassification;
  readonly state_lifecycle: { readonly initializesAt: string; readonly activeDuring: string; readonly resetsAt: string };
  readonly state_visibility: RuntimeStateVisibility;
  readonly state_transitions: { readonly allowed: readonly string[]; readonly forbidden: readonly string[] };
  readonly state_synchronization: readonly string[];
  readonly state_restoration: string;
  readonly state_invariants: readonly string[];
  readonly state_guards: readonly string[];
  readonly state_traceability: Readonly<Record<string, string>>;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1 — RUNTIME CONTEXT
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_RUNTIME_CONTEXT: RuntimeStateArchitecture = {
  name: 'RuntimeContextArchitecture',
  state_ownership: { ownerEntity: 'QiyamahChamber (composition scope carrier)', ownerContract: 'CreativeRuntimeContract' },
  state_classification: 'SCOPE_CARRIER',
  state_lifecycle: { initializesAt: 'First Citizen arrival (citizenId); each session Beginning (sessionId); each act\'s Listening stage (actId)', activeDuring: 'The entire partnership, session, or act it scopes, respectively', resetsAt: 'citizenId: never. sessionId: at Leaving. actId: at Completing→Leaving or at the next Listening.' },
  state_visibility: 'INTERNAL_ONLY',
  state_transitions: {
    allowed: ['actId: null → a new act identifier, at Listening', 'actId: an act identifier → null, at Completing'],
    forbidden: ['citizenId or sessionId reassignment mid-scope'],
  },
  state_synchronization: ['Must match the citizenId/sessionId/actId every other state\'s owning contract currently operates under.'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('scope_carrier_partial_restoration'),
  state_invariants: ['actId is null whenever ChamberRuntimeState.lifecycleStage is Beginning.'],
  state_guards: [],
  state_traceability: {
    foundation: 'RuntimeContext (runtime/states.ts)',
    architecture: 'LAYER_V_TRANSFORMATION.scope.citizenship (architecture.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 2 — CHAMBER RUNTIME STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_CHAMBER_RUNTIME: RuntimeStateArchitecture = {
  name: 'ChamberRuntimeStateArchitecture',
  state_ownership: { ownerEntity: 'QiyamahChamber', ownerContract: 'CreativeRuntimeContract' },
  state_classification: 'COMPOSED',
  state_lifecycle: { initializesAt: 'Session Beginning', activeDuring: 'The entire session', resetsAt: 'Session Leaving' },
  state_visibility: 'NOT_APPLICABLE',
  state_transitions: {
    allowed: ['lifecycleStage: any transition permitted by isPermittedLifecycleTransition (runtime/lifecycle.ts)'],
    forbidden: ['lifecycleStage: any transition isPermittedLifecycleTransition returns false for'],
  },
  state_synchronization: ['stage_authority (taxonomy.ts) — every other state\'s implicit stage dependence must agree with this state\'s lifecycleStage.'],
  state_restoration: 'Resets at session end; not restored — the next session composes a fresh ChamberRuntimeState informed only by Layer II depth, never by the prior session\'s specific stage history.',
  state_invariants: ['lifecycleStage is always exactly one of the eleven RUNTIME_LIFECYCLE_STAGES.'],
  state_guards: ['isPermittedLifecycleTransition', 'isTerminalStage', 'resolveLifecycleEvent'],
  state_traceability: {
    foundation: 'ChamberRuntimeState (runtime/states.ts)',
    architecture: 'STATE_QIYAMAH_CHAMBER (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 3 — RUNTIME STATE (umbrella composite)
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_RUNTIME_STATE: RuntimeStateArchitecture = {
  name: 'RuntimeStateArchitecture',
  state_ownership: { ownerEntity: 'QiyamahChamber (composed)', ownerContract: 'CreativeRuntimeContract' },
  state_classification: 'COMPOSED',
  state_lifecycle: { initializesAt: 'Session Beginning, with all act-scoped fields null', activeDuring: 'The entire session', resetsAt: 'Session Leaving' },
  state_visibility: 'NOT_APPLICABLE',
  state_transitions: {
    allowed: ['Each constituent field transitions per its own state architecture entry below.'],
    forbidden: ['No field may be present while ChamberRuntimeState.lifecycleStage indicates its owning stage has not yet been reached.'],
  },
  state_synchronization: ['Every constituent field must be internally consistent with every other — this entry has no synchronization rule beyond the union of its parts\' own rules.'],
  state_restoration: 'Composed from across_act_boundary and across_session_boundary (taxonomy.ts) simultaneously — no independent restoration rule of its own.',
  state_invariants: ['idea, prompt, reflection, rendering, and completion are all null before their owning act reaches the corresponding stage, and all null again once the act completes.'],
  state_guards: [],
  state_traceability: {
    foundation: 'RuntimeState (runtime/states.ts)',
    architecture: 'STATE_QIYAMAH_CHAMBER (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 4 — JOURNEY STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_JOURNEY: RuntimeStateArchitecture = {
  name: 'JourneyStateArchitecture',
  state_ownership: { ownerEntity: 'StoryCoherence', ownerContract: 'CreativeRuntimeContract (read-only surface)' },
  state_classification: 'SESSION_SCOPED',
  state_lifecycle: { initializesAt: 'Session Beginning, with coherenceThreadLength at 0', activeDuring: 'The entire session', resetsAt: 'Session Leaving' },
  state_visibility: 'FELT_ONLY',
  state_transitions: {
    allowed: ['currentBeat: forward only, one StoryBeat at a time', 'coherenceThreadLength: monotonically increasing'],
    forbidden: ['currentBeat: any reversal or skip', 'coherenceThreadLength: any decrease'],
  },
  state_synchronization: ['currentBeat must agree with the StoryBeatDeclaration most recently reflected by ChamberRuntimeState.lifecycleStage.'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('across_session_boundary'),
  state_invariants: ['coherenceThreadLength never decreases within a session.'],
  state_guards: ['isPermittedLifecycleTransition'],
  state_traceability: {
    foundation: 'JourneyState (runtime/states.ts)',
    architecture: 'STATE_STORY_COHERENCE (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 5 — CREATIVE SESSION STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_CREATIVE_SESSION: RuntimeStateArchitecture = {
  name: 'CreativeSessionStateArchitecture',
  state_ownership: { ownerEntity: 'NarrativeClock + PartnershipChronology', ownerContract: 'CreativeRuntimeContract (read-only surface)' },
  state_classification: 'SESSION_SCOPED',
  state_lifecycle: { initializesAt: 'Session Beginning', activeDuring: 'The entire session', resetsAt: 'Session Leaving (beat only — partnershipPhase persists across sessions at its Layer II source, though this runtime snapshot resets)' },
  state_visibility: 'FELT_ONLY',
  state_transitions: {
    allowed: ['beat: forward only, one StoryBeat at a time', 'partnershipPhase: initial → growing → deep → ultimate, forward only'],
    forbidden: ['beat: reversal or skip', 'partnershipPhase: regression'],
  },
  state_synchronization: ['beat must equal JourneyState.currentBeat at every instant.'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('across_session_boundary'),
  state_invariants: ['beat and JourneyState.currentBeat are never observed to differ.'],
  state_guards: ['isPermittedLifecycleTransition'],
  state_traceability: {
    foundation: 'CreativeSessionState (runtime/states.ts)',
    architecture: 'STATE_NARRATIVE_CLOCK, STATE_PARTNERSHIP_CHRONOLOGY (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 6 — IDEA STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_IDEA: RuntimeStateArchitecture = {
  name: 'IdeaStateArchitecture',
  state_ownership: { ownerEntity: 'ImaginationClarifier', ownerContract: 'FutureAIEngineContract (consumer), CitizenContract (origin)' },
  state_classification: 'ACT_SCOPED',
  state_lifecycle: { initializesAt: 'null at Beginning of each act; identified: false at Listening', activeDuring: 'Listening through Directing', resetsAt: 'Completing→Leaving or next act\'s Listening (returns to null)' },
  state_visibility: 'INTERNAL_ONLY',
  state_transitions: {
    allowed: ['identified: false → true, once (during Understanding/Clarifying)'],
    forbidden: ['identified: true → false within the same act'],
  },
  state_synchronization: ['identified must be true before FutureAIEngineContract.pursue() may be meaningfully called (Creating stage).'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('across_act_boundary'),
  state_invariants: ['identified is false for the entirety of Beginning, Listening prior to extraction, and always null-equivalent before an act begins.'],
  state_guards: ['isPermittedLifecycleTransition'],
  state_traceability: {
    foundation: 'IdeaState (runtime/states.ts)',
    architecture: 'STATE_IMAGINATION_CLARIFIER (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 7 — PROMPT STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_PROMPT: RuntimeStateArchitecture = {
  name: 'PromptStateArchitecture',
  state_ownership: { ownerEntity: 'ImaginationClarifier', ownerContract: 'CitizenContract' },
  state_classification: 'ACT_SCOPED',
  state_lifecycle: { initializesAt: 'null at Beginning of each act; received: false at Listening', activeDuring: 'Listening through Clarifying', resetsAt: 'Preparing onward (returns to null once the imagination is identified)' },
  state_visibility: 'INTERNAL_ONLY',
  state_transitions: {
    allowed: ['received: false → true, on first CitizenContract.express() call', 'clarificationRound: 0, 1, 2, ... monotonically increasing while Clarifying self-loops'],
    forbidden: ['clarificationRound: any decrease'],
  },
  state_synchronization: ['clarificationRound only increases while ChamberRuntimeState.lifecycleStage is Clarifying.'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('across_act_boundary'),
  state_invariants: ['received is always true before clarificationRound may be greater than 0.'],
  state_guards: ['isSelfLoop', 'isPermittedEmitter'],
  state_traceability: {
    foundation: 'PromptState (runtime/states.ts)',
    architecture: 'STATE_IMAGINATION_CLARIFIER (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 8 — DECISION STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_DECISION: RuntimeStateArchitecture = {
  name: 'DecisionStateArchitecture',
  state_ownership: { ownerEntity: 'ParticipantOrchestrator', ownerContract: 'CompanionContract, GhostGuideContract, InvisibleDirectorContract (readers)' },
  state_classification: 'SESSION_SCOPED',
  state_lifecycle: { initializesAt: 'Session Beginning: citizenState "flow"-neutral, creativeDecisionRegistered false', activeDuring: 'The entire session; creativeDecisionRegistered resets per creative direction', resetsAt: 'Session Leaving' },
  state_visibility: 'INTERNAL_ONLY',
  state_transitions: {
    allowed: ['citizenState: clarity ↔ confusion ↔ flow, freely, per Citizen expression', 'creativeDecisionRegistered: false → true, on a Citizen creative decision'],
    forbidden: ['creativeDecisionRegistered: true → false within the same creative direction'],
  },
  state_synchronization: ['single_timing_context (taxonomy.ts) — must be read from the same TimingContext as DirectorState, GhostGuideState, and CompanionState.'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('across_session_boundary'),
  state_invariants: ['Once creativeDecisionRegistered is true, mayCompanionSpeak and mayGhostGuideIntervene both observe it and behave accordingly.'],
  state_guards: ['mayCompanionSpeak', 'mayGhostGuideIntervene'],
  state_traceability: {
    foundation: 'DecisionState (runtime/states.ts)',
    architecture: 'STATE_PARTICIPANT_ORCHESTRATOR (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 9 — DIRECTOR STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_DIRECTOR: RuntimeStateArchitecture = {
  name: 'DirectorStateArchitecture',
  state_ownership: { ownerEntity: 'ParticipantOrchestrator', ownerContract: 'InvisibleDirectorContract' },
  state_classification: 'SESSION_SCOPED',
  state_lifecycle: { initializesAt: 'Session Beginning: mode "watching"', activeDuring: 'The entire session', resetsAt: 'Session Leaving' },
  state_visibility: 'INTERNAL_ONLY',
  state_transitions: {
    allowed: ['mode: watching ↔ intervening, per constitutional condition', 'mode: any → withdrawn, at Rendering'],
    forbidden: ['mode: withdrawn → watching or intervening while lifecycleStage is Rendering'],
  },
  state_synchronization: ['rendering_silence (taxonomy.ts) — mode must be "withdrawn" whenever RenderingState.presentation is "presenting".'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('across_session_boundary'),
  state_invariants: ['mode is always "withdrawn" for the entire Rendering stage.'],
  state_guards: ['mayInvisibleDirectorChangeRhythm', 'isChamberSilent'],
  state_traceability: {
    foundation: 'DirectorState (runtime/states.ts)',
    architecture: 'STATE_PARTICIPANT_ORCHESTRATOR (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 10 — GHOST GUIDE STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_GHOST_GUIDE: RuntimeStateArchitecture = {
  name: 'GhostGuideStateArchitecture',
  state_ownership: { ownerEntity: 'ParticipantOrchestrator', ownerContract: 'GhostGuideContract' },
  state_classification: 'SESSION_SCOPED',
  state_lifecycle: { initializesAt: 'Session Beginning: mode "silent", hasSpokenOnCurrentDirection false', activeDuring: 'The entire session; hasSpokenOnCurrentDirection resets per creative direction', resetsAt: 'Session Leaving' },
  state_visibility: 'INTERNAL_ONLY',
  state_transitions: {
    allowed: ['mode: silent → present, at most once per creative direction', 'mode: present → silent, immediately after speaking'],
    forbidden: ['mode: present → present (a second consecutive presence on the same direction)'],
  },
  state_synchronization: ['single_timing_context (taxonomy.ts); rendering_silence (taxonomy.ts) — mode must be "silent" whenever RenderingState.presentation is "presenting".'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('across_session_boundary'),
  state_invariants: ['hasSpokenOnCurrentDirection is true only until the next creative direction begins, at which point it resets to false.'],
  state_guards: ['mayGhostGuideIntervene'],
  state_traceability: {
    foundation: 'GhostGuideState (runtime/states.ts)',
    architecture: 'STATE_PARTICIPANT_ORCHESTRATOR (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 11 — COMPANION STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_COMPANION: RuntimeStateArchitecture = {
  name: 'CompanionStateArchitecture',
  state_ownership: { ownerEntity: 'ParticipantOrchestrator', ownerContract: 'CompanionContract' },
  state_classification: 'SESSION_SCOPED',
  state_lifecycle: { initializesAt: 'Session Beginning: mode "follows"', activeDuring: 'The entire session', resetsAt: 'Session Leaving' },
  state_visibility: 'INTERNAL_ONLY',
  state_transitions: {
    allowed: ['mode: follows ↔ leads ↔ questions ↔ challenges ↔ observes, per constitutional condition', 'mode: any → follows, unconditionally, upon a Citizen creative decision'],
    forbidden: ['mode: follows → any other mode once DecisionState.creativeDecisionRegistered is true'],
  },
  state_synchronization: ['single_timing_context (taxonomy.ts).'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('across_session_boundary'),
  state_invariants: ['mode is always "follows" once a Citizen decision is registered, for the remainder of that creative direction.'],
  state_guards: ['mayCompanionSpeak'],
  state_traceability: {
    foundation: 'CompanionState (runtime/states.ts)',
    architecture: 'STATE_PARTICIPANT_ORCHESTRATOR (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 12 — REFLECTION STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_REFLECTION: RuntimeStateArchitecture = {
  name: 'ReflectionStateArchitecture',
  state_ownership: { ownerEntity: 'CrossingTracker', ownerContract: 'CreativeRuntimeContract (read-only surface)' },
  state_classification: 'ACT_SCOPED',
  state_lifecycle: { initializesAt: 'null before Directing resolves; crossing "incomplete" once Rendering begins', activeDuring: 'Rendering through Reflecting', resetsAt: 'Completing→Leaving or next act (returns to null)' },
  state_visibility: 'INTERNAL_ONLY',
  state_transitions: {
    allowed: ['crossing: incomplete → outward-registered → inward-registered → relational-registered, strictly in sequence'],
    forbidden: ['crossing: any out-of-sequence registration or reversal'],
  },
  state_synchronization: ['crossing_sequence (taxonomy.ts) — relational-registered may not precede CompletionState.relationalCrossingComplete becoming true; they change together.'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('across_act_boundary'),
  state_invariants: ['crossing only ever advances forward within an act.'],
  state_guards: ['isChamberSilent'],
  state_traceability: {
    foundation: 'ReflectionState (runtime/states.ts)',
    architecture: 'STATE_CROSSING_TRACKER (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 13 — RENDERING STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_RENDERING: RuntimeStateArchitecture = {
  name: 'RenderingStateArchitecture',
  state_ownership: { ownerEntity: 'RevealCoordinator', ownerContract: 'CreativeRuntimeContract' },
  state_classification: 'ACT_SCOPED',
  state_lifecycle: { initializesAt: 'null before Directing resolves true; presentation "awaiting" once Rendering begins', activeDuring: 'The Rendering stage only', resetsAt: 'Reflecting onward (returns to null)' },
  state_visibility: 'FELT_ONLY',
  state_transitions: {
    allowed: ['presentation: awaiting → presenting → encounter-complete', 'recessionComplete: false → true, concurrent with presenting'],
    forbidden: ['presentation: presenting → awaiting (no re-entry)', 'recessionComplete: true → false during the encounter'],
  },
  state_synchronization: ['rendering_silence (taxonomy.ts) — presentation "presenting" forces DirectorState.mode "withdrawn" and GhostGuideState.mode "silent" in the same tick.'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('across_act_boundary'),
  state_invariants: ['isChamberSilent() is true exactly when presentation is "presenting".'],
  state_guards: ['isChamberSilent'],
  state_traceability: {
    foundation: 'RenderingState (runtime/states.ts)',
    architecture: 'STATE_REVEAL_COORDINATOR (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 14 — COMPLETION STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_COMPLETION: RuntimeStateArchitecture = {
  name: 'CompletionStateArchitecture',
  state_ownership: { ownerEntity: 'CrossingTracker', ownerContract: 'CreativeRuntimeContract (read-only surface)' },
  state_classification: 'ACT_SCOPED',
  state_lifecycle: { initializesAt: 'null before Reflecting resolves; relationalCrossingComplete false once Completing begins', activeDuring: 'The Completing stage only', resetsAt: 'Leaving or next act (returns to null)' },
  state_visibility: 'INTERNAL_ONLY',
  state_transitions: {
    allowed: ['relationalCrossingComplete: false → true, once, when the Relational Crossing registers'],
    forbidden: ['relationalCrossingComplete: true → false within the same act'],
  },
  state_synchronization: ['crossing_sequence (taxonomy.ts) — may only become true after ReflectionState.crossing reports "inward-registered".'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('across_act_boundary'),
  state_invariants: ['relationalCrossingComplete is never true while ReflectionState.crossing is "incomplete" or "outward-registered".'],
  state_guards: [],
  state_traceability: {
    foundation: 'CompletionState (runtime/states.ts)',
    architecture: 'STATE_CROSSING_TRACKER (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// 15 — EXIT STATE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_EXIT: RuntimeStateArchitecture = {
  name: 'ExitStateArchitecture',
  state_ownership: { ownerEntity: 'NarrativeClock', ownerContract: 'CreativeRuntimeContract' },
  state_classification: 'SESSION_SCOPED',
  state_lifecycle: { initializesAt: 'null until Completing resolves; aftermathInhabited false, sessionEnded false at Leaving\'s approach', activeDuring: 'The Leaving stage only', resetsAt: 'Immediately consumed at session end — never carried into the next session' },
  state_visibility: 'FELT_ONLY',
  state_transitions: {
    allowed: ['aftermathInhabited: false → true, once, before sessionEnded may become true', 'sessionEnded: false → true, once, terminal'],
    forbidden: ['sessionEnded: true → false', 'sessionEnded: true while aftermathInhabited is false'],
  },
  state_synchronization: ['stage_authority (taxonomy.ts) — sessionEnded is true only when ChamberRuntimeState.lifecycleStage is "Leaving" and isTerminalStage("Leaving") is true.'],
  state_restoration: RUNTIME_STATE_RESTORATION_NOTE('across_session_boundary'),
  state_invariants: ['sessionEnded is never true while aftermathInhabited is false.'],
  state_guards: ['isTerminalStage'],
  state_traceability: {
    foundation: 'ExitState (runtime/states.ts)',
    architecture: 'STATE_NARRATIVE_CLOCK (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER (documentation-only — resolves a restoration-model reference to
// prose text; not a decision, a lookup into an already-approved table)
// ═══════════════════════════════════════════════════════════════════════════

function RUNTIME_STATE_RESTORATION_NOTE(
  key: 'across_act_boundary' | 'across_session_boundary' | 'scope_carrier_partial_restoration',
): string {
  const notes: Record<typeof key, string> = {
    across_act_boundary: 'See RUNTIME_STATE_RESTORATION_MODEL.across_act_boundary (taxonomy.ts) — deliberately not restored between acts.',
    across_session_boundary: 'See RUNTIME_STATE_RESTORATION_MODEL.across_session_boundary (taxonomy.ts) — deliberately not restored between sessions.',
    scope_carrier_partial_restoration: 'See RUNTIME_STATE_RESTORATION_MODEL.scope_carrier_partial_restoration (taxonomy.ts) — each sub-field restores at its own scope boundary.',
  };
  return notes[key];
}

// ═══════════════════════════════════════════════════════════════════════════
// ALL RUNTIME STATE ARCHITECTURES
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_STATE_ARCHITECTURES: readonly RuntimeStateArchitecture[] = [
  STATE_RUNTIME_CONTEXT,
  STATE_CHAMBER_RUNTIME,
  STATE_RUNTIME_STATE,
  STATE_JOURNEY,
  STATE_CREATIVE_SESSION,
  STATE_IDEA,
  STATE_PROMPT,
  STATE_DECISION,
  STATE_DIRECTOR,
  STATE_GHOST_GUIDE,
  STATE_COMPANION,
  STATE_REFLECTION,
  STATE_RENDERING,
  STATE_COMPLETION,
  STATE_EXIT,
];
