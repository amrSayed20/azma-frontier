/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Repository Engine
 *
 * Status: V1.0
 * Sovereign Repository Layer
 */

export interface RepositoryItem<T> {
  id: string;

  data: T;

  createdAt: string;

  updatedAt: string;
}

export interface KnowledgeRepository<T> {
  items: RepositoryItem<T>[];
}

export function createKnowledgeRepository<T>(): KnowledgeRepository<T> {
  return {
    items: [],
  };
}

export function addRepositoryItem<T>(
  repository: KnowledgeRepository<T>,
  id: string,
  data: T
): KnowledgeRepository<T> {
  const now = new Date().toISOString();

  return {
    ...repository,
    items: [
      ...repository.items,
      {
        id,
        data,
        createdAt: now,
        updatedAt: now,
      },
    ],
  };
}

export function updateRepositoryItem<T>(
  repository: KnowledgeRepository<T>,
  id: string,
  data: T
): KnowledgeRepository<T> {
  return {
    ...repository,
    items: repository.items.map((item) =>
      item.id === id
        ? {
            ...item,
            data,
            updatedAt: new Date().toISOString(),
          }
        : item
    ),
  };
}

export function findRepositoryItem<T>(
  repository: KnowledgeRepository<T>,
  id: string
): RepositoryItem<T> | undefined {
  return repository.items.find(
    (item) => item.id === id
  );
}

export function removeRepositoryItem<T>(
  repository: KnowledgeRepository<T>,
  id: string
): KnowledgeRepository<T> {
  return {
    ...repository,
    items: repository.items.filter(
      (item) => item.id !== id
    ),
  };
}