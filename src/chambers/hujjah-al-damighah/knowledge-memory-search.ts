/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Memory Search
 *
 * Status: V1.0
 * Sovereign Memory Search Layer
 */

import {
  type KnowledgeMemoryIndex,
  type KnowledgeMemoryIndexRecord,
} from './knowledge-memory-index';

export interface MemorySearchResult {
  records: KnowledgeMemoryIndexRecord[];

  total: number;
}

export function searchMemory(
  index: KnowledgeMemoryIndex,
  query: string
): MemorySearchResult {
  const normalizedQuery = query.toLowerCase();

  const matches = index.records.filter(
    (record) =>
      record.title.toLowerCase().includes(normalizedQuery) ||
      record.keywords.some((keyword) =>
        keyword.toLowerCase().includes(normalizedQuery)
      )
  );

  return {
    records: matches,
    total: matches.length,
  };
}

export function findMemoryById(
  index: KnowledgeMemoryIndex,
  id: string
): KnowledgeMemoryIndexRecord | undefined {
  return index.records.find(
    (record) => record.id === id
  );
}