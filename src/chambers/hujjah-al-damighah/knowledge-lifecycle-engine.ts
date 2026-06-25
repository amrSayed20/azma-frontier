/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Lifecycle Engine
 *
 * Status: V1.0
 * Sovereign Lifecycle Layer
 */

export type KnowledgeLifecycleStage =
  | 'draft'
  | 'review'
  | 'verified'
  | 'active'
  | 'archived'
  | 'retired';

export interface KnowledgeLifecycle {
  knowledgeId: string;

  stage: KnowledgeLifecycleStage;

  createdAt: string;

  updatedAt: string;
}

export function createKnowledgeLifecycle(
  knowledgeId: string
): KnowledgeLifecycle {
  const now = new Date().toISOString();

  return {
    knowledgeId,
    stage: 'draft',
    createdAt: now,
    updatedAt: now,
  };
}

export function advanceKnowledgeLifecycle(
  lifecycle: KnowledgeLifecycle,
  nextStage: KnowledgeLifecycleStage
): KnowledgeLifecycle {
  return {
    ...lifecycle,
    stage: nextStage,
    updatedAt: new Date().toISOString(),
  };
}

export function isKnowledgeVerified(
  lifecycle: KnowledgeLifecycle
): boolean {
  return lifecycle.stage === 'verified';
}

export function isKnowledgeActive(
  lifecycle: KnowledgeLifecycle
): boolean {
  return lifecycle.stage === 'active';
}

export function isKnowledgeArchived(
  lifecycle: KnowledgeLifecycle
): boolean {
  return lifecycle.stage === 'archived';
}