/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER III — GOAL GUARDIAN (LAYER COMPONENT B: GUARDIAN PROTECTION)
 * (Construction ID MAG-PKG-III-L03)
 *
 * DECLARATIVE ONLY. Architects the four constitutional protection domains.
 * Each domain names the condition Guardian watches for (drawn exclusively
 * from GOAL_AWARENESS_CONTEXT.ts / GOAL_AWARENESS_CLASSIFICATION.ts fields),
 * the Article it protects, and the violation-risk signal — never a runtime
 * check, never an execution.
 */

import type { GoalAwarenessContext } from './GOAL_AWARENESS_CONTEXT';
import type { GoalAwarenessClassification } from './GOAL_AWARENESS_CLASSIFICATION';

/** Every protection domain below reasons only over these already-derived Awareness fields. */
export type RasAlAmrGoalGuardianProtectionInputFields = Pick<GoalAwarenessContext, 'currentCreatorAuthorizationStatus' | 'currentGoalState' | 'currentJourneyState'> & {
  readonly currentClassification: GoalAwarenessClassification;
};

export const GOAL_GUARDIAN_PROTECTION_DOMAINS = [
  'Creator Authority Protection',
  'Goal Integrity Protection',
  'Journey Continuity Protection',
  'Constitutional Boundary Protection',
] as const;
export type GoalGuardianProtectionDomain = (typeof GOAL_GUARDIAN_PROTECTION_DOMAINS)[number];

export interface RasAlAmrGoalGuardianProtectionDomainDefinition {
  readonly domain: GoalGuardianProtectionDomain;
  readonly watches: string;
  readonly violationRiskSignal: string;
  readonly constitutionalGrounding: string;
  readonly runtimeExecution: false;
}

export const GOAL_GUARDIAN_PROTECTION_DOMAIN_DEFINITIONS: readonly RasAlAmrGoalGuardianProtectionDomainDefinition[] = [
  {
    domain: 'Creator Authority Protection',
    watches: 'currentCreatorAuthorizationStatus.',
    violationRiskSignal: 'A Goal continuing to progress (currentJourneyState advancing, or currentGoalState changing) while currentCreatorAuthorizationStatus === "awaiting-authorization" — i.e., a stage that Article VIII names as approval-gated proceeding without the approval it requires.',
    constitutionalGrounding: 'ARTICLE II ("never execute without explicit Creator authorization"); ARTICLE VIII (8 named actions require Creator approval).',
    runtimeExecution: false,
  },
  {
    domain: 'Goal Integrity Protection',
    watches: 'currentGoalState, together with the already-documented Constitutional Compliance Gap in goal-state.ts.',
    violationRiskSignal: 'Any rewrite, replacement, or removal of a Goal that did not originate from a Creator-authorized action. This domain is constitutionally necessary precisely because GoalState.update()/remove() (Package I finding, MAKMAN_CONSTITUTIONAL_VALIDATION_REPORT.ts / MAKMAN_BOUNDARY_MATRIX.ts) hold no authorization gate today — Guardian names the risk this creates; it does not close the gap, since that would require modifying goal-state.ts, which is Repository Reality, out of scope for a documentation-only Living Layer.',
    constitutionalGrounding: 'ARTICLE VII ("shall never rewrite a Goal... replace a Goal... cancel a Goal without authorization").',
    runtimeExecution: false,
  },
  {
    domain: 'Journey Continuity Protection',
    watches: 'currentJourneyState.',
    violationRiskSignal: 'A Goal\'s Journey (the 6-stage lifecycle, MAKMAN_GOAL_LIFECYCLE_ARCHITECTURE.ts) being abandoned, skipped, or left permanently unresolved without reaching one of Article X\'s three named terminal conditions (Fulfilment, Cancellation, explicit Creator instruction).',
    constitutionalGrounding: 'ARTICLE X ("continuous protection... until Fulfilment, Cancellation, or explicit Creator instruction").',
    runtimeExecution: false,
  },
  {
    domain: 'Constitutional Boundary Protection',
    watches: 'currentClassification (all 7 Awareness classifications), with particular attention to the already-documented CANCELLED_CLASSIFICATION_GAP.',
    violationRiskSignal: 'A classification implying an out-of-bounds condition — most notably a Goal classified "Cancelled" (mapped from GoalStatus.FAILED, per CANCELLED_CLASSIFICATION_GAP, Living Layer II) being treated identically to an ordinary failure rather than the deliberate, dignified Creator act Article X and RELATIONSHIP.ts describe. Guardian must be aware of this imprecision when reasoning about boundary conditions, not silently assume the mapping is exact.',
    constitutionalGrounding: 'ARTICLE VII (Forbidden Authority, the full 9-item list, carried forward unchanged from Package I).',
    runtimeExecution: false,
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_GUARDIAN_PROTECTION_DECLARATION = {
  totalDomains: GOAL_GUARDIAN_PROTECTION_DOMAINS.length,
  everyDomainGroundedInAnArticle: true,
  everyDomainDerivedFromAwarenessOnly: true,
  runtimeExecutionIntroduced: false,
  status: 'LIVING LAYER III, LAYER COMPONENT B, GOAL GUARDIAN PROTECTION, complete. All 4 required domains defined, each watching an Awareness-derived field, none executing.',
} as const;

export const MAKMAN_GOAL_GUARDIAN_PROTECTION = {
  domains: GOAL_GUARDIAN_PROTECTION_DOMAINS,
  domainDefinitions: GOAL_GUARDIAN_PROTECTION_DOMAIN_DEFINITIONS,
  declaration: GOAL_GUARDIAN_PROTECTION_DECLARATION,
} as const;
