/**
 * WP-009 / WP-010 / WP-011: Memory Layer (Layer 4)
 * Type definitions for all memory layer services
 *
 * LAYER CLASSIFICATION: Layer 4 (Memory)
 * KERNEL DEPENDENCIES: Layers 1-3 only (Constitution + Execution + Scheduling)
 *
 * Responsibilities:
 * - Runtime state caching with TTL (WP-009)
 * - Constitutional decision memory (WP-010)
 * - Layer 4 public contract (WP-011)
 *
 * ASP NOTE: All Layer 4 types live in one file to prevent contract proliferation.
 *           Complexity target: ≤ 8 types, ≤ 2 services, ≤ 3 contracts.
 */

import type { ConstitutionArticleId } from './constitution-types';
import type { AuditTrailId } from './wp-008-types';

// ============================================================================
// WP-009: State Cache Service Types
// ============================================================================

/**
 * Cache key branded type — prevents accidental string collisions
 */
export type CacheKey = string & { readonly __brand: 'CacheKey' };

export function createCacheKey(value: string): CacheKey {
  return value as CacheKey;
}

/**
 * A single cached entry with TTL and constitutional traceability
 */
export interface CacheEntry<T = unknown> {
  readonly key: CacheKey;
  readonly value: T;
  readonly constitutionArticleId: ConstitutionArticleId;
  readonly createdAt: Date;
  readonly expiresAt: Date;
  readonly entryVersion: number;
}

/**
 * Cache health metrics for Layer 8 observability
 */
export interface CacheStatistics {
  readonly totalEntries: number;
  readonly hitCount: number;
  readonly missCount: number;
  readonly evictionCount: number;
  readonly hitRatio: number;
  readonly lastUpdated: Date;
}

/**
 * Public contract for StateCacheService
 */
export interface StateCacheServiceContract {
  readonly serviceName: 'StateCacheService';
  readonly version: '1.0.0';

  set<T>(key: CacheKey, value: T, ttlMs: number, articleId: ConstitutionArticleId): Promise<void>;
  get<T>(key: CacheKey): Promise<CacheEntry<T> | null>;
  invalidate(key: CacheKey): Promise<boolean>;
  getStatistics(): Promise<CacheStatistics>;
}

// ============================================================================
// WP-010: Constitutional Memory Store Types
// ============================================================================

/**
 * A remembered constitutional decision — immutable record of what the OS decided
 * and why, linked to audit trail
 */
export interface MemoryEntry {
  readonly entryId: string;
  readonly requestId: string;
  readonly constitutionArticleId: ConstitutionArticleId;
  readonly decisionSummary: string;
  readonly auditTrailId: AuditTrailId;
  readonly recordedAt: Date;
}

/**
 * Public contract for ConstitutionalMemoryService
 */
export interface ConstitutionalMemoryServiceContract {
  readonly serviceName: 'ConstitutionalMemoryService';
  readonly version: '1.0.0';

  remember(
    requestId: string,
    articleId: ConstitutionArticleId,
    summary: string,
    auditId: AuditTrailId,
  ): Promise<MemoryEntry>;

  recall(requestId: string): Promise<MemoryEntry | null>;
  recallByArticle(articleId: ConstitutionArticleId): Promise<readonly MemoryEntry[]>;
  getMemorySize(): Promise<number>;
}

// ============================================================================
// WP-011: Memory Layer Kernel Contract
// ============================================================================

/**
 * Layer 4 Memory Layer public contract
 * Exposes exactly two services — no more, no less
 */
export interface MemoryLayerContract {
  readonly layerName: 'MemoryLayer';
  readonly version: '1.0.0';
  readonly layerNumber: 4;

  readonly stateCacheService: StateCacheServiceContract;
  readonly constitutionalMemoryService: ConstitutionalMemoryServiceContract;
}
