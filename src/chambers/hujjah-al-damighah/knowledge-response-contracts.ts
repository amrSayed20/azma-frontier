/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE RESPONSE FOUNDATION — Constitutional Foundation Package XVIII
 *
 * The Sovereign Knowledge Response is the final constitutional act before
 * Knowledge leaves the Chamber. It wraps a Knowledge Declaration into a
 * constitutional delivery contract suitable for all consumers: Makman Al-Ghayah,
 * the Creator (through the Citizen investigation path), and any future chamber.
 *
 * ─── WHAT THE RESPONSE CARRIES ──────────────────────────────────────────────
 *
 *   Declaration identity   — `responseId` (unique per delivery event) and
 *                            `declarationId` (links back to the source declaration)
 *
 *   Claim identity         — `claim` and `domain`; exactly what question was
 *                            answered; never enriched, summarized, or altered
 *
 *   The declaration itself — `declarationText`; the highest truthful conclusion
 *                            the Empire could draw; unchanged from declaration
 *
 *   Verdict identity       — `verdictId`: 'accepted' | 'under_review' |
 *                            'conflict' | 'rejected'
 *
 *   Confidence             — `confidenceScore` (0–100) and `confidenceLevel`
 *                            (ESTABLISHED | TENTATIVE | UNCERTAIN | INSUFFICIENT)
 *
 *   Uncertainty            — `isDefinitive` and `uncertaintyPresent`; the Empire
 *                            is constitutionally required to acknowledge uncertainty
 *
 *   Sovereign lineage      — `origin` (CITIZEN | SOVEREIGN) and `sovereignLineage`;
 *                            null for Citizen responses; non-null for Sovereign
 *                            responses, carrying goalId, criterionId, gapClass
 *
 *   Timestamp              — `formulatedAtMs`; when the response was formulated
 *
 * ─── WHAT THE RESPONSE DOES NOT CARRY ───────────────────────────────────────
 *
 *   Provider names         — never. The Empire never reveals which provider or
 *                            Ministry contributed knowledge.
 *
 *   Repository identities  — never. No GutenbergProvider, no GoogleTrendsProvider,
 *                            no RedditProvider, no Ministry ID appears in the
 *                            response at any level.
 *
 *   Document identifiers   — never. No `book-1513`, no `trend-super-bowl`, no
 *                            `post-abc123`, no Gutendex URL.
 *
 *   Internal chain IDs     — the `collectionId`, `investigationResultId`,
 *                            `intentId`, and `receptionId` of the Knowledge chain
 *                            are internal routing identifiers. They are not
 *                            constitutional knowledge — they are plumbing. They
 *                            do not leave the Chamber.
 *
 *   Evidence count         — the number of evidence items is internal mechanics,
 *                            not part of the knowledge claim. Omitted.
 *
 *   Recommendations        — never. The Response does not advise, suggest, or
 *                            prescribe any action.
 *
 * ─── ONE LANGUAGE FOR ALL CONSUMERS ────────────────────────────────────────
 *
 *   Makman Al-Ghayah and the Creator receive the same SovereignKnowledgeResponse.
 *   There is no Makman variant and no Creator variant. One constitutional delivery
 *   contract serves all consumers. The consumer's identity is carried by `origin`
 *   and `sovereignLineage` for routing purposes only.
 *
 * ─── CONSTITUTIONAL BOUNDARY ────────────────────────────────────────────────
 *
 *   The Knowledge Response is a formulation — not an investigation, not a
 *   declaration, not a recommendation, not a delivery. It is the constitutional
 *   act of wrapping a declaration for transmission. The Response layer does not
 *   invoke any intelligence engine, does not query any repository, does not
 *   score evidence, and does not alter the declaration text.
 *
 * ─── THE IMMUTABLE CONSTITUTIONAL ORDER ─────────────────────────────────────
 *
 *   Reception → Understanding → Investigation → Evidence → Knowledge → Response
 *
 *   The Response stage is the final boundary of Al Hujjah Al-Damighah.
 *   After Response, the Knowledge passes to the consumer's constitutional domain.
 *   Al Hujjah has no further authority over what is received.
 */

import type { KnowledgeConfidenceLevel } from './knowledge-contracts';
import type { KnowledgeReceptionOrigin } from './reception-contracts';
import type { SovereignRequestLineage } from './understanding-contracts';

export type { KnowledgeConfidenceLevel } from './knowledge-contracts';

/**
 * The constitutional delivery contract for a Knowledge Declaration.
 *
 * Produced by `formulateResponse()` in knowledge-response-layer.ts.
 * The only form in which Al Hujjah's findings may leave the Chamber.
 *
 * `responseId`       — unique identity for this specific delivery event.
 *                      Two responses from the same declaration produce different
 *                      responseIds. The responseId is Al Hujjah's receipt.
 *
 * `declarationId`    — the Knowledge Declaration this response wraps. Preserved
 *                      for traceability between response and declaration.
 *
 * `claim`            — the normalized question that was investigated. Preserved
 *                      unchanged from the declaration. The consumer receives
 *                      exactly the question that was answered.
 *
 * `domain`           — the knowledge domain within which the investigation
 *                      proceeded. Preserved unchanged from the declaration.
 *
 * `declarationText`  — the highest truthful conclusion the available evidence
 *                      allowed. Never exceeds the evidence. Never exposes
 *                      sources. Never makes recommendations. Preserved unchanged.
 *
 * `confidenceScore`  — 0–100, derived from the average of all evidence item
 *                      confidence scores. Preserved unchanged.
 *
 * `confidenceLevel`  — the constitutional classification of the confidence score.
 *                      ESTABLISHED | TENTATIVE | UNCERTAIN | INSUFFICIENT.
 *
 * `verdictId`        — the constitutional verdict. One of: 'accepted' (≥90%),
 *                      'under_review' (≥70%), 'conflict' (evidence disagrees),
 *                      'rejected' (<40% or no evidence). Preserved unchanged.
 *
 * `isDefinitive`     — true only when confidenceScore ≥ 90. Preserved unchanged.
 *
 * `uncertaintyPresent` — always the inverse of `isDefinitive`. The Empire is
 *                        constitutionally required to acknowledge uncertainty.
 *
 * `origin`           — CITIZEN or SOVEREIGN. Identifies the consumer type.
 *
 * `sovereignLineage` — null for Citizen responses. Non-null for Sovereign
 *                      responses — carries the goalId, criterionId, gapClass,
 *                      and all other constitutional origin fields from Makman's
 *                      request. Preserved unchanged from the declaration.
 *
 * `formulatedAtMs`   — epoch milliseconds when this response was formulated.
 */
export interface SovereignKnowledgeResponse {
  readonly responseId: string;
  readonly declarationId: string;

  readonly claim: string;
  readonly domain: string;
  readonly declarationText: string;

  readonly confidenceScore: number;
  readonly confidenceLevel: KnowledgeConfidenceLevel;
  readonly verdictId: 'accepted' | 'under_review' | 'conflict' | 'rejected';

  readonly isDefinitive: boolean;
  readonly uncertaintyPresent: boolean;

  readonly origin: KnowledgeReceptionOrigin;
  readonly sovereignLineage: SovereignRequestLineage | null;

  readonly formulatedAtMs: number;
}
