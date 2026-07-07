/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME VALIDATION MODEL — Systemic Hierarchy
 * Construction Package: Living Runtime — Stage 10 of 13
 *
 * Refines VALIDATION_HIERARCHY and VALIDATION_FAILURE_CLASSIFICATION
 * (validation.ts) into runtime terms: which typed guard function (already
 * existing in runtime-interfaces/facade.ts) performs each tier's check, and
 * which runtime lifecycle transition or state field each failure disposition
 * corresponds to.
 *
 * GuardianProtocol (Layer I) has zero runtime state (STATELESS_CHECK,
 * architecture's state.ts classification) and no dedicated runtime contract —
 * its Tier 2 check is therefore modeled here as a set of cross-cutting
 * constraints every runtime event/contract call must satisfy, not as a
 * callable runtime function. No such function is invented to fill this gap;
 * the gap itself is documented in Section RUNTIME_BOUNDARY_CHECKS_WITHOUT_A_GUARD
 * (boundary-checks.ts).
 *
 * Documentation only — no execution logic, no new validation rule.
 */

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME VALIDATION HIERARCHY
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_VALIDATION_HIERARCHY = {
  tier_1_domain_validation: {
    description: 'A domain-specific runtime guard function, already defined in runtime/contracts.ts, runtime/lifecycle.ts, or runtime/signals.ts and re-exported by runtime-interfaces/facade.ts, that answers one narrow question about current runtime state.',
    members: ['validation_1_imagination_reception', 'validation_2_relationship_mode', 'validation_3_pre_presentation_markers', 'validation_4_revelation_presentation', 'validation_5_memory_update', 'validation_6_experience_layer_compliance'],
  },
  tier_2_boundary_validation: {
    description: 'A universal constraint applied to every runtime event and contract call, regardless of which Tier 1 guard (if any) already ran. Not itself a single callable function, since GuardianProtocol has no runtime contract — expressed as a checklist every Tier 1 guard\'s caller must additionally honor.',
    members: ['the_sovereignty_boundary', 'the_trust_manipulation_boundary', 'the_clock_time_boundary', 'the_mechanism_boundary', 'the_memory_display_boundary', 'the_production_presentation_boundary', 'the_proclamation_boundary', 'the_standard_boundary'],
  },
  tier_3_containment: {
    description: 'The disposition applied once a Tier 1 or Tier 2 check fails — never itself a check.',
    traceability: 'RUNTIME_VALIDATION_FAILURE_CLASSIFICATION (this file)',
  },
  ordering_rule: 'A Tier 1 guard returning true does not exempt the caller from Tier 2 — both are always in force. A Tier 1 guard returning false means no Tier 2 evaluation is needed, because no output was produced to check.',
  traceability: 'VALIDATION_HIERARCHY (validation.ts)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME VALIDATION FAILURE CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_VALIDATION_FAILURE_CLASSIFICATION = {
  SILENT_DISCARD: {
    description: 'The proposed runtime event or contract-call result is discarded entirely — it never reaches any state field, in any partial form.',
    runtimeExamples: ['A CreativeActStateSignal carrying a computed duration value is never composed into EnvironmentalQualitySignal.', 'Language produced while isChamberSilent(context) is true is never delivered.'],
  },
  RENEWAL: {
    description: 'No event is produced; the originating contract returns to its prior input and repeats without exposing the failed attempt.',
    runtimeExamples: ['FutureAIEngineContract.pursue() resolving false triggers the Directing→Creating renewal transition; no MarkerConfirmationSignal, PresentationAuthorization, or GenuineConfirmation is emitted.'],
  },
  STATE_TRANSITION: {
    description: 'The failure itself becomes a named runtime state transition rather than a discarded event.',
    runtimeExamples: ['A detected trust-manipulation violation transitions Layer II\'s trust state toward strained — absorbed as a fact, not as event content.'],
  },
  REJECTION: {
    description: 'A proposed cross-boundary transfer is not constructed at all if any portion fails the check.',
    runtimeExamples: ['A RelationalCrossingUpdate element failing the surveillance test is never included in the emitted event.'],
  },
  HELD_AT_CURRENT_STATE: {
    description: 'A requested runtime lifecycle transition is simply not performed; ChamberRuntimeState.lifecycleStage persists unchanged.',
    runtimeExamples: ['isPermittedLifecycleTransition(from, to) returning false means currentStage() continues reporting from.'],
  },
  traceability: 'VALIDATION_FAILURE_CLASSIFICATION (validation.ts)',
} as const;
