/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Pipeline
 *
 * Status: V1.0
 * Sovereign Pipeline Layer
 */

import {
  processKnowledge,
  type KnowledgeFacadeResult,
} from './knowledge-facade';

import type {
  KnowledgeIntegrationInput,
} from './knowledge-integration-engine';

export interface PipelineResult {
  success: boolean;

  startedAt: string;

  finishedAt: string;

  result: KnowledgeFacadeResult;
}

export function executeKnowledgePipeline(
  input: KnowledgeIntegrationInput
): PipelineResult {
  const startedAt = new Date().toISOString();

  const result = processKnowledge(input);

  return {
    success: result.success,

    startedAt,

    finishedAt: new Date().toISOString(),

    result,
  };
}

export function isPipelineSuccessful(
  pipeline: PipelineResult
): boolean {
  return pipeline.success;
}