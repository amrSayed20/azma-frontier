/**
 * Layer 10 Peripheral Adapter: Sovereign High Council (Governance Runtime)
 *
 * LAYER CLASSIFICATION: Layer 10 (Peripheral Adapters)
 * KERNEL DEPENDENCIES: Layer 3 (Scheduling), Layer 4 (Memory)
 * CHAMBER DEPENDENCY: CouncilRuntime (injected — caller owns instantiation)
 *
 * Connects the Runtime Kernel to the Sovereign High Council governance runtime.
 * CouncilRuntime requires three complex upstream dependencies (AlWateen, Doctrine,
 * FutureSimulation) and is therefore injected rather than constructed here.
 * The adapter delegates all governance operations without duplicating any logic.
 */

import type { ChamberAdapter, ChamberHealth, ChamberMessage } from '../types/chamber-contracts';
import type { MemoryLayerContract } from '../../constitution-runtime/wp-009-types';
import type { SchedulingKernelContract } from '../../constitution-runtime/wp-008-types';
import { createAuditTrailId, RequestPriority } from '../../constitution-runtime/wp-008-types';
import { createCacheKey } from '../../constitution-runtime/wp-009-types';
import type { CouncilRuntime } from '../../sovereign-high-council-runtime/council-runtime';
import type { CouncilRuntimeInput } from '../../sovereign-high-council-runtime/runtime-types';
import { buildId } from '../utils/ids';

const CHAMBER_ID = 'sovereign-high-council' as const;
const SYNC_CACHE_TTL_MS = 60 * 1000;
const SNAPSHOT_CACHE_TTL_MS = 15 * 1000;
const ARTICLE_ID = 'sovereign-high-council' as const;

export class SovereignHighCouncilAdapter implements ChamberAdapter {
  readonly chamberId = CHAMBER_ID;

  private active = false;
  private synchronizationCount = 0;

  constructor(
    private readonly councilRuntime: CouncilRuntime,
    private readonly memoryLayer: MemoryLayerContract,
    private readonly schedulingKernel: SchedulingKernelContract,
  ) {}

  async load(): Promise<void> {
    // CouncilRuntime is fully constructed before injection — verify via snapshot
    void this.councilRuntime.snapshot();
  }

  async activate(): Promise<void> {
    this.active = true;
    const auditId = createAuditTrailId(`${CHAMBER_ID}-activate-${Date.now()}`);
    await this.memoryLayer.constitutionalMemoryService.remember(
      `${CHAMBER_ID}-lifecycle`,
      ARTICLE_ID,
      'Sovereign High Council activated and ready for governance synchronization',
      auditId,
    );
  }

  async deactivate(): Promise<void> {
    this.active = false;
    const auditId = createAuditTrailId(`${CHAMBER_ID}-deactivate-${Date.now()}`);
    await this.memoryLayer.constitutionalMemoryService.remember(
      `${CHAMBER_ID}-lifecycle`,
      ARTICLE_ID,
      'Sovereign High Council deactivated',
      auditId,
    );
  }

  async health(): Promise<ChamberHealth> {
    const runtimeSnapshot = this.councilRuntime.snapshot();
    return {
      chamberId: CHAMBER_ID,
      status: this.active ? 'HEALTHY' : 'UNKNOWN',
      timestamp: Date.now(),
      message: this.active
        ? `Council Runtime operational. Synchronizations: ${this.synchronizationCount}`
        : 'Chamber not active',
      metrics: {
        synchronizationCount: this.synchronizationCount,
        totalSessions: runtimeSnapshot.state.totalSessions,
        totalSynchronizations: runtimeSnapshot.state.totalSynchronizations,
      },
    };
  }

  async handleMessage(message: ChamberMessage): Promise<Readonly<Record<string, unknown>>> {
    if (!this.active) {
      return { success: false, error: 'Chamber not active' } as const;
    }

    switch (message.operation) {
      case 'synchronize-session':
        return this.handleSynchronizeSession(message);
      case 'latest-synchronization':
        return this.handleLatestSynchronization();
      case 'snapshot':
        return this.handleSnapshot();
      default:
        return { success: false, error: `Unknown operation: ${message.operation}` } as const;
    }
  }

  private async handleSynchronizeSession(
    message: ChamberMessage,
  ): Promise<Readonly<Record<string, unknown>>> {
    const founderId = String(message.payload['founderId'] ?? '').trim();
    const founderIntent = String(message.payload['founderIntent'] ?? '').trim();
    const simulationPathCount = Number(message.payload['simulationPathCount'] ?? 3);

    if (!founderId || !founderIntent) {
      return {
        success: false,
        error: 'Missing required fields: founderId and founderIntent',
      } as const;
    }

    const requestId = buildId(`${CHAMBER_ID}-sync`);
    await this.schedulingKernel.requestQueueService.enqueue({
      requestId,
      priority: RequestPriority.HIGH,
      constitutionArticleId: ARTICLE_ID,
      enqueuedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      requestMetadata: {
        chamberId: CHAMBER_ID,
        operation: 'synchronize-session',
        founderId,
        messageId: message.messageId,
      },
    });

    try {
      const input: CouncilRuntimeInput = {
        founderId,
        founderIntent,
        simulationPathCount,
        trigger: message.payload['trigger'] as CouncilRuntimeInput['trigger'],
        actionContext: message.payload['actionContext'] as CouncilRuntimeInput['actionContext'],
      };

      const result = this.councilRuntime.synchronizeFounderSession(input);
      this.synchronizationCount++;

      // Cache latest synchronization result for quick retrieval
      const cacheKey = createCacheKey(`${CHAMBER_ID}:latest-synchronization`);
      await this.memoryLayer.stateCacheService.set(
        cacheKey,
        result,
        SYNC_CACHE_TTL_MS,
        ARTICLE_ID,
      );

      const auditId = createAuditTrailId(`${CHAMBER_ID}-sync-${Date.now()}`);
      await this.memoryLayer.constitutionalMemoryService.remember(
        requestId,
        ARTICLE_ID,
        `Council synchronization complete for founder "${founderId}": ${result.synchronizationId}`,
        auditId,
      );

      return { success: true, synchronizationId: result.synchronizationId, result } as const;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Synchronization failed',
      } as const;
    }
  }

  private async handleLatestSynchronization(): Promise<Readonly<Record<string, unknown>>> {
    const cacheKey = createCacheKey(`${CHAMBER_ID}:latest-synchronization`);
    const cached = await this.memoryLayer.stateCacheService.get(cacheKey);
    if (cached !== null) {
      return { success: true, source: 'cache', result: cached.value } as const;
    }

    const result = this.councilRuntime.latestSynchronization();
    return result
      ? { success: true, source: 'live', result }
      : { success: true, source: 'live', result: null };
  }

  private async handleSnapshot(): Promise<Readonly<Record<string, unknown>>> {
    const cacheKey = createCacheKey(`${CHAMBER_ID}:snapshot`);
    const cached = await this.memoryLayer.stateCacheService.get(cacheKey);
    if (cached !== null) {
      return { success: true, source: 'cache', snapshot: cached.value } as const;
    }

    const snapshot = this.councilRuntime.snapshot();
    await this.memoryLayer.stateCacheService.set(
      cacheKey,
      snapshot,
      SNAPSHOT_CACHE_TTL_MS,
      ARTICLE_ID,
    );
    return { success: true, source: 'live', snapshot } as const;
  }
}
