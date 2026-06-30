import { randomUUID } from 'crypto';
import type { SchedulingKernelContract } from '../constitution-runtime/wp-008-types';
import type { MemoryLayerContract } from '../constitution-runtime/wp-009-types';
import type { AgentSocietyLayerContract } from '../constitution-runtime/wp-013-020-agent-society-types';
import type { IntelligenceRuntimeContract } from '../sovereign-intelligence/intelligence-runtime-contract';
import type { ChamberAdapter } from '../chamber-integration/types/chamber-contracts';
import type { OsHeartbeatContract } from './sovereign-command-contract';
import type {
  ChamberHeartbeat,
  HealthStatus,
  OsHeartbeat,
} from './sovereign-command-types';

function deriveOverallStatus(chambers: readonly ChamberHeartbeat[]): HealthStatus {
  if (chambers.some((c) => c.status === 'CRITICAL')) return 'CRITICAL';
  if (chambers.some((c) => c.status === 'WARNING' || c.status === 'UNKNOWN')) return 'DEGRADED';
  if (chambers.every((c) => c.status === 'HEALTHY')) return 'HEALTHY';
  return 'UNKNOWN';
}

export class OsHeartbeatService implements OsHeartbeatContract {
  readonly serviceName = 'OsHeartbeatService' as const;

  constructor(
    private readonly kernelLayer3: SchedulingKernelContract,
    private readonly kernelLayer4: MemoryLayerContract,
    private readonly agentSociety: AgentSocietyLayerContract,
    private readonly sovereignIntelligence: IntelligenceRuntimeContract,
    private readonly getChamberAdapters: () => readonly ChamberAdapter[],
  ) {}

  async getHeartbeat(): Promise<OsHeartbeat> {
    const [queueStats, cacheStats, memSize, agents] = await Promise.all([
      this.kernelLayer3.requestQueueService.getStatistics(),
      this.kernelLayer4.stateCacheService.getStatistics(),
      this.kernelLayer4.constitutionalMemoryService.getMemorySize(),
      this.agentSociety.agentRegistryService.getActiveAgents(),
    ]);

    const queueLength = await this.kernelLayer3.requestQueueService.getCurrentQueueLength();

    const chamberAdapters = this.getChamberAdapters();
    const chamberHeartbeats: ChamberHeartbeat[] = await Promise.all(
      chamberAdapters.map(async (adapter) => {
        const health = await adapter.health();
        return {
          chamberId: health.chamberId,
          status: health.status,
          metrics: health.metrics,
          message: health.message,
        } satisfies ChamberHeartbeat;
      }),
    );

    return {
      heartbeatId: randomUUID(),
      timestamp: new Date(),
      l3Scheduling: {
        layerNumber: 3,
        queueLength,
        totalEnqueued: queueStats.totalEnqueued,
      },
      l4Memory: {
        layerNumber: 4,
        cacheEntries: cacheStats.totalEntries,
        constitutionalMemorySize: memSize,
      },
      l7AgentSociety: {
        layerNumber: 7,
        activeAgents: agents.length,
      },
      l8Intelligence: {
        layerNumber: 8,
        availableSources: this.sovereignIntelligence.getAvailableSources().length,
      },
      l10Chambers: chamberHeartbeats,
      overallStatus: deriveOverallStatus(chamberHeartbeats),
    };
  }
}
