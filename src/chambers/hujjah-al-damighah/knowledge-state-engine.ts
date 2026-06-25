/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge State Engine
 *
 * Status: V1.0
 * Sovereign State Layer
 */

export type KnowledgeStateType =
  | 'draft'
  | 'active'
  | 'archived'
  | 'locked'
  | 'deleted';

export interface KnowledgeState {
  knowledgeId: string;

  state: KnowledgeStateType;

  updatedAt: string;
}

export function createKnowledgeState(
  knowledgeId: string
): KnowledgeState {
  return {
    knowledgeId,
    state: 'draft',
    updatedAt: new Date().toISOString(),
  };
}

export function updateKnowledgeState(
  state: KnowledgeState,
  nextState: KnowledgeStateType
): KnowledgeState {
  return {
    ...state,
    state: nextState,
    updatedAt: new Date().toISOString(),
  };
}

export function isKnowledgeActive(
  state: KnowledgeState
): boolean {
  return state.state === 'active';
}

export function isKnowledgeArchived(
  state: KnowledgeState
): boolean {
  return state.state === 'archived';
}

export function isKnowledgeLocked(
  state: KnowledgeState
): boolean {
  return state.state === 'locked';
}