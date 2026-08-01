/**
 * AZMA OS — Makman Al-Ghayah
 * SOVEREIGN GAP INVESTIGATION FOUNDATION — Constitutional Foundation Package VIII
 *
 * A Knowledge Requirement is the Empire's constitutional declaration of what
 * information is still missing before a classified Fulfillment Gap can be
 * understood. It does not investigate. It does not recommend. It names only
 * what must be learned and whether it can currently be obtained.
 *
 * CONSTITUTIONAL DISTINCTION from prior layers:
 *   Fulfillment Assessment: "What does the evidence support?"
 *   Fulfillment Gap:        "What remains unresolved?"
 *   Gap Classification:     "What kind of gap is this?"
 *   Knowledge Requirement:  "What must the Empire learn to understand this gap?"
 *
 * This package intentionally stops before investigation. It names the
 * required knowledge and identifies where it can come from. It does not
 * obtain, request, or invoke anything. That authority belongs to a future
 * package authorized to perform Sovereign Knowledge Investigation.
 *
 * RELATIONSHIP WITH AL HUJJAH:
 * Makman Al Ghayah defines what must be known. Al Hujjah discovers validated
 * knowledge. This package establishes constitutional investigation requests
 * but does NOT invoke Al Hujjah. Invocation is a future responsibility.
 *
 * NOT PERSISTED SEPARATELY:
 * Knowledge Requirements are deterministically derivable from an immutable
 * GoalFulfillmentGapReport (which is itself derived from an immutable
 * GoalFulfillmentAssessment). No new table is needed.
 */

import type { FulfillmentGapCategory } from './fulfillment-gap-contracts';
import type { GapClass } from './fulfillment-gap-contracts';

/**
 * Where the required knowledge can currently be obtained.
 *
 * OBSERVABLE_INTERNALLY: AZMA OS platform signals already provide, or will
 *   naturally provide, this information through existing mechanisms.
 *   Example: consumption event data is recorded automatically by the
 *   observation system (Package IV) as publications are accessed.
 *
 * REQUIRES_INVESTIGATION: The required information exceeds what AZMA OS
 *   can observe from its own signals. External inquiry — from Al Hujjah
 *   or another Sovereign State — is constitutionally required to obtain it.
 *   Example: whether a specific open-form outcome (100 qualified leads)
 *   was achieved in the real world.
 *
 * NOT_CURRENTLY_OBTAINABLE: The information cannot be obtained through any
 *   mechanism currently available to the Empire. Named honestly rather than
 *   papered over with a false certainty.
 */
export type KnowledgeAvailability =
  | 'OBSERVABLE_INTERNALLY'
  | 'REQUIRES_INVESTIGATION'
  | 'NOT_CURRENTLY_OBTAINABLE';

/**
 * The Empire's constitutional declaration of one piece of required knowledge.
 * Derived from one CriterionFulfillmentGap. Never derived for NO_ACTIVE_GAP
 * criteria — no knowledge is required where the gap does not exist.
 *
 * `questionStatement` names what must be learned without diagnosing why
 * the gap exists or prescribing a remedy. No causal inference. No recommendation.
 *
 * `criterionDescriptionSnapshot` is carried forward from the gap, preserving
 * the Creator's exact wording at assessment time.
 *
 * `availability` identifies where the knowledge can currently come from,
 * enabling future packages to route investigation appropriately.
 */
export interface KnowledgeRequirement {
  readonly goalId: string;
  readonly assessmentId: string;
  readonly criterionId: string;
  readonly criterionDescriptionSnapshot: string;
  readonly gapClass: GapClass;
  readonly gapCategory: FulfillmentGapCategory;
  readonly questionStatement: string;
  readonly availability: KnowledgeAvailability;
  readonly identifiedAtMs: number;
}

/**
 * The complete set of Knowledge Requirements for one Milestone Goal,
 * derived from one GoalFulfillmentGapReport.
 *
 * Contains one KnowledgeRequirement per criterion that has an active gap.
 * Criteria with NO_ACTIVE_GAP produce no requirement.
 * Empty when the gap report has no active gaps (all criteria fulfilled or
 * no criteria defined).
 */
export interface GapKnowledgeRequirementReport {
  readonly goalId: string;
  readonly assessmentId: string;
  readonly derivedAtMs: number;
  readonly requirements: readonly KnowledgeRequirement[];
}
