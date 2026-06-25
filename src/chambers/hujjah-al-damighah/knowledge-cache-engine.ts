/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Knowledge Cache Engine
 *
 * Status: V1.0
 * Sovereign Cache Layer
 */

export interface CacheEntry<T> {
  key: string;

  value: T;

  createdAt: string;

  expiresAt?: string;
}

export interface KnowledgeCache<T> {
  entries: CacheEntry<T>[];
}

export function createKnowledgeCache<T>(): KnowledgeCache<T> {
  return {
    entries: [],
  };
}

export function setCacheEntry<T>(
  cache: KnowledgeCache<T>,
  entry: CacheEntry<T>
): KnowledgeCache<T> {
  const filtered = cache.entries.filter(
    (item) => item.key !== entry.key
  );

  return {
    ...cache,
    entries: [...filtered, entry],
  };
}

export function getCacheEntry<T>(
  cache: KnowledgeCache<T>,
  key: string
): CacheEntry<T> | undefined {
  return cache.entries.find(
    (entry) => entry.key === key
  );
}

export function removeCacheEntry<T>(
  cache: KnowledgeCache<T>,
  key: string
): KnowledgeCache<T> {
  return {
    ...cache,
    entries: cache.entries.filter(
      (entry) => entry.key !== key
    ),
  };
}

export function clearCache<T>(): KnowledgeCache<T> {
  return {
    entries: [],
  };
}