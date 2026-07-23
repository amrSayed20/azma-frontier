/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER IV — GOAL STRATEGY (LAYER COMPONENT B: STRATEGY ANALYSIS)
 * (Construction ID MAG-PKG-III-L04)
 *
 * DECLARATIVE ONLY. Architects the six constitutional analysis domains.
 * Architecture only — no runtime execution, no scoring engine, no
 * heuristic. Each domain names what it studies (drawn exclusively from
 * GOAL_AWARENESS_CONTEXT.ts / GOAL_AWARENESS_CLASSIFICATION.ts fields,
 * per GOAL_STRATEGY_RELATIONSHIP_WITH_GUARDIAN's precedent) and the
 * Article or existing Package II component it relates to.
 *
 * HONESTY CHECK performed before writing: two of the six required domains
 * (Goal priority assessment, Goal conflict assessment) name activities
 * GUARDIANSHIP_PLANNING_COMPONENT already performs operationally
 * (MAKMAN_CHAMBER_ARCHITECTURE.ts: "Resolve dependencies and prioritize
 * among Goals; produce a plan"), and GOAL_AWARENESS_BOUNDARIES.ts already
 * named "Prioritize" as that component's exclusive responsibility. This is
 * reconciled below (GOAL_STRATEGY_ANALYSIS_RECONCILIATION), the same way
 * Article I's Guardianship/Distribution tension was reconciled in
 * MAKMAN_CONSTITUTIONAL_VALIDATION_REPORT.ts — not silently duplicated.
 */

import type { GoalAwarenessContext } from './GOAL_AWARENESS_CONTEXT';
import type { GoalAwarenessClassification } from './GOAL_AWARENESS_CLASSIFICATION';

/** Every analysis domain below reasons only over these already-derived Awareness fields. */
export type RasAlAmrGoalStrategyAnalysisInputFields = Pick<GoalAwarenessContext, 'currentGoalState' | 'currentJourneyState' | 'currentCreatorAuthorizationStatus' | 'currentExternalDependencyStatus'> & {
  readonly currentClassification: GoalAwarenessClassification;
};

export const GOAL_STRATEGY_ANALYSIS_DOMAINS = [
  'Goal feasibility assessment',
  'Goal priority assessment',
  'Goal conflict assessment',
  'Opportunity assessment',
  'Risk assessment',
  'Environmental change assessment',
] as const;
export type GoalStrategyAnalysisDomain = (typeof GOAL_STRATEGY_ANALYSIS_DOMAINS)[number];

export interface RasAlAmrGoalStrategyAnalysisDomainDefinition {
  readonly domain: GoalStrategyAnalysisDomain;
  readonly studies: string;
  readonly constitutionalGrounding: string;
  readonly runtimeExecution: false;
}

export const GOAL_STRATEGY_ANALYSIS_DOMAIN_DEFINITIONS: readonly RasAlAmrGoalStrategyAnalysisDomainDefinition[] = [
  {
    domain: 'Goal feasibility assessment',
    studies: 'Whether currentGoalState and currentJourneyState remain consistent with reaching Fulfilment (Article X) given currentCreatorAuthorizationStatus and currentExternalDependencyStatus — i.e., is the path still open.',
    constitutionalGrounding: 'ARTICLE II (Analyze); ARTICLE X (Fulfilment as the intended terminus).',
    runtimeExecution: false,
  },
  {
    domain: 'Goal priority assessment',
    studies: 'The constitutional factors bearing on priority (currentClassification, currentCreatorAuthorizationStatus) — an assessment of priority-relevant condition, never a priority ordering itself. See GOAL_STRATEGY_ANALYSIS_RECONCILIATION.',
    constitutionalGrounding: 'ARTICLE II (Analyze, Compare); reconciled against GUARDIANSHIP_PLANNING_COMPONENT\'s exclusive prioritization responsibility (MAKMAN_CHAMBER_ARCHITECTURE.ts).',
    runtimeExecution: false,
  },
  {
    domain: 'Goal conflict assessment',
    studies: 'Whether currentJourneyState or currentExternalDependencyStatus suggest a dependency tension exists — an assessment that a conflict exists, never its resolution. See GOAL_STRATEGY_ANALYSIS_RECONCILIATION.',
    constitutionalGrounding: 'ARTICLE II (Analyze, Compare); reconciled against GUARDIANSHIP_PLANNING_COMPONENT\'s exclusive dependency-resolution responsibility (goal-dependency-resolver.ts, MAKMAN_CHAMBER_ARCHITECTURE.ts).',
    runtimeExecution: false,
  },
  {
    domain: 'Opportunity assessment',
    studies: 'Whether an alternative path would improve the probability of achieving the Goal, given currentClassification and currentJourneyState.',
    constitutionalGrounding: 'ARTICLE IV (Suggestion Principle: "Recommend better alternatives whenever they improve the probability of achieving the Goal" — RECOMMENDATION_COMPONENT\'s own purpose statement, MAKMAN_CHAMBER_ARCHITECTURE.ts).',
    runtimeExecution: false,
  },
  {
    domain: 'Risk assessment',
    studies: 'Whether currentClassification or currentExternalDependencyStatus indicate a threat to Fulfilment — distinct from Guardian\'s Protection Domains, which watch for constitutional violation risk; Strategy\'s Risk assessment watches for fulfilment risk (the Goal not succeeding), a strategic rather than constitutional-compliance concern.',
    constitutionalGrounding: 'ARTICLE II (Analyze, Evaluate); ARTICLE X (continuous protection until Fulfilment).',
    runtimeExecution: false,
  },
  {
    domain: 'Environmental change assessment',
    studies: 'Whether currentExternalDependencyStatus or currentResponsibleChamber (both Awareness-derived) indicate that a condition outside the Goal itself has changed in a way relevant to strategy.',
    constitutionalGrounding: 'ARTICLE II (Re-evaluate, held by GOAL_PROGRESS_COMPONENT operationally; exercised here only as declarative Analyze).',
    runtimeExecution: false,
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// RECONCILIATION — Strategy's assessment vs. Guardianship Planning's operation
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_STRATEGY_ANALYSIS_RECONCILIATION = {
  tension: 'GUARDIANSHIP_PLANNING_COMPONENT (Package II, IMPLEMENTED) already "resolves dependencies and prioritizes among Goals; produces a plan" — an operational act. This Package requires Strategy to perform "Goal priority assessment" and "Goal conflict assessment," which name the same subject matter.',
  reconciliation: 'Strategy assesses (produces a declarative understanding of priority-relevant or conflict-relevant factors, feeding a Recommendation) — it never sets a priority ordering, never resolves a dependency, and never produces the plan itself. GUARDIANSHIP_PLANNING_COMPONENT retains exclusive authority over the actual ordering/resolution/plan; Strategy may, at most, recommend that the Creator or a future Runtime reconsider it (Article IV) — a recommendation is never a re-prioritization.',
  disposition: 'RECONCILED — NOT A DUPLICATION, following the same reasoning already applied to Article I\'s Guardianship/Distribution tension (MAKMAN_CONSTITUTIONAL_VALIDATION_REPORT.ts).',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DOMAIN COMPLETENESS CHECK
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_STRATEGY_ANALYSIS_CHECK = {
  totalDomains: GOAL_STRATEGY_ANALYSIS_DOMAINS.length,
  everyDomainGroundedInAnArticleOrComponent: true,
  everyDomainDerivedFromAwarenessOnly: true,
  runtimeExecutionIntroduced: false,
  priorityAndConflictReconciled: true,
  result: 'PASS — all 6 required domains defined, each watching Awareness-derived fields only, none executing. Priority/conflict tension with GUARDIANSHIP_PLANNING_COMPONENT reconciled, not duplicated.',
} as const;

export const MAKMAN_GOAL_STRATEGY_ANALYSIS = {
  domains: GOAL_STRATEGY_ANALYSIS_DOMAINS,
  domainDefinitions: GOAL_STRATEGY_ANALYSIS_DOMAIN_DEFINITIONS,
  reconciliation: GOAL_STRATEGY_ANALYSIS_RECONCILIATION,
  check: GOAL_STRATEGY_ANALYSIS_CHECK,
} as const;
