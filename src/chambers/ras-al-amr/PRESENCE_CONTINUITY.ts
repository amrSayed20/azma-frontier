/**
 * AZMA OS — RAS AL AMR
 * PACKAGE IV — THE FIRST LIVING HEART
 * MISSION II — LIVING PRESENCE (WORK PACKAGE B: PRESENCE CONTINUITY)
 * (Construction ID RAS-IV-M02)
 *
 * DECLARATIVE ONLY. Carries forward RAS-CA-RULING-038's Architectural
 * Observation I into concrete shape, per that ruling's own instruction
 * ("Do not modify Mission I. Simply carry this ruling forward into future
 * Runtime design."): Recovery is no longer a chronological
 * RUNTIME_CORE_LIFECYCLE.ts stage — it is a cross-cutting Runtime
 * Capability, invokable while the Runtime remains inside another state.
 * This file gives that capability its first formal shape. It does NOT
 * modify RUNTIME_CORE_LIFECYCLE.ts, which remains exactly as Mission I
 * certified it.
 */

import type { RuntimeCoreLifecycleStage } from './RUNTIME_CORE_LIFECYCLE';

/**
 * The states from which Recovery may be invoked as a cross-cutting
 * capability. Excludes Creation (identity does not yet exist) and Closed
 * (terminal — nothing to recover into).
 */
export const RECOVERY_INVOCABLE_FROM_STAGES: readonly RuntimeCoreLifecycleStage[] = ['Initialization', 'Active', 'Waiting', 'Suspended', 'Closing'];

export interface RasAlAmrRecoveryCapability {
  readonly invocableFrom: readonly RuntimeCoreLifecycleStage[];
  readonly effect: string;
  readonly constitutionalGrounding: string;
  readonly boundaries: readonly string[];
}

export const RECOVERY_CAPABILITY: RasAlAmrRecoveryCapability = {
  invocableFrom: RECOVERY_INVOCABLE_FROM_STAGES,
  effect: 'Restores creative continuity in the Runtime\'s current PresenceExecutionContext without resetting it — the Runtime remains in whatever RuntimeCoreLifecycleStage it already occupies; Recovery changes nothing about which stage is active.',
  constitutionalGrounding: "TIME.ts, Interruption Recovery, second half: \"When the creator returns, the Chamber shall restore creative continuity with clarity and confidence.\" RAS-CA-RULING-038, Architectural Observation I: \"A Runtime may invoke Recovery while remaining inside another Runtime State.\"",
  boundaries: [
    'Recovery restores continuity only — it shall never expand beyond Automatic Continuation, and shall never make or imply a creative decision (BEHAVIOR.ts, AutomaticDirector.forbiddenOutcomes) — identical constraint to RUNTIME_LIFECYCLE.ts\'s original Recovery stage, now applied to the capability form.',
    'Recovery never causes a RuntimeCoreLifecycleStage transition by itself — any actual stage change remains governed exclusively by RUNTIME_CORE_LIFECYCLE.ts\'s own transition table, unchanged.',
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// CONTINUITY GUARANTEE — "never appear reset unless constitutionally required"
// ═══════════════════════════════════════════════════════════════════════════

export const PRESENCE_CONTINUITY_GUARANTEE = {
  rule: 'The Runtime shall never appear reset unless constitutionally required.',
  whatCountsAsConstitutionallyRequiredReset: [
    'The Creator declares a genuinely new Goal for a Project that previously had none (PACKAGE_III_EXECUTION_GOAL_MODEL.ts, Declared state) — there is no prior continuity to preserve because none yet exists.',
    'The prior Goal reached a terminal state (Achieved, Cancelled, or Archived) and the Creator begins a new, unrelated Goal — continuity of the OLD Goal ends by constitutional design (GOAL_LIFECYCLE_DEFINITIONS, terminal states have no following stage); continuity of the PARTNERSHIP itself does not (RUNTIME_LIFECYCLE.ts, Shutdown: "ends this session only, never the partnership").',
  ],
  whatNeverJustifiesAReset: [
    'Elapsed time alone (TIME.ts, Creative Time: "measured by creative progress rather than elapsed minutes").',
    'A Suspended → Recovery transition (that is precisely what Recovery exists to prevent from feeling like a reset).',
    'Any Platform-side event not caused by the Creator.',
  ],
  constitutionalSource: 'TIME.ts, Interruption Recovery and Creative Time; RUNTIME_LIFECYCLE.ts, Shutdown boundary (Package II, Stage 9); PACKAGE_III_EXECUTION_GOAL_MODEL.ts, GOAL_LIFECYCLE_DEFINITIONS.',
} as const;

export const PRESENCE_CONTINUITY_DECLARATION = {
  recoveryModeledAsCapabilityNotStage: true,
  runtimeCoreLifecycleModified: false,
  introducesNewLifecycleTransition: false,
  introducesNewConstitutionalAuthority: false,
  status: 'PACKAGE IV — MISSION II, WORK PACKAGE B, PRESENCE CONTINUITY, complete. Recovery given its first cross-cutting shape per RAS-CA-RULING-038, Architectural Observation I; RUNTIME_CORE_LIFECYCLE.ts (Mission I) untouched.',
} as const;

export const RAS_AL_AMR_PRESENCE_CONTINUITY = {
  recoveryCapability: RECOVERY_CAPABILITY,
  continuityGuarantee: PRESENCE_CONTINUITY_GUARANTEE,
  declaration: PRESENCE_CONTINUITY_DECLARATION,
} as const;
