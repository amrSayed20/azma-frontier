/**
 * WP-009: StateCacheService (Layer 4)
 * Runtime in-memory state cache with TTL and constitutional traceability
 *
 * LAYER CLASSIFICATION: Layer 4 (Memory)
 * KERNEL DEPENDENCIES: Layer 1 (ConstitutionArticleId)
 *
 * Responsibility:
 * - Cache arbitrary request-processing state across operations
 * - Enforce TTL-based expiry (no stale data leaks)
 * - Report cache health to Layer 8 observability
 *
 * ASP: Single Map-based implementation. No eviction strategies beyond TTL.
 *       Max cache size enforced (10 000 entries) to bound memory footprint.
 *
 * Determinism: For a given key at a given point in time the returned value
 *               is always the most-recently stored unexpired entry.
 */

import type { ConstitutionArticleId } from './constitution-types';
import type {
  CacheKey,
  CacheEntry,
  CacheStatistics,
  StateCacheServiceContract,
} from './wp-009-types';

const MAX_CACHE_SIZE = 10_000;

export class StateCacheService implements StateCacheServiceContract {
  readonly serviceName = 'StateCacheService' as const;
  readonly version = '1.0.0' as const;

  private readonly store = new Map<CacheKey, CacheEntry<unknown>>();
  private hitCount = 0;
  private missCount = 0;
  private evictionCount = 0;
  private nextVersion = 0;

  async set<T>(
    key: CacheKey,
    value: T,
    ttlMs: number,
    articleId: ConstitutionArticleId,
  ): Promise<void> {
    this.evictExpired();

    if (!this.store.has(key) && this.store.size >= MAX_CACHE_SIZE) {
      throw new Error(
        `State cache full (${MAX_CACHE_SIZE} entries). Invalidate entries before adding key "${key}".`,
      );
    }

    const now = new Date();
    const entry: CacheEntry<T> = {
      key,
      value,
      constitutionArticleId: articleId,
      createdAt: now,
      expiresAt: new Date(now.getTime() + ttlMs),
      entryVersion: ++this.nextVersion,
    };

    this.store.set(key, entry as CacheEntry<unknown>);
  }

  async get<T>(key: CacheKey): Promise<CacheEntry<T> | null> {
    const entry = this.store.get(key);

    if (!entry) {
      this.missCount++;
      return null;
    }

    if (new Date() > entry.expiresAt) {
      this.store.delete(key);
      this.evictionCount++;
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry as CacheEntry<T>;
  }

  async invalidate(key: CacheKey): Promise<boolean> {
    const existed = this.store.has(key);
    if (existed) {
      this.store.delete(key);
      this.evictionCount++;
    }
    return existed;
  }

  async getStatistics(): Promise<CacheStatistics> {
    this.evictExpired();
    const total = this.hitCount + this.missCount;

    return {
      totalEntries: this.store.size,
      hitCount: this.hitCount,
      missCount: this.missCount,
      evictionCount: this.evictionCount,
      hitRatio: total === 0 ? 0 : this.hitCount / total,
      lastUpdated: new Date(),
    };
  }

  /** Remove all TTL-expired entries from the store */
  private evictExpired(): void {
    const now = new Date();
    this.store.forEach((entry, key) => {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        this.evictionCount++;
      }
    });
  }
}
