/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 6 — ARCHITECTURAL DEPENDENCY PACKAGE (STEP 4 OF 5: BOUNDARIES)
 *
 * Consolidates every boundary already declared across ARCHITECTURE.ts,
 * SPECIFICATION.ts, and INTERFACES.ts into one map, by pointer where the
 * content already exists verbatim — restating it here in full would
 * recreate the exact parallel-authority problem this Chamber has avoided
 * at every prior Stage (see hierarchy.ts's "pointer only" discipline for
 * ARCHITECTURE, SPECIFICATION, INTERFACES, BEHAVIOR positions). The one
 * genuinely new content in this file is FORBIDDEN_CROSSINGS — a concrete
 * list of specific cross-domain actions that must never occur, assembled
 * from boundaries already declared but not previously listed together.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTITUTIONAL BOUNDARIES (pointer)
// ═══════════════════════════════════════════════════════════════════════════

export const CONSTITUTIONAL_BOUNDARIES_POINTER = {
  source: 'ARCHITECTURE.ts, CONSTITUTIONAL_BOUNDARIES',
  entries: [
    'the_sovereignty_boundary', 'the_no_unauthorized_modification_boundary', 'the_command_vs_recommendation_boundary',
    'the_silence_preference_boundary', 'the_mechanism_and_ai_authority_boundary', 'the_screening_purity_boundary',
    'the_three_axis_completion_boundary', 'the_dependence_boundary', 'the_capability_not_product_boundary',
  ],
  note: 'Restated here as an index only — full text lives exclusively in ARCHITECTURE.ts.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ARCHITECTURAL BOUNDARIES (pointer, per Domain)
// ═══════════════════════════════════════════════════════════════════════════

export const ARCHITECTURAL_BOUNDARIES_POINTER = {
  source: "ARCHITECTURE.ts, each Domain's own architecturalBoundaries field",
  domains: [
    'CHAMBER_CORE', 'DIRECTOR_CORE', 'MEMORY_DOMAIN', 'SCREENING_DOMAIN', 'EXPORT_DOMAIN', 'SUGGESTION_DOMAIN',
    'EDITING_DOMAIN', 'AUDIO_DOMAIN', 'VIDEO_DOMAIN', 'GUIDANCE_DOMAIN', 'AUTOMATION_DOMAIN', 'MANUAL_DOMAIN', 'INTEGRATION_DOMAIN',
  ],
  note: 'Full text lives exclusively in ARCHITECTURE.ts, one entry per Domain.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN BOUNDARIES — domain-to-domain, newly assembled (not previously
// listed as a single cross-domain map, though each half already existed).
// ═══════════════════════════════════════════════════════════════════════════

export const DOMAIN_BOUNDARIES = {
  screeningSilencesFive: {
    law: 'While SCREENING_DOMAIN holds the session, SUGGESTION_DOMAIN, EDITING_DOMAIN, GUIDANCE_DOMAIN, AUTOMATION_DOMAIN, and MANUAL_DOMAIN must all be silent.',
    source: 'ARCHITECTURE.ts (DOMAIN_INTERACTION_RULES.rule_6_screening_silence), BEHAVIOR.ts (Screening.expectedBehavior)',
  },
  editingBoundsAudioAndVideo: {
    law: 'AUDIO_DOMAIN and VIDEO_DOMAIN report judgment to EDITING_DOMAIN; neither reports directly to SUGGESTION_DOMAIN.',
    source: 'ARCHITECTURE.ts (EDITING_DOMAIN.childDomains), SPECIFICATION.ts (RefinementJudgmentAuthority.dependencies)',
  },
  directorCoreNeverBypassesGates: {
    law: 'DIRECTOR_CORE routes judgment to SUGGESTION_DOMAIN, AUTOMATION_DOMAIN, or MANUAL_DOMAIN — it never presents judgment to the creator directly, bypassing all three.',
    source: 'SPECIFICATION.ts (DirectorialJudgmentEngine.boundary), BEHAVIOR.ts (Director.constitutionalBoundaries)',
  },
  memoryNeverGovernsDirector: {
    law: "MEMORY_DOMAIN informs DIRECTOR_CORE's judgment; it never governs or overrides it (accumulation, not authority).",
    source: 'ARCHITECTURE.ts (DOMAIN_INTERACTION_RULES.rule_1_no_upward_authority)',
  },
  manualDomainBindsAll: {
    law: "MANUAL_DOMAIN's decisions bind every other Domain; no Domain may resist or re-advocate after a decision is made.",
    source: 'ARCHITECTURE.ts (CONSTITUTIONAL_BOUNDARIES.the_sovereignty_boundary), BEHAVIOR.ts (ManualDirector.constitutionalBoundaries)',
  },
  integrationNeverGrantsOtherDomainsSharedEngineAccess: {
    law: 'Only INTEGRATION_DOMAIN may cross into a Shared Engine or sibling Chamber; no other Domain may do so directly.',
    source: 'ARCHITECTURE.ts (INTEGRATION_DOMAIN.constitutionalResponsibility)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACE BOUNDARIES (pointer)
// ═══════════════════════════════════════════════════════════════════════════

export const INTERFACE_BOUNDARIES_POINTER = {
  source: "INTERFACES.ts, each contract's own limitations field",
  interfaces: [
    'Director', 'AutoDirector', 'ManualDirector', 'Timeline', 'Media', 'Voice', 'Camera', 'Lens',
    'Screening', 'Export', 'Memory', 'Project', 'Guidance', 'AI', 'SharedEngines',
  ],
  note: 'Full text lives exclusively in INTERFACES.ts, one entry per contract.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SHARED ENGINE BOUNDARIES
// ═══════════════════════════════════════════════════════════════════════════

export const SHARED_ENGINE_BOUNDARIES = {
  handOffNeverPreserve: {
    law: 'RAS AL AMR hands off to a Shared Engine; it never persists what the Shared Engine is responsible for.',
    source: 'AZMA-CA-RULING-009, Finding IV; SharedBoundaryContract (SPECIFICATION.ts); SharedEngines (INTERFACES.ts)',
  },
  noPlaceholderAuthority: {
    law: 'No Domain, Module, Interface, or Behavior may assume a Shared Engine supplier that has not been constitutionally authorized (e.g. Recommendation Gate judgment remains an Authorized Constitutional Vacancy).',
    source: 'AZMA-CA-RULING-009, Finding III',
  },
  inheritNeverDuplicate: {
    law: 'Where a Shared Engine already provides a capability, RAS AL AMR inherits it; it never rebuilds a duplicate.',
    source: 'Operating Charter Art. IV, X',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// SOVEREIGN CORE BOUNDARIES
// ═══════════════════════════════════════════════════════════════════════════

export const SOVEREIGN_CORE_BOUNDARIES = {
  advisorOnly: {
    law: 'AI is always advisory. It is never the constitutional authority and never the creator.',
    source: 'SPACE.ts (aiSpace); AI (INTERFACES.ts)',
  },
  routedExclusively: {
    law: 'No Domain, Module, or Interface may communicate with an external AI provider directly. All AI access routes through the Sovereign Core.',
    source: 'Operating Charter Art. XI; AI (INTERFACES.ts)',
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// FORBIDDEN CROSSINGS
// The one section in this file assembling genuinely new content — a
// concrete list, not previously stated together in one place, though every
// individual item already traces to an existing boundary above.
// ═══════════════════════════════════════════════════════════════════════════

export const FORBIDDEN_CROSSINGS: readonly string[] = [
  'AutomationDomain deciding a creative matter on its own initiative.',
  'DirectorCore presenting judgment to the creator without passing through SuggestionDomain\'s four gates.',
  'SuggestionDomain (or any Module) issuing a recommendation while ScreeningDomain holds the session.',
  'EditingDomain, AudioDomain, or VideoDomain performing literal media processing rather than judgment.',
  'ManualDomain\'s decision being resisted, delayed, or re-litigated by any other Domain.',
  'MemoryDomain\'s content being displayed to the creator, or crossing from one creator to another.',
  'ExportDomain authorizing its own confirmation instead of the creator\'s.',
  'Any Domain or Module bypassing IntegrationDomain to reach a Shared Engine or sibling Chamber directly.',
  'Any Domain, Module, or Interface reaching an external AI provider without routing through the Sovereign Core.',
  'Any capability-reframed contract (AutoDirector, ManualDirector, Timeline, Media, Voice, Camera, Lens, plus Editing/Audio/Video/Automation Domains) being treated as a literal production control rather than a judgment capability.',
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const BOUNDARIES_DECLARATION = {
  boundaryConflictsFound: 0,
  forbiddenCrossingsDefined: FORBIDDEN_CROSSINGS.length,
  status: 'PACKAGE II — STAGE 6, STEP 4 OF 5 — BOUNDARIES, submitted for Chief Architect review.',
} as const;

export const RAS_AL_AMR_BOUNDARIES = {
  constitutional: CONSTITUTIONAL_BOUNDARIES_POINTER,
  architectural: ARCHITECTURAL_BOUNDARIES_POINTER,
  domain: DOMAIN_BOUNDARIES,
  interfaceBoundaries: INTERFACE_BOUNDARIES_POINTER,
  sharedEngine: SHARED_ENGINE_BOUNDARIES,
  sovereignCore: SOVEREIGN_CORE_BOUNDARIES,
  forbiddenCrossings: FORBIDDEN_CROSSINGS,
  declaration: BOUNDARIES_DECLARATION,
} as const;
