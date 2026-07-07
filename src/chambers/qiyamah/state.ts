/**
 * AZMA OS — Qiyamah Chamber
 * ARCHITECTURAL STATE MODEL — Stage 8 of 13
 *
 * This document derives the complete Architectural State Model from the approved
 * Architectural Behavior Model (behavior.ts) and, through it, from the Architectural
 * Interfaces (interfaces.ts), the Architectural Specification (specification.ts), the
 * Constitutional Architecture (architecture.ts), and the Constitution (Soul → Transformation).
 *
 * Sources of authority, in order:
 *   The ten constitutional articles (Soul through Transformation)
 *   → The Constitutional Architecture (architecture.ts)
 *   → The Architectural Specification (specification.ts)
 *   → The Architectural Interfaces (interfaces.ts)
 *   → The Architectural Behavior Model (behavior.ts)
 *   → This State Model
 *   → Future Implementations
 *
 * This document introduces zero constitutional authority.
 * It introduces zero new entities, signals, interfaces, or behaviors.
 * It introduces zero implementation.
 *
 * A state definition here is: who owns a piece of state, what class of persistence it
 * belongs to, when in its lifecycle it exists, which transitions are permitted or
 * forbidden, who may observe it, what must stay synchronized with what, how it
 * restores across a boundary (session, act, or never), and the invariants that hold
 * at all times. It is not: a store, a reducer, a schema, a storage technology, or any
 * mechanism of how state is held.
 *
 * Every one of the seventeen named entities plus the root composing entity receives
 * exactly one Architectural State definition here.
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTION I — STATE CLASSIFICATION TAXONOMY
// The six persistence classes every entity's state is classified under.
// No entity may be classified outside this taxonomy; no entity may hold a
// classification inconsistent with its Behavior Model lifecycle.
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_CLASSIFICATION_TAXONOMY = {
  CONSTITUTIONAL_CONSTANT: {
    description: 'Holds zero runtime state. Returns the same content on every consultation, forever.',
    members: ['PurposeAuthority', 'CharacterAuthority'],
    traceability: 'LAYER_I_CONSTITUTIONAL_IDENTITY.scope (architecture.ts)',
  },
  STATELESS_CHECK: {
    description: 'Holds no state across invocations. Each call is behaviorally independent of every other call.',
    members: ['GuardianProtocol'],
    traceability: 'CONSTITUTIONAL_BOUNDARIES (architecture.ts)',
  },
  CROSS_SESSION_ACCUMULATED: {
    description: 'Persists across the entire partnership lifetime. Never resets. Changes only through post-transformation absorption or constitutional decay.',
    members: ['TrustRegister', 'CreativeProfile', 'PartnershipChronology'],
    traceability: 'LAYER_II_LIVING_PARTNERSHIP.scope.temporal (architecture.ts)',
  },
  SESSION_SCOPED: {
    description: 'Persists for the duration of one session. Initializes at session start (informed by cross-session depth), resets at session end.',
    members: ['NarrativeClock', 'ParticipantOrchestrator', 'StoryCoherence', 'PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor'],
    traceability: 'LAYER_III_SESSION_NARRATIVE.scope.temporal, LAYER_IV_SESSION_EXPERIENCE.scope.temporal (architecture.ts)',
  },
  ACT_SCOPED: {
    description: 'Persists for the duration of one creative act. Initializes on imagination receipt, resets between acts within a session.',
    members: ['ImaginationClarifier', 'PursuitEngine', 'CrossingTracker', 'RevealCoordinator'],
    traceability: 'LAYER_V_TRANSFORMATION.scope.temporal (architecture.ts)',
  },
  COMPOSED: {
    description: 'Holds no independent state of its own. Its state is entirely the simultaneous composition of all other classes.',
    members: ['QiyamahChamber'],
    traceability: 'COMPOSITION_RULES (architecture.ts)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION II — SYSTEMIC STATE VISIBILITY MODEL
// The three visibility classes any piece of architectural state may carry.
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_VISIBILITY_MODEL = {
  INTERNAL_ONLY: {
    description: 'Never crosses to the Citizen in any form — not as a value, a summary, a history, or a demonstration. May be read by other entities per their allowed dependency paths only.',
    applies_to: ['TrustRegister', 'CreativeProfile', 'PartnershipChronology', 'NarrativeClock (beat-transition history)', 'ParticipantOrchestrator (raw participant enums)', 'PursuitEngine (attempt count, marker evaluation detail)', 'CrossingTracker (crossing bookkeeping)'],
    boundary: 'the_memory_display_boundary, the_mechanism_boundary (CONSTITUTIONAL_BOUNDARIES, architecture.ts)',
  },
  FELT_ONLY: {
    description: 'Its effect reaches the Citizen; the state value itself never does. The Citizen experiences the quality, never the enum, the mechanism, or the rule that produced it.',
    applies_to: ['PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor', 'NarrativeClock (current beat, as narrative experience rather than a labeled stage)', 'RevealCoordinator (recession state)'],
    boundary: 'the_mechanism_boundary, the_clock_time_boundary (CONSTITUTIONAL_BOUNDARIES, architecture.ts)',
  },
  NOT_APPLICABLE: {
    description: 'No state exists to classify for visibility.',
    applies_to: ['PurposeAuthority', 'CharacterAuthority', 'GuardianProtocol', 'QiyamahChamber'],
    boundary: 'N/A',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION III — SYSTEMIC STATE SYNCHRONIZATION MODEL
// Where state held by more than one entity must remain consistent, and the rule
// that governs that consistency.
// ═══════════════════════════════════════════════════════════════════════════

export const SYSTEMIC_STATE_SYNCHRONIZATION = {
  layer_II_parallel_absorption: {
    entities: ['TrustRegister', 'CreativeProfile', 'PartnershipChronology'],
    rule: 'All three receive the same RelationalCrossingUpdate and absorb it independently and in parallel. None blocks another. Eventual mutual consistency is guaranteed only in the sense that all three reflect the same underlying completed transformation — never in the sense of a shared internal representation.',
    traceability: 'accumulation_flow (architecture.ts), BEHAVIOR_TRUST_REGISTER / BEHAVIOR_CREATIVE_PROFILE / BEHAVIOR_PARTNERSHIP_CHRONOLOGY (behavior.ts)',
  },
  layer_IV_co_governance: {
    entities: ['PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor'],
    rule: 'The three states are co-governing, not hierarchical. When two states would constrain the same moment in conflicting ways, PresenceMonitor\'s state resolves first, then TemporalMonitor\'s, with SpatialMonitor\'s state yielding last — per the constitutional hierarchy tiebreaker.',
    traceability: 'LAYER_INTERACTION_RULES.rule_6_experience_co_governance (architecture.ts)',
  },
  pursuit_triple_emission_atomicity: {
    entities: ['PursuitEngine'],
    rule: 'MarkerConfirmationSignal, PresentationAuthorization, and GenuineConfirmation must transition into existence together as a single atomic state change. No consumer (NarrativeClock, RevealCoordinator, CrossingTracker) may observe one without the other two having also transitioned.',
    traceability: 'BEHAVIOR_PURSUIT_ENGINE.signal_propagation_behavior (behavior.ts)',
  },
  crossing_sequence_dependency: {
    entities: ['CrossingTracker'],
    rule: 'Inward-registered state may not exist without Outward-registered already existing. Relational-registered state may not exist without both. This is a strict internal ordering dependency, not a synchronization between separate entities.',
    traceability: 'BEHAVIOR_CROSSING_TRACKER.allowed_state_transitions (behavior.ts)',
  },
  beat_and_experience_synchronization: {
    entities: ['NarrativeClock', 'PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor', 'RevealCoordinator'],
    rule: 'The instant NarrativeClock\'s beat state transitions, all four subscribers must recalibrate to the new beat before any of them may emit EnvironmentalQualitySignal or accept the next CreativeActStateSignal. No subscriber may act on a stale beat.',
    traceability: 'BEHAVIOR_NARRATIVE_CLOCK.signal_propagation_behavior (behavior.ts)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION IV — SYSTEMIC RESTORATION AND CONTINUITY MODEL
// How state restores (or deliberately does not) across the three architectural
// lifecycle scales.
// ═══════════════════════════════════════════════════════════════════════════

export const SYSTEMIC_RESTORATION_MODEL = {
  across_partnership_lifetime: {
    scope: ['PurposeAuthority', 'CharacterAuthority', 'TrustRegister', 'CreativeProfile', 'PartnershipChronology'],
    rule: 'Never restored because never lost. Layer I has no state to restore. Layer II state persists continuously and is simply the current state at the next session\'s start — there is no restoration event, only continuity.',
    traceability: 'ARCHITECTURAL_LIFECYCLE.scale_I_partnership_lifetime (architecture.ts)',
  },
  across_session_boundary: {
    scope: ['NarrativeClock', 'ParticipantOrchestrator', 'StoryCoherence', 'PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor'],
    rule: 'Deliberately not restored. Each session\'s Layer III/IV state initializes fresh at Arrival, calibrated by the current Layer II depth (PartnershipDepthSignal). The prior session\'s specific state is never replayed — continuity is expressed through calibration depth, never through restored values.',
    traceability: 'ARCHITECTURAL_LIFECYCLE.scale_II_session_lifecycle (architecture.ts), SEPARATION_OF_RESPONSIBILITIES.session_vs_lifetime (architecture.ts)',
  },
  across_act_boundary: {
    scope: ['ImaginationClarifier', 'PursuitEngine', 'CrossingTracker', 'RevealCoordinator'],
    rule: 'Deliberately not restored. Each act initializes fresh on imagination receipt. A prior act\'s pursuit attempts, marker evaluations, or crossing registrations never carry forward to the next act, even within the same session.',
    traceability: 'ARCHITECTURAL_LIFECYCLE.scale_III_act_lifecycle (architecture.ts)',
  },
  mid_scale_interruption: {
    rule: 'If a session or act is interrupted before reaching its required terminal state (Aftermath for a session; Relational Crossing for an act), no partial state is promoted to the next scale. Layer II absorbs only a fully completed RelationalCrossingUpdate — an interrupted act contributes nothing to cross-session state.',
    traceability: 'LAYER_III_SESSION_NARRATIVE.may_not (architecture.ts), BEHAVIOR_CROSSING_TRACKER.error_boundary_behavior (behavior.ts)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION V — LAYER I STATE: CONSTITUTIONAL IDENTITY
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_PURPOSE_AUTHORITY = {
  name: 'PurposeAuthorityState',
  owner_entity: 'PurposeAuthority',
  layer: 'I — Constitutional Identity',

  state_ownership: { holds: [], does_not_hold: ['Any runtime value. This entity is definition, not state.'] },
  state_classification: 'CONSTITUTIONAL_CONSTANT',

  state_lifecycle: {
    initialization: 'Exists prior to any session or Citizen arrival — no initialization event.',
    active: 'Permanently active.',
    terminal: 'None. There is no terminal state.',
  },

  allowed_state_transitions: ['None.'],
  forbidden_state_transitions: ['Any transition whatsoever.'],

  state_visibility: 'NOT_APPLICABLE',

  synchronization_relationships: ['None. No other entity\'s state must remain consistent with this one because this one never changes.'],

  restoration_and_continuity_rules: 'Not applicable — nothing is ever lost, so nothing is ever restored.',

  state_invariants: ['Identical across every consultation, every session, every Citizen, forever.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_PURPOSE_AUTHORITY (behavior.ts)',
    architectural_interfaces: 'INTERFACE_PURPOSE_AUTHORITY (interfaces.ts)',
    architectural_specification: 'ENTITY_PURPOSE_AUTHORITY (specification.ts)',
    constitutional_architecture: 'LAYER_I_CONSTITUTIONAL_IDENTITY (architecture.ts)',
    constitution: ['Soul.purpose', 'Soul.promise', 'Soul.success'],
  },
} as const;

export const STATE_CHARACTER_AUTHORITY = {
  name: 'CharacterAuthorityState',
  owner_entity: 'CharacterAuthority',
  layer: 'I — Constitutional Identity',

  state_ownership: { holds: [], does_not_hold: ['Any runtime value. This entity is definition, not state.'] },
  state_classification: 'CONSTITUTIONAL_CONSTANT',

  state_lifecycle: {
    initialization: 'Exists prior to any session — no initialization event.',
    active: 'Permanently active.',
    terminal: 'None.',
  },

  allowed_state_transitions: ['None.'],
  forbidden_state_transitions: ['Any transition whatsoever, including softening a temperament trait under difficulty.'],

  state_visibility: 'NOT_APPLICABLE',

  synchronization_relationships: ['None.'],

  restoration_and_continuity_rules: 'Not applicable.',

  state_invariants: ['Identical across every consultation, every session, every Citizen, forever.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_CHARACTER_AUTHORITY (behavior.ts)',
    architectural_interfaces: 'INTERFACE_CHARACTER_AUTHORITY (interfaces.ts)',
    architectural_specification: 'ENTITY_CHARACTER_AUTHORITY (specification.ts)',
    constitutional_architecture: 'LAYER_I_CONSTITUTIONAL_IDENTITY (architecture.ts)',
    constitution: ['Personality.temperament', 'Personality.creativeConscience'],
  },
} as const;

export const STATE_GUARDIAN_PROTOCOL = {
  name: 'GuardianProtocolState',
  owner_entity: 'GuardianProtocol',
  layer: 'I — Constitutional Identity',

  state_ownership: { holds: [], does_not_hold: ['Any result of a prior check. Each check is state-free with respect to any other check.'] },
  state_classification: 'STATELESS_CHECK',

  state_lifecycle: {
    initialization: 'Exists prior to any session.',
    active: 'Invoked per proposed output; produces a result and retains nothing.',
    terminal: 'None — there is no accumulating state to terminate.',
  },

  allowed_state_transitions: ['None. A check result is not a state — it is a return value, discarded by GuardianProtocol immediately after being communicated to the caller.'],
  forbidden_state_transitions: ['Any retention of check history that would let a later check behave more leniently or strictly because of an earlier one.'],

  state_visibility: 'NOT_APPLICABLE',

  synchronization_relationships: ['None — every entity calls this independently; no ordering is required between calls from different entities.'],

  restoration_and_continuity_rules: 'Not applicable — there is nothing to restore since nothing is retained between checks.',

  state_invariants: ['All eight boundaries are evaluated fresh on every single call.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_GUARDIAN_PROTOCOL (behavior.ts)',
    architectural_interfaces: 'INTERFACE_GUARDIAN_PROTOCOL (interfaces.ts)',
    architectural_specification: 'ENTITY_GUARDIAN_PROTOCOL (specification.ts)',
    constitutional_architecture: 'CONSTITUTIONAL_BOUNDARIES (architecture.ts)',
    constitution: ['Trust.protection', 'Time.forbidden', 'Memory.forbidden'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION VI — LAYER II STATE: LIVING PARTNERSHIP
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_TRUST_REGISTER = {
  name: 'TrustRegisterState',
  owner_entity: 'TrustRegister',
  layer: 'II — Living Partnership',

  state_ownership: {
    holds: ['Trust state (earned / strained / in-repair)', 'Trust repair progression state', 'Creative vulnerability depth (scalar)'],
    does_not_hold: ['The specific creative act that produced any trust change', 'Creative character understanding (CreativeProfile)', 'Partnership phase (PartnershipChronology)'],
  },
  state_classification: 'CROSS_SESSION_ACCUMULATED',

  state_lifecycle: {
    initialization: 'At first session: trust at zero, first-meeting protocol active.',
    active: 'Continuously active across all sessions.',
    terminal: 'None — never resets for the life of the partnership.',
  },

  allowed_state_transitions: [
    'earned → strained : on detected constitutional violation.',
    'strained → repair-through-behavior → rebuilding → restored : on sustained constitutional behavior.',
    'earned → earned (deepened) : on RelationalCrossingUpdate absorption.',
  ],
  forbidden_state_transitions: ['strained → restored directly.', 'Any transition driven by claim or elapsed time rather than behavioral evidence.'],

  state_visibility: 'INTERNAL_ONLY',

  synchronization_relationships: ['layer_II_parallel_absorption (Section III) — absorbs RelationalCrossingUpdate independently of CreativeProfile and PartnershipChronology.'],

  restoration_and_continuity_rules: 'across_partnership_lifetime (Section IV) — persists continuously; nothing to restore.',

  state_invariants: [
    'Always reflects actual behavioral history, never a claim.',
    'The trust-manipulation prohibitions apply in every state value.',
  ],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_TRUST_REGISTER (behavior.ts)',
    architectural_interfaces: 'INTERFACE_TRUST_REGISTER (interfaces.ts)',
    architectural_specification: 'ENTITY_TRUST_REGISTER (specification.ts)',
    constitutional_architecture: 'LAYER_II_LIVING_PARTNERSHIP (architecture.ts)',
    constitution: ['Trust.earning', 'Trust.repair', 'Trust.protection'],
  },
} as const;

export const STATE_CREATIVE_PROFILE = {
  name: 'CreativeProfileState',
  owner_entity: 'CreativeProfile',
  layer: 'II — Living Partnership',

  state_ownership: {
    holds: ['Creative character understanding (accumulated)', 'Creative vocabulary depth', 'Creative arc direction', 'Permitted / fading / forbidden classification of content'],
    does_not_hold: ['Trust state (TrustRegister)', 'Partnership phase (PartnershipChronology)', 'Specific expressions, prompts, or technical details (constitutionally prohibited)'],
  },
  state_classification: 'CROSS_SESSION_ACCUMULATED',

  state_lifecycle: {
    initialization: 'At first session: zero understanding, no vocabulary, no arc.',
    active: 'Continuously active across all sessions.',
    terminal: 'None — never resets; fading-category content decays but the entity itself does not terminate.',
  },

  allowed_state_transitions: [
    'zero-understanding → accumulating → deepened : on successive RelationalCrossingUpdate absorptions.',
    'permitted-content → faded : constitutional decay of fading-category content.',
  ],
  forbidden_state_transitions: ['Any promotion of forbidden-category content to permitted or fading.', 'Un-fading previously faded content.'],

  state_visibility: 'INTERNAL_ONLY',

  synchronization_relationships: ['layer_II_parallel_absorption (Section III).'],

  restoration_and_continuity_rules: 'across_partnership_lifetime (Section IV) — persists continuously; decay is a constitutionally mandated one-way attenuation, not a restoration event.',

  state_invariants: [
    'The surveillance test passes before any content enters the accumulating state.',
    'Forbidden-category content never exists in this state.',
  ],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_CREATIVE_PROFILE (behavior.ts)',
    architectural_interfaces: 'INTERFACE_CREATIVE_PROFILE (interfaces.ts)',
    architectural_specification: 'ENTITY_CREATIVE_PROFILE (specification.ts)',
    constitutional_architecture: 'LAYER_II_LIVING_PARTNERSHIP (architecture.ts)',
    constitution: ['Memory.permitted', 'Memory.fading', 'Memory.forbidden'],
  },
} as const;

export const STATE_PARTNERSHIP_CHRONOLOGY = {
  name: 'PartnershipChronologyState',
  owner_entity: 'PartnershipChronology',
  layer: 'II — Living Partnership',

  state_ownership: {
    holds: ['Partnership phase (initial / growing / deep / ultimate)', 'Completed-transformation count (evaluation input only)', 'After-failure protocol state'],
    does_not_hold: ['Trust state (TrustRegister)', 'Creative character understanding (CreativeProfile)', 'Session-specific story beats (NarrativeClock)'],
  },
  state_classification: 'CROSS_SESSION_ACCUMULATED',

  state_lifecycle: {
    initialization: 'At first session: initial phase, no established partnership.',
    active: 'Continuously active across all sessions.',
    terminal: 'None — never resets.',
  },

  allowed_state_transitions: ['initial → growing → deep → ultimate : on sufficient completed-transformation evidence, one phase at a time.'],
  forbidden_state_transitions: ['Any regression of phase.', 'Advancement based on elapsed time, session count, or claim.'],

  state_visibility: 'INTERNAL_ONLY',

  synchronization_relationships: ['layer_II_parallel_absorption (Section III) — evaluates phase advancement only after TrustRegister and CreativeProfile have completed their own absorption of the same update.'],

  restoration_and_continuity_rules: 'across_partnership_lifetime (Section IV) — persists continuously; nothing to restore.',

  state_invariants: [
    'Phase always reflects actual behavioral history.',
    'Phase transitions are monotonically forward.',
  ],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_PARTNERSHIP_CHRONOLOGY (behavior.ts)',
    architectural_interfaces: 'INTERFACE_PARTNERSHIP_CHRONOLOGY (interfaces.ts)',
    architectural_specification: 'ENTITY_PARTNERSHIP_CHRONOLOGY (specification.ts)',
    constitutional_architecture: 'LAYER_II_LIVING_PARTNERSHIP (architecture.ts)',
    constitution: ['Relationship.growingPartnership', 'Relationship.afterFailure'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION VII — LAYER III STATE: SESSION NARRATIVE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_NARRATIVE_CLOCK = {
  name: 'NarrativeClockState',
  owner_entity: 'NarrativeClock',
  layer: 'III — Session Narrative',

  state_ownership: {
    holds: ['Current story beat (enum)', 'Beat-transition history (integrity enforcement only)', 'Revelation-gate status'],
    does_not_hold: ['How the beat is felt (Layer IV)', 'What the Citizen is creating (PursuitEngine)', 'Participant states (ParticipantOrchestrator)'],
  },
  state_classification: 'SESSION_SCOPED',

  state_lifecycle: {
    initialization: 'At session start: beat set to Arrival.',
    active: 'Continuously active throughout the session.',
    terminal: 'Resets at session end. Next session begins at Arrival — not restored.',
  },

  allowed_state_transitions: [
    'Arrival → Spark → Dialogue → Journey → Transformation → Revelation → Aftermath → Return, strictly forward, one at a time.',
  ],
  forbidden_state_transitions: ['Any reversal or skip.', 'Transformation → Revelation without MarkerConfirmationSignal.'],

  state_visibility: 'FELT_ONLY',

  synchronization_relationships: ['beat_and_experience_synchronization (Section III).'],

  restoration_and_continuity_rules: 'across_session_boundary (Section IV) — resets to Arrival each session; never restored to a prior session\'s beat.',

  state_invariants: ['Exactly one beat is current at any moment.', 'Aftermath is always reached before reset.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_NARRATIVE_CLOCK (behavior.ts)',
    architectural_interfaces: 'INTERFACE_NARRATIVE_CLOCK (interfaces.ts)',
    architectural_specification: 'ENTITY_NARRATIVE_CLOCK (specification.ts)',
    constitutional_architecture: 'LAYER_III_SESSION_NARRATIVE (architecture.ts)',
    constitution: ['Story.arrival', 'Story.transformation', 'Story.aftermath'],
  },
} as const;

export const STATE_PARTICIPANT_ORCHESTRATOR = {
  name: 'ParticipantOrchestratorState',
  owner_entity: 'ParticipantOrchestrator',
  layer: 'III — Session Narrative',

  state_ownership: {
    holds: ['Citizen state (clarity / confusion / flow)', 'Chamber relationship mode (enum)', 'Ghost Guide state (silent / present)', 'Invisible Director state (watching / intervening / withdrawn)'],
    does_not_hold: ['Behavioral character expressed through modes (CharacterAuthority)', 'The specific creative decision content (Citizen, sovereign)'],
  },
  state_classification: 'SESSION_SCOPED',

  state_lifecycle: {
    initialization: 'At session start: follows mode, Ghost Guide silent, Invisible Director watching, Citizen arriving.',
    active: 'Continuously active throughout the session.',
    terminal: 'Resets at session end.',
  },

  allowed_state_transitions: [
    'Chamber mode: follows ↔ leads ↔ questions ↔ challenges ↔ observes, per constitutional condition; any → follows, unconditionally, on Citizen decision.',
    'Ghost Guide: silent → present (at most once per direction) → silent.',
    'Invisible Director: watching ↔ intervening; any → withdrawn at Revelation.',
  ],
  forbidden_state_transitions: ['Continued advocacy after a Citizen decision.', 'Ghost Guide speaking twice on the same direction.', 'Invisible Director re-entering non-withdrawn during Revelation.'],

  state_visibility: 'INTERNAL_ONLY',

  synchronization_relationships: ['None beyond consuming StoryBeatDeclaration from NarrativeClock; provides its own state onward to StoryCoherence one-directionally.'],

  restoration_and_continuity_rules: 'across_session_boundary (Section IV) — resets each session; never restored.',

  state_invariants: ['The follows shift after a Citizen decision is immediate and unconditional.', 'The Invisible Director is fully withdrawn for the entire Revelation beat.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_PARTICIPANT_ORCHESTRATOR (behavior.ts)',
    architectural_interfaces: 'INTERFACE_PARTICIPANT_ORCHESTRATOR (interfaces.ts)',
    architectural_specification: 'ENTITY_PARTICIPANT_ORCHESTRATOR (specification.ts)',
    constitutional_architecture: 'LAYER_III_SESSION_NARRATIVE (architecture.ts)',
    constitution: ['Personality.citizenRelationship', 'Relationship.disagreement'],
  },
} as const;

export const STATE_STORY_COHERENCE = {
  name: 'StoryCoherenceState',
  owner_entity: 'StoryCoherence',
  layer: 'III — Session Narrative',

  state_ownership: {
    holds: ['Coherence thread state', 'Session narrative accumulation', 'Continuity state'],
    does_not_hold: ['Current beat (NarrativeClock)', 'Participant states (ParticipantOrchestrator)'],
  },
  state_classification: 'SESSION_SCOPED',

  state_lifecycle: {
    initialization: 'At session start: coherence thread begins with no accumulation.',
    active: 'Continuously active throughout the session.',
    terminal: 'Resets at session end — each session is a complete, self-contained story.',
  },

  allowed_state_transitions: ['empty → accumulating : on each StoryBeatDeclaration and CitizenExpression received.'],
  forbidden_state_transitions: ['Removal or reversal of prior accumulation within a session.', 'Representing the Transformation beat as a gap.'],

  state_visibility: 'FELT_ONLY',

  synchronization_relationships: ['beat_and_experience_synchronization (Section III), reading from NarrativeClock and ParticipantOrchestrator.'],

  restoration_and_continuity_rules: 'across_session_boundary (Section IV) — resets each session; the accumulated thread is never carried into the next session (larger story context is instead informed by PartnershipChronology depth).',

  state_invariants: ['Always continuous within a session — no fragment, no gap, no restart.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_STORY_COHERENCE (behavior.ts)',
    architectural_interfaces: 'INTERFACE_STORY_COHERENCE (interfaces.ts)',
    architectural_specification: 'ENTITY_STORY_COHERENCE (specification.ts)',
    constitutional_architecture: 'LAYER_III_SESSION_NARRATIVE (architecture.ts)',
    constitution: ['Story.largerStory', 'Presence.continuity'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION VIII — LAYER IV STATE: SESSION EXPERIENCE
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_PRESENCE_MONITOR = {
  name: 'PresenceMonitorState',
  owner_entity: 'PresenceMonitor',
  layer: 'IV — Session Experience',

  state_ownership: {
    holds: ['Attention state', 'Silence state (enum)', 'Pacing state', 'Focus state', 'Atmosphere state (invariant)', 'Continuity state'],
    does_not_hold: ['Temporal state (TemporalMonitor)', 'Spatial state (SpatialMonitor)', 'Narrative beat (NarrativeClock)'],
  },
  state_classification: 'SESSION_SCOPED',

  state_lifecycle: {
    initialization: 'At session start: expectant attention; atmosphere calm/alive/serious/receptive.',
    active: 'Continuously active throughout the session.',
    terminal: 'Resets at session end.',
  },

  allowed_state_transitions: ['silence: expectant ↔ resting ↔ protective ↔ observing, per beat and creative act state.', 'pacing/attention/focus: recalibrate per beat, partnership depth, creative act state.'],
  forbidden_state_transitions: ['Any transition of atmosphere.', 'Any transition triggered by session length or outcome rather than beat/act state.'],

  state_visibility: 'FELT_ONLY',

  synchronization_relationships: ['layer_IV_co_governance (Section III) — first tiebreaker; beat_and_experience_synchronization (Section III).'],

  restoration_and_continuity_rules: 'across_session_boundary (Section IV) — resets each session; never restored.',

  state_invariants: ['Atmosphere never transitions.', 'Continuous — no gap between calibrations.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_PRESENCE_MONITOR (behavior.ts)',
    architectural_interfaces: 'INTERFACE_PRESENCE_MONITOR (interfaces.ts)',
    architectural_specification: 'ENTITY_PRESENCE_MONITOR (specification.ts)',
    constitutional_architecture: 'LAYER_IV_SESSION_EXPERIENCE (architecture.ts)',
    constitution: ['Presence.atmosphere', 'Presence.pacing'],
  },
} as const;

export const STATE_TEMPORAL_MONITOR = {
  name: 'TemporalMonitorState',
  owner_entity: 'TemporalMonitor',
  layer: 'IV — Session Experience',

  state_ownership: {
    holds: ['Temporal state (anticipation / momentum / stillness / acceleration / completion)', 'Clock-prohibition enforcement status (always active)'],
    does_not_hold: ['Presence state (PresenceMonitor)', 'Spatial state (SpatialMonitor)', 'Any elapsed-time or duration value (constitutionally prohibited from ever existing here)'],
  },
  state_classification: 'SESSION_SCOPED',

  state_lifecycle: {
    initialization: 'At session start: readiness temporal state.',
    active: 'Continuously active throughout the session.',
    terminal: 'Resets at session end.',
  },

  allowed_state_transitions: ['anticipation ↔ momentum ↔ stillness ↔ acceleration ↔ completion, per beat and creative act state.'],
  forbidden_state_transitions: ['Any transition computed from elapsed time.', 'Any state value carrying a duration, percentage, or countdown.'],

  state_visibility: 'FELT_ONLY',

  synchronization_relationships: ['layer_IV_co_governance (Section III) — second tiebreaker; beat_and_experience_synchronization (Section III).'],

  restoration_and_continuity_rules: 'across_session_boundary (Section IV) — resets each session; never restored.',

  state_invariants: ['No clock measurement ever exists in this state.', 'Transformation beat always yields the richest temporal state.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_TEMPORAL_MONITOR (behavior.ts)',
    architectural_interfaces: 'INTERFACE_TEMPORAL_MONITOR (interfaces.ts)',
    architectural_specification: 'ENTITY_TEMPORAL_MONITOR (specification.ts)',
    constitutional_architecture: 'LAYER_IV_SESSION_EXPERIENCE (architecture.ts)',
    constitution: ['Time.forbidden', 'Time.transformation'],
  },
} as const;

export const STATE_SPATIAL_MONITOR = {
  name: 'SpatialMonitorState',
  owner_entity: 'SpatialMonitor',
  layer: 'IV — Session Experience',

  state_ownership: {
    holds: ['Spatial center state', 'Nearness state', 'Openness state', 'Intimacy state', 'Depth state', 'Threshold state (enum)', 'Orientation state', 'Movement state', 'Inhabitation state'],
    does_not_hold: ['Presence state (PresenceMonitor)', 'Temporal state (TemporalMonitor)', 'Narrative beat (NarrativeClock)', 'Geometry or visual layout (implementation concern)'],
  },
  state_classification: 'SESSION_SCOPED',

  state_lifecycle: {
    initialization: 'At session start: openness state (receptive, ready, inhabited), inhabitation depth calibrated to PartnershipDepthSignal.',
    active: 'Continuously active throughout the session.',
    terminal: 'Resets at session end; inhabitation depth informed by PartnershipChronology across sessions without values being carried over.',
  },

  allowed_state_transitions: ['threshold: arrival → expression → transformation → revelation → return, strictly forward, one at a time.', 'nearness/openness/intimacy/depth: recalibrate per beat, creative act state, partnership depth.'],
  forbidden_state_transitions: ['Any reversal of a registered threshold.', 'Any transition presenting the space as newly constructed.'],

  state_visibility: 'FELT_ONLY',

  synchronization_relationships: ['layer_IV_co_governance (Section III) — third tiebreaker; beat_and_experience_synchronization (Section III).'],

  restoration_and_continuity_rules: 'across_session_boundary (Section IV) — resets each session; inhabitation depth is recalibrated (not restored) from cross-session PartnershipChronology depth.',

  state_invariants: ['Current imagination is always the spatial center.', 'A registered threshold never reverts.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_SPATIAL_MONITOR (behavior.ts)',
    architectural_interfaces: 'INTERFACE_SPATIAL_MONITOR (interfaces.ts)',
    architectural_specification: 'ENTITY_SPATIAL_MONITOR (specification.ts)',
    constitutional_architecture: 'LAYER_IV_SESSION_EXPERIENCE (architecture.ts)',
    constitution: ['Space.thresholds', 'Space.inhabitation', 'Space.forbidden'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION IX — LAYER V STATE: TRANSFORMATION
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_IMAGINATION_CLARIFIER = {
  name: 'ImaginationClarifierState',
  owner_entity: 'ImaginationClarifier',
  layer: 'V — Transformation',

  state_ownership: {
    holds: ['Received Citizen expression (original form)', 'Identified imagination', 'Clarification dialogue state'],
    does_not_hold: ['The pursuit of the imagination (PursuitEngine)', 'Story beat (NarrativeClock)'],
  },
  state_classification: 'ACT_SCOPED',

  state_lifecycle: {
    initialization: 'Awaiting CitizenExpression at the start of each creative act.',
    active: 'From expression receipt through imagination identification.',
    terminal: 'Resets between creative acts.',
  },

  allowed_state_transitions: ['awaiting → receiving → clarifying (zero or more dialogue iterations) → identified.'],
  forbidden_state_transitions: ['identified → clarifying once PursuitEngine has begun pursuit for the same act.'],

  state_visibility: 'INTERNAL_ONLY',

  synchronization_relationships: ['None beyond one-directional handoff of the identified imagination to PursuitEngine.'],

  restoration_and_continuity_rules: 'across_act_boundary (Section IV) — resets fully between acts; never restored.',

  state_invariants: ['What reaches PursuitEngine is always the imagination, never the raw expression.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_IMAGINATION_CLARIFIER (behavior.ts)',
    architectural_interfaces: 'INTERFACE_IMAGINATION_CLARIFIER (interfaces.ts)',
    architectural_specification: 'ENTITY_IMAGINATION_CLARIFIER (specification.ts)',
    constitutional_architecture: 'LAYER_V_TRANSFORMATION (architecture.ts)',
    constitution: ['Transformation.nature', 'Soul.promise'],
  },
} as const;

export const STATE_PURSUIT_ENGINE = {
  name: 'PursuitEngineState',
  owner_entity: 'PursuitEngine',
  layer: 'V — Transformation',

  state_ownership: {
    holds: ['Current imagination being pursued', 'Current pursuit attempt', 'Marker evaluation state (four markers, each unevaluated / pass / fail)', 'Attempt count (internal only)'],
    does_not_hold: ['Imagination identification (ImaginationClarifier)', 'Crossing states (CrossingTracker)', 'Presentation (RevealCoordinator)'],
  },
  state_classification: 'ACT_SCOPED',

  state_lifecycle: {
    initialization: 'Upon receiving imagination from ImaginationClarifier.',
    active: 'During pursuit and marker evaluation.',
    terminal: 'Resets between creative acts; a marker failure triggers renewal rather than termination.',
  },

  allowed_state_transitions: ['idle → pursuing → evaluating → confirmed (all four markers pass).', 'evaluating → pursuing (renewal) on any marker failure.'],
  forbidden_state_transitions: ['evaluating → confirmed with fewer than four markers passing.', 'confirmed occurring twice for the same act.'],

  state_visibility: 'INTERNAL_ONLY',

  synchronization_relationships: ['pursuit_triple_emission_atomicity (Section III).'],

  restoration_and_continuity_rules: 'across_act_boundary (Section IV) — resets fully between acts; attempt count is never carried forward or displayed.',

  state_invariants: ['All four markers evaluated together, never partially authorized.', 'The standard never varies with attempt count.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_PURSUIT_ENGINE (behavior.ts)',
    architectural_interfaces: 'INTERFACE_PURSUIT_ENGINE (interfaces.ts)',
    architectural_specification: 'ENTITY_PURSUIT_ENGINE (specification.ts)',
    constitutional_architecture: 'LAYER_V_TRANSFORMATION.four_marker_validation_protocol (architecture.ts)',
    constitution: ['Transformation.genuine', 'Transformation.failure'],
  },
} as const;

export const STATE_CROSSING_TRACKER = {
  name: 'CrossingTrackerState',
  owner_entity: 'CrossingTracker',
  layer: 'V — Transformation',

  state_ownership: {
    holds: ['Outward Crossing state', 'Inward Crossing state', 'Relational Crossing state', 'RelationalCrossingUpdate content (held until issued)'],
    does_not_hold: ['The pursuit itself (PursuitEngine)', 'Presentation (RevealCoordinator)'],
  },
  state_classification: 'ACT_SCOPED',

  state_lifecycle: {
    initialization: 'At start of creative act: all three crossings incomplete.',
    active: 'From PursuitEngine genuine-confirmation through Relational Crossing completion.',
    terminal: 'Resets for the next creative act.',
  },

  allowed_state_transitions: ['incomplete → Outward-registered → Inward-registered → Relational-registered, strictly in sequence.'],
  forbidden_state_transitions: ['Any out-of-sequence registration.', 'Reversal of any registered crossing.'],

  state_visibility: 'INTERNAL_ONLY',

  synchronization_relationships: ['crossing_sequence_dependency (Section III).'],

  restoration_and_continuity_rules: 'across_act_boundary (Section IV) — resets fully between acts; mid_scale_interruption (Section IV) applies if the act is interrupted before Relational-registered.',

  state_invariants: ['Registration sequence is always Outward → Inward → Relational.', 'A registered crossing is irreversible within the act.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_CROSSING_TRACKER (behavior.ts)',
    architectural_interfaces: 'INTERFACE_CROSSING_TRACKER (interfaces.ts)',
    architectural_specification: 'ENTITY_CROSSING_TRACKER (specification.ts)',
    constitutional_architecture: 'LAYER_V_TRANSFORMATION (architecture.ts)',
    constitution: ['Transformation.dualCrossing', 'Transformation.irreversibility'],
  },
} as const;

export const STATE_REVEAL_COORDINATOR = {
  name: 'RevealCoordinatorState',
  owner_entity: 'RevealCoordinator',
  layer: 'V — Transformation',

  state_ownership: {
    holds: ['Presentation state (awaiting / presenting / encounter-complete)', 'Recession state (present / fully-receded)', 'Post-revelation holding state'],
    does_not_hold: ['The creation itself (result of PursuitEngine\'s pursuit)', 'Story beat advancement (NarrativeClock)', 'Crossing states (CrossingTracker)'],
  },
  state_classification: 'ACT_SCOPED',

  state_lifecycle: {
    initialization: 'Awaiting PresentationAuthorization from PursuitEngine.',
    active: 'Presents the creation; recedes completely; holds the silence.',
    terminal: 'Resets for the next creative act after encounter-complete is registered.',
  },

  allowed_state_transitions: ['awaiting → presenting → encounter-complete.', 'present → fully-receded, concurrent with presenting, held through encounter-complete.'],
  forbidden_state_transitions: ['presenting without prior PresentationAuthorization.', 'Any re-entry to present (non-receded) during the encounter.'],

  state_visibility: 'FELT_ONLY',

  synchronization_relationships: ['pursuit_triple_emission_atomicity (Section III) as a consumer; crossing_sequence_dependency (Section III) as the source of CitizenEncounterConfirmation.'],

  restoration_and_continuity_rules: 'across_act_boundary (Section IV) — resets fully between acts; never restored.',

  state_invariants: ['No language state exists from awaiting through encounter-complete.', 'Recession is complete for the entire encounter duration.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_REVEAL_COORDINATOR (behavior.ts)',
    architectural_interfaces: 'INTERFACE_REVEAL_COORDINATOR (interfaces.ts)',
    architectural_specification: 'ENTITY_REVEAL_COORDINATOR (specification.ts)',
    constitutional_architecture: 'LAYER_V_TRANSFORMATION (architecture.ts)',
    constitution: ['Transformation.withoutProclamation', 'Presence.silence'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION X — ROOT STATE: QIYAMAH CHAMBER
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_QIYAMAH_CHAMBER = {
  name: 'QiyamahChamberState',
  owner_entity: 'QiyamahChamber',
  layer: 'Root — Composing Entity',

  state_ownership: { holds: [], does_not_hold: ['Any state of its own — its state is entirely the composition of all seventeen other entities\' states.'] },
  state_classification: 'COMPOSED',

  state_lifecycle: {
    initialization: 'Pre-session: Layer I active, Layer II active with accumulated state, Layers III–V initializing.',
    active: 'Session: all five layers simultaneously active.',
    terminal: 'Post-session: Layers III–V reset; Layer II absorbs the final RelationalCrossingUpdate of the session; Layer I unchanged.',
  },

  allowed_state_transitions: ['pre-session → session : on Citizen arrival.', 'session → post-session : on Aftermath fully inhabited.'],
  forbidden_state_transitions: ['session → session without a completed post-session reset of Layers III–V.', 'Any composed state that omits one of the seventeen entity states.'],

  state_visibility: 'NOT_APPLICABLE',

  synchronization_relationships: ['All five synchronization relationships in Section III apply simultaneously within this composition.'],

  restoration_and_continuity_rules: 'Composed from across_partnership_lifetime, across_session_boundary, and across_act_boundary (Section IV) simultaneously — the composition itself has no independent restoration rule.',

  state_invariants: ['All seventeen entity states are present and active simultaneously within a session.', 'The composition is never partial.'],

  traceability: {
    architectural_behavior_model: 'BEHAVIOR_QIYAMAH_CHAMBER (behavior.ts)',
    architectural_interfaces: 'INTERFACE_QIYAMAH_CHAMBER (interfaces.ts)',
    architectural_specification: 'ENTITY_QIYAMAH_CHAMBER (specification.ts)',
    constitutional_architecture: 'COMPOSITION_RULES (architecture.ts)',
    constitution: ['All ten constitutional articles'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION XI — STATE TRACEABILITY MATRIX
// ═══════════════════════════════════════════════════════════════════════════

export const STATE_TRACEABILITY_MATRIX = {
  PurposeAuthorityState:         'BEHAVIOR_PURPOSE_AUTHORITY → INTERFACE_PURPOSE_AUTHORITY → ENTITY_PURPOSE_AUTHORITY',
  CharacterAuthorityState:       'BEHAVIOR_CHARACTER_AUTHORITY → INTERFACE_CHARACTER_AUTHORITY → ENTITY_CHARACTER_AUTHORITY',
  GuardianProtocolState:         'BEHAVIOR_GUARDIAN_PROTOCOL → INTERFACE_GUARDIAN_PROTOCOL → ENTITY_GUARDIAN_PROTOCOL',
  TrustRegisterState:            'BEHAVIOR_TRUST_REGISTER → INTERFACE_TRUST_REGISTER → ENTITY_TRUST_REGISTER',
  CreativeProfileState:          'BEHAVIOR_CREATIVE_PROFILE → INTERFACE_CREATIVE_PROFILE → ENTITY_CREATIVE_PROFILE',
  PartnershipChronologyState:    'BEHAVIOR_PARTNERSHIP_CHRONOLOGY → INTERFACE_PARTNERSHIP_CHRONOLOGY → ENTITY_PARTNERSHIP_CHRONOLOGY',
  NarrativeClockState:           'BEHAVIOR_NARRATIVE_CLOCK → INTERFACE_NARRATIVE_CLOCK → ENTITY_NARRATIVE_CLOCK',
  ParticipantOrchestratorState:  'BEHAVIOR_PARTICIPANT_ORCHESTRATOR → INTERFACE_PARTICIPANT_ORCHESTRATOR → ENTITY_PARTICIPANT_ORCHESTRATOR',
  StoryCoherenceState:           'BEHAVIOR_STORY_COHERENCE → INTERFACE_STORY_COHERENCE → ENTITY_STORY_COHERENCE',
  PresenceMonitorState:          'BEHAVIOR_PRESENCE_MONITOR → INTERFACE_PRESENCE_MONITOR → ENTITY_PRESENCE_MONITOR',
  TemporalMonitorState:          'BEHAVIOR_TEMPORAL_MONITOR → INTERFACE_TEMPORAL_MONITOR → ENTITY_TEMPORAL_MONITOR',
  SpatialMonitorState:           'BEHAVIOR_SPATIAL_MONITOR → INTERFACE_SPATIAL_MONITOR → ENTITY_SPATIAL_MONITOR',
  ImaginationClarifierState:     'BEHAVIOR_IMAGINATION_CLARIFIER → INTERFACE_IMAGINATION_CLARIFIER → ENTITY_IMAGINATION_CLARIFIER',
  PursuitEngineState:            'BEHAVIOR_PURSUIT_ENGINE → INTERFACE_PURSUIT_ENGINE → ENTITY_PURSUIT_ENGINE',
  CrossingTrackerState:          'BEHAVIOR_CROSSING_TRACKER → INTERFACE_CROSSING_TRACKER → ENTITY_CROSSING_TRACKER',
  RevealCoordinatorState:        'BEHAVIOR_REVEAL_COORDINATOR → INTERFACE_REVEAL_COORDINATOR → ENTITY_REVEAL_COORDINATOR',
  QiyamahChamberState:           'BEHAVIOR_QIYAMAH_CHAMBER → INTERFACE_QIYAMAH_CHAMBER → ENTITY_QIYAMAH_CHAMBER',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// THE ARCHITECTURAL STATE MODEL (unified)
// ═══════════════════════════════════════════════════════════════════════════

export const QIYAMAH_ARCHITECTURAL_STATE_MODEL = {
  classificationTaxonomy: STATE_CLASSIFICATION_TAXONOMY,
  visibilityModel:        STATE_VISIBILITY_MODEL,
  synchronizationModel:   SYSTEMIC_STATE_SYNCHRONIZATION,
  restorationModel:       SYSTEMIC_RESTORATION_MODEL,

  layer_I: {
    purposeAuthority:   STATE_PURPOSE_AUTHORITY,
    characterAuthority: STATE_CHARACTER_AUTHORITY,
    guardianProtocol:   STATE_GUARDIAN_PROTOCOL,
  },

  layer_II: {
    trustRegister:         STATE_TRUST_REGISTER,
    creativeProfile:       STATE_CREATIVE_PROFILE,
    partnershipChronology: STATE_PARTNERSHIP_CHRONOLOGY,
  },

  layer_III: {
    narrativeClock:          STATE_NARRATIVE_CLOCK,
    participantOrchestrator: STATE_PARTICIPANT_ORCHESTRATOR,
    storyCoherence:          STATE_STORY_COHERENCE,
  },

  layer_IV: {
    presenceMonitor: STATE_PRESENCE_MONITOR,
    temporalMonitor: STATE_TEMPORAL_MONITOR,
    spatialMonitor:  STATE_SPATIAL_MONITOR,
  },

  layer_V: {
    imaginationClarifier: STATE_IMAGINATION_CLARIFIER,
    pursuitEngine:        STATE_PURSUIT_ENGINE,
    crossingTracker:      STATE_CROSSING_TRACKER,
    revealCoordinator:    STATE_REVEAL_COORDINATOR,
  },

  root: STATE_QIYAMAH_CHAMBER,

  traceability: STATE_TRACEABILITY_MATRIX,

  decree: 'This state model translates the Architectural Behavior Model into ownership, classification, lifecycle, transition, visibility, synchronization, restoration, and invariant terms only. Every entity named in the Specification, interfaced in the Interfaces layer, and behaviorally defined in the Behavior Model receives exactly one state definition here. Implementation of this state — storage, libraries, reducers, or frameworks — is a future stage and is not defined here.' as const,
} as const;
