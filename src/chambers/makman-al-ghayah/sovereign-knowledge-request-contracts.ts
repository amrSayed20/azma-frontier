/**
 * AZMA OS — Makman Al-Ghayah
 * SOVEREIGN KNOWLEDGE REQUEST FOUNDATION — Constitutional Foundation Package IX
 *
 * A Sovereign Knowledge Request is Makman Al-Ghayah's formal constitutional
 * declaration to Al Hujjah Al-Damighah:
 *
 *   "This is the knowledge I require. I cannot determine it myself.
 *    I have not attempted to determine it. I am asking."
 *
 * CONSTITUTIONAL POSITION IN THE CHAIN:
 *   Knowledge Requirement (Package VIII) — names what must be known.
 *   Knowledge Request  (Package IX)  — formally issues the need to know.
 *
 * The distinction matters:
 *   A Knowledge Requirement is an internal constitutional artifact.
 *   A Knowledge Request is a cross-chamber constitutional statement.
 *   Makman may have many requirements; it issues one request per requirement.
 *
 * WHAT A REQUEST CONTAINS:
 *   The typed, domain-specific question — no generic payload bags.
 *   The gap context — so Al Hujjah knows what drove the request.
 *   The availability hint — so Al Hujjah knows where to look.
 *   A request identity — so the request can be tracked.
 *
 * WHAT A REQUEST DOES NOT CONTAIN:
 *   No investigation result.
 *   No answer.
 *   No recommendation.
 *   No AI reasoning.
 *   No conclusion about why the gap exists.
 *
 * NOT PERSISTED SEPARATELY:
 *   A request is deterministically derivable from an immutable
 *   GapKnowledgeRequirementReport (Package VIII), which is itself derivable
 *   from an immutable GoalFulfillmentAssessment. No new table is needed.
 *   Persistence of pending requests belongs to a future package once
 *   Al Hujjah's receiving boundary is constitutionally established.
 *
 * REUSE INVESTIGATION (Package IX):
 *   ChamberRequest (core/chamber-integration/types/chamber-communication-contracts.ts):
 *     Generic OS routing infrastructure with payload: Record<string, unknown>.
 *     Buries constitutional vocabulary in an untyped bag. Not reused.
 *   ChamberExportPayload (shared/contracts/bridge.types.ts):
 *     Travels FROM Al Hujjah TO Makman carrying an IntelligenceReport.
 *     Wrong direction. Not reused.
 *   No existing structure carries Makman's domain vocabulary in typed form.
 *   Minimum construction: this file + sovereign-knowledge-request-engine.ts.
 */

import type { FulfillmentGapCategory, GapClass } from './fulfillment-gap-contracts';
import type { KnowledgeAvailability } from './gap-investigation-contracts';

/**
 * Makman Al-Ghayah's formal constitutional request for one piece of knowledge.
 * Derived from one KnowledgeRequirement. Carries all context Al Hujjah will
 * need to understand what is being asked and where to look.
 *
 * `requestId` identifies this specific request instance. It is not guaranteed
 * stable across repeated derivations — stability requires persistence, which
 * belongs to a future package when Al Hujjah's receiving boundary is built.
 *
 * `questionStatement` is the exact question that must be answered. It names
 * what must be learned — not why the gap exists, not what the Creator should do.
 *
 * `availability` is the constitutional hint about where the answer can come from.
 * OBSERVABLE_INTERNALLY means AZMA OS platform signals already have the mechanism.
 * REQUIRES_INVESTIGATION means external inquiry is constitutionally required.
 *
 * `gapClass` and `gapCategory` are carried forward so Al Hujjah understands
 * the constitutional nature of the gap driving this request, without needing
 * to re-derive it from the full assessment chain.
 */
export interface SovereignKnowledgeRequest {
  readonly requestId: string;
  readonly goalId: string;
  readonly assessmentId: string;
  readonly criterionId: string;
  readonly criterionDescriptionSnapshot: string;
  readonly gapClass: GapClass;
  readonly gapCategory: FulfillmentGapCategory;
  readonly questionStatement: string;
  readonly availability: KnowledgeAvailability;
  readonly requestedAtMs: number;
}

/**
 * The complete batch of Knowledge Requests issued by Makman Al-Ghayah
 * for one Milestone Goal. Contains one SovereignKnowledgeRequest per
 * active KnowledgeRequirement (i.e., per criterion that had an active gap).
 *
 * Empty when the goal has no active gaps (all criteria fulfilled, or no
 * criteria defined). The Empire does not manufacture requests where none
 * are constitutionally required.
 *
 * `batchId` identifies this issuance. `issuedAtMs` records when Makman
 * formally asked.
 */
export interface SovereignKnowledgeRequestBatch {
  readonly batchId: string;
  readonly goalId: string;
  readonly assessmentId: string;
  readonly requests: readonly SovereignKnowledgeRequest[];
  readonly issuedAtMs: number;
}
