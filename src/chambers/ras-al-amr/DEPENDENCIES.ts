/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 6 — ARCHITECTURAL DEPENDENCY PACKAGE (STEP 1 OF 5: DEPENDENCIES)
 *
 * Defines every constitutional dependency between the six named artifacts:
 * Constitution, Hierarchy (hierarchy.ts), Architecture (ARCHITECTURE.ts),
 * Specification (SPECIFICATION.ts), Interfaces (INTERFACES.ts), and Behavior
 * (BEHAVIOR.ts). Each dependency is a directed edge — a downstream artifact
 * consuming an upstream one — never the reverse.
 *
 * Introduces no new constitutional content. Every dependency below is
 * already true by construction (each downstream file already cites its
 * upstream sources); this file makes those citations explicit and complete.
 */

export const RAS_AL_AMR_DEPENDENCY_ARTIFACT_NAMES = [
  'CONSTITUTION', 'HIERARCHY', 'ARCHITECTURE', 'SPECIFICATION', 'INTERFACES', 'BEHAVIOR',
] as const;
export type RasAlAmrDependencyArtifactName = (typeof RAS_AL_AMR_DEPENDENCY_ARTIFACT_NAMES)[number];

export interface RasAlAmrArchitecturalDependency {
  readonly purpose: string;
  readonly source: RasAlAmrDependencyArtifactName;
  readonly target: RasAlAmrDependencyArtifactName;
  readonly direction: 'downstream-consumes-upstream';
  readonly scope: string;
  readonly constraints: readonly string[];
  readonly traceability: readonly string[];
}

export const RAS_AL_AMR_ARCHITECTURAL_DEPENDENCIES: Readonly<Record<string, RasAlAmrArchitecturalDependency>> = {
  hierarchyOnConstitution: {
    purpose: 'Fix the authority order and single-parent chain every future artifact must respect.',
    source: 'HIERARCHY',
    target: 'CONSTITUTION',
    direction: 'downstream-consumes-upstream',
    scope: 'The entire 19-position authority tree.',
    constraints: ['Hierarchy may fix position and traceability only — it may not restate constitutional content (per its own pointer-only discipline).'],
    traceability: ['hierarchy.ts', 'CONSTITUTIONAL_REVIEW.ts'],
  },
  architectureOnConstitution: {
    purpose: 'Ground every Domain\'s responsibility in an actual constitutional article, never invented content.',
    source: 'ARCHITECTURE',
    target: 'CONSTITUTION',
    direction: 'downstream-consumes-upstream',
    scope: 'All 13 Constitutional Capability Domains.',
    constraints: ['Every Domain\'s constitutionalOwnership field must name a real article; none may be fabricated.'],
    traceability: ['ARCHITECTURE.ts (Section I, all 13 domains cite SOUL.ts through TRANSFORMATION.ts directly)'],
  },
  architectureOnHierarchy: {
    purpose: "Occupy exactly the authority position (13) Hierarchy reserved for it.",
    source: 'ARCHITECTURE',
    target: 'HIERARCHY',
    direction: 'downstream-consumes-upstream',
    scope: 'Position 12 only.',
    constraints: ['Architecture may not claim a position Hierarchy did not reserve for it.'],
    traceability: ['hierarchy.ts (ARCHITECTURE entry, position 12)'],
  },
  specificationOnArchitecture: {
    purpose: 'Translate each Domain into one named, concrete Module.',
    source: 'SPECIFICATION',
    target: 'ARCHITECTURE',
    direction: 'downstream-consumes-upstream',
    scope: 'All 13 Modules, one per Domain.',
    constraints: ['Every Module names exactly one owning Domain (SPECIFICATION.ts\'s `domain` field); no Module may exist without one.'],
    traceability: ['SPECIFICATION.ts (RAS_AL_AMR_SPECIFICATION_MODULES, every entry\'s `domain` field)'],
  },
  specificationOnConstitutionDirect: {
    purpose: 'Cite constitutional text directly where a Module\'s responsibility requires more precision than its Domain alone provides (e.g. Lens\'s application of Personality.qualityStandard).',
    source: 'SPECIFICATION',
    target: 'CONSTITUTION',
    direction: 'downstream-consumes-upstream',
    scope: 'Each Module\'s `constitutionalSource` field.',
    constraints: ['A direct citation must be flagged if it is an application of an article rather than a literal reference (as Lens is, in INTERFACES.ts).'],
    traceability: ['SPECIFICATION.ts (every Module\'s constitutionalSource field)'],
  },
  interfacesOnSpecification: {
    purpose: 'Define the contract each Module provides to, or consumes from, other Modules.',
    source: 'INTERFACES',
    target: 'SPECIFICATION',
    direction: 'downstream-consumes-upstream',
    scope: 'All 15 Architectural Interfaces.',
    constraints: ['Every Interface\'s provider/consumer fields must name real Modules from SPECIFICATION.ts; none may be invented.'],
    traceability: ['INTERFACES.ts (every entry\'s provider/consumer fields)'],
  },
  interfacesOnArchitectureDirect: {
    purpose: "Ground each Interface's ownership in the Domain that governs it, and carry forward Ruling 1's capability-not-product boundary where relevant.",
    source: 'INTERFACES',
    target: 'ARCHITECTURE',
    direction: 'downstream-consumes-upstream',
    scope: 'AutoDirector, ManualDirector, Timeline, Media, Voice, Camera, Lens — the seven capability-reframed contracts.',
    constraints: ["A capability-reframed Interface must restate the 'never a product identity' boundary from RAS-CA-RULING-002, not merely imply it."],
    traceability: ['INTERFACES.ts (capabilityNotProductReframeApplied list)'],
  },
  behaviorOnInterfaces: {
    purpose: 'Define how the Chamber behaves when an Interface contract is invoked.',
    source: 'BEHAVIOR',
    target: 'INTERFACES',
    direction: 'downstream-consumes-upstream',
    scope: 'All 10 Constitutional Behaviors.',
    constraints: ["Every Behavior's relatedInterfaces field must name real Interfaces from INTERFACES.ts."],
    traceability: ['BEHAVIOR.ts (every entry\'s relatedInterfaces field)'],
  },
  behaviorOnSpecification: {
    purpose: 'Ground every Behavior in exactly one Responsible Domain and, where applicable, a dependency on a named Module.',
    source: 'BEHAVIOR',
    target: 'SPECIFICATION',
    direction: 'downstream-consumes-upstream',
    scope: 'All 10 Constitutional Behaviors.',
    constraints: ["Every Behavior's dependencies field must name real Modules; its responsibleDomain must name a real Domain."],
    traceability: ['BEHAVIOR.ts (every entry\'s dependencies and responsibleDomain fields)'],
  },
  behaviorOnConstitutionDirect: {
    purpose: 'Cite constitutional text directly where a Behavior requires more precision than Architecture/Specification/Interfaces alone provide, including where a literal implementation-shaped name (e.g. "Error Recovery") must be reframed rather than invented.',
    source: 'BEHAVIOR',
    target: 'CONSTITUTION',
    direction: 'downstream-consumes-upstream',
    scope: "ErrorRecovery's reframing to TIME.ts's interruptionRecovery and RELATIONSHIP.ts's failure.",
    constraints: ['A reframe must be flagged explicitly, never presented as an unremarkable direct citation (BEHAVIOR.ts\'s ErrorRecovery entry, and MANDATORY_ARCHITECTURAL_REVIEW.flaggedItem).'],
    traceability: ['BEHAVIOR.ts (ErrorRecovery.constitutionalPurpose)'],
  },
} as const;

export const DEPENDENCIES_DECLARATION = {
  totalDependenciesDefined: 10,
  circularDependenciesFound: 0,
  introducesNewConstitutionalContent: false,
  status: 'PACKAGE II — STAGE 6, STEP 1 OF 5 — DEPENDENCIES, submitted for Chief Architect review.',
} as const;
