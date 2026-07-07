/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME FOUNDATION — Runtime Contracts, Guards, and Invariants
 * Construction Package: Living Runtime — Stage 5 of 13
 *
 * Defines the runtime contracts between Citizen → Companion → Ghost Guide →
 * Invisible Director → Creative Runtime → Future AI Engine, WITHOUT implementing
 * any AI engine — every contract below is a type signature only, with no method
 * body, no model call, no prompt construction, no networking.
 *
 * Also defines the four timing guards this stage requires exactly: when the Ghost
 * Guide may intervene, when the Companion may speak, when the Invisible Director
 * may change rhythm, and when the Chamber becomes silent — each a pure, table- or
 * condition-driven function derived from an already-approved constitutional rule.
 *
 * Also consolidates Runtime Invariants: constraints that must hold at every call
 * across every contract below, copied forward from validation.ts and behavior.ts.
 */

import type { RuntimeLifecycleStage } from './lifecycle';
import type {
  DecisionState,
  GhostGuideState,
  CompanionState,
  DirectorState,
  RenderingState,
  IdeaState,
} from './states';
import type { RuntimeSignal } from './signals';

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME CONTRACTS
// Citizen → Companion → Ghost Guide → Invisible Director → Creative Runtime →
// Future AI Engine. Each interface is a contract surface only.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The Citizen's sole contract with the Chamber: expression in, nothing else.
 * Traces to EVENT_CITIZEN_EXPRESSION (events.ts).
 */
export interface CitizenContract {
  readonly express: (form: RuntimeSignal & { readonly kind: 'CitizenExpression' }) => void;
}

/**
 * The Companion is the felt expression of the Chamber's relationship mode.
 * Traces to ENTITY_PARTICIPANT_ORCHESTRATOR (specification.ts).
 */
export interface CompanionContract {
  readonly currentMode: () => CompanionState;
  readonly mayOffer: (state: TimingContext) => boolean;
}

/**
 * The Ghost Guide speaks at most once per creative direction. Traces to
 * CharacterAuthority.owns ("Ghost Guide personality") and
 * BEHAVIOR_PARTICIPANT_ORCHESTRATOR.behavioral_invariants (behavior.ts).
 */
export interface GhostGuideContract {
  readonly currentMode: () => GhostGuideState;
  readonly mayIntervene: (state: TimingContext) => boolean;
}

/**
 * The Invisible Director watches, may intervene, and withdraws completely
 * during Rendering. Traces to CharacterAuthority.owns ("Invisible Director
 * mandate") (specification.ts).
 */
export interface InvisibleDirectorContract {
  readonly currentMode: () => DirectorState;
  readonly mayChangeRhythm: (state: TimingContext) => boolean;
}

/**
 * The Creative Runtime is this Foundation's own composing surface — it
 * executes the lifecycle and signal tables; it holds no decision authority
 * beyond table lookup (Runtime Constitutional Law, Article IV).
 */
export interface CreativeRuntimeContract {
  readonly currentStage: () => RuntimeLifecycleStage;
  readonly isSilent: (state: TimingContext) => boolean;
}

/**
 * The contract a Future AI Engine must satisfy to be admitted into Layer V's
 * pursuit — WITHOUT this Foundation implementing any such engine. `pursue`
 * returns only whether the four markers passed; it never returns or receives
 * model-specific detail (no prompts, no tokens, no provider payloads).
 */
export interface FutureAIEngineContract {
  readonly pursue: (idea: IdeaState) => Promise<{ readonly allMarkersPass: boolean }>;
}

// ═══════════════════════════════════════════════════════════════════════════
// TIMING CONTEXT
// The minimal, structural state four guard functions below need to answer
// "may this happen now?" — never more than the relevant state slices.
// ═══════════════════════════════════════════════════════════════════════════

export interface TimingContext {
  readonly lifecycleStage: RuntimeLifecycleStage;
  readonly decision: DecisionState;
  readonly ghostGuide: GhostGuideState;
  readonly companion: CompanionState;
  readonly director: DirectorState;
  readonly rendering: RenderingState | null;
}

// ═══════════════════════════════════════════════════════════════════════════
// THE FOUR REQUIRED TIMING GUARDS
// Each is pure and table/condition-driven — it executes an already-approved
// rule, it does not decide one.
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Exactly when the Ghost Guide may intervene: it must currently be silent, it
 * must not already have spoken on the current creative direction, and the
 * Citizen must not yet have registered a creative decision (after which the
 * Chamber shifts to follows, unconditionally).
 * Traces to BEHAVIOR_PARTICIPANT_ORCHESTRATOR.private_contract.ghost_guide_rule
 * (behavior.ts): "The Ghost Guide speaks once — with restraint, courage,
 * dignity. After the Citizen decides — the Guide is silent."
 */
export function mayGhostGuideIntervene(context: TimingContext): boolean {
  return (
    context.ghostGuide.mode === 'silent' &&
    !context.ghostGuide.hasSpokenOnCurrentDirection &&
    !context.decision.creativeDecisionRegistered
  );
}

/**
 * Exactly when the Companion may speak: before a Citizen decision, any of the
 * five constitutional relationship modes may offer. After a Citizen decision,
 * only follows may — the shift to follows is unconditional and immediate.
 * Traces to BEHAVIOR_PARTICIPANT_ORCHESTRATOR.allowed_state_transitions
 * (behavior.ts): "any mode → follows, unconditionally, upon a Citizen creative
 * decision."
 */
export function mayCompanionSpeak(context: TimingContext): boolean {
  if (context.decision.creativeDecisionRegistered) {
    return context.companion.mode === 'follows';
  }
  return true;
}

/**
 * Exactly when the Invisible Director may change rhythm: only while watching
 * or intervening, and never during Rendering — the Director withdraws
 * completely for the full duration of the Revelation encounter.
 * Traces to BEHAVIOR_PARTICIPANT_ORCHESTRATOR.behavioral_invariants
 * (behavior.ts): "The Invisible Director is fully withdrawn for the entire
 * Revelation beat."
 */
export function mayInvisibleDirectorChangeRhythm(context: TimingContext): boolean {
  if (context.lifecycleStage === 'Rendering') {
    return false;
  }
  return context.director.mode === 'watching' || context.director.mode === 'intervening';
}

/**
 * Exactly when the Chamber becomes silent: for the full duration of the
 * Rendering stage while RevealCoordinator is actively presenting.
 * Traces to BEHAVIOR_REVEAL_COORDINATOR.behavioral_invariants (behavior.ts):
 * "No language is produced from awaiting through encounter-complete."
 */
export function isChamberSilent(context: TimingContext): boolean {
  return (
    context.lifecycleStage === 'Rendering' &&
    context.rendering !== null &&
    context.rendering.presentation === 'presenting'
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME INVARIANTS
// Constraints that must hold at every runtime call, copied forward from the
// approved Validation and Behavior Models.
// ═══════════════════════════════════════════════════════════════════════════

export interface RuntimeInvariant {
  readonly id: string;
  readonly rule: string;
  readonly source: string;
}

export const RUNTIME_INVARIANTS: readonly RuntimeInvariant[] = [
  { id: 'no-clock-time',        rule: 'No runtime state or signal may ever carry a duration, percentage, or countdown value.', source: 'BOUNDARY_CHECK_CLOCK_TIME (validation.ts)' },
  { id: 'no-mechanism-exposure', rule: 'No runtime state or signal may expose internal mechanism to the Citizen.', source: 'BOUNDARY_CHECK_MECHANISM (validation.ts)' },
  { id: 'no-memory-display',    rule: 'Layer II runtime state (trust, creative profile, partnership phase) is never displayed, only felt through calibration.', source: 'BOUNDARY_CHECK_MEMORY_DISPLAY (validation.ts)' },
  { id: 'sovereignty-final',    rule: 'Once a Citizen creative decision is registered, no runtime contract may re-open, qualify, or advocate against it.', source: 'BOUNDARY_CHECK_SOVEREIGNTY (validation.ts)' },
  { id: 'four-marker-gate',     rule: 'No runtime transition into Rendering may occur without a prior MarkerConfirmationSignal confirming all four markers.', source: 'VALIDATION_3_PRE_PRESENTATION_MARKERS (validation.ts)' },
  { id: 'silence-during-rendering', rule: 'No runtime contract may produce language while isChamberSilent(context) is true.', source: 'VALIDATION_4_REVELATION_PRESENTATION (validation.ts)' },
  { id: 'crossing-sequence',    rule: 'Reflection state may only report inward-registered after outward-registered, and relational-registered only after both.', source: 'STATE_CROSSING_TRACKER.allowed_state_transitions (state.ts)' },
  { id: 'no-runtime-authority', rule: 'The Runtime never decides, interprets, evaluates, or legislates — every guard above is a table or condition lookup only.', source: 'Runtime Constitutional Law, Article IV (this stage\'s directive)' },
];
