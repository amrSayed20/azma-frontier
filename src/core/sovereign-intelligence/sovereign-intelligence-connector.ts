/**
 * Sovereign Intelligence Layer — Sovereign Intelligence Connector (Component 7)
 *
 * Bridges the Sovereign Intelligence Layer to the AZMA OS Runtime Kernel.
 * Integrates with:
 *   - Layer 3 Scheduling Kernel (enqueues intelligence requests)
 *   - Layer 4 Memory Layer (cache-first + constitutional memory recording)
 *   - Hujjah Al-Damighah Intelligence Engine (via IntelligenceCompositionFactory)
 *
 * Reuses existing runtime contracts. Does not duplicate runtime logic.
 */

import type { MemoryLayerContract } from '../constitution-runtime/wp-009-types';
import type { SchedulingKernelContract } from '../constitution-runtime/wp-008-types';
import { createAuditTrailId, RequestPriority } from '../constitution-runtime/wp-008-types';
import { createCacheKey } from '../constitution-runtime/wp-009-types';
import { IntelligenceCompositionFactory } from '../../chambers/hujjah-al-damighah';
import { KnowledgePackageBuilder } from './knowledge-package-builder';
import { KnowledgeSourceManager } from './knowledge-source-manager';
import type { IKnowledgeSource, KnowledgePackage } from './sovereign-intelligence-types';

const ARTICLE_ID = 'integration-with-chambers' as const;
const PACKAGE_TTL_MS = 5 * 60 * 1000;

export class SovereignIntelligenceConnector {
  readonly serviceName = 'KnowledgePipeline' as const;

  private readonly packageBuilder = new KnowledgePackageBuilder();
  private readonly sourceManager: KnowledgeSourceManager;

  constructor(
    private readonly memoryLayer: MemoryLayerContract,
    private readonly schedulingKernel: SchedulingKernelContract,
  ) {
    this.sourceManager = new KnowledgeSourceManager();
    this.sourceManager.register({
      sourceId: 'gutenberg',
      sourceName: 'Project Gutenberg',
      sourceType: 'external',
      isAvailable: () => true,
    });
  }

  async process(
    query: string,
    category: string,
    requestId: string,
  ): Promise<{ readonly pkg: KnowledgePackage; readonly fromCache: boolean }> {
    const cacheKey = createCacheKey(`sovereign-intelligence:${query}:${category}`);
    const cached = await this.memoryLayer.stateCacheService.get<KnowledgePackage>(cacheKey);
    if (cached !== null) {
      return { pkg: cached.value, fromCache: true };
    }

    await this.schedulingKernel.requestQueueService.enqueue({
      requestId,
      priority: RequestPriority.NORMAL,
      constitutionArticleId: ARTICLE_ID,
      enqueuedAt: new Date(),
      expiresAt: new Date(Date.now() + 30_000),
      requestMetadata: {
        layer: 'SovereignIntelligence',
        operation: 'process',
        query,
        category,
      },
    });

    const engine = IntelligenceCompositionFactory.getEngine();
    const rawBundle = await engine.investigate(query, category);

    const pkg = this.packageBuilder.build(query, rawBundle);

    await this.memoryLayer.stateCacheService.set(cacheKey, pkg, PACKAGE_TTL_MS, ARTICLE_ID);

    const auditId = createAuditTrailId(`sovereign-intelligence-${Date.now()}`);
    await this.memoryLayer.constitutionalMemoryService.remember(
      requestId,
      ARTICLE_ID,
      `Knowledge package built: domain="${pkg.domain}", workflow="${pkg.workflow}", evidence=${pkg.verifiedEvidence.length}`,
      auditId,
    );

    return { pkg, fromCache: false };
  }

  getAvailableSources(): readonly IKnowledgeSource[] {
    return this.sourceManager.getAvailableSources();
  }
}
