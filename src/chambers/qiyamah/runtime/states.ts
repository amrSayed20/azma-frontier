/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME FOUNDATION — Runtime States
 * Construction Package: Living Runtime — Stage 5 of 13
 *
 * Defines the fifteen named Runtime States required by this stage's directive:
 * Chamber Runtime, Runtime Context, Runtime State, Journey State, Creative Session,
 * Idea State, Prompt State, Decision State, Director State, Ghost Guide State,
 * Companion State, Reflection State, Rendering State, Completion State, Exit State.
 *
 * Every shape here gives a TypeScript type to an enum, state field, or scope that
 * was already declared in prose by the approved State Model (state.ts) — no field
 * exists here that does not trace to an existing state_ownership.holds entry. This
 * file introduces no new state, only a typed carrier for state already approved.
 *
 * "Rendering State" here names the abstract Revelation-presentation state owned by
 * RevealCoordinator (STATE_REVEAL_COORDINATOR) — it is not a UI rendering concept and
 * defines no pixel, DOM, or component rendering of any kind.
 */

import type { RuntimeLifecycleStage } from './lifecycle';

// ═══════════════════════════════════════════════════════════════════════════
// SHARED ENUMS
// Typed forms of enums already declared in prose across state.ts.
// ═══════════════════════════════════════════════════════════════════════════

export const STORY_BEATS = ['Arrival', 'Spark', 'Dialogue', 'Journey', 'Transformation', 'Revelation', 'Aftermath', 'Return'] as const;
export type StoryBeat = (typeof STORY_BEATS)[number];

export const PARTNERSHIP_PHASES = ['initial', 'growing', 'deep', 'ultimate'] as const;
export type PartnershipPhase = (typeof PARTNERSHIP_PHASES)[number];

export const TRUST_STATES = ['earned', 'strained', 'in-repair'] as const;
export type TrustState = (typeof TRUST_STATES)[number];

export const CITIZEN_EXPRESSION_STATES = ['clarity', 'confusion', 'flow'] as const;
export type CitizenExpressionState = (typeof CITIZEN_EXPRESSION_STATES)[number];

export const INVISIBLE_DIRECTOR_MODES = ['watching', 'intervening', 'withdrawn'] as const;
export type InvisibleDirectorMode = (typeof INVISIBLE_DIRECTOR_MODES)[number];

export const GHOST_GUIDE_MODES = ['silent', 'present'] as const;
export type GhostGuideMode = (typeof GHOST_GUIDE_MODES)[number];

export const CHAMBER_RELATIONSHIP_MODES = ['follows', 'leads', 'questions', 'challenges', 'observes'] as const;
export type ChamberRelationshipMode = (typeof CHAMBER_RELATIONSHIP_MODES)[number];

export const CROSSING_STATES = ['incomplete', 'outward-registered', 'inward-registered', 'relational-registered'] as const;
export type CrossingStateValue = (typeof CROSSING_STATES)[number];

export const PRESENTATION_STATES = ['awaiting', 'presenting', 'encounter-complete'] as const;
export type PresentationState = (typeof PRESENTATION_STATES)[number];

// ═══════════════════════════════════════════════════════════════════════════
// 1 — RUNTIME CONTEXT
// The scope carrier every runtime call travels with — never content, only
// identity of whose session and act this call belongs to.
// Traces to LAYER_V_TRANSFORMATION.scope.citizenship (architecture.ts):
// "Citizen-specific and imagination-specific."
// ═══════════════════════════════════════════════════════════════════════════

export interface RuntimeContext {
  readonly citizenId: string;
  readonly sessionId: string;
  readonly actId: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// 2 — CHAMBER RUNTIME STATE
// Traces to STATE_QIYAMAH_CHAMBER (state.ts) — the composed root state.
// ═══════════════════════════════════════════════════════════════════════════

export interface ChamberRuntimeState {
  readonly context: RuntimeContext;
  readonly lifecycleStage: RuntimeLifecycleStage;
}

// ═══════════════════════════════════════════════════════════════════════════
// 4 — JOURNEY STATE
// Traces to STATE_STORY_COHERENCE (state.ts) — the accumulating narrative thread.
// ═══════════════════════════════════════════════════════════════════════════

export interface JourneyState {
  readonly currentBeat: StoryBeat;
  readonly coherenceThreadLength: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// 5 — CREATIVE SESSION STATE
// Traces to STATE_NARRATIVE_CLOCK + STATE_PARTNERSHIP_CHRONOLOGY (state.ts).
// ═══════════════════════════════════════════════════════════════════════════

export interface CreativeSessionState {
  readonly beat: StoryBeat;
  readonly partnershipPhase: PartnershipPhase;
}

// ═══════════════════════════════════════════════════════════════════════════
// 6 — IDEA STATE
// Traces to STATE_IMAGINATION_CLARIFIER (state.ts) — the identified imagination,
// never the imagination's content.
// ═══════════════════════════════════════════════════════════════════════════

export interface IdeaState {
  readonly identified: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// 7 — PROMPT STATE
// Traces to STATE_IMAGINATION_CLARIFIER.state_ownership.holds
// ("Received Citizen expression", "Clarification dialogue state") (state.ts).
// ═══════════════════════════════════════════════════════════════════════════

export interface PromptState {
  readonly received: boolean;
  readonly clarificationRound: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// 8 — DECISION STATE
// Traces to STATE_PARTICIPANT_ORCHESTRATOR (state.ts) — Citizen state and the
// sovereignty-triggering creative decision.
// ═══════════════════════════════════════════════════════════════════════════

export interface DecisionState {
  readonly citizenState: CitizenExpressionState;
  readonly creativeDecisionRegistered: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// 9 — DIRECTOR STATE
// Traces to STATE_PARTICIPANT_ORCHESTRATOR (state.ts) — Invisible Director state.
// ═══════════════════════════════════════════════════════════════════════════

export interface DirectorState {
  readonly mode: InvisibleDirectorMode;
}

// ═══════════════════════════════════════════════════════════════════════════
// 10 — GHOST GUIDE STATE
// Traces to STATE_PARTICIPANT_ORCHESTRATOR (state.ts) — Ghost Guide state.
// ═══════════════════════════════════════════════════════════════════════════

export interface GhostGuideState {
  readonly mode: GhostGuideMode;
  readonly hasSpokenOnCurrentDirection: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// 11 — COMPANION STATE
// Traces to STATE_PARTICIPANT_ORCHESTRATOR (state.ts) — Chamber relationship mode,
// felt by the Citizen as the Chamber's companionship.
// ═══════════════════════════════════════════════════════════════════════════

export interface CompanionState {
  readonly mode: ChamberRelationshipMode;
}

// ═══════════════════════════════════════════════════════════════════════════
// 12 — REFLECTION STATE
// Traces to STATE_CROSSING_TRACKER (state.ts) — the Inward Crossing / Aftermath
// holding.
// ═══════════════════════════════════════════════════════════════════════════

export interface ReflectionState {
  readonly crossing: CrossingStateValue;
}

// ═══════════════════════════════════════════════════════════════════════════
// 13 — RENDERING STATE
// Traces to STATE_REVEAL_COORDINATOR (state.ts) — the Revelation presentation
// state. Not a UI/DOM rendering concept.
// ═══════════════════════════════════════════════════════════════════════════

export interface RenderingState {
  readonly presentation: PresentationState;
  readonly recessionComplete: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// 14 — COMPLETION STATE
// Traces to STATE_CROSSING_TRACKER (state.ts) — Relational Crossing completion.
// ═══════════════════════════════════════════════════════════════════════════

export interface CompletionState {
  readonly relationalCrossingComplete: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// 15 — EXIT STATE
// Traces to STATE_NARRATIVE_CLOCK (state.ts) — Aftermath→Return, session end.
// ═══════════════════════════════════════════════════════════════════════════

export interface ExitState {
  readonly aftermathInhabited: boolean;
  readonly sessionEnded: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// 3 — RUNTIME STATE
// The umbrella composite — every other named state, held together. Optional
// fields are null exactly when their owning lifecycle stage has not yet been
// reached or has already reset (STATE_*.state_classification: ACT_SCOPED
// entities reset between acts; state.ts).
// ═══════════════════════════════════════════════════════════════════════════

export interface RuntimeState {
  readonly chamber: ChamberRuntimeState;
  readonly journey: JourneyState;
  readonly creativeSession: CreativeSessionState;
  readonly idea: IdeaState | null;
  readonly prompt: PromptState | null;
  readonly decision: DecisionState;
  readonly director: DirectorState;
  readonly ghostGuide: GhostGuideState;
  readonly companion: CompanionState;
  readonly reflection: ReflectionState | null;
  readonly rendering: RenderingState | null;
  readonly completion: CompletionState | null;
  readonly exit: ExitState | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME STATE METADATA
// Ownership and visibility for all fifteen named states, consolidated.
// Visibility classes reuse STATE_VISIBILITY_MODEL (state.ts) verbatim.
// ═══════════════════════════════════════════════════════════════════════════

export type RuntimeStateVisibility = 'INTERNAL_ONLY' | 'FELT_ONLY' | 'NOT_APPLICABLE';

export interface RuntimeStateMetadataEntry {
  readonly ownerEntity: string;
  readonly visibility: RuntimeStateVisibility;
  readonly traceability: string;
}

export const RUNTIME_STATE_METADATA: Readonly<Record<string, RuntimeStateMetadataEntry>> = {
  RuntimeContext:        { ownerEntity: 'QiyamahChamber (composition scope carrier)', visibility: 'INTERNAL_ONLY', traceability: 'LAYER_V_TRANSFORMATION.scope.citizenship (architecture.ts)' },
  ChamberRuntimeState:   { ownerEntity: 'QiyamahChamber', visibility: 'NOT_APPLICABLE', traceability: 'STATE_QIYAMAH_CHAMBER (state.ts)' },
  RuntimeState:          { ownerEntity: 'QiyamahChamber (composed)', visibility: 'NOT_APPLICABLE', traceability: 'STATE_QIYAMAH_CHAMBER (state.ts)' },
  JourneyState:          { ownerEntity: 'StoryCoherence', visibility: 'FELT_ONLY', traceability: 'STATE_STORY_COHERENCE (state.ts)' },
  CreativeSessionState:  { ownerEntity: 'NarrativeClock + PartnershipChronology', visibility: 'FELT_ONLY', traceability: 'STATE_NARRATIVE_CLOCK, STATE_PARTNERSHIP_CHRONOLOGY (state.ts)' },
  IdeaState:             { ownerEntity: 'ImaginationClarifier', visibility: 'INTERNAL_ONLY', traceability: 'STATE_IMAGINATION_CLARIFIER (state.ts)' },
  PromptState:           { ownerEntity: 'ImaginationClarifier', visibility: 'INTERNAL_ONLY', traceability: 'STATE_IMAGINATION_CLARIFIER (state.ts)' },
  DecisionState:         { ownerEntity: 'ParticipantOrchestrator', visibility: 'INTERNAL_ONLY', traceability: 'STATE_PARTICIPANT_ORCHESTRATOR (state.ts)' },
  DirectorState:         { ownerEntity: 'ParticipantOrchestrator', visibility: 'INTERNAL_ONLY', traceability: 'STATE_PARTICIPANT_ORCHESTRATOR (state.ts)' },
  GhostGuideState:       { ownerEntity: 'ParticipantOrchestrator', visibility: 'INTERNAL_ONLY', traceability: 'STATE_PARTICIPANT_ORCHESTRATOR (state.ts)' },
  CompanionState:        { ownerEntity: 'ParticipantOrchestrator', visibility: 'INTERNAL_ONLY', traceability: 'STATE_PARTICIPANT_ORCHESTRATOR (state.ts)' },
  ReflectionState:       { ownerEntity: 'CrossingTracker', visibility: 'INTERNAL_ONLY', traceability: 'STATE_CROSSING_TRACKER (state.ts)' },
  RenderingState:        { ownerEntity: 'RevealCoordinator', visibility: 'FELT_ONLY', traceability: 'STATE_REVEAL_COORDINATOR (state.ts)' },
  CompletionState:       { ownerEntity: 'CrossingTracker', visibility: 'INTERNAL_ONLY', traceability: 'STATE_CROSSING_TRACKER (state.ts)' },
  ExitState:             { ownerEntity: 'NarrativeClock', visibility: 'FELT_ONLY', traceability: 'STATE_NARRATIVE_CLOCK (state.ts)' },
};
