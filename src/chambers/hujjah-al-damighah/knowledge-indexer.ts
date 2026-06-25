/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Indexer
 *
 * Status: V1.0
 * Sovereign Indexer Layer
 */

export interface KnowledgeIndexRecord {
  id: string;

  title: string;

  category: string;

  keywords: string[];

  createdAt: string;
}

export interface KnowledgeIndexStore {
  records: KnowledgeIndexRecord[];
}

export function createKnowledgeIndexStore(): KnowledgeIndexStore {
  return {
    records: [],
  };
}

export function addKnowledgeIndex(
  store: KnowledgeIndexStore,
  record: KnowledgeIndexRecord
): KnowledgeIndexStore {
  return {
    ...store,
    records: [...store.records, record],
  };
}

export function findKnowledgeIndex(
  store: KnowledgeIndexStore,
  id: string
): KnowledgeIndexRecord | undefined {
  return store.records.find(
    (record) => record.id === id
  );
}

export function searchKnowledgeIndex(
  store: KnowledgeIndexStore,
  keyword: string
): KnowledgeIndexRecord[] {
  return store.records.filter((record) =>
    record.keywords.some((item) =>
      item.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}

export function removeKnowledgeIndex(
  store: KnowledgeIndexStore,
  id: string
): KnowledgeIndexStore {
  return {
    ...store,
    records: store.records.filter(
      (record) => record.id !== id
    ),
  };
}