/**
 * AZMA OS — RAS AL AMR
 * PACKAGE II — CONSTITUTIONAL ARCHITECTURE
 * STAGE 9 — RUNTIME FOUNDATION PACKAGE (STEP 5 OF 5: RUNTIME LIFECYCLE)
 *
 * Defines Runtime Initialization, Activation, Suspension, Recovery, and
 * Shutdown — constitutionally only. This is a different lifecycle from
 * RUNTIME.ts's own session-beat and recommendation-cycle transitions
 * (RUNTIME_PIPELINE.ts points to those); this one concerns the Runtime
 * system itself coming up, running, pausing, resuming, and ending.
 *
 * Honesty check performed before writing: Suspension and Recovery are NOT
 * two independently-grounded constitutional concepts. TIME.ts names exactly
 * one thing — Interruption Recovery — and splits it, in its own text, into
 * "interruption occurs" and "creator returns." This file names those two
 * halves Suspension and Recovery rather than inventing two separate
 * constitutional sources for them.
 */

export const RUNTIME_LIFECYCLE_STAGES = ['Initialization', 'Activation', 'Suspension', 'Recovery', 'Shutdown'] as const;
export type RuntimeLifecycleStage = (typeof RUNTIME_LIFECYCLE_STAGES)[number];

export interface RasAlAmrRuntimeLifecycleStageDefinition {
  readonly stage: RuntimeLifecycleStage;
  readonly constitutionalTrigger: string;
  readonly constitutionalGrounding: string;
  readonly precedingStage: RuntimeLifecycleStage | null;
  readonly followingStages: readonly RuntimeLifecycleStage[];
  readonly boundaries: readonly string[];
}

export const RUNTIME_LIFECYCLE_DEFINITIONS: Readonly<Record<RuntimeLifecycleStage, RasAlAmrRuntimeLifecycleStageDefinition>> = {
  Initialization: {
    stage: 'Initialization',
    constitutionalTrigger: "The creator's presence in a new or returning session (RUNTIME.ts's SESSION_BEATS[0], 'Entry').",
    constitutionalGrounding: "STORY.ts's Entry: 'the Chamber immediately understands the project before presenting direction.' ChamberIdentityAuthority (SPECIFICATION.ts) becomes the active carrier of the Chamber's permanent identity for this session.",
    precedingStage: null,
    followingStages: ['Activation'],
    boundaries: ['Initialization establishes identity; it authorizes no recommendation, no judgment, and no project modification of any kind.'],
  },
  Activation: {
    stage: 'Activation',
    constitutionalTrigger: 'The session proceeds through STORY.ts\'s narrative beats (Discovery through Export) with the creator actively engaged.',
    constitutionalGrounding: "TIME.ts's Creative Time: 'measured by creative progress rather than elapsed minutes.' All applicable Domains (per RUNTIME_COORDINATION.ts) operate together for the duration of Activation.",
    precedingStage: 'Initialization',
    followingStages: ['Suspension', 'Shutdown'],
    boundaries: ['Activation is bounded by every invariant already certified in RUNTIME.ts (RUNTIME_INVARIANTS) — Activation introduces no exception to any of them.'],
  },
  Suspension: {
    stage: 'Suspension',
    constitutionalTrigger: 'An interruption to the creative session — the creator steps away before the session\'s narrative arc completes.',
    constitutionalGrounding: "TIME.ts's Interruption Recovery: 'Interruptions shall not break the creative journey.' This is the first half of that single constitutional concept — the interruption itself.",
    precedingStage: 'Activation',
    followingStages: ['Recovery'],
    boundaries: ['Suspension holds state; it performs no automatic creative decision, matching BoundedContinuityMechanism\'s (SPECIFICATION.ts) narrow permitted scope.'],
  },
  Recovery: {
    stage: 'Recovery',
    constitutionalTrigger: 'The creator returns after a Suspension.',
    constitutionalGrounding: "TIME.ts's Interruption Recovery, second half: 'When the creator returns, the Chamber shall restore creative continuity with clarity and confidence.' Enacted by BoundedContinuityMechanism / the AutomaticDirector behavior (BEHAVIOR.ts).",
    precedingStage: 'Suspension',
    followingStages: ['Activation'],
    boundaries: ['Recovery restores continuity only — it shall never expand beyond Automatic Continuation, and shall never make or imply a creative decision (BEHAVIOR.ts, AutomaticDirector.forbiddenOutcomes).'],
  },
  Shutdown: {
    stage: 'Shutdown',
    constitutionalTrigger: "The session's narrative arc completes (STORY.ts's Farewell beat, following a confirmed Export).",
    constitutionalGrounding: "STORY.ts's Farewell: 'the session ends with continuity rather than closure... the Chamber preserves creative context for the next return... the creator leaves stronger than when the session began.'",
    precedingStage: 'Activation',
    followingStages: [],
    boundaries: ['Shutdown is not deletion — creative context (Director DNA, via PartnershipMemoryLedger) persists across Shutdown, per MEMORY_DOMAIN\'s long-term partnership responsibility. Shutdown ends this session only, never the partnership.'],
  },
} as const;

export const RUNTIME_LIFECYCLE_DECLARATION = {
  totalStages: RUNTIME_LIFECYCLE_STAGES.length,
  distinctFromSessionBeatLifecycle: true,
  suspensionAndRecoveryShareOneConstitutionalSource: true,
  introducesNewConstitutionalAuthority: false,
  status: 'PACKAGE II — STAGE 9, STEP 5 OF 5 — RUNTIME LIFECYCLE, submitted for Chief Architect review.',
} as const;

export const RAS_AL_AMR_RUNTIME_LIFECYCLE = {
  stages: RUNTIME_LIFECYCLE_STAGES,
  definitions: RUNTIME_LIFECYCLE_DEFINITIONS,
  declaration: RUNTIME_LIFECYCLE_DECLARATION,
} as const;
