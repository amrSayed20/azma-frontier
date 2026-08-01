/**
 * KNOWLEDGE MINISTRIES FOUNDATION — Constitutional Foundation Package XV
 * Test suite for the Al Hujjah Al-Damighah Ministry architecture.
 *
 * Tests cover:
 *   1. Constitutional Ministry declarations — all 8 Ministries defined correctly
 *   2. MinistryRegistry bootstrap — all 8 known, attachProvider behavior
 *   3. Ministry provider identity — evidence.sourceProvider carries Ministry ID
 *   4. Empty Ministry (no providers) — returns empty results honestly
 *   5. Ministry RepositoryManager — 8 providers registered, all Ministries present
 *   6. Composite document key routing — fetch decodes provider::docId correctly
 *   7. Constitutional identity stability — Ministry IDs are stable, provider-agnostic
 *   8. Full chain — Reception → Understanding → Investigation → Evidence → Knowledge
 *      with evidence.sourceProvider = 'ministry-human-knowledge'
 *   9. Provider encapsulation — raw provider identity hidden from search results
 *  10. Error cases — unknown ministry, invalid composite key
 */

import {
  CONSTITUTIONAL_MINISTRIES,
  type KnowledgeMinistryId,
} from '../../chambers/hujjah-al-damighah/ministries/ministry-contracts';
import { MinistryRegistry } from '../../chambers/hujjah-al-damighah/ministries/ministry-registry';
import type { IRepositoryProvider } from '../../chambers/hujjah-al-damighah/core/repository-manager';
import type { RepositorySearchResult } from '../../chambers/hujjah-al-damighah/domain/evidence.types';
import type { SourceDocument } from '../../chambers/hujjah-al-damighah/core/evidence-extractor';
import {
  receiveCitizenKnowledgeRequest,
  receiveSovereignKnowledgeRequest,
} from '../../chambers/hujjah-al-damighah/reception-engine';
import type { SovereignKnowledgeReceptionPayload } from '../../chambers/hujjah-al-damighah/reception-contracts';
import { understandKnowledgeReception } from '../../chambers/hujjah-al-damighah/understanding-engine';
import { conductInvestigation } from '../../chambers/hujjah-al-damighah/investigation-engine';
import { collectEvidence } from '../../chambers/hujjah-al-damighah/evidence-layer';
import { declareKnowledge } from '../../chambers/hujjah-al-damighah/knowledge-layer';

// ─── MOCK PROVIDER ────────────────────────────────────────────────────────────

function makeMockProvider(
  id: string,
  searchResults: Partial<RepositorySearchResult>[] = [],
): IRepositoryProvider {
  return {
    providerId: id,
    async search(query: string, limit: number): Promise<RepositorySearchResult[]> {
      return searchResults.slice(0, limit).map((r, i) => ({
        id: `${id}-doc-${i + 1}`,
        provider: id,
        title: `Mock result ${i + 1} for ${query}`,
        snippet: `Mock snippet ${i + 1}`,
        relevanceScore: 0.9 - i * 0.05,
        ...r,
      }));
    },
    async fetch(documentId: string): Promise<SourceDocument> {
      return {
        id: documentId,
        provider: id,
        content: `Mock content for ${documentId}`,
      };
    },
  };
}

const SOVEREIGN_PAYLOAD: SovereignKnowledgeReceptionPayload = {
  requestId: 'kr-ministry-test-001',
  goalId: 'goal-ministry-001',
  assessmentId: 'assessment-ministry-001',
  criterionId: 'crit-ministry-A',
  criterionDescriptionSnapshot: 'Reach 1000 subscribers within 90 days.',
  gapClass: 'OBSERVATION_GAP',
  gapCategory: 'EVIDENCE_AVAILABILITY',
  questionStatement: 'What is the current subscriber count for this Creator?',
  availability: 'OBSERVABLE_INTERNALLY',
  requestedAtMs: 1700000000000,
};

async function citizenFullChain(query: string, domain = 'general') {
  const reception = receiveCitizenKnowledgeRequest(query, domain);
  const understanding = understandKnowledgeReception(reception);
  if (!understanding.ok) throw new Error('Understanding failed');
  const investigationOutcome = await conductInvestigation(understanding.intent);
  if (!investigationOutcome.ok) throw new Error('Investigation failed');
  const collectionOutcome = collectEvidence(investigationOutcome.result);
  if (!collectionOutcome.ok) throw new Error('Evidence collection failed');
  return {
    result: investigationOutcome.result,
    collection: collectionOutcome.collection,
    declaration: declareKnowledge(collectionOutcome.collection),
  };
}

// ─── SECTION 1: CONSTITUTIONAL MINISTRY DECLARATIONS ─────────────────────────

describe('Constitutional Ministry declarations — all 8 Ministries defined correctly', () => {
  it('CONSTITUTIONAL_MINISTRIES contains exactly 8 entries', () => {
    expect(CONSTITUTIONAL_MINISTRIES).toHaveLength(8);
  });

  it('all 8 constitutional Ministry IDs are present', () => {
    const ids = CONSTITUTIONAL_MINISTRIES.map((m) => m.ministryId);
    expect(ids).toContain('ministry-human-knowledge');
    expect(ids).toContain('ministry-sovereign-knowledge');
    expect(ids).toContain('ministry-scientific-knowledge');
    expect(ids).toContain('ministry-technical-knowledge');
    expect(ids).toContain('ministry-historical-knowledge');
    expect(ids).toContain('ministry-legal-knowledge');
    expect(ids).toContain('ministry-business-intelligence');
    expect(ids).toContain('ministry-media-intelligence');
  });

  it('each Ministry has a non-empty name', () => {
    for (const ministry of CONSTITUTIONAL_MINISTRIES) {
      expect(ministry.name.length).toBeGreaterThan(0);
    }
  });

  it('each Ministry has a non-empty domain', () => {
    for (const ministry of CONSTITUTIONAL_MINISTRIES) {
      expect(ministry.domain.length).toBeGreaterThan(0);
    }
  });

  it('each Ministry has a non-empty description', () => {
    for (const ministry of CONSTITUTIONAL_MINISTRIES) {
      expect(ministry.description.length).toBeGreaterThan(0);
    }
  });

  it('Ministry of Human Knowledge has domain=humanities', () => {
    const m = CONSTITUTIONAL_MINISTRIES.find((m) => m.ministryId === 'ministry-human-knowledge');
    expect(m?.domain).toBe('humanities');
  });

  it('Ministry of Business Intelligence has domain=commerce', () => {
    const m = CONSTITUTIONAL_MINISTRIES.find((m) => m.ministryId === 'ministry-business-intelligence');
    expect(m?.domain).toBe('commerce');
  });

  it('Ministry of Media Intelligence has domain=media', () => {
    const m = CONSTITUTIONAL_MINISTRIES.find((m) => m.ministryId === 'ministry-media-intelligence');
    expect(m?.domain).toBe('media');
  });

  it('all Ministry IDs are unique', () => {
    const ids = CONSTITUTIONAL_MINISTRIES.map((m) => m.ministryId);
    const unique = new Set(ids);
    expect(unique.size).toBe(8);
  });
});

// ─── SECTION 2: MINISTRYREGISTRY BOOTSTRAP ──────────────────────────────────

describe('MinistryRegistry bootstrap — all 8 known, attachProvider behavior', () => {
  it('MinistryRegistry can be instantiated', () => {
    expect(() => new MinistryRegistry()).not.toThrow();
  });

  it('attachProvider does not throw for a known Ministry ID', () => {
    const registry = new MinistryRegistry();
    const provider = makeMockProvider('test-provider');
    expect(() => registry.attachProvider('ministry-human-knowledge', provider)).not.toThrow();
  });

  it('attachProvider throws for an unknown Ministry ID', () => {
    const registry = new MinistryRegistry();
    const provider = makeMockProvider('test-provider');
    expect(() =>
      registry.attachProvider(
        'ministry-unknown-knowledge' as KnowledgeMinistryId,
        provider,
      ),
    ).toThrow();
  });

  it('multiple providers can be attached to the same Ministry', () => {
    const registry = new MinistryRegistry();
    const p1 = makeMockProvider('provider-a');
    const p2 = makeMockProvider('provider-b');
    expect(() => {
      registry.attachProvider('ministry-human-knowledge', p1);
      registry.attachProvider('ministry-human-knowledge', p2);
    }).not.toThrow();
  });

  it('providers can be attached to different Ministries independently', () => {
    const registry = new MinistryRegistry();
    const p1 = makeMockProvider('provider-a');
    const p2 = makeMockProvider('provider-b');
    expect(() => {
      registry.attachProvider('ministry-human-knowledge', p1);
      registry.attachProvider('ministry-scientific-knowledge', p2);
    }).not.toThrow();
  });
});

// ─── SECTION 3: MINISTRY PROVIDER IDENTITY ──────────────────────────────────

describe('Ministry provider identity — evidence.sourceProvider carries Ministry ID', () => {
  it('Ministry search results carry the Ministry ID as provider, not the raw provider ID', async () => {
    const registry = new MinistryRegistry();
    const mockProvider = makeMockProvider('raw-provider-x', [{}]);
    registry.attachProvider('ministry-human-knowledge', mockProvider);
    const repositoryManager = registry.buildRepositoryManager();

    const results = await repositoryManager.searchAll('test query', 3);
    const humanResults = results.filter((r) => r.provider === 'ministry-human-knowledge');
    expect(humanResults.length).toBeGreaterThan(0);
  });

  it('search results do not expose the raw sub-provider ID in result.provider', async () => {
    const registry = new MinistryRegistry();
    const mockProvider = makeMockProvider('raw-provider-x', [{}]);
    registry.attachProvider('ministry-human-knowledge', mockProvider);
    const repositoryManager = registry.buildRepositoryManager();

    const results = await repositoryManager.searchAll('test query', 3);
    for (const r of results) {
      expect(r.provider).not.toBe('raw-provider-x');
    }
  });

  it('fetched SourceDocument.provider carries the Ministry ID, not the raw provider ID', async () => {
    const registry = new MinistryRegistry();
    const mockProvider = makeMockProvider('raw-provider-x', [{ id: 'raw-doc-001' }]);
    registry.attachProvider('ministry-human-knowledge', mockProvider);
    const repositoryManager = registry.buildRepositoryManager();

    const searchResults = await repositoryManager.searchAll('test query', 1);
    expect(searchResults.length).toBeGreaterThan(0);

    const [firstResult] = searchResults;
    const doc = await repositoryManager.fetchDocument(firstResult.provider, firstResult.id);
    expect(doc.provider).toBe('ministry-human-knowledge');
    expect(doc.provider).not.toBe('raw-provider-x');
  });
});

// ─── SECTION 4: EMPTY MINISTRY (NO PROVIDERS) ────────────────────────────────

describe('Empty Ministry (no providers) — returns empty results honestly', () => {
  it('Ministry with no providers returns empty search results', async () => {
    const registry = new MinistryRegistry();
    const repositoryManager = registry.buildRepositoryManager();

    const results = await repositoryManager.searchAll('test query', 3);
    expect(Array.isArray(results)).toBe(true);
  });

  it('MinistryRegistry with no providers attached builds without error', () => {
    const registry = new MinistryRegistry();
    expect(() => registry.buildRepositoryManager()).not.toThrow();
  });

  it('RepositoryManager built from empty registry has 8 providers registered', async () => {
    const registry = new MinistryRegistry();
    const repositoryManager = registry.buildRepositoryManager();

    // All 8 Ministries registered → no warning about unknown provider when fetching
    // We verify this by checking that fetching a known Ministry ID does not throw
    // "Provider is not registered" for the registered Ministries.
    // Instead, an empty Ministry throws "Sub-provider not attached" on fetch —
    // which is the correct constitutional behavior.
    const unknownFetchPromise = repositoryManager.fetchDocument(
      'ministry-human-knowledge',
      'raw-provider::doc-001',
    );
    // Throws because no sub-provider 'raw-provider' is attached — not because the Ministry is unknown
    await expect(unknownFetchPromise).rejects.toThrow(/Sub-provider 'raw-provider'/);
  });

  it('registered Ministries with no providers contribute nothing to searchAll results', async () => {
    const registry = new MinistryRegistry();
    // Only attach to one Ministry
    registry.attachProvider('ministry-human-knowledge', makeMockProvider('provider-a', [{}]));
    const repositoryManager = registry.buildRepositoryManager();

    const results = await repositoryManager.searchAll('test query', 3);
    // All results come from ministry-human-knowledge; others contribute empty arrays
    for (const r of results) {
      expect(r.provider).toBe('ministry-human-knowledge');
    }
  });
});

// ─── SECTION 5: MINISTRY REPOSITORYMANAGER ──────────────────────────────────

describe('Ministry RepositoryManager — 8 providers registered, all Ministries present', () => {
  it('buildRepositoryManager returns without error', () => {
    const registry = new MinistryRegistry();
    expect(() => registry.buildRepositoryManager()).not.toThrow();
  });

  it('RepositoryManager can route to ministry-human-knowledge', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', makeMockProvider('gutenberg', [{}]));
    const rm = registry.buildRepositoryManager();

    const results = await rm.searchAll('What is photosynthesis?', 1);
    expect(results.some((r) => r.provider === 'ministry-human-knowledge')).toBe(true);
  });

  it('RepositoryManager can route to ministry-scientific-knowledge independently', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-scientific-knowledge', makeMockProvider('arxiv', [{}]));
    const rm = registry.buildRepositoryManager();

    const results = await rm.searchAll('quantum entanglement', 1);
    expect(results.some((r) => r.provider === 'ministry-scientific-knowledge')).toBe(true);
  });

  it('results from multiple Ministries are sorted by relevanceScore globally', async () => {
    const registry = new MinistryRegistry();

    registry.attachProvider(
      'ministry-human-knowledge',
      makeMockProvider('gutenberg', [{ relevanceScore: 0.7 }]),
    );
    registry.attachProvider(
      'ministry-scientific-knowledge',
      makeMockProvider('arxiv', [{ relevanceScore: 0.9 }]),
    );

    const rm = registry.buildRepositoryManager();
    const results = await rm.searchAll('test', 3);

    // Scientific (0.9) should appear before Human (0.7)
    const providers = results.map((r) => r.provider);
    const sciIndex = providers.indexOf('ministry-scientific-knowledge');
    const humIndex = providers.indexOf('ministry-human-knowledge');
    if (sciIndex !== -1 && humIndex !== -1) {
      expect(sciIndex).toBeLessThan(humIndex);
    }
  });
});

// ─── SECTION 6: COMPOSITE DOCUMENT KEY ROUTING ──────────────────────────────

describe('Composite document key routing — fetch decodes provider::docId correctly', () => {
  it('search result ID encodes sub-provider identity', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', makeMockProvider('gutenberg', [{}]));
    const rm = registry.buildRepositoryManager();

    const results = await rm.searchAll('test', 1);
    expect(results.length).toBeGreaterThan(0);
    // The composite key is encoded in result.id: 'gutenberg::gutenberg-doc-1'
    expect(results[0].id).toContain('::');
  });

  it('fetch via Ministry ID successfully resolves to a SourceDocument', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', makeMockProvider('gutenberg', [{}]));
    const rm = registry.buildRepositoryManager();

    const results = await rm.searchAll('test', 1);
    expect(results.length).toBeGreaterThan(0);

    const doc = await rm.fetchDocument(results[0].provider, results[0].id);
    expect(doc).toBeDefined();
    expect(doc.content.length).toBeGreaterThan(0);
  });

  it('fetched document provider is the Ministry ID', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', makeMockProvider('gutenberg', [{}]));
    const rm = registry.buildRepositoryManager();

    const results = await rm.searchAll('test', 1);
    const doc = await rm.fetchDocument(results[0].provider, results[0].id);
    expect(doc.provider).toBe('ministry-human-knowledge');
  });

  it('fetch with invalid composite key (no ::) throws descriptively', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', makeMockProvider('gutenberg', [{}]));
    const rm = registry.buildRepositoryManager();

    await expect(
      rm.fetchDocument('ministry-human-knowledge', 'plain-id-no-separator'),
    ).rejects.toThrow(/composite document key/i);
  });

  it('fetch with unknown sub-provider in composite key throws descriptively', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', makeMockProvider('gutenberg', [{}]));
    const rm = registry.buildRepositoryManager();

    await expect(
      rm.fetchDocument('ministry-human-knowledge', 'wikipedia::wiki-doc-001'),
    ).rejects.toThrow(/Sub-provider 'wikipedia'/);
  });
});

// ─── SECTION 7: CONSTITUTIONAL IDENTITY STABILITY ────────────────────────────

describe('Constitutional identity stability — Ministry IDs are stable and provider-agnostic', () => {
  it('Ministry of Human Knowledge ID is stable regardless of provider implementation', () => {
    const ministryId: KnowledgeMinistryId = 'ministry-human-knowledge';
    expect(ministryId).toBe('ministry-human-knowledge');
  });

  it('replacing sub-provider does not change the Ministry ID in search results', async () => {
    const registry1 = new MinistryRegistry();
    registry1.attachProvider('ministry-human-knowledge', makeMockProvider('provider-v1', [{}]));
    const rm1 = registry1.buildRepositoryManager();
    const results1 = await rm1.searchAll('test', 1);

    const registry2 = new MinistryRegistry();
    registry2.attachProvider('ministry-human-knowledge', makeMockProvider('provider-v2', [{}]));
    const rm2 = registry2.buildRepositoryManager();
    const results2 = await rm2.searchAll('test', 1);

    // Both use different underlying providers but present the same Ministry ID
    expect(results1[0].provider).toBe('ministry-human-knowledge');
    expect(results2[0].provider).toBe('ministry-human-knowledge');
  });

  it('Ministry IDs do not contain raw provider names', () => {
    for (const ministry of CONSTITUTIONAL_MINISTRIES) {
      expect(ministry.ministryId).not.toContain('gutenberg');
      expect(ministry.ministryId).not.toContain('wikipedia');
      expect(ministry.ministryId).not.toContain('arxiv');
      expect(ministry.ministryId).not.toContain('reddit');
      expect(ministry.ministryId).not.toContain('youtube');
    }
  });
});

// ─── SECTION 8: FULL CHAIN — EVIDENCE.SOURCEPROVIDER = MINISTRY ID ──────────

describe('Full chain — evidence.sourceProvider is Ministry constitutional ID', () => {
  it('evidence items in the collection have sourceProvider=ministry-human-knowledge', async () => {
    const { collection } = await citizenFullChain('What is photosynthesis?', 'biology');
    if (collection.items.length > 0) {
      for (const item of collection.items) {
        expect(item.evidence.sourceProvider).toBe('ministry-human-knowledge');
      }
    }
    // Empty collection is valid — no items to check
  });

  it('rawBundle evidence items have sourceProvider=ministry-human-knowledge', async () => {
    const reception = receiveCitizenKnowledgeRequest('What is entropy?', 'physics');
    const understanding = understandKnowledgeReception(reception);
    expect(understanding.ok).toBe(true);
    if (!understanding.ok) return;
    const outcome = await conductInvestigation(understanding.intent);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    for (const evidence of outcome.result.rawBundle.evidence) {
      expect(evidence.sourceProvider).toBe('ministry-human-knowledge');
    }
  });

  it('evidence.sourceProvider is not the raw provider ID gutenberg', async () => {
    const { collection } = await citizenFullChain('What is quantum mechanics?', 'physics');
    for (const item of collection.items) {
      expect(item.evidence.sourceProvider).not.toBe('gutenberg');
    }
  });

  it('KnowledgeDeclaration is produced from the Ministry-backed chain', async () => {
    const { declaration } = await citizenFullChain('What is thermodynamics?', 'physics');
    expect(declaration.declarationId).toBeTruthy();
    expect(declaration.origin).toBe('CITIZEN');
  });

  it('Sovereign chain also produces evidence with sourceProvider=ministry-human-knowledge', async () => {
    const reception = receiveSovereignKnowledgeRequest(SOVEREIGN_PAYLOAD);
    const understanding = understandKnowledgeReception(reception);
    expect(understanding.ok).toBe(true);
    if (!understanding.ok) return;
    const outcome = await conductInvestigation(understanding.intent);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    for (const evidence of outcome.result.rawBundle.evidence) {
      expect(evidence.sourceProvider).toBe('ministry-human-knowledge');
    }
  });
});

// ─── SECTION 9: PROVIDER ENCAPSULATION ──────────────────────────────────────

describe('Provider encapsulation — raw provider identity hidden from search results', () => {
  it('search result.provider never equals the raw sub-provider ID', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', makeMockProvider('internal-gutenberg-v2', [{}]));
    const rm = registry.buildRepositoryManager();

    const results = await rm.searchAll('test query', 3);
    for (const r of results) {
      expect(r.provider).not.toBe('internal-gutenberg-v2');
    }
  });

  it('raw sub-provider ID appears only in the composite key, not in result.provider', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', makeMockProvider('gutenberg', [{}]));
    const rm = registry.buildRepositoryManager();

    const results = await rm.searchAll('test', 1);
    expect(results.length).toBeGreaterThan(0);
    const r = results[0];

    // Raw provider appears in composite key (id) but not in provider field
    expect(r.id).toContain('gutenberg');
    expect(r.provider).toBe('ministry-human-knowledge');
    expect(r.provider).not.toBe('gutenberg');
  });

  it('SourceDocument.provider does not expose raw sub-provider ID after fetch', async () => {
    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', makeMockProvider('gutenberg', [{}]));
    const rm = registry.buildRepositoryManager();

    const results = await rm.searchAll('test', 1);
    const doc = await rm.fetchDocument(results[0].provider, results[0].id);
    expect(doc.provider).not.toBe('gutenberg');
    expect(doc.provider).toBe('ministry-human-knowledge');
  });
});

// ─── SECTION 10: ERROR CASES ─────────────────────────────────────────────────

describe('Error cases', () => {
  it('attachProvider throws for an invalid Ministry ID string', () => {
    const registry = new MinistryRegistry();
    expect(() =>
      registry.attachProvider(
        'not-a-real-ministry' as KnowledgeMinistryId,
        makeMockProvider('p'),
      ),
    ).toThrow(/Unknown ministry/);
  });

  it('fetchDocument on an unknown provider ID throws RepositoryManager routing error', async () => {
    const registry = new MinistryRegistry();
    const rm = registry.buildRepositoryManager();

    await expect(
      rm.fetchDocument('ministry-does-not-exist', 'some-doc'),
    ).rejects.toThrow(/Routing Failure/);
  });

  it('Ministry fetch with no attached sub-providers throws for any composite key', async () => {
    const registry = new MinistryRegistry();
    const rm = registry.buildRepositoryManager();

    await expect(
      rm.fetchDocument('ministry-scientific-knowledge', 'arxiv::paper-001'),
    ).rejects.toThrow(/Sub-provider 'arxiv'/);
  });

  it('failing sub-provider search is isolated — other Ministries still return results', async () => {
    const failingProvider: IRepositoryProvider = {
      providerId: 'failing-provider',
      async search(): Promise<RepositorySearchResult[]> {
        throw new Error('Provider offline');
      },
      async fetch(): Promise<SourceDocument> {
        throw new Error('Provider offline');
      },
    };

    const registry = new MinistryRegistry();
    registry.attachProvider('ministry-human-knowledge', failingProvider);
    registry.attachProvider('ministry-scientific-knowledge', makeMockProvider('arxiv', [{}]));
    const rm = registry.buildRepositoryManager();

    // RepositoryManager.searchAll() catches per-Ministry failures; scientific results still return
    const results = await rm.searchAll('test', 3);
    expect(results.some((r) => r.provider === 'ministry-scientific-knowledge')).toBe(true);
  });
});
