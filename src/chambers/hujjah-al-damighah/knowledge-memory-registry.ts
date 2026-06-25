/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Memory Registry
 *
 * Status: V1.0
 * Sovereign Memory Registry Layer
 */

export interface KnowledgeMemoryRecord {
  id: string;

  title: string;

  category: string;

  fingerprint: string;

  createdAt: string;
}

export interface KnowledgeMemoryRegistry {
  records: KnowledgeMemoryRecord[];
}

export function createKnowledgeMemoryRegistry(): KnowledgeMemoryRegistry {
  return {
    records: [],
  };
}

export function addMemoryRecord(
  registry: KnowledgeMemoryRegistry,
  record: KnowledgeMemoryRecord
): KnowledgeMemoryRegistry {
  return {
    ...registry,
    records: [...registry.records, record],
  };
}

export function findMemoryRecord(
  registry: KnowledgeMemoryRegistry,
  id: string
): KnowledgeMemoryRecord | undefined {
  return registry.records.find(
    (record) => record.id === id
  );
}

export function removeMemoryRecord(
  registry: KnowledgeMemoryRegistry,
  id: string
): KnowledgeMemoryRegistry {
  return {
    ...registry,
    records: registry.records.filter(
      (record) => record.id !== id
    ),
  };
}

export function clearMemoryRegistry(): KnowledgeMemoryRegistry {
  return {
    records: [],
  };
}