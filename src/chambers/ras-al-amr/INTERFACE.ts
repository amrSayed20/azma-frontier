/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 14 — INTERFACE
 * (renumbered from Stage 5, then 6, 7, 8, 9, 10, 11, 12, 13, upon insertion
 * of SPECIFICATION, INTERFACES, BEHAVIOR, DEPENDENCY_PACKAGE,
 * VALIDATION_PACKAGE, CERTIFICATION_PACKAGE, RUNTIME_FOUNDATION_PACKAGE,
 * IMPLEMENTATION_FOUNDATION_PACKAGE, and INTERFACE_ECOSYSTEM_PACKAGE; no
 * content in this file changed as a result of any renumbering. Distinct
 * from INTERFACES.ts [plural, Stage 4] — that file holds constitutional
 * contracts between architectural Modules; this file holds the
 * Consumer-First creator/Shared-Memory-facing contract. Compliance with
 * every binding invariant re-verified in INVARIANTS.ts — 0 violations.)
 *
 * INTERFACE CONSTRUCTIONAL LAW (this stage's directive, AZMA-CA-RULING-009):
 * An Interface may exist only if an authorized Consumer exists. No Consumer,
 * no Interface. Interfaces are designed from the Consumer's responsibility,
 * never from what Implementation happens to expose. Every Interface below is
 * specified — Consumer, Constitutional Authority, Architectural Source,
 * Runtime Source, Responsibility, Visibility Boundary — in Section I, before
 * any executable artifact appears in Section III.
 *
 * Two authorized Consumers exist for this Chamber:
 *   1. The Creator (hierarchy.ts position 16, USER) — the sole external
 *      beneficiary. Never exposed to Runtime structures (Trust.creatorAuthority,
 *      the mechanism boundary).
 *   2. Shared Memory (a Platform Engine, not this Chamber) — the confirmed
 *      consumer of ChamberTransformationUpdate. RAS AL AMR hands off; it does
 *      not preserve (Charter Article X, Shared-First).
 *
 * One position is deliberately NOT an Interface here: Recommendation Gate
 * judgment supply is an Authorized Constitutional Vacancy (RULING-009,
 * Finding III). No producer for it has been constitutionally authorized, so
 * no Interface assumes one. See Section II.
 */

import type {
  SessionBeat,
  RecommendationOutcome,
  ChamberTransformationUpdateSignal,
  RecommendationOfferedSignal,
  ExportConfirmationState,
} from './RUNTIME';
import { attemptExportConfirmedTransition } from './IMPLEMENTATION';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION I — INTERFACE SPECIFICATIONS
// Fixed before any executable artifact, per the Interface Necessity Principle.
// ═══════════════════════════════════════════════════════════════════════════

export const CREATOR_INTERFACE_SPECIFICATION = {
  consumer: 'The Creator (hierarchy.ts position 16, USER) — the sole external beneficiary the Constitution exists to serve.',
  constitutionalAuthority: [
    'TRUST.ts — creatorAuthority ("The Chamber advises. The creator decides. This constitutional order shall never be reversed.")',
    'TRUST.ts — explanationRules ("The creator may always ask: Why? The Chamber shall answer with clarity, never with mystery.")',
    'SOUL.ts — promise (six vows; silencePrinciple)',
    'STORY.ts — export ("The final decision always belongs to the creator.")',
  ],
  architecturalSource: [
    'RECOMMENDATION_VALIDATION_PROTOCOL.all_gates_pass (ARCHITECTURE.ts, owned by Suggestion Domain)',
    'STORY_BEAT_TRANSITION_AUTHORITY; structural_note (ARCHITECTURE.ts)',
    'CONSTITUTIONAL_BOUNDARIES.the_sovereignty_boundary (ARCHITECTURE.ts)',
  ],
  runtimeSource: [
    'RecommendationOfferedSignal (RUNTIME.ts)',
    'RUNTIME_SESSION_LIFECYCLE_TRANSITIONS (RUNTIME.ts)',
    'ExportConfirmationState (RUNTIME.ts) — reachable since AZMA-CA-RULING-013 via attemptExportConfirmedTransition (IMPLEMENTATION.ts)',
  ],
  responsibility:
    'Preserve the Creator\'s final decision authority. Present an offered recommendation as explained-and-optional, never as a command. Let the Creator, and only the Creator, trigger beat advancement. Never decide on the Creator\'s behalf.',
  visibilityBoundary: [
    'Excludes SessionBeat as a Runtime type identity — the Creator sees constitutional beat vocabulary translated through this Interface, never an imported Runtime type.',
    'Excludes RuntimeContext internals (sessionId, projectId) — technical correlation the Creator does not need to experience.',
    'Excludes RecommendationGate / GateOutcome identifiers entirely — internal validation vocabulary, never shown.',
    'Excludes BeatTransitionResult\'s internal reason enum ("session-complete" / "not-the-authorized-next-beat" / "not-authorized-by-creator") — the Creator experiences accepted-or-not, never the mechanism that decided it (the mechanism-exposure boundary, Space.aiSpace / Soul.constitutionalRole).',
    'Excludes PartnershipRuntimeState entirely (Memory.constitutionalMemoryPrinciple.never).',
  ],
} as const;

export const SHARED_MEMORY_INTERFACE_SPECIFICATION = {
  consumer: 'Shared Memory (a Platform Engine external to this Chamber) — confirmed by AZMA-CA-RULING-009, Finding IV.',
  constitutionalAuthority: [
    'MEMORY.ts — constitutionalMemoryPrinciple ("Memory shall always serve creative continuity... shall never become surveillance.")',
    'MEMORY.ts — privacyPrinciple ("Only information that serves the creator\'s artistic journey may be preserved.")',
    'TRANSFORMATION.ts — chamberTransformation.learnsFrom ("Accepted recommendations." / "Rejected recommendations.")',
  ],
  architecturalSource: [
    'INFORMATION_FLOW.accumulation_flow (ARCHITECTURE.ts) — the sole permitted reverse flow, Layer V → Layer II.',
    'DOMAIN_INTERACTION_RULES.rule_3_partnership_invisibility (ARCHITECTURE.ts).',
  ],
  runtimeSource: ['ChamberTransformationUpdateSignal (RUNTIME.ts)'],
  responsibility:
    'Hand off the resolved recommendation outcome so Director DNA may accumulate on the Platform. This Chamber hands off; it does not persist, store, or retain this record itself (Charter Article X, Shared-First).',
  visibilityBoundary: [
    'Excludes sessionId and projectId — Director DNA is creator-specific across sessions and projects (MEMORY.ts — longTermPartnership), not session- or project-scoped, so neither correlates to anything Shared Memory needs from this hand-off.',
    'Excludes the Runtime signal\'s internal "kind" discriminant tag — a Runtime/Implementation-internal concern, not Platform-facing content.',
    'Carries no project content of any kind — only creatorId and the outcome value.',
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION II — NON-INTERFACES
// Positions where the Interface Necessity Principle forbids construction.
// Documented explicitly so their absence is traceable, not an oversight.
// ═══════════════════════════════════════════════════════════════════════════

export const RECOMMENDATION_GATE_JUDGMENT_VACANCY = {
  status: 'Authorized Constitutional Vacancy (AZMA-CA-RULING-009, Finding III).',
  reason: 'No constitutional authority has been created for the entity that assigns Recommendation Gate truth values (Space.aiSpace forbids AI from holding constitutional authority; no human-advisor channel has been authorized either).',
  ruling: 'No placeholder authority shall be invented. No temporary AI authority shall be introduced. No Interface shall assume a supplier that has not yet been constitutionally authorized. The vacancy remains until Constitutional Authority explicitly creates such an authority.',
  consequence: 'This file defines no Interface for supplying gateResults to evaluateRecommendationCycle/resolveRecommendationCycle (IMPLEMENTATION.ts). That input remains the caller\'s responsibility, sourced from outside the approved constitutional chain, until a Constitutional Authority acts.',
} as const;

export const INTERNAL_ONLY_ELEMENTS = {
  beatDeclaredSignal: {
    element: 'BeatDeclaredSignal (RUNTIME.ts)',
    reason: 'Its complete lifecycle (Layer III → Layer IV, Layer V) stays inside the Chamber Runtime (AZMA-CA-RULING-009, Finding V). The Creator experiences its effect (an atmospheric shift) through the Chamber, never the signal itself.',
  },
  chamberPresenceConsistency: {
    element: 'isChamberPresenceConsistentWithBeat (IMPLEMENTATION.ts)',
    reason: 'A Runtime self-consistency check with no external consumer — nothing outside the Chamber needs to know whether presence and beat agree; it exists to protect the Chamber\'s own internal invariant.',
  },
  sessionCompletionCheck: {
    element: 'isSessionComplete (IMPLEMENTATION.ts)',
    reason: 'No authorized external consumer identified for this boolean in isolation. It remains available for a future in-Chamber caller; exposing it as a standalone Interface would be exposing implementation convenience, which AZMA-CA-RULING-009 forbids.',
  },
} as const;

export const DISCOVERED_GAP_EXPORT_CONFIRMATION = {
  status: 'RESOLVED in two stages — AZMA-CA-RULING-011 (Stage 4 enforcement added) and AZMA-CA-RULING-013 (Stage 5 wiring completed). No longer open.',
  originalObservation:
    'STORY.ts.export and CONSTITUTIONAL_VALIDATION_POINTS.validation_4_export_confirmation (ARCHITECTURE.ts) establish a Creator consumer for export-destination confirmation, and RUNTIME.ts already declared EXPORT_CONFIRMATION_STATES for it — but IMPLEMENTATION.ts (Stage 4, certified under AZMA-CA-RULING-008) originally contained no enforcement function over that Runtime element.',
  resolution:
    'AZMA-CA-RULING-011 added attemptExportConfirmedTransition to IMPLEMENTATION.ts as a Certified Amendment. A second gap then surfaced during Stage 6 (USER) review — this Interface still called the older attemptBeatTransition, so the new enforcement was unreachable by the Creator. AZMA-CA-RULING-013 reopened this Stage narrowly to route requestBeatTransition through attemptExportConfirmedTransition instead. Both gaps are now closed.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SECTION III — EXECUTABLE INTERFACE ARTIFACTS
// Gives shape only to what Section I specified. Consumes IMPLEMENTATION.ts
// and RUNTIME.ts; never bypasses either.
// ═══════════════════════════════════════════════════════════════════════════

// ── Creator Interface: journey vocabulary ──────────────────────────────────
// Constitutional words (STORY.ts's own beat names), re-declared as this
// Interface's own type rather than re-exporting SessionBeat — the seam is
// the point: a change to RUNTIME.ts's internal type must not silently
// propagate to the Creator contract.

export const CREATOR_JOURNEY_MOMENTS = [
  'Entry', 'Discovery', 'Guidance', 'Creation', 'Perfection', 'Screening', 'Export', 'Farewell',
] as const;
export type CreatorJourneyMoment = (typeof CREATOR_JOURNEY_MOMENTS)[number];

function toCreatorJourneyMoment(beat: SessionBeat): CreatorJourneyMoment {
  return beat;
}

// ── Creator Interface: recommendation exposure ──────────────────────────────

export interface CreatorRecommendation {
  readonly explainable: true;
  readonly optional: true;
}

/**
 * Translates an already-offered Runtime signal into the Creator's contract.
 * Does not decide whether to offer — that decision already happened in
 * IMPLEMENTATION.ts's evaluateRecommendationCycle. Fabricates no explanation
 * text: producing the actual "why" answer is creative-judgment content, the
 * same Authorized Constitutional Vacancy documented in Section II — this
 * function only guarantees the contractual affordance exists.
 */
export function toCreatorRecommendation(
  signal: Omit<RecommendationOfferedSignal, 'context'>,
): CreatorRecommendation {
  return { explainable: signal.explainable, optional: signal.optional };
}

// ── Creator Interface: beat transition request ──────────────────────────────
//
// CERTIFIED AMENDMENT (AZMA-CA-RULING-013): this transition path now routes
// through attemptExportConfirmedTransition (IMPLEMENTATION.ts) instead of
// attemptBeatTransition, so the Export → Farewell confirmation requirement
// (STORY.ts.export; validation_4_export_confirmation) is actually reachable
// by the Creator — closing the gap USER.ts's Creator Guarantee Ledger
// recorded. For every other beat pair, isExportConfirmationSatisfied returns
// true unconditionally, so behavior is unchanged there.

/** Creator-facing vocabulary for export confirmation — its own type, not a
 * re-export of RUNTIME.ts's ExportConfirmationState, for the same reason
 * CreatorJourneyMoment is not a re-export of SessionBeat (visibilityBoundary,
 * Section I): the seam must survive a future change to the Runtime type. */
export const CREATOR_EXPORT_CONFIRMATION_STATES = ['unconfirmed', 'confirmed'] as const;
export type CreatorExportConfirmation = (typeof CREATOR_EXPORT_CONFIRMATION_STATES)[number];

function toRuntimeExportConfirmation(confirmation: CreatorExportConfirmation): ExportConfirmationState {
  return confirmation;
}

export type CreatorBeatTransitionOutcome =
  | { readonly accepted: true; readonly newMoment: CreatorJourneyMoment }
  | { readonly accepted: false };

/**
 * The only path by which a beat may advance. The Creator's act of calling
 * this function *is* the authorization (Trust.creatorAuthority) — there is
 * no other caller in this Chamber's design who may supply `true` to
 * attemptExportConfirmedTransition's authorizedByCreator parameter through
 * this seam. Internal rejection reasons are deliberately not surfaced
 * (visibilityBoundary, Section I) — accepted or not is all the Creator
 * experiences, including when the rejection reason is "export-not-confirmed".
 *
 * `exportConfirmation` defaults to `'unconfirmed'` — backward compatible with
 * every existing call site, and constitutionally the only safe default: an
 * omitted confirmation must never be treated as given.
 */
export function requestBeatTransition(
  current: CreatorJourneyMoment,
  requested: CreatorJourneyMoment,
  exportConfirmation: CreatorExportConfirmation = 'unconfirmed',
): CreatorBeatTransitionOutcome {
  const result = attemptExportConfirmedTransition(
    current,
    requested,
    true,
    toRuntimeExportConfirmation(exportConfirmation),
  );
  if (result.ok) {
    return { accepted: true, newMoment: toCreatorJourneyMoment(result.next) };
  }
  return { accepted: false };
}

// ── Shared Memory Interface: hand-off ───────────────────────────────────────

export interface SharedMemoryHandoff {
  readonly creatorId: string;
  readonly outcome: RecommendationOutcome;
}

/**
 * Projects an already-built Runtime signal down to the minimal shape
 * MEMORY.ts's privacyPrinciple permits Shared Memory to receive. Consumes
 * IMPLEMENTATION.ts's buildChamberTransformationUpdate output — does not
 * construct the signal itself, only narrows it for hand-off.
 */
export function toSharedMemoryHandoff(
  signal: ChamberTransformationUpdateSignal,
): SharedMemoryHandoff {
  return { creatorId: signal.context.creatorId, outcome: signal.outcome };
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION IV — TRACEABILITY AND DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const INTERFACE_TRACEABILITY_MATRIX = {
  creatorInterface: CREATOR_INTERFACE_SPECIFICATION,
  sharedMemoryInterface: SHARED_MEMORY_INTERFACE_SPECIFICATION,
  nonInterfaces: {
    recommendationGateJudgmentVacancy: RECOMMENDATION_GATE_JUDGMENT_VACANCY,
    internalOnlyElements: INTERNAL_ONLY_ELEMENTS,
    discoveredGap: DISCOVERED_GAP_EXPORT_CONFIRMATION,
  },
  chain: [
    'Constitution (Soul → Transformation)',
    'Constitutional Hierarchy (hierarchy.ts, Package II Stage 1)',
    'Constitutional Architecture (ARCHITECTURE.ts, Package II Stage 2)',
    'Architectural Specification (SPECIFICATION.ts, Package II Stage 3)',
    'Architectural Interfaces (INTERFACES.ts, Package II Stage 4)',
    'Architectural Behavior Model (BEHAVIOR.ts, Package II Stage 5)',
    'Architectural Dependency Package (DEPENDENCIES/OWNERSHIP/PERMISSIONS/BOUNDARIES/TRACEABILITY.ts, Package II Stage 6)',
    'Architectural Validation Package (VALIDATION_RULES/CONSISTENCY/INVARIANTS/CERTIFICATION_CHECKLIST/ARCHITECTURAL_AUDIT.ts, Package II Stage 7)',
    'Architectural Certification Package (CERTIFICATION_RULES/READINESS/ARCHITECTURAL_GAPS/ARCHITECTURAL_DEBT.ts, Package II Stage 8)',
    'Runtime Foundation Package (RUNTIME_CONTEXT/RUNTIME_PIPELINE/RUNTIME_VALIDATION/RUNTIME_COORDINATION/RUNTIME_LIFECYCLE.ts, Package II Stage 9)',
    'Living Runtime Foundation (RUNTIME.ts, Package II Stage 10)',
    'Implementation Foundation Package (IMPLEMENTATION_CONTEXT/IMPLEMENTATION_PIPELINE/IMPLEMENTATION_VALIDATION/IMPLEMENTATION_COORDINATION/IMPLEMENTATION_LIFECYCLE.ts, Package II Stage 11)',
    'Implementation (IMPLEMENTATION.ts, Package II Stage 12)',
    'Interface Ecosystem Package (INTERFACE_COORDINATION/INTERFACE_LIFECYCLE.ts, Package II Stage 13)',
    'Interface (this file, Package II Stage 14)',
  ],
} as const;

export const RAS_AL_AMR_INTERFACE_DECLARATION = {
  consumerFirst: true,
  everyInterfaceHasAnAuthorizedConsumer: true,
  noPlaceholderAuthorityInvented: true,
  noInterfaceAssumesAnUnauthorizedSupplier: true,
  bypassesImplementation: false,
  exposesRuntimeStructuresToCreator: false,
  traceability: INTERFACE_TRACEABILITY_MATRIX,
  discharges: [
    'AZMA-CA-RULING-009 (Package II, Stage 14, renumbered from Stage 5, then 6, 7, 8, 9, 10, 11, 12, 13)',
    'AZMA-CA-RULING-013 Certified Amendment — Export Confirmation wiring',
  ],
  status: 'PACKAGE II — STAGE 14 — INTERFACE, previously certified; renumbered upon SPECIFICATION, INTERFACES, BEHAVIOR, DEPENDENCY_PACKAGE, VALIDATION_PACKAGE, CERTIFICATION_PACKAGE, RUNTIME_FOUNDATION_PACKAGE, IMPLEMENTATION_FOUNDATION_PACKAGE, and INTERFACE_ECOSYSTEM_PACKAGE insertion, no content changed.',
} as const;
