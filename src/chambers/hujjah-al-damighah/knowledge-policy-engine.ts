/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Policy Engine
 *
 * Status: V1.0
 * Sovereign Governance Layer
 */

export type KnowledgePolicyLevel =
  | 'open'
  | 'restricted'
  | 'confidential'
  | 'sovereign';

export interface KnowledgePolicy {
  id: string;

  name: string;

  level: KnowledgePolicyLevel;

  allowDispatch: boolean;

  allowArchive: boolean;

  allowMemory: boolean;

  createdAt: string;
}

export function createKnowledgePolicy(
  id: string,
  name: string,
  level: KnowledgePolicyLevel
): KnowledgePolicy {
  return {
    id,

    name,

    level,

    allowDispatch: level !== 'confidential',

    allowArchive: true,

    allowMemory: level !== 'restricted',

    createdAt: new Date().toISOString(),
  };
}

export function canDispatch(
  policy: KnowledgePolicy
): boolean {
  return policy.allowDispatch;
}

export function canArchive(
  policy: KnowledgePolicy
): boolean {
  return policy.allowArchive;
}

export function canStoreMemory(
  policy: KnowledgePolicy
): boolean {
  return policy.allowMemory;
}