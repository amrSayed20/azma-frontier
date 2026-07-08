/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 13 — INTERFACE ECOSYSTEM PACKAGE (INTERFACE LIFECYCLE)
 * (Construction ID RAS-II-12, certified as hierarchy Stage 13 — see
 * INTERFACE_COORDINATION.ts header for the numbering ruling.)
 *
 * Merges five of the twenty-five originally-proposed files
 * (INTERFACE_LIFECYCLE.ts, INTERFACE_STATES.ts, INTERFACE_TRANSITIONS.ts,
 * INTERFACE_RECOVERY.ts, INTERFACE_TERMINATION.ts) into one constitutional
 * artifact, per AZMA-CA-RULING-016 rule 6: all five represent one
 * responsibility — the Interface layer's own per-request lifecycle.
 *
 * This is a THIRD, distinct lifecycle in this Chamber — not RUNTIME_LIFECYCLE.ts's
 * system-level lifecycle (Stage 9: the Runtime coming up, running, pausing,
 * resuming, ending) and not IMPLEMENTATION_LIFECYCLE.ts's per-invocation
 * lifecycle (Stage 11: a single pure function's own receive→lookup→enforce→
 * verify→return shape). This one concerns the Interface layer's own
 * translation work: Creator vocabulary in, Implementation delegation,
 * Creator vocabulary out.
 *
 * HONESTY CHECK performed before writing: two of the five merged
 * responsibilities — Recovery and Termination — have NO behavior distinct
 * from what already exists. This file says so explicitly rather than
 * inventing Interface-specific recovery or termination content to make the
 * five names look equally substantial.
 */

export const INTERFACE_LIFECYCLE_STAGES = ['TranslationIn', 'Delegation', 'TranslationOut'] as const;
export type InterfaceLifecycleStage = (typeof INTERFACE_LIFECYCLE_STAGES)[number];

export interface RasAlAmrInterfaceLifecycleStageDefinition {
  readonly stage: InterfaceLifecycleStage;
  readonly constitutionalTrigger: string;
  readonly constitutionalGrounding: string;
  readonly precedingStage: InterfaceLifecycleStage | null;
  readonly followingStages: readonly InterfaceLifecycleStage[];
  readonly boundaries: readonly string[];
}

export const INTERFACE_LIFECYCLE_DEFINITIONS: Readonly<Record<InterfaceLifecycleStage, RasAlAmrInterfaceLifecycleStageDefinition>> = {
  TranslationIn: {
    stage: 'TranslationIn',
    constitutionalTrigger: "The Creator's own action — e.g. calling requestBeatTransition with a CreatorJourneyMoment and (optionally) a CreatorExportConfirmation.",
    constitutionalGrounding: "INTERFACE.ts's visibilityBoundary (Section I): the Creator's vocabulary (CreatorJourneyMoment, CreatorExportConfirmation) is this Interface's own type, never a re-export of RUNTIME.ts's SessionBeat/ExportConfirmationState, so a translation step must exist at the boundary by construction.",
    precedingStage: null,
    followingStages: ['Delegation'],
    boundaries: ['TranslationIn performs no enforcement decision and holds no state — it only converts vocabulary (toRuntimeExportConfirmation), exactly as INTERFACE.ts\'s existing private helpers already do.'],
  },
  Delegation: {
    stage: 'Delegation',
    constitutionalTrigger: 'The translated call is handed to attemptExportConfirmedTransition (IMPLEMENTATION.ts).',
    constitutionalGrounding: 'INTERFACE_COORDINATION.ts\'s interfaceOnImplementation edge — Interface decides nothing itself; the Creator\'s call to requestBeatTransition *is* the authorization, and Implementation\'s own certified 5-stage lifecycle (IMPLEMENTATION_LIFECYCLE.ts, Stage 11: Initialization/Preparation/Execution/Verification/Completion) runs in full during this stage.',
    precedingStage: 'TranslationIn',
    followingStages: ['TranslationOut'],
    boundaries: ['Delegation introduces no new enforcement logic of its own — every check performed here is IMPLEMENTATION.ts\'s, already certified and re-verified (INVARIANTS.ts, INTERFACE_COMPLIANCE_CHECK).'],
  },
  TranslationOut: {
    stage: 'TranslationOut',
    constitutionalTrigger: "Implementation's BeatTransitionResult is returned to this Interface.",
    constitutionalGrounding: "INTERFACE.ts's visibilityBoundary: internal rejection reasons (\"session-complete\" / \"not-the-authorized-next-beat\" / \"not-authorized-by-creator\" / \"export-not-confirmed\") are deliberately not surfaced — the Creator experiences accepted-or-not only, collapsed into CreatorBeatTransitionOutcome.",
    precedingStage: 'Delegation',
    followingStages: [],
    boundaries: ['TranslationOut may narrow or collapse information (rejection reasons, RuntimeContext internals) but may never invent information Implementation did not actually return.'],
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// RECOVERY AND TERMINATION — folded in per AZMA-CA-RULING-016 rule 6;
// documented honestly as non-distinct rather than invented.
// ═══════════════════════════════════════════════════════════════════════════

export const INTERFACE_RECOVERY_FINDING = {
  distinctInterfaceLevelBehavior: false,
  finding: 'The Interface layer defines no recovery behavior of its own. An interrupted session\'s recovery is entirely RUNTIME_LIFECYCLE.ts\'s Recovery stage (Stage 9) — Interface simply calls requestBeatTransition again on the Creator\'s next action, exactly as it would for any other beat. No Interface-specific recovery mechanism exists to document.',
  existingOwner: 'RUNTIME_LIFECYCLE.ts, Recovery stage (Package II, Stage 9).',
} as const;

export const INTERFACE_TERMINATION_FINDING = {
  distinctInterfaceLevelBehavior: true,
  finding: "CreatorBeatTransitionOutcome's { accepted: false } case is the Interface layer's own termination-of-attempt behavior: a rejected request ends there — INTERFACE.ts constructs no retry, no fallback, and no exposed reason (visibilityBoundary). This is genuinely distinct from RUNTIME_LIFECYCLE.ts's system Shutdown (which ends the Runtime, not one request) and from IMPLEMENTATION_LIFECYCLE.ts's Completion (which is Implementation's own return, before translation).",
  existingConstruct: 'CreatorBeatTransitionOutcome (INTERFACE.ts, Section III) — cited here, not redefined.',
} as const;

export const INTERFACE_LIFECYCLE_DECLARATION = {
  totalStages: INTERFACE_LIFECYCLE_STAGES.length,
  mergesProposedFiles: ['INTERFACE_LIFECYCLE.ts', 'INTERFACE_STATES.ts', 'INTERFACE_TRANSITIONS.ts', 'INTERFACE_RECOVERY.ts', 'INTERFACE_TERMINATION.ts'],
  distinctFromRuntimeSystemLifecycle: true,
  distinctFromImplementationPerInvocationLifecycle: true,
  recoveryIsDistinctFromExisting: false,
  terminationIsDistinctFromExisting: true,
  introducesNewConstitutionalAuthority: false,
  status: 'PACKAGE II — STAGE 13, INTERFACE ECOSYSTEM PACKAGE (INTERFACE LIFECYCLE), submitted for Chief Architect review.',
} as const;

export const RAS_AL_AMR_INTERFACE_LIFECYCLE = {
  stages: INTERFACE_LIFECYCLE_STAGES,
  definitions: INTERFACE_LIFECYCLE_DEFINITIONS,
  recovery: INTERFACE_RECOVERY_FINDING,
  termination: INTERFACE_TERMINATION_FINDING,
  declaration: INTERFACE_LIFECYCLE_DECLARATION,
} as const;
