/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-contracts.ts
 *
 * Immutable contracts for executable goals.
 */

import type { MakmanCommercialIntent } from './MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS';

export enum GoalStatus {
  CREATED = 'CREATED',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum GoalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * PACKAGE XV — CREATOR PACING PREFERENCE FOUNDATION: a real, explicit
 * Creator choice of cinematic energy — never a BPM, beat, or waveform
 * value (no such signal exists anywhere in the platform), never inferred
 * from visual style. Three named tiers, the same "small closed enum" shape
 * already established by GoalPriority, so pacing carries genuine meaning
 * a Creator can deliberately pick without implying false numeric
 * precision this platform cannot honestly produce.
 */
export enum PacingPreference {
  CONTEMPLATIVE = 'CONTEMPLATIVE',
  BALANCED = 'BALANCED',
  ENERGETIC = 'ENERGETIC'
}

/**
 * PACKAGE XVI — CREATOR TRANSITION PREFERENCE FOUNDATION: a real, explicit
 * Creator choice of how one cinematic state should yield to the next —
 * distinct from PacingPreference (overall composition energy). Never a
 * cut-type implementation (no "dissolve"/"wipe"/"crossfade" executable
 * behavior exists anywhere in the platform to honestly name), never
 * derived from pacing alone. Named directly after the Chief Architect's
 * own four descriptors, not an invented vocabulary.
 */
export enum TransitionPreference {
  SOFT = 'SOFT',
  GRADUAL = 'GRADUAL',
  DECISIVE = 'DECISIVE',
  DIRECT = 'DIRECT'
}

export interface GoalMetric {
  readonly key: string;
  readonly value: number;
}

/**
 * MILESTONE SUCCESS DEFINITION FOUNDATION (Constitutional Package III):
 * a single Creator-stated criterion for what must become observably true
 * for a Milestone Goal to be considered successful.
 *
 * CONSTITUTIONAL DISTINCTION (required by Package III Decree):
 *   GoalStatus        = operational lifecycle state (what the pipeline did)
 *   SuccessCriterion  = Creator's declared intent (what must happen in reality)
 *   Observed Outcome  = what later actually happened (future — not built here)
 *   Milestone Fulfillment = judgment comparing criterion vs. outcome (future)
 *   Sovereign Purpose Fulfillment = highest judgment (future)
 *
 * These MUST NOT be collapsed. A Goal whose status is COMPLETED has NOT
 * automatically satisfied any SuccessCriterion — those are constitutionally
 * distinct events.
 *
 * `description` is deliberately open-form: the Creator expresses what must
 * be observably true without being forced into a closed taxonomy (the decree
 * explicitly prohibits hard-coding a fixed set of outcome types).
 *
 * `definedAtMs` records when the Creator stated this criterion. If the
 * Creator later replaces their criteria list, the new list's timestamps
 * reflect the replacement; the historical list is not retained (minimum
 * construction — no version history). Future observation infrastructure
 * should snapshot criterion state at assessment time.
 */
export interface SuccessCriterion {
  readonly criterionId: string;
  readonly description: string;
  readonly definedAtMs: number;
}

export interface GoalDependency {
  readonly goalId: string;
}

export interface GoalContract {
  readonly goalId: string;

  /**
   * PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE: the sovereign owner
   * of this Goal. Without this field, any read of GoalState's own
   * getGoals() would mix every Creator's Goals together — the exact
   * cross-tenant leak the Chief Architect ruled out as constitutionally
   * unsafe. Sourced directly from the originating CompiledAssemblyGraph's
   * own subscriberTenantId (see MAKMAN_GOAL_CREATION_CONNECTOR.ts) —
   * never invented, never inferred.
   */
  readonly subscriberTenantId: string;

  readonly title: string;

  readonly description: string;

  readonly priority: GoalPriority;

  readonly status: GoalStatus;

  readonly dependencies: readonly GoalDependency[];

  readonly metrics: readonly GoalMetric[];

  readonly createdAtMs: number;

  readonly updatedAtMs: number;

  /**
   * PACKAGE XI — COMMERCIAL INTENT DURABLE STORAGE: the real
   * MakmanCommercialIntent the Creator declared at submission time,
   * carried onto the Goal itself at creation (see
   * MAKMAN_GOAL_CREATION_CONNECTOR.ts) so it survives exactly as long as
   * the Goal does in GoalState — the same durability every other field
   * on this contract already has, no more and no less. Absent when a
   * Goal was created without this package's own wiring (should not occur
   * going forward, but old callers/tests may still omit it honestly).
   */
  readonly commercialIntent?: MakmanCommercialIntent;

  /**
   * PACKAGE XV — CREATOR PACING PREFERENCE FOUNDATION: the Creator's own,
   * explicitly-chosen cinematic energy preference, carried onto the Goal
   * at creation time (see MAKMAN_GOAL_CREATION_CONNECTOR.ts) so it
   * survives the same GoalState lifecycle every other field here already
   * relies on. Genuinely optional — unlike commercialIntent, a real Goal
   * can honestly exist with no pacing preference at all, since the
   * Creator may simply choose not to state one; absent means "not
   * stated," never defaulted to a guessed tier.
   */
  readonly pacingPreference?: PacingPreference;

  /**
   * PACKAGE XVI — CREATOR TRANSITION PREFERENCE FOUNDATION: the Creator's
   * own, explicitly-chosen cut/transition character, carried onto the
   * Goal at creation time (see MAKMAN_GOAL_CREATION_CONNECTOR.ts) so it
   * survives the same GoalState lifecycle every other field here already
   * relies on. Genuinely optional, same treatment as pacingPreference —
   * absent means "not stated," never defaulted to a guessed value.
   */
  readonly transitionPreference?: TransitionPreference;

  /**
   * MILESTONE SUCCESS DEFINITION FOUNDATION (Constitutional Package III):
   * the Creator's explicit definition of what observable outcomes must occur
   * for this Goal to be considered successful. Absent when the Creator has
   * not yet stated a Success Definition — never inferred, never defaulted.
   *
   * An empty array means the Creator submitted an explicit empty list
   * (i.e., removed all criteria). Absent (undefined) means criteria were
   * never stated.
   *
   * GoalStatus.COMPLETED ≠ any criterion being satisfied. These are
   * constitutionally separate events — see SuccessCriterion above.
   */
  readonly successCriteria?: readonly SuccessCriterion[];

  /**
   * SOVEREIGN PURPOSE → MILESTONE GOAL FOUNDATION (Constitutional Package II):
   * when present, this Goal is constitutionally a Milestone Goal serving
   * the Creator's Sovereign Purpose. The field stores the exact wording of
   * the Purpose at the time of designation (a snapshot), not a foreign-key
   * reference to the current Purpose text.
   *
   * TEMPORAL GUARANTEE: if the Creator later updates their Sovereign Purpose
   * wording, existing Milestone Goals retain the Purpose statement they were
   * designated under — the historical relationship is preserved without
   * requiring a full Purpose version history. Re-designating a Goal as a
   * Milestone AFTER updating the Purpose stamps the new wording (the Creator
   * is explicitly re-affirming the relationship under the new Purpose, which
   * is a correct semantic act, not an accidental overwrite).
   *
   * Absent = this Goal is NOT a Milestone Goal.
   * Present = this Goal IS a Milestone Goal; the value is the Purpose it serves.
   */
  readonly sovereignPurposeStatement?: string;
}