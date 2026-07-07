/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME INTEGRATION MODEL — Isolation Boundaries and Continuity Guarantees
 * Construction Package: Living Runtime — Stage 11 of 13
 *
 * Refines FAILURE_ISOLATION_BOUNDARIES and END_TO_END_CONTINUITY (integration.ts)
 * into runtime terms, using the failure classifications already established in
 * runtime-validation/hierarchy.ts.
 *
 * Documentation only — no execution logic, no new isolation or continuity rule.
 */

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME ISOLATION BOUNDARIES
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_ISOLATION_BOUNDARIES = {
  principle: 'A failure at any runtime contract is contained at that contract. It never propagates as corrupted state, a partial event, or a degraded signal into an adjacent contract, module, or lifecycle scale.',

  by_contract: [
    { contract: 'FutureAIEngineContract', isolation: 'A false resolution (RENEWAL) never reaches CreativeRuntimeContract as anything other than the Directing→Creating transition — no partial marker detail escapes to CompanionContract, GhostGuideContract, or InvisibleDirectorContract.' },
    { contract: 'CitizenContract',        isolation: 'An incomplete or confused expression never blocks the runtime — it is absorbed as a Clarifying self-loop, never surfaced as an error to any other contract.' },
    { contract: 'GhostGuideContract, CompanionContract', isolation: 'An attempted offer outside its permitted window (mayIntervene()/mayOffer() both false) is simply never produced — no exception, no degraded output, reaches InvisibleDirectorContract or CreativeRuntimeContract.' },
  ],

  by_lifecycle_scale: [
    { scale: 'act (Idea/Prompt/Reflection/Rendering/Completion states)', isolation: 'A renewal or an interrupted act never promotes a partial value into JourneyState or CreativeSessionState — an incomplete act contributes nothing session-scoped (mid_scale_interruption, state.ts).' },
    { scale: 'session (Journey/CreativeSession/Decision/Director/GhostGuide/Companion/Exit states)', isolation: 'A session-scoped contradiction (e.g. two contracts disagreeing on DecisionState.creativeDecisionRegistered) is prevented structurally by the single_timing_context rule (runtime-state/taxonomy.ts) rather than repaired after the fact.' },
    { scale: 'partnership (RuntimeContext.citizenId, cross-session-fed signals)', isolation: 'A failure within one session never corrupts citizenId or any subsequent session\'s fresh initialization — only a fully completed RelationalCrossingUpdate is ever absorbed cross-session.' },
  ],

  by_validation_failure_class: {
    SILENT_DISCARD:        'Contained entirely at the producing contract — no consumer ever observes a partial value.',
    RENEWAL:                'Contained at FutureAIEngineContract/PursuitEngine-equivalent — the prior attempt never becomes visible to any other contract.',
    STATE_TRANSITION:       'Contained as a state fact (e.g. a trust-manipulation violation) rather than as event content — no violating payload ever propagates.',
    REJECTION:              'Contained per-element within RelationalCrossingUpdate — a disqualified element never blocks qualifying ones.',
    HELD_AT_CURRENT_STATE:  'Contained at ChamberRuntimeState — an unauthorized transition request simply leaves currentStage() unchanged.',
  },

  cross_scale_containment_rule: 'A failure never crosses a lifecycle-scale boundary upward. An act-scoped failure cannot corrupt session-scoped state; a session-scoped failure cannot corrupt partnership-scoped state — structurally impossible, since narrower scopes never govern wider ones (RUNTIME_COMPOSITION_RULES.rule_1_no_upward_module_governance, composition.ts).',

  traceability: 'FAILURE_ISOLATION_BOUNDARIES (integration.ts), RUNTIME_VALIDATION_FAILURE_CLASSIFICATION (runtime-validation/hierarchy.ts)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME CONTINUITY GUARANTEES
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_CONTINUITY_GUARANTEES = {
  within_an_act: 'From CitizenExpression to RelationalCrossingUpdate, the act is one uninterrupted sequence (runtime-integration/sequencing.ts). A renewal is not a break in continuity — it is the same IdeaState pursued again, still within the same act.',

  across_acts_within_a_session: 'JourneyState.coherenceThreadLength (runtime-state/states.ts) guarantees that consecutive acts within one session integrate into a single narrative — it only ever increases, never resets between acts.',

  across_sessions_within_a_partnership: 'RuntimeContext.citizenId (runtime-state/states.ts) persists across every session; CreativeSessionState.partnershipPhase is recalibrated, never replayed, at each new session\'s Beginning — continuity is expressed as calibration depth, never as restored history.',

  the_single_experience_guarantee: 'At every scale, no runtime contract exposes a seam: not between contracts within an act (rule_3_no_mechanism_seam, composition.ts), not between acts within a session, not between sessions within a partnership. CreativeRuntimeContract\'s composing role (RUNTIME_INTEGRATION_OWNERSHIP, composition.ts) is what makes this guarantee architectural rather than incidental.',

  traceability: 'END_TO_END_CONTINUITY (integration.ts), SYSTEMIC_RESTORATION_MODEL (runtime-state/taxonomy.ts, as RUNTIME_STATE_RESTORATION_MODEL)',
} as const;
