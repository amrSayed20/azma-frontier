/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Report Engine
 *
 * Status: V1.0
 * Sovereign Reporting Layer
 */

import type { PipelineResult } from './knowledge-pipeline';

export interface KnowledgeReport {
  id: string;

  success: boolean;

  generatedAt: string;

  summary: string;
}

export function generateKnowledgeReport(
  pipeline: PipelineResult
): KnowledgeReport {
  return {
    id: crypto.randomUUID(),

    success: pipeline.success,

    generatedAt: new Date().toISOString(),

    summary: pipeline.success
      ? 'Knowledge pipeline completed successfully.'
      : 'Knowledge pipeline execution failed.',
  };
}

export function isSuccessfulReport(
  report: KnowledgeReport
): boolean {
  return report.success;
}