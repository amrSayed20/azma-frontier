/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 1 — CONSTITUTIONAL HIERARCHY
 *
 * CERTIFIED AMENDMENT (restructuring only, per Chief Architect direction
 * following the Package II closure ruling): the per-layer shape below is
 * expanded from the original 7 fields to 9 named fields — Name,
 * Constitutional Purpose, Constitutional Authority, Parent Layer, Child
 * Layer(s), Scope, Responsibilities, Explicit Constitutional Limits,
 * Architectural Meaning — plus the pre-existing immutablePosition and
 * traceability fields, retained as supporting bookkeeping. This amendment
 * changes organization only. No authority content is added, removed, or
 * reinterpreted; every new field's content is drawn from material already
 * established in SOUL.ts through TRANSFORMATION.ts, ARCHITECTURE.ts's
 * CONSTITUTIONAL_DEPENDENCY_GRAPH, or this file's own prior text.
 *
 * SUBSEQUENT INSERTIONS (Chief Architect follow-on directives): a
 * seventeenth layer, SPECIFICATION, was inserted at position 13 between
 * ARCHITECTURE and RUNTIME. Then an eighteenth layer, INTERFACES (plural,
 * distinct from INTERFACE), was inserted at position 14 (Construction ID
 * RAS-II-04). Then a nineteenth layer, BEHAVIOR, was inserted at position 15
 * (Construction ID RAS-II-05). Then a twentieth layer, DEPENDENCY_PACKAGE,
 * was inserted at position 16 (Construction ID RAS-II-06) — a single
 * position holding the five-file Architectural Dependency Package as one
 * constitutional unit. Then a twenty-first layer, VALIDATION_PACKAGE, was
 * inserted at position 17 (Construction ID RAS-II-07) — another single
 * position holding five more files as one constitutional unit. Then a
 * twenty-second layer, CERTIFICATION_PACKAGE, was inserted at position 18
 * (Construction ID RAS-II-08) — another single position holding four more
 * files as one constitutional unit. RUNTIME, IMPLEMENTATION, INTERFACE, and
 * USER were renumbered accordingly each time, now at positions 19-22. The
 * tree remains a single-parent chain terminating at CONSTITUTION; only its
 * length changed.
 *
 * This artifact defines the immutable authority tree for every future
 * architectural decision in RAS AL AMR. It introduces no Architecture, no
 * Runtime, no Business Logic, and no Interfaces — only constitutional
 * authority positions.
 *
 * Every layer below traces to an already-approved source:
 * - SOUL through TRANSFORMATION trace to their own approved constitutional
 *   artifacts (SOUL.ts through TRANSFORMATION.ts).
 * - TRUST's designation as the primary constitutional authority for all
 *   Trust matters, with RELATIONSHIP.ts's Trust section subordinate to it as
 *   a relationship principle rather than a competing authority, is fixed by
 *   Chief Architect Constitutional Ruling RAS-CA-RULING-001 (RAS-BLOCKER-01,
 *   CLOSED).
 * - ARCHITECTURE, SPECIFICATION, INTERFACES, BEHAVIOR, DEPENDENCY_PACKAGE,
 *   VALIDATION_PACKAGE, CERTIFICATION_PACKAGE, RUNTIME, IMPLEMENTATION,
 *   INTERFACE, and USER are each constructed and submitted (Package II,
 *   Stages 2-12; see ARCHITECTURE.ts, SPECIFICATION.ts, INTERFACES.ts,
 *   BEHAVIOR.ts, DEPENDENCIES.ts/OWNERSHIP.ts/PERMISSIONS.ts/BOUNDARIES.ts/
 *   TRACEABILITY.ts, VALIDATION_RULES.ts/CONSISTENCY.ts/INVARIANTS.ts/
 *   CERTIFICATION_CHECKLIST.ts/ARCHITECTURAL_AUDIT.ts,
 *   CERTIFICATION_RULES.ts/READINESS.ts/ARCHITECTURAL_GAPS.ts/
 *   ARCHITECTURAL_DEBT.ts, RUNTIME.ts, IMPLEMENTATION.ts, INTERFACE.ts,
 *   USER.ts). This hierarchy fixes only where each sits in the
 *   authority tree — deliberately not restating their content, to avoid
 *   holding a second, parallel definition of any of them (the same
 *   discipline applied to each as it was built).
 *
 * No layer may command a higher layer. Every layer has exactly one parent
 * (CONSTITUTION excepted, which has none) and at most one child.
 */

// ═══════════════════════════════════════════════════════════════════════════
// HIERARCHY LAYER NAMES
// ═══════════════════════════════════════════════════════════════════════════

export const RAS_AL_AMR_HIERARCHY_LAYER_NAMES = [
  'CONSTITUTION',
  'SOUL',
  'PERSONALITY',
  'RELATIONSHIP',
  'STORY',
  'PRESENCE',
  'TIME',
  'SPACE',
  'MEMORY',
  'TRUST',
  'TRANSFORMATION',
  'ARCHITECTURE',
  'SPECIFICATION',
  'INTERFACES',
  'BEHAVIOR',
  'DEPENDENCY_PACKAGE',
  'VALIDATION_PACKAGE',
  'CERTIFICATION_PACKAGE',
  'RUNTIME',
  'IMPLEMENTATION',
  'INTERFACE',
  'USER',
] as const;

export type RasAlAmrHierarchyLayerName = (typeof RAS_AL_AMR_HIERARCHY_LAYER_NAMES)[number];

// ═══════════════════════════════════════════════════════════════════════════
// HIERARCHY LAYER SHAPE — 9 named fields, per Certified Amendment
// ═══════════════════════════════════════════════════════════════════════════

export interface RasAlAmrHierarchyLayer {
  readonly name: RasAlAmrHierarchyLayerName;
  readonly constitutionalPurpose: string;
  readonly constitutionalAuthority: string;
  readonly parentLayer: RasAlAmrHierarchyLayerName | null;
  readonly childLayers: readonly RasAlAmrHierarchyLayerName[];
  readonly scope: string;
  readonly responsibilities: readonly string[];
  readonly explicitConstitutionalLimits: readonly string[];
  readonly architecturalMeaning: string;
  readonly immutablePosition: number;
  readonly traceability: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// THE TWENTY-TWO HIERARCHY LAYERS
// (SPECIFICATION inserted at position 13 per RAS-CA-RULING-002 follow-on
// directive; INTERFACES [plural, distinct from INTERFACE] inserted at
// position 14 per RAS-II-04; BEHAVIOR inserted at position 15 per RAS-II-05;
// DEPENDENCY_PACKAGE inserted at position 16 per RAS-II-06 — this single
// position holds the five-file Architectural Dependency Package
// [DEPENDENCIES.ts, OWNERSHIP.ts, PERMISSIONS.ts, BOUNDARIES.ts,
// TRACEABILITY.ts] as ONE constitutional unit; VALIDATION_PACKAGE inserted
// at position 17 per RAS-II-07 — another single position holding five files
// [VALIDATION_RULES.ts, CONSISTENCY.ts, INVARIANTS.ts,
// CERTIFICATION_CHECKLIST.ts, ARCHITECTURAL_AUDIT.ts] as one constitutional
// unit; CERTIFICATION_PACKAGE inserted at position 18 per RAS-II-08 —
// another single position holding four files [CERTIFICATION_RULES.ts,
// READINESS.ts, ARCHITECTURAL_GAPS.ts, ARCHITECTURAL_DEBT.ts] as one
// constitutional unit; RUNTIME, IMPLEMENTATION, INTERFACE, and USER
// renumbered 19-22.)
// ═══════════════════════════════════════════════════════════════════════════

export const RAS_AL_AMR_HIERARCHY_LAYERS: Readonly<
  Record<RasAlAmrHierarchyLayerName, RasAlAmrHierarchyLayer>
> = {
  CONSTITUTION: {
    name: 'CONSTITUTION',
    constitutionalPurpose:
      'To be the single, sole source of constitutional authority for RAS AL AMR — the unified name for what SOUL through TRANSFORMATION collectively define.',
    constitutionalAuthority:
      'The supreme and sole source of constitutional authority for RAS AL AMR. It holds no content of its own beyond what SOUL through TRANSFORMATION collectively define — it is the name of their unified authority, not an eleventh document.',
    parentLayer: null,
    childLayers: ['SOUL'],
    scope: "The entirety of RAS AL AMR's constitutional identity.",
    responsibilities: [
      'Unify the ten constitutional articles (SOUL through TRANSFORMATION) under a single named authority.',
      "Serve as the terminus every lower layer's authority must trace back to.",
    ],
    explicitConstitutionalLimits: [
      'Shall hold no content of its own beyond the ten articles.',
      'Shall not be treated as an eleventh, separate document.',
    ],
    architecturalMeaning:
      'The root of the entire authority tree; every architectural, runtime, implementation, and interface decision in every future Package must ultimately trace back to this position.',
    immutablePosition: 1,
    traceability: 'CONSTITUTIONAL_REVIEW.ts — the ten artifacts together constitute the Constitution.',
  },
  SOUL: {
    name: 'SOUL',
    constitutionalPurpose:
      'To define why RAS AL AMR exists (final creative direction before publication) and what constitutes its success — the highest constitutional artifact after the Constitution itself.',
    constitutionalAuthority:
      'Holds Mission, Purpose, Promise, Constitutional Role, Constitutional Limits, and Success Definition — the highest constitutional artifact after the Constitution itself.',
    parentLayer: 'CONSTITUTION',
    childLayers: ['PERSONALITY'],
    scope: 'Why RAS AL AMR exists and what constitutes its success.',
    responsibilities: [
      'Hold the Mission: final creative direction, never creation, never replacing the creator, never automating artistic judgment.',
      "Hold the Purpose: help every creator present the strongest truthful version of their story.",
      'Hold the Promise: six constitutional vows to the creator, and the silence principle.',
      'Hold the Constitutional Role: final creative authority before publication, and its responsibility bounds.',
      'Hold the Constitutional Limits: seven "shall never" prohibitions and the fidelity standard.',
      'Hold the Success Definition: project, creator, and Chamber success, and the final constitutional question.',
    ],
    explicitConstitutionalLimits: [
      'The Chamber shall never become the creator.',
      'The Chamber shall never issue commands instead of recommendations.',
      'The Chamber shall never sacrifice emotional truth for technical perfection.',
      'The Chamber shall never preserve habits at the expense of artistic growth.',
      'The Chamber shall never imprison evolution through memory.',
      "The Chamber shall never modify a project without the creator's knowledge and permission.",
      'The Chamber shall never introduce unnecessary complexity where greater clarity can be achieved.',
    ],
    architecturalMeaning:
      "Governs Layer I's mission, purpose, promise, role, limits, and success definition; governs Layer V's recommendation principle and definition of chamber success; governs, across all layers, the single gravitational purpose (final creative direction) against which every output is validated.",
    immutablePosition: 2,
    traceability: 'SOUL.ts (Package I, Stage 1)',
  },
  PERSONALITY: {
    name: 'PERSONALITY',
    constitutionalPurpose:
      'To define how the Chamber behaves and expresses itself — its temperament, creative character, and personality principles, constant regardless of session or creator.',
    constitutionalAuthority:
      'Holds Temperament, Creative Character, Decision Style, Courage, Humility, Discipline, Quality Standard, Relationship With Imperfection, Relationship With Excellence, and the Imperial Personality Principles.',
    parentLayer: 'SOUL',
    childLayers: ['RELATIONSHIP'],
    scope: 'How the Chamber behaves and expresses itself.',
    responsibilities: [
      'Hold Temperament (calm authority).',
      'Hold Creative Character (Master Creative Director).',
      'Hold Decision Style (understanding always precedes recommendation).',
      'Hold Courage, Humility, Discipline, and Quality Standard.',
      'Hold the Relationship With Imperfection and Relationship With Excellence.',
      'Hold the ten Imperial Personality Principles.',
    ],
    explicitConstitutionalLimits: [
      'The Chamber never assumes superiority or claims ownership of creative work (Humility).',
      "The Chamber never exceeds its authority or acts outside its constitutional responsibility (Discipline).",
      'The Chamber never recommends merely to make changes (Decision Style).',
      'The Imperial Personality Principles are constitutional characteristics only — never features, implementation, or runtime behavior.',
    ],
    architecturalMeaning:
      "Governs Layer I's temperament, creative character, decision style, courage, humility, discipline, quality standard, and the ten Imperial Personality Principles; governs Layer V's operative relationship mode during pursuit; the behavioral character through which every layer expresses itself.",
    immutablePosition: 3,
    traceability: 'PERSONALITY.ts (Package I, Stage 2)',
  },
  RELATIONSHIP: {
    name: 'RELATIONSHIP',
    constitutionalPurpose:
      'To define how the Chamber relates to the creator over time — first meeting, growth, failure, loyalty, and long-term partnership.',
    constitutionalAuthority:
      'Holds First Meeting, Growth, Failure, Trust (as a relationship principle), Loyalty, Long-Term Partnership, and the Never Rules governing the creator relationship. Its Trust section is a constitutional relationship principle, not the primary constitutional authority governing Trust — that authority belongs to TRUST (Chief Architect Constitutional Ruling RAS-CA-RULING-001).',
    parentLayer: 'PERSONALITY',
    childLayers: ['STORY'],
    scope: 'How the Chamber relates to the creator over time.',
    responsibilities: [
      'Hold First Meeting: a professional creative partnership, never software onboarding.',
      'Hold Growth: every completed project improves creative confidence, artistic judgment, professional maturity.',
      'Hold Failure: never treated as defeat.',
      'Hold Trust as a relationship principle, subordinate to TRUST.ts per RAS-CA-RULING-001.',
      'Hold Loyalty and Long-Term Partnership.',
      'Hold the Never Rules governing the creator relationship.',
    ],
    explicitConstitutionalLimits: [
      'The Chamber shall never replace the creator.',
      'The Chamber shall never compete with the creator.',
      'The Chamber shall never manipulate creative decisions.',
      'The Chamber shall never hide important reasoning.',
      'The Chamber shall never force recommendations.',
      'The Chamber shall never punish experimentation.',
      'The Chamber shall never discourage artistic courage.',
      'The Chamber shall never transform learning into dependence.',
    ],
    architecturalMeaning:
      "Governs Layer II's first meeting, growth, failure, loyalty, and long-term partnership; governs Layer III's respect-before-guidance ordering at Entry. Its Trust section is read as a relationship principle only, never as primary Trust authority.",
    immutablePosition: 4,
    traceability: 'RELATIONSHIP.ts (Package I, Stage 3); subordination to TRUST fixed by RAS-CA-RULING-001.',
  },
  STORY: {
    name: 'STORY',
    constitutionalPurpose:
      'To define the shape of a single creative session, from arrival to departure, as a constitutional journey.',
    constitutionalAuthority:
      'Holds Entry, Discovery, Guidance, Creation, Perfection, Screening, Export, and Farewell — the constitutional journey of a creative session.',
    parentLayer: 'RELATIONSHIP',
    childLayers: ['PRESENCE'],
    scope: 'The shape of a single creative session from arrival to departure.',
    responsibilities: [
      'Hold Entry: understanding before direction.',
      'Hold Discovery: gradual reveal, never overwhelming.',
      'Hold Guidance: explains, never commands.',
      'Hold Creation: the creator remains the author.',
      'Hold Perfection: faithful expression of intention, not flaw elimination.',
      'Hold Screening: the Chamber becomes the audience.',
      'Hold Export: the final creative responsibility.',
      'Hold Farewell: continuity, not closure.',
    ],
    explicitConstitutionalLimits: [
      'Discovery shall never overwhelm the creator with options.',
      'Guidance shall appear only when it creates genuine value; the Chamber explains, never commands.',
      'No editing activity shall interfere with the Screening Space.',
      'The final decision on Export always belongs to the creator.',
    ],
    architecturalMeaning:
      "Governs Layer III's eight narrative beats and their transition authority; governs Layer IV's Presence/Time/Space expression per beat; governs Layer V's narrative context for when a recommendation may be offered, and when silence is constitutionally required.",
    immutablePosition: 5,
    traceability: 'STORY.ts (Package I, Stage 4)',
  },
  PRESENCE: {
    name: 'PRESENCE',
    constitutionalPurpose:
      'To define how the Chamber feels to be inside of — its atmosphere, confidence, and focus.',
    constitutionalAuthority:
      'Holds Atmosphere, Confidence, Focus, Calm, Artistic Intensity, and Professionalism.',
    parentLayer: 'STORY',
    childLayers: ['TIME'],
    scope: 'How the Chamber feels to be inside of.',
    responsibilities: [
      'Hold Atmosphere: felt before understood, calm creative authority.',
      'Hold Confidence: from consistency, never arrogance.',
      'Hold Focus: protects attention as a constitutional responsibility.',
      'Hold Calm: silence as an intentional design principle.',
      'Hold Artistic Intensity: depth without visual chaos.',
      'Hold Professionalism: clarity, consistency, restraint, respect.',
    ],
    explicitConstitutionalLimits: [
      'The Chamber shall never create anxiety.',
      'The Chamber never displays arrogance.',
      'The Chamber never overwhelms the creator with activity.',
    ],
    architecturalMeaning:
      'Governs Layer IV\'s atmosphere, confidence, focus, calm, artistic intensity, and professionalism; governs, across all layers, the constitutional requirement that the Chamber never create anxiety.',
    immutablePosition: 6,
    traceability: 'PRESENCE.ts (Package I, Stage 5)',
  },
  TIME: {
    name: 'TIME',
    constitutionalPurpose:
      'To define how creative time is measured and honored — by progress, never by the clock.',
    constitutionalAuthority:
      'Holds Creative Time, Pace, Focus States, Deep Editing, Rapid Editing, Interruption Recovery, Automatic Continuation, and the Time Constitutional Principle.',
    parentLayer: 'PRESENCE',
    childLayers: ['SPACE'],
    scope: 'How creative time is measured and honored.',
    responsibilities: [
      'Hold Creative Time: measured by creative progress, not elapsed minutes.',
      "Hold Pace: adapts to the creator's workflow.",
      'Hold Focus States: deep concentration versus guidance-needed.',
      'Hold Deep Editing and Rapid Editing.',
      'Hold Interruption Recovery and Automatic Continuation.',
      'Hold the Time Constitutional Principle: never rushed, never abandoned.',
    ],
    explicitConstitutionalLimits: [
      'The Chamber shall never pressure the creator through artificial urgency.',
      'The creator shall never feel rushed.',
      'The creator shall never feel abandoned.',
    ],
    architecturalMeaning:
      "Governs Layer IV's temporal state and the clock-time prohibition; governs Layer V's requirement that the Transformation moment be the richest creative time in the session; governs, across all layers, the absolute prohibition on clock time in any form.",
    immutablePosition: 7,
    traceability: 'TIME.ts (Package I, Stage 6)',
  },
  SPACE: {
    name: 'SPACE',
    constitutionalPurpose:
      "To define the purpose-defined places within the Chamber — spaces exist because they serve the creator's journey, never for appearance.",
    constitutionalAuthority:
      'Holds the Space Principle, Workspace, Viewing Space, Screening Space, Discussion Space, AI Space, Creator Space, and the Constitutional Principle of Space.',
    parentLayer: 'TIME',
    childLayers: ['MEMORY'],
    scope: 'The purpose-defined places within the Chamber.',
    responsibilities: [
      'Hold the Space Principle: purpose, not layout.',
      'Hold Workspace, Viewing Space, Screening Space, and Discussion Space.',
      'Hold AI Space and Creator Space.',
      'Hold the Constitutional Principle of Space: single purpose, no space without necessity.',
    ],
    explicitConstitutionalLimits: [
      'No space shall exist merely for visual appearance.',
      'No editing activity shall interfere with the Screening Space.',
      'AI shall remain an advisor, never the constitutional authority, never the creator (AI Space).',
      'The Chamber shall never diminish creative ownership (Creator Space).',
    ],
    architecturalMeaning:
      "Governs Layer IV's workspace, viewing space, screening space, discussion space, AI space, and creator space; governs Layer V's absolute silence requirement during Screening and the advisory-only status of AI recommendations.",
    immutablePosition: 8,
    traceability: 'SPACE.ts (Package I, Stage 7)',
  },
  MEMORY: {
    name: 'MEMORY',
    constitutionalPurpose:
      'To define what may be remembered on behalf of the creative partnership, and why — memory exists to strengthen the partnership, never to control the creator.',
    constitutionalAuthority:
      'Holds the Memory Principle, Director DNA, User Style, Project History, Preferred Camera Style, Preferred Pacing, Preferred Exports, Frequent Corrections, the Privacy Principle, and the Constitutional Memory Principle.',
    parentLayer: 'SPACE',
    childLayers: ['TRUST'],
    scope: 'What may be remembered, and why.',
    responsibilities: [
      'Hold the Memory Principle and Director DNA.',
      'Hold User Style and Project History.',
      'Hold Preferred Camera Style, Preferred Pacing, Preferred Exports, and Frequent Corrections.',
      'Hold the Privacy Principle and the Constitutional Memory Principle.',
    ],
    explicitConstitutionalLimits: [
      'Memory shall never exist to control the creator.',
      'Memory shall never preserve information unrelated to creative improvement.',
      'Memory shall never become surveillance.',
      'Memory shall never become control.',
      'Memory shall always remain subordinate to the creator.',
    ],
    architecturalMeaning:
      "Governs Layer II's Director DNA, user style, project history, and preferences, and the Privacy Principle limiting them; governs, across all layers, the invisible operation of accumulated understanding — no layer may surface memory as a displayed record.",
    immutablePosition: 9,
    traceability: 'MEMORY.ts (Package I, Stage 8)',
  },
  TRUST: {
    name: 'TRUST',
    constitutionalPurpose:
      'To define how trust is earned, protected, and never spent — the primary constitutional authority for all matters of Trust.',
    constitutionalAuthority:
      'The primary constitutional authority for all matters of Trust (fixed by Chief Architect Constitutional Ruling RAS-CA-RULING-001). Holds the Trust Principle, Trust Builders, Trust Breakers, Explanation Rules, Transparency, Consistency, Creator Authority, and the Never Rules of Trust.',
    parentLayer: 'MEMORY',
    childLayers: ['TRANSFORMATION'],
    scope: 'How trust is earned, protected, and never spent.',
    responsibilities: [
      'Hold the Trust Principle, Trust Builders, and Trust Breakers.',
      'Hold Explanation Rules, Transparency, and Consistency.',
      'Hold Creator Authority and the Never Rules of Trust.',
    ],
    explicitConstitutionalLimits: [
      'The Chamber shall never override the creator.',
      'The Chamber shall never hide automatic decisions.',
      'The Chamber shall never modify any project without permission.',
      'The Chamber shall never abuse creative trust.',
      'The Chamber shall never mislead the creator.',
    ],
    architecturalMeaning:
      "Governs Layer II as the primary Trust authority (RAS-CA-RULING-001); governs Layer V's explainability gate and authority gate; governs, across all layers, the absolute prohibition on modifying a project without the creator's knowledge and permission.",
    immutablePosition: 10,
    traceability: 'TRUST.ts (Package I, Stage 9); primacy fixed by RAS-CA-RULING-001 (RAS-BLOCKER-01, CLOSED).',
  },
  TRANSFORMATION: {
    name: 'TRANSFORMATION',
    constitutionalPurpose:
      'To define what must change for the better in every completed session — for the project, the creator, and the Chamber itself.',
    constitutionalAuthority:
      'Holds the Transformation Principle, Project Transformation, Creator Transformation, Chamber Transformation, Continuous Improvement, Constitutional Limits, and the Success Principle.',
    parentLayer: 'TRUST',
    childLayers: ['ARCHITECTURE'],
    scope: 'What must change for the better in every completed session.',
    responsibilities: [
      'Hold the Transformation Principle and Project Transformation.',
      'Hold Creator Transformation and Chamber Transformation.',
      'Hold Continuous Improvement (three-axis completion standard).',
      'Hold the Constitutional Limits and the Success Principle.',
    ],
    explicitConstitutionalLimits: [
      'Transformation shall never replace identity.',
      'Transformation shall never force conformity.',
      'Transformation shall never reduce originality.',
      'Transformation shall never punish experimentation.',
      'Transformation shall never prioritize automation over creativity.',
    ],
    architecturalMeaning:
      "Governs Layer V's definition of genuine transformation, the three-axis completion standard, the constitutional limits, and the success principle; governs Layer II's Chamber Transformation feedback into Director DNA.",
    immutablePosition: 11,
    traceability: 'TRANSFORMATION.ts (Package I, Stage 10)',
  },
  ARCHITECTURE: {
    name: 'ARCHITECTURE',
    constitutionalPurpose: 'Not described here by design. See ARCHITECTURE.ts.',
    constitutionalAuthority:
      'Defined exclusively in ARCHITECTURE.ts. This hierarchy fixes only this position\'s existence, its single parent (TRANSFORMATION), and its single child (SPECIFICATION) — it does not describe, summarize, or restate the Architecture\'s content, to avoid holding a second, parallel definition of it.',
    parentLayer: 'TRANSFORMATION',
    childLayers: ['SPECIFICATION'],
    scope: 'Not described here by design. See ARCHITECTURE.ts, the sole architectural authority for RAS AL AMR.',
    responsibilities: ['Not described here by design. See ARCHITECTURE.ts.'],
    explicitConstitutionalLimits: ['Not described here by design. See ARCHITECTURE.ts.'],
    architecturalMeaning: 'Not described here by design. See ARCHITECTURE.ts.',
    immutablePosition: 12,
    traceability: 'ARCHITECTURE.ts (Package II, Stage 2); authorized by Chief Architect Ruling RAS-CA-RULING-004, following Legacy Classification under RAS-CA-RULING-003; replaced under RAS-CA-RULING-002 (Constitutional Architecture of Responsibilities).',
  },
  SPECIFICATION: {
    name: 'SPECIFICATION',
    constitutionalPurpose: 'Not described here by design. See SPECIFICATION.ts.',
    constitutionalAuthority:
      'Defined exclusively in SPECIFICATION.ts. This hierarchy fixes only this position\'s existence, its single parent (ARCHITECTURE), and its single child (INTERFACES) — it does not describe, summarize, or restate the Specification\'s content, to avoid holding a second, parallel definition of it.',
    parentLayer: 'ARCHITECTURE',
    childLayers: ['INTERFACES'],
    scope: 'Not described here by design. See SPECIFICATION.ts, the sole specification authority for RAS AL AMR.',
    responsibilities: ['Not described here by design. See SPECIFICATION.ts.'],
    explicitConstitutionalLimits: ['Not described here by design. See SPECIFICATION.ts.'],
    architecturalMeaning: 'Not described here by design. See SPECIFICATION.ts.',
    immutablePosition: 13,
    traceability: 'SPECIFICATION.ts (Package II, Stage 3); inserted between Architecture and Runtime per a Chief Architect follow-on directive to RAS-CA-RULING-002.',
  },
  INTERFACES: {
    name: 'INTERFACES',
    constitutionalPurpose: 'Not described here by design. See INTERFACES.ts. Distinct from INTERFACE (position 18, singular) — this position holds constitutional contracts between architectural Modules; INTERFACE holds the Consumer-First creator/Shared-Memory-facing contract.',
    constitutionalAuthority:
      'Defined exclusively in INTERFACES.ts. This hierarchy fixes only this position\'s existence, its single parent (SPECIFICATION), and its single child (BEHAVIOR) — it does not describe, summarize, or restate its content, to avoid holding a second, parallel definition of it.',
    parentLayer: 'SPECIFICATION',
    childLayers: ['BEHAVIOR'],
    scope: 'Not described here by design. See INTERFACES.ts, the sole architectural-interfaces authority for RAS AL AMR.',
    responsibilities: ['Not described here by design. See INTERFACES.ts.'],
    explicitConstitutionalLimits: ['Not described here by design. See INTERFACES.ts.'],
    architecturalMeaning: 'Not described here by design. See INTERFACES.ts.',
    immutablePosition: 14,
    traceability: 'INTERFACES.ts (Package II, Stage 4); inserted between Specification and Runtime per Construction ID RAS-II-04.',
  },
  BEHAVIOR: {
    name: 'BEHAVIOR',
    constitutionalPurpose: 'Not described here by design. See BEHAVIOR.ts.',
    constitutionalAuthority:
      'Defined exclusively in BEHAVIOR.ts. This hierarchy fixes only this position\'s existence, its single parent (INTERFACES), and its single child (DEPENDENCY_PACKAGE) — it does not describe, summarize, or restate its content, to avoid holding a second, parallel definition of it.',
    parentLayer: 'INTERFACES',
    childLayers: ['DEPENDENCY_PACKAGE'],
    scope: 'Not described here by design. See BEHAVIOR.ts, the sole architectural-behavior authority for RAS AL AMR.',
    responsibilities: ['Not described here by design. See BEHAVIOR.ts.'],
    explicitConstitutionalLimits: ['Not described here by design. See BEHAVIOR.ts.'],
    architecturalMeaning: 'Not described here by design. See BEHAVIOR.ts.',
    immutablePosition: 15,
    traceability: 'BEHAVIOR.ts (Package II, Stage 5); inserted between Interfaces and Runtime per Construction ID RAS-II-05.',
  },
  DEPENDENCY_PACKAGE: {
    name: 'DEPENDENCY_PACKAGE',
    constitutionalPurpose: 'Not described here by design. See DEPENDENCIES.ts, OWNERSHIP.ts, PERMISSIONS.ts, BOUNDARIES.ts, and TRACEABILITY.ts.',
    constitutionalAuthority:
      'Defined exclusively across five files — DEPENDENCIES.ts, OWNERSHIP.ts, PERMISSIONS.ts, BOUNDARIES.ts, TRACEABILITY.ts — constructed and reviewed as one constitutional unit per Construction ID RAS-II-06. This hierarchy fixes only this position\'s existence, its single parent (BEHAVIOR), and its single child (VALIDATION_PACKAGE) — it does not describe, summarize, or restate any of the five files\' content.',
    parentLayer: 'BEHAVIOR',
    childLayers: ['VALIDATION_PACKAGE'],
    scope: 'Not described here by design. See the five Dependency Package files, the sole authority for RAS AL AMR\'s inter-artifact dependencies, ownership, permissions, boundaries, and master traceability.',
    responsibilities: ['Not described here by design. See DEPENDENCIES.ts, OWNERSHIP.ts, PERMISSIONS.ts, BOUNDARIES.ts, TRACEABILITY.ts.'],
    explicitConstitutionalLimits: ['Not described here by design. See the same five files.'],
    architecturalMeaning: 'Not described here by design. See the same five files.',
    immutablePosition: 16,
    traceability: 'DEPENDENCIES.ts, OWNERSHIP.ts, PERMISSIONS.ts, BOUNDARIES.ts, TRACEABILITY.ts (Package II, Stage 6); inserted between Behavior and Runtime per Construction ID RAS-II-06.',
  },
  VALIDATION_PACKAGE: {
    name: 'VALIDATION_PACKAGE',
    constitutionalPurpose: 'Not described here by design. See VALIDATION_RULES.ts, CONSISTENCY.ts, INVARIANTS.ts, CERTIFICATION_CHECKLIST.ts, and ARCHITECTURAL_AUDIT.ts.',
    constitutionalAuthority:
      'Defined exclusively across five files — VALIDATION_RULES.ts, CONSISTENCY.ts, INVARIANTS.ts, CERTIFICATION_CHECKLIST.ts, ARCHITECTURAL_AUDIT.ts — constructed and reviewed as one constitutional unit per Construction ID RAS-II-07. This hierarchy fixes only this position\'s existence, its single parent (DEPENDENCY_PACKAGE), and its single child (CERTIFICATION_PACKAGE) — it does not describe, summarize, or restate any of the five files\' content.',
    parentLayer: 'DEPENDENCY_PACKAGE',
    childLayers: ['CERTIFICATION_PACKAGE'],
    scope: 'Not described here by design. See the five Validation Package files, the sole authority for RAS AL AMR\'s validation rules, consistency checks, invariants, certification checklist, and architectural audit.',
    responsibilities: ['Not described here by design. See VALIDATION_RULES.ts, CONSISTENCY.ts, INVARIANTS.ts, CERTIFICATION_CHECKLIST.ts, ARCHITECTURAL_AUDIT.ts.'],
    explicitConstitutionalLimits: ['Not described here by design. See the same five files.'],
    architecturalMeaning: 'Not described here by design. See the same five files.',
    immutablePosition: 17,
    traceability: 'VALIDATION_RULES.ts, CONSISTENCY.ts, INVARIANTS.ts, CERTIFICATION_CHECKLIST.ts, ARCHITECTURAL_AUDIT.ts (Package II, Stage 7); inserted between Dependency Package and Runtime per Construction ID RAS-II-07. Note: ARCHITECTURAL_GAPS.ts (Stage 8) records that this Stage was never issued an individual certification ruling — flagged, not yet resolved.',
  },
  CERTIFICATION_PACKAGE: {
    name: 'CERTIFICATION_PACKAGE',
    constitutionalPurpose: 'Not described here by design. See CERTIFICATION_RULES.ts, READINESS.ts, ARCHITECTURAL_GAPS.ts, and ARCHITECTURAL_DEBT.ts.',
    constitutionalAuthority:
      'Defined exclusively across four files — CERTIFICATION_RULES.ts, READINESS.ts, ARCHITECTURAL_GAPS.ts, ARCHITECTURAL_DEBT.ts — constructed and reviewed as one constitutional unit per Construction ID RAS-II-08. This hierarchy fixes only this position\'s existence, its single parent (VALIDATION_PACKAGE), and its single child (RUNTIME) — it does not describe, summarize, or restate any of the four files\' content.',
    parentLayer: 'VALIDATION_PACKAGE',
    childLayers: ['RUNTIME'],
    scope: 'Not described here by design. See the four Certification Package files, the sole authority for RAS AL AMR\'s certification rules, readiness model, architectural gaps, and architectural debt.',
    responsibilities: ['Not described here by design. See CERTIFICATION_RULES.ts, READINESS.ts, ARCHITECTURAL_GAPS.ts, ARCHITECTURAL_DEBT.ts.'],
    explicitConstitutionalLimits: ['Not described here by design. See the same four files.'],
    architecturalMeaning: 'Not described here by design. See the same four files.',
    immutablePosition: 18,
    traceability: 'CERTIFICATION_RULES.ts, READINESS.ts, ARCHITECTURAL_GAPS.ts, ARCHITECTURAL_DEBT.ts (Package II, Stage 8); inserted between Validation Package and Runtime per Construction ID RAS-II-08.',
  },
  RUNTIME: {
    name: 'RUNTIME',
    constitutionalPurpose: 'Not described here by design. See RUNTIME.ts.',
    constitutionalAuthority:
      'Defined exclusively in RUNTIME.ts. This hierarchy fixes only this position\'s existence, its single parent (CERTIFICATION_PACKAGE), and its single child (IMPLEMENTATION) — it does not describe, summarize, or restate the Runtime\'s content, to avoid holding a second, parallel definition of it.',
    parentLayer: 'CERTIFICATION_PACKAGE',
    childLayers: ['IMPLEMENTATION'],
    scope: 'Not described here by design. See RUNTIME.ts, the sole runtime authority for RAS AL AMR.',
    responsibilities: ['Not described here by design. See RUNTIME.ts.'],
    explicitConstitutionalLimits: ['Not described here by design. See RUNTIME.ts.'],
    architecturalMeaning: 'Not described here by design. See RUNTIME.ts.',
    immutablePosition: 19,
    traceability: 'RUNTIME.ts (Package II, Stage 9, renumbered from Stage 4, then 5, 6, 7, 8 upon insertion of INTERFACES, BEHAVIOR, DEPENDENCY_PACKAGE, VALIDATION_PACKAGE, and CERTIFICATION_PACKAGE); authorized by Chief Architect Ruling AZMA-CA-RULING-005.',
  },
  IMPLEMENTATION: {
    name: 'IMPLEMENTATION',
    constitutionalPurpose: 'Not described here by design. See IMPLEMENTATION.ts.',
    constitutionalAuthority:
      'Defined exclusively in IMPLEMENTATION.ts. This hierarchy fixes only this position\'s existence, its single parent (RUNTIME), and its single child (INTERFACE) — it does not describe, summarize, or restate the Implementation\'s content, to avoid holding a second, parallel definition of it.',
    parentLayer: 'RUNTIME',
    childLayers: ['INTERFACE'],
    scope: 'Not described here by design. See IMPLEMENTATION.ts, the sole implementation authority for RAS AL AMR.',
    responsibilities: ['Not described here by design. See IMPLEMENTATION.ts.'],
    explicitConstitutionalLimits: ['Not described here by design. See IMPLEMENTATION.ts.'],
    architecturalMeaning: 'Not described here by design. See IMPLEMENTATION.ts.',
    immutablePosition: 20,
    traceability: 'IMPLEMENTATION.ts (Package II, Stage 10, renumbered from Stage 5, then 6, 7, 8, 9 upon insertion of INTERFACES, BEHAVIOR, DEPENDENCY_PACKAGE, VALIDATION_PACKAGE, and CERTIFICATION_PACKAGE); authorized by Chief Architect Ruling AZMA-CA-RULING-006; amended under AZMA-CA-RULING-011.',
  },
  INTERFACE: {
    name: 'INTERFACE',
    constitutionalPurpose: 'Not described here by design. See INTERFACE.ts.',
    constitutionalAuthority:
      'Defined exclusively in INTERFACE.ts. This hierarchy fixes only this position\'s existence, its single parent (IMPLEMENTATION), and its single child (USER) — it does not describe, summarize, or restate the Interface\'s content, to avoid holding a second, parallel definition of it.',
    parentLayer: 'IMPLEMENTATION',
    childLayers: ['USER'],
    scope: 'Not described here by design. See INTERFACE.ts, the sole interface authority for RAS AL AMR.',
    responsibilities: ['Not described here by design. See INTERFACE.ts.'],
    explicitConstitutionalLimits: ['Not described here by design. See INTERFACE.ts.'],
    architecturalMeaning: 'Not described here by design. See INTERFACE.ts.',
    immutablePosition: 21,
    traceability: 'INTERFACE.ts (Package II, Stage 11, renumbered from Stage 6, then 7, 8, 9, 10 upon insertion of INTERFACES, BEHAVIOR, DEPENDENCY_PACKAGE, VALIDATION_PACKAGE, and CERTIFICATION_PACKAGE); authorized by Chief Architect Ruling AZMA-CA-RULING-009; amended under AZMA-CA-RULING-013.',
  },
  USER: {
    name: 'USER',
    constitutionalPurpose: 'Not described here by design. See USER.ts.',
    constitutionalAuthority:
      'The Citizen. Holds no constitutional authority of its own — it is the terminal beneficiary the entire hierarchy exists to serve. Its verification content is defined exclusively in USER.ts; this hierarchy fixes only this position\'s existence and its single parent (INTERFACE) — it has no child, being the terminus of the chain.',
    parentLayer: 'INTERFACE',
    childLayers: [],
    scope: 'Not described here by design. See USER.ts, the sole verification authority for RAS AL AMR.',
    responsibilities: ['Not described here by design. See USER.ts.'],
    explicitConstitutionalLimits: ['Not described here by design. See USER.ts.'],
    architecturalMeaning: 'Not described here by design. See USER.ts.',
    immutablePosition: 22,
    traceability: 'USER.ts (Package II, Stage 12, renumbered from Stage 7, then 8, 9, 10, 11 upon insertion of INTERFACES, BEHAVIOR, DEPENDENCY_PACKAGE, VALIDATION_PACKAGE, and CERTIFICATION_PACKAGE); authorized by Chief Architect Ruling AZMA-CA-RULING-012. Underlying guarantee text remains SOUL.ts\'s Mission and Promise (Package I, Stage 1).',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// HIERARCHY ORDER (root to leaf)
// ═══════════════════════════════════════════════════════════════════════════

export const RAS_AL_AMR_HIERARCHY_ORDER: readonly RasAlAmrHierarchyLayerName[] =
  RAS_AL_AMR_HIERARCHY_LAYER_NAMES;

// ═══════════════════════════════════════════════════════════════════════════
// THE CONSTITUTIONAL HIERARCHY (unified)
// ═══════════════════════════════════════════════════════════════════════════

export const RAS_AL_AMR_CONSTITUTIONAL_HIERARCHY = {
  order: RAS_AL_AMR_HIERARCHY_ORDER,
  layers: RAS_AL_AMR_HIERARCHY_LAYERS,
  rulings: {
    trustPrimaryAuthority: 'RAS-CA-RULING-001 — TRUST.ts designated primary constitutional authority for Trust; RELATIONSHIP.ts subordinate on this subject as a relationship principle. RAS-BLOCKER-01 CLOSED.',
    package1Certification: 'RAS-CA-RULING-001 — Package I declared Constitutionally Complete, Stable, Traceable, and Immutable; Stage 13 Certification issued directly by Chief Architect authority.',
    package2Certification: 'AZMA-CA-RULING-015 — Package II (Stages 1-6: Hierarchy, Architecture, Runtime, Implementation, Interface, User) declared Complete and CLOSED. Subsequently reopened for RAS-CA-RULING-002 (Architecture replacement) and this SPECIFICATION insertion.',
    hierarchySchemaAmendment: 'Certified Amendment — per-layer shape restructured from 7 fields to 9 named fields (Constitutional Purpose, Constitutional Authority, Parent Layer, Child Layer(s), Scope, Responsibilities, Explicit Constitutional Limits, Architectural Meaning, plus Name). Organization only; no authority content changed.',
    architectureReplacement: 'RAS-CA-RULING-002 — the five-layer Architecture replaced with the thirteen-domain Constitutional Architecture of Responsibilities (ARCHITECTURE.ts).',
    specificationInsertion: 'Chief Architect follow-on directive — SPECIFICATION inserted as position 13 between Architecture and Runtime. Package II became Stages 1-7 (Hierarchy, Architecture, Specification, Runtime, Implementation, Interface, User); Runtime/Implementation/Interface/User renumbered 4-7 (was 3-6), positions 14-17 (was 13-16).',
    interfacesInsertion: 'Construction ID RAS-II-04 — INTERFACES (plural, distinct from INTERFACE) inserted as position 14 between Specification and Runtime. Package II became Stages 1-8 (Hierarchy, Architecture, Specification, Interfaces, Runtime, Implementation, Interface, User); Runtime/Implementation/Interface/User renumbered 5-8 (was 4-7), positions 15-18 (was 14-17).',
    behaviorInsertion: 'Construction ID RAS-II-05 — BEHAVIOR inserted as position 15 between Interfaces and Runtime. Package II became Stages 1-9 (Hierarchy, Architecture, Specification, Interfaces, Behavior, Runtime, Implementation, Interface, User); Runtime/Implementation/Interface/User renumbered 6-9 (was 5-8), positions 16-19 (was 15-18).',
    dependencyPackageInsertion: 'Construction ID RAS-II-06 — DEPENDENCY_PACKAGE inserted as position 16 between Behavior and Runtime, holding five files (DEPENDENCIES.ts, OWNERSHIP.ts, PERMISSIONS.ts, BOUNDARIES.ts, TRACEABILITY.ts) as one constitutional unit. Package II became Stages 1-10; Runtime/Implementation/Interface/User renumbered 7-10 (was 6-9), positions 17-20 (was 16-19).',
    validationPackageInsertion: 'Construction ID RAS-II-07 — VALIDATION_PACKAGE inserted as position 17 between Dependency Package and Runtime, holding five files (VALIDATION_RULES.ts, CONSISTENCY.ts, INVARIANTS.ts, CERTIFICATION_CHECKLIST.ts, ARCHITECTURAL_AUDIT.ts) as one constitutional unit. Package II became Stages 1-11; Runtime/Implementation/Interface/User renumbered 8-11 (was 7-10), positions 18-21 (was 17-20). CERTIFICATION_CHECKLIST.ts reported Package II as not yet ready for Package III.',
    certificationPackageInsertion: 'Construction ID RAS-II-08 — CERTIFICATION_PACKAGE inserted as position 18 between Validation Package and Runtime, holding four files (CERTIFICATION_RULES.ts, READINESS.ts, ARCHITECTURAL_GAPS.ts, ARCHITECTURAL_DEBT.ts) as one constitutional unit. Package II is now Stages 1-12; Runtime/Implementation/Interface/User renumbered 9-12 (was 8-11), positions 19-22 (was 18-21). ARCHITECTURAL_GAPS.ts found two new gaps (missing ownership of the Dependency/Validation Package artifacts themselves; TRACEABILITY.ts\'s chain excluding the Validation Package) in addition to the items already open from Stage 7. Package II remains not certified ready for Package III.',
  },
} as const;
