/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Memory Index
 *
 * Status: V1.0
 * Sovereign Memory Index Layer
 */

export interface KnowledgeMemoryIndexRecord {
  id: string;

  memoryId: string;

  title: string;

  keywords: string[];

  createdAt: string;
}

export interface KnowledgeMemoryIndex {
  records: KnowledgeMemoryIndexRecord[];
}

export function createKnowledgeMemoryIndex(): KnowledgeMemoryIndex {
  return {
    records: [],
  };
}

export function addMemoryIndexRecord(
  index: KnowledgeMemoryIndex,
  record: KnowledgeMemoryIndexRecord
): KnowledgeMemoryIndex {
  return {
    ...index,
    records: [...index.records, record],
  };
}

export function findMemoryIndexRecord(
  index: KnowledgeMemoryIndex,
  id: string
): KnowledgeMemoryIndexRecord | undefined {
  return index.records.find(
    (record) => record.id === id
  );
}

export function searchMemoryIndex(
  index: KnowledgeMemoryIndex,
  keyword: string
): KnowledgeMemoryIndexRecord[] {
  return index.records.filter((record) =>
    record.keywords.some((item) =>
      item.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}

export function removeMemoryIndexRecord(
  index: KnowledgeMemoryIndex,
  id: string
): KnowledgeMemoryIndex {
  return {
    ...index,
    records: index.records.filter(
      (record) => record.id !== id
    ),
  };
}