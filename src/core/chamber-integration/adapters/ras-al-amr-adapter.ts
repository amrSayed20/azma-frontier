/**
 * Layer 10 Peripheral Adapter: Ras Al-Amr (Sovereign Assembly Chamber)
 *
 * LAYER CLASSIFICATION: Layer 10 (Peripheral Adapters)
 * KERNEL DEPENDENCIES: Layer 3 (Scheduling), Layer 4 (Memory)
 * CHAMBER DEPENDENCY: RasAlAmrStateManager (stateless delegation)
 *
 * Connects the Runtime Kernel to the Ras Al-Amr canvas assembly engine.
 * RasAlAmrStateManager is a pure stateless transformer — callers own the
 * SovereignCanvas and pass it with each mutation payload. No state is held
 * inside the adapter beyond lifecycle counters.
 */

import type { ChamberAdapter, ChamberHealth, ChamberMessage } from '../types/chamber-contracts';
import type { MemoryLayerContract } from '../../constitution-runtime/wp-009-types';
import type { SchedulingKernelContract } from '../../constitution-runtime/wp-008-types';
import { createAuditTrailId, RequestPriority } from '../../constitution-runtime/wp-008-types';
import { RasAlAmrStateManager } from '../../../chambers/ras-al-amr/ras-al-amr-state-manager';
import type { SovereignCanvas } from '../../../chambers/ras-al-amr/assembly-contracts';
import type { CanvasMutationPayload } from '../../../chambers/ras-al-amr/assembly-directive-payloads';
import { buildId } from '../utils/ids';

const CHAMBER_ID = 'ras-al-amr' as const;
const ARTICLE_ID = 'integration-with-chambers' as const;

export class RasAlAmrAdapter implements ChamberAdapter {
  readonly chamberId = CHAMBER_ID;

  private active = false;
  private mutationCount = 0;
  private readonly stateManager = new RasAlAmrStateManager();

  constructor(
    private readonly memoryLayer: MemoryLayerContract,
    private readonly schedulingKernel: SchedulingKernelContract,
  ) {}

  async load(): Promise<void> {
    // RasAlAmrStateManager is instantiated in the field initializer — no async work needed
    void this.stateManager;
  }

  async activate(): Promise<void> {
    this.active = true;
    const auditId = createAuditTrailId(`${CHAMBER_ID}-activate-${Date.now()}`);
    await this.memoryLayer.constitutionalMemoryService.remember(
      `${CHAMBER_ID}-lifecycle`,
      ARTICLE_ID,
      'Ras Al-Amr chamber activated and ready for canvas assembly operations',
      auditId,
    );
  }

  async deactivate(): Promise<void> {
    this.active = false;
    const auditId = createAuditTrailId(`${CHAMBER_ID}-deactivate-${Date.now()}`);
    await this.memoryLayer.constitutionalMemoryService.remember(
      `${CHAMBER_ID}-lifecycle`,
      ARTICLE_ID,
      'Ras Al-Amr chamber deactivated',
      auditId,
    );
  }

  async health(): Promise<ChamberHealth> {
    return {
      chamberId: CHAMBER_ID,
      status: this.active ? 'HEALTHY' : 'UNKNOWN',
      timestamp: Date.now(),
      message: this.active
        ? `Assembly Engine operational. Mutations applied: ${this.mutationCount}`
        : 'Chamber not active',
      metrics: {
        mutationCount: this.mutationCount,
      },
    };
  }

  async handleMessage(message: ChamberMessage): Promise<Readonly<Record<string, unknown>>> {
    if (!this.active) {
      return { success: false, error: 'Chamber not active' } as const;
    }
    if (message.operation === 'apply-mutation') {
      return this.handleApplyMutation(message);
    }
    return { success: false, error: `Unknown operation: ${message.operation}` } as const;
  }

  private async handleApplyMutation(
    message: ChamberMessage,
  ): Promise<Readonly<Record<string, unknown>>> {
    const canvas = message.payload['canvas'] as SovereignCanvas | undefined;
    const mutation = message.payload['mutation'] as CanvasMutationPayload | undefined;

    if (!canvas || !mutation) {
      return {
        success: false,
        error: 'Missing required fields: canvas and mutation',
      } as const;
    }

    const requestId = buildId(`${CHAMBER_ID}-apply-mutation`);
    await this.schedulingKernel.requestQueueService.enqueue({
      requestId,
      priority: RequestPriority.NORMAL,
      constitutionArticleId: ARTICLE_ID,
      enqueuedAt: new Date(),
      expiresAt: new Date(Date.now() + 30_000),
      requestMetadata: {
        chamberId: CHAMBER_ID,
        operation: 'apply-mutation',
        canvasId: canvas.canvasId,
        actionType: mutation.actionType,
        messageId: message.messageId,
      },
    });

    try {
      const updatedCanvas = this.stateManager.applyMutation(canvas, mutation);
      this.mutationCount++;

      const auditId = createAuditTrailId(`${CHAMBER_ID}-mutation-${Date.now()}`);
      await this.memoryLayer.constitutionalMemoryService.remember(
        requestId,
        ARTICLE_ID,
        `Canvas mutation applied: ${mutation.actionType} on canvas "${canvas.canvasId}"`,
        auditId,
      );

      return { success: true, canvas: updatedCanvas } as const;
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Mutation failed',
      } as const;
    }
  }
}
