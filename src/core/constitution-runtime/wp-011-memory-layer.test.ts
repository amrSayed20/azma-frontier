/**
 * WP-009 / WP-010 / WP-011: Memory Layer Tests
 * Comprehensive test suite for Layer 4 memory services
 *
 * Test coverage:
 * - StateCacheService (WP-009): set, get, invalidate, TTL expiry, statistics, capacity
 * - ConstitutionalMemoryService (WP-010): remember, recall, recallByArticle, size
 * - createMemoryLayer (WP-011): kernel contract, service wiring
 * - Integration: cache + memory store used together
 * - Determinism: identical inputs produce identical outputs
 * - Error handling: capacity breach, missing keys
 */

import {
  StateCacheService,
  ConstitutionalMemoryService,
  createMemoryLayer,
  createCacheKey,
} from './wp-011-kernel';
import { createAuditTrailId } from './wp-008-types';

// ============================================================================
// Helpers
// ============================================================================

function makeAuditId(n: number) {
  return createAuditTrailId(`audit-${n}`);
}

// ============================================================================
// StateCacheService (WP-009)
// ============================================================================

describe('StateCacheService', () => {
  let cache: StateCacheService;

  beforeEach(() => {
    cache = new StateCacheService();
  });

  test('serviceName and version are correct', () => {
    expect(cache.serviceName).toBe('StateCacheService');
    expect(cache.version).toBe('1.0.0');
  });

  test('set and get a value before TTL expiry', async () => {
    const key = createCacheKey('test-key');
    await cache.set(key, { foo: 'bar' }, 5000, 'constitutional-structure');
    const entry = await cache.get<{ foo: string }>(key);

    expect(entry).not.toBeNull();
    expect(entry!.value).toEqual({ foo: 'bar' });
    expect(entry!.constitutionArticleId).toBe('constitutional-structure');
  });

  test('get returns null for unknown key', async () => {
    const entry = await cache.get(createCacheKey('missing'));
    expect(entry).toBeNull();
  });

  test('get returns null for TTL-expired entry', async () => {
    const key = createCacheKey('short-ttl');
    await cache.set(key, 'value', 1, 'constitutional-structure'); // 1 ms TTL

    await new Promise(r => setTimeout(r, 10)); // wait for expiry
    const entry = await cache.get(key);
    expect(entry).toBeNull();
  });

  test('invalidate removes an existing key', async () => {
    const key = createCacheKey('to-remove');
    await cache.set(key, 42, 5000, 'constitutional-structure');
    const removed = await cache.invalidate(key);
    expect(removed).toBe(true);
    expect(await cache.get(key)).toBeNull();
  });

  test('invalidate returns false for non-existent key', async () => {
    const removed = await cache.invalidate(createCacheKey('ghost'));
    expect(removed).toBe(false);
  });

  test('overwrites an existing key', async () => {
    const key = createCacheKey('overwrite');
    await cache.set(key, 'first', 5000, 'constitutional-structure');
    await cache.set(key, 'second', 5000, 'constitutional-structure');
    const entry = await cache.get<string>(key);
    expect(entry!.value).toBe('second');
  });

  test('entryVersion increments with each set', async () => {
    const k1 = createCacheKey('v1');
    const k2 = createCacheKey('v2');
    await cache.set(k1, 'a', 5000, 'constitutional-structure');
    await cache.set(k2, 'b', 5000, 'constitutional-structure');
    const e1 = await cache.get<string>(k1);
    const e2 = await cache.get<string>(k2);
    expect(e2!.entryVersion).toBeGreaterThan(e1!.entryVersion);
  });

  test('getStatistics reflects hits and misses', async () => {
    const key = createCacheKey('stat-key');
    await cache.set(key, true, 5000, 'constitutional-structure');

    await cache.get(key);              // hit
    await cache.get(key);              // hit
    await cache.get(createCacheKey('no')); // miss

    const stats = await cache.getStatistics();
    expect(stats.hitCount).toBe(2);
    expect(stats.missCount).toBe(1);
    expect(stats.hitRatio).toBeCloseTo(2 / 3);
  });

  test('getStatistics reports correct entry count after invalidate', async () => {
    const k1 = createCacheKey('s1');
    const k2 = createCacheKey('s2');
    await cache.set(k1, 1, 5000, 'constitutional-structure');
    await cache.set(k2, 2, 5000, 'constitutional-structure');
    await cache.invalidate(k1);

    const stats = await cache.getStatistics();
    expect(stats.totalEntries).toBe(1);
    expect(stats.evictionCount).toBe(1);
  });

  test('getStatistics hitRatio is 0 when no operations', async () => {
    const stats = await cache.getStatistics();
    expect(stats.hitRatio).toBe(0);
  });

  test('throws when cache exceeds max size (10 000)', async () => {
    // Fill cache to capacity
    for (let i = 0; i < 10_000; i++) {
      await cache.set(createCacheKey(`fill-${i}`), i, 60_000, 'constitutional-structure');
    }

    // Adding a brand-new key should throw
    await expect(
      cache.set(createCacheKey('overflow'), 'x', 5000, 'constitutional-structure'),
    ).rejects.toThrow('State cache full');
  });

  test('overwriting existing key does not throw even at capacity', async () => {
    for (let i = 0; i < 10_000; i++) {
      await cache.set(createCacheKey(`fill-${i}`), i, 60_000, 'constitutional-structure');
    }

    // Overwriting an existing key must succeed (not treated as new entry)
    await expect(
      cache.set(createCacheKey('fill-0'), 'updated', 5000, 'constitutional-structure'),
    ).resolves.toBeUndefined();
  });
});

// ============================================================================
// ConstitutionalMemoryService (WP-010)
// ============================================================================

describe('ConstitutionalMemoryService', () => {
  let memory: ConstitutionalMemoryService;

  beforeEach(() => {
    memory = new ConstitutionalMemoryService();
  });

  test('serviceName and version are correct', () => {
    expect(memory.serviceName).toBe('ConstitutionalMemoryService');
    expect(memory.version).toBe('1.0.0');
  });

  test('remember returns a valid MemoryEntry', async () => {
    const entry = await memory.remember(
      'req-001',
      'constitutional-structure',
      'Approved: request meets constitutional criteria',
      makeAuditId(1),
    );

    expect(entry.requestId).toBe('req-001');
    expect(entry.constitutionArticleId).toBe('constitutional-structure');
    expect(entry.decisionSummary).toContain('Approved');
    expect(entry.entryId).toContain('req-001');
  });

  test('recall returns the remembered entry', async () => {
    await memory.remember('req-002', 'sovereign-high-council', 'Council reviewed', makeAuditId(2));
    const recalled = await memory.recall('req-002');

    expect(recalled).not.toBeNull();
    expect(recalled!.requestId).toBe('req-002');
  });

  test('recall returns null for unknown requestId', async () => {
    const recalled = await memory.recall('ghost-request');
    expect(recalled).toBeNull();
  });

  test('recall latest overwrites earlier entries for same requestId', async () => {
    await memory.remember('req-003', 'constitutional-structure', 'First decision', makeAuditId(3));
    await memory.remember('req-003', 'security-layers', 'Updated decision', makeAuditId(4));

    const recalled = await memory.recall('req-003');
    expect(recalled!.decisionSummary).toBe('Updated decision');
    expect(recalled!.constitutionArticleId).toBe('security-layers');
  });

  test('recallByArticle returns all entries for a given article', async () => {
    await memory.remember('req-004', 'constitutional-structure', 'Decision A', makeAuditId(5));
    await memory.remember('req-005', 'constitutional-structure', 'Decision B', makeAuditId(6));
    await memory.remember('req-006', 'sovereign-high-council', 'Different article', makeAuditId(7));

    const entries = await memory.recallByArticle('constitutional-structure');
    expect(entries.length).toBe(2);
    expect(entries.every(e => e.constitutionArticleId === 'constitutional-structure')).toBe(true);
  });

  test('recallByArticle returns empty array for unknown article', async () => {
    const entries = await memory.recallByArticle('expansion-zones');
    expect(entries).toEqual([]);
  });

  test('getMemorySize tracks unique requestIds', async () => {
    expect(await memory.getMemorySize()).toBe(0);

    await memory.remember('r1', 'constitutional-structure', 's1', makeAuditId(1));
    await memory.remember('r2', 'constitutional-structure', 's2', makeAuditId(2));
    expect(await memory.getMemorySize()).toBe(2);

    // Same requestId overwrite — size stays 2
    await memory.remember('r1', 'security-layers', 'updated', makeAuditId(3));
    expect(await memory.getMemorySize()).toBe(2);
  });

  test('entryId is unique across multiple remember calls', async () => {
    const e1 = await memory.remember('rA', 'constitutional-structure', 's', makeAuditId(1));
    const e2 = await memory.remember('rB', 'constitutional-structure', 's', makeAuditId(2));
    expect(e1.entryId).not.toBe(e2.entryId);
  });

  test('determinism: recall returns same result on repeated calls', async () => {
    await memory.remember('req-det', 'constitutional-structure', 'Stable', makeAuditId(9));
    const r1 = await memory.recall('req-det');
    const r2 = await memory.recall('req-det');
    expect(r1).toStrictEqual(r2);
  });
});

// ============================================================================
// createMemoryLayer / MemoryLayerContract (WP-011)
// ============================================================================

describe('createMemoryLayer (MemoryLayerContract)', () => {
  test('returns correct layer metadata', () => {
    const layer = createMemoryLayer();
    expect(layer.layerName).toBe('MemoryLayer');
    expect(layer.version).toBe('1.0.0');
    expect(layer.layerNumber).toBe(4);
  });

  test('exposes stateCacheService with correct contract fields', () => {
    const { stateCacheService: svc } = createMemoryLayer();
    expect(svc.serviceName).toBe('StateCacheService');
    expect(svc.version).toBe('1.0.0');
    expect(typeof svc.set).toBe('function');
    expect(typeof svc.get).toBe('function');
    expect(typeof svc.invalidate).toBe('function');
    expect(typeof svc.getStatistics).toBe('function');
  });

  test('exposes constitutionalMemoryService with correct contract fields', () => {
    const { constitutionalMemoryService: mem } = createMemoryLayer();
    expect(mem.serviceName).toBe('ConstitutionalMemoryService');
    expect(mem.version).toBe('1.0.0');
    expect(typeof mem.remember).toBe('function');
    expect(typeof mem.recall).toBe('function');
    expect(typeof mem.recallByArticle).toBe('function');
    expect(typeof mem.getMemorySize).toBe('function');
  });

  test('each createMemoryLayer call returns independent service instances', async () => {
    const layer1 = createMemoryLayer();
    const layer2 = createMemoryLayer();

    const key = createCacheKey('isolation-key');
    await layer1.stateCacheService.set(key, 'layer1-value', 5000, 'constitutional-structure');

    const fromLayer2 = await layer2.stateCacheService.get(key);
    expect(fromLayer2).toBeNull(); // no data leak between instances
  });
});

// ============================================================================
// Integration: cache + memory store together (WP-011)
// ============================================================================

describe('Memory Layer Integration', () => {
  test('full pipeline: cache state then record constitutional decision', async () => {
    const layer = createMemoryLayer();
    const { stateCacheService: cache, constitutionalMemoryService: memory } = layer;

    // Step 1: cache intermediate state
    const stateKey = createCacheKey('req-pipeline-state');
    await cache.set(stateKey, { stage: 'processing' }, 5000, 'constitutional-structure');

    // Step 2: record constitutional decision
    const auditId = makeAuditId(99);
    const entry = await memory.remember(
      'req-pipeline',
      'constitutional-structure',
      'Processed with state cache hit',
      auditId,
    );

    // Step 3: verify both sides are consistent
    const cachedState = await cache.get<{ stage: string }>(stateKey);
    const recalled = await memory.recall('req-pipeline');

    expect(cachedState!.value.stage).toBe('processing');
    expect(recalled!.decisionSummary).toContain('cache hit');
    expect(entry.auditTrailId).toBe(auditId);
  });

  test('cache miss does not affect memory recall', async () => {
    const layer = createMemoryLayer();
    const { stateCacheService: cache, constitutionalMemoryService: memory } = layer;

    // Record decision even without a cached state
    await memory.remember('req-no-cache', 'sovereign-high-council', 'Decided without cache', makeAuditId(10));

    const cacheEntry = await cache.get(createCacheKey('req-no-cache'));
    const memEntry = await memory.recall('req-no-cache');

    expect(cacheEntry).toBeNull();
    expect(memEntry).not.toBeNull();
    expect(memEntry!.requestId).toBe('req-no-cache');
  });

  test('multiple requests do not interfere with each other', async () => {
    const layer = createMemoryLayer();
    const { stateCacheService: cache, constitutionalMemoryService: memory } = layer;

    // Two independent requests processed concurrently
    await Promise.all([
      cache.set(createCacheKey('rA-state'), { val: 1 }, 5000, 'constitutional-structure'),
      cache.set(createCacheKey('rB-state'), { val: 2 }, 5000, 'constitutional-structure'),
      memory.remember('rA', 'constitutional-structure', 'Decision A', makeAuditId(11)),
      memory.remember('rB', 'constitutional-structure', 'Decision B', makeAuditId(12)),
    ]);

    const rAState = await cache.get<{ val: number }>(createCacheKey('rA-state'));
    const rBState = await cache.get<{ val: number }>(createCacheKey('rB-state'));
    const rAMem = await memory.recall('rA');
    const rBMem = await memory.recall('rB');

    expect(rAState!.value.val).toBe(1);
    expect(rBState!.value.val).toBe(2);
    expect(rAMem!.decisionSummary).toBe('Decision A');
    expect(rBMem!.decisionSummary).toBe('Decision B');
  });

  test('deterministic: same sequence of operations always produces same results', async () => {
    const runPipeline = async () => {
      const layer = createMemoryLayer();
      const key = createCacheKey('det-key');
      await layer.stateCacheService.set(key, 'det-value', 5000, 'constitutional-structure');
      await layer.constitutionalMemoryService.remember('det-req', 'constitutional-structure', 'det-decision', makeAuditId(77));
      const cached = await layer.stateCacheService.get<string>(key);
      const recalled = await layer.constitutionalMemoryService.recall('det-req');
      return { cachedValue: cached!.value, memSummary: recalled!.decisionSummary };
    };

    const run1 = await runPipeline();
    const run2 = await runPipeline();
    const run3 = await runPipeline();

    expect(run1).toEqual(run2);
    expect(run2).toEqual(run3);
  });
});
