/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge DNA Engine
 *
 * Status: V1.0
 * Sovereign Identity Layer
 */

import type { VerdictType } from '../verdict/verdict-engine';

export type KnowledgeSourceType =
  | 'sacred'
  | 'empirical'
  | 'historical'
  | 'literary'
  | 'general';

export interface KnowledgeDNA {
  id: string;

  knowledgeFingerprint: string;

  category: string;

  sourceType: KnowledgeSourceType;

  confidence: number;

  verdict: VerdictType;

  evidenceCount: number;

  lastUpdated: string;

  owner: string;

  createdAt: string;
}

export interface CreateKnowledgeDNAInput {
  id: string;

  category: string;

  sourceType: KnowledgeSourceType;

  confidence: number;

  verdict: VerdictType;

  evidenceCount: number;

  owner: string;
}

export function generateKnowledgeFingerprint(
  id: string,
  category: string,
  sourceType: KnowledgeSourceType
): string {
  return `${category}-${sourceType}-${id}`;
}

export function createKnowledgeDNA(
  input: CreateKnowledgeDNAInput
): KnowledgeDNA {
  const now = new Date().toISOString();

  return {
    id: input.id,

    knowledgeFingerprint: generateKnowledgeFingerprint(
      input.id,
      input.category,
      input.sourceType
    ),

    category: input.category,

    sourceType: input.sourceType,

    confidence: input.confidence,

    verdict: input.verdict,

    evidenceCount: input.evidenceCount,

    lastUpdated: now,

    owner: input.owner,

    createdAt: now,
  };
}