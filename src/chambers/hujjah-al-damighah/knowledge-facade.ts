/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Facade
 *
 * Status: V1.0
 * Sovereign Facade Layer
 */

import {
  validateKnowledgeInput,
} from './knowledge-validator';

import {
  executeKnowledgeRuntime,
} from './knowledge-runtime';

import type {
  KnowledgeIntegrationInput,
} from './knowledge-integration-engine';

export interface KnowledgeFacadeResult {
  success: boolean;

  executedAt: string;

  payload?: ReturnType<
    typeof executeKnowledgeRuntime
  >;

  errors: string[];
}

export function processKnowledge(
  input: KnowledgeIntegrationInput
): KnowledgeFacadeResult {
  const validation =
    validateKnowledgeInput(input);

  if (!validation.valid) {
    return {
      success: false,
      executedAt: new Date().toISOString(),
      errors: validation.errors,
    };
  }

  const runtimeResult =
    executeKnowledgeRuntime(input);

  return {
    success: true,
    executedAt: runtimeResult.executedAt,
    payload: runtimeResult,
    errors: [],
  };
}