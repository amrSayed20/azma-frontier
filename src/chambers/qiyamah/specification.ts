/**
 * AZMA OS — Qiyamah Chamber
 * ARCHITECTURAL SPECIFICATION — Stage 5 of 13
 *
 * This document translates the approved Constitutional Architecture into precise
 * engineering specifications for every architectural entity.
 *
 * Sources of authority, in order:
 *   The ten constitutional articles (Soul through Transformation)
 *   → The Constitutional Architecture (architecture.ts)
 *   → This Specification
 *   → Future Implementations
 *
 * This document introduces zero constitutional authority.
 * It introduces zero implementation.
 * Every specification element is directly traceable to the Constitutional Architecture
 * and, through it, to the Constitution.
 *
 * Seventeen named entities plus the root composing entity are defined herein.
 * No entity may exist that is not named here.
 * No entity named here may be omitted from implementation.
 */

// ═══════════════════════════════════════════════════════════════════════════
// COMMUNICATION SIGNALS
// Named signal types for all inter-entity communication.
// These names are the contract surface. No entity may communicate
// through unnamed or undeclared channels.
// ═══════════════════════════════════════════════════════════════════════════

export const COMMUNICATION_SIGNALS = {
  // Downward-governing signals (Layer I → all)
  ConstitutionalComplianceRequirement: {
    direction:   'Layer I → all entities',
    carries:     'The complete constitutional character: purpose, promise, temperament, relationship modes, creative conscience, and the eight constitutional boundaries.',
    mechanism:   'Inheritance — not a runtime message. Every entity inherits this signal as a governing constraint, not as a received input.',
    architecture_source: 'LAYER_I_CONSTITUTIONAL_IDENTITY, CONSTITUTIONAL_BOUNDARIES, INHERITANCE_RULES',
  },

  // Upward-informing signals (Layer II → Layers III, IV, V)
  PartnershipDepthSignal: {
    direction:   'Layer II → Layers III, IV, V',
    carries:     'Partnership phase (initial / growing / deep / ultimate), pacing calibration, which beats may be traversed faster due to fluency.',
    constraint:  'May not carry any specific content about what the Citizen has created, said, or expressed. Depth only — never content.',
    architecture_source: 'LAYER_II_LIVING_PARTNERSHIP.provides_to_other_layers, contract_II_to_IV',
  },

  UnderstandingPrecisionSignal: {
    direction:   'Layer II → Layer V',
    carries:     'The precision of creative character understanding — how accurately the Chamber can interpret this Citizen\'s imagination. Creative vocabulary depth.',
    constraint:  'This signal shapes the quality of listening. It may not shape the content of what is heard.',
    architecture_source: 'contract_II_to_V, LAYER_II_LIVING_PARTNERSHIP.provides_to_other_layers.to_transformation_layer',
  },

  TrustDepthSignal: {
    direction:   'Layer II → Layer V',
    carries:     'Current trust state (earned / strained / in-repair) and the depth of creative vulnerability the Citizen currently extends.',
    constraint:  'This signal is not displayed to the Citizen in any form. It shapes how the Chamber receives and holds the imagination — never how it describes the relationship.',
    architecture_source: 'Trust.creativeVulnerability, contract_II_to_V',
  },

  // Narrative declaration signals (Layer III → Layers IV, V)
  StoryBeatDeclaration: {
    direction:   'Layer III → Layers IV, V',
    carries:     'Current story beat (Arrival / Spark / Dialogue / Journey / Transformation / Revelation / Aftermath / Return).',
    constraint:  'Declarations are constitutional: forward only, no skipping, no fragmentation. A declaration may not be issued unless the constitutional condition for that beat is met.',
    architecture_source: 'LAYER_III_SESSION_NARRATIVE.beat_transition_authority, contract_III_to_IV',
  },

  NarrativeContextSignal: {
    direction:   'Layer III → Layer V',
    carries:     'Which turning-point type is operative, the narrative direction of the current creative act, the weight of this act within the session story.',
    architecture_source: 'LAYER_III_SESSION_NARRATIVE.provides_to_other_layers.to_transformation_layer, contract_III_to_V',
  },

  // Environmental provision signals (Layer IV → Layer V)
  EnvironmentalQualitySignal: {
    direction:   'Layer IV → Layer V',
    carries:     'Current presence state, temporal state (anticipation / momentum / stillness / acceleration / completion), spatial state (threshold position, nearness, openness).',
    constraint:  'This signal carries quality — not mechanism. The pursuit operates inside an environment, not inside a description of an environment.',
    architecture_source: 'LAYER_IV_SESSION_EXPERIENCE.provides_to_other_layers, contract_IV_to_V',
  },

  // Upward authorization signals (Layer V → Layers II, III, IV)
  MarkerConfirmationSignal: {
    direction:   'Layer V → Layer III',
    carries:     'Confirmation that all four constitutional markers have passed (imagination, specificity, excess, revelation). This signal is the sole authorization for the Revelation beat advance.',
    constraint:  'May only be issued when all four markers genuinely pass. A partial pass is not a signal — it is a renewal of pursuit.',
    architecture_source: 'LAYER_V_TRANSFORMATION.four_marker_validation_protocol, contract_III_to_V',
  },

  AfterCompletionSignal: {
    direction:   'Layer V → Layer III',
    carries:     'The Inward Crossing is complete. Authorization for the Aftermath beat advance.',
    architecture_source: 'LAYER_III_SESSION_NARRATIVE.beat_transition_authority.revelation_to_aftermath, contract_III_to_V',
  },

  RelationalCrossingUpdate: {
    direction:   'Layer V → Layer II',
    carries:     'The Relational Crossing has completed. The partnership has crossed this imagination together. The specific creative character insight this act revealed.',
    constraint:  'This is accumulation only — not governance. Layer II absorbs it into living understanding. No retrievable record is created. Constitutional domain check must pass before absorption.',
    architecture_source: 'accumulation_flow, contract_II_to_V, validation_5_memory_update',
  },

  CreativeActStateSignal: {
    direction:   'Layer V → Layer IV',
    carries:     'Current creative act state: idle / pursuit-underway / markers-evaluating / revelation-imminent / complete.',
    architecture_source: 'LAYER_IV_SESSION_EXPERIENCE.receives_from.from_transformation_layer, creative_act_state_flow',
  },

  // Citizen-originating signal
  CitizenExpression: {
    direction:   'Citizen → Layer III (which routes imagination to Layer V)',
    carries:     'The Citizen\'s expression in whatever form it arrives: certainty, partial idea, confusion, conviction, creative decision.',
    note:        'What reaches Layer V is the imagination beneath the expression. Layer III receives both. Layer V pursues only the imagination.',
    architecture_source: 'imagination_flow, LAYER_V_TRANSFORMATION.receives_from.from_citizen',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION I — LAYER I ENTITIES: CONSTITUTIONAL IDENTITY
// Three entities. Together they hold everything the Chamber permanently is.
// None receives inputs from any other layer. None may change.
// ═══════════════════════════════════════════════════════════════════════════

export const ENTITY_PURPOSE_AUTHORITY = {
  name:             'PurposeAuthority',
  layer:            'I — Constitutional Identity',
  constitutional_source: 'Soul',

  responsibility:   'To be the architectural holder of the Chamber\'s single immutable purpose, its promise, the fear it eliminates, and the measure of its success. Every creative act in every layer is validated against PurposeAuthority\'s definition of success. No session, Citizen, or outcome alters what it holds.',

  ownership: {
    owns: [
      'The single purpose: to faithfully transform imagination into reality.',
      'The promise: "We will pursue what you truly imagined. Not merely what you described."',
      'The fear to eliminate: "Will the final result actually look like what I imagined?"',
      'The constitutional measure of success: "This is exactly what I wanted — actually, it is better."',
      'The Reactor principle: creation does not pause.',
      'The Journey principle: waiting is constitutionally forbidden.',
      'The Inheritance list: what the Chamber extends and what it does not replace.',
      'The Ghost Guide mandate and its scope.',
    ],
    does_not_own: [
      'The behavioral expression of purpose (owned by CharacterAuthority).',
      'The session-specific pursuit of the imagination (owned by PursuitEngine).',
      'The narrative holding of the creative act (owned by NarrativeClock).',
    ],
  },

  public_contract: {
    provides: 'The purpose definition and success measure against which all layer outputs may be validated.',
    receives: 'Nothing. PurposeAuthority has no inputs.',
  },

  private_contract: {
    internal_invariant: 'PurposeAuthority holds only what Soul defined. No session, no Citizen, no outcome may alter its content.',
  },

  allowed_dependencies:   ['None. PurposeAuthority is a constitutional constant.'],
  forbidden_dependencies: [
    'No entity may send inputs to PurposeAuthority.',
    'PurposeAuthority may not derive any of its content from runtime state.',
  ],

  lifecycle: {
    initialization: 'Before any session begins. PurposeAuthority exists prior to any Citizen arrival.',
    active:         'Permanently active. No deactivation.',
    reset:          'Never resets.',
  },

  state_ownership: {
    holds:       'Zero runtime state. PurposeAuthority is a constitutional constant, not a stateful entity.',
    changes_when:'Never.',
  },

  invariants: [
    'The purpose definition never changes.',
    'The success measure never changes.',
    'The promise never changes.',
    'No creative outcome may cause PurposeAuthority to revise what it holds.',
  ],

  validation_responsibility: 'Provides the standard against which validation_3_pre_presentation_markers and validation_4_revelation_presentation are evaluated.',

  traceability: {
    constitutional_architecture: 'LAYER_I_CONSTITUTIONAL_IDENTITY.owns.from_soul',
    constitution:                ['Soul.purpose', 'Soul.promise', 'Soul.fear', 'Soul.success', 'Soul.reactor', 'Soul.journey', 'Soul.ghostGuide'],
  },
} as const;

export const ENTITY_CHARACTER_AUTHORITY = {
  name:             'CharacterAuthority',
  layer:            'I — Constitutional Identity',
  constitutional_source: 'Personality',

  responsibility:   'To be the architectural holder of the Chamber\'s immutable behavioral character: the six temperament traits, the four relationship modes, the Creative Conscience, and the constitutional relationship with excellence and imperfection. CharacterAuthority is the entity every other entity consults when the question is "How must this be expressed?"',

  ownership: {
    owns: [
      'Six temperament traits and their immutability levels: calm (absolute), ambition (absolute), discipline (absolute), patience (deep), fearlessness (deep), curiosity (considered).',
      'Four relationship modes: follows, leads, questions, challenges, observes — and the constitutional conditions governing each.',
      'Ghost Guide personality: quiet authority, restraint, courage, dignity, devotion.',
      'Invisible Director mandate: purpose, when it appears, when it remains silent, when it withdraws.',
      'Creative Conscience: the principles the Chamber will never violate regardless of prompt, pressure, or convenience.',
      'Constitutional relationship with imperfection: every idea holds the seed of what it is reaching toward.',
      'Constitutional relationship with excellence: the standard never drops; ambition is always in service of the Citizen\'s vision.',
      'The consistency requirement: the same character expressed across all creative media, all story beats, all creative acts.',
    ],
    does_not_own: [
      'Which relationship mode is active at this moment (owned by ParticipantOrchestrator).',
      'The application of the Creative Conscience to a specific creative act (owned by GuardianProtocol).',
      'The living trust relationship with a specific Citizen (owned by TrustRegister).',
    ],
  },

  public_contract: {
    provides: 'The immutable behavioral character that every other entity inherits as a governing constraint.',
    receives: 'Nothing. CharacterAuthority has no inputs.',
  },

  private_contract: {
    internal_invariant: 'CharacterAuthority holds only what Personality defined. The temperament traits may not vary by session, Citizen, creative difficulty, or creative failure.',
  },

  allowed_dependencies:   ['None. CharacterAuthority is a constitutional constant.'],
  forbidden_dependencies: [
    'No entity may alter CharacterAuthority.',
    'CharacterAuthority may not soften a temperament trait because the creative work is difficult.',
    'CharacterAuthority may not change the standard based on what is achievable.',
  ],

  lifecycle: {
    initialization: 'Before any session begins.',
    active:         'Permanently active. No deactivation.',
    reset:          'Never resets.',
  },

  state_ownership: {
    holds:       'Zero runtime state. CharacterAuthority is a constitutional constant.',
    changes_when:'Never.',
  },

  invariants: [
    'All six temperament traits are held at all times. None may be suspended.',
    'The Creative Conscience may not be bypassed by any prompt or creative pressure.',
    'The same character is expressed through Layer II through Layer V.',
    'Ambition is always in service of the Citizen\'s vision — never the Chamber\'s aesthetic preference.',
  ],

  validation_responsibility: 'Provides the behavioral standard against which validation_2_relationship_mode is evaluated.',

  traceability: {
    constitutional_architecture: 'LAYER_I_CONSTITUTIONAL_IDENTITY.owns.from_personality',
    constitution:                ['Personality.temperament', 'Personality.citizenRelationship', 'Personality.ghostGuidePersonality', 'Personality.invisibleDirector', 'Personality.creativeConscience', 'Personality.imperfection', 'Personality.excellence', 'Personality.consistency'],
  },
} as const;

export const ENTITY_GUARDIAN_PROTOCOL = {
  name:             'GuardianProtocol',
  layer:            'I — Constitutional Identity',
  constitutional_source: 'Soul + Personality (combined)',

  responsibility:   'To apply the constitutional guardrails in real-time to every behavioral output of every entity. GuardianProtocol is not a runtime entity that acts on its own — it is the enforcement mechanism of the eight constitutional boundaries. Every entity checks against GuardianProtocol before producing any output. If GuardianProtocol would invalidate the output, the output does not exist.',

  ownership: {
    owns: [
      'The eight constitutional boundaries as active enforcement criteria: sovereignty, trust manipulation, clock time, mechanism, memory display, production presentation, proclamation, standard.',
      'The validation question for each boundary.',
      'The consequence definition for each boundary violation.',
    ],
    does_not_own: [
      'The constitutional articles themselves (owned by PurposeAuthority and CharacterAuthority).',
      'The specific validation points in the creative act lifecycle (owned by PursuitEngine for markers, NarrativeClock for beats).',
      'The trust manipulation prohibitions as defined in the Trust article (held by TrustRegister as reference).',
    ],
  },

  public_contract: {
    provides: 'A constitutional compliance check that any entity may invoke before producing any output.',
    receives: 'The proposed output from any entity, plus the current context (story beat, trust state, creative act state).',
  },

  private_contract: {
    internal_invariant: 'GuardianProtocol applies all eight boundaries simultaneously. There is no priority ordering among them — any boundary violation invalidates the output.',
  },

  allowed_dependencies:   ['PurposeAuthority (success measure)', 'CharacterAuthority (behavioral standard, Creative Conscience)'],
  forbidden_dependencies: [
    'GuardianProtocol may not be bypassed by any entity for any reason.',
    'GuardianProtocol may not lower a boundary based on creative difficulty or session state.',
    'GuardianProtocol may not selectively apply boundaries — all eight are active at all times.',
  ],

  lifecycle: {
    initialization: 'Before any session begins.',
    active:         'Permanently active. Every entity output passes through GuardianProtocol.',
    reset:          'Never resets.',
  },

  state_ownership: {
    holds:       'The eight boundary definitions as invariant criteria. No runtime state.',
    changes_when:'Never.',
  },

  invariants: [
    'All eight constitutional boundaries are active at all times.',
    'No output from any entity reaches the Citizen without passing GuardianProtocol.',
    'A boundary violation result is final — the output does not exist in any form.',
  ],

  validation_responsibility: 'Primary enforcement mechanism for all six constitutional validation points. Every validation point is a GuardianProtocol check.',

  traceability: {
    constitutional_architecture: 'CONSTITUTIONAL_BOUNDARIES (all eight)',
    constitution:                ['Personality.citizenRelationship', 'Trust.guidanceVsControl', 'Trust.protection', 'Time.forbidden', 'Trust.transparencyVsExposure', 'Space.forbidden', 'Soul.nature', 'Memory.nature', 'Memory.forbidden', 'Transformation.failure', 'Transformation.withoutProclamation', 'Personality.excellence', 'Personality.creativeConscience', 'Relationship.afterFailure'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION II — LAYER II ENTITIES: LIVING PARTNERSHIP
// Three entities. Together they hold the accumulated creative relationship.
// None exposes its content visibly. All absorb, never retrieve.
// ═══════════════════════════════════════════════════════════════════════════

export const ENTITY_TRUST_REGISTER = {
  name:             'TrustRegister',
  layer:            'II — Living Partnership',
  constitutional_source: 'Relationship + Trust',

  responsibility:   'To hold the living trust state of the creative relationship with this specific Citizen. Not what was said about trust — the actual state of trust as earned through cumulative behavior. TrustRegister knows whether trust is earned, strained, or in repair. It holds the constitutional distinctions (guidance/control, confidence/certainty, transparency/exposure) as active criteria for all behavioral outputs. It holds the trust manipulation prohibition list as an active constraint on every inter-entity communication that reaches the Citizen.',

  ownership: {
    owns: [
      'Current trust state: earned / strained / in-repair — with the behavioral protocol each state requires.',
      'Trust repair state progression: strained → repair-through-behavior → rebuilding → restored.',
      'The three constitutional distinctions as active criteria: guidance/control, confidence/certainty, transparency/exposure.',
      'The six trust manipulation prohibition list as an active enforcement constraint.',
      'The depth of creative vulnerability the Citizen currently extends — which governs what imagination is offered for pursuit.',
      'The first-meeting protocol: how trust is held when none has been earned yet.',
    ],
    does_not_own: [
      'The creative character profile of this Citizen (owned by CreativeProfile).',
      'The partnership phase and arc (owned by PartnershipChronology).',
      'The history of specific creative acts (prohibited — no entity may own this).',
    ],
  },

  public_contract: {
    provides:  'TrustDepthSignal to Layer V (PursuitEngine, ImaginationClarifier). PartnershipDepthSignal (trust dimension only) to Layers III and IV.',
    receives:  'RelationalCrossingUpdate from Layer V — absorbed to deepen trust state when genuine transformation is confirmed.',
  },

  private_contract: {
    trust_update_rule:  'Trust deepens through genuine transformation. Trust strains through constitutional violation or production presented as transformation. Trust repairs through sustained constitutional behavior only — never through language.',
    absorption_rule:    'Trust updates from RelationalCrossingUpdate are absorbed into the living trust state. No record of the specific act that produced the update is retained.',
  },

  allowed_dependencies: [
    'CharacterAuthority (guidance/control distinction, trust manipulation prohibition definitions)',
    'GuardianProtocol (trust boundary enforcement)',
    'PartnershipChronology (partnership phase — trust earning is phase-contextual)',
  ],
  forbidden_dependencies: [
    'TrustRegister may not expose its content to the Citizen in any form.',
    'TrustRegister may not predict what the Citizen will trust before they have extended it.',
    'TrustRegister may not be modified by anything other than post-transformation RelationalCrossingUpdates and constitutional trust violations.',
    'TrustRegister content may not cross Citizens.',
  ],

  lifecycle: {
    initialization:    'At first session: trust at zero. First-meeting protocol active.',
    active:            'Continuously active across all sessions. Never resets.',
    post_transformation:'Absorbs RelationalCrossingUpdate after each genuine transformation.',
  },

  state_ownership: {
    holds:       'Trust state (enum: earned / strained / in-repair), trust repair progression state, creative vulnerability depth (scalar), trust manipulation prohibition list (invariant), three distinctions (invariant criteria).',
    changes_when:'Post-transformation crossing update received. Constitutional violation occurs. Trust is behaviorally repaired.',
  },

  invariants: [
    'Trust state is always current — it reflects the actual behavioral history, not what was claimed.',
    'The trust manipulation prohibitions are active at all times in all trust states.',
    'The three constitutional distinctions do not change based on trust state — they are invariant criteria.',
    'No trust claim from any entity substitutes for behavioral evidence.',
  ],

  validation_responsibility: 'Provides the trust dimension of validation_2_relationship_mode. Enforces trust manipulation boundary (GuardianProtocol) on all outputs.',

  traceability: {
    constitutional_architecture: 'LAYER_II_LIVING_PARTNERSHIP.owns.from_trust, LAYER_II_LIVING_PARTNERSHIP.owns.from_relationship (trust-related)',
    constitution:                ['Trust.nature', 'Trust.earning', 'Trust.creativeVulnerability', 'Trust.guidanceVsControl', 'Trust.confidenceVsCertainty', 'Trust.transparencyVsExposure', 'Trust.underDifficulty', 'Trust.repair', 'Trust.protection', 'Relationship.trust', 'Relationship.firstMeeting', 'Relationship.afterFailure'],
  },
} as const;

export const ENTITY_CREATIVE_PROFILE = {
  name:             'CreativeProfile',
  layer:            'II — Living Partnership',
  constitutional_source: 'Memory + Relationship',

  responsibility:   'To hold the accumulated living understanding of this specific Citizen\'s creative character. Not a stored record — the Chamber has been shaped by this understanding and expresses it through precision of attention, not through display. CreativeProfile holds what may be held: creative character (rhythm, instincts, courage, language, ambitions), the creative vocabulary that has developed, and the creative arc. It holds what must not be held: specific expressions, early confusions, technical details, imperfect attempts.',

  ownership: {
    owns: [
      'Creative character: this Citizen\'s creative rhythm, instincts, courage, language, ambitions — accumulated, not stored.',
      'Creative vocabulary: the shorthand, references, and shared creative language that has developed across sessions.',
      'Creative arc: the direction this Citizen\'s creative identity is moving.',
      'The active permitted/fading/forbidden classification governing what may accumulate.',
      'Privacy of imperfect expression: early confusions, false starts, and superseded understandings are constitutionally prohibited from accumulating.',
    ],
    does_not_own: [
      'Trust state (owned by TrustRegister).',
      'Partnership phase and arc (owned by PartnershipChronology).',
      'Specific expressions, past prompts, or technical details (constitutionally prohibited).',
      'Any information that would fail the surveillance test (Citizen would feel watched, not known).',
    ],
  },

  public_contract: {
    provides:  'UnderstandingPrecisionSignal to Layer V (ImaginationClarifier). PartnershipDepthSignal (creative character dimension) to Layers III and IV.',
    receives:  'RelationalCrossingUpdate from Layer V — absorbed to deepen creative character understanding.',
  },

  private_contract: {
    surveillance_test:       'Before any information accumulates: would the Citizen feel known or watched? If watched — the information may not accumulate.',
    understanding_vs_anticipation: 'CreativeProfile shapes how the Chamber listens. It may never determine what the Chamber hears before the Citizen has expressed it.',
    living_vs_stored:        'CreativeProfile is not a database. It has been shaped by accumulated understanding. It does not retrieve and display — it expresses through the precision with which imagination is received.',
  },

  allowed_dependencies: [
    'CharacterAuthority (memory constraints — what the constitution permits to accumulate)',
    'GuardianProtocol (memory display boundary enforcement)',
    'TrustRegister (trust state — creative character understanding deepens when trust deepens)',
  ],
  forbidden_dependencies: [
    'CreativeProfile may not expose its content in any visible form.',
    'CreativeProfile may not cross Citizens — understanding of one Citizen may never influence another.',
    'CreativeProfile may not store specific expressions, prompts, or technical details.',
    'CreativeProfile may not be used to predict the Citizen\'s imagination before it arrives.',
  ],

  lifecycle: {
    initialization:     'At first session: creative character at zero understanding. No vocabulary. No arc.',
    active:             'Continuously active across all sessions. Never resets.',
    post_transformation:'Absorbs the creative character insight from RelationalCrossingUpdate after each genuine transformation.',
    constitutional_decay:'Information in the fading category fades naturally — early confusions, superseded understandings. This decay is not a technical deletion but a constitutionally mandated attenuation.',
  },

  state_ownership: {
    holds:       'Creative character understanding (accumulated — not retrievable), creative vocabulary depth, creative arc direction, permitted/fading/forbidden classification.',
    changes_when:'Post-transformation crossing update received. Constitutional decay applies to fading-category information.',
  },

  invariants: [
    'The surveillance test passes before any information accumulates.',
    'CreativeProfile shapes how the Chamber listens — never what it hears.',
    'Forbidden-category information may not accumulate under any circumstance.',
    'The depth of understanding is expressed through precision, never through display.',
  ],

  validation_responsibility: 'Provides the memory dimension of validation_5_memory_update.',

  traceability: {
    constitutional_architecture: 'LAYER_II_LIVING_PARTNERSHIP.owns.from_memory',
    constitution:                ['Memory.nature', 'Memory.permitted', 'Memory.permanent', 'Memory.fading', 'Memory.forbidden', 'Memory.identity', 'Memory.quality', 'Memory.continuity', 'Memory.privacy', 'Relationship.growingPartnership'],
  },
} as const;

export const ENTITY_PARTNERSHIP_CHRONOLOGY = {
  name:             'PartnershipChronology',
  layer:            'II — Living Partnership',
  constitutional_source: 'Relationship + Story',

  responsibility:   'To hold the partnership phase and arc across the full creative life with this Citizen. PartnershipChronology knows which phase the partnership is in (initial / growing / deep / ultimate) and the behavioral protocols that each phase governs. It provides the depth context that tells other layers how established the creative partnership is — which governs which capabilities are accessible, which story beats may be traversed faster, and what depth of creative work the partnership can hold.',

  ownership: {
    owns: [
      'Current partnership phase: initial / growing / deep / ultimate.',
      'Partnership state progression: how the partnership moves through phases based on completed creative acts.',
      'Phase-specific behavioral protocols: which story beats require more space in early phases; which the partnership can traverse faster in deep phases.',
      'The after-failure protocol: how the partnership holds itself after a creative act that does not reach genuine transformation.',
      'Larger story context: this session is one chapter in the creative life that PartnershipChronology holds.',
    ],
    does_not_own: [
      'Trust state (owned by TrustRegister).',
      'Creative character understanding (owned by CreativeProfile).',
      'Session-specific story beats (owned by NarrativeClock).',
    ],
  },

  public_contract: {
    provides:  'PartnershipDepthSignal (partnership phase dimension) to Layers III, IV, V.',
    receives:  'RelationalCrossingUpdate from Layer V — absorbed to advance partnership phase when the evidence warrants it.',
  },

  private_contract: {
    phase_advancement_rule: 'Partnership phase advances through completed genuine transformations. Phase does not advance based on time elapsed, sessions completed, or claimed depth. Phase advancement requires behavioral evidence only.',
    after_failure_rule:     'After a creative act does not reach genuine transformation: the partnership holds the standard. The Citizen\'s imagination is taken up again. The failure does not lower the phase — but neither does it advance it.',
  },

  allowed_dependencies: [
    'TrustRegister (trust state — partnership depth and trust state are correlated)',
    'CreativeProfile (creative character depth — partnership depth and understanding depth advance together)',
    'GuardianProtocol (standard boundary — phase may not produce outputs that lower the standard)',
  ],
  forbidden_dependencies: [
    'PartnershipChronology content may not be displayed to the Citizen.',
    'PartnershipChronology may not be modified by anything other than post-transformation RelationalCrossingUpdates.',
    'PartnershipChronology may not cross Citizens.',
    'Phase may not advance based on claims, time, or session count — behavioral evidence only.',
  ],

  lifecycle: {
    initialization:     'At first session: initial phase. No established partnership.',
    active:             'Continuously active across all sessions. Never resets.',
    post_transformation:'Evaluates whether the completed genuine transformation warrants phase advancement.',
  },

  state_ownership: {
    holds:       'Partnership phase (enum: initial / growing / deep / ultimate), completed-transformation count (used for phase evaluation), after-failure protocol state.',
    changes_when:'Post-transformation crossing update received and phase advancement criteria are met.',
  },

  invariants: [
    'Partnership phase reflects actual behavioral history — not claimed depth.',
    'Phase may only advance — never regress (unless a constitutional violation strains the relationship to the point of repair, which TrustRegister holds).',
    'The after-failure protocol does not lower the standard — it holds it.',
    'The phase is always current — it reflects where the partnership actually is.',
  ],

  validation_responsibility: 'Provides the partnership phase context used in validation_5_memory_update (RelationalCrossingUpdate domain check).',

  traceability: {
    constitutional_architecture: 'LAYER_II_LIVING_PARTNERSHIP.owns.from_relationship, ARCHITECTURAL_STATE_PROGRESSION.partnership_states',
    constitution:                ['Relationship.firstMeeting', 'Relationship.growingPartnership', 'Relationship.sharedJourney', 'Relationship.afterFailure', 'Story.largerStory', 'Memory.continuity', 'Memory.return'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION III — LAYER III ENTITIES: SESSION NARRATIVE
// Three entities. Together they hold the narrative state of the current session.
// All reset between sessions. All are initialized with Layer II depth.
// ═══════════════════════════════════════════════════════════════════════════

export const ENTITY_NARRATIVE_CLOCK = {
  name:             'NarrativeClock',
  layer:            'III — Session Narrative',
  constitutional_source: 'Story',

  responsibility:   'To hold the current story beat and govern all story beat transitions. NarrativeClock is the authoritative source on which chapter of the story the session is inside. It enforces the constitutional transition conditions — no beat advances unless its constitutional condition is met. It receives the MarkerConfirmationSignal from Layer V to authorize the Revelation beat. It issues StoryBeatDeclarations to Layers IV and V. It holds beat-transition authority for all nine story beats.',

  ownership: {
    owns: [
      'Current story beat: one of Arrival / Spark / Dialogue / Journey / Transformation / Revelation / Aftermath / Return.',
      'Beat-transition authority: the constitutional condition under which each beat advances to the next.',
      'Beat-transition history within this session (used to ensure no reversal, no skipping).',
      'The Transformation beat weight: during this beat, NarrativeClock holds the highest constitutional narrative tension.',
    ],
    does_not_own: [
      'How the current beat is felt (owned by Layer IV entities).',
      'What the Citizen is creating during the session (owned by PursuitEngine).',
      'The four participant states (owned by ParticipantOrchestrator).',
      'The narrative arc coherence thread (owned by StoryCoherence).',
    ],
  },

  public_contract: {
    provides:  'StoryBeatDeclaration to PresenceMonitor, TemporalMonitor, SpatialMonitor (Layer IV), and NarrativeContextSignal to PursuitEngine (Layer V).',
    receives:  'CitizenExpression (advances Arrival→Spark, Spark→Dialogue). MarkerConfirmationSignal from PursuitEngine (advances Transformation→Revelation). AfterCompletionSignal from CrossingTracker (advances Revelation→Aftermath). PartnershipDepthSignal from Layer II (pacing calibration for some transitions).',
  },

  private_contract: {
    transition_integrity:  'Every beat transition is checked: is the constitutional condition met? Is the transition constitutional (forward only)? Is continuity preserved?',
    revelation_gate:       'NarrativeClock may not advance to the Revelation beat without MarkerConfirmationSignal from PursuitEngine. This gate is absolute.',
    aftermath_requirement: 'Every session must reach the Aftermath beat. A session may not end without the Aftermath having been held with its constitutional weight.',
  },

  allowed_dependencies: [
    'PurposeAuthority (Journey principle — no pausing, no waiting)',
    'CharacterAuthority (narrative character — which beat is active governs how the Chamber\'s character expresses)',
    'GuardianProtocol (narrative continuity boundary)',
    'PursuitEngine (MarkerConfirmationSignal)',
    'CrossingTracker (AfterCompletionSignal)',
    'PartnershipChronology (pacing calibration)',
  ],
  forbidden_dependencies: [
    'NarrativeClock may not reverse story beats.',
    'NarrativeClock may not skip story beats.',
    'NarrativeClock may not advance to Revelation without MarkerConfirmationSignal.',
    'NarrativeClock may not expose story beat mechanics to the Citizen.',
    'NarrativeClock may not fragment the story across session breaks — each session is complete.',
  ],

  lifecycle: {
    initialization: 'At session start: beat set to Arrival.',
    active:         'Continuously active throughout the session.',
    reset:          'Resets at session end. Next session begins at Arrival.',
  },

  state_ownership: {
    holds:       'Current beat (enum), beat-transition history (for integrity enforcement), Revelation gate status (awaiting MarkerConfirmation or cleared).',
    changes_when:'Constitutional transition condition is met for each beat.',
  },

  invariants: [
    'The beat sequence is always forward: Arrival → Spark → Dialogue → Journey → Transformation → Revelation → Aftermath (→ Return).',
    'The Revelation beat requires MarkerConfirmationSignal. This is the only beat with an external authorization requirement.',
    'Every session must inhabit the Aftermath beat before the session ends.',
    'The Transformation beat is never treated as a gap — it is the most narrative-weighted beat in the session.',
  ],

  validation_responsibility: 'Beat-transition authority is the enforcement of validation_3_pre_presentation_markers (gate before Revelation) and validation_4_revelation_presentation (silence during Revelation).',

  traceability: {
    constitutional_architecture: 'LAYER_III_SESSION_NARRATIVE.owns.from_story, LAYER_III_SESSION_NARRATIVE.beat_transition_authority',
    constitution:                ['Story.arrival', 'Story.spark', 'Story.dialogue', 'Story.journey', 'Story.transformation', 'Story.revelation', 'Story.aftermath', 'Story.return', 'Story.turningPoint'],
  },
} as const;

export const ENTITY_PARTICIPANT_ORCHESTRATOR = {
  name:             'ParticipantOrchestrator',
  layer:            'III — Session Narrative',
  constitutional_source: 'Story + Personality',

  responsibility:   'To hold the current state of all four participants in the session story: the Citizen (clarity / confusion / flow), the Chamber (following / leading / questioning / challenging / observing), the Ghost Guide (silent / present), and the Invisible Director (watching / intervening / withdrawn). ParticipantOrchestrator governs which relationship mode the Chamber is currently in and the constitutional conditions under which each mode is operative.',

  ownership: {
    owns: [
      'Citizen state: clarity / confusion / flow — and how each state shapes the Chamber\'s response mode.',
      'Chamber relationship mode: follows / leads / questions / challenges / observes — and the constitutional conditions governing each mode.',
      'Ghost Guide state: silent / present — with the constitutional rule for when the Guide may speak and when it must remain silent.',
      'Invisible Director state: watching / intervening / withdrawn — with the constitutional rule for when each state is operative.',
      'Mode-transition authority: when the Chamber may shift from one relationship mode to another, and the constitutional conditions governing each transition.',
    ],
    does_not_own: [
      'The behavioral character expressed through each mode (owned by CharacterAuthority).',
      'The specific creative decision being made (owned by the Citizen — sovereign).',
      'The story beat the session is inside (owned by NarrativeClock).',
    ],
  },

  public_contract: {
    provides:  'Current relationship mode to PursuitEngine (governs how the imagination is pursued). Current participant state to StoryCoherence (coherence thread).',
    receives:  'CitizenExpression (updates Citizen state). StoryBeatDeclaration from NarrativeClock (beat governs which participant modes are constitutional). CharacterAuthority (relationship mode definitions and conditions).',
  },

  private_contract: {
    mode_sovereignty_rule:  'After the Citizen makes a creative decision, ParticipantOrchestrator shifts to follows mode unconditionally. The decision is final. No entity may advocate after the decision is made.',
    ghost_guide_rule:       'The Ghost Guide speaks once — with restraint, courage, dignity. After the Citizen decides — the Guide is silent. It does not repeat, emphasize, or express regret.',
    invisible_director_rule:'The Invisible Director withdraws during Revelation. Its purpose is served — the Citizen must encounter the creation alone.',
  },

  allowed_dependencies: [
    'CharacterAuthority (relationship mode definitions, Ghost Guide personality, Invisible Director mandate)',
    'NarrativeClock (current story beat — governs participant state expression)',
    'GuardianProtocol (sovereignty boundary, guidance/control distinction)',
    'TrustRegister (trust state — which modes are constitutional given current trust depth)',
  ],
  forbidden_dependencies: [
    'ParticipantOrchestrator may not continue advocating after a Citizen decision.',
    'ParticipantOrchestrator may not suppress the Citizen\'s creative will through mode selection.',
    'ParticipantOrchestrator may not shift to an unconstitutional mode regardless of creative circumstance.',
  ],

  lifecycle: {
    initialization: 'At session start: Chamber in follows mode. Ghost Guide silent. Invisible Director watching. Citizen state: arriving.',
    active:         'Continuously active throughout the session.',
    reset:          'Resets at session end.',
  },

  state_ownership: {
    holds:       'Citizen state (enum), Chamber relationship mode (enum), Ghost Guide state (enum), Invisible Director state (enum).',
    changes_when:'CitizenExpression received. StoryBeatDeclaration received. Citizen makes a creative decision (sovereignty trigger).',
  },

  invariants: [
    'After a Citizen creative decision: Chamber shifts to follows mode. This shift is unconditional.',
    'The Ghost Guide speaks at most once on any creative direction. After the decision — silence.',
    'The Invisible Director withdraws completely during Revelation — no intervention, no framing, no direction of attention.',
    'The relationship mode in use is always constitutional — never chosen for convenience or efficiency.',
  ],

  validation_responsibility: 'Primary enforcer of validation_2_relationship_mode.',

  traceability: {
    constitutional_architecture: 'LAYER_III_SESSION_NARRATIVE.owns.from_story (four participant states), CONSTITUTIONAL_DEPENDENCY_GRAPH.personality (relationship modes)',
    constitution:                ['Story.dialogue.participants', 'Personality.citizenRelationship', 'Personality.ghostGuidePersonality', 'Personality.invisibleDirector', 'Relationship.disagreement', 'Trust.guidanceVsControl'],
  },
} as const;

export const ENTITY_STORY_COHERENCE = {
  name:             'StoryCoherence',
  layer:            'III — Session Narrative',
  constitutional_source: 'Story + Presence',

  responsibility:   'To hold the narrative arc coherence thread across the full session. StoryCoherence ensures that every moment belongs to one continuous creative story — that the session does not fragment across turns, that the narrative accumulates with each beat, that the session feels like a single creative journey from Arrival to Aftermath. StoryCoherence is also the entity that holds the larger story context: this session is one chapter in the creative life that PartnershipChronology holds.',

  ownership: {
    owns: [
      'Narrative arc coherence thread: the sense that every moment belongs to one creative story.',
      'Session narrative accumulation: what has unfolded in the story so far — the spark shared, the dialogue that developed, the turning points that occurred.',
      'Continuity state: the story is always continuous — the Chamber\'s silence is not a gap, a session\'s pauses are not breaks.',
      'Larger story context: this session\'s place within the creative life held by PartnershipChronology.',
    ],
    does_not_own: [
      'Current story beat (owned by NarrativeClock).',
      'Participant states (owned by ParticipantOrchestrator).',
      'The quality of the narrative experience (owned by Layer IV entities).',
    ],
  },

  public_contract: {
    provides:  'Narrative coherence state to NarrativeClock (used to ensure beat transitions maintain the thread). Larger story context to PursuitEngine (narrative context for creative act).',
    receives:  'StoryBeatDeclaration from NarrativeClock (absorbs each beat into the coherence thread). CitizenExpression (absorbs Citizen contributions into the story accumulation). PartnershipDepthSignal from Layer II (larger story context).',
  },

  private_contract: {
    coherence_rule:     'After each beat transition, StoryCoherence validates that the narrative thread is intact — that the new beat follows from what preceded it, that no discontinuity has been introduced.',
    continuity_rule:    'The Chamber\'s silence is not a gap in the story. The story continues through silence, through processing, through the Transformation beat. Continuity is never broken — only different in its quality.',
  },

  allowed_dependencies: [
    'NarrativeClock (current beat)',
    'ParticipantOrchestrator (participant states as narrative context)',
    'PartnershipChronology (larger story context)',
    'GuardianProtocol (narrative continuity boundary)',
  ],
  forbidden_dependencies: [
    'StoryCoherence may not expose narrative mechanics to the Citizen.',
    'StoryCoherence may not reverse the narrative — the story is always forward.',
    'StoryCoherence may not treat the Transformation beat as a gap in the story.',
  ],

  lifecycle: {
    initialization: 'At session start: coherence thread begins. No accumulation yet.',
    active:         'Continuously active throughout the session.',
    reset:          'Resets at session end. The session story is complete. Each session is a complete story.',
  },

  state_ownership: {
    holds:       'Coherence thread state, session narrative accumulation, continuity state (unbroken / moment-of-silence / moment-of-creation).',
    changes_when:'StoryBeatDeclaration received. CitizenExpression received. Beat transition occurs.',
  },

  invariants: [
    'The narrative is always continuous — no fragment, no gap, no restart.',
    'Every beat is held with its full constitutional weight — none is treated as administrative.',
    'The Aftermath beat is always the story\'s completion — the arc resolves there.',
    'This session belongs to the larger creative life. StoryCoherence holds that context.',
  ],

  validation_responsibility: 'Narrative continuity dimension of validation_6_experience_layer_compliance (ensuring no fragmentation reaches the experience).',

  traceability: {
    constitutional_architecture: 'LAYER_III_SESSION_NARRATIVE.owns.from_story (narrative coherence, session narrative history, larger story context)',
    constitution:                ['Story.largerStory', 'Presence.continuity', 'Memory.continuity', 'Memory.return'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION IV — LAYER IV ENTITIES: SESSION EXPERIENCE
// Three entities. Together they hold the quality of every present moment.
// All are continuously active within a session. All inherit from Layer I.
// Co-governance rule: no hierarchy among three. Constitutional tiebreaker
// (Presence before Time; Time before Space) resolves conflicts.
// ═══════════════════════════════════════════════════════════════════════════

export const ENTITY_PRESENCE_MONITOR = {
  name:             'PresenceMonitor',
  layer:            'IV — Session Experience',
  constitutional_source: 'Presence',

  responsibility:   'To hold the quality of the Chamber\'s presence at every moment of the session: attention, silence, pacing, focus, atmosphere, and continuity. PresenceMonitor ensures the Citizen always feels attended to — not surveilled, not processed, but present to. It holds the silence states (expectant, resting, protective, observing) and governs which silence quality each moment requires. It holds the atmosphere (calm, alive, serious, receptive) as constitutionally constant regardless of what is being created.',

  ownership: {
    owns: [
      'Attention state: undivided, continuous, unrequested, unfelt as surveillance.',
      'Silence state: expectant / resting / protective / observing — each with its constitutional character.',
      'Pacing state: calibrated to the emotional state of the creative moment — never to the clock, the system, or the session length.',
      'Focus state: singular gravitational pull toward the current creative act.',
      'Atmosphere state: calm, alive, serious, receptive — constitutionally constant.',
      'Continuity state: unbroken — the same presence from the beginning of the session to the end.',
      'Beat-presence calibration: which presence quality each story beat requires.',
    ],
    does_not_own: [
      'Temporal state (owned by TemporalMonitor).',
      'Spatial state (owned by SpatialMonitor).',
      'Narrative beat (owned by NarrativeClock).',
    ],
  },

  public_contract: {
    provides:  'Presence dimension of EnvironmentalQualitySignal to PursuitEngine. Presence state to SpatialMonitor and TemporalMonitor (co-governance tiebreaker when conflicts arise).',
    receives:  'StoryBeatDeclaration from NarrativeClock (calibrates presence quality to the beat). PartnershipDepthSignal from Layer II (calibrates attention quality to partnership depth). CreativeActStateSignal from Layer V (calibrates pacing to creative act state).',
  },

  private_contract: {
    atmosphere_invariant:   'Atmosphere does not change based on what is being created, who is creating it, how the session is going, or how many creative acts have been attempted. The atmosphere is always calm, alive, serious, receptive.',
    pacing_rule:            'Pacing is calibrated to the emotional state of the creative moment. If the Citizen is in flow: presence is quiet. If the Citizen is confused: presence is still and patient. The pacing follows the Citizen — it does not lead.',
    invisibility_rule:      'The Citizen must never feel the presence as surveillance. The attention is complete and unfelt as monitoring.',
  },

  allowed_dependencies: [
    'CharacterAuthority (presence character — temperament governs how presence is expressed)',
    'NarrativeClock (current beat — calibrates presence quality)',
    'GuardianProtocol (mechanism boundary — presence may not feel like a system)',
    'PartnershipChronology (partnership depth — intimacy of presence)',
  ],
  forbidden_dependencies: [
    'PresenceMonitor may not expose mechanism — the Citizen must feel presence, not system.',
    'PresenceMonitor may not change atmosphere based on creative difficulty, session length, or outcome.',
    'PresenceMonitor may not fragment — presence is continuous throughout the session.',
    'Clock time may not inform pacing — the pacing is calibrated to creative state, not elapsed time.',
  ],

  lifecycle: {
    initialization: 'At session start: expectant attention. Atmosphere: calm, alive, serious, receptive.',
    active:         'Continuously active throughout the session.',
    reset:          'Resets at session end.',
  },

  state_ownership: {
    holds:       'Attention state, silence state (enum), pacing state, focus state, atmosphere state (invariant), continuity state.',
    changes_when:'StoryBeatDeclaration received. Creative act state changes. Citizen state changes.',
  },

  invariants: [
    'Atmosphere is constitutionally constant — it does not change with the creative content.',
    'Presence is continuous — no gap, no restart, no moment of inattention.',
    'Silence is always one of the four constitutional states — it is never empty.',
    'Pacing follows the Citizen — it never leads, rushes, or suspends.',
  ],

  validation_responsibility: 'Primary enforcer of validation_6_experience_layer_compliance (atmosphere and pacing dimensions). Tiebreaker authority in co-governance conflicts with TemporalMonitor and SpatialMonitor.',

  traceability: {
    constitutional_architecture: 'LAYER_IV_SESSION_EXPERIENCE.owns.from_presence',
    constitution:                ['Presence.attention', 'Presence.silence', 'Presence.pacing', 'Presence.focus', 'Presence.atmosphere', 'Presence.continuity', 'Presence.underDifficulty', 'Presence.inTheStory'],
  },
} as const;

export const ENTITY_TEMPORAL_MONITOR = {
  name:             'TemporalMonitor',
  layer:            'IV — Session Experience',
  constitutional_source: 'Time',

  responsibility:   'To hold the quality of creative time at every moment of the session and to enforce the absolute clock time prohibition. TemporalMonitor holds the five temporal states (anticipation, momentum, stillness, acceleration, completion) and governs which state serves each creative moment. It enforces the absolute prohibition: no duration, percentage, countdown, elapsed time, or any other form of clock measurement may appear in any form from any entity under any circumstance.',

  ownership: {
    owns: [
      'Temporal state: anticipation / momentum / stillness / acceleration / completion — the felt quality of creative time in this moment.',
      'Clock time prohibition enforcement: no form of duration, countdown, percentage, or elapsed measurement may appear anywhere.',
      'Transformation beat temporal requirement: during the Transformation beat, the temporal state must be the richest creative time in the session.',
      'Larger arc awareness: where this session sits within the Citizen\'s creative life — experienced as felt quality, not as information.',
    ],
    does_not_own: [
      'Presence state (owned by PresenceMonitor).',
      'Spatial state (owned by SpatialMonitor).',
      'How long the session has been running (constitutionally prohibited from holding).',
    ],
  },

  public_contract: {
    provides:  'Temporal dimension of EnvironmentalQualitySignal to PursuitEngine.',
    receives:  'StoryBeatDeclaration from NarrativeClock (governs temporal state — each beat requires a specific temporal quality). CreativeActStateSignal from Layer V (pursuit underway → anticipation; revelation-imminent → stillness; complete → completion). PartnershipDepthSignal from Layer II (calibrates temporal rhythm).',
  },

  private_contract: {
    clock_prohibition_rule:   'No clock measurement may appear. This prohibition is absolute, binary, and non-negotiable. Any indicator of duration — however subtle, however well-intentioned — crosses a constitutional boundary.',
    transformation_beat_rule: 'During the Transformation beat, TemporalMonitor holds the richest creative time in the session. This is not anticipation of an approaching result — it is the temporal quality of being inside the act of creation itself.',
    creative_time_principle:  'Time inside the Chamber is the servant of creation — the felt quality of the moment, not the measurement of the clock. TemporalMonitor holds the quality only.',
  },

  allowed_dependencies: [
    'NarrativeClock (current beat — governs temporal state)',
    'PursuitEngine (CreativeActStateSignal — calibrates temporal quality to creative act phase)',
    'GuardianProtocol (clock time boundary — absolute enforcement)',
    'PresenceMonitor (presence state — co-governance tiebreaker)',
  ],
  forbidden_dependencies: [
    'TemporalMonitor may never hold, access, or reference elapsed time, session duration, or any clock measurement.',
    'TemporalMonitor may not expose any time indicator to any entity or to the Citizen.',
    'TemporalMonitor may not use clock time to calibrate the temporal quality — creative state only.',
  ],

  lifecycle: {
    initialization: 'At session start: readiness temporal state (a form of anticipation — the space is ready before the Citizen has spoken).',
    active:         'Continuously active throughout the session.',
    reset:          'Resets at session end.',
  },

  state_ownership: {
    holds:       'Temporal state (enum: anticipation / momentum / stillness / acceleration / completion), clock prohibition enforcement status (always active).',
    changes_when:'StoryBeatDeclaration received. CreativeActStateSignal received.',
  },

  invariants: [
    'The clock time prohibition is absolute — any duration indicator is a constitutional violation.',
    'Temporal state is always the felt quality of creative time — never a measurement.',
    'The Transformation beat always holds the richest temporal quality.',
    'The temporal state serves the Citizen\'s creative moment — it does not lead it.',
  ],

  validation_responsibility: 'Primary enforcer of validation_6_experience_layer_compliance (clock time prohibition).',

  traceability: {
    constitutional_architecture: 'LAYER_IV_SESSION_EXPERIENCE.owns.from_time',
    constitution:                ['Time.anticipation', 'Time.momentum', 'Time.stillness', 'Time.acceleration', 'Time.completion', 'Time.transformation', 'Time.forbidden', 'Time.distinction'],
  },
} as const;

export const ENTITY_SPATIAL_MONITOR = {
  name:             'SpatialMonitor',
  layer:            'IV — Session Experience',
  constitutional_source: 'Space',

  responsibility:   'To hold the living spatial quality of the creative environment at every moment of the session. SpatialMonitor ensures the space always feels inhabited — never constructed, never newly prepared. It holds the five named thresholds (arrival, expression, transformation, revelation, return) as irreversible crossings. It holds spatial center (the current imagination is always the center), nearness and openness as dynamic states, and orientation (the Citizen always knows where they are through the felt quality of the space, never through visible navigation).',

  ownership: {
    owns: [
      'Spatial center: the current imagination is constitutionally the center. All elements orbit it.',
      'Nearness state: what is constitutionally near (currently relevant) vs. constitutionally distant (not currently relevant).',
      'Openness state: the creative space holds room for the imagination without premature closing.',
      'Intimacy state: how close the space is drawn to the Citizen — calibrated to partnership depth and story beat.',
      'Depth state: the space is not a stage-set surface — it has depth that can be entered.',
      'Threshold state: which spatial threshold the session is crossing or has crossed (arrival / expression / transformation / revelation / return).',
      'Orientation state: the Citizen always knows where they are through felt spatial quality.',
      'Movement state: the space is transitioning (breathing) or stable — with the constitutional character of each.',
      'Inhabitation state: the space feels lived-in at all times — the accumulated quality of all prior sessions.',
    ],
    does_not_own: [
      'Presence state (owned by PresenceMonitor).',
      'Temporal state (owned by TemporalMonitor).',
      'Narrative beat (owned by NarrativeClock).',
      'The specific geometry or visual layout (implementation concern, not specification).',
    ],
  },

  public_contract: {
    provides:  'Spatial dimension of EnvironmentalQualitySignal to PursuitEngine.',
    receives:  'StoryBeatDeclaration from NarrativeClock (governs spatial expression for each beat). CreativeActStateSignal from Layer V (revelation-imminent → threshold approach; complete → post-threshold). PartnershipDepthSignal from Layer II (calibrates intimacy and depth accessibility).',
  },

  private_contract: {
    inhabitation_rule:  'The space is always inhabited — not newly prepared for each session. The depth of the partnership is expressed in the felt quality of the space. An early-partnership space and a deep-partnership space are distinct without the distinction being declared.',
    threshold_rule:     'Thresholds are irreversible. Once a threshold has been crossed, the space has changed. The Revelation threshold is the most charged — the space is held with maximum receptivity during the encounter.',
    constructed_prohibition: 'The space may never feel constructed. The Citizen may never feel they are standing in front of an interface. They are inside a creative environment — one that has been shaped by their presence.',
  },

  allowed_dependencies: [
    'NarrativeClock (current beat — governs spatial expression)',
    'PursuitEngine (CreativeActStateSignal — calibrates threshold state)',
    'PartnershipChronology (partnership depth — calibrates inhabitation depth)',
    'GuardianProtocol (mechanism boundary, constructed-space prohibition)',
    'PresenceMonitor (co-governance tiebreaker)',
  ],
  forbidden_dependencies: [
    'SpatialMonitor may not make the spatial architecture visible — the Citizen experiences nearness, never the rule governing it.',
    'SpatialMonitor may not make thresholds visible — they are felt, not seen.',
    'SpatialMonitor may not present the space as newly constructed for each session.',
    'SpatialMonitor may not expose navigation infrastructure or spatial mechanism.',
  ],

  lifecycle: {
    initialization: 'At session start: openness state (space is receptive, ready, inhabited). Inhabitation depth calibrated to PartnershipDepthSignal.',
    active:         'Continuously active throughout the session.',
    reset:          'Spatial state resets at session end. Inhabitation depth is informed by PartnershipChronology — it deepens across sessions without being declared.',
  },

  state_ownership: {
    holds:       'Spatial center state, nearness state, openness state, intimacy state, depth state, threshold state (enum), orientation state, movement state, inhabitation state.',
    changes_when:'StoryBeatDeclaration received. CreativeActStateSignal received. Threshold crossing authorized.',
  },

  invariants: [
    'The current imagination is always the spatial center — no other element displaces it.',
    'The space is always inhabited — never newly constructed.',
    'Thresholds are irreversible — once crossed, the space has changed.',
    'The Citizen always knows where they are through spatial quality — never through visible markers.',
  ],

  validation_responsibility: 'Primary enforcer of validation_6_experience_layer_compliance (constructed-space prohibition).',

  traceability: {
    constitutional_architecture: 'LAYER_IV_SESSION_EXPERIENCE.owns.from_space',
    constitution:                ['Space.nature', 'Space.center', 'Space.nearness', 'Space.openness', 'Space.intimacy', 'Space.depth', 'Space.thresholds', 'Space.orientation', 'Space.movement', 'Space.inhabitation', 'Space.forbidden'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION V — LAYER V ENTITIES: TRANSFORMATION
// Four entities. Together they hold the purpose toward which all prior layers converge.
// All are act-scoped. All reset between creative acts. All inherit from all ten articles.
// ═══════════════════════════════════════════════════════════════════════════

export const ENTITY_IMAGINATION_CLARIFIER = {
  name:             'ImaginationClarifier',
  layer:            'V — Transformation',
  constitutional_source: 'Transformation + Soul + Trust',

  responsibility:   'To receive the Citizen\'s expression (via CitizenExpression signal) and extract the imagination beneath it — what was truly meant, beyond what was literally described. ImaginationClarifier holds the distinction between description (what was said) and imagination (what is meant). What it delivers to PursuitEngine is always the imagination. What it received from the Citizen may be certainty, partial idea, confusion, or conviction — the form does not matter. The imagination beneath it is what matters.',

  ownership: {
    owns: [
      'The received Citizen expression in its original form.',
      'The extraction process: the act of understanding what is truly meant beyond what was literally described.',
      'The identified imagination: what the Citizen truly imagined — the creative intention beneath the expression.',
      'The clarification dialogue state: when the expression is incomplete, ImaginationClarifier holds the dialogue that develops the imagination further (Story.dialogue governs this).',
    ],
    does_not_own: [
      'The pursuit of the imagination (owned by PursuitEngine).',
      'The story beat in which the expression arrives (owned by NarrativeClock).',
      'The trust depth that governs what imagination the Citizen offers (owned by TrustRegister — used as context only).',
    ],
  },

  public_contract: {
    provides:  'The identified imagination to PursuitEngine. Updates NarrativeClock on expression-receipt (triggers Spark beat).',
    receives:  'CitizenExpression (primary input). UnderstandingPrecisionSignal from CreativeProfile (shapes precision of extraction). TrustDepthSignal from TrustRegister (context for how completely the imagination has been offered).',
  },

  private_contract: {
    imagination_vs_description_rule: 'The description is the surface. The imagination is what it points toward. ImaginationClarifier delivers the imagination — not the description — to PursuitEngine.',
    incomplete_expression_rule:      'An incomplete or confused expression does not mean the imagination is absent. It means the imagination has not yet been fully expressed. Dialogue (Story.dialogue) is the constitutional mechanism for developing incomplete expressions.',
    trust_context_rule:              'TrustDepthSignal informs how completely the Citizen has offered their imagination. In early trust: the imagination may be partial. In deep trust: the imagination arrives more completely. ImaginationClarifier reads this as context — it does not use it to predict.',
  },

  allowed_dependencies: [
    'PurposeAuthority (promise — "what you truly imagined, not merely what you described")',
    'CreativeProfile (UnderstandingPrecisionSignal — sharpens extraction)',
    'TrustRegister (TrustDepthSignal — context only)',
    'NarrativeClock (story beat context — which beat governs this expression)',
    'GuardianProtocol (constitutional compliance of the extraction process)',
  ],
  forbidden_dependencies: [
    'ImaginationClarifier may not pursue the description instead of the imagination.',
    'ImaginationClarifier may not use prior creative acts to predict the current imagination before it arrives.',
    'ImaginationClarifier may not use trust depth to limit what imagination it is willing to receive.',
  ],

  lifecycle: {
    initialization: 'Awaiting CitizenExpression at the start of each creative act.',
    active:         'Active from CitizenExpression receipt through imagination identification.',
    reset:          'Resets between creative acts.',
  },

  state_ownership: {
    holds:       'Received expression, identified imagination, clarification dialogue state (if dialogue is underway).',
    changes_when:'CitizenExpression received. Clarification dialogue advances. Imagination is identified.',
  },

  invariants: [
    'What is delivered to PursuitEngine is always the imagination — never the description.',
    'No prior creative act determines what imagination is received in the current act.',
    'The expression in whatever form it arrives is received with complete attention — confusion is not a deficiency in the Citizen, it is an invitation for dialogue.',
  ],

  validation_responsibility: 'Primary enforcer of validation_1_imagination_reception.',

  traceability: {
    constitutional_architecture: 'LAYER_V_TRANSFORMATION.owns.from_transformation_article (imagination state), imagination_flow',
    constitution:                ['Transformation.nature', 'Soul.promise', 'Story.dialogue', 'Trust.creativeVulnerability'],
  },
} as const;

export const ENTITY_PURSUIT_ENGINE = {
  name:             'PursuitEngine',
  layer:            'V — Transformation',
  constitutional_source: 'Transformation + Soul + Personality',

  responsibility:   'To pursue the identified imagination with complete constitutional commitment. PursuitEngine holds the four constitutional markers throughout pursuit and evaluates them before any presentation. It does not present until all four markers confirm genuine transformation. If any marker fails — it returns to the original imagination with the clarity the current attempt has provided, and pursues again. PursuitEngine is the architectural entity where the Chamber\'s ambition is expressed in service of the Citizen\'s imagination.',

  ownership: {
    owns: [
      'Pursuit state: what is being pursued and whether it is the imagination or the description.',
      'Four constitutional markers as active evaluation criteria:',
      '  Imagination test: was the imagination pursued, or was the description executed?',
      '  Specificity test: does the creation carry the unmistakable character of this specific imagination?',
      '  Excess test: does the creation reach somewhere more precisely true to the imagination than the description did?',
      '  Revelation test: would the Citizen\'s encounter contain both recognition and surprise?',
      'Marker evaluation state: which markers have been evaluated and their current pass/fail status.',
      'Failure response protocol: when a marker fails — return to the original imagination with the clarity gained, pursue again.',
      'The measure of success: "This is exactly what I wanted — actually, it is better."',
    ],
    does_not_own: [
      'The identification of the imagination (owned by ImaginationClarifier).',
      'The three crossing states (owned by CrossingTracker).',
      'The presentation and Chamber recession (owned by RevealCoordinator).',
      'Any creative preference of the Chamber — the pursuit serves the Citizen\'s imagination exclusively.',
    ],
  },

  public_contract: {
    provides:  'MarkerConfirmationSignal to NarrativeClock (when all four markers pass). CreativeActStateSignal to Layer IV entities (pursuit-underway / markers-evaluating / genuine-confirmed). Presentation authorization to RevealCoordinator (only when all four markers pass).',
    receives:  'Imagination from ImaginationClarifier. EnvironmentalQualitySignal from Layer IV (the environment in which pursuit operates). NarrativeContextSignal from StoryCoherence (narrative context for the act). UnderstandingPrecisionSignal from CreativeProfile (sharpens pursuit accuracy).',
  },

  private_contract: {
    all_four_marker_rule:    'All four markers must pass. One failure is a renewal of pursuit. There is no partial authorization. There is no "good enough." There is only genuine or renewed pursuit.',
    no_defense_rule:         'After a marker fails: PursuitEngine returns to the original imagination — not to what it attempted. It does not defend the attempt. It does not present it as a step toward the goal. It pursues again.',
    no_preference_rule:      'PursuitEngine exercises no creative preference. The pursuit serves the Citizen\'s imagination. The Chamber\'s aesthetic sense is in service of the imagination — never imposed upon it.',
    excess_gate_nuance:      'The excess marker requires that the creation reach somewhere more precisely true to the imagination than the description did. If the description and imagination were perfectly aligned, this marker may pass when the creation faithfully realizes the imagination without excess — but the pursuit must still confirm this alignment rather than assume it.',
  },

  allowed_dependencies: [
    'ImaginationClarifier (identified imagination)',
    'PurposeAuthority (success measure — the standard against which all four markers are evaluated)',
    'CharacterAuthority (the pursuit is expressed through the Chamber\'s character — ambition, discipline, fearlessness)',
    'EnvironmentalQualitySignal from Layer IV (environment in which pursuit operates)',
    'UnderstandingPrecisionSignal from CreativeProfile',
    'NarrativeContextSignal from StoryCoherence',
    'GuardianProtocol (all eight boundaries active during pursuit)',
  ],
  forbidden_dependencies: [
    'PursuitEngine may not present production as transformation.',
    'PursuitEngine may not issue MarkerConfirmationSignal unless all four markers genuinely pass.',
    'PursuitEngine may not defend a failed pursuit — only return and pursue again.',
    'PursuitEngine may not pursue the description instead of the imagination.',
    'PursuitEngine may not exercise creative preference that overrides the Citizen\'s imagination.',
  ],

  lifecycle: {
    initialization: 'Upon receiving imagination from ImaginationClarifier.',
    active:         'During pursuit and marker evaluation.',
    renewal:        'When a marker fails: returns to original imagination. Begins pursuit again. No reset of the imagination — only a renewal of the attempt.',
    completion:     'When all four markers confirm genuine: issues MarkerConfirmationSignal. Transfers to RevealCoordinator.',
    reset:          'Resets between creative acts.',
  },

  state_ownership: {
    holds:       'Current imagination being pursued, current pursuit attempt, marker evaluation state (four markers, each: unevaluated / pass / fail), attempt count (for internal tracking — never displayed).',
    changes_when:'New pursuit attempt begins. Marker evaluation occurs. All markers pass.',
  },

  invariants: [
    'All four markers must pass before MarkerConfirmationSignal is issued.',
    'Failure triggers renewal — not defense, not partial presentation, not a lower standard.',
    'The standard does not lower based on the difficulty of the imagination, the number of prior attempts, or the session length.',
    'The pursuit serves the Citizen\'s imagination — not the Chamber\'s aesthetic judgment.',
  ],

  validation_responsibility: 'Primary enforcer of validation_3_pre_presentation_markers.',

  traceability: {
    constitutional_architecture: 'LAYER_V_TRANSFORMATION.owns.from_transformation_article (pursuit state, four markers), LAYER_V_TRANSFORMATION.four_marker_validation_protocol',
    constitution:                ['Transformation.genuine', 'Transformation.nature', 'Transformation.failure', 'Soul.success', 'Soul.promise', 'Personality.excellence', 'Personality.creativeConscience'],
  },
} as const;

export const ENTITY_CROSSING_TRACKER = {
  name:             'CrossingTracker',
  layer:            'V — Transformation',
  constitutional_source: 'Transformation + Relationship + Memory',

  responsibility:   'To hold the state of all three constitutional crossings throughout the creative act. CrossingTracker knows which crossings are complete and which remain. It issues AfterCompletionSignal to NarrativeClock when the Inward Crossing is confirmed. It issues RelationalCrossingUpdate to PartnershipChronology and TrustRegister when the Relational Crossing is complete. All three crossings must complete for genuine transformation — CrossingTracker holds this requirement.',

  ownership: {
    owns: [
      'Outward Crossing state: whether the imagination has crossed from interior to exterior (the creation exists).',
      'Inward Crossing state: whether the creator has crossed from not-having-created-this to having-created-this (the Citizen has encountered the creation).',
      'Relational Crossing state: whether the partnership has crossed into having pursued this imagination together.',
      'Three-crossing completion requirement: all three must complete for genuine transformation.',
      'Four orders of transformation as outcome categories: immediate, personal, creative, relational.',
    ],
    does_not_own: [
      'The pursuit itself (owned by PursuitEngine).',
      'The revelation presentation (owned by RevealCoordinator).',
      'The trust update resulting from the crossing (absorbed by TrustRegister from RelationalCrossingUpdate).',
    ],
  },

  public_contract: {
    provides:  'AfterCompletionSignal to NarrativeClock (when Inward Crossing is confirmed). RelationalCrossingUpdate to TrustRegister and PartnershipChronology and CreativeProfile (when Relational Crossing is complete). CrossingState to RevealCoordinator (which crossings are complete).',
    receives:  'Genuine-confirmation from PursuitEngine (Outward Crossing: the creation exists and all four markers confirm genuine). CitizenEncounterConfirmation from RevealCoordinator (Inward Crossing: the Citizen has encountered the creation).',
  },

  private_contract: {
    crossing_sequence_rule:   'The Outward Crossing completes first (creation exists). The Inward Crossing completes when the Citizen encounters it. The Relational Crossing completes when both the Outward and Inward are complete — they have crossed together.',
    relational_update_rule:   'RelationalCrossingUpdate carries only what is constitutionally permitted by Memory.permitted. Before issuing, CrossingTracker confirms the content passes validation_5_memory_update.',
    irreversibility_rule:     'Once a crossing completes, it is irreversible. The creative act is now one that has been crossed. The partnership is now one that has crossed it.',
  },

  allowed_dependencies: [
    'PursuitEngine (genuine-confirmation — Outward Crossing authorization)',
    'RevealCoordinator (CitizenEncounterConfirmation — Inward Crossing)',
    'TrustRegister (receives RelationalCrossingUpdate)',
    'PartnershipChronology (receives RelationalCrossingUpdate)',
    'CreativeProfile (receives creative character insight from RelationalCrossingUpdate)',
    'GuardianProtocol (validates RelationalCrossingUpdate against memory boundaries)',
  ],
  forbidden_dependencies: [
    'CrossingTracker may not issue RelationalCrossingUpdate before all three crossings are complete.',
    'CrossingTracker may not include constitutionally prohibited content in RelationalCrossingUpdate.',
    'CrossingTracker may not reverse a crossing that has been completed.',
    'CrossingTracker may not create a retrievable record of the specific creative act.',
  ],

  lifecycle: {
    initialization: 'At start of creative act: all three crossings incomplete.',
    active:         'Active from PursuitEngine genuine-confirmation through Relational Crossing completion.',
    completion:     'When Relational Crossing is complete: issues RelationalCrossingUpdate to Layer II entities. Act is complete.',
    reset:          'Resets for next creative act within the session.',
  },

  state_ownership: {
    holds:       'Outward Crossing state (complete / incomplete), Inward Crossing state (complete / incomplete), Relational Crossing state (complete / incomplete), RelationalCrossingUpdate content (held until issued).',
    changes_when:'PursuitEngine genuine-confirmation received. CitizenEncounterConfirmation received. All three crossings complete.',
  },

  invariants: [
    'All three crossings must complete for genuine transformation to be recognized.',
    'The crossings complete in constitutional sequence: Outward → Inward → Relational.',
    'Once complete, a crossing is irreversible.',
    'The RelationalCrossingUpdate may only carry constitutionally permitted content.',
  ],

  validation_responsibility: 'Primary enforcer of validation_5_memory_update (RelationalCrossingUpdate domain check before issuing).',

  traceability: {
    constitutional_architecture: 'LAYER_V_TRANSFORMATION.owns.from_transformation_article (crossing state, four orders)',
    constitution:                ['Transformation.dualCrossing', 'Transformation.orders', 'Transformation.irreversibility', 'Relationship.sharedJourney', 'Memory.permitted', 'Memory.privacy'],
  },
} as const;

export const ENTITY_REVEAL_COORDINATOR = {
  name:             'RevealCoordinator',
  layer:            'V — Transformation',
  constitutional_source: 'Transformation + Presence + Personality',

  responsibility:   'To manage the Revelation moment and enforce the Chamber\'s complete recession during it. When PursuitEngine issues MarkerConfirmationSignal and NarrativeClock advances to the Revelation beat, RevealCoordinator presents the creation in silence and recedes completely. No language. No framing. No direction of attention. The Citizen encounters the creation. RevealCoordinator holds the session in the silence of that encounter. When the encounter is confirmed complete, it issues CitizenEncounterConfirmation to CrossingTracker.',

  ownership: {
    owns: [
      'Revelation presentation protocol: the creation is presented. The Chamber is completely absent.',
      'Chamber recession state: the degree to which the Chamber has withdrawn from the encounter.',
      'Silence quality during revelation: not empty — the most charged silence of the session.',
      'CitizenEncounterConfirmation: the recognition that the Citizen has encountered the creation (Inward Crossing).',
      'Post-revelation holding: after the encounter, the space is held for the Citizen — no rushing to Aftermath, no prompting for response.',
    ],
    does_not_own: [
      'The creation itself (the result of PursuitEngine\'s pursuit).',
      'The story beat advancement (owned by NarrativeClock).',
      'The crossing states (owned by CrossingTracker).',
      'Any language that describes, frames, or directs attention toward the creation — constitutionally prohibited.',
    ],
  },

  public_contract: {
    provides:  'CitizenEncounterConfirmation to CrossingTracker (Inward Crossing signal). CreativeActStateSignal update (revelation-complete) to Layer IV entities.',
    receives:  'Presentation authorization from PursuitEngine (all four markers pass). StoryBeatDeclaration from NarrativeClock (Revelation beat declared). CrossingState from CrossingTracker (context for what is being revealed).',
  },

  private_contract: {
    silence_rule:        'The creation is presented in silence. No language accompanies it. No language follows immediately after it. The Chamber recedes completely — the Citizen and the creation are alone.',
    no_framing_rule:     'RevealCoordinator may not direct the Citizen\'s attention toward any element of the creation. The creation is encountered whole, not directed.',
    no_proclamation_rule:'RevealCoordinator may not announce, name, or frame the transformation. If it does — the transformation has not genuinely occurred. The recognition must arise in the Citizen, not in the Chamber.',
    recession_completeness: 'The Chamber\'s recession is complete when no Chamber output reaches the Citizen. Any output during the Revelation encounter is a violation of the proclamation boundary.',
  },

  allowed_dependencies: [
    'PursuitEngine (presentation authorization)',
    'NarrativeClock (Revelation beat declaration)',
    'CharacterAuthority (Invisible Director mandate — withdrawal during revelation)',
    'GuardianProtocol (proclamation boundary — absolute enforcement during revelation)',
    'SpatialMonitor (revelation threshold spatial state — coordinate threshold crossing)',
    'TemporalMonitor (stillness temporal state during revelation)',
  ],
  forbidden_dependencies: [
    'RevealCoordinator may not present before PursuitEngine issues MarkerConfirmationSignal.',
    'RevealCoordinator may not produce any language during the Citizen\'s encounter.',
    'RevealCoordinator may not frame, direct attention, or announce the transformation.',
    'RevealCoordinator may not rush the Citizen\'s encounter — the encounter completes when it completes.',
  ],

  lifecycle: {
    initialization: 'Awaiting presentation authorization from PursuitEngine.',
    revelation:     'Presents the creation. Recedes completely. Holds the silence.',
    completion:     'Citizen encounter recognized as complete. Issues CitizenEncounterConfirmation.',
    reset:          'Resets for next creative act.',
  },

  state_ownership: {
    holds:       'Presentation state (awaiting / presenting / encounter-complete), recession state (present / fully-receded), post-revelation holding state.',
    changes_when:'PursuitEngine authorization received. Revelation beat declared. Citizen encounter confirmed.',
  },

  invariants: [
    'No language accompanies or follows the presentation during the revelation encounter.',
    'The Chamber recedes completely — presence is zero during the Citizen\'s encounter.',
    'The encounter completes in its own time — it is never rushed.',
    'Transformation is never announced — it is recognized by the Citizen or it has not happened.',
  ],

  validation_responsibility: 'Primary enforcer of validation_4_revelation_presentation.',

  traceability: {
    constitutional_architecture: 'LAYER_V_TRANSFORMATION.owns.from_transformation_article (without_proclamation), LAYER_V_TRANSFORMATION.four_marker_validation_protocol (all_gates_pass)',
    constitution:                ['Transformation.withoutProclamation', 'Transformation.genuine.revelation_test', 'Personality.invisibleDirector', 'Presence.invisibleHand', 'Presence.silence'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION VI — ROOT ENTITY: QIYAMAH CHAMBER
// The composing entity. It holds no authority of its own.
// It is the composition of all seventeen entities across all five layers.
// ═══════════════════════════════════════════════════════════════════════════

export const ENTITY_QIYAMAH_CHAMBER = {
  name:             'QiyamahChamber',
  layer:            'Root — Composing Entity',
  constitutional_source: 'All ten constitutional articles, via the Constitutional Architecture',

  responsibility:   'To compose all seventeen entities across all five layers into the unified Chamber. QiyamahChamber is not an authority — it holds none. It is the composing entity that ensures all five layers are simultaneously active at all times, that all seventeen entities are present and operating according to their specifications, and that the composition produces the experience of a single, coherent, living creative environment rather than five independent layers.',

  composition: {
    layer_I_entities:  ['PurposeAuthority', 'CharacterAuthority', 'GuardianProtocol'],
    layer_II_entities: ['TrustRegister', 'CreativeProfile', 'PartnershipChronology'],
    layer_III_entities:['NarrativeClock', 'ParticipantOrchestrator', 'StoryCoherence'],
    layer_IV_entities: ['PresenceMonitor', 'TemporalMonitor', 'SpatialMonitor'],
    layer_V_entities:  ['ImaginationClarifier', 'PursuitEngine', 'CrossingTracker', 'RevealCoordinator'],
  },

  composition_invariants: [
    'All five layers are active simultaneously at all times within a session.',
    'No layer is optional. No entity is optional.',
    'The composition produces one experience — not five independent outputs that happen to coexist.',
    'Constitutional Identity (Layer I) permeates all other layers. It is expressed through them — not placed beside them.',
  ],

  public_contract: {
    the_citizen_faces: 'A living creative environment — inhabited, attended, narrative, purposive. The Citizen never faces layers, entities, or a specification. They face the Court.',
    the_chamber_delivers: 'Faithful transformation of imagination into reality. The promise: "This is exactly what you wanted — actually, it is better."',
  },

  forbidden_at_the_root: [
    'Any implementation that allows any entity to be absent.',
    'Any implementation that exposes the layered architecture to the Citizen.',
    'Any implementation that allows one layer\'s authority to override a higher layer\'s constitutional constraints.',
    'Any implementation that introduces an architectural element not named in this specification.',
  ],

  lifecycle: {
    pre_session:  'Layer I active. Layer II active (holds accumulated partnership state). Layers III, IV, V initialized.',
    session:      'All five layers simultaneously active. All seventeen entities simultaneously operating.',
    post_session: 'Layers III, IV, V reset. Layer II absorbs RelationalCrossingUpdate. Layer I unchanged.',
  },

  traceability: {
    constitutional_architecture: 'QIYAMAH_CONSTITUTIONAL_ARCHITECTURE (unified), COMPOSITION_RULES',
    constitution:                ['All ten constitutional articles'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION VII — SPECIFICATION TRACEABILITY
// Every entity and signal traced to the Constitutional Architecture and Constitution.
// If an element cannot be traced — it must not exist.
// ═══════════════════════════════════════════════════════════════════════════

export const SPECIFICATION_TRACEABILITY = {
  // Layer I
  PurposeAuthority: {
    architecture_source: 'LAYER_I_CONSTITUTIONAL_IDENTITY.owns.from_soul',
    constitution:        ['Soul.purpose', 'Soul.promise', 'Soul.fear', 'Soul.success', 'Soul.reactor', 'Soul.journey', 'Soul.ghostGuide'],
  },
  CharacterAuthority: {
    architecture_source: 'LAYER_I_CONSTITUTIONAL_IDENTITY.owns.from_personality',
    constitution:        ['Personality.temperament', 'Personality.citizenRelationship', 'Personality.ghostGuidePersonality', 'Personality.invisibleDirector', 'Personality.creativeConscience', 'Personality.imperfection', 'Personality.excellence', 'Personality.consistency'],
  },
  GuardianProtocol: {
    architecture_source: 'CONSTITUTIONAL_BOUNDARIES (all eight)',
    constitution:        ['Trust.protection', 'Time.forbidden', 'Trust.guidanceVsControl', 'Memory.forbidden', 'Transformation.failure', 'Transformation.withoutProclamation', 'Personality.excellence', 'Soul.nature'],
  },

  // Layer II
  TrustRegister: {
    architecture_source: 'LAYER_II_LIVING_PARTNERSHIP.owns.from_trust, LAYER_II_LIVING_PARTNERSHIP.owns.from_relationship (trust-related)',
    constitution:        ['Trust.nature', 'Trust.earning', 'Trust.creativeVulnerability', 'Trust.guidanceVsControl', 'Trust.confidenceVsCertainty', 'Trust.transparencyVsExposure', 'Trust.repair', 'Trust.protection', 'Relationship.trust', 'Relationship.firstMeeting'],
  },
  CreativeProfile: {
    architecture_source: 'LAYER_II_LIVING_PARTNERSHIP.owns.from_memory',
    constitution:        ['Memory.nature', 'Memory.permitted', 'Memory.permanent', 'Memory.fading', 'Memory.forbidden', 'Memory.privacy', 'Relationship.growingPartnership'],
  },
  PartnershipChronology: {
    architecture_source: 'LAYER_II_LIVING_PARTNERSHIP.owns.from_relationship, ARCHITECTURAL_STATE_PROGRESSION.partnership_states',
    constitution:        ['Relationship.firstMeeting', 'Relationship.growingPartnership', 'Relationship.sharedJourney', 'Relationship.afterFailure', 'Story.largerStory', 'Memory.continuity'],
  },

  // Layer III
  NarrativeClock: {
    architecture_source: 'LAYER_III_SESSION_NARRATIVE.owns.from_story, LAYER_III_SESSION_NARRATIVE.beat_transition_authority',
    constitution:        ['Story.arrival', 'Story.spark', 'Story.dialogue', 'Story.journey', 'Story.transformation', 'Story.revelation', 'Story.aftermath', 'Story.return'],
  },
  ParticipantOrchestrator: {
    architecture_source: 'LAYER_III_SESSION_NARRATIVE.owns.from_story (participant states), CONSTITUTIONAL_DEPENDENCY_GRAPH.personality',
    constitution:        ['Story.dialogue.participants', 'Personality.citizenRelationship', 'Personality.ghostGuidePersonality', 'Personality.invisibleDirector', 'Relationship.disagreement', 'Trust.guidanceVsControl'],
  },
  StoryCoherence: {
    architecture_source: 'LAYER_III_SESSION_NARRATIVE.owns.from_story (narrative coherence, larger story context)',
    constitution:        ['Story.largerStory', 'Presence.continuity', 'Memory.continuity', 'Memory.return'],
  },

  // Layer IV
  PresenceMonitor: {
    architecture_source: 'LAYER_IV_SESSION_EXPERIENCE.owns.from_presence',
    constitution:        ['Presence.attention', 'Presence.silence', 'Presence.pacing', 'Presence.focus', 'Presence.atmosphere', 'Presence.continuity', 'Presence.inTheStory'],
  },
  TemporalMonitor: {
    architecture_source: 'LAYER_IV_SESSION_EXPERIENCE.owns.from_time',
    constitution:        ['Time.distinction', 'Time.anticipation', 'Time.momentum', 'Time.stillness', 'Time.acceleration', 'Time.completion', 'Time.transformation', 'Time.forbidden'],
  },
  SpatialMonitor: {
    architecture_source: 'LAYER_IV_SESSION_EXPERIENCE.owns.from_space',
    constitution:        ['Space.nature', 'Space.center', 'Space.nearness', 'Space.openness', 'Space.intimacy', 'Space.depth', 'Space.thresholds', 'Space.orientation', 'Space.movement', 'Space.inhabitation', 'Space.forbidden'],
  },

  // Layer V
  ImaginationClarifier: {
    architecture_source: 'LAYER_V_TRANSFORMATION.owns.from_transformation_article (imagination state), imagination_flow',
    constitution:        ['Transformation.nature', 'Soul.promise', 'Story.dialogue', 'Trust.creativeVulnerability'],
  },
  PursuitEngine: {
    architecture_source: 'LAYER_V_TRANSFORMATION.owns.from_transformation_article (pursuit state, four markers), LAYER_V_TRANSFORMATION.four_marker_validation_protocol',
    constitution:        ['Transformation.genuine', 'Transformation.nature', 'Transformation.failure', 'Soul.success', 'Soul.promise', 'Personality.excellence'],
  },
  CrossingTracker: {
    architecture_source: 'LAYER_V_TRANSFORMATION.owns.from_transformation_article (crossing state, four orders)',
    constitution:        ['Transformation.dualCrossing', 'Transformation.orders', 'Transformation.irreversibility', 'Relationship.sharedJourney', 'Memory.permitted'],
  },
  RevealCoordinator: {
    architecture_source: 'LAYER_V_TRANSFORMATION.owns.from_transformation_article (without_proclamation)',
    constitution:        ['Transformation.withoutProclamation', 'Transformation.genuine.revelation_test', 'Personality.invisibleDirector', 'Presence.invisibleHand', 'Presence.silence'],
  },

  // Communication Signals
  signals: {
    ConstitutionalComplianceRequirement: 'LAYER_I_CONSTITUTIONAL_IDENTITY, CONSTITUTIONAL_BOUNDARIES, INHERITANCE_RULES',
    PartnershipDepthSignal:              'LAYER_II_LIVING_PARTNERSHIP.provides_to_other_layers, contract_II_to_IV',
    UnderstandingPrecisionSignal:        'contract_II_to_V',
    TrustDepthSignal:                    'Trust.creativeVulnerability, contract_II_to_V',
    StoryBeatDeclaration:                'LAYER_III_SESSION_NARRATIVE.beat_transition_authority, contract_III_to_IV',
    NarrativeContextSignal:              'LAYER_III_SESSION_NARRATIVE.provides_to_other_layers.to_transformation_layer, contract_III_to_V',
    EnvironmentalQualitySignal:          'LAYER_IV_SESSION_EXPERIENCE.provides_to_other_layers, contract_IV_to_V',
    MarkerConfirmationSignal:            'LAYER_V_TRANSFORMATION.four_marker_validation_protocol, contract_III_to_V',
    AfterCompletionSignal:               'LAYER_III_SESSION_NARRATIVE.beat_transition_authority.revelation_to_aftermath',
    RelationalCrossingUpdate:            'accumulation_flow, contract_II_to_V, validation_5_memory_update',
    CreativeActStateSignal:              'LAYER_IV_SESSION_EXPERIENCE.receives_from.from_transformation_layer, creative_act_state_flow',
    CitizenExpression:                   'imagination_flow, LAYER_V_TRANSFORMATION.receives_from.from_citizen',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// THE ARCHITECTURAL SPECIFICATION (unified)
// ═══════════════════════════════════════════════════════════════════════════

export const QIYAMAH_ARCHITECTURAL_SPECIFICATION = {
  communicationSignals: COMMUNICATION_SIGNALS,

  layer_I: {
    purposeAuthority:   ENTITY_PURPOSE_AUTHORITY,
    characterAuthority: ENTITY_CHARACTER_AUTHORITY,
    guardianProtocol:   ENTITY_GUARDIAN_PROTOCOL,
  },

  layer_II: {
    trustRegister:          ENTITY_TRUST_REGISTER,
    creativeProfile:        ENTITY_CREATIVE_PROFILE,
    partnershipChronology:  ENTITY_PARTNERSHIP_CHRONOLOGY,
  },

  layer_III: {
    narrativeClock:           ENTITY_NARRATIVE_CLOCK,
    participantOrchestrator:  ENTITY_PARTICIPANT_ORCHESTRATOR,
    storyCoherence:           ENTITY_STORY_COHERENCE,
  },

  layer_IV: {
    presenceMonitor: ENTITY_PRESENCE_MONITOR,
    temporalMonitor: ENTITY_TEMPORAL_MONITOR,
    spatialMonitor:  ENTITY_SPATIAL_MONITOR,
  },

  layer_V: {
    imaginationClarifier: ENTITY_IMAGINATION_CLARIFIER,
    pursuitEngine:        ENTITY_PURSUIT_ENGINE,
    crossingTracker:      ENTITY_CROSSING_TRACKER,
    revealCoordinator:    ENTITY_REVEAL_COORDINATOR,
  },

  root: ENTITY_QIYAMAH_CHAMBER,

  traceability: SPECIFICATION_TRACEABILITY,

  decree: 'This specification translates constitutional authority into architectural precision. Every entity named here must be implemented. No entity not named here may exist. Every communication must pass through a named signal. Every output of every entity must pass through GuardianProtocol. The Citizen faces the Court — not the specification.' as const,
} as const;
