/**
 * Layer 10 Peripheral Adapter: Hujjah Al-Damighah (Intelligence Chamber)
 *
 * LAYER CLASSIFICATION: Layer 10 (Peripheral Adapters)
 * KERNEL DEPENDENCIES: Layer 3 (Scheduling), Layer 4 (Memory)
 * CHAMBER DEPENDENCY: SovereignIntelligenceConnector (delegates to IntelligenceEngine)
 *
 * Connects the Runtime Kernel to the Sovereign Intelligence Layer without
 * duplicating any runtime logic. All investigation operations are routed
 * through the SovereignIntelligenceConnector which orchestrates classification,
 * routing, verification, summarization, and packaging.
 */

import type { ChamberAdapter, ChamberHealth, ChamberMessage } from '../types/chamber-contracts';
import type { MemoryLayerContract } from '../../constitution-runtime/wp-009-types';
import type { SchedulingKernelContract } from '../../constitution-runtime/wp-008-types';
import { createAuditTrailId } from '../../constitution-runtime/wp-008-types';
import { SovereignIntelligenceConnector } from '../../sovereign-intelligence/sovereign-intelligence-connector';
import { buildId } from '../utils/ids';

const CHAMBER_ID = 'hujjah-al-damighah' as const;
const ARTICLE_ID = 'integration-with-chambers' as const;

export class HujjahAlDamighahAdapter implements ChamberAdapter {
  readonly chamberId = CHAMBER_ID;

  private active = false;
  private investigationCount = 0;
  private cacheHitCount = 0;
  private readonly connector: SovereignIntelligenceConnector;

  constructor(
    private readonly memoryLayer: MemoryLayerContract,
    private readonly schedulingKernel: SchedulingKernelContract,
  ) {
    this.connector = new SovereignIntelligenceConnector(memoryLayer, schedulingKernel);
  }

  async load(): Promise<void> {
    // Warm connector sources — engine singleton initialized on first process() call
    this.connector.getAvailableSources();
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
        availableSources: this.connector.getAvailableSources().length,
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

    const requestId = buildId('investigate');
    const { pkg, fromCache } = await this.connector.process(input, category, requestId);

    if (fromCache) {
      this.cacheHitCount++;
    } else {
      this.investigationCount++;
    }

    return {
      success: true,
      source: fromCache ? 'cache' : 'engine',
      result: pkg,
    } as const;
  }
}
