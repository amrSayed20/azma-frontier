/**
 * Layer 10 Peripheral Adapter: Hujjah Al-Damighah (Intelligence Chamber)
 *
 * LAYER CLASSIFICATION: Layer 10 (Peripheral Adapters)
 * KERNEL DEPENDENCIES: Layer 3 (Scheduling), Layer 4 (Memory)
 * CHAMBER DEPENDENCY: IntelligenceCompositionFactory (read-only delegation)
 *
 * Connects the Runtime Kernel to the Intelligence Chamber without duplicating
 * any runtime logic. All investigation operations are delegated to the
 * existing IntelligenceEngine via IntelligenceCompositionFactory.
 */

import type { ChamberAdapter, ChamberHealth, ChamberMessage } from '../types/chamber-contracts';
import type { MemoryLayerContract } from '../../constitution-runtime/wp-009-types';
import type { SchedulingKernelContract } from '../../constitution-runtime/wp-008-types';
import { createAuditTrailId, RequestPriority } from '../../constitution-runtime/wp-008-types';
import { createCacheKey } from '../../constitution-runtime/wp-009-types';
import { IntelligenceCompositionFactory } from '../../../chambers/hujjah-al-damighah';
import { buildId } from '../utils/ids';

const CHAMBER_ID = 'hujjah-al-damighah' as const;
const INVESTIGATION_TTL_MS = 5 * 60 * 1000;
const ARTICLE_ID = 'integration-with-chambers' as const;

export class HujjahAlDamighahAdapter implements ChamberAdapter {
  readonly chamberId = CHAMBER_ID;

  private active = false;
  private investigationCount = 0;
  private cacheHitCount = 0;

  constructor(
    private readonly memoryLayer: MemoryLayerContract,
    private readonly schedulingKernel: SchedulingKernelContract,
  ) {}

  async load(): Promise<void> {
    IntelligenceCompositionFactory.getEngine();
  }

  async activate(): Promise<void> {
    this.active = true;
    const auditId = createAuditTrailId(`${CHAMBER_ID}-activate-${Date.now()}`);
    await this.memoryLayer.constitutionalMemoryService.remember(
      `${CHAMBER_ID}-lifecycle`,
      ARTICLE_ID,
      'HujjahAlDamighah chamber activated and ready for investigation requests',
      auditId,
    );
  }

  async deactivate(): Promise<void> {
    this.active = false;
    const auditId = createAuditTrailId(`${CHAMBER_ID}-deactivate-${Date.now()}`);
    await this.memoryLayer.constitutionalMemoryService.remember(
      `${CHAMBER_ID}-lifecycle`,
      ARTICLE_ID,
      'HujjahAlDamighah chamber deactivated',
      auditId,
    );
  }

  async health(): Promise<ChamberHealth> {
    const cacheStats = await this.memoryLayer.stateCacheService.getStatistics();
    return {
      chamberId: CHAMBER_ID,
      status: this.active ? 'HEALTHY' : 'UNKNOWN',
      timestamp: Date.now(),
      message: this.active
        ? `Intelligence Engine operational. Investigations: ${this.investigationCount}`
        : 'Chamber not active',
      metrics: {
        investigationCount: this.investigationCount,
        cacheHitCount: this.cacheHitCount,
        cacheHitRatio: cacheStats.hitRatio,
      },
    };
  }

  async handleMessage(message: ChamberMessage): Promise<Readonly<Record<string, unknown>>> {
    if (!this.active) {
      return { success: false, error: 'Chamber not active' } as const;
    }
    if (message.operation === 'investigate') {
      return this.handleInvestigate(message);
    }
    return { success: false, error: `Unknown operation: ${message.operation}` } as const;
  }

  private async handleInvestigate(
    message: ChamberMessage,
  ): Promise<Readonly<Record<string, unknown>>> {
    const input = String(message.payload['input'] ?? '').trim();
    const category = String(message.payload['category'] ?? 'general');

    if (!input) {
      return { success: false, error: 'Missing required field: input' } as const;
    }

    // Cache-first: skip engine call if result is already warm
    const cacheKey = createCacheKey(`${CHAMBER_ID}:investigate:${input}:${category}`);
    const cached = await this.memoryLayer.stateCacheService.get(cacheKey);
    if (cached !== null) {
      this.cacheHitCount++;
      return { success: true, source: 'cache', result: cached.value } as const;
    }

    // Enqueue in scheduling kernel before executing
    const requestId = buildId('investigate');
    await this.schedulingKernel.requestQueueService.enqueue({
      requestId,
      priority: RequestPriority.NORMAL,
      constitutionArticleId: ARTICLE_ID,
      enqueuedAt: new Date(),
      expiresAt: new Date(Date.now() + 30_000),
      requestMetadata: {
        chamberId: CHAMBER_ID,
        operation: 'investigate',
        messageId: message.messageId,
      },
    });

    // Delegate all intelligence work to the existing engine
    const engine = IntelligenceCompositionFactory.getEngine();
    const bundle = await engine.investigate(input, category);
    this.investigationCount++;

    // Cache the result for subsequent identical requests
    await this.memoryLayer.stateCacheService.set(cacheKey, bundle, INVESTIGATION_TTL_MS, ARTICLE_ID);

    // Record constitutional memory entry for audit traceability
    const auditId = createAuditTrailId(`${CHAMBER_ID}-investigate-${Date.now()}`);
    await this.memoryLayer.constitutionalMemoryService.remember(
      requestId,
      ARTICLE_ID,
      `Investigation complete: "${input}" (${category}) — ${bundle.evidence.length} evidence items`,
      auditId,
    );

    return { success: true, source: 'engine', result: bundle } as const;
  }
}
