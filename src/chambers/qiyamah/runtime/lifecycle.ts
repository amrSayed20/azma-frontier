/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME FOUNDATION — Runtime Lifecycle
 * Construction Package: Living Runtime — Stage 5 of 13
 *
 * Derives the eleven-stage runtime lifecycle from the approved architectural chain:
 * Constitution → architecture.ts → specification.ts → interfaces.ts → behavior.ts →
 * state.ts → events.ts → validation.ts → integration.ts → readiness.ts →
 * certification.ts.
 *
 * The Runtime possesses no authority of its own (Runtime Constitutional Law, Article
 * IV). Every transition table below is data copied forward from an already-approved
 * state transition — never a newly invented rule. Every guard function below is a
 * pure, table-driven lookup — it executes an already-authorized rule; it does not
 * decide, interpret, or evaluate one.
 */

// ═══════════════════════════════════════════════════════════════════════════
// THE ELEVEN RUNTIME LIFECYCLE STAGES
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_LIFECYCLE_STAGES = [
  'Beginning',
  'Listening',
  'Understanding',
  'Clarifying',
  'Preparing',
  'Creating',
  'Directing',
  'Rendering',
  'Reflecting',
  'Completing',
  'Leaving',
] as const;

export type RuntimeLifecycleStage = (typeof RUNTIME_LIFECYCLE_STAGES)[number];

// ═══════════════════════════════════════════════════════════════════════════
// FORWARD TRANSITIONS
// Strictly one stage at a time. `null` marks the terminal stage.
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS: Readonly<Record<RuntimeLifecycleStage, RuntimeLifecycleStage | null>> = {
  Beginning:     'Listening',
  Listening:     'Understanding',
  Understanding: 'Clarifying',
  Clarifying:    'Preparing',
  Preparing:     'Creating',
  Creating:      'Directing',
  Directing:     'Rendering',
  Rendering:     'Reflecting',
  Reflecting:    'Completing',
  Completing:    'Leaving',
  Leaving:       null,
};

// ═══════════════════════════════════════════════════════════════════════════
// RENEWAL TRANSITIONS
// The sole backward edge in the entire lifecycle, derived from
// STATE_PURSUIT_ENGINE.allowed_state_transitions ("evaluating → pursuing (renewal)")
// (state.ts) — a marker-evaluation failure returns Directing to Creating.
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_LIFECYCLE_RENEWAL_TRANSITIONS: Readonly<Partial<Record<RuntimeLifecycleStage, RuntimeLifecycleStage>>> = {
  Directing: 'Creating',
};

// ═══════════════════════════════════════════════════════════════════════════
// SELF-LOOPS
// Derived from STATE_IMAGINATION_CLARIFIER.allowed_state_transitions
// ("clarifying (zero or more dialogue iterations)") (state.ts) — Clarifying may
// repeat on an incomplete expression before advancing.
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_LIFECYCLE_SELF_LOOPS: ReadonlySet<RuntimeLifecycleStage> = new Set(['Clarifying']);

// ═══════════════════════════════════════════════════════════════════════════
// TRANSITION OWNERSHIP
// Which architectural entity authorizes each stage's exit, per the Behavior
// and State Models.
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_LIFECYCLE_TRANSITION_OWNERSHIP: Readonly<Record<RuntimeLifecycleStage, string>> = {
  Beginning:     'NarrativeClock — Arrival→Spark on first CitizenExpression (BEHAVIOR_NARRATIVE_CLOCK, behavior.ts)',
  Listening:     'ImaginationClarifier — begins extraction on CitizenExpression receipt (STATE_IMAGINATION_CLARIFIER, state.ts)',
  Understanding: 'ImaginationClarifier — extraction underway (STATE_IMAGINATION_CLARIFIER, state.ts)',
  Clarifying:    'ImaginationClarifier — dialogue resolves or continues (BEHAVIOR_IMAGINATION_CLARIFIER, behavior.ts)',
  Preparing:     'StoryCoherence + NarrativeClock — Dialogue→Journey, narrative context composed (EVENT_NARRATIVE_CONTEXT_SIGNAL, events.ts)',
  Creating:      'PursuitEngine — pursuit begins, Journey→Transformation (STATE_PURSUIT_ENGINE, state.ts)',
  Directing:     'PursuitEngine — four-marker evaluation (VALIDATION_3_PRE_PRESENTATION_MARKERS, validation.ts)',
  Rendering:     'RevealCoordinator — presentation, Transformation→Revelation on MarkerConfirmationSignal (STATE_REVEAL_COORDINATOR, state.ts)',
  Reflecting:    'CrossingTracker — Inward Crossing, Revelation→Aftermath on AfterCompletionSignal (STATE_CROSSING_TRACKER, state.ts)',
  Completing:    'TrustRegister + CreativeProfile + PartnershipChronology — RelationalCrossingUpdate absorption (EVENT_RELATIONAL_CROSSING_UPDATE, events.ts)',
  Leaving:       'NarrativeClock — session terminal, no further transition (STATE_NARRATIVE_CLOCK, state.ts)',
};

// ═══════════════════════════════════════════════════════════════════════════
// TRACEABILITY
// Maps every runtime stage back to its constitutional narrative beat and its
// primary architectural entities.
// ═══════════════════════════════════════════════════════════════════════════

export interface RuntimeLifecycleTraceEntry {
  readonly narrativeBeat: string;
  readonly primaryEntities: readonly string[];
  readonly source: string;
}

export const RUNTIME_LIFECYCLE_TRACEABILITY: Readonly<Record<RuntimeLifecycleStage, RuntimeLifecycleTraceEntry>> = {
  Beginning: {
    narrativeBeat: 'Arrival',
    primaryEntities: ['NarrativeClock', 'PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor', 'ParticipantOrchestrator'],
    source: 'STATE_NARRATIVE_CLOCK.state_lifecycle.initialization (state.ts)',
  },
  Listening: {
    narrativeBeat: 'Arrival→Spark',
    primaryEntities: ['ImaginationClarifier', 'NarrativeClock'],
    source: 'EVENT_CITIZEN_EXPRESSION (events.ts)',
  },
  Understanding: {
    narrativeBeat: 'Spark→Dialogue',
    primaryEntities: ['ImaginationClarifier'],
    source: 'STATE_IMAGINATION_CLARIFIER.allowed_state_transitions (state.ts)',
  },
  Clarifying: {
    narrativeBeat: 'Dialogue',
    primaryEntities: ['ImaginationClarifier'],
    source: 'VALIDATION_1_IMAGINATION_RECEPTION (validation.ts)',
  },
  Preparing: {
    narrativeBeat: 'Dialogue→Journey',
    primaryEntities: ['ImaginationClarifier', 'StoryCoherence', 'PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor'],
    source: 'EVENT_NARRATIVE_CONTEXT_SIGNAL, EVENT_ENVIRONMENTAL_QUALITY_SIGNAL (events.ts)',
  },
  Creating: {
    narrativeBeat: 'Journey→Transformation',
    primaryEntities: ['PursuitEngine'],
    source: 'STATE_PURSUIT_ENGINE.allowed_state_transitions (state.ts)',
  },
  Directing: {
    narrativeBeat: 'Transformation',
    primaryEntities: ['PursuitEngine', 'ParticipantOrchestrator'],
    source: 'VALIDATION_3_PRE_PRESENTATION_MARKERS (validation.ts)',
  },
  Rendering: {
    narrativeBeat: 'Revelation',
    primaryEntities: ['RevealCoordinator'],
    source: 'VALIDATION_4_REVELATION_PRESENTATION (validation.ts)',
  },
  Reflecting: {
    narrativeBeat: 'Revelation→Aftermath',
    primaryEntities: ['CrossingTracker'],
    source: 'STATE_CROSSING_TRACKER.allowed_state_transitions (state.ts)',
  },
  Completing: {
    narrativeBeat: 'Aftermath',
    primaryEntities: ['TrustRegister', 'CreativeProfile', 'PartnershipChronology'],
    source: 'VALIDATION_5_MEMORY_UPDATE (validation.ts)',
  },
  Leaving: {
    narrativeBeat: 'Aftermath→Return',
    primaryEntities: ['NarrativeClock', 'StoryCoherence'],
    source: 'STATE_NARRATIVE_CLOCK.state_lifecycle.terminal (state.ts)',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// LIFECYCLE EVENTS
// Distinct from Runtime Signals (signals.ts) — these mark entry into or
// renewal of a lifecycle stage. Structural only; no payload beyond the stage.
// ═══════════════════════════════════════════════════════════════════════════

export type RuntimeLifecycleEvent =
  | { readonly kind: 'StageEntered'; readonly stage: RuntimeLifecycleStage }
  | { readonly kind: 'StageRenewed'; readonly from: RuntimeLifecycleStage; readonly to: RuntimeLifecycleStage }
  | { readonly kind: 'StageRepeated'; readonly stage: RuntimeLifecycleStage };

// ═══════════════════════════════════════════════════════════════════════════
// GUARDS
// Pure, table-driven checks. Each executes an already-approved rule; none
// invents or evaluates a new one (Runtime Constitutional Law, Article IV).
// ═══════════════════════════════════════════════════════════════════════════

export function isForwardTransition(from: RuntimeLifecycleStage, to: RuntimeLifecycleStage): boolean {
  return RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS[from] === to;
}

export function isRenewalTransition(from: RuntimeLifecycleStage, to: RuntimeLifecycleStage): boolean {
  return RUNTIME_LIFECYCLE_RENEWAL_TRANSITIONS[from] === to;
}

export function isSelfLoop(from: RuntimeLifecycleStage, to: RuntimeLifecycleStage): boolean {
  return from === to && RUNTIME_LIFECYCLE_SELF_LOOPS.has(from);
}

export function isPermittedLifecycleTransition(from: RuntimeLifecycleStage, to: RuntimeLifecycleStage): boolean {
  return isForwardTransition(from, to) || isRenewalTransition(from, to) || isSelfLoop(from, to);
}

export function isTerminalStage(stage: RuntimeLifecycleStage): boolean {
  return RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS[stage] === null;
}

/**
 * Resolves the runtime lifecycle event produced by moving from `from` to `to`.
 * Returns `null` if the transition is not constitutionally permitted — the
 * runtime never fabricates an event for a transition it has no authority to
 * recognize.
 */
export function resolveLifecycleEvent(from: RuntimeLifecycleStage, to: RuntimeLifecycleStage): RuntimeLifecycleEvent | null {
  if (isSelfLoop(from, to)) {
    return { kind: 'StageRepeated', stage: from };
  }
  if (isRenewalTransition(from, to)) {
    return { kind: 'StageRenewed', from, to };
  }
  if (isForwardTransition(from, to)) {
    return { kind: 'StageEntered', stage: to };
  }
  return null;
}
