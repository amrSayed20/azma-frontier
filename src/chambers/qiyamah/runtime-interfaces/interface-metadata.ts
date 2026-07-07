/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME INTERFACES — Interface Metadata
 * Construction Package: Living Runtime — Stage 6 of 13
 *
 * Defines, for each of the six actor contracts exposed by facade.ts plus the
 * cross-cutting lifecycle/signal query surface, the eleven elements this stage's
 * directive requires: ownership, public contracts, internal contracts,
 * responsibilities, permissions, visibility, invariants, guards, lifecycle,
 * dependency boundaries, and traceability.
 *
 * This file is metadata only — const object literals describing the contracts
 * declared in facade.ts / runtime/contracts.ts. It defines no execution, no
 * business logic, no AI, no presentation.
 */

import type { RuntimeLifecycleStage } from '../runtime/lifecycle';

// ═══════════════════════════════════════════════════════════════════════════
// LIFECYCLE WINDOWS
// The stages during which each contract's methods may meaningfully be called.
// Derived from RUNTIME_LIFECYCLE_TRACEABILITY (runtime/lifecycle.ts) and the
// participant-state rules in behavior.ts / specification.ts.
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_INTERFACE_LIFECYCLE_WINDOWS: Readonly<Record<string, readonly RuntimeLifecycleStage[]>> = {
  CitizenContract:           ['Beginning', 'Listening', 'Clarifying'],
  CompanionContract:         ['Beginning', 'Listening', 'Understanding', 'Clarifying', 'Preparing', 'Creating', 'Directing', 'Rendering', 'Reflecting', 'Completing', 'Leaving'],
  GhostGuideContract:        ['Listening', 'Understanding', 'Clarifying', 'Preparing', 'Creating', 'Directing'],
  InvisibleDirectorContract: ['Beginning', 'Listening', 'Understanding', 'Clarifying', 'Preparing', 'Creating', 'Directing', 'Reflecting', 'Completing', 'Leaving'],
  CreativeRuntimeContract:   ['Beginning', 'Listening', 'Understanding', 'Clarifying', 'Preparing', 'Creating', 'Directing', 'Rendering', 'Reflecting', 'Completing', 'Leaving'],
  FutureAIEngineContract:    ['Creating', 'Directing'],
};

// ═══════════════════════════════════════════════════════════════════════════
// PER-CONTRACT INTERFACE METADATA
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_INTERFACE_CITIZEN = {
  name: 'CitizenContractInterface',
  ownership: { definedIn: 'runtime/contracts.ts (Foundation)', exposedVia: 'runtime-interfaces/facade.ts' },
  public_contracts: ['express(form: CitizenExpression payload): void'],
  internal_contracts: ['None — the Citizen is external to the Chamber and has no Foundation-internal counterpart to withhold.'],
  responsibilities: 'Carries the Citizen\'s expression into the runtime as a typed CitizenExpression signal — nothing else.',
  permissions: { mayBeCalledBy: ['Citizen (external)'], mayBeConsumedBy: ['Presentation Runtime', 'Application Runtime'] },
  visibility: 'CITIZEN_ORIGINATED (RUNTIME_SIGNAL_VISIBILITY.CitizenExpression, runtime/signals.ts)',
  invariants: ['What is expressed is received in whatever form it arrives — no runtime layer may reject or reshape it before it reaches ImaginationClarifier.'],
  guards: ['isPermittedEmitter(\'CitizenExpression\', \'Citizen\') — enforced at the signal boundary, not by this contract itself.'],
  lifecycle: RUNTIME_INTERFACE_LIFECYCLE_WINDOWS.CitizenContract,
  dependency_boundaries: { dependsOn: ['RuntimeSignal (facade.ts)'], mayNotDependOn: ['any INTERNAL export (boundary.ts)'] },
  traceability: { facade: 'facade.ts', foundation: 'runtime/contracts.ts:CitizenContract', event: 'EVENT_CITIZEN_EXPRESSION (events.ts)', entity: 'ENTITY_IMAGINATION_CLARIFIER (specification.ts)' },
} as const;

export const RUNTIME_INTERFACE_COMPANION = {
  name: 'CompanionContractInterface',
  ownership: { definedIn: 'runtime/contracts.ts (Foundation)', exposedVia: 'runtime-interfaces/facade.ts' },
  public_contracts: ['currentMode(): CompanionState', 'mayOffer(context: TimingContext): boolean'],
  internal_contracts: ['The Chamber relationship-mode transition rules themselves remain owned by ParticipantOrchestrator (specification.ts) — this contract only surfaces the current mode and whether offering is currently permitted.'],
  responsibilities: 'Exposes the Chamber\'s currently felt companionship mode and whether it may currently offer a direction, challenge, or alternative.',
  permissions: { mayBeCalledBy: ['Presentation Runtime', 'Application Runtime'], mayBeConsumedBy: ['UI Runtime (read-only, felt-quality rendering)'] },
  visibility: 'INTERNAL_ONLY (RUNTIME_STATE_METADATA.CompanionState, runtime/states.ts, reachable via stateVisibilityOf) — the mode label itself is never shown; only its expressed effect is felt.',
  invariants: ['mayOffer() always returns false once a Citizen decision is registered unless the mode is already follows.'],
  guards: ['mayCompanionSpeak(context: TimingContext): boolean (runtime/contracts.ts, re-exported by facade.ts)'],
  lifecycle: RUNTIME_INTERFACE_LIFECYCLE_WINDOWS.CompanionContract,
  dependency_boundaries: { dependsOn: ['CompanionState (facade.ts)', 'TimingContext (facade.ts)'], mayNotDependOn: ['ParticipantOrchestrator\'s internal mode-transition table (not exposed anywhere)'] },
  traceability: { facade: 'facade.ts', foundation: 'runtime/contracts.ts:CompanionContract', entity: 'ENTITY_PARTICIPANT_ORCHESTRATOR (specification.ts)' },
} as const;

export const RUNTIME_INTERFACE_GHOST_GUIDE = {
  name: 'GhostGuideContractInterface',
  ownership: { definedIn: 'runtime/contracts.ts (Foundation)', exposedVia: 'runtime-interfaces/facade.ts' },
  public_contracts: ['currentMode(): GhostGuideState', 'mayIntervene(context: TimingContext): boolean'],
  internal_contracts: ['The content of what the Ghost Guide would say is never part of this contract — only whether intervention is currently permitted.'],
  responsibilities: 'Answers exactly one question for any calling runtime layer: may the Ghost Guide speak right now?',
  permissions: { mayBeCalledBy: ['Application Runtime'], mayBeConsumedBy: ['AI Runtime (to decide whether to generate guidance)'] },
  visibility: 'INTERNAL_ONLY (RUNTIME_STATE_METADATA.GhostGuideState, runtime/states.ts) — the mode is read internally to compute the answer; the Citizen only ever feels the resulting intervention, never the mode itself.',
  invariants: ['mayIntervene() is false whenever hasSpokenOnCurrentDirection is true, and false whenever a Citizen decision is registered — both unconditionally.'],
  guards: ['mayGhostGuideIntervene(context: TimingContext): boolean (runtime/contracts.ts, re-exported by facade.ts)'],
  lifecycle: RUNTIME_INTERFACE_LIFECYCLE_WINDOWS.GhostGuideContract,
  dependency_boundaries: { dependsOn: ['GhostGuideState (facade.ts)', 'TimingContext (facade.ts)'], mayNotDependOn: ['DecisionState mutation — this contract only reads, never registers, a Citizen decision'] },
  traceability: { facade: 'facade.ts', foundation: 'runtime/contracts.ts:GhostGuideContract', entity: 'CharacterAuthority.owns (Ghost Guide personality) (specification.ts)' },
} as const;

export const RUNTIME_INTERFACE_INVISIBLE_DIRECTOR = {
  name: 'InvisibleDirectorContractInterface',
  ownership: { definedIn: 'runtime/contracts.ts (Foundation)', exposedVia: 'runtime-interfaces/facade.ts' },
  public_contracts: ['currentMode(): DirectorState', 'mayChangeRhythm(context: TimingContext): boolean'],
  internal_contracts: ['The specific rhythm change itself is never part of this contract — only whether a change is currently permitted.'],
  responsibilities: 'Answers whether the Invisible Director may currently change rhythm, and reports withdrawal absolutely during Rendering.',
  permissions: { mayBeCalledBy: ['Application Runtime', 'Engine Runtime'], mayBeConsumedBy: ['Workflow Runtime (pacing decisions)'] },
  visibility: 'INTERNAL_ONLY (RUNTIME_STATE_METADATA.DirectorState, runtime/states.ts)',
  invariants: ['mayChangeRhythm() is unconditionally false whenever the lifecycle stage is Rendering, regardless of mode.'],
  guards: ['mayInvisibleDirectorChangeRhythm(context: TimingContext): boolean (runtime/contracts.ts, re-exported by facade.ts)'],
  lifecycle: RUNTIME_INTERFACE_LIFECYCLE_WINDOWS.InvisibleDirectorContract,
  dependency_boundaries: { dependsOn: ['DirectorState (facade.ts)', 'RuntimeLifecycleStage (facade.ts)'], mayNotDependOn: ['any Rendering-stage override — none exists'] },
  traceability: { facade: 'facade.ts', foundation: 'runtime/contracts.ts:InvisibleDirectorContract', entity: 'CharacterAuthority.owns (Invisible Director mandate) (specification.ts)' },
} as const;

export const RUNTIME_INTERFACE_CREATIVE_RUNTIME = {
  name: 'CreativeRuntimeContractInterface',
  ownership: { definedIn: 'runtime/contracts.ts (Foundation)', exposedVia: 'runtime-interfaces/facade.ts' },
  public_contracts: ['currentStage(): RuntimeLifecycleStage', 'isSilent(context: TimingContext): boolean'],
  internal_contracts: ['The lifecycle transition tables themselves are never part of this contract — only the current stage and the silence question.'],
  responsibilities: 'The composing surface every other contract\'s lifecycle window is checked against; the sole holder of "what stage is this, and is the Chamber silent right now."',
  permissions: { mayBeCalledBy: ['Application Runtime', 'Presentation Runtime', 'Engine Runtime', 'Workflow Runtime', 'Execution Runtime'], mayBeConsumedBy: ['all future runtime layers'] },
  visibility: 'NOT_APPLICABLE for currentStage() (structural); FELT_EFFECT_ONLY for the silence it reports (RUNTIME_SIGNAL_VISIBILITY, runtime/signals.ts)',
  invariants: ['isSilent() is true only while the lifecycle stage is Rendering and presentation is actively \'presenting\'.'],
  guards: ['isChamberSilent(context: TimingContext): boolean (runtime/contracts.ts, re-exported by facade.ts)', 'isPermittedLifecycleTransition, isTerminalStage, resolveLifecycleEvent (runtime/lifecycle.ts, re-exported by facade.ts)'],
  lifecycle: RUNTIME_INTERFACE_LIFECYCLE_WINDOWS.CreativeRuntimeContract,
  dependency_boundaries: { dependsOn: ['RuntimeLifecycleStage (facade.ts)', 'TimingContext (facade.ts)'], mayNotDependOn: ['RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS or any other INTERNAL table (boundary.ts)'] },
  traceability: { facade: 'facade.ts', foundation: 'runtime/contracts.ts:CreativeRuntimeContract', entity: 'ENTITY_QIYAMAH_CHAMBER (specification.ts)' },
} as const;

export const RUNTIME_INTERFACE_FUTURE_AI_ENGINE = {
  name: 'FutureAIEngineContractInterface',
  ownership: { definedIn: 'runtime/contracts.ts (Foundation)', exposedVia: 'runtime-interfaces/facade.ts' },
  public_contracts: ['pursue(idea: IdeaState): Promise<{ allMarkersPass: boolean }>'],
  internal_contracts: ['No model, prompt, token, or provider detail is part of this contract, nor may any future implementation add one to this signature — that is Layer V\'s PursuitEngine domain, not the AI Engine\'s.'],
  responsibilities: 'The one seam through which a future AI engine may be admitted into Layer V\'s pursuit, without this Foundation implementing or assuming any particular engine.',
  permissions: { mayBeCalledBy: ['Engine Runtime', 'AI Runtime'], mayBeConsumedBy: ['Application Runtime (awaiting the result)'] },
  visibility: 'INTERNAL_ONLY (the pursuit itself is never Citizen-visible; only its eventual felt effect, via CreativeActStateSignal, is)',
  invariants: ['The only value ever returned is allMarkersPass — never partial marker detail, never the candidate creation itself.'],
  guards: ['None directly on this contract — validation_3_pre_presentation_markers (validation.ts) governs how PursuitEngine interprets the returned boolean; this contract only carries it.'],
  lifecycle: RUNTIME_INTERFACE_LIFECYCLE_WINDOWS.FutureAIEngineContract,
  dependency_boundaries: { dependsOn: ['IdeaState (facade.ts)'], mayNotDependOn: ['any networking, model, or provider type — none is defined anywhere in this Foundation or its Interfaces'] },
  traceability: { facade: 'facade.ts', foundation: 'runtime/contracts.ts:FutureAIEngineContract', entity: 'ENTITY_PURSUIT_ENGINE (specification.ts)', validation: 'VALIDATION_3_PRE_PRESENTATION_MARKERS (validation.ts)' },
} as const;

export const RUNTIME_INTERFACE_LIFECYCLE_AND_SIGNAL_QUERY_SURFACE = {
  name: 'LifecycleAndSignalQuerySurfaceInterface',
  ownership: { definedIn: 'runtime/lifecycle.ts + runtime/signals.ts (Foundation)', exposedVia: 'runtime-interfaces/facade.ts' },
  public_contracts: [
    'isForwardTransition, isRenewalTransition, isSelfLoop, isPermittedLifecycleTransition, isTerminalStage, resolveLifecycleEvent',
    'isPermittedEmitter, visibilityOf, isCitizenVisibleEffect',
    'stateMetadataOf, stateVisibilityOf (facade.ts accessors)',
  ],
  internal_contracts: ['RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS, RUNTIME_LIFECYCLE_RENEWAL_TRANSITIONS, RUNTIME_LIFECYCLE_SELF_LOOPS, RUNTIME_SIGNAL_EMITTERS, RUNTIME_SIGNAL_VISIBILITY, RUNTIME_STATE_METADATA — all raw tables, reachable only through the guard functions and accessors listed above.'],
  responsibilities: 'The cross-cutting query surface every one of the six actor contracts relies on to answer "is this transition/emission/state currently permitted?" without any contract needing its own copy of the answer.',
  permissions: { mayBeCalledBy: ['all seven consumer categories (RUNTIME_INTERFACE_CONSUMERS, boundary.ts)'], mayBeConsumedBy: ['all seven consumer categories'] },
  visibility: 'Mixed — see individual guard traceability in boundary.ts.',
  invariants: ['Every answer returned is a pure function of the current state and the already-approved tables — never of caller identity, never of elapsed time.'],
  guards: ['This entry is itself the guard surface — see facade.ts for the complete function list.'],
  lifecycle: ['Beginning', 'Listening', 'Understanding', 'Clarifying', 'Preparing', 'Creating', 'Directing', 'Rendering', 'Reflecting', 'Completing', 'Leaving'] as const,
  dependency_boundaries: { dependsOn: ['nothing above the Foundation'], mayNotDependOn: ['architecture.ts or any layer above the Living Runtime Foundation (Article VI, Stage 5)'] },
  traceability: { facade: 'facade.ts', foundation: 'runtime/lifecycle.ts, runtime/signals.ts, runtime/states.ts' },
} as const;
