/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Search Engine
 *
 * Status: V1.0
 * Sovereign Search Layer
 */

export interface SearchRecord {
  id: string;

  title: string;

  category: string;

  content: string;
}

export interface SearchResult {
  records: SearchRecord[];

  total: number;
}

export function searchKnowledge(
  records: SearchRecord[],
  query: string
): SearchResult {
  const normalizedQuery = query.toLowerCase();

  const matches = records.filter(
    (record) =>
      record.title.toLowerCase().includes(normalizedQuery) ||
      record.content.toLowerCase().includes(normalizedQuery) ||
      record.category.toLowerCase().includes(normalizedQuery)
  );

  return {
    records: matches,
    total: matches.length,
  };
}

export function findById(
  records: SearchRecord[],
  id: string
): SearchRecord | undefined {
  return records.find(
    (record) => record.id === id
  );
}