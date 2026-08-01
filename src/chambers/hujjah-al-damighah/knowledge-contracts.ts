/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE FOUNDATION — Constitutional Foundation Package XIV
 *
 * Knowledge is the fifth and highest stage of the constitutional chain.
 * It accepts a constitutional EvidenceCollection and produces one
 * KnowledgeDeclaration — the Empire's highest truthful conclusion from
 * the available evidence.
 *
 * ─── WHAT KNOWLEDGE ESTABLISHES ─────────────────────────────────────────────
 *
 *   Evidence establishes what was found.
 *   Knowledge establishes what the Empire can honestly declare.
 *
 *   Knowledge is not opinion.
 *   Knowledge is not recommendation.
 *   Knowledge is not strategy.
 *   Knowledge is not execution.
 *
 *   Knowledge is the highest truthful conclusion that may be drawn from
 *   the available evidence. It shall never exceed the evidence.
 *   It shall never claim certainty where uncertainty honestly exists.
 *
 * ─── KNOWLEDGE DECLARATION vs. KNOWLEDGE DELIVERY ───────────────────────────
 *
 *   Chief Architect ruling (Package XIV): These two responsibilities
 *   must be permanently separated. This package produces only Declaration.
 *
 *   KNOWLEDGE DECLARATION (this package):
 *     "This is what the available evidence allows us to know."
 *
 *   KNOWLEDGE DELIVERY (deferred to Export / future Delivery stage):
 *     "Here is how this knowledge reaches Makman, the Creator,
 *      or other chambers. Here is what may be dispatched, archived,
 *      or stored in memory."
 *
 *   CONSTITUTIONAL DEBT (recorded here, not fixed here):
 *
 *   verdict/verdict-engine.ts — VerdictState.allowDispatch, allowArchive,
 *     allowMemory are DELIVERY flags embedded inside a DECLARATION type.
 *     They belong to a future Delivery stage. The V1.0 Track mixes these
 *     concerns. Package XIV does not carry VerdictState — only VerdictType
 *     (the constitutional identifier: 'accepted' | 'under_review' |
 *     'conflict' | 'rejected').
 *
 *   workspace/report-builder.ts — IntelligenceReport.contentOpportunities
 *     produces recommendations ("Explore source X around document Y").
 *     This is DELIVERY mixed with recommendation — neither belongs to
 *     Knowledge Declaration. Also exposes sourceProvider and sourceId
 *     directly, violating the constitutional secrecy rule. Not used here.
 *
 *   workspace/report-builder.ts — IntelligenceReport.executiveSummary
 *     concatenates extractedText fields. Mixing presentation (Delivery)
 *     into the Knowledge layer. Not used here.
 *
 * ─── WHAT THIS PACKAGE DOES NOT PRODUCE ─────────────────────────────────────
 *
 *   KnowledgeDeclaration does not produce recommendations.
 *   KnowledgeDeclaration does not advise Creators.
 *   KnowledgeDeclaration does not respond to Makman.
 *   KnowledgeDeclaration does not trigger notifications or execution.
 *   KnowledgeDeclaration does not expose sourceProvider or sourceId.
 *   KnowledgeDeclaration does not include delivery flags.
 *
 * ─── REPOSITORY AUDIT RESULT ─────────────────────────────────────────────────
 *
 *   Reused:
 *     VerdictType from verdict/verdict-engine.ts — the 4-value constitutional
 *       identifier; re-exported here for downstream consumers.
 *     evaluateVerdict() from verdict/verdict-engine.ts — invoked with
 *       { confidence, hasConflict: false } to derive the constitutional verdict.
 *       (Conflict detection is deferred — requires multi-provider disagreement
 *       which will emerge from the Knowledge Ministries Foundation.)
 *
 *   Not reused:
 *     evaluateConfidence() — requires sourceStrength/agreementLevel/freshnessLevel
 *       inputs that cannot be derived from EvidenceCollection without fabrication.
 *       Confidence is computed directly from evidence.confidenceScore values.
 *     VerdictState — contains delivery flags (allowDispatch, allowArchive,
 *       allowMemory). These are Delivery concerns. Not in KnowledgeDeclaration.
 *     orchestrateKnowledge() — requires KnowledgeSourceType and owner inputs
 *       not available from EvidenceCollection.
 *     KnowledgeDNA — requires sourceType and owner. Not available. Deferred.
 *     IntelligenceReport / ReportBuilder — mixes declaration and delivery;
 *       exposes sourceProvider; produces recommendations. Not used.
 *     generateKnowledgeReport() — pipeline execution status, not knowledge.
 *
 * ─── KNOWLEDGE MINISTRIES PREPARATION ───────────────────────────────────────
 *
 *   When the Knowledge Ministries Foundation is built, Ministry providers will
 *   enrich the Knowledge Declaration at this boundary:
 *
 *   The `confidenceScore` computation is the constitutional extension point.
 *   Currently derived from a single provider's evidence items. When multiple
 *   Ministries (Human Knowledge, Public Knowledge, Scientific Knowledge, etc.)
 *   contribute evidence, `confidenceScore` will reflect cross-Ministry
 *   agreement (agreementLevel) and can then enable `hasConflict: true` in
 *   evaluateVerdict() when Ministry results contradict each other.
 *
 *   The `declarationText` is the second extension point. Currently built from
 *   verdict and evidence count. Future Ministry-enriched declarations may
 *   synthesize content from multiple constitutional sources without exposing
 *   provider names (respecting the secrecy rule).
 *
 *   No Ministry implementation is authorized in this package.
 *
 * ─── THE IMMUTABLE CONSTITUTIONAL ORDER ─────────────────────────────────────
 *
 *   Reception → Understanding → Investigation → Evidence → Knowledge
 *
 *   This chain is now constitutionally complete. Upon Package XIV certification,
 *   the Knowledge Ministries Foundation construction era is authorized.
 */

import type { KnowledgeReceptionOrigin } from './reception-contracts';
import type { SovereignRequestLineage } from './understanding-contracts';

export type { VerdictType } from './verdict/verdict-engine';

/**
 * The constitutional confidence level of a Knowledge Declaration.
 *
 * This is a collection-level assessment — higher-order than the per-item
 * ConfidenceLevel in domain/evidence.types.ts (HIGH/MODERATE/LOW/UNVERIFIED).
 * Those describe individual evidence items. This describes the collective
 * strength of the Evidence Collection as a basis for knowledge.
 *
 * ESTABLISHED   — confidenceScore ≥ 90; the evidence fully supports the declaration
 * TENTATIVE     — confidenceScore ≥ 70; the evidence supports the declaration
 *                 but requires further verification
 * UNCERTAIN     — confidenceScore ≥ 40; the evidence is present but insufficient
 *                 for a strong declaration
 * INSUFFICIENT  — confidenceScore < 40 or no evidence; the evidence does not
 *                 support a constitutional knowledge declaration
 */
export type KnowledgeConfidenceLevel =
  | 'ESTABLISHED'
  | 'TENTATIVE'
  | 'UNCERTAIN'
  | 'INSUFFICIENT';

/**
 * The constitutional Knowledge Declaration.
 *
 * The highest output of Al Hujjah Al-Damighah. The only form in which
 * Al Hujjah's findings may be delivered to future consumers:
 *   — the Creator (through the Citizen investigation path)
 *   — Makman Al-Ghayah (through the Sovereign investigation path)
 *   — Ras Al-Amr, Qiyamah, and any future chamber
 *
 * `claim` is the normalized question that was investigated.
 * `domain` is the knowledge domain (from the investigation).
 * `declarationText` is the highest truthful conclusion the evidence supports.
 *   It never exceeds the evidence. It never exposes sourceProvider or sourceId.
 *   It never produces recommendations.
 *
 * `evidenceCount` is the number of evidence items that contributed.
 * `confidenceScore` is 0–100, computed from the average of all evidence
 *   item confidenceScores (each on a 0–1 scale, scaled to 0–100).
 * `confidenceLevel` is the constitutional classification of that score.
 * `verdictId` is the constitutional verdict derived from confidence and conflict.
 *
 * `isDefinitive` is true only when confidenceScore ≥ 90 (verdict: 'accepted').
 * `uncertaintyPresent` is always the inverse of `isDefinitive`. The Empire
 *   acknowledges uncertainty whenever the evidence does not fully support the claim.
 *
 * The `sovereignLineage` is null for Citizen declarations and non-null for
 * Sovereign declarations. It carries the goalId, criterionId, gapClass, and
 * all other constitutional origin fields from Makman's request.
 *
 * `declaredAtMs` records when Knowledge was produced.
 */
export interface KnowledgeDeclaration {
  readonly declarationId: string;

  // Constitutional chain identity (full traceability from Declaration → Reception)
  readonly collectionId: string;
  readonly investigationResultId: string;
  readonly intentId: string;
  readonly receptionId: string;
  readonly origin: KnowledgeReceptionOrigin;
  readonly sovereignLineage: SovereignRequestLineage | null;

  // The constitutional knowledge claim
  readonly claim: string;
  readonly domain: string;
  readonly declarationText: string;

  // Evidence summary
  readonly evidenceCount: number;

  // Confidence
  readonly confidenceScore: number;
  readonly confidenceLevel: KnowledgeConfidenceLevel;

  // Verdict (reuses VerdictType from verdict/verdict-engine.ts)
  readonly verdictId: 'accepted' | 'under_review' | 'conflict' | 'rejected';

  // Uncertainty (constitutional requirement)
  readonly isDefinitive: boolean;
  readonly uncertaintyPresent: boolean;

  readonly declaredAtMs: number;
}
