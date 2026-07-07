/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 6 — ARCHITECTURAL DEPENDENCY PACKAGE (STEP 3 OF 5: PERMISSIONS)
 *
 * Defines Constitutional, Architectural, Dependency, and Ownership
 * Permissions; Escalation Rules; and Authority Boundaries.
 *
 * NO Runtime Permissions and NO User Permissions are defined here — those
 * belong to RUNTIME.ts's own invariants and INTERFACE.ts's Creator-facing
 * contract respectively. This file concerns Architectural Authority only:
 * what one architectural artifact (Domain, Module, Interface, Behavior) may
 * do with respect to another.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTITUTIONAL PERMISSIONS
// What the ten constitutional articles permit the Architecture to do.
// ═══════════════════════════════════════════════════════════════════════════

export const CONSTITUTIONAL_PERMISSIONS = {
  organize: 'The Constitution permits Architecture, Specification, Interfaces, and Behavior to organize its content into Domains, Modules, contracts, and behaviors.',
  translate: 'The Constitution permits each downstream artifact to translate its content into more concrete form (Domain → Module → Interface → Behavior), provided nothing is added, removed, or reinterpreted.',
  neverAmend: 'The Constitution permits no downstream artifact to amend, contradict, or reinterpret constitutional text. Only a Chief Architect Constitutional Ruling may do so (RAS-CA-RULING-001 precedent).',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ARCHITECTURAL PERMISSIONS
// What each of the six stage-artifacts is permitted to do relative to the
// others.
// ═══════════════════════════════════════════════════════════════════════════

export const ARCHITECTURAL_PERMISSIONS = {
  architectureMayDefineDomains: 'ARCHITECTURE.ts may define Domains and their dependency graph; it may not define Runtime, Implementation, or Interface behavior.',
  specificationMayNameModules: 'SPECIFICATION.ts may give each Domain exactly one named Module; it may not introduce a Module without an owning Domain.',
  interfacesMayDeclareContracts: 'INTERFACES.ts may declare constitutional contracts between Modules; it may not declare Runtime data structures (see Timeline, Media\'s explicit refusal to do so).',
  behaviorMayDescribeExpectedBehavior: 'BEHAVIOR.ts may describe expected behavior, triggers, and outcomes; it may not describe algorithms, state machines, or executable logic.',
  noArtifactMaySkipItsPredecessor: 'No artifact may derive authority by skipping its immediate predecessor in the chain (Behavior may not invent a Domain that Architecture never defined).',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DEPENDENCY PERMISSIONS
// What a "depends on" relationship (DEPENDENCIES.ts) permits.
// ═══════════════════════════════════════════════════════════════════════════

export const DEPENDENCY_PERMISSIONS = {
  readOnly: 'A dependency permits the dependent artifact to read and cite the depended-upon artifact\'s content. It never permits modification of it.',
  noReverseDependency: 'A dependency is always downstream-consumes-upstream (DEPENDENCIES.ts). An upstream artifact may never depend on a downstream one — this would be Authority Inversion.',
  transitiveCitationAllowed: 'A downstream artifact may cite an upstream artifact\'s upstream directly (e.g. Behavior citing Constitution directly, as ErrorRecovery does) provided the citation is flagged if it constitutes a reframe rather than a literal reference.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// OWNERSHIP PERMISSIONS
// What owning a Domain, Module, Interface, or Behavior (OWNERSHIP.ts)
// permits.
// ═══════════════════════════════════════════════════════════════════════════

export const OWNERSHIP_PERMISSIONS = {
  defineOwnResponsibility: 'An owner may define and refine its own responsibility, inputs, outputs, and boundaries.',
  neverClaimAnothers: 'An owner may never claim another Domain/Module/Interface/Behavior\'s responsibility as its own (e.g. Editing Domain may never claim Audio Domain\'s judgment).',
  sharedOwnershipRequiresDeclaration: 'Where ownership is shared (e.g. AI, Project — see OWNERSHIP.ts), the shared party must be explicitly named; undeclared shared ownership is forbidden.',
  futureOwnershipIsAspirationalOnly: 'Future Sovereign Core / Shared Engine ownership fields in OWNERSHIP.ts describe where a capability is *expected* to be routed once authorized — they grant no present authority to any Sovereign Core or Shared Engine capability that does not yet exist.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ESCALATION RULES
// How a blocker, gap, or ambiguity is escalated — the exact discipline
// already practiced across every Stage of this Package.
// ═══════════════════════════════════════════════════════════════════════════

export const ESCALATION_RULES = {
  step1_stop: 'On discovering any element that cannot be constitutionally traced, construction stops immediately. No invented authority fills the gap.',
  step2_report: 'A blocker is reported precisely: what was checked, what was found, why it does not trace, and (where possible) the closest constitutional analogue.',
  step3_awaitRuling: 'Construction does not resume on the blocked element until a Chief Architect Constitutional Ruling resolves it (RAS-CA-RULING-001, RAS-CA-RULING-002 precedents).',
  step4_certifiedAmendment: 'Where a gap is found in an already-certified Stage, the fix is scoped to a narrow Certified Amendment naming the exact files/functions in play, never a broad reopening (AZMA-CA-RULING-011, AZMA-CA-RULING-013 precedents).',
  step5_flagRatherThanGuess: 'Where an ambiguity has a defensible resolution but genuine risk of being wrong, it is flagged explicitly in the artifact itself (e.g. the Lens contract\'s weakest-grounded flag, the ErrorRecovery reframe) rather than silently resolved.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// AUTHORITY BOUNDARIES
// The outermost limits no permission above may cross.
// ═══════════════════════════════════════════════════════════════════════════

export const AUTHORITY_BOUNDARIES = {
  noNewConstitutionalAuthority: 'No Domain, Module, Interface, or Behavior may introduce new constitutional authority. Every one must terminate at an approved article (see TRACEABILITY.ts).',
  inheritanceIsOneDirectional: 'Authority flows Constitution → Hierarchy → Architecture → Specification → Interfaces → Behavior → (reserved: Runtime → Implementation → Interface → User). No layer may command a layer above it.',
  creatorSovereigntyIsAbsolute: "No permission defined anywhere in this Package may override the creator's final authority (TRUST.ts's creatorAuthority; ManualDirector's binding behavior, BEHAVIOR.ts).",
  capabilityNeverProductIdentity: 'No permission may reframe a capability-domain contract (Editing, Audio, Video, Automation, AutoDirector, ManualDirector, Timeline, Media, Voice, Camera, Lens) as a literal product identity (RAS-CA-RULING-002, Ruling 1).',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const PERMISSIONS_DECLARATION = {
  definesRuntimePermissions: false,
  definesUserPermissions: false,
  permissionConflictsFound: 0,
  status: 'PACKAGE II — STAGE 6, STEP 3 OF 5 — PERMISSIONS, submitted for Chief Architect review.',
} as const;

export const RAS_AL_AMR_PERMISSIONS = {
  constitutional: CONSTITUTIONAL_PERMISSIONS,
  architectural: ARCHITECTURAL_PERMISSIONS,
  dependency: DEPENDENCY_PERMISSIONS,
  ownership: OWNERSHIP_PERMISSIONS,
  escalation: ESCALATION_RULES,
  authorityBoundaries: AUTHORITY_BOUNDARIES,
  declaration: PERMISSIONS_DECLARATION,
} as const;
