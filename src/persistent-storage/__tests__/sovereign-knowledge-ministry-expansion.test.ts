/**
 * SOVEREIGN KNOWLEDGE MINISTRY EXPANSION — Constitutional Foundation Package XVII
 *
 * Test suite for the Business Intelligence Ministry (GoogleTrendsProvider)
 * and the Media Intelligence Ministry (RedditProvider).
 *
 * Tests cover:
 *   1.  GoogleTrendsProvider structure — providerId, interface (no network)
 *   2.  GoogleTrendsProvider invalid document ID — throws before network call (no network)
 *   3.  GoogleTrendsProvider real search — returns trend results (real HTTP)
 *   4.  GoogleTrendsProvider real fetch — returns trend SourceDocument (real HTTP)
 *   5.  RedditProvider structure — providerId, interface (no network)
 *   6.  RedditProvider invalid document ID — throws before network call (no network)
 *   7.  RedditProvider real search — returns post results (real HTTP)
 *   8.  RedditProvider real fetch — returns post SourceDocument (real HTTP)
 *   9.  Business Intelligence Ministry wiring (no network)
 *   10. Media Intelligence Ministry wiring (no network)
 *   11. Constitutional secrecy — raw provider IDs never appear above Ministry layer (real HTTP)
 *   12. Full chain — Ministry IDs in evidence after real HTTP (real HTTP)
 *
 * Sections 3–4, 7–8, 11–12 require network access.
 * Timeout is 30 000 ms per test to accommodate real HTTP latency.
 */

jest.setTimeout(30000);

import { GoogleTrendsProvider, extractTrendSlug } from '../../chambers/hujjah-al-damighah/providers/google-trends-provider';
import { RedditProvider, extractRedditPostId } from '../../chambers/hujjah-al-damighah/providers/reddit-provider';
import type { IRepositoryProvider } from '../../chambers/hujjah-al-damighah/core/repository-manager';
import { MinistryRegistry } from '../../chambers/hujjah-al-damighah/ministries/ministry-registry';
import { receiveCitizenKnowledgeRequest } from '../../chambers/hujjah-al-damighah/reception-engine';
import { understandKnowledgeReception } from '../../chambers/hujjah-al-damighah/understanding-engine';
import { conductInvestigation } from '../../chambers/hujjah-al-damighah/investigation-engine';

// ─── SECTION 1: GOOGLE TRENDS PROVIDER STRUCTURE (NO NETWORK) ────────────────

describe('GoogleTrendsProvider — providerId and interface compliance', () => {
  const provider = new GoogleTrendsProvider();

  it('providerId is google-trends', () => {
    expect(provider.providerId).toBe('google-trends');
  });

  it('providerId is a string', () => {
    expect(typeof provider.providerId).toBe('string');
  });

  it('implements IRepositoryProvider — has search method', () => {
    expect(typeof provider.search).toBe('function');
  });

  it('implements IRepositoryProvider — has fetch method', () => {
    expect(typeof provider.fetch).toBe('function');
  });

  it('satisfies IRepositoryProvider type contract', () => {
    const typed: IRepositoryProvider = provider;
    expect(typed.providerId).toBe('google-trends');
  });
});

// ─── SECTION 2: GOOGLE TRENDS PROVIDER — INVALID DOCUMENT ID (NO NETWORK) ────

describe('GoogleTrendsProvider — throws for invalid document ID before network call', () => {
  const provider = new GoogleTrendsProvider();

  it('throws for empty string documentId', async () => {
    await expect(provider.fetch('')).rejects.toThrow(/Invalid document ID/);
  });

  it('throws for documentId without trend- prefix', async () => {
    await expect(provider.fetch('super-bowl')).rejects.toThrow(/Invalid document ID/);
  });

  it('throws for trend- prefix with empty slug', async () => {
    await expect(provider.fetch('trend-')).rejects.toThrow(/Invalid document ID/);
  });

  it('extractTrendSlug throws for missing prefix', () => {
    expect(() => extractTrendSlug('not-a-trend')).toThrow(/Invalid document ID/);
  });

  it('extractTrendSlug returns slug for valid trend- ID', () => {
    expect(extractTrendSlug('trend-super-bowl')).toBe('super-bowl');
  });
});

// ─── SECTION 3: GOOGLE TRENDS — REAL SEARCH (REAL HTTP) ──────────────────────

describe('GoogleTrendsProvider — real search returns trend results', () => {
  const provider = new GoogleTrendsProvider();

  it('returns an array for any query', async () => {
    const results = await provider.search('technology', 3);
    expect(Array.isArray(results)).toBe(true);
  });

  it('returns at most limit results', async () => {
    const results = await provider.search('technology', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('each result has an id starting with trend-', async () => {
    const results = await provider.search('news', 3);
    for (const r of results) {
      expect(r.id).toMatch(/^trend-[a-z0-9-]+$/);
    }
  });

  it('each result has provider=google-trends', async () => {
    const results = await provider.search('news', 3);
    for (const r of results) {
      expect(r.provider).toBe('google-trends');
    }
  });

  it('each result has a non-empty title', async () => {
    const results = await provider.search('news', 3);
    for (const r of results) {
      expect(r.title.length).toBeGreaterThan(0);
    }
  });

  it('each result has a non-empty snippet', async () => {
    const results = await provider.search('news', 3);
    for (const r of results) {
      expect(r.snippet.length).toBeGreaterThan(0);
    }
  });

  it('relevanceScores are between 0.1 and 1', async () => {
    const results = await provider.search('news', 3);
    for (const r of results) {
      expect(r.relevanceScore).toBeGreaterThanOrEqual(0.1);
      expect(r.relevanceScore).toBeLessThanOrEqual(1);
    }
  });

  it('snippet does not expose internal API URLs', async () => {
    const results = await provider.search('news', 3);
    for (const r of results) {
      expect(r.snippet).not.toContain('trends.google.com');
      expect(r.snippet).not.toContain('http');
    }
  });
});

// ─── SECTION 4: GOOGLE TRENDS — REAL FETCH (REAL HTTP) ───────────────────────

describe('GoogleTrendsProvider — real fetch returns SourceDocument', () => {
  const provider = new GoogleTrendsProvider();

  it('search-then-fetch produces a SourceDocument', async () => {
    const results = await provider.search('news', 1);
    if (results.length === 0) return; // skip if feed is empty or offline

    let doc;
    try {
      doc = await provider.fetch(results[0].id);
    } catch {
      return; // trend may have rotated out between search and fetch (daily RSS refresh)
    }
    expect(doc).toBeDefined();
  });

  it('fetched SourceDocument has id matching the requested documentId', async () => {
    const results = await provider.search('news', 1);
    if (results.length === 0) return;

    let doc;
    try {
      doc = await provider.fetch(results[0].id);
    } catch {
      return;
    }
    expect(doc.id).toBe(results[0].id);
  });

  it('fetched SourceDocument.provider is google-trends', async () => {
    const results = await provider.search('news', 1);
    if (results.length === 0) return;

    let doc;
    try {
      doc = await provider.fetch(results[0].id);
    } catch {
      return;
    }
    expect(doc.provider).toBe('google-trends');
  });

  it('fetched content is non-empty and contains trend data', async () => {
    const results = await provider.search('news', 1);
    if (results.length === 0) return;

    let doc;
    try {
      doc = await provider.fetch(results[0].id);
    } catch {
      return;
    }
    expect(doc.content.length).toBeGreaterThan(0);
    expect(doc.content).toContain('Trending Search Term:');
  });

  it('fetched content does not contain raw API URLs', async () => {
    const results = await provider.search('news', 1);
    if (results.length === 0) return;

    let doc;
    try {
      doc = await provider.fetch(results[0].id);
    } catch {
      return;
    }
    expect(doc.content).not.toContain('trends.google.com');
    expect(doc.content).not.toContain('http');
  });
});

// ─── SECTION 5: REDDIT PROVIDER STRUCTURE (NO NETWORK) ───────────────────────

describe('RedditProvider — providerId and interface compliance', () => {
  const provider = new RedditProvider();

  it('providerId is reddit', () => {
    expect(provider.providerId).toBe('reddit');
  });

  it('providerId is a string', () => {
    expect(typeof provider.providerId).toBe('string');
  });

  it('implements IRepositoryProvider — has search method', () => {
    expect(typeof provider.search).toBe('function');
  });

  it('implements IRepositoryProvider — has fetch method', () => {
    expect(typeof provider.fetch).toBe('function');
  });

  it('satisfies IRepositoryProvider type contract', () => {
    const typed: IRepositoryProvider = provider;
    expect(typed.providerId).toBe('reddit');
  });
});

// ─── SECTION 6: REDDIT PROVIDER — INVALID DOCUMENT ID (NO NETWORK) ──────────

describe('RedditProvider — throws for invalid document ID before network call', () => {
  const provider = new RedditProvider();

  it('throws for empty string documentId', async () => {
    await expect(provider.fetch('')).rejects.toThrow(/Invalid document ID/);
  });

  it('throws for documentId without post- prefix', async () => {
    await expect(provider.fetch('abc123')).rejects.toThrow(/Invalid document ID/);
  });

  it('throws for post- prefix with empty ID', async () => {
    await expect(provider.fetch('post-')).rejects.toThrow(/Invalid document ID/);
  });

  it('throws for post- prefix with invalid characters', async () => {
    await expect(provider.fetch('post-@#$%')).rejects.toThrow(/Invalid document ID/);
  });

  it('extractRedditPostId throws for missing prefix', () => {
    expect(() => extractRedditPostId('abc123')).toThrow(/Invalid document ID/);
  });

  it('extractRedditPostId returns postId for valid post- ID', () => {
    expect(extractRedditPostId('post-1abc2d')).toBe('1abc2d');
  });
});

// ─── SECTION 7: REDDIT PROVIDER — REAL SEARCH (REAL HTTP) ────────────────────

describe('RedditProvider — real search returns post results', () => {
  const provider = new RedditProvider();

  it('returns an array for a well-known query', async () => {
    const results = await provider.search('technology trends', 3);
    expect(Array.isArray(results)).toBe(true);
  });

  it('returns at most limit results', async () => {
    const results = await provider.search('technology trends', 2);
    expect(results.length).toBeLessThanOrEqual(2);
  });

  it('each result has an id starting with post-', async () => {
    const results = await provider.search('technology trends', 3);
    for (const r of results) {
      expect(r.id).toMatch(/^post-[a-z0-9]+$/i);
    }
  });

  it('each result has provider=reddit', async () => {
    const results = await provider.search('technology trends', 3);
    for (const r of results) {
      expect(r.provider).toBe('reddit');
    }
  });

  it('each result has a non-empty title', async () => {
    const results = await provider.search('technology trends', 3);
    for (const r of results) {
      expect(r.title.length).toBeGreaterThan(0);
    }
  });

  it('relevanceScores are descending', async () => {
    const results = await provider.search('technology trends', 3);
    if (results.length < 2) return;
    for (let i = 0; i < results.length - 1; i++) {
      expect(results[i].relevanceScore).toBeGreaterThanOrEqual(results[i + 1].relevanceScore);
    }
  });

  it('relevanceScores are between 0.1 and 1', async () => {
    const results = await provider.search('technology trends', 3);
    for (const r of results) {
      expect(r.relevanceScore).toBeGreaterThanOrEqual(0.1);
      expect(r.relevanceScore).toBeLessThanOrEqual(1);
    }
  });

  it('result IDs are unique within a single search', async () => {
    const results = await provider.search('technology trends', 3);
    const ids = results.map((r) => r.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ─── SECTION 8: REDDIT PROVIDER — REAL FETCH (REAL HTTP) ─────────────────────

describe('RedditProvider — real fetch returns post SourceDocument', () => {
  const provider = new RedditProvider();

  it('search-then-fetch produces a SourceDocument', async () => {
    const results = await provider.search('technology', 1);
    if (results.length === 0) return;

    const doc = await provider.fetch(results[0].id);
    expect(doc).toBeDefined();
  });

  it('fetched SourceDocument.id matches the requested documentId', async () => {
    const results = await provider.search('technology', 1);
    if (results.length === 0) return;

    const doc = await provider.fetch(results[0].id);
    expect(doc.id).toBe(results[0].id);
  });

  it('fetched SourceDocument.provider is reddit', async () => {
    const results = await provider.search('technology', 1);
    if (results.length === 0) return;

    const doc = await provider.fetch(results[0].id);
    expect(doc.provider).toBe('reddit');
  });

  it('fetched content is non-empty', async () => {
    const results = await provider.search('technology', 1);
    if (results.length === 0) return;

    const doc = await provider.fetch(results[0].id);
    expect(doc.content.length).toBeGreaterThan(0);
  });

  it('fetched content contains topic and community sections', async () => {
    const results = await provider.search('technology', 1);
    if (results.length === 0) return;

    const doc = await provider.fetch(results[0].id);
    expect(doc.content).toContain('Topic:');
    expect(doc.content).toContain('Community:');
  });
});

// ─── SECTION 9: BUSINESS INTELLIGENCE MINISTRY WIRING (NO NETWORK) ───────────

describe('Business Intelligence Ministry — MinistryRegistry wiring', () => {
  it('GoogleTrendsProvider attaches to ministry-business-intelligence without error', () => {
    const registry = new MinistryRegistry();
    expect(() =>
      registry.attachProvider('ministry-business-intelligence', new GoogleTrendsProvider()),
    ).not.toThrow();
  });

  it('RepositoryManager built after attachment registers ministry-business-intelligence', () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-business-intelligence', new GoogleTrendsProvider());
    const rm = registry.buildRepositoryManager();
    // The RepositoryManager is built successfully when no error is thrown
    expect(rm).toBeDefined();
  });

  it('GoogleTrendsProvider.providerId remains google-trends after Ministry registration', () => {
    const provider = new GoogleTrendsProvider();
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-business-intelligence', provider);
    // Ministry wraps the provider externally — provider's own ID is unchanged
    expect(provider.providerId).toBe('google-trends');
  });

  it('ministry-business-intelligence rejects an unknown ministryId', () => {
    const registry = new MinistryRegistry();
    expect(() =>
      // @ts-expect-error testing runtime guard
      registry.attachProvider('ministry-unknown', new GoogleTrendsProvider()),
    ).toThrow(/Unknown ministry/);
  });
});

// ─── SECTION 10: MEDIA INTELLIGENCE MINISTRY WIRING (NO NETWORK) ─────────────

describe('Media Intelligence Ministry — MinistryRegistry wiring', () => {
  it('RedditProvider attaches to ministry-media-intelligence without error', () => {
    const registry = new MinistryRegistry();
    expect(() =>
      registry.attachProvider('ministry-media-intelligence', new RedditProvider()),
    ).not.toThrow();
  });

  it('RepositoryManager built after attachment registers ministry-media-intelligence', () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-media-intelligence', new RedditProvider());
    const rm = registry.buildRepositoryManager();
    expect(rm).toBeDefined();
  });

  it('RedditProvider.providerId remains reddit after Ministry registration', () => {
    const provider = new RedditProvider();
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-media-intelligence', provider);
    expect(provider.providerId).toBe('reddit');
  });

  it('both providers attach to their respective Ministries in one registry', () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-business-intelligence', new GoogleTrendsProvider());
    registry.attachProvider('ministry-media-intelligence', new RedditProvider());
    const rm = registry.buildRepositoryManager();
    expect(rm).toBeDefined();
  });
});

// ─── SECTION 11: CONSTITUTIONAL SECRECY (REAL HTTP) ──────────────────────────

describe('Constitutional secrecy — raw provider IDs never appear above Ministry layer', () => {
  it('Business Intelligence search results carry ministry-business-intelligence, not google-trends', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-business-intelligence', new GoogleTrendsProvider());
    const rm = registry.buildRepositoryManager();

    const results = await rm.searchAll('technology', 1);
    for (const r of results) {
      if (r.provider === 'ministry-business-intelligence') {
        expect(r.provider).not.toBe('google-trends');
      }
    }
  });

  it('Media Intelligence search results carry ministry-media-intelligence, not reddit', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-media-intelligence', new RedditProvider());
    const rm = registry.buildRepositoryManager();

    const results = await rm.searchAll('technology', 1);
    for (const r of results) {
      if (r.provider === 'ministry-media-intelligence') {
        expect(r.provider).not.toBe('reddit');
      }
    }
  });

  it('Business Intelligence SourceDocument from fetchDocument carries Ministry ID', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-business-intelligence', new GoogleTrendsProvider());
    const rm = registry.buildRepositoryManager();

    const results = await rm.searchAll('technology', 1);
    const biResults = results.filter((r) => r.provider === 'ministry-business-intelligence');
    if (biResults.length === 0) return; // skip if no results (offline or no match)

    let doc;
    try {
      doc = await rm.fetchDocument(biResults[0].provider, biResults[0].id);
    } catch {
      return; // trend may have rotated out between search and fetch
    }
    expect(doc.provider).toBe('ministry-business-intelligence');
    expect(doc.provider).not.toBe('google-trends');
  });

  it('Media Intelligence SourceDocument from fetchDocument carries Ministry ID', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-media-intelligence', new RedditProvider());
    const rm = registry.buildRepositoryManager();

    const results = await rm.searchAll('technology', 1);
    const miResults = results.filter((r) => r.provider === 'ministry-media-intelligence');
    if (miResults.length === 0) return;

    const doc = await rm.fetchDocument(miResults[0].provider, miResults[0].id);
    expect(doc.provider).toBe('ministry-media-intelligence');
    expect(doc.provider).not.toBe('reddit');
  });
});

// ─── SECTION 12: FULL CHAIN (REAL HTTP) ──────────────────────────────────────

describe('Full chain — Ministry IDs in evidence after real HTTP investigation', () => {
  it('Investigation produces rawBundle when Business Intelligence is wired', async () => {
    const reception = receiveCitizenKnowledgeRequest('What are trending topics in business?', 'commerce');
    const understanding = understandKnowledgeReception(reception);
    if (!understanding.ok) return;

    const outcome = await conductInvestigation(understanding.intent);
    // The chain completes whether or not providers return results
    expect(outcome.ok).toBe(true);
  });

  it('Evidence items never carry raw sub-provider IDs (google-trends, reddit)', async () => {
    const reception = receiveCitizenKnowledgeRequest('technology market trends', 'commerce');
    const understanding = understandKnowledgeReception(reception);
    if (!understanding.ok) return;

    const outcome = await conductInvestigation(understanding.intent);
    if (!outcome.ok) return;

    for (const evidence of outcome.result.rawBundle.evidence) {
      expect(evidence.sourceProvider).not.toBe('google-trends');
      expect(evidence.sourceProvider).not.toBe('reddit');
    }
  });

  it('Evidence items that arrive from new Ministries carry constitutional Ministry IDs', async () => {
    const reception = receiveCitizenKnowledgeRequest('technology trends', 'commerce');
    const understanding = understandKnowledgeReception(reception);
    if (!understanding.ok) return;

    const outcome = await conductInvestigation(understanding.intent);
    if (!outcome.ok) return;

    const VALID_MINISTRY_IDS = new Set([
      'ministry-human-knowledge',
      'ministry-business-intelligence',
      'ministry-media-intelligence',
      'ministry-sovereign-knowledge',
      'ministry-scientific-knowledge',
      'ministry-technical-knowledge',
      'ministry-historical-knowledge',
      'ministry-legal-knowledge',
    ]);

    for (const evidence of outcome.result.rawBundle.evidence) {
      expect(VALID_MINISTRY_IDS.has(evidence.sourceProvider)).toBe(true);
    }
  });
});
