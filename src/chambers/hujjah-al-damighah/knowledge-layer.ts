/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE FOUNDATION — Constitutional Foundation Package XIV
 *
 * The Knowledge Layer.
 *
 * Accepts a constitutional EvidenceCollection and produces one
 * KnowledgeDeclaration — the Empire's highest truthful conclusion
 * from the available evidence.
 *
 * KNOWLEDGE DECLARATION vs. KNOWLEDGE DELIVERY:
 *   This layer produces DECLARATION only.
 *   Delivery (routing to Makman, Creator, or other chambers) is a
 *   separate constitutional responsibility. It is not built here.
 *
 * WHAT THIS MODULE DOES NOT DO:
 *   Does not produce recommendations or Creator advice.
 *   Does not notify Makman or trigger execution.
 *   Does not expose sourceProvider, sourceId, or internal identifiers.
 *   Does not include delivery flags (allowDispatch, allowArchive, allowMemory).
 *   Does not search new repositories.
 *   Does not introduce Knowledge Ministries.
 *   Does not re-score evidence (scores are final from Investigation).
 *   Does not read InvestigationResult directly — only EvidenceCollection.
 *
 * REUSE AUDIT:
 *   evaluateVerdict() — IMPORTED from verdict/verdict-engine.ts; invoked
 *     with { confidence, hasConflict: false }. hasConflict detection requires
 *     multi-provider disagreement, deferred to Knowledge Ministries Foundation.
 *     Only VerdictState.id is extracted; VerdictState UI and delivery fields
 *     are constitutional debt, not carried into KnowledgeDeclaration.
 *   evaluateConfidence() — NOT imported. Requires sourceStrength/agreementLevel/
 *     freshnessLevel inputs that cannot be derived from EvidenceCollection
 *     without fabrication. Confidence is computed directly from the average
 *     of evidence item confidenceScores (each 0–1, scaled to 0–100).
 *   VerdictState — NOT carried into KnowledgeDeclaration. Its delivery fields
 *     (allowDispatch, allowArchive, allowMemory) are Knowledge Delivery, not
 *     Knowledge Declaration. Constitutional debt recorded in knowledge-contracts.ts.
 *   orchestrateKnowledge() — NOT invoked. Requires sourceType and owner not
 *     available from EvidenceCollection.
 *   KnowledgeDNA — NOT produced. Requires sourceType and owner. Deferred.
 *   IntelligenceReport / ReportBuilder — NOT used. Mixes declaration + delivery,
 *     exposes sourceProvider in contentOpportunities. Constitutional debt recorded.
 */

import { evaluateVerdict } from './verdict/verdict-engine';
import type { EvidenceCollection } from './evidence-contracts';
import type { KnowledgeDeclaration, KnowledgeConfidenceLevel } from './knowledge-contracts';

let declarationSequence = 0;

function generateDeclarationId(collectionId: string, atMs: number): string {
  declarationSequence += 1;
  return `kd-${collectionId}-${atMs}-${declarationSequence}`;
}

function computeConfidenceScore(collection: EvidenceCollection): number {
  if (collection.items.length === 0) return 0;
  const total = collection.items.reduce(
    (sum, item) => sum + item.evidence.confidenceScore,
    0,
  );
  return Math.round(Math.min(1, total / collection.items.length) * 100);
}

function classifyKnowledgeConfidence(score: number): KnowledgeConfidenceLevel {
  if (score >= 90) return 'ESTABLISHED';
  if (score >= 70) return 'TENTATIVE';
  if (score >= 40) return 'UNCERTAIN';
  return 'INSUFFICIENT';
}

function buildDeclarationText(
  claim: string,
  evidenceCount: number,
  verdictId: 'accepted' | 'under_review' | 'conflict' | 'rejected',
): string {
  if (evidenceCount === 0) {
    return `No evidence was found to support a knowledge declaration regarding: ${claim}`;
  }
  switch (verdictId) {
    case 'accepted':
      return `The available evidence establishes confident knowledge regarding: ${claim}. ${evidenceCount} evidence item(s) support this declaration.`;
    case 'under_review':
      return `The available evidence supports tentative knowledge regarding: ${claim}, pending further verification. ${evidenceCount} evidence item(s) were found.`;
    case 'conflict':
      return `The available evidence contains contradictions regarding: ${claim}. No definitive knowledge can be established until the conflict is resolved.`;
    default:
      return `The available evidence was insufficient to establish knowledge regarding: ${claim}. ${evidenceCount} evidence item(s) were found but did not meet the constitutional knowledge threshold.`;
  }
}

/**
 * Declare constitutional knowledge from a collected evidence set.
 *
 * Accepts an EvidenceCollection produced by the Evidence stage.
 * Computes confidence from evidence item scores.
 * Derives the constitutional verdict.
 * Produces one KnowledgeDeclaration — the final authoritative output
 * of Al Hujjah Al-Damighah.
 *
 * Never exceeds the evidence.
 * Never produces recommendations.
 * Never exposes internal provider or source identifiers.
 *
 * Pure function — always produces a declaration; never throws.
 * An empty collection produces a declaration with verdict='rejected'
 * and an honest acknowledgment that no evidence was found.
 */
export function declareKnowledge(collection: EvidenceCollection): KnowledgeDeclaration {
  const declaredAtMs = Date.now();

  const confidenceScore = computeConfidenceScore(collection);
  const confidenceLevel = classifyKnowledgeConfidence(confidenceScore);

  // Reuse verdict/verdict-engine.ts — extract only VerdictState.id (VerdictType)
  // VerdictState UI/delivery fields are constitutional debt, not carried here
  const verdictState = evaluateVerdict({ confidence: confidenceScore, hasConflict: false });
  const verdictId = verdictState.id;

  const isDefinitive = verdictId === 'accepted';

  const declarationText = buildDeclarationText(
    collection.claim.normalizedStatement,
    collection.items.length,
    verdictId,
  );

  return {
    declarationId: generateDeclarationId(collection.collectionId, declaredAtMs),

    collectionId: collection.collectionId,
    investigationResultId: collection.investigationResultId,
    intentId: collection.intentId,
    receptionId: collection.receptionId,
    origin: collection.origin,
    sovereignLineage: collection.sovereignLineage,

    claim: collection.claim.normalizedStatement,
    domain: collection.claim.targetCategory,
    declarationText,

    evidenceCount: collection.items.length,

    confidenceScore,
    confidenceLevel,

    verdictId,

    isDefinitive,
    uncertaintyPresent: !isDefinitive,

    declaredAtMs,
  };
}
