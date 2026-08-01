/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE RECEPTION FOUNDATION — Constitutional Foundation Package X
 *
 * The constitutional identities of the two citizens Al Hujjah serves,
 * and the unified reception record produced when either citizen arrives.
 *
 * ─── CITIZEN IDENTITY ───────────────────────────────────────────────────────
 *
 *   A Creator voluntarily enters Al Hujjah seeking knowledge.
 *   The Creator owns the question. The Creator may ask anything.
 *   The domain of inquiry is declared by the Creator's own curiosity.
 *   The question is not constitutional — it is personal.
 *
 *   Input: a question in the Creator's own words + the domain they are asking about.
 *   Origin: the Creator, through the Citizen Investigation Chamber.
 *
 * ─── SOVEREIGN IDENTITY ─────────────────────────────────────────────────────
 *
 *   Makman Al-Ghayah sends a formal constitutional Knowledge Request.
 *   Makman owns no opinion. Makman owns no answer.
 *   Makman asks only constitutional questions necessary to determine whether
 *   a Creator has achieved the purpose for which an Asset was created.
 *   The question is constitutional — derived from evidence, not curiosity.
 *
 *   Input: a typed SovereignKnowledgeReceptionPayload with full lineage.
 *   Origin: Makman Al-Ghayah, through the Goal Fulfillment Investigation path.
 *
 * ─── THE RECEPTION BOUNDARY ─────────────────────────────────────────────────
 *
 *   Both citizens arrive at the same constitutional entrance.
 *   Both are acknowledged. Both are validated according to their own language.
 *   Neither is investigated until Reception is complete.
 *
 *   A RECEIVED reception has passed all constitutional validation.
 *   A REJECTED reception has failed at least one validation check.
 *   In both cases the original payload is preserved for lineage.
 *
 *   The Investigation Engine shall not be invoked until a valid (RECEIVED)
 *   KnowledgeReception exists. This order is constitutional and immutable:
 *
 *     Reception → Understanding → Investigation → Evidence → Knowledge → Export
 *
 * ─── CHAMBER INDEPENDENCE ───────────────────────────────────────────────────
 *
 *   Al Hujjah's reception vocabulary is declared here independently.
 *   Values align with Makman's GapClass, FulfillmentGapCategory, and
 *   KnowledgeAvailability by constitutional design — not by import dependency.
 *   The inter-chamber bridge (built in a future package) is responsible for
 *   mapping Makman's types onto Al Hujjah's reception payload. These two
 *   Sovereign States remain constitutionally independent.
 */

/** The constitutional identity of a request's origin. */
export type KnowledgeReceptionOrigin = 'CITIZEN' | 'SOVEREIGN';

/** The constitutional status of a knowledge reception. */
export type ReceptionStatus = 'RECEIVED' | 'REJECTED';

/**
 * Al Hujjah's constitutional vocabulary for gap classification.
 * Values align with Makman's GapClass by constitutional design.
 */
export type ReceptionGapClass = 'OBSERVATION_GAP' | 'FULFILLMENT_GAP' | 'NO_ACTIVE_GAP';

/**
 * Al Hujjah's constitutional vocabulary for the fine-grained gap category.
 * Values align with Makman's FulfillmentGapCategory by constitutional design.
 */
export type ReceptionGapCategory =
  | 'EVIDENCE_AVAILABILITY'
  | 'EVIDENCE_SUFFICIENCY'
  | 'FULFILLMENT_ABSENT'
  | 'NO_ACTIVE_GAP';

/**
 * Al Hujjah's constitutional vocabulary for where required knowledge can come from.
 * Values align with Makman's KnowledgeAvailability by constitutional design.
 *
 * OBSERVABLE_INTERNALLY: AZMA OS platform signals already have the mechanism.
 * REQUIRES_INVESTIGATION: External inquiry is constitutionally required.
 * NOT_CURRENTLY_OBTAINABLE: Cannot be obtained through any available mechanism.
 */
export type ReceptionKnowledgeAvailability =
  | 'OBSERVABLE_INTERNALLY'
  | 'REQUIRES_INVESTIGATION'
  | 'NOT_CURRENTLY_OBTAINABLE';

/**
 * A Creator's voluntary request for knowledge.
 *
 * The Creator owns the question. The domain is declared.
 * No constitutional lineage is carried — the Creator is the origin.
 * `requestId` and `requestedAtMs` are assigned by the reception engine.
 */
export interface CitizenKnowledgeRequest {
  readonly requestId: string;
  readonly query: string;
  readonly domain: string;
  readonly requestedAtMs: number;
}

/**
 * Makman Al-Ghayah's formal Knowledge Request as received by Al Hujjah.
 *
 * This is Al Hujjah's own reception form. It carries the same constitutional
 * vocabulary as Makman's SovereignKnowledgeRequest, with field names preserved
 * to minimise translation burden on the future inter-chamber bridge.
 *
 * `questionStatement` is the exact question that must be answered.
 *   It names what must be learned — not why the gap exists.
 *
 * `availability` tells Al Hujjah where the knowledge can come from:
 *   OBSERVABLE_INTERNALLY → platform signals already have the mechanism.
 *   REQUIRES_INVESTIGATION → external inquiry is constitutionally required.
 *   NOT_CURRENTLY_OBTAINABLE → cannot currently be obtained.
 *
 * `gapClass` and `gapCategory` carry the constitutional context of the gap
 *   that drove this request. Al Hujjah does not re-derive them from the chain —
 *   they are delivered with the request.
 *
 * `goalId`, `assessmentId`, `criterionId`, `criterionDescriptionSnapshot`
 *   are lineage fields. Every investigation result can be traced back to
 *   the exact criterion that produced this request.
 *
 * `requestId` identifies this specific request instance.
 * `requestedAtMs` records when Makman formally issued this request.
 */
export interface SovereignKnowledgeReceptionPayload {
  readonly requestId: string;
  readonly goalId: string;
  readonly assessmentId: string;
  readonly criterionId: string;
  readonly criterionDescriptionSnapshot: string;
  readonly gapClass: ReceptionGapClass;
  readonly gapCategory: ReceptionGapCategory;
  readonly questionStatement: string;
  readonly availability: ReceptionKnowledgeAvailability;
  readonly requestedAtMs: number;
}

/**
 * The unified constitutional reception record.
 *
 * Every request — Citizen or Sovereign — that arrives at Al Hujjah's boundary
 * becomes one KnowledgeReception before any investigation may begin.
 *
 * `origin` identifies the constitutional citizen who sent the request.
 * `status` is RECEIVED when all validation passes; REJECTED otherwise.
 * `receptionId` uniquely identifies this reception event.
 * `receivedAtMs` records when Al Hujjah acknowledged the arrival.
 *
 * Exactly one of `citizenRequest` and `sovereignRequest` is non-null.
 * The null field carries no information and shall not be inspected.
 *
 * `validationErrors` is empty on RECEIVED receptions.
 * `validationErrors` is non-empty on REJECTED receptions, naming exactly
 *   which constitutional rules were violated.
 *
 * INVARIANT: The Investigation Engine shall not be invoked until a reception
 * with status=RECEIVED exists. This package establishes that invariant
 * constitutionally. It does not enforce it at runtime — the next package
 * (Understanding) will enforce it structurally by consuming only RECEIVED
 * receptions.
 */
export interface KnowledgeReception {
  readonly receptionId: string;
  readonly origin: KnowledgeReceptionOrigin;
  readonly status: ReceptionStatus;
  readonly citizenRequest: CitizenKnowledgeRequest | null;
  readonly sovereignRequest: SovereignKnowledgeReceptionPayload | null;
  readonly validationErrors: readonly string[];
  readonly receivedAtMs: number;
}
