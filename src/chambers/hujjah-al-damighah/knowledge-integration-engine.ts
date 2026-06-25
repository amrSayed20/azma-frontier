/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Integration Engine
 *
 * Status: V1.0
 * Sovereign Integration Layer
 */

import { orchestrateKnowledge } from './knowledge-orchestrator';
import { orchestrateMemory } from './knowledge-memory-orchestrator';

export interface KnowledgeIntegrationInput {
  id: string;

  title: string;

  category: string;

  sourceType:
    | 'sacred'
    | 'empirical'
    | 'historical'
    | 'literary'
    | 'general';

  sourceStrength: number;

  evidenceCount: number;

  agreementLevel: number;

  freshnessLevel: number;

  owner: string;

  keywords: string[];
}

export function integrateKnowledge(
  input: KnowledgeIntegrationInput
) {
  const knowledge = orchestrateKnowledge({
    id: input.id,
    category: input.category,
    sourceType: input.sourceType,
    sourceStrength: input.sourceStrength,
    evidenceCount: input.evidenceCount,
    agreementLevel: input.agreementLevel,
    freshnessLevel: input.freshnessLevel,
    owner: input.owner,
  });

  const memory = orchestrateMemory({
    id: input.id,
    title: input.title,
    category: input.category,
    fingerprint:
      knowledge.dna.knowledgeFingerprint,
    keywords: input.keywords,
  });

  return {
    knowledge,
    memory,
  };
}