'use server';

import { IntelligenceCompositionFactory } from '@/src/chambers/hujjah-al-damighah/intelligence-composition-factory';

export interface EvidenceItemDTO {
  id: string;
  extractedText: string;
  contextWindow: string;
  sourceProvider: string;
  confidenceScore: number;
  confidenceLevel: string;
}

export interface InvestigationDTO {
  success: boolean;
  evidence: EvidenceItemDTO[];
  totalSourcesScanned: number;
  averageEvidenceScore: number;
  error?: string;
}

export async function runInvestigation(
  query: string,
  category: string,
): Promise<InvestigationDTO> {
  try {
    const engine = IntelligenceCompositionFactory.getEngine();
    const bundle = await engine.investigate(query, category);
    return {
      success: true,
      evidence: bundle.evidence.map((e) => ({
        id: e.id,
        extractedText: e.extractedText,
        contextWindow: e.contextWindow ?? '',
        sourceProvider: e.sourceProvider,
        confidenceScore: e.confidenceScore,
        confidenceLevel: String(e.confidenceLevel),
      })),
      totalSourcesScanned: Number(bundle.metadata.totalSourcesScanned),
      averageEvidenceScore: Number(bundle.metadata.averageEvidenceScore),
    };
  } catch (err) {
    return {
      success: false,
      evidence: [],
      totalSourcesScanned: 0,
      averageEvidenceScore: 0,
      error: String(err),
    };
  }
}
