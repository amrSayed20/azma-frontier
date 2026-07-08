/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 13 — INTERFACE ECOSYSTEM PACKAGE (INTERFACE COORDINATION)
 * (Construction ID RAS-II-12, certified as hierarchy Stage 13 — the
 * directive's own title read "Stage 12," already Implementation's certified
 * number; per the numbering ruling already applied at Stage 10/11
 * [unbroken stage=position-10 rule, new package takes the number of what it
 * displaces], this package sits at position 23, between Implementation[22]
 * and Interface, making it Stage 13.)
 *
 * Merges two of the twenty-five originally-proposed files
 * (INTERFACE_COORDINATION.ts and INTERFACE_DEPENDENCIES.ts) into one
 * constitutional artifact, per AZMA-CA-RULING-016 rule 6 ("whenever
 * multiple proposed files represent one constitutional responsibility,
 * merge them into one"): both would have named the same thing — which
 * upstream artifacts INTERFACE.ts actually consumes.
 *
 * Defines coordination between Interface and Runtime, Implementation, and
 * Architecture — extending IMPLEMENTATION_COORDINATION.ts's artifact set
 * (Stage 11), which had no 'INTERFACE' member. This is genuinely new
 * content, not a restatement.
 *
 * HONESTY CHECK performed before writing: the Stage 12 directive's Work
 * Package F template lists Specification, Behavior, and Interfaces
 * (plural) as artifacts this coordination should also cover. INTERFACE.ts
 * was read in full and contains no direct citation to SPECIFICATION.ts,
 * BEHAVIOR.ts, or INTERFACES.ts (plural) anywhere in its text — only to
 * RUNTIME.ts, IMPLEMENTATION.ts, and ARCHITECTURE.ts. Fabricating direct
 * edges to the other three would contradict INTERFACE.ts's own stated
 * design principle ("Interfaces are designed from the Consumer's
 * responsibility, never from what Implementation happens to expose") and
 * this Chamber's practice of not inventing grounding that does not exist.
 * Specification-level grounding for RECOMMENDATION_VALIDATION_PROTOCOL
 * (the one architecturalSource INTERFACE.ts cites that ultimately traces to
 * a Module) is already established one layer down, in
 * IMPLEMENTATION_COORDINATION.ts's implementationOnSpecification edge —
 * noted below as inherited, not restated.
 */

export type RasAlAmrInterfaceCoordinationArtifactName =
  | 'ARCHITECTURE'
  | 'RUNTIME'
  | 'IMPLEMENTATION'
  | 'INTERFACE';

export interface RasAlAmrInterfaceCoordinationEdge {
  readonly purpose: string;
  readonly source: RasAlAmrInterfaceCoordinationArtifactName;
  readonly target: RasAlAmrInterfaceCoordinationArtifactName;
  readonly direction: 'interface-consumes-upstream';
  readonly scope: string;
  readonly constraints: readonly string[];
  readonly traceability: readonly string[];
}

export const INTERFACE_COORDINATION_EDGES: Readonly<Record<string, RasAlAmrInterfaceCoordinationEdge>> = {
  interfaceOnRuntime: {
    purpose: 'Translate Runtime-vocabulary state and signals into Creator-facing vocabulary, never expose Runtime types directly.',
    source: 'INTERFACE',
    target: 'RUNTIME',
    direction: 'interface-consumes-upstream',
    scope: 'SessionBeat, RecommendationOutcome, ChamberTransformationUpdateSignal, RecommendationOfferedSignal, ExportConfirmationState — all imported and immediately translated into CreatorJourneyMoment / CreatorRecommendation / CreatorExportConfirmation / SharedMemoryHandoff, never re-exported as-is.',
    constraints: ['INTERFACE.ts\'s own visibilityBoundary (Section I) forbids exposing RuntimeContext internals, RecommendationGate/GateOutcome identifiers, or BeatTransitionResult\'s internal reason enum to the Creator.'],
    traceability: ['INTERFACE.ts, Section I (CREATOR_INTERFACE_SPECIFICATION.runtimeSource, SHARED_MEMORY_INTERFACE_SPECIFICATION.runtimeSource).'],
  },
  interfaceOnImplementation: {
    purpose: 'Delegate every beat-transition decision to Implementation\'s already-certified enforcement mechanism; decide nothing itself.',
    source: 'INTERFACE',
    target: 'IMPLEMENTATION',
    direction: 'interface-consumes-upstream',
    scope: 'requestBeatTransition calls attemptExportConfirmedTransition (IMPLEMENTATION.ts) directly — the only path by which a beat may advance.',
    constraints: ['The Creator\'s call to requestBeatTransition *is* the authorization (Trust.creatorAuthority) — Interface supplies authorizedByCreator=true and nothing else; it makes no decision of its own.'],
    traceability: ['INTERFACE.ts, Section III, requestBeatTransition; IMPLEMENTATION_COORDINATION.ts, implementationOnRuntime (same underlying flow, one layer down).'],
  },
  interfaceOnArchitecture: {
    purpose: 'Ground every Interface specification in a named Architecture rule, never an invented one.',
    source: 'INTERFACE',
    target: 'ARCHITECTURE',
    direction: 'interface-consumes-upstream',
    scope: 'RECOMMENDATION_VALIDATION_PROTOCOL.all_gates_pass, STORY_BEAT_TRANSITION_AUTHORITY, CONSTITUTIONAL_BOUNDARIES.the_sovereignty_boundary, INFORMATION_FLOW.accumulation_flow, DOMAIN_INTERACTION_RULES.rule_3_partnership_invisibility.',
    constraints: ['Specification-level grounding for RECOMMENDATION_VALIDATION_PROTOCOL is inherited transitively via Implementation (see IMPLEMENTATION_COORDINATION.ts, implementationOnSpecification) — not restated here as a direct Interface→Specification edge, since none was found in INTERFACE.ts\'s own text.'],
    traceability: ['INTERFACE.ts, Section I (CREATOR_INTERFACE_SPECIFICATION.architecturalSource, SHARED_MEMORY_INTERFACE_SPECIFICATION.architecturalSource).'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// COORDINATION CONSISTENCY CHECK — actually performed, not assumed
// ═══════════════════════════════════════════════════════════════════════════

export const INTERFACE_COORDINATION_CHECK = {
  method: "Checked every one of INTERFACE.ts's own constructs (CREATOR_INTERFACE_SPECIFICATION, SHARED_MEMORY_INTERFACE_SPECIFICATION, RECOMMENDATION_GATE_JUDGMENT_VACANCY, INTERNAL_ONLY_ELEMENTS, toCreatorRecommendation, requestBeatTransition, toSharedMemoryHandoff) against Runtime/Implementation/Architecture for a named owner — extending IMPLEMENTATION_COORDINATION_CHECK's (Stage 11) method one layer further, to Interface itself.",
  result: 'PASS',
  detail: 'No Interface construct was found without a named upstream owner. RECOMMENDATION_GATE_JUDGMENT_VACANCY and INTERNAL_ONLY_ELEMENTS are the two positions where INTERFACE.ts itself already documents a deliberate absence rather than an unowned construct — consistent with the Interface Necessity Principle (AZMA-CA-RULING-009): no Interface shall exist without an authorized Consumer.',
} as const;

export const INTERFACE_COORDINATION_DECLARATION = {
  extendsImplementationCoordinationArtifactSet: true,
  mergesProposedFiles: ['INTERFACE_COORDINATION.ts', 'INTERFACE_DEPENDENCIES.ts'],
  newEdgesIntroduced: Object.keys(INTERFACE_COORDINATION_EDGES).length,
  edgesDeclinedForLackOfDirectGrounding: ['interfaceOnSpecification', 'interfaceOnBehavior', 'interfaceOnInterfacesPlural'],
  status: 'PACKAGE II — STAGE 13, INTERFACE ECOSYSTEM PACKAGE (INTERFACE COORDINATION), submitted for Chief Architect review.',
} as const;

export const RAS_AL_AMR_INTERFACE_COORDINATION = {
  edges: INTERFACE_COORDINATION_EDGES,
  check: INTERFACE_COORDINATION_CHECK,
  declaration: INTERFACE_COORDINATION_DECLARATION,
} as const;
