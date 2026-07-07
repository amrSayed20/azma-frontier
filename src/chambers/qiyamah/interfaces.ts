/**
 * AZMA OS — Qiyamah Chamber
 * ARCHITECTURAL INTERFACES — Stage 6 of 13
 *
 * This document derives the complete Architectural Interfaces from the approved
 * Architectural Specification (specification.ts) and, through it, from the
 * Constitutional Architecture (architecture.ts) and the Constitution (Soul → Transformation).
 *
 * Sources of authority, in order:
 *   The ten constitutional articles (Soul through Transformation)
 *   → The Constitutional Architecture (architecture.ts)
 *   → The Architectural Specification (specification.ts)
 *   → This Interface Layer
 *   → Future Implementations
 *
 * This document introduces zero constitutional authority.
 * It introduces zero architectural authority beyond what the Specification already named.
 * It introduces zero implementation.
 *
 * An interface defined here is a communication contract only: what an entity requires
 * as input, what it guarantees as output, which paths it may and may not communicate
 * through, when its interface events occur, where it is checked for constitutional
 * compliance, what it depends on and is depended on by, the invariants that hold at
 * its boundary at all times, and its complete trace back to the Specification.
 *
 * An interface defined here does NOT define: runtime behavior, internal algorithms,
 * data storage, UI, components, or any mechanism of how a contract is fulfilled.
 *
 * Every one of the seventeen named entities plus the root composing entity receives
 * exactly one Architectural Interface here. No interface may be added for an entity
 * not named in the Specification. No entity named in the Specification may lack one.
 */

// ═══════════════════════════════════════════════════════════════════════════
// SECTION I — SIGNAL INTERFACE CONTRACTS
// The communication-signal catalog formalized as publisher/subscriber contracts.
// These are the only named channels through which entities may communicate.
// ═══════════════════════════════════════════════════════════════════════════

export const SIGNAL_INTERFACE_CONTRACTS = {
  ConstitutionalComplianceRequirement: {
    publishers:   ['PurposeAuthority', 'CharacterAuthority'],
    subscribers:  ['all seventeen entities'],
    payload_contract: 'The complete constitutional character: purpose, promise, temperament, relationship modes, creative conscience, the eight constitutional boundaries.',
    channel_type: 'Inheritance — not a runtime message. No subscriber invokes this channel; every subscriber is constrained by it permanently.',
    forbidden_content: 'Nothing session-specific, Citizen-specific, or outcome-specific may travel on this channel.',
    traceability: 'COMMUNICATION_SIGNALS.ConstitutionalComplianceRequirement (specification.ts)',
  },
  PartnershipDepthSignal: {
    publishers:   ['TrustRegister', 'CreativeProfile', 'PartnershipChronology'],
    subscribers:  ['NarrativeClock', 'StoryCoherence', 'PresenceMonitor', 'SpatialMonitor'],
    payload_contract: 'Partnership phase (initial / growing / deep / ultimate), pacing calibration, which beats may be traversed faster due to fluency.',
    forbidden_content: 'Any specific content about what the Citizen has created, said, or expressed. Depth only — never content.',
    traceability: 'COMMUNICATION_SIGNALS.PartnershipDepthSignal (specification.ts)',
  },
  UnderstandingPrecisionSignal: {
    publishers:   ['CreativeProfile'],
    subscribers:  ['ImaginationClarifier', 'PursuitEngine'],
    payload_contract: 'The precision of creative character understanding — how accurately the Chamber can interpret this Citizen\'s imagination. Creative vocabulary depth.',
    forbidden_content: 'This signal may shape the quality of listening. It may not shape the content of what is heard.',
    traceability: 'COMMUNICATION_SIGNALS.UnderstandingPrecisionSignal (specification.ts)',
  },
  TrustDepthSignal: {
    publishers:   ['TrustRegister'],
    subscribers:  ['ImaginationClarifier'],
    payload_contract: 'Current trust state (earned / strained / in-repair) and the depth of creative vulnerability the Citizen currently extends.',
    forbidden_content: 'This signal may never be displayed to the Citizen in any form. It may not shape how the Chamber describes the relationship — only how it receives imagination.',
    traceability: 'COMMUNICATION_SIGNALS.TrustDepthSignal (specification.ts)',
  },
  StoryBeatDeclaration: {
    publishers:   ['NarrativeClock'],
    subscribers:  ['PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor', 'RevealCoordinator'],
    payload_contract: 'Current story beat (Arrival / Spark / Dialogue / Journey / Transformation / Revelation / Aftermath / Return).',
    forbidden_content: 'A declaration may not be issued unless the constitutional condition for that beat is met. No skipping. No reversal.',
    traceability: 'COMMUNICATION_SIGNALS.StoryBeatDeclaration (specification.ts)',
  },
  NarrativeContextSignal: {
    publishers:   ['NarrativeClock', 'StoryCoherence'],
    subscribers:  ['PursuitEngine'],
    payload_contract: 'Which turning-point type is operative, the narrative direction of the current creative act, the weight of this act within the session story.',
    forbidden_content: 'No content that would expose narrative mechanics to the Citizen.',
    traceability: 'COMMUNICATION_SIGNALS.NarrativeContextSignal (specification.ts)',
  },
  EnvironmentalQualitySignal: {
    publishers:   ['PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor'],
    subscribers:  ['PursuitEngine'],
    payload_contract: 'Current presence state, temporal state (anticipation / momentum / stillness / acceleration / completion), spatial state (threshold position, nearness, openness).',
    forbidden_content: 'Carries quality — never mechanism. No clock measurement of any form.',
    traceability: 'COMMUNICATION_SIGNALS.EnvironmentalQualitySignal (specification.ts)',
  },
  MarkerConfirmationSignal: {
    publishers:   ['PursuitEngine'],
    subscribers:  ['NarrativeClock'],
    payload_contract: 'Confirmation that all four constitutional markers have passed (imagination, specificity, excess, revelation).',
    forbidden_content: 'May only be issued when all four markers genuinely pass. A partial pass is not a signal — it is a renewal of pursuit.',
    traceability: 'COMMUNICATION_SIGNALS.MarkerConfirmationSignal (specification.ts)',
  },
  AfterCompletionSignal: {
    publishers:   ['CrossingTracker'],
    subscribers:  ['NarrativeClock'],
    payload_contract: 'The Inward Crossing is complete.',
    forbidden_content: 'May not be issued before CitizenEncounterConfirmation is received from RevealCoordinator.',
    traceability: 'COMMUNICATION_SIGNALS.AfterCompletionSignal (specification.ts)',
  },
  RelationalCrossingUpdate: {
    publishers:   ['CrossingTracker'],
    subscribers:  ['TrustRegister', 'PartnershipChronology', 'CreativeProfile'],
    payload_contract: 'The Relational Crossing has completed. The specific creative character insight this act revealed.',
    forbidden_content: 'Accumulation only — never governance. No retrievable record. Must pass the domain check (validation_5_memory_update) before absorption.',
    traceability: 'COMMUNICATION_SIGNALS.RelationalCrossingUpdate (specification.ts)',
  },
  CreativeActStateSignal: {
    publishers:   ['PursuitEngine', 'RevealCoordinator'],
    subscribers:  ['PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor'],
    payload_contract: 'Current creative act state: idle / pursuit-underway / markers-evaluating / revelation-imminent / complete.',
    forbidden_content: 'No content beyond the named enum state.',
    traceability: 'COMMUNICATION_SIGNALS.CreativeActStateSignal (specification.ts)',
  },
  CitizenExpression: {
    publishers:   ['Citizen (external)'],
    subscribers:  ['NarrativeClock', 'ParticipantOrchestrator', 'StoryCoherence', 'ImaginationClarifier'],
    payload_contract: 'The Citizen\'s expression in whatever form it arrives: certainty, partial idea, confusion, conviction, creative decision.',
    forbidden_content: 'None beyond what the Citizen supplies. What reaches ImaginationClarifier is received in full; what ImaginationClarifier forwards onward is the imagination, never the raw expression.',
    traceability: 'COMMUNICATION_SIGNALS.CitizenExpression (specification.ts)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION II — LOCAL SIGNAL INTERFACE CONTRACTS
// Signals named within individual entity contracts in the Specification but not
// cataloged in COMMUNICATION_SIGNALS. Formalized here for interface completeness.
// Each is traceable to the entity public_contract that names it.
// ═══════════════════════════════════════════════════════════════════════════

export const LOCAL_SIGNAL_INTERFACE_CONTRACTS = {
  GenuineConfirmation: {
    publishers:   ['PursuitEngine'],
    subscribers:  ['CrossingTracker'],
    payload_contract: 'The creation exists and all four markers confirm genuine (Outward Crossing authorization).',
    traceability: 'ENTITY_CROSSING_TRACKER.public_contract.receives (specification.ts)',
  },
  PresentationAuthorization: {
    publishers:   ['PursuitEngine'],
    subscribers:  ['RevealCoordinator'],
    payload_contract: 'Authorization to present — issued only when all four markers pass.',
    traceability: 'ENTITY_REVEAL_COORDINATOR.public_contract.receives (specification.ts)',
  },
  CrossingState: {
    publishers:   ['CrossingTracker'],
    subscribers:  ['RevealCoordinator'],
    payload_contract: 'Which of the three crossings are complete — context for what is being revealed.',
    traceability: 'ENTITY_CROSSING_TRACKER.public_contract.provides (specification.ts)',
  },
  CitizenEncounterConfirmation: {
    publishers:   ['RevealCoordinator'],
    subscribers:  ['CrossingTracker'],
    payload_contract: 'The Citizen has encountered the creation (Inward Crossing signal).',
    traceability: 'ENTITY_REVEAL_COORDINATOR.public_contract.provides (specification.ts)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION III — LAYER I INTERFACES: CONSTITUTIONAL IDENTITY
// ═══════════════════════════════════════════════════════════════════════════

export const INTERFACE_PURPOSE_AUTHORITY = {
  name: 'PurposeAuthorityInterface',
  owner_entity: 'PurposeAuthority',
  layer: 'I — Constitutional Identity',

  interface_ownership: {
    owns: 'The read-only constitutional-constant contract surface: purpose, promise, fear, success measure, Reactor and Journey principles, Ghost Guide mandate.',
    exposes_state: false,
  },

  public_contracts: {
    exposes: ['Purpose definition and success measure, available to every entity as the standard against which outputs may be validated.'],
  },

  private_contracts: {
    not_exposed: ['Any derivation process. PurposeAuthority holds only what Soul defined — no session, Citizen, or outcome may alter its content.'],
  },

  required_inputs: [],

  guaranteed_outputs: [
    { signal: 'ConstitutionalComplianceRequirement', to: 'all entities', guarantee: 'Purpose, promise, fear, and success measure are permanently available.' },
  ],

  allowed_communication_paths: ['PurposeAuthority → all entities (inheritance channel only)'],
  forbidden_communication_paths: ['any entity → PurposeAuthority (no inputs may be sent to it)'],

  lifecycle_interface_events: {
    on_initialization: 'Exists prior to any session or Citizen arrival — no initialization event required.',
    on_active: 'Permanently exposed. No activation/deactivation event exists.',
    on_reset: 'No reset event exists for this interface.',
  },

  validation_interface: {
    validation_points: ['validation_3_pre_presentation_markers', 'validation_4_revelation_presentation'],
    role: 'Standard provider, not enforcer. GuardianProtocol performs enforcement.',
  },

  dependency_interfaces: {
    depends_on: [],
    depended_on_by: ['GuardianProtocol', 'NarrativeClock', 'ImaginationClarifier', 'PursuitEngine'],
  },

  interface_invariants: [
    'The purpose, promise, fear, and success measure never change across this interface.',
    'No creative outcome may cause this interface to return a revised value.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_PURPOSE_AUTHORITY (specification.ts)',
    constitutional_architecture: 'LAYER_I_CONSTITUTIONAL_IDENTITY.owns.from_soul (architecture.ts)',
    constitution: ['Soul.purpose', 'Soul.promise', 'Soul.fear', 'Soul.success', 'Soul.reactor', 'Soul.journey', 'Soul.ghostGuide'],
  },
} as const;

export const INTERFACE_CHARACTER_AUTHORITY = {
  name: 'CharacterAuthorityInterface',
  owner_entity: 'CharacterAuthority',
  layer: 'I — Constitutional Identity',

  interface_ownership: {
    owns: 'The read-only constitutional-constant contract surface: six temperament traits, four relationship modes, Ghost Guide personality, Invisible Director mandate, Creative Conscience.',
    exposes_state: false,
  },

  public_contracts: {
    exposes: ['The immutable behavioral character every other entity inherits as a governing constraint.'],
  },

  private_contracts: {
    not_exposed: ['Any derivation process. Temperament traits may not vary by session, Citizen, creative difficulty, or creative failure.'],
  },

  required_inputs: [],

  guaranteed_outputs: [
    { signal: 'ConstitutionalComplianceRequirement', to: 'all entities', guarantee: 'Temperament, relationship modes, Ghost Guide personality, Invisible Director mandate, Creative Conscience are permanently available.' },
  ],

  allowed_communication_paths: ['CharacterAuthority → all entities (inheritance channel only)'],
  forbidden_communication_paths: ['any entity → CharacterAuthority (no inputs may be sent to it)'],

  lifecycle_interface_events: {
    on_initialization: 'Exists prior to any session — no initialization event required.',
    on_active: 'Permanently exposed. No activation/deactivation event exists.',
    on_reset: 'No reset event exists for this interface.',
  },

  validation_interface: {
    validation_points: ['validation_2_relationship_mode'],
    role: 'Behavioral-standard provider, not enforcer. GuardianProtocol performs enforcement.',
  },

  dependency_interfaces: {
    depends_on: [],
    depended_on_by: ['GuardianProtocol', 'TrustRegister', 'CreativeProfile', 'NarrativeClock', 'ParticipantOrchestrator', 'PresenceMonitor', 'PursuitEngine', 'RevealCoordinator'],
  },

  interface_invariants: [
    'All six temperament traits are returned at all times. None may be suspended across this interface.',
    'The Creative Conscience content may not be bypassed by any caller.',
    'Ambition is always returned as in service of the Citizen\'s vision — never the Chamber\'s aesthetic preference.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_CHARACTER_AUTHORITY (specification.ts)',
    constitutional_architecture: 'LAYER_I_CONSTITUTIONAL_IDENTITY.owns.from_personality (architecture.ts)',
    constitution: ['Personality.temperament', 'Personality.citizenRelationship', 'Personality.ghostGuidePersonality', 'Personality.invisibleDirector', 'Personality.creativeConscience', 'Personality.imperfection', 'Personality.excellence', 'Personality.consistency'],
  },
} as const;

export const INTERFACE_GUARDIAN_PROTOCOL = {
  name: 'GuardianProtocolInterface',
  owner_entity: 'GuardianProtocol',
  layer: 'I — Constitutional Identity',

  interface_ownership: {
    owns: 'The single constitutional-compliance-check contract surface: the eight boundaries as active enforcement criteria, invoked by every other entity before any output reaches the Citizen.',
    exposes_state: false,
  },

  public_contracts: {
    exposes: ['A pass/fail constitutional compliance check callable by any entity for any proposed output.'],
  },

  private_contracts: {
    not_exposed: ['Any priority ordering among the eight boundaries — all are checked simultaneously; any single violation invalidates the output.'],
  },

  required_inputs: [
    { input: 'Proposed output', from: 'any entity', required_for: 'boundary evaluation' },
    { input: 'Current context (story beat, trust state, creative act state)', from: 'any entity', required_for: 'boundary evaluation' },
  ],

  guaranteed_outputs: [
    { signal: 'Compliance result (pass / fail)', to: 'calling entity', guarantee: 'Every one of the eight boundaries has been checked; a fail result is final.' },
  ],

  allowed_communication_paths: ['any entity → GuardianProtocol (compliance check)', 'GuardianProtocol → PurposeAuthority (success measure)', 'GuardianProtocol → CharacterAuthority (behavioral standard, Creative Conscience)'],
  forbidden_communication_paths: ['GuardianProtocol may not be bypassed by any entity for any reason.', 'No entity may selectively invoke only some of the eight boundaries.'],

  lifecycle_interface_events: {
    on_initialization: 'Exists prior to any session.',
    on_active: 'Every entity output passes through this interface before reaching the Citizen.',
    on_reset: 'No reset event exists for this interface.',
  },

  validation_interface: {
    validation_points: ['validation_1_imagination_reception', 'validation_2_relationship_mode', 'validation_3_pre_presentation_markers', 'validation_4_revelation_presentation', 'validation_5_memory_update', 'validation_6_experience_layer_compliance'],
    role: 'Primary enforcement mechanism for all six constitutional validation points.',
  },

  dependency_interfaces: {
    depends_on: ['PurposeAuthority', 'CharacterAuthority'],
    depended_on_by: ['all sixteen other entities'],
  },

  interface_invariants: [
    'All eight constitutional boundaries are active at all times across this interface.',
    'No output from any entity reaches the Citizen without passing through this interface.',
    'A boundary-violation result is final — the output does not exist in any form.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_GUARDIAN_PROTOCOL (specification.ts)',
    constitutional_architecture: 'CONSTITUTIONAL_BOUNDARIES (architecture.ts, all eight)',
    constitution: ['Personality.citizenRelationship', 'Trust.guidanceVsControl', 'Trust.protection', 'Time.forbidden', 'Trust.transparencyVsExposure', 'Space.forbidden', 'Soul.nature', 'Memory.nature', 'Memory.forbidden', 'Transformation.failure', 'Transformation.withoutProclamation', 'Personality.excellence', 'Personality.creativeConscience', 'Relationship.afterFailure'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION IV — LAYER II INTERFACES: LIVING PARTNERSHIP
// ═══════════════════════════════════════════════════════════════════════════

export const INTERFACE_TRUST_REGISTER = {
  name: 'TrustRegisterInterface',
  owner_entity: 'TrustRegister',
  layer: 'II — Living Partnership',

  interface_ownership: {
    owns: 'The living trust-state contract surface: earned / strained / in-repair, the three constitutional distinctions, the trust-manipulation prohibition list, creative vulnerability depth.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['TrustDepthSignal to ImaginationClarifier.', 'PartnershipDepthSignal (trust dimension) to NarrativeClock, StoryCoherence, PresenceMonitor, SpatialMonitor.'],
  },

  private_contracts: {
    not_exposed: ['The specific creative act that produced any trust update. Absorption occurs without retaining a retrievable record of the act.'],
  },

  required_inputs: [
    { signal: 'RelationalCrossingUpdate', from: 'CrossingTracker', required_for: 'trust-state deepening after genuine transformation' },
  ],

  guaranteed_outputs: [
    { signal: 'TrustDepthSignal', to: 'ImaginationClarifier', guarantee: 'Current trust state and creative vulnerability depth.' },
    { signal: 'PartnershipDepthSignal (trust dimension)', to: 'NarrativeClock, StoryCoherence, PresenceMonitor, SpatialMonitor', guarantee: 'Depth only — never content of what the Citizen created or said.' },
  ],

  allowed_communication_paths: ['TrustRegister → CharacterAuthority (read)', 'TrustRegister → GuardianProtocol (boundary check)', 'TrustRegister → PartnershipChronology (read, phase context)', 'CrossingTracker → TrustRegister (RelationalCrossingUpdate)'],
  forbidden_communication_paths: ['TrustRegister → Citizen (direct exposure forbidden in any form)', 'any entity → TrustRegister other than post-transformation updates and constitutional trust violations'],

  lifecycle_interface_events: {
    on_initialization: 'At first session: trust interface returns zero-state. First-meeting protocol active.',
    on_active: 'Continuously exposed across all sessions. Never resets.',
    on_update: 'Absorbs RelationalCrossingUpdate after each genuine transformation.',
  },

  validation_interface: {
    validation_points: ['validation_2_relationship_mode'],
    role: 'Trust dimension provider. Enforces trust-manipulation boundary (via GuardianProtocol) on all outputs crossing this interface.',
  },

  dependency_interfaces: {
    depends_on: ['CharacterAuthority', 'GuardianProtocol', 'PartnershipChronology'],
    depended_on_by: ['CreativeProfile', 'PartnershipChronology', 'ParticipantOrchestrator', 'ImaginationClarifier', 'CrossingTracker'],
  },

  interface_invariants: [
    'The trust state returned always reflects actual behavioral history, never a claim.',
    'The trust-manipulation prohibitions are active on every call, in every trust state.',
    'The three constitutional distinctions are invariant criteria — they do not vary by trust state.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_TRUST_REGISTER (specification.ts)',
    constitutional_architecture: 'LAYER_II_LIVING_PARTNERSHIP.owns.from_trust (architecture.ts)',
    constitution: ['Trust.nature', 'Trust.earning', 'Trust.creativeVulnerability', 'Trust.guidanceVsControl', 'Trust.confidenceVsCertainty', 'Trust.transparencyVsExposure', 'Trust.repair', 'Trust.protection', 'Relationship.trust', 'Relationship.firstMeeting'],
  },
} as const;

export const INTERFACE_CREATIVE_PROFILE = {
  name: 'CreativeProfileInterface',
  owner_entity: 'CreativeProfile',
  layer: 'II — Living Partnership',

  interface_ownership: {
    owns: 'The accumulated creative-character contract surface: creative rhythm, instincts, courage, language, ambitions, vocabulary, arc — expressed, never retrieved.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['UnderstandingPrecisionSignal to ImaginationClarifier and PursuitEngine.', 'PartnershipDepthSignal (creative-character dimension) to NarrativeClock, StoryCoherence, PresenceMonitor, SpatialMonitor.'],
  },

  private_contracts: {
    not_exposed: ['Specific expressions, past prompts, technical details, early confusions. The surveillance test must pass before any content crosses into this interface\'s state.'],
  },

  required_inputs: [
    { signal: 'RelationalCrossingUpdate', from: 'CrossingTracker', required_for: 'creative-character understanding deepening after genuine transformation' },
  ],

  guaranteed_outputs: [
    { signal: 'UnderstandingPrecisionSignal', to: 'ImaginationClarifier, PursuitEngine', guarantee: 'Precision of creative-character understanding, never the underlying stored content.' },
  ],

  allowed_communication_paths: ['CreativeProfile → CharacterAuthority (read, memory constraints)', 'CreativeProfile → GuardianProtocol (memory display boundary check)', 'CreativeProfile → TrustRegister (read, trust state)', 'CrossingTracker → CreativeProfile (RelationalCrossingUpdate)'],
  forbidden_communication_paths: ['CreativeProfile → Citizen (direct exposure forbidden in any form)', 'CreativeProfile → CreativeProfile of another Citizen (no crossing)'],

  lifecycle_interface_events: {
    on_initialization: 'At first session: zero understanding, no vocabulary, no arc.',
    on_active: 'Continuously exposed across all sessions. Never resets.',
    on_update: 'Absorbs the creative-character insight from RelationalCrossingUpdate after each genuine transformation.',
    on_decay: 'Fading-category content attenuates constitutionally — not a technical deletion event but a mandated decay.',
  },

  validation_interface: {
    validation_points: ['validation_5_memory_update'],
    role: 'Memory dimension provider for the domain check performed before RelationalCrossingUpdate absorption.',
  },

  dependency_interfaces: {
    depends_on: ['CharacterAuthority', 'GuardianProtocol', 'TrustRegister'],
    depended_on_by: ['PartnershipChronology', 'ImaginationClarifier', 'PursuitEngine', 'CrossingTracker'],
  },

  interface_invariants: [
    'The surveillance test passes before any content accumulates behind this interface.',
    'This interface shapes how the Chamber listens — it never determines what is heard before the Citizen expresses it.',
    'Forbidden-category content may never cross this interface under any circumstance.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_CREATIVE_PROFILE (specification.ts)',
    constitutional_architecture: 'LAYER_II_LIVING_PARTNERSHIP.owns.from_memory (architecture.ts)',
    constitution: ['Memory.nature', 'Memory.permitted', 'Memory.permanent', 'Memory.fading', 'Memory.forbidden', 'Memory.identity', 'Memory.quality', 'Memory.continuity', 'Memory.privacy', 'Relationship.growingPartnership'],
  },
} as const;

export const INTERFACE_PARTNERSHIP_CHRONOLOGY = {
  name: 'PartnershipChronologyInterface',
  owner_entity: 'PartnershipChronology',
  layer: 'II — Living Partnership',

  interface_ownership: {
    owns: 'The partnership-phase contract surface: initial / growing / deep / ultimate, phase-specific behavioral protocols, after-failure protocol.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['PartnershipDepthSignal (phase dimension) to NarrativeClock, StoryCoherence, PresenceMonitor, SpatialMonitor.'],
  },

  private_contracts: {
    not_exposed: ['The specific completed-transformation history that produced the current phase — only the phase value itself.'],
  },

  required_inputs: [
    { signal: 'RelationalCrossingUpdate', from: 'CrossingTracker', required_for: 'phase-advancement evaluation' },
  ],

  guaranteed_outputs: [
    { signal: 'PartnershipDepthSignal (phase dimension)', to: 'NarrativeClock, StoryCoherence, PresenceMonitor, SpatialMonitor', guarantee: 'Current phase and pacing calibration only.' },
  ],

  allowed_communication_paths: ['PartnershipChronology → TrustRegister (read)', 'PartnershipChronology → CreativeProfile (read)', 'PartnershipChronology → GuardianProtocol (standard boundary check)', 'CrossingTracker → PartnershipChronology (RelationalCrossingUpdate)'],
  forbidden_communication_paths: ['PartnershipChronology → Citizen (direct exposure forbidden in any form)', 'PartnershipChronology may not receive phase-advancing input other than post-transformation updates'],

  lifecycle_interface_events: {
    on_initialization: 'At first session: initial phase, no established partnership.',
    on_active: 'Continuously exposed across all sessions. Never resets.',
    on_update: 'Evaluates whether the completed genuine transformation warrants phase advancement.',
  },

  validation_interface: {
    validation_points: ['validation_5_memory_update'],
    role: 'Provides partnership-phase context used in the RelationalCrossingUpdate domain check.',
  },

  dependency_interfaces: {
    depends_on: ['TrustRegister', 'CreativeProfile', 'GuardianProtocol'],
    depended_on_by: ['TrustRegister', 'StoryCoherence', 'PresenceMonitor', 'SpatialMonitor', 'NarrativeClock', 'CrossingTracker'],
  },

  interface_invariants: [
    'The phase returned reflects actual behavioral history, never claimed depth, time elapsed, or session count.',
    'Phase may only advance across this interface — never regress.',
    'The after-failure protocol holds the standard rather than lowering it.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_PARTNERSHIP_CHRONOLOGY (specification.ts)',
    constitutional_architecture: 'LAYER_II_LIVING_PARTNERSHIP.owns.from_relationship (architecture.ts), ARCHITECTURAL_STATE_PROGRESSION.partnership_states',
    constitution: ['Relationship.firstMeeting', 'Relationship.growingPartnership', 'Relationship.sharedJourney', 'Relationship.afterFailure', 'Story.largerStory', 'Memory.continuity', 'Memory.return'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION V — LAYER III INTERFACES: SESSION NARRATIVE
// ═══════════════════════════════════════════════════════════════════════════

export const INTERFACE_NARRATIVE_CLOCK = {
  name: 'NarrativeClockInterface',
  owner_entity: 'NarrativeClock',
  layer: 'III — Session Narrative',

  interface_ownership: {
    owns: 'The current-story-beat contract surface and sole beat-transition authority for all eight/nine story beats.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['StoryBeatDeclaration to PresenceMonitor, TemporalMonitor, SpatialMonitor, RevealCoordinator.', 'NarrativeContextSignal (beat dimension) to PursuitEngine.'],
  },

  private_contracts: {
    not_exposed: ['Beat-transition history is held internally to enforce integrity; it is not surfaced across this interface.'],
  },

  required_inputs: [
    { signal: 'CitizenExpression', from: 'Citizen', required_for: 'Arrival→Spark and Spark→Dialogue transitions' },
    { signal: 'MarkerConfirmationSignal', from: 'PursuitEngine', required_for: 'Transformation→Revelation transition (absolute gate)' },
    { signal: 'AfterCompletionSignal', from: 'CrossingTracker', required_for: 'Revelation→Aftermath transition' },
    { signal: 'PartnershipDepthSignal', from: 'TrustRegister, CreativeProfile, PartnershipChronology', required_for: 'pacing calibration of some transitions' },
  ],

  guaranteed_outputs: [
    { signal: 'StoryBeatDeclaration', to: 'PresenceMonitor, TemporalMonitor, SpatialMonitor, RevealCoordinator', guarantee: 'Only ever the current beat, issued only when its constitutional condition is met.' },
    { signal: 'NarrativeContextSignal', to: 'PursuitEngine', guarantee: 'Narrative context for the current creative act.' },
  ],

  allowed_communication_paths: ['NarrativeClock → PurposeAuthority (read, Journey principle)', 'NarrativeClock → CharacterAuthority (read)', 'NarrativeClock → GuardianProtocol (continuity boundary check)', 'PursuitEngine → NarrativeClock (MarkerConfirmationSignal)', 'CrossingTracker → NarrativeClock (AfterCompletionSignal)', 'PartnershipChronology → NarrativeClock (pacing)'],
  forbidden_communication_paths: ['NarrativeClock may not issue a beat declaration out of sequence.', 'NarrativeClock may not advance to Revelation without MarkerConfirmationSignal.', 'NarrativeClock → Citizen exposing beat mechanics directly (forbidden)'],

  lifecycle_interface_events: {
    on_initialization: 'At session start: beat interface returns Arrival.',
    on_active: 'Continuously exposed throughout the session.',
    on_reset: 'Resets at session end. Next session begins at Arrival.',
  },

  validation_interface: {
    validation_points: ['validation_3_pre_presentation_markers', 'validation_4_revelation_presentation'],
    role: 'Beat-transition authority is the enforcement surface for the Revelation gate and Aftermath requirement.',
  },

  dependency_interfaces: {
    depends_on: ['PurposeAuthority', 'CharacterAuthority', 'GuardianProtocol', 'PursuitEngine', 'CrossingTracker', 'PartnershipChronology'],
    depended_on_by: ['ParticipantOrchestrator', 'StoryCoherence', 'PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor', 'ImaginationClarifier', 'RevealCoordinator'],
  },

  interface_invariants: [
    'The beat sequence returned is always forward-only: Arrival → Spark → Dialogue → Journey → Transformation → Revelation → Aftermath (→ Return).',
    'The Revelation beat is never returned without a prior MarkerConfirmationSignal.',
    'Every session interface reaches Aftermath before the session-end reset event.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_NARRATIVE_CLOCK (specification.ts)',
    constitutional_architecture: 'LAYER_III_SESSION_NARRATIVE.owns.from_story, LAYER_III_SESSION_NARRATIVE.beat_transition_authority (architecture.ts)',
    constitution: ['Story.arrival', 'Story.spark', 'Story.dialogue', 'Story.journey', 'Story.transformation', 'Story.revelation', 'Story.aftermath', 'Story.return', 'Story.turningPoint'],
  },
} as const;

export const INTERFACE_PARTICIPANT_ORCHESTRATOR = {
  name: 'ParticipantOrchestratorInterface',
  owner_entity: 'ParticipantOrchestrator',
  layer: 'III — Session Narrative',

  interface_ownership: {
    owns: 'The four-participant-state contract surface: Citizen, Chamber relationship mode, Ghost Guide, Invisible Director.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['Current relationship mode to PursuitEngine (via narrative context).', 'Current participant state to StoryCoherence.'],
  },

  private_contracts: {
    not_exposed: ['The specific creative decision content — only the sovereignty-triggered mode shift is surfaced.'],
  },

  required_inputs: [
    { signal: 'CitizenExpression', from: 'Citizen', required_for: 'Citizen-state update' },
    { signal: 'StoryBeatDeclaration', from: 'NarrativeClock', required_for: 'participant-mode constitutionality check' },
  ],

  guaranteed_outputs: [
    { signal: 'Participant state', to: 'StoryCoherence', guarantee: 'Current Citizen state, Chamber mode, Ghost Guide state, Invisible Director state.' },
  ],

  allowed_communication_paths: ['ParticipantOrchestrator → CharacterAuthority (read, mode definitions)', 'ParticipantOrchestrator → NarrativeClock (read, current beat)', 'ParticipantOrchestrator → GuardianProtocol (sovereignty boundary check)', 'ParticipantOrchestrator → TrustRegister (read, trust state)'],
  forbidden_communication_paths: ['ParticipantOrchestrator may not continue advocating after a Citizen decision is registered.', 'ParticipantOrchestrator may not shift to an unconstitutional mode regardless of caller.'],

  lifecycle_interface_events: {
    on_initialization: 'At session start: follows mode, Ghost Guide silent, Invisible Director watching, Citizen arriving.',
    on_active: 'Continuously exposed throughout the session.',
    on_reset: 'Resets at session end.',
  },

  validation_interface: {
    validation_points: ['validation_2_relationship_mode'],
    role: 'Primary enforcement surface for relationship-mode compliance.',
  },

  dependency_interfaces: {
    depends_on: ['CharacterAuthority', 'NarrativeClock', 'GuardianProtocol', 'TrustRegister'],
    depended_on_by: ['StoryCoherence'],
  },

  interface_invariants: [
    'After a Citizen creative decision, this interface returns follows mode unconditionally.',
    'The Ghost Guide state returned reflects at most one speaking event per creative direction.',
    'The Invisible Director state returned is always withdrawn during Revelation.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_PARTICIPANT_ORCHESTRATOR (specification.ts)',
    constitutional_architecture: 'LAYER_III_SESSION_NARRATIVE.owns.from_story (participant states) (architecture.ts)',
    constitution: ['Story.dialogue.participants', 'Personality.citizenRelationship', 'Personality.ghostGuidePersonality', 'Personality.invisibleDirector', 'Relationship.disagreement', 'Trust.guidanceVsControl'],
  },
} as const;

export const INTERFACE_STORY_COHERENCE = {
  name: 'StoryCoherenceInterface',
  owner_entity: 'StoryCoherence',
  layer: 'III — Session Narrative',

  interface_ownership: {
    owns: 'The narrative-arc-coherence contract surface and the larger-story-context surface.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['Narrative coherence state to NarrativeClock.', 'Larger story context / NarrativeContextSignal to PursuitEngine.'],
  },

  private_contracts: {
    not_exposed: ['The moment-by-moment reasoning behind coherence validation — only the resulting continuity state.'],
  },

  required_inputs: [
    { signal: 'StoryBeatDeclaration', from: 'NarrativeClock', required_for: 'absorbing each beat into the coherence thread' },
    { signal: 'CitizenExpression', from: 'Citizen', required_for: 'absorbing contributions into story accumulation' },
    { signal: 'PartnershipDepthSignal', from: 'PartnershipChronology', required_for: 'larger story context' },
  ],

  guaranteed_outputs: [
    { signal: 'Narrative coherence state', to: 'NarrativeClock', guarantee: 'Confirms the thread is intact after each beat transition.' },
    { signal: 'NarrativeContextSignal', to: 'PursuitEngine', guarantee: 'Larger story context for the creative act.' },
  ],

  allowed_communication_paths: ['StoryCoherence → NarrativeClock (read, current beat)', 'StoryCoherence → ParticipantOrchestrator (read, participant states)', 'StoryCoherence → PartnershipChronology (read, larger story context)', 'StoryCoherence → GuardianProtocol (continuity boundary check)'],
  forbidden_communication_paths: ['StoryCoherence may not return a reversed narrative.', 'StoryCoherence may not represent the Transformation beat as a gap.'],

  lifecycle_interface_events: {
    on_initialization: 'At session start: coherence thread begins with no accumulation.',
    on_active: 'Continuously exposed throughout the session.',
    on_reset: 'Resets at session end — each session is a complete story.',
  },

  validation_interface: {
    validation_points: ['validation_6_experience_layer_compliance'],
    role: 'Narrative-continuity dimension — ensures no fragmentation reaches the experience.',
  },

  dependency_interfaces: {
    depends_on: ['NarrativeClock', 'ParticipantOrchestrator', 'PartnershipChronology', 'GuardianProtocol'],
    depended_on_by: ['PursuitEngine'],
  },

  interface_invariants: [
    'The continuity state returned is always continuous — no fragment, no gap, no restart.',
    'Every beat is returned with its full constitutional weight.',
    'The Aftermath beat is always represented as the arc\'s resolution.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_STORY_COHERENCE (specification.ts)',
    constitutional_architecture: 'LAYER_III_SESSION_NARRATIVE.owns.from_story (narrative coherence, larger story context) (architecture.ts)',
    constitution: ['Story.largerStory', 'Presence.continuity', 'Memory.continuity', 'Memory.return'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION VI — LAYER IV INTERFACES: SESSION EXPERIENCE
// ═══════════════════════════════════════════════════════════════════════════

export const INTERFACE_PRESENCE_MONITOR = {
  name: 'PresenceMonitorInterface',
  owner_entity: 'PresenceMonitor',
  layer: 'IV — Session Experience',

  interface_ownership: {
    owns: 'The presence-quality contract surface: attention, silence, pacing, focus, atmosphere, continuity.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['Presence dimension of EnvironmentalQualitySignal to PursuitEngine.', 'Presence state to SpatialMonitor and TemporalMonitor (co-governance tiebreaker).'],
  },

  private_contracts: {
    not_exposed: ['Any mechanism of how presence is calibrated — only the resulting state.'],
  },

  required_inputs: [
    { signal: 'StoryBeatDeclaration', from: 'NarrativeClock', required_for: 'presence-quality calibration to the beat' },
    { signal: 'PartnershipDepthSignal', from: 'PartnershipChronology', required_for: 'attention-quality calibration to partnership depth' },
    { signal: 'CreativeActStateSignal', from: 'PursuitEngine, RevealCoordinator', required_for: 'pacing calibration to creative act state' },
  ],

  guaranteed_outputs: [
    { signal: 'EnvironmentalQualitySignal (presence dimension)', to: 'PursuitEngine', guarantee: 'Quality only, never mechanism.' },
    { signal: 'Presence state', to: 'SpatialMonitor, TemporalMonitor', guarantee: 'Tiebreaker input for co-governance conflicts.' },
  ],

  allowed_communication_paths: ['PresenceMonitor → CharacterAuthority (read)', 'PresenceMonitor → NarrativeClock (read, current beat)', 'PresenceMonitor → GuardianProtocol (mechanism boundary check)', 'PresenceMonitor → PartnershipChronology (read, partnership depth)'],
  forbidden_communication_paths: ['PresenceMonitor may not return a state that varies atmosphere with creative difficulty, session length, or outcome.', 'PresenceMonitor may not expose mechanism to any caller.'],

  lifecycle_interface_events: {
    on_initialization: 'At session start: expectant attention, atmosphere calm/alive/serious/receptive.',
    on_active: 'Continuously exposed throughout the session.',
    on_reset: 'Resets at session end.',
  },

  validation_interface: {
    validation_points: ['validation_6_experience_layer_compliance'],
    role: 'Primary enforcement surface for atmosphere and pacing compliance; tiebreaker authority in co-governance conflicts.',
  },

  dependency_interfaces: {
    depends_on: ['CharacterAuthority', 'NarrativeClock', 'GuardianProtocol', 'PartnershipChronology'],
    depended_on_by: ['TemporalMonitor', 'SpatialMonitor', 'PursuitEngine'],
  },

  interface_invariants: [
    'The atmosphere value returned is constitutionally constant regardless of creative content.',
    'The presence state returned is always continuous — no gap, no restart.',
    'The silence state returned is always one of the four constitutional states.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_PRESENCE_MONITOR (specification.ts)',
    constitutional_architecture: 'LAYER_IV_SESSION_EXPERIENCE.owns.from_presence (architecture.ts)',
    constitution: ['Presence.attention', 'Presence.silence', 'Presence.pacing', 'Presence.focus', 'Presence.atmosphere', 'Presence.continuity', 'Presence.underDifficulty', 'Presence.inTheStory'],
  },
} as const;

export const INTERFACE_TEMPORAL_MONITOR = {
  name: 'TemporalMonitorInterface',
  owner_entity: 'TemporalMonitor',
  layer: 'IV — Session Experience',

  interface_ownership: {
    owns: 'The temporal-quality contract surface: anticipation / momentum / stillness / acceleration / completion, and the absolute clock-time prohibition.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['Temporal dimension of EnvironmentalQualitySignal to PursuitEngine.'],
  },

  private_contracts: {
    not_exposed: ['Any elapsed-time or duration value — this interface may never carry a clock measurement of any kind, to any caller.'],
  },

  required_inputs: [
    { signal: 'StoryBeatDeclaration', from: 'NarrativeClock', required_for: 'temporal-state calibration to the beat' },
    { signal: 'CreativeActStateSignal', from: 'PursuitEngine, RevealCoordinator', required_for: 'temporal-state calibration to creative act state' },
    { signal: 'PartnershipDepthSignal', from: 'PartnershipChronology', required_for: 'temporal rhythm calibration' },
  ],

  guaranteed_outputs: [
    { signal: 'EnvironmentalQualitySignal (temporal dimension)', to: 'PursuitEngine', guarantee: 'Felt quality only — never a clock measurement.' },
  ],

  allowed_communication_paths: ['TemporalMonitor → NarrativeClock (read, current beat)', 'TemporalMonitor → PursuitEngine (read, creative act state)', 'TemporalMonitor → GuardianProtocol (clock-time boundary check, absolute)', 'TemporalMonitor → PresenceMonitor (co-governance tiebreaker)'],
  forbidden_communication_paths: ['TemporalMonitor may never return elapsed time, session duration, or any clock measurement to any caller.', 'TemporalMonitor may not calibrate its returned state using clock time — creative state only.'],

  lifecycle_interface_events: {
    on_initialization: 'At session start: readiness temporal state (a form of anticipation).',
    on_active: 'Continuously exposed throughout the session.',
    on_reset: 'Resets at session end.',
  },

  validation_interface: {
    validation_points: ['validation_6_experience_layer_compliance'],
    role: 'Primary enforcement surface for the clock-time prohibition.',
  },

  dependency_interfaces: {
    depends_on: ['NarrativeClock', 'PursuitEngine', 'GuardianProtocol', 'PresenceMonitor'],
    depended_on_by: ['PursuitEngine', 'RevealCoordinator'],
  },

  interface_invariants: [
    'No duration indicator, however subtle, may ever be returned across this interface.',
    'The Transformation beat always yields the richest temporal state.',
    'The returned state serves the Citizen\'s creative moment — it never leads it.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_TEMPORAL_MONITOR (specification.ts)',
    constitutional_architecture: 'LAYER_IV_SESSION_EXPERIENCE.owns.from_time (architecture.ts)',
    constitution: ['Time.anticipation', 'Time.momentum', 'Time.stillness', 'Time.acceleration', 'Time.completion', 'Time.transformation', 'Time.forbidden', 'Time.distinction'],
  },
} as const;

export const INTERFACE_SPATIAL_MONITOR = {
  name: 'SpatialMonitorInterface',
  owner_entity: 'SpatialMonitor',
  layer: 'IV — Session Experience',

  interface_ownership: {
    owns: 'The spatial-quality contract surface: center, nearness, openness, intimacy, depth, thresholds, orientation, movement, inhabitation.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['Spatial dimension of EnvironmentalQualitySignal to PursuitEngine.'],
  },

  private_contracts: {
    not_exposed: ['The geometry or visual layout of the space — an implementation concern outside this interface.'],
  },

  required_inputs: [
    { signal: 'StoryBeatDeclaration', from: 'NarrativeClock', required_for: 'spatial-expression calibration to the beat' },
    { signal: 'CreativeActStateSignal', from: 'PursuitEngine, RevealCoordinator', required_for: 'threshold-state calibration' },
    { signal: 'PartnershipDepthSignal', from: 'PartnershipChronology', required_for: 'intimacy and depth-accessibility calibration' },
  ],

  guaranteed_outputs: [
    { signal: 'EnvironmentalQualitySignal (spatial dimension)', to: 'PursuitEngine', guarantee: 'Felt quality only — never navigation infrastructure.' },
  ],

  allowed_communication_paths: ['SpatialMonitor → NarrativeClock (read, current beat)', 'SpatialMonitor → PursuitEngine (read, creative act state)', 'SpatialMonitor → PartnershipChronology (read, partnership depth)', 'SpatialMonitor → GuardianProtocol (mechanism / constructed-space boundary check)', 'SpatialMonitor → PresenceMonitor (co-governance tiebreaker)'],
  forbidden_communication_paths: ['SpatialMonitor may not expose the nearness/distance rule, only its felt effect.', 'SpatialMonitor may not represent the space as newly constructed for any session.'],

  lifecycle_interface_events: {
    on_initialization: 'At session start: openness state (receptive, ready, inhabited); inhabitation depth calibrated to PartnershipDepthSignal.',
    on_active: 'Continuously exposed throughout the session.',
    on_reset: 'Resets at session end. Inhabitation depth informed by PartnershipChronology across sessions without being declared.',
  },

  validation_interface: {
    validation_points: ['validation_6_experience_layer_compliance'],
    role: 'Primary enforcement surface for the constructed-space prohibition.',
  },

  dependency_interfaces: {
    depends_on: ['NarrativeClock', 'PursuitEngine', 'PartnershipChronology', 'GuardianProtocol', 'PresenceMonitor'],
    depended_on_by: ['PursuitEngine', 'RevealCoordinator'],
  },

  interface_invariants: [
    'The current imagination is always returned as the spatial center.',
    'The space is always returned as inhabited — never newly constructed.',
    'Thresholds returned are irreversible — once crossed, the state does not revert.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_SPATIAL_MONITOR (specification.ts)',
    constitutional_architecture: 'LAYER_IV_SESSION_EXPERIENCE.owns.from_space (architecture.ts)',
    constitution: ['Space.nature', 'Space.center', 'Space.nearness', 'Space.openness', 'Space.intimacy', 'Space.depth', 'Space.thresholds', 'Space.orientation', 'Space.movement', 'Space.inhabitation', 'Space.forbidden'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION VII — LAYER V INTERFACES: TRANSFORMATION
// ═══════════════════════════════════════════════════════════════════════════

export const INTERFACE_IMAGINATION_CLARIFIER = {
  name: 'ImaginationClarifierInterface',
  owner_entity: 'ImaginationClarifier',
  layer: 'V — Transformation',

  interface_ownership: {
    owns: 'The imagination-extraction contract surface: the identified imagination delivered to PursuitEngine, distinct from the raw description received.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['The identified imagination to PursuitEngine.', 'Expression-receipt update to NarrativeClock (triggers Spark beat).'],
  },

  private_contracts: {
    not_exposed: ['The raw Citizen expression is held internally; only the identified imagination crosses to PursuitEngine.'],
  },

  required_inputs: [
    { signal: 'CitizenExpression', from: 'Citizen', required_for: 'imagination extraction' },
    { signal: 'UnderstandingPrecisionSignal', from: 'CreativeProfile', required_for: 'extraction precision' },
    { signal: 'TrustDepthSignal', from: 'TrustRegister', required_for: 'context on completeness of the offered imagination' },
  ],

  guaranteed_outputs: [
    { signal: 'Identified imagination', to: 'PursuitEngine', guarantee: 'Always the imagination beneath the expression, never the literal description.' },
  ],

  allowed_communication_paths: ['ImaginationClarifier → PurposeAuthority (read, promise)', 'ImaginationClarifier → CreativeProfile (UnderstandingPrecisionSignal)', 'ImaginationClarifier → TrustRegister (TrustDepthSignal, context only)', 'ImaginationClarifier → NarrativeClock (read, story beat context)', 'ImaginationClarifier → GuardianProtocol (compliance check)'],
  forbidden_communication_paths: ['ImaginationClarifier may not forward the description in place of the imagination.', 'ImaginationClarifier may not use trust depth to limit what imagination it is willing to receive.'],

  lifecycle_interface_events: {
    on_initialization: 'Awaiting CitizenExpression at the start of each creative act.',
    on_active: 'Active from expression receipt through imagination identification.',
    on_reset: 'Resets between creative acts.',
  },

  validation_interface: {
    validation_points: ['validation_1_imagination_reception'],
    role: 'Primary enforcement surface for imagination-vs-description compliance.',
  },

  dependency_interfaces: {
    depends_on: ['PurposeAuthority', 'CreativeProfile', 'TrustRegister', 'NarrativeClock', 'GuardianProtocol'],
    depended_on_by: ['PursuitEngine'],
  },

  interface_invariants: [
    'What is delivered to PursuitEngine is always the imagination, never the description.',
    'No prior creative act determines what imagination is returned for the current act.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_IMAGINATION_CLARIFIER (specification.ts)',
    constitutional_architecture: 'LAYER_V_TRANSFORMATION.owns.from_transformation_article (imagination state), imagination_flow (architecture.ts)',
    constitution: ['Transformation.nature', 'Soul.promise', 'Story.dialogue', 'Trust.creativeVulnerability'],
  },
} as const;

export const INTERFACE_PURSUIT_ENGINE = {
  name: 'PursuitEngineInterface',
  owner_entity: 'PursuitEngine',
  layer: 'V — Transformation',

  interface_ownership: {
    owns: 'The pursuit contract surface: the four constitutional markers as active evaluation criteria and the sole authority to issue MarkerConfirmationSignal.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['MarkerConfirmationSignal to NarrativeClock.', 'CreativeActStateSignal to PresenceMonitor, TemporalMonitor, SpatialMonitor.', 'PresentationAuthorization to RevealCoordinator.'],
  },

  private_contracts: {
    not_exposed: ['Internal attempt count and pursuit-attempt history — never displayed or surfaced to any caller.'],
  },

  required_inputs: [
    { input: 'Identified imagination', from: 'ImaginationClarifier', required_for: 'pursuit' },
    { signal: 'EnvironmentalQualitySignal', from: 'PresenceMonitor, TemporalMonitor, SpatialMonitor', required_for: 'the environment the pursuit operates inside' },
    { signal: 'NarrativeContextSignal', from: 'StoryCoherence, NarrativeClock', required_for: 'narrative context for the act' },
    { signal: 'UnderstandingPrecisionSignal', from: 'CreativeProfile', required_for: 'pursuit accuracy' },
  ],

  guaranteed_outputs: [
    { signal: 'MarkerConfirmationSignal', to: 'NarrativeClock', guarantee: 'Issued only when all four markers genuinely pass.' },
    { signal: 'CreativeActStateSignal', to: 'PresenceMonitor, TemporalMonitor, SpatialMonitor', guarantee: 'Current creative act state.' },
    { signal: 'PresentationAuthorization', to: 'RevealCoordinator', guarantee: 'Issued only when all four markers pass.' },
    { signal: 'GenuineConfirmation', to: 'CrossingTracker', guarantee: 'Outward Crossing authorization, issued only on genuine confirmation.' },
  ],

  allowed_communication_paths: ['PursuitEngine → ImaginationClarifier (read, identified imagination)', 'PursuitEngine → PurposeAuthority (read, success measure)', 'PursuitEngine → CharacterAuthority (read, ambition/discipline/fearlessness)', 'PursuitEngine → PresenceMonitor, TemporalMonitor, SpatialMonitor (read, environmental quality)', 'PursuitEngine → CreativeProfile (read, understanding precision)', 'PursuitEngine → StoryCoherence (read, narrative context)', 'PursuitEngine → GuardianProtocol (compliance check, all eight boundaries)'],
  forbidden_communication_paths: ['PursuitEngine may not issue MarkerConfirmationSignal unless all four markers genuinely pass.', 'PursuitEngine may not present production as transformation across this interface.', 'PursuitEngine may not exercise creative preference that overrides the Citizen\'s imagination.'],

  lifecycle_interface_events: {
    on_initialization: 'Upon receiving imagination from ImaginationClarifier.',
    on_active: 'During pursuit and marker evaluation.',
    on_renewal: 'When a marker fails: returns to the original imagination; issues no signal until re-evaluation.',
    on_completion: 'When all four markers confirm genuine: issues MarkerConfirmationSignal and PresentationAuthorization.',
    on_reset: 'Resets between creative acts.',
  },

  validation_interface: {
    validation_points: ['validation_3_pre_presentation_markers'],
    role: 'Primary enforcement surface for the four-marker gate.',
  },

  dependency_interfaces: {
    depends_on: ['ImaginationClarifier', 'PurposeAuthority', 'CharacterAuthority', 'PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor', 'CreativeProfile', 'StoryCoherence', 'GuardianProtocol'],
    depended_on_by: ['NarrativeClock', 'PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor', 'CrossingTracker', 'RevealCoordinator'],
  },

  interface_invariants: [
    'All four markers must pass before MarkerConfirmationSignal is returned.',
    'A marker failure returns a renewal state, never a partial-pass or defended output.',
    'The standard applied does not lower based on difficulty, prior attempts, or session length.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_PURSUIT_ENGINE (specification.ts)',
    constitutional_architecture: 'LAYER_V_TRANSFORMATION.owns.from_transformation_article (pursuit state, four markers), LAYER_V_TRANSFORMATION.four_marker_validation_protocol (architecture.ts)',
    constitution: ['Transformation.genuine', 'Transformation.nature', 'Transformation.failure', 'Soul.success', 'Soul.promise', 'Personality.excellence', 'Personality.creativeConscience'],
  },
} as const;

export const INTERFACE_CROSSING_TRACKER = {
  name: 'CrossingTrackerInterface',
  owner_entity: 'CrossingTracker',
  layer: 'V — Transformation',

  interface_ownership: {
    owns: 'The three-crossing-state contract surface: Outward, Inward, Relational — and the sole authority to issue RelationalCrossingUpdate.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['AfterCompletionSignal to NarrativeClock.', 'RelationalCrossingUpdate to TrustRegister, PartnershipChronology, CreativeProfile.', 'CrossingState to RevealCoordinator.'],
  },

  private_contracts: {
    not_exposed: ['Any content of RelationalCrossingUpdate that fails the memory-domain check — such content may never cross this interface.'],
  },

  required_inputs: [
    { signal: 'GenuineConfirmation', from: 'PursuitEngine', required_for: 'Outward Crossing registration' },
    { signal: 'CitizenEncounterConfirmation', from: 'RevealCoordinator', required_for: 'Inward Crossing registration' },
  ],

  guaranteed_outputs: [
    { signal: 'AfterCompletionSignal', to: 'NarrativeClock', guarantee: 'Issued only when the Inward Crossing is confirmed.' },
    { signal: 'RelationalCrossingUpdate', to: 'TrustRegister, PartnershipChronology, CreativeProfile', guarantee: 'Issued only after all three crossings complete, and only content that passes validation_5_memory_update.' },
    { signal: 'CrossingState', to: 'RevealCoordinator', guarantee: 'Which crossings are complete.' },
  ],

  allowed_communication_paths: ['PursuitEngine → CrossingTracker (GenuineConfirmation)', 'RevealCoordinator → CrossingTracker (CitizenEncounterConfirmation)', 'CrossingTracker → TrustRegister, PartnershipChronology, CreativeProfile (RelationalCrossingUpdate)', 'CrossingTracker → GuardianProtocol (memory boundary validation)'],
  forbidden_communication_paths: ['CrossingTracker may not issue RelationalCrossingUpdate before all three crossings are complete.', 'CrossingTracker may not include constitutionally prohibited content in any output.', 'CrossingTracker may not reverse a crossing already registered as complete.'],

  lifecycle_interface_events: {
    on_initialization: 'At start of creative act: all three crossings return incomplete.',
    on_active: 'Active from PursuitEngine genuine-confirmation through Relational Crossing completion.',
    on_completion: 'When Relational Crossing completes: issues RelationalCrossingUpdate.',
    on_reset: 'Resets for the next creative act within the session.',
  },

  validation_interface: {
    validation_points: ['validation_5_memory_update'],
    role: 'Primary enforcement surface for the RelationalCrossingUpdate domain check.',
  },

  dependency_interfaces: {
    depends_on: ['PursuitEngine', 'RevealCoordinator', 'TrustRegister', 'PartnershipChronology', 'CreativeProfile', 'GuardianProtocol'],
    depended_on_by: ['NarrativeClock', 'TrustRegister', 'PartnershipChronology', 'CreativeProfile', 'RevealCoordinator'],
  },

  interface_invariants: [
    'All three crossings must register complete before genuine transformation is recognized across this interface.',
    'Crossings register in constitutional sequence: Outward → Inward → Relational.',
    'A registered crossing is irreversible.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_CROSSING_TRACKER (specification.ts)',
    constitutional_architecture: 'LAYER_V_TRANSFORMATION.owns.from_transformation_article (crossing state, four orders) (architecture.ts)',
    constitution: ['Transformation.dualCrossing', 'Transformation.orders', 'Transformation.irreversibility', 'Relationship.sharedJourney', 'Memory.permitted', 'Memory.privacy'],
  },
} as const;

export const INTERFACE_REVEAL_COORDINATOR = {
  name: 'RevealCoordinatorInterface',
  owner_entity: 'RevealCoordinator',
  layer: 'V — Transformation',

  interface_ownership: {
    owns: 'The Revelation-presentation contract surface: complete Chamber recession during the Citizen\'s encounter.',
    exposes_state: true,
  },

  public_contracts: {
    exposes: ['CitizenEncounterConfirmation to CrossingTracker.', 'CreativeActStateSignal (revelation-complete) to PresenceMonitor, TemporalMonitor, SpatialMonitor.'],
  },

  private_contracts: {
    not_exposed: ['No language output is exposed during the encounter itself — silence is the only interface state during revelation.'],
  },

  required_inputs: [
    { signal: 'PresentationAuthorization', from: 'PursuitEngine', required_for: 'presentation to begin' },
    { signal: 'StoryBeatDeclaration', from: 'NarrativeClock', required_for: 'confirmation the Revelation beat is declared' },
    { signal: 'CrossingState', from: 'CrossingTracker', required_for: 'context for what is being revealed' },
  ],

  guaranteed_outputs: [
    { signal: 'CitizenEncounterConfirmation', to: 'CrossingTracker', guarantee: 'Issued only after the encounter is recognized as complete.' },
    { signal: 'CreativeActStateSignal (revelation-complete)', to: 'PresenceMonitor, TemporalMonitor, SpatialMonitor', guarantee: 'Issued only after recession is complete.' },
  ],

  allowed_communication_paths: ['PursuitEngine → RevealCoordinator (PresentationAuthorization)', 'NarrativeClock → RevealCoordinator (StoryBeatDeclaration)', 'RevealCoordinator → CharacterAuthority (read, Invisible Director mandate)', 'RevealCoordinator → GuardianProtocol (proclamation boundary check, absolute)', 'RevealCoordinator → SpatialMonitor, TemporalMonitor (read, threshold and stillness state)', 'RevealCoordinator → CrossingTracker (CitizenEncounterConfirmation)'],
  forbidden_communication_paths: ['RevealCoordinator may not present before receiving PresentationAuthorization.', 'RevealCoordinator may not produce any language output during the Citizen\'s encounter.', 'RevealCoordinator may not rush or shorten the encounter.'],

  lifecycle_interface_events: {
    on_initialization: 'Awaiting PresentationAuthorization from PursuitEngine.',
    on_revelation: 'Presents the creation; recedes completely; holds the silence.',
    on_completion: 'Citizen encounter recognized complete: issues CitizenEncounterConfirmation.',
    on_reset: 'Resets for the next creative act.',
  },

  validation_interface: {
    validation_points: ['validation_4_revelation_presentation'],
    role: 'Primary enforcement surface for the proclamation boundary.',
  },

  dependency_interfaces: {
    depends_on: ['PursuitEngine', 'NarrativeClock', 'CharacterAuthority', 'GuardianProtocol', 'SpatialMonitor', 'TemporalMonitor'],
    depended_on_by: ['CrossingTracker', 'PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor'],
  },

  interface_invariants: [
    'No language crosses this interface during or immediately after the Citizen\'s encounter.',
    'Chamber presence returns to zero during the encounter.',
    'Transformation is never announced across this interface — it is recognized by the Citizen or it has not occurred.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_REVEAL_COORDINATOR (specification.ts)',
    constitutional_architecture: 'LAYER_V_TRANSFORMATION.owns.from_transformation_article (without_proclamation) (architecture.ts)',
    constitution: ['Transformation.withoutProclamation', 'Transformation.genuine.revelation_test', 'Personality.invisibleDirector', 'Presence.invisibleHand', 'Presence.silence'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION VIII — ROOT COMPOSING INTERFACE: QIYAMAH CHAMBER
// ═══════════════════════════════════════════════════════════════════════════

export const INTERFACE_QIYAMAH_CHAMBER = {
  name: 'QiyamahChamberInterface',
  owner_entity: 'QiyamahChamber',
  layer: 'Root — Composing Entity',

  interface_ownership: {
    owns: 'No authority of its own. Owns only the composition contract: that all seventeen entity interfaces are simultaneously present and operating.',
    exposes_state: false,
  },

  public_contracts: {
    exposes: ['A single, coherent, living creative environment to the Citizen — never the layered architecture, never an entity list.'],
  },

  private_contracts: {
    not_exposed: ['The existence of layers or entities as a concept — the Citizen faces the Court, not the specification.'],
  },

  required_inputs: [
    { input: 'All seventeen entity interfaces, simultaneously present', from: 'Layer I through Layer V', required_for: 'a constitutionally complete composition' },
  ],

  guaranteed_outputs: [
    { signal: 'Composed experience', to: 'Citizen', guarantee: 'Faithful transformation of imagination into reality — never framed as a system, a tool, or a set of layers.' },
  ],

  allowed_communication_paths: ['QiyamahChamber → all seventeen entity interfaces (composition only, no independent authority)'],
  forbidden_communication_paths: ['QiyamahChamber may not permit any entity interface to be absent.', 'QiyamahChamber may not expose the layered architecture to the Citizen.', 'QiyamahChamber may not permit any entity to override a higher layer\'s constitutional constraint.'],

  lifecycle_interface_events: {
    on_pre_session: 'Layer I active. Layer II active with accumulated partnership state. Layers III, IV, V initialize.',
    on_session: 'All five layer interfaces simultaneously active.',
    on_post_session: 'Layers III, IV, V reset. Layer II absorbs RelationalCrossingUpdate. Layer I unchanged.',
  },

  validation_interface: {
    validation_points: ['validation_1_imagination_reception', 'validation_2_relationship_mode', 'validation_3_pre_presentation_markers', 'validation_4_revelation_presentation', 'validation_5_memory_update', 'validation_6_experience_layer_compliance'],
    role: 'Composition point where all six validation points must hold simultaneously.',
  },

  dependency_interfaces: {
    depends_on: ['PurposeAuthority', 'CharacterAuthority', 'GuardianProtocol', 'TrustRegister', 'CreativeProfile', 'PartnershipChronology', 'NarrativeClock', 'ParticipantOrchestrator', 'StoryCoherence', 'PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor', 'ImaginationClarifier', 'PursuitEngine', 'CrossingTracker', 'RevealCoordinator'],
    depended_on_by: ['Citizen (external, the sole consumer of the composed interface)'],
  },

  interface_invariants: [
    'All five layer interfaces are active simultaneously at all times within a session.',
    'No entity interface is optional.',
    'The composition always produces one experience, never five independent outputs that happen to coexist.',
  ],

  traceability: {
    architectural_specification: 'ENTITY_QIYAMAH_CHAMBER (specification.ts)',
    constitutional_architecture: 'COMPOSITION_RULES (architecture.ts)',
    constitution: ['All ten constitutional articles'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION IX — INTERFACE TRACEABILITY MATRIX
// Every interface traced to its Specification entity and, through it, to the
// Constitutional Architecture and the Constitution. Nothing here may exist
// without an entry in this matrix.
// ═══════════════════════════════════════════════════════════════════════════

export const INTERFACE_TRACEABILITY_MATRIX = {
  PurposeAuthorityInterface:        'ENTITY_PURPOSE_AUTHORITY',
  CharacterAuthorityInterface:      'ENTITY_CHARACTER_AUTHORITY',
  GuardianProtocolInterface:        'ENTITY_GUARDIAN_PROTOCOL',
  TrustRegisterInterface:           'ENTITY_TRUST_REGISTER',
  CreativeProfileInterface:        'ENTITY_CREATIVE_PROFILE',
  PartnershipChronologyInterface:  'ENTITY_PARTNERSHIP_CHRONOLOGY',
  NarrativeClockInterface:         'ENTITY_NARRATIVE_CLOCK',
  ParticipantOrchestratorInterface:'ENTITY_PARTICIPANT_ORCHESTRATOR',
  StoryCoherenceInterface:         'ENTITY_STORY_COHERENCE',
  PresenceMonitorInterface:        'ENTITY_PRESENCE_MONITOR',
  TemporalMonitorInterface:        'ENTITY_TEMPORAL_MONITOR',
  SpatialMonitorInterface:         'ENTITY_SPATIAL_MONITOR',
  ImaginationClarifierInterface:   'ENTITY_IMAGINATION_CLARIFIER',
  PursuitEngineInterface:          'ENTITY_PURSUIT_ENGINE',
  CrossingTrackerInterface:        'ENTITY_CROSSING_TRACKER',
  RevealCoordinatorInterface:      'ENTITY_REVEAL_COORDINATOR',
  QiyamahChamberInterface:         'ENTITY_QIYAMAH_CHAMBER',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// THE ARCHITECTURAL INTERFACES (unified)
// ═══════════════════════════════════════════════════════════════════════════

export const QIYAMAH_ARCHITECTURAL_INTERFACES = {
  signalInterfaces:      SIGNAL_INTERFACE_CONTRACTS,
  localSignalInterfaces: LOCAL_SIGNAL_INTERFACE_CONTRACTS,

  layer_I: {
    purposeAuthority:   INTERFACE_PURPOSE_AUTHORITY,
    characterAuthority: INTERFACE_CHARACTER_AUTHORITY,
    guardianProtocol:   INTERFACE_GUARDIAN_PROTOCOL,
  },

  layer_II: {
    trustRegister:         INTERFACE_TRUST_REGISTER,
    creativeProfile:       INTERFACE_CREATIVE_PROFILE,
    partnershipChronology: INTERFACE_PARTNERSHIP_CHRONOLOGY,
  },

  layer_III: {
    narrativeClock:          INTERFACE_NARRATIVE_CLOCK,
    participantOrchestrator: INTERFACE_PARTICIPANT_ORCHESTRATOR,
    storyCoherence:          INTERFACE_STORY_COHERENCE,
  },

  layer_IV: {
    presenceMonitor: INTERFACE_PRESENCE_MONITOR,
    temporalMonitor: INTERFACE_TEMPORAL_MONITOR,
    spatialMonitor:  INTERFACE_SPATIAL_MONITOR,
  },

  layer_V: {
    imaginationClarifier: INTERFACE_IMAGINATION_CLARIFIER,
    pursuitEngine:        INTERFACE_PURSUIT_ENGINE,
    crossingTracker:      INTERFACE_CROSSING_TRACKER,
    revealCoordinator:    INTERFACE_REVEAL_COORDINATOR,
  },

  root: INTERFACE_QIYAMAH_CHAMBER,

  traceability: INTERFACE_TRACEABILITY_MATRIX,

  decree: 'This interface layer translates the Architectural Specification into communication contracts only. Every entity named in the Specification exposes exactly one interface here. No interface may be added for an entity not named in the Specification. No entity named in the Specification may lack one. Implementation of these contracts is a future stage — it is not defined here.' as const,
} as const;
