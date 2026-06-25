/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Orchestrator
 *
 * Status: V1.0
 * Sovereign Knowledge Core
 */

import { evaluateConfidence } from './confidence/confidence-engine';

import { evaluateVerdict } from './verdict/verdict-engine';

import {
  createKnowledgeDNA,
  type KnowledgeSourceType,
} from './dna/knowledge-dna-engine';

export interface OrchestratorInput {
  id: string;

  category: string;

  sourceType: KnowledgeSourceType;

  sourceStrength: number;

  evidenceCount: number;

  agreementLevel: number;

  freshnessLevel: number;

  owner: string;
}

export function orchestrateKnowledge(
  input: OrchestratorInput
) {
  const confidenceResult = evaluateConfidence({
    sourceStrength: input.sourceStrength,
    evidenceCount: input.evidenceCount,
    agreementLevel: input.agreementLevel,
    freshnessLevel: input.freshnessLevel,
  });

  const verdict = evaluateVerdict({
    confidence: confidenceResult.confidence,
  });

  const dna = createKnowledgeDNA({
    id: input.id,
    category: input.category,
    sourceType: input.sourceType,
    confidence: confidenceResult.confidence,
    verdict: verdict.id,
    evidenceCount: input.evidenceCount,
    owner: input.owner,
  });

  return {
    confidence: confidenceResult,
    verdict,
    dna,
  };
}