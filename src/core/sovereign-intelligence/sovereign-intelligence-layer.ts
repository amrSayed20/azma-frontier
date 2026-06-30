/**
 * Sovereign Intelligence Layer — Platform Service (Layer 8)
 *
 * LAYER CLASSIFICATION: Layer 8 (Sovereign Intelligence)
 * KERNEL DEPENDENCIES: Layer 3 (Scheduling), Layer 4 (Memory)
 *
 * The sovereign platform service owned by AZMA OS.
 * Created ONCE by initializeAzmaOs() and injected into every chamber
 * that consumes intelligence. No chamber owns this layer.
 *
 * POSITION IN OS STACK:
 *   Layer 3 — Scheduling Kernel
 *   Layer 4 — Memory Layer
 *   Layer 7 — Agent Society
 *   Layer 8 — Sovereign Intelligence  ← THIS
 *   Layer 10 — Peripheral Adapters (Chambers)
 *
 * EXTENSION POINTS (NOT YET IMPLEMENTED — Technical Debt):
 *   - Sovereign Knowledge Library
 *   - Knowledge Society / Knowledge Workers
 *   - Chief Librarian / Knowledge Director
 *   - Knowledge DNA / Knowledge Graph
 *   - Continuous Learning
 *   - Specialized Brains / AI Provider Integration
 */

import type { MemoryLayerContract } from '../constitution-runtime/wp-009-types';
import type { SchedulingKernelContract } from '../constitution-runtime/wp-008-types';
import type { IntelligenceRuntimeContract } from './intelligence-runtime-contract';
import { KnowledgeSourceManager } from './knowledge-source-manager';
import { KnowledgeDomainClassifier } from './knowledge-domain-classifier';
import { SearchAgentRouter } from './search-agent-router';
import { SourceVerifier } from './source-verifier';
import { KnowledgeSummarizer } from './knowledge-summarizer';
import { KnowledgePackageBuilder } from './knowledge-package-builder';
import { SovereignIntelligenceConnector } from './sovereign-intelligence-connector';
import type { IKnowledgeSource, KnowledgePackage } from './sovereign-intelligence-types';

export class SovereignIntelligenceLayer implements IntelligenceRuntimeContract {
  readonly layerName = 'SovereignIntelligence' as const;
  readonly version = '1.0.0' as const;
  readonly layerNumber = 8 as const;

  readonly sourceManager: KnowledgeSourceManager;
  readonly domainClassifier: KnowledgeDomainClassifier;
  readonly searchRouter: SearchAgentRouter;
  readonly sourceVerifier: SourceVerifier;
  readonly summarizer: KnowledgeSummarizer;
  readonly packageBuilder: KnowledgePackageBuilder;
  readonly pipeline: SovereignIntelligenceConnector;

  constructor(
    memoryLayer: MemoryLayerContract,
    schedulingKernel: SchedulingKernelContract,
  ) {
    this.sourceManager = new KnowledgeSourceManager();
    this.domainClassifier = new KnowledgeDomainClassifier();
    this.searchRouter = new SearchAgentRouter();
    this.sourceVerifier = new SourceVerifier();
    this.summarizer = new KnowledgeSummarizer();
    this.packageBuilder = new KnowledgePackageBuilder();
    this.pipeline = new SovereignIntelligenceConnector(memoryLayer, schedulingKernel);

    // Canonical source registry at layer level
    this.sourceManager.register({
      sourceId: 'gutenberg',
      sourceName: 'Project Gutenberg',
      sourceType: 'external',
      isAvailable: () => true,
    });
  }

  process(
    query: string,
    category: string,
    requestId: string,
  ): Promise<{ readonly pkg: KnowledgePackage; readonly fromCache: boolean }> {
    return this.pipeline.process(query, category, requestId);
  }

  getAvailableSources(): readonly IKnowledgeSource[] {
    return this.sourceManager.getAvailableSources();
  }
}

export function createSovereignIntelligenceLayer(
  memoryLayer: MemoryLayerContract,
  schedulingKernel: SchedulingKernelContract,
): IntelligenceRuntimeContract {
  return new SovereignIntelligenceLayer(memoryLayer, schedulingKernel);
}
