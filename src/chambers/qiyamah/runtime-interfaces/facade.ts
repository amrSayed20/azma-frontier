/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME INTERFACES — Public Facade
 * Construction Package: Living Runtime — Stage 6 of 13
 *
 * The sole public entry point future runtime layers (Application Runtime,
 * Presentation Runtime, UI Runtime, AI Runtime, Engine Runtime, Workflow Runtime,
 * Execution Runtime) may import from. It re-exports exactly the PUBLIC surface
 * declared in boundary.ts — nothing more, nothing less — and adds two guarded
 * accessor functions so that per-state ownership/visibility bookkeeping (kept
 * INTERNAL as a raw table) is still reachable through a mechanical, non-deciding
 * lookup, exactly as the Foundation's own lifecycle and signal tables are
 * reachable only through their guard functions.
 *
 * No future runtime layer may import directly from ../runtime/* — this facade,
 * together with contracts.ts (the interface-level metadata) and index.ts (the
 * unified export), is the exclusive boundary between the Foundation and every
 * future implementation (Runtime Constitutional Law, Article VI, Stage 5).
 */

// ── Lifecycle: public surface only ──────────────────────────────────────────
export type { RuntimeLifecycleStage, RuntimeLifecycleEvent } from '../runtime/lifecycle';
export {
  RUNTIME_LIFECYCLE_STAGES,
  isForwardTransition,
  isRenewalTransition,
  isSelfLoop,
  isPermittedLifecycleTransition,
  isTerminalStage,
  resolveLifecycleEvent,
} from '../runtime/lifecycle';

// ── States: public surface only ─────────────────────────────────────────────
export type {
  StoryBeat, PartnershipPhase, TrustState, CitizenExpressionState,
  InvisibleDirectorMode, GhostGuideMode, ChamberRelationshipMode,
  CrossingStateValue, PresentationState,
  RuntimeContext, ChamberRuntimeState, JourneyState, CreativeSessionState,
  IdeaState, PromptState, DecisionState, DirectorState, GhostGuideState,
  CompanionState, ReflectionState, RenderingState, CompletionState, ExitState,
  RuntimeState, RuntimeStateVisibility, RuntimeStateMetadataEntry,
} from '../runtime/states';
export {
  STORY_BEATS, PARTNERSHIP_PHASES, TRUST_STATES, CITIZEN_EXPRESSION_STATES,
  INVISIBLE_DIRECTOR_MODES, GHOST_GUIDE_MODES, CHAMBER_RELATIONSHIP_MODES,
  CROSSING_STATES, PRESENTATION_STATES,
} from '../runtime/states';

// ── Signals: public surface only ────────────────────────────────────────────
export type { RuntimeSignal, RuntimeSignalKind, RuntimeSignalVisibility } from '../runtime/signals';
export { RUNTIME_SIGNAL_KINDS, isPermittedEmitter, visibilityOf, isCitizenVisibleEffect } from '../runtime/signals';

// ── Contracts: public surface only ──────────────────────────────────────────
export type {
  CitizenContract, CompanionContract, GhostGuideContract,
  InvisibleDirectorContract, CreativeRuntimeContract, FutureAIEngineContract,
  TimingContext, RuntimeInvariant,
} from '../runtime/contracts';
export {
  mayGhostGuideIntervene, mayCompanionSpeak, mayInvisibleDirectorChangeRhythm,
  isChamberSilent, RUNTIME_INVARIANTS,
} from '../runtime/contracts';

// ── Guarded accessors over Foundation-internal bookkeeping ──────────────────
// RUNTIME_STATE_METADATA itself is INTERNAL (boundary.ts); these two accessors
// are the only sanctioned path to it, mirroring the guard-function pattern
// already established for lifecycle transitions and signal permissions.
import { RUNTIME_STATE_METADATA } from '../runtime/states';
import type { RuntimeStateMetadataEntry, RuntimeStateVisibility } from '../runtime/states';

/**
 * Returns the ownership/visibility/traceability metadata for a named runtime
 * state, or `undefined` if the name is not one of the fifteen approved states.
 * Pure table lookup — invents nothing.
 */
export function stateMetadataOf(stateName: string): RuntimeStateMetadataEntry | undefined {
  return RUNTIME_STATE_METADATA[stateName];
}

/**
 * Returns only the visibility classification for a named runtime state.
 * Pure table lookup — invents nothing.
 */
export function stateVisibilityOf(stateName: string): RuntimeStateVisibility | undefined {
  return RUNTIME_STATE_METADATA[stateName]?.visibility;
}
