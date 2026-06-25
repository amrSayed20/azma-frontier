/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Memory Orchestrator
 *
 * Status: V1.0
 * Sovereign Memory Core
 */

import {
  createKnowledgeMemoryRegistry,
  addMemoryRecord,
  type KnowledgeMemoryRecord,
} from './knowledge-memory-registry';

import {
  createKnowledgeMemoryIndex,
  addMemoryIndexRecord,
} from './knowledge-memory-index';

export interface MemoryOrchestratorInput {
  id: string;

  title: string;

  category: string;

  fingerprint: string;

  keywords: string[];
}

export function orchestrateMemory(
  input: MemoryOrchestratorInput
) {
  let registry = createKnowledgeMemoryRegistry();

  let index = createKnowledgeMemoryIndex();

  const record: KnowledgeMemoryRecord = {
    id: input.id,
    title: input.title,
    category: input.category,
    fingerprint: input.fingerprint,
    createdAt: new Date().toISOString(),
  };

  registry = addMemoryRecord(
    registry,
    record
  );

  index = addMemoryIndexRecord(index, {
    id: input.id,
    memoryId: input.id,
    title: input.title,
    keywords: input.keywords,
    createdAt: new Date().toISOString(),
  });

  return {
    registry,
    index,
  };
}