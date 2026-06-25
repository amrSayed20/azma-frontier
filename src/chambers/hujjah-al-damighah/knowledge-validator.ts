/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Validator
 *
 * Status: V1.0
 * Sovereign Validation Layer
 */

import type { KnowledgeIntegrationInput } from './knowledge-integration-engine';

export interface ValidationResult {
  valid: boolean;

  errors: string[];
}

export function validateKnowledgeInput(
  input: KnowledgeIntegrationInput
): ValidationResult {
  const errors: string[] = [];

  if (!input.id.trim()) {
    errors.push('Missing knowledge id');
  }

  if (!input.title.trim()) {
    errors.push('Missing title');
  }

  if (!input.category.trim()) {
    errors.push('Missing category');
  }

  if (!input.owner.trim()) {
    errors.push('Missing owner');
  }

  if (input.sourceStrength < 0 || input.sourceStrength > 100) {
    errors.push('Invalid source strength');
  }

  if (input.agreementLevel < 0 || input.agreementLevel > 100) {
    errors.push('Invalid agreement level');
  }

  if (input.freshnessLevel < 0 || input.freshnessLevel > 100) {
    errors.push('Invalid freshness level');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isKnowledgeValid(
  input: KnowledgeIntegrationInput
): boolean {
  return validateKnowledgeInput(input).valid;
}