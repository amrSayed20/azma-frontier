/**
 * Layer 10 Peripheral Adapter: Qiyamah Chamber (Genesis Execution Chamber)
 *
 * LAYER CLASSIFICATION: Layer 10 (Peripheral Adapters)
 * KERNEL DEPENDENCIES: Layer 3 (Scheduling), Layer 4 (Memory)
 * CHAMBER DEPENDENCY: qiyamahController + qiyamahState singletons (read-only delegation)
 *
 * Connects the Runtime Kernel to the Qiyamah Chamber. All project lifecycle
 * operations are delegated to the existing QiyamahController and QiyamahState
 * singletons — no runtime logic is duplicated here.
 */

import type { ChamberAdapter, ChamberHealth, ChamberMessage } from '../types/chamber-contracts';
import type { MemoryLayerContract } from '../../constitution-runtime/wp-009-types';
import type { SchedulingKernelContract } from '../../constitution-runtime/wp-008-types';
import { createAuditTrailId, RequestPriority } from '../../constitution-runtime/wp-008-types';
import { createCacheKey } from '../../constitution-runtime/wp-009-types';
import { qiyamahController, qiyamahState } from '../../../chambers/qiyamah';
import { buildId } from '../utils/ids';

const CHAMBER_ID = 'qiyamah-chamber' as const;
const STATE_CACHE_TTL_MS = 30 * 1000;
const ARTICLE_ID = 'integration-with-chambers' as const;

export class QiyamahAdapter implements ChamberAdapter {
  readonly chamberId = CHAMBER_ID;

  private active = false;
  private operationCount = 0;

  constructor(
    private readonly memoryLayer: MemoryLayerContract,
    private readonly schedulingKernel: SchedulingKernelContract,
  ) {}

  async load(): Promise<void> {
    // Verify chamber singletons are initialised (no-op if already constructed)
    void qiyamahController;
    void qiyamahState;
  }

  async activate(): Promise<void> {
    this.active = true;
    const auditId = createAuditTrailId(`${CHAMBER_ID}-activate-${Date.now()}`);
    await this.memoryLayer.constitutionalMemoryService.remember(
      `${CHAMBER_ID}-lifecycle`,
      ARTICLE_ID,
      'Qiyamah Chamber activated and ready for genesis project operations',
      auditId,
    );
  }

  async deactivate(): Promise<void> {
    this.active = false;
    const auditId = createAuditTrailId(`${CHAMBER_ID}-deactivate-${Date.now()}`);
    await this.memoryLayer.constitutionalMemoryService.remember(
      `${CHAMBER_ID}-lifecycle`,
      ARTICLE_ID,
      'Qiyamah Chamber deactivated',
      auditId,
    );
  }

  async health(): Promise<ChamberHealth> {
    const state = qiyamahState.getState();
    return {
      chamberId: CHAMBER_ID,
      status: this.active ? 'HEALTHY' : 'UNKNOWN',
      timestamp: Date.now(),
      message: this.active
        ? `Genesis Chamber operational. Project status: ${state.status}`
        : 'Chamber not active',
      metrics: {
        operationCount: this.operationCount,
        hasPlan: state.plannerOutput !== null ? 1 : 0,
        hasIdea: state.idea.length > 0 ? 1 : 0,
      },
    };
  }

  async handleMessage(message: ChamberMessage): Promise<Readonly<Record<string, unknown>>> {
    if (!this.active) {
      return { success: false, error: 'Chamber not active' } as const;
    }

    switch (message.operation) {
      case 'get-state':
        return this.handleGetState();
      case 'update-project-input':
        return this.handleUpdateProjectInput(message);
      case 'generate-plan':
        return this.handleGeneratePlan(message);
      case 'approve-project':
        return this.handleApproveProject(message);
      case 'reset':
        return this.handleReset(message);
      default:
        return { success: false, error: `Unknown operation: ${message.operation}` } as const;
    }
  }

  private async handleGetState(): Promise<Readonly<Record<string, unknown>>> {
    const cacheKey = createCacheKey(`${CHAMBER_ID}:get-state`);
    const cached = await this.memoryLayer.stateCacheService.get(cacheKey);
    if (cached !== null) {
      return { success: true, source: 'cache', state: cached.value } as const;
    }

    const state = qiyamahState.getState();
    await this.memoryLayer.stateCacheService.set(cacheKey, state, STATE_CACHE_TTL_MS, ARTICLE_ID);
    return { success: true, source: 'live', state } as const;
  }

  private async handleUpdateProjectInput(
    message: ChamberMessage,
  ): Promise<Readonly<Record<string, unknown>>> {
    const idea = String(message.payload['idea'] ?? '').trim();
    const basePrompt = String(message.payload['basePrompt'] ?? '').trim();

    if (!idea) {
      return { success: false, error: 'Missing required field: idea' } as const;
    }

    await this.enqueue(message, RequestPriority.NORMAL);
    qiyamahController.updateProjectInput(idea, basePrompt);
    this.operationCount++;

    // Invalidate state cache after mutation
    await this.memoryLayer.stateCacheService.invalidate(
      createCacheKey(`${CHAMBER_ID}:get-state`),
    );

    return { success: true, idea, basePrompt } as const;
  }

  private async handleGeneratePlan(
    message: ChamberMessage,
  ): Promise<Readonly<Record<string, unknown>>> {
    const requestId = await this.enqueue(message, RequestPriority.HIGH);

    try {
      await qiyamahController.generateProductionPlan();
      this.operationCount++;

      const state = qiyamahState.getState();
      await this.memoryLayer.stateCacheService.invalidate(
        createCacheKey(`${CHAMBER_ID}:get-state`),
      );

      const auditId = createAuditTrailId(`${CHAMBER_ID}-plan-${Date.now()}`);
      await this.memoryLayer.constitutionalMemoryService.remember(
        requestId,
        ARTICLE_ID,
        `Qiyamah production plan generated for idea: "${state.idea}"`,
        auditId,
      );

      return { success: true, status: state.status, plan: state.plannerOutput } as const;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Plan generation failed',
      } as const;
    }
  }

  private async handleApproveProject(
    message: ChamberMessage,
  ): Promise<Readonly<Record<string, unknown>>> {
    await this.enqueue(message, RequestPriority.HIGH);

    try {
      qiyamahController.approveProject();
      this.operationCount++;

      await this.memoryLayer.stateCacheService.invalidate(
        createCacheKey(`${CHAMBER_ID}:get-state`),
      );

      const auditId = createAuditTrailId(`${CHAMBER_ID}-approve-${Date.now()}`);
      await this.memoryLayer.constitutionalMemoryService.remember(
        message.messageId,
        ARTICLE_ID,
        'Qiyamah project approved and ready for genesis execution',
        auditId,
      );

      return { success: true, status: 'approved' } as const;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Approval failed',
      } as const;
    }
  }

  private async handleReset(
    message: ChamberMessage,
  ): Promise<Readonly<Record<string, unknown>>> {
    await this.enqueue(message, RequestPriority.NORMAL);
    qiyamahState.reset();
    this.operationCount++;

    await this.memoryLayer.stateCacheService.invalidate(
      createCacheKey(`${CHAMBER_ID}:get-state`),
    );

    return { success: true, status: 'idle' } as const;
  }

  private async enqueue(message: ChamberMessage, priority: RequestPriority): Promise<string> {
    const requestId = buildId(`${CHAMBER_ID}-${message.operation}`);
    await this.schedulingKernel.requestQueueService.enqueue({
      requestId,
      priority,
      constitutionArticleId: ARTICLE_ID,
      enqueuedAt: new Date(),
      expiresAt: new Date(Date.now() + 30_000),
      requestMetadata: {
        chamberId: CHAMBER_ID,
        operation: message.operation,
        messageId: message.messageId,
      },
    });
    return requestId;
  }
}
