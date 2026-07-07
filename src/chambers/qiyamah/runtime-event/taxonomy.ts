/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME EVENT MODEL — Systemic Taxonomy
 * Construction Package: Living Runtime — Stage 9 of 13
 *
 * Systemic classification, ordering, and visibility models shared by all
 * sixteen named runtime events (RuntimeSignalKind, runtime/signals.ts),
 * refined for the eleven-stage runtime lifecycle. The seven taxonomy classes
 * reuse EVENT_TAXONOMY (events.ts) verbatim — the membership is identical
 * because the sixteen runtime events are the same sixteen signals, only now
 * typed for the runtime layer.
 *
 * Documentation only — no execution logic, no new event.
 */

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME EVENT TAXONOMY
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_EVENT_TAXONOMY = {
  AMBIENT_INHERITANCE: {
    description: 'Not a discrete emission. Every runtime contract behaves as permanently constrained by it — no emission instant, no ordering relative to any other event.',
    members: ['ConstitutionalComplianceRequirement'],
  },
  CONTINUOUS_CALIBRATION: {
    description: 'Re-computed and re-readable continuously. A stale read is never valid once a newer value exists.',
    members: ['PartnershipDepthSignal', 'UnderstandingPrecisionSignal', 'TrustDepthSignal', 'EnvironmentalQualitySignal'],
  },
  DISCRETE_DECLARATION: {
    description: 'Emitted exactly once per underlying runtime state transition and fanned out to every subscriber simultaneously.',
    members: ['StoryBeatDeclaration', 'NarrativeContextSignal', 'CreativeActStateSignal'],
  },
  ONE_TIME_AUTHORIZATION: {
    description: 'Emitted at most once per creative act, only upon a specific condition genuinely satisfied. Authorizes exactly one downstream runtime state transition.',
    members: ['MarkerConfirmationSignal', 'AfterCompletionSignal', 'PresentationAuthorization', 'GenuineConfirmation', 'CitizenEncounterConfirmation'],
  },
  ACCUMULATION_TRANSFER: {
    description: 'A one-directional, reverse-flow transfer absorbed by its recipients rather than acted upon as a command. Carries no governance authority.',
    members: ['RelationalCrossingUpdate'],
  },
  EXTERNAL_INGRESS: {
    description: 'Originates outside the runtime entirely. No runtime contract may emit this event — only the Citizen.',
    members: ['CitizenExpression'],
  },
  CONTEXT_QUERY: {
    description: 'Read by a consumer as background context for a decision it is already making — never itself the trigger for that decision.',
    members: ['CrossingState'],
  },
} as const;

export type RuntimeEventTaxonomyClass = keyof typeof RUNTIME_EVENT_TAXONOMY;

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME EVENT ORDERING
// Refines RUNTIME_INTERACTION_SEQUENCING (runtime-behavior/systemic.ts) into
// event-level precedence.
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_EVENT_ORDERING = {
  act_scoped_precedence: [
    'CitizenExpression precedes everything else in an act.',
    'UnderstandingPrecisionSignal and TrustDepthSignal (as currently valid reads) precede the identified-idea transition that follows CitizenExpression.',
    'The identified-idea transition precedes EnvironmentalQualitySignal and NarrativeContextSignal being read for the same pursuit.',
    'GenuineConfirmation, PresentationAuthorization, and MarkerConfirmationSignal occur at the same ordering position — none precedes another.',
    'PresentationAuthorization precedes CitizenEncounterConfirmation.',
    'GenuineConfirmation precedes CitizenEncounterConfirmation in CrossingTracker\'s own registration order (Outward before Inward).',
    'CitizenEncounterConfirmation precedes AfterCompletionSignal.',
    'AfterCompletionSignal precedes RelationalCrossingUpdate.',
  ],
  session_scoped_precedence: [
    'StoryBeatDeclaration for a given lifecycle stage precedes any CreativeActStateSignal calibrated to that stage.',
    'CreativeActStateSignal precedes the next StoryBeatDeclaration when the two are causally linked (e.g. revelation-complete precedes the Reflecting-enabling AfterCompletionSignal).',
  ],
  partnership_scoped_precedence: [
    'RelationalCrossingUpdate precedes any subsequent PartnershipDepthSignal, UnderstandingPrecisionSignal, or TrustDepthSignal read that reflects the deepened state.',
  ],
  cross_scale_rule: 'An event scoped to a narrower runtime lifecycle (act) may never be reordered ahead of an event it causally depends on from a wider scope (session, partnership) — but a wider-scope event never depends on or waits for a narrower one beyond what is explicitly listed above.',
  traceability: 'SYSTEMIC_EVENT_ORDERING (events.ts), RUNTIME_INTERACTION_SEQUENCING (runtime-behavior/systemic.ts)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME EVENT VISIBILITY MODEL
// Reuses RuntimeSignalVisibility (runtime/signals.ts) verbatim.
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_EVENT_VISIBILITY_MODEL = {
  INTERNAL_ONLY: {
    description: 'Never observable by the Citizen in any form.',
    members: ['PartnershipDepthSignal', 'UnderstandingPrecisionSignal', 'TrustDepthSignal', 'NarrativeContextSignal', 'RelationalCrossingUpdate', 'GenuineConfirmation', 'PresentationAuthorization', 'CrossingState', 'CitizenEncounterConfirmation'],
  },
  FELT_EFFECT_ONLY: {
    description: 'Its consequence reaches the Citizen as felt quality or narrative experience; the event itself never does.',
    members: ['StoryBeatDeclaration', 'EnvironmentalQualitySignal', 'CreativeActStateSignal', 'MarkerConfirmationSignal', 'AfterCompletionSignal'],
  },
  CITIZEN_ORIGINATED: {
    description: 'Produced by the Citizen; the Citizen is naturally aware of having produced it.',
    members: ['CitizenExpression'],
  },
  NOT_APPLICABLE: {
    description: 'Ambient inheritance carries no discrete visibility question.',
    members: ['ConstitutionalComplianceRequirement'],
  },
} as const;
