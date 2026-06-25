/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Registry
 *
 * Status: V1.0
 * Sovereign Registry Layer
 */

export interface KnowledgeRegistryRecord {
  id: string;

  title: string;

  category: string;

  owner: string;

  createdAt: string;
}

export interface KnowledgeRegistry {
  records: KnowledgeRegistryRecord[];
}

export function createKnowledgeRegistry(): KnowledgeRegistry {
  return {
    records: [],
  };
}

export function registerKnowledge(
  registry: KnowledgeRegistry,
  record: KnowledgeRegistryRecord
): KnowledgeRegistry {
  return {
    ...registry,
    records: [...registry.records, record],
  };
}

export function findKnowledgeRecord(
  registry: KnowledgeRegistry,
  id: string
): KnowledgeRegistryRecord | undefined {
  return registry.records.find(
    (record) => record.id === id
  );
}

export function removeKnowledgeRecord(
  registry: KnowledgeRegistry,
  id: string
): KnowledgeRegistry {
  return {
    ...registry,
    records: registry.records.filter(
      (record) => record.id !== id
    ),
  };
}