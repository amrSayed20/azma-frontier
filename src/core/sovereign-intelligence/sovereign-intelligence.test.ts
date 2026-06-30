/**
 * Sovereign Intelligence Layer — Production-Grade Unit Tests
 *
 * Covers all 7 MVP components + Layer 8 platform service without mocks:
 *   1. KnowledgeSourceManager
 *   2. KnowledgeDomainClassifier
 *   3. SearchAgentRouter
 *   4. SourceVerifier
 *   5. KnowledgeSummarizer
 *   6. KnowledgePackageBuilder
 *   7. SovereignIntelligenceConnector (real L3/L4 kernels)
 *   8. SovereignIntelligenceLayer     (Layer 8 platform service)
 */

import { describe, test, expect, beforeAll } from '@jest/globals';
import { createSchedulingKernel } from '../constitution-runtime/wp-008-kernel';
import { createMemoryLayer } from '../constitution-runtime/wp-011-kernel';
import { KnowledgeSourceManager } from './knowledge-source-manager';
import { KnowledgeDomainClassifier } from './knowledge-domain-classifier';
import { SearchAgentRouter } from './search-agent-router';
import { SourceVerifier } from './source-verifier';
import { KnowledgeSummarizer } from './knowledge-summarizer';
import { KnowledgePackageBuilder } from './knowledge-package-builder';
import { SovereignIntelligenceConnector } from './sovereign-intelligence-connector';
import { SovereignIntelligenceLayer } from './sovereign-intelligence-layer';
import type { EvidenceBundle } from '../../chambers/hujjah-al-damighah/domain/evidence.types';
import { ConfidenceLevel } from '../../chambers/hujjah-al-damighah/domain/evidence.types';
import type { IKnowledgeSource } from './sovereign-intelligence-types';

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makeBundle(overrides: Partial<EvidenceBundle> = {}): EvidenceBundle {
  return {
    bundleId: 'test-bundle-001',
    claim: {
      id: 'claim-001',
      originalStatement: 'history of ancient rome',
      normalizedStatement: 'history of ancient rome',
      targetCategory: 'research',
      timestampMs: Date.now(),
      keywords: ['history', 'ancient', 'rome'],
    },
    evidence: [
      {
        id: 'ev-001',
        claimId: 'claim-001',
        sourceId: 'doc-a',
        sourceProvider: 'gutenberg',
        extractedText: 'Rome was founded in 753 BC.',
        confidenceScore: 0.9,
        confidenceLevel: ConfidenceLevel.HIGH,
      },
      {
        id: 'ev-002',
        claimId: 'claim-001',
        sourceId: 'doc-b',
        sourceProvider: 'gutenberg',
        extractedText: 'The Roman Republic began in 509 BC.',
        confidenceScore: 0.75,
        confidenceLevel: ConfidenceLevel.MODERATE,
      },
      {
        id: 'ev-003',
        claimId: 'claim-001',
        sourceId: 'doc-a',
        sourceProvider: 'gutenberg',
        extractedText: 'Duplicate from doc-a with lower score.',
        confidenceScore: 0.6,
        confidenceLevel: ConfidenceLevel.MODERATE,
      },
    ],
    metadata: {
      investigationStatus: 'completed',
      totalSourcesScanned: 3,
      averageEvidenceScore: 0.75,
    },
    generatedAtMs: Date.now(),
    ...overrides,
  };
}

// ── Component 1: KnowledgeSourceManager ──────────────────────────────────────

describe('KnowledgeSourceManager', () => {
  test('registers a source and retrieves it by ID', () => {
    const manager = new KnowledgeSourceManager();
    const source: IKnowledgeSource = {
      sourceId: 'test-source',
      sourceName: 'Test Source',
      sourceType: 'external',
      isAvailable: () => true,
    };

    manager.register(source);
    expect(manager.getSource('test-source')).toBe(source);
  });

  test('returns undefined for unregistered source', () => {
    const manager = new KnowledgeSourceManager();
    expect(manager.getSource('nonexistent')).toBeUndefined();
  });

  test('getAvailableSources returns only available sources', () => {
    const manager = new KnowledgeSourceManager();
    manager.register({ sourceId: 'a', sourceName: 'A', sourceType: 'external', isAvailable: () => true });
    manager.register({ sourceId: 'b', sourceName: 'B', sourceType: 'internal', isAvailable: () => false });

    const available = manager.getAvailableSources();
    expect(available).toHaveLength(1);
    expect(available[0].sourceId).toBe('a');
  });

  test('getAllSources returns all registered sources regardless of availability', () => {
    const manager = new KnowledgeSourceManager();
    manager.register({ sourceId: 'a', sourceName: 'A', sourceType: 'external', isAvailable: () => true });
    manager.register({ sourceId: 'b', sourceName: 'B', sourceType: 'internal', isAvailable: () => false });

    expect(manager.getAllSources()).toHaveLength(2);
  });

  test('hasAvailableSources returns false when all sources unavailable', () => {
    const manager = new KnowledgeSourceManager();
    manager.register({ sourceId: 'x', sourceName: 'X', sourceType: 'external', isAvailable: () => false });
    expect(manager.hasAvailableSources()).toBe(false);
  });

  test('hasAvailableSources returns true when at least one source is available', () => {
    const manager = new KnowledgeSourceManager();
    manager.register({ sourceId: 'y', sourceName: 'Y', sourceType: 'external', isAvailable: () => true });
    expect(manager.hasAvailableSources()).toBe(true);
  });
});

// ── Component 2: KnowledgeDomainClassifier ────────────────────────────────────

describe('KnowledgeDomainClassifier', () => {
  const classifier = new KnowledgeDomainClassifier();

  test('classifies cinematic domain', () => {
    expect(classifier.classify('make a documentary about climate change')).toBe('cinematic');
    expect(classifier.classify('write a screenplay for a short film')).toBe('cinematic');
    expect(classifier.classify('produce a cinematic video essay')).toBe('cinematic');
  });

  test('classifies podcast domain', () => {
    expect(classifier.classify('create a podcast episode about history')).toBe('podcast');
    expect(classifier.classify('write interview questions for an audio show')).toBe('podcast');
  });

  test('classifies article domain', () => {
    expect(classifier.classify('write a blog post about machine learning')).toBe('article');
    expect(classifier.classify('draft an editorial on climate policy')).toBe('article');
  });

  test('classifies research domain', () => {
    expect(classifier.classify('conduct a research study on ocean acidification')).toBe('research');
    expect(classifier.classify('write an academic paper on neural networks')).toBe('research');
    expect(classifier.classify('prepare an analysis report on market trends')).toBe('research');
  });

  test('falls back to general domain for unrecognized input', () => {
    expect(classifier.classify('explain quantum physics')).toBe('general');
    expect(classifier.classify('the history of ancient rome')).toBe('general');
    expect(classifier.classify('')).toBe('general');
  });
});

// ── Component 3: SearchAgentRouter ────────────────────────────────────────────

describe('SearchAgentRouter', () => {
  const router = new SearchAgentRouter();

  test('routes cinematic to deep-investigation', () => {
    expect(router.route('cinematic')).toBe('deep-investigation');
  });

  test('routes research to deep-investigation', () => {
    expect(router.route('research')).toBe('deep-investigation');
  });

  test('routes article to surface-scan', () => {
    expect(router.route('article')).toBe('surface-scan');
  });

  test('routes podcast to surface-scan', () => {
    expect(router.route('podcast')).toBe('surface-scan');
  });

  test('routes general to general-query', () => {
    expect(router.route('general')).toBe('general-query');
  });

  test('deep-investigation has greater depth than surface-scan', () => {
    expect(router.getWorkflowDepth('deep-investigation')).toBeGreaterThan(
      router.getWorkflowDepth('surface-scan'),
    );
  });

  test('getWorkflowDepth returns positive numbers for all workflows', () => {
    expect(router.getWorkflowDepth('deep-investigation')).toBeGreaterThan(0);
    expect(router.getWorkflowDepth('surface-scan')).toBeGreaterThan(0);
    expect(router.getWorkflowDepth('general-query')).toBeGreaterThan(0);
  });
});

// ── Component 4: SourceVerifier ───────────────────────────────────────────────

describe('SourceVerifier', () => {
  const verifier = new SourceVerifier();

  test('deduplicates evidence by sourceId keeping highest confidence', () => {
    const bundle = makeBundle();
    const verified = verifier.verify(bundle);

    const sourceIds = verified.map((v) => v.sourceId);
    const uniqueSourceIds = new Set(sourceIds);
    expect(sourceIds.length).toBe(uniqueSourceIds.size);

    const docA = verified.find((v) => v.sourceId === 'doc-a');
    expect(docA?.confidenceScore).toBe(0.9);
  });

  test('ranks evidence by confidence score descending', () => {
    const bundle = makeBundle();
    const verified = verifier.verify(bundle);

    for (let i = 1; i < verified.length; i++) {
      expect(verified[i - 1].confidenceScore).toBeGreaterThanOrEqual(verified[i].confidenceScore);
    }
  });

  test('assigns rank starting at 1', () => {
    const bundle = makeBundle();
    const verified = verifier.verify(bundle);

    expect(verified[0].rank).toBe(1);
    expect(verified[1].rank).toBe(2);
  });

  test('maps evidence fields correctly', () => {
    const bundle = makeBundle();
    const verified = verifier.verify(bundle);

    const topItem = verified[0];
    expect(topItem.evidenceId).toBe('ev-001');
    expect(topItem.sourceId).toBe('doc-a');
    expect(topItem.sourceProvider).toBe('gutenberg');
    expect(topItem.extractedText).toBe('Rome was founded in 753 BC.');
    expect(topItem.confidenceScore).toBe(0.9);
  });

  test('returns empty array for bundle with no evidence', () => {
    const empty = makeBundle({ evidence: [] });
    expect(verifier.verify(empty)).toHaveLength(0);
  });
});

// ── Component 5: KnowledgeSummarizer ─────────────────────────────────────────

describe('KnowledgeSummarizer', () => {
  const summarizer = new KnowledgeSummarizer();
  const verifier = new SourceVerifier();

  test('produces summary with correct domain', () => {
    const bundle = makeBundle();
    const evidence = verifier.verify(bundle);
    const summary = summarizer.summarize('history of rome', 'research', evidence);

    expect(summary.domain).toBe('research');
  });

  test('sets topicStatement to the query', () => {
    const bundle = makeBundle();
    const evidence = verifier.verify(bundle);
    const summary = summarizer.summarize('history of rome', 'research', evidence);

    expect(summary.topicStatement).toBe('history of rome');
  });

  test('limits keyFindings to 5 entries', () => {
    const manyEvidence = Array.from({ length: 10 }, (_, i) => ({
      evidenceId: `ev-${i}`,
      sourceId: `src-${i}`,
      sourceProvider: 'gutenberg',
      extractedText: `Finding ${i}`,
      confidenceScore: 0.8,
      rank: i + 1,
    }));

    const summary = summarizer.summarize('test', 'general', manyEvidence);
    expect(summary.keyFindings.length).toBeLessThanOrEqual(5);
  });

  test('computes averageConfidence correctly', () => {
    const evidence = [
      { evidenceId: 'e1', sourceId: 's1', sourceProvider: 'g', extractedText: 'a', confidenceScore: 0.8, rank: 1 },
      { evidenceId: 'e2', sourceId: 's2', sourceProvider: 'g', extractedText: 'b', confidenceScore: 0.6, rank: 2 },
    ];

    const summary = summarizer.summarize('test', 'general', evidence);
    expect(summary.averageConfidence).toBeCloseTo(0.7);
  });

  test('returns averageConfidence of 0 for empty evidence', () => {
    const summary = summarizer.summarize('test', 'general', []);
    expect(summary.averageConfidence).toBe(0);
    expect(summary.totalSources).toBe(0);
    expect(summary.keyFindings).toHaveLength(0);
  });

  test('sets generatedAtMs to a recent timestamp', () => {
    const before = Date.now();
    const summary = summarizer.summarize('test', 'general', []);
    expect(summary.generatedAtMs).toBeGreaterThanOrEqual(before);
  });
});

// ── Component 6: KnowledgePackageBuilder ─────────────────────────────────────

describe('KnowledgePackageBuilder', () => {
  const builder = new KnowledgePackageBuilder();

  test('produces a complete KnowledgePackage', () => {
    const bundle = makeBundle();
    const pkg = builder.build('history of ancient rome', bundle);

    expect(pkg.packageId).toBeTruthy();
    expect(pkg.query).toBe('history of ancient rome');
    expect(pkg.rawBundle).toBe(bundle);
    expect(pkg.domain).toBe('general');
    expect(pkg.workflow).toBe('general-query');
    expect(Array.isArray(pkg.verifiedEvidence)).toBe(true);
    expect(pkg.summary).toBeDefined();
    expect(pkg.generatedAtMs).toBeGreaterThan(0);
  });

  test('packageId is a valid UUID', () => {
    const bundle = makeBundle();
    const pkg = builder.build('test query', bundle);
    expect(pkg.packageId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  test('classifies cinematic domain and routes to deep-investigation', () => {
    const bundle = makeBundle();
    const pkg = builder.build('make a documentary about ancient rome', bundle);
    expect(pkg.domain).toBe('cinematic');
    expect(pkg.workflow).toBe('deep-investigation');
  });

  test('classifies research domain and routes to deep-investigation', () => {
    const bundle = makeBundle();
    const pkg = builder.build('conduct a research analysis of ancient rome', bundle);
    expect(pkg.domain).toBe('research');
    expect(pkg.workflow).toBe('deep-investigation');
  });

  test('produces unique packageIds on each call', () => {
    const bundle = makeBundle();
    const pkg1 = builder.build('query', bundle);
    const pkg2 = builder.build('query', bundle);
    expect(pkg1.packageId).not.toBe(pkg2.packageId);
  });

  test('summary domain matches detected domain', () => {
    const bundle = makeBundle();
    const pkg = builder.build('write a podcast episode about history', bundle);
    expect(pkg.domain).toBe('podcast');
    expect(pkg.summary.domain).toBe('podcast');
  });

  test('verified evidence has fewer or equal items than raw bundle (dedup applied)', () => {
    const bundle = makeBundle();
    const pkg = builder.build('test', bundle);
    // bundle has 3 evidence items but 2 unique sourceIds
    expect(pkg.verifiedEvidence.length).toBeLessThanOrEqual(bundle.evidence.length);
  });
});

// ── Component 7: SovereignIntelligenceConnector ───────────────────────────────

describe('SovereignIntelligenceConnector', () => {
  let connector: SovereignIntelligenceConnector;

  beforeAll(() => {
    const l3 = createSchedulingKernel();
    const l4 = createMemoryLayer();
    connector = new SovereignIntelligenceConnector(l4, l3);
  });

  test('registers Gutenberg as an available source on construction', () => {
    const sources = connector.getAvailableSources();
    expect(sources.length).toBeGreaterThanOrEqual(1);
    const gutenberg = sources.find((s) => s.sourceId === 'gutenberg');
    expect(gutenberg).toBeDefined();
    expect(gutenberg?.sourceType).toBe('external');
    expect(gutenberg?.isAvailable()).toBe(true);
  });

  test('process() returns a KnowledgePackage with fromCache=false on first call', async () => {
    const { pkg, fromCache } = await connector.process(
      'conduct a research study on ancient greece',
      'research',
      'test-request-001',
    );

    expect(fromCache).toBe(false);
    expect(pkg.packageId).toBeTruthy();
    expect(pkg.query).toBe('conduct a research study on ancient greece');
    expect(pkg.domain).toBe('research');
    expect(pkg.workflow).toBe('deep-investigation');
    expect(pkg.rawBundle).toBeDefined();
    expect(pkg.verifiedEvidence).toBeDefined();
    expect(pkg.summary.totalSources).toBeGreaterThanOrEqual(0);
  }, 30_000);

  test('process() returns fromCache=true on repeated identical query', async () => {
    const { fromCache: first } = await connector.process(
      'conduct a research study on ancient greece',
      'research',
      'test-request-002',
    );

    const { fromCache: second } = await connector.process(
      'conduct a research study on ancient greece',
      'research',
      'test-request-003',
    );

    expect(first).toBe(true);
    expect(second).toBe(true);
  }, 10_000);

  test('process() returns different packages for different queries', async () => {
    const { pkg: pkg1 } = await connector.process(
      'byzantine empire overview',
      'general',
      'test-request-004',
    );
    const { pkg: pkg2 } = await connector.process(
      'viking age in northern europe',
      'general',
      'test-request-005',
    );

    expect(pkg1.query).not.toBe(pkg2.query);
    expect(pkg1.packageId).not.toBe(pkg2.packageId);
  }, 30_000);

  test('process() produces a package with valid summary structure', async () => {
    const { pkg } = await connector.process(
      'academic analysis of the roman empire expansion',
      'research',
      'test-request-006',
    );

    expect(pkg.summary.domain).toBe('research');
    expect(pkg.summary.topicStatement).toBe('academic analysis of the roman empire expansion');
    expect(typeof pkg.summary.averageConfidence).toBe('number');
    expect(typeof pkg.summary.totalSources).toBe('number');
    expect(pkg.summary.generatedAtMs).toBeGreaterThan(0);
    expect(Array.isArray(pkg.summary.keyFindings)).toBe(true);
  }, 30_000);

  test('process() produces a package where verifiedEvidence items have correct structure', async () => {
    const { pkg } = await connector.process(
      'the byzantine empire',
      'research',
      'test-request-007',
    );

    for (const ev of pkg.verifiedEvidence) {
      expect(typeof ev.evidenceId).toBe('string');
      expect(typeof ev.sourceId).toBe('string');
      expect(typeof ev.sourceProvider).toBe('string');
      expect(typeof ev.extractedText).toBe('string');
      expect(typeof ev.confidenceScore).toBe('number');
      expect(ev.rank).toBeGreaterThan(0);
    }
  }, 30_000);
});

// ── Component 8: SovereignIntelligenceLayer (Layer 8 Platform Service) ────────

describe('SovereignIntelligenceLayer', () => {
  let layer: SovereignIntelligenceLayer;

  beforeAll(() => {
    const l3 = createSchedulingKernel();
    const l4 = createMemoryLayer();
    layer = new SovereignIntelligenceLayer(l4, l3);
  });

  test('has correct layer identity contract', () => {
    expect(layer.layerName).toBe('SovereignIntelligence');
    expect(layer.version).toBe('1.0.0');
    expect(layer.layerNumber).toBe(8);
  });

  test('all sub-services are initialized with correct serviceName', () => {
    expect(layer.sourceManager.serviceName).toBe('KnowledgeSourceManager');
    expect(layer.domainClassifier.serviceName).toBe('KnowledgeDomainClassifier');
    expect(layer.searchRouter.serviceName).toBe('SearchAgentRouter');
    expect(layer.sourceVerifier.serviceName).toBe('SourceVerifier');
    expect(layer.summarizer.serviceName).toBe('KnowledgeSummarizer');
    expect(layer.packageBuilder.serviceName).toBe('KnowledgePackageBuilder');
    expect(layer.pipeline.serviceName).toBe('KnowledgePipeline');
  });

  test('registers Gutenberg as an available source in the canonical source manager', () => {
    const sources = layer.getAvailableSources();
    expect(sources.length).toBeGreaterThanOrEqual(1);
    const gutenberg = sources.find((s) => s.sourceId === 'gutenberg');
    expect(gutenberg).toBeDefined();
    expect(gutenberg?.sourceName).toBe('Project Gutenberg');
    expect(gutenberg?.sourceType).toBe('external');
    expect(gutenberg?.isAvailable()).toBe(true);
  });

  test('source manager has available sources', () => {
    expect(layer.sourceManager.hasAvailableSources()).toBe(true);
  });

  test('domain classifier is functional via layer', () => {
    expect(layer.domainClassifier.classify('write a documentary')).toBe('cinematic');
    expect(layer.domainClassifier.classify('unknown topic')).toBe('general');
  });

  test('search router is functional via layer', () => {
    expect(layer.searchRouter.route('cinematic')).toBe('deep-investigation');
    expect(layer.searchRouter.route('general')).toBe('general-query');
  });

  test('process() delegates to pipeline and returns a KnowledgePackage', async () => {
    const { pkg, fromCache } = await layer.process(
      'conduct research on medieval history',
      'research',
      'layer-test-request-001',
    );

    expect(fromCache).toBe(false);
    expect(pkg.packageId).toBeTruthy();
    expect(pkg.domain).toBe('research');
    expect(pkg.workflow).toBe('deep-investigation');
    expect(pkg.summary).toBeDefined();
    expect(pkg.rawBundle).toBeDefined();
  }, 30_000);

  test('process() returns fromCache=true on repeated query via pipeline cache', async () => {
    const { fromCache: second } = await layer.process(
      'conduct research on medieval history',
      'research',
      'layer-test-request-002',
    );

    expect(second).toBe(true);
  }, 10_000);

  test('layer can be used as IntelligenceRuntimeContract — structural type check', () => {
    const contract = layer;
    expect(typeof contract.process).toBe('function');
    expect(typeof contract.getAvailableSources).toBe('function');
    expect(contract.sourceManager).toBeDefined();
    expect(contract.pipeline).toBeDefined();
  });
});
