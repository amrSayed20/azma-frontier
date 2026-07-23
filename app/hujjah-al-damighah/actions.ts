'use server';

import { IntelligenceCompositionFactory } from '@/src/chambers/hujjah-al-damighah/intelligence-composition-factory';
import { createPerceptionEndpointForOrgan } from '@/src/sovereign-nervous-system';

/**
 * Constitutional Nervous System integration (Integration Package "The
 * First Constitutional Signals"). Reports this organ's own lifecycle —
 * never interprets what an investigation found, only that one ran and
 * whether it succeeded. Server-side only; runs in the same Node process
 * that already executes this Server Action, so it shares this process's
 * Perception Bus instance.
 */
const hujjahPerception = createPerceptionEndpointForOrgan('hujjah-al-damighah');

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
    hujjahPerception.report({
      signalType: 'State',
      relatedEvent: 'Creator Completed Goal',
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'An investigation completed successfully.',
      content: null,
    });
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
    hujjahPerception.report({
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'An investigation failed.',
      content: null,
    });
    return {
      success: false,
      evidence: [],
      totalSourcesScanned: 0,
      averageEvidenceScore: 0,
      error: String(err),
    };
  }
}
