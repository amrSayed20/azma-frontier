/**
 * AZMA OS — RAS AL AMR
 * PACKAGE IV — THE FIRST LIVING HEART
 * MISSION 1 — LIVING RUNTIME CORE (WORK PACKAGE A: RUNTIME IDENTITY)
 * (Construction ID RAS-IV-M01)
 *
 * DECLARATIVE ONLY — no function, no class, no execution. Defines the
 * shape of the single Runtime Identity the Chamber possesses while active.
 *
 * HONESTY CHECK performed before writing: RUNTIME.ts already defines
 * RuntimeContext (creatorId, sessionId, projectId) — the identity carrier
 * every Package II construct travels with. This file does NOT redefine or
 * duplicate it; RuntimeContext is re-exported by reference and extended
 * with exactly one new field, goalId, which RuntimeContext never carried
 * because the Goal concept did not exist until Package III's
 * PACKAGE_III_EXECUTION_GOAL_MODEL.ts (Stage 6). Runtime Identity is
 * therefore the first construct in this Chamber's history to unify Runtime
 * (Package II) and Goal (Package III) into one living carrier.
 */

import type { RuntimeContext } from './RUNTIME';
import type { GoalConstitutionalState } from './PACKAGE_III_EXECUTION_GOAL_MODEL';
import type { RuntimeCoreLifecycleStage } from './RUNTIME_CORE_LIFECYCLE';

/**
 * The single Runtime Identity the Chamber possesses while a Creator is
 * active. `goalId` is nullable — a Creator may be present before any Goal
 * has been Declared (PACKAGE_III_EXECUTION_GOAL_MODEL.ts, Declared state).
 */
export interface RuntimeCoreIdentity {
  readonly context: RuntimeContext;
  readonly goalId: string | null;
  readonly currentGoalState: GoalConstitutionalState | null;
  readonly currentRuntimeStage: RuntimeCoreLifecycleStage;
}

export const RUNTIME_CORE_IDENTITY_CARDINALITY = {
  rule: 'Exactly one RuntimeCoreIdentity exists per active session. Never zero while the Chamber is active (positions Creation through Closed of RUNTIME_CORE_LIFECYCLE.ts all presuppose exactly one). Never more than one — a second identity would imply a second Creator or a second session sharing one Runtime Core, which no certified artifact authorizes.',
  constitutionalSource: 'RUNTIME.ts, RuntimeContext (Package II, Stage 10) — already a singular, non-plural carrier; this rule makes that singularity explicit for the living Runtime Core built atop it.',
} as const;

export const RUNTIME_CORE_IDENTITY_FIELD_GROUNDING = {
  context: 'RUNTIME.ts, RuntimeContext — re-exported by reference, not redefined.',
  goalId: 'PACKAGE_III_EXECUTION_GOAL_MODEL.ts, GOAL_IDENTITY — "identified by its association with a Creator and a Project... a Goal-specific identifier." This file is the first to give that reserved identifier a concrete home.',
  currentGoalState: 'PACKAGE_III_EXECUTION_GOAL_MODEL.ts, GOAL_CONSTITUTIONAL_STATES (Declared/Prepared/Approved/Active/Achieved/Cancelled/Archived) — read-only reference, never assigned by Runtime Core (GOAL_CONSTITUTIONAL_AUTHORITY: only the Creator may cause any Goal state transition).',
  currentRuntimeStage: 'RUNTIME_CORE_LIFECYCLE.ts (this Mission, Work Package B) — the Runtime Core\'s own lifecycle position, distinct from the Goal\'s lifecycle.',
} as const;

export const RUNTIME_CORE_IDENTITY_DECLARATION = {
  redefinesRuntimeContext: false,
  duplicatesGoalModel: false,
  introducesNewConstitutionalAuthority: false,
  ownsGoal: false,
  status: 'PACKAGE IV — MISSION 1, WORK PACKAGE A, RUNTIME IDENTITY, complete. One new field (goalId) added to the existing RuntimeContext carrier by extension, not restatement.',
} as const;

export const RAS_AL_AMR_RUNTIME_CORE_IDENTITY = {
  cardinality: RUNTIME_CORE_IDENTITY_CARDINALITY,
  fieldGrounding: RUNTIME_CORE_IDENTITY_FIELD_GROUNDING,
  declaration: RUNTIME_CORE_IDENTITY_DECLARATION,
} as const;
