/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Index Engine
 *
 * Status: V1.0
 * Sovereign Index Layer
 */

export interface KnowledgeIndexEntry {
  id: string;

  title: string;

  category: string;

  tags: string[];

  createdAt: string;
}

export interface KnowledgeIndex {
  entries: KnowledgeIndexEntry[];
}

export function createKnowledgeIndex(): KnowledgeIndex {
  return {
    entries: [],
  };
}

export function addIndexEntry(
  index: KnowledgeIndex,
  entry: KnowledgeIndexEntry
): KnowledgeIndex {
  return {
    ...index,
    entries: [...index.entries, entry],
  };
}

export function findIndexEntry(
  index: KnowledgeIndex,
  id: string
): KnowledgeIndexEntry | undefined {
  return index.entries.find(
    (entry) => entry.id === id
  );
}

export function removeIndexEntry(
  index: KnowledgeIndex,
  id: string
): KnowledgeIndex {
  return {
    ...index,
    entries: index.entries.filter(
      (entry) => entry.id !== id
    ),
  };
}