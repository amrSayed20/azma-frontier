/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 10 — IMPLEMENTATION
 * (renumbered from Stage 4, then 5, 6, 7, 8, 9, upon insertion of
 * SPECIFICATION, INTERFACES, BEHAVIOR, DEPENDENCY_PACKAGE,
 * VALIDATION_PACKAGE, and CERTIFICATION_PACKAGE; no content in this file
 * changed as a result of any renumbering. Compliance with every binding
 * invariant re-verified in INVARIANTS.ts — 0 violations.)
 *
 * IMPLEMENTATION CONSTITUTIONAL LAW (this stage's directive):
 * Implementation gives executable shape to what RUNTIME.ts already declared.
 * Every function here is a pure, deterministic mechanism over the state
 * shapes, tables, and invariants RUNTIME.ts defines — never over anything
 * else. No function performs creative, constitutional, or architectural
 * judgment of its own.
 *
 * Per the Engineering Directive accompanying AZMA-CA-RULING-006:
 *   - Implementation derives exclusively from Constitution → Constitutional
 *     Hierarchy → Architecture → Living Runtime.
 *   - Implementation never derives behavior directly from Legacy artifacts.
 *   - Implementation never bypasses the approved Runtime.
 * Concretely: this file contains no function that computes whether a
 * recommendation has genuine creative value, whether it truly serves the
 * creator's intention, or any other judgment SOUL.ts, PERSONALITY.ts, or
 * TRUST.ts assign to a creative mind, not a mechanism. Where the
 * recommendation_validation_protocol requires a gate result, this
 * Implementation only *aggregates* gate results supplied from outside
 * (a future AI Space or the creator) — it never assigns them. This mirrors
 * Space.aiSpace.remains: "Artificial Intelligence shall remain an advisor,
 * never the constitutional authority."
 *
 * Nothing here performs networking, persistence, rendering, or any concern
 * belonging to the reserved INTERFACE layer (position 15, this file's only
 * child). This file is pure, side-effect-free TypeScript: given the same
 * inputs, every function here always returns the same output.
 */

import type {
  SessionBeat,
  RecommendationGate,
  GateOutcome,
  RecommendationOutcome,
  ChamberPresenceState,
  TransformationAxis,
  RuntimeContext,
  ChamberTransformationUpdateSignal,
  RecommendationOfferedSignal,
  RecommendationWithheldSignal,
  PartnershipRuntimeState,
  ExportConfirmationState,
} from './RUNTIME';
import {
  RECOMMENDATION_GATES,
  TRANSFORMATION_AXES,
  RUNTIME_SESSION_LIFECYCLE_TRANSITIONS,
} from './RUNTIME';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION I — BEAT TRANSITION ENFORCEMENT
// Executes RUNTIME_SESSION_LIFECYCLE_TRANSITIONS (RUNTIME.ts) and the
// creatorAuthorizesNarrative invariant. Traces to
// STORY_BEAT_TRANSITION_AUTHORITY (ARCHITECTURE.ts).
// ═══════════════════════════════════════════════════════════════════════════

export type BeatTransitionResult =
  | { readonly ok: true; readonly next: SessionBeat }
  | { readonly ok: false; readonly reason: 'session-complete' | 'not-the-authorized-next-beat' | 'not-authorized-by-creator' | 'export-not-confirmed' };

/**
 * The only legal next beat from `current`, per RUNTIME_SESSION_LIFECYCLE_TRANSITIONS.
 * Pure lookup — makes no decision about whether the moment is right to advance.
 */
export function getAuthorizedNextBeat(current: SessionBeat): SessionBeat | null {
  return RUNTIME_SESSION_LIFECYCLE_TRANSITIONS[current];
}

/**
 * Enforces two invariants together: forward-only progression (no skip, no
 * reversal — the requested beat must equal the one authorized next beat) and
 * creatorAuthorizesNarrative (RUNTIME.ts) — `authorizedByCreator` must be
 * true. This function decides nothing about *when* a creator has authorized
 * a transition; that determination happens outside this Implementation
 * (Interface layer / the creator's own action) and is only checked here.
 */
export function attemptBeatTransition(
  current: SessionBeat,
  requested: SessionBeat,
  authorizedByCreator: boolean,
): BeatTransitionResult {
  const authorizedNext = getAuthorizedNextBeat(current);
  if (authorizedNext === null) {
    return { ok: false, reason: 'session-complete' };
  }
  if (requested !== authorizedNext) {
    return { ok: false, reason: 'not-the-authorized-next-beat' };
  }
  if (!authorizedByCreator) {
    return { ok: false, reason: 'not-authorized-by-creator' };
  }
  return { ok: true, next: authorizedNext };
}

/**
 * CERTIFIED AMENDMENT (AZMA-CA-RULING-011): Executes
 * CONSTITUTIONAL_VALIDATION_POINTS.validation_4_export_confirmation
 * (ARCHITECTURE.ts) — Export → Farewell may not proceed unless the creator
 * has confirmed the destination. For every other beat pair this invariant
 * does not apply; returns true unconditionally, deferring entirely to
 * attemptBeatTransition's existing checks.
 */
export function isExportConfirmationSatisfied(
  current: SessionBeat,
  requested: SessionBeat,
  exportConfirmation: ExportConfirmationState,
): boolean {
  if (current === 'Export' && requested === 'Farewell') {
    return exportConfirmation === 'confirmed';
  }
  return true;
}

/**
 * CERTIFIED AMENDMENT (AZMA-CA-RULING-011): Composes the existing
 * attemptBeatTransition (unmodified) with the export-confirmation check
 * above. attemptBeatTransition's own behavior is unchanged — this function
 * only adds one further condition on top of an already-successful result,
 * exactly where STORY_BEAT_TRANSITION_AUTHORITY.export_to_farewell
 * (ARCHITECTURE.ts) requires it: "Authorized when the
 * creator, having watched as audience, confirms the destination."
 */
export function attemptExportConfirmedTransition(
  current: SessionBeat,
  requested: SessionBeat,
  authorizedByCreator: boolean,
  exportConfirmation: ExportConfirmationState,
): BeatTransitionResult {
  const baseResult = attemptBeatTransition(current, requested, authorizedByCreator);
  if (!baseResult.ok) {
    return baseResult;
  }
  if (!isExportConfirmationSatisfied(current, requested, exportConfirmation)) {
    return { ok: false, reason: 'export-not-confirmed' };
  }
  return baseResult;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION II — SCREENING SILENCE ENFORCEMENT
// Executes RUNTIME_INVARIANTS.screeningRequiresWithdrawal and
// .screeningForbidsLayerVSignals (RUNTIME.ts).
// ═══════════════════════════════════════════════════════════════════════════

export function isChamberPresenceConsistentWithBeat(
  currentBeat: SessionBeat,
  chamberPresence: ChamberPresenceState,
): boolean {
  if (currentBeat === 'Screening') {
    return chamberPresence === 'withdrawn';
  }
  return true;
}

/**
 * Whether Layer V may emit any RecommendationOfferedSignal or
 * RecommendationWithheldSignal at all, given the current beat. Unconditional
 * on chamberPresence — Screening forbids Layer V signals outright.
 */
export function mayLayerVSignal(currentBeat: SessionBeat): boolean {
  return currentBeat !== 'Screening';
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION III — RECOMMENDATION CYCLE AGGREGATION
// Executes RECOMMENDATION_VALIDATION_PROTOCOL (ARCHITECTURE.ts, owned by
// Suggestion Domain). Aggregates externally-supplied gate results — assigns
// none of them itself.
// ═══════════════════════════════════════════════════════════════════════════

export type RecommendationCycleResult =
  | { readonly kind: 'offer'; readonly signal: Omit<RecommendationOfferedSignal, 'context'> }
  | { readonly kind: 'withhold'; readonly signal: Omit<RecommendationWithheldSignal, 'context'> }
  | { readonly kind: 'silent'; readonly reason: 'screening-beat' };

/**
 * All four gates (RECOMMENDATION_GATES, RUNTIME.ts) must resolve to "pass".
 * The first gate found failing (in constitutional order: genuineValue,
 * intention, explainability, authority) is reported as the reason for
 * withholding. `gateResults` must already be fully decided by the time this
 * function runs — this function combines those decisions, it does not make
 * them.
 */
export function evaluateRecommendationCycle(
  gateResults: Readonly<Record<RecommendationGate, GateOutcome>>,
): RecommendationCycleResult {
  for (const gate of RECOMMENDATION_GATES) {
    if (gateResults[gate] === 'fail') {
      return { kind: 'withhold', signal: { kind: 'RECOMMENDATION_WITHHELD', failedGate: gate } };
    }
  }
  return {
    kind: 'offer',
    signal: { kind: 'RECOMMENDATION_OFFERED', explainable: true, optional: true },
  };
}

/**
 * Combines a beat check (Section II) with the gate aggregation above. If the
 * Chamber may not signal at all during this beat, the result is "silent" —
 * not "withhold". Withhold still implies a RecommendationWithheldSignal was
 * emitted (a gate failed); Screening forbids emitting any Layer V signal at
 * all, so it cannot be represented as a withhold outcome without fabricating
 * a gate failure that did not occur. Screening silence takes precedence over
 * gate evaluation entirely — gates are not even evaluated in this case.
 */
export function resolveRecommendationCycle(
  currentBeat: SessionBeat,
  gateResults: Readonly<Record<RecommendationGate, GateOutcome>>,
): RecommendationCycleResult {
  if (!mayLayerVSignal(currentBeat)) {
    return { kind: 'silent', reason: 'screening-beat' };
  }
  return evaluateRecommendationCycle(gateResults);
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION IV — CHAMBER TRANSFORMATION UPDATE
// Executes INFORMATION_FLOW.accumulation_flow (ARCHITECTURE.ts): the sole
// permitted reverse flow, Layer V → Layer II. Pure factory — constructs the
// signal, does not decide the outcome it is given.
// ═══════════════════════════════════════════════════════════════════════════

export function buildChamberTransformationUpdate(
  context: RuntimeContext,
  outcome: RecommendationOutcome,
): ChamberTransformationUpdateSignal {
  return { kind: 'CHAMBER_TRANSFORMATION_UPDATE', context, outcome };
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION V — THREE-AXIS COMPLETION CHECK
// Executes CONSTITUTIONAL_BOUNDARIES.the_three_axis_completion_boundary
// (ARCHITECTURE.ts) via RUNTIME_INVARIANTS.threeAxisCompletion (RUNTIME.ts).
// ═══════════════════════════════════════════════════════════════════════════

export function isSessionComplete(
  axesProgressed: Readonly<Partial<Record<TransformationAxis, boolean>>>,
): boolean {
  return TRANSFORMATION_AXES.every((axis) => axesProgressed[axis] === true);
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION VI — PARTNERSHIP INVISIBILITY
// Executes DOMAIN_INTERACTION_RULES.rule_3_partnership_invisibility
// (ARCHITECTURE.ts) via RUNTIME_INVARIANTS.partnershipInvisibility
// (RUNTIME.ts). A type-level guarantee: CreatorFacingView structurally
// cannot include PartnershipRuntimeState, so no future Interface-layer
// value typed as CreatorFacingView can carry it, by construction.
// ═══════════════════════════════════════════════════════════════════════════

export type CreatorFacingView<T> = T extends { partnership: PartnershipRuntimeState }
  ? never
  : T;

/**
 * Strips a partnership field from any object shape before it may be treated
 * as creator-facing. Runtime-enforced companion to the type-level guarantee
 * above, for values whose shape isn't known statically.
 */
export function redactPartnership<T extends Record<string, unknown>>(
  value: T,
): Omit<T, 'partnership'> {
  const rest: Record<string, unknown> = { ...value };
  delete rest.partnership;
  return rest as Omit<T, 'partnership'>;
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION VII — TRACEABILITY MATRIX
// ═══════════════════════════════════════════════════════════════════════════

export const IMPLEMENTATION_TRACEABILITY_MATRIX = {
  beatTransitionEnforcement: 'RUNTIME_SESSION_LIFECYCLE_TRANSITIONS, RUNTIME_INVARIANTS.creatorAuthorizesNarrative (RUNTIME.ts) → STORY_BEAT_TRANSITION_AUTHORITY (ARCHITECTURE.ts)',
  exportConfirmationEnforcement: 'CERTIFIED AMENDMENT, AZMA-CA-RULING-011 — ExportConfirmationState (RUNTIME.ts) → CONSTITUTIONAL_VALIDATION_POINTS.validation_4_export_confirmation; STORY_BEAT_TRANSITION_AUTHORITY.export_to_farewell (ARCHITECTURE.ts) → STORY.ts (export)',
  screeningSilenceEnforcement: 'RUNTIME_INVARIANTS.screeningRequiresWithdrawal, .screeningForbidsLayerVSignals (RUNTIME.ts) → DOMAIN_INTERACTION_RULES.rule_6_screening_silence (ARCHITECTURE.ts) → SPACE.ts',
  recommendationCycleAggregation: 'RECOMMENDATION_GATES (RUNTIME.ts) → RECOMMENDATION_VALIDATION_PROTOCOL (ARCHITECTURE.ts, owned by Suggestion Domain)',
  chamberTransformationUpdate: 'DOMAIN_INTERACTION_RULES.rule_1_no_upward_authority (ARCHITECTURE.ts) — Suggestion Domain → Memory Domain, via Director Core',
  threeAxisCompletion: 'RUNTIME_INVARIANTS.threeAxisCompletion (RUNTIME.ts) → CONSTITUTIONAL_BOUNDARIES.the_three_axis_completion_boundary (ARCHITECTURE.ts)',
  partnershipInvisibility: 'RUNTIME_INVARIANTS.partnershipInvisibility (RUNTIME.ts) → DOMAIN_INTERACTION_RULES.rule_3_partnership_invisibility (ARCHITECTURE.ts)',
  chain: [
    'Constitution (Soul → Transformation)',
    'Constitutional Hierarchy (hierarchy.ts, Package II Stage 1)',
    'Constitutional Architecture (ARCHITECTURE.ts, Package II Stage 2)',
    'Living Runtime Foundation (RUNTIME.ts, Package II Stage 3)',
    'Implementation (this file, Package II Stage 4)',
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// THE IMPLEMENTATION (declaration)
// ═══════════════════════════════════════════════════════════════════════════

export const RAS_AL_AMR_IMPLEMENTATION_DECLARATION = {
  introducesNewAuthority: false,
  derivesFromLegacyArtifacts: false,
  bypassesRuntime: false,
  makesCreativeJudgment: false,
  assignsGateTruthValues: false,
  aggregatesExternallySuppliedJudgment: true,
  producesUi: false,
  producesNetworking: false,
  producesPersistence: false,
  sideEffectFree: true,
  traceability: IMPLEMENTATION_TRACEABILITY_MATRIX,
  discharges: [
    'AZMA-CA-RULING-006 Engineering Directive (Package II, Stage 10, renumbered from Stage 4, then 5, 6, 7, 8, 9)',
    'AZMA-CA-RULING-011 Certified Amendment — Export Confirmation Enforcement',
  ],
  status: 'PACKAGE II — STAGE 10 — IMPLEMENTATION, previously certified; renumbered upon SPECIFICATION, INTERFACES, BEHAVIOR, DEPENDENCY_PACKAGE, VALIDATION_PACKAGE, and CERTIFICATION_PACKAGE insertion, no content changed.',
} as const;
