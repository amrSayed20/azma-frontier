import { randomUUID } from 'crypto';
import type { SchedulingKernelContract } from '../constitution-runtime/wp-008-types';
import type { MemoryLayerContract } from '../constitution-runtime/wp-009-types';
import type { AgentSocietyLayerContract } from '../constitution-runtime/wp-013-020-agent-society-types';
import type { IntelligenceRuntimeContract } from '../sovereign-intelligence/intelligence-runtime-contract';
import type { SovereignReportingContract } from './sovereign-command-contract';
import type { ReportSection, ReportType, SovereignReport } from './sovereign-command-types';

const REPORT_TITLES: Record<ReportType, string> = {
  DAILY: 'Daily Empire Status Report',
  WEEKLY: 'Weekly Empire Performance Report',
  MONTHLY: 'Monthly Empire Growth Report',
  EMERGENCY: 'Emergency Runtime Report',
  PERFORMANCE: 'Platform Performance Analysis',
  REVENUE: 'Revenue and Subscription Report',
  RUNTIME: 'Runtime Kernel Status Report',
  INFRASTRUCTURE: 'Infrastructure Utilization Report',
  RESOURCE_CONSUMPTION: 'Resource Consumption Report',
  AI_USAGE: 'AI Usage and Cost Report',
  KNOWLEDGE_ACTIVITY: 'Sovereign Intelligence Activity Report',
  GROWTH: 'Empire Growth Trajectory Report',
};

export class SovereignReportingService implements SovereignReportingContract {
  readonly serviceName = 'SovereignReportingService' as const;

  private readonly reports: SovereignReport[] = [];

  constructor(
    private readonly kernelLayer3: SchedulingKernelContract,
    private readonly kernelLayer4: MemoryLayerContract,
    private readonly agentSociety: AgentSocietyLayerContract,
    private readonly sovereignIntelligence: IntelligenceRuntimeContract,
  ) {}

  async generateReport(type: ReportType): Promise<SovereignReport> {
    const [queueStats, cacheStats, memSize, agents] = await Promise.all([
      this.kernelLayer3.requestQueueService.getStatistics(),
      this.kernelLayer4.stateCacheService.getStatistics(),
      this.kernelLayer4.constitutionalMemoryService.getMemorySize(),
      this.agentSociety.agentRegistryService.getActiveAgents(),
    ]);

    const now = new Date();
    const periodStart = new Date(now);
    periodStart.setHours(0, 0, 0, 0);

    const runtimeSection: ReportSection = {
      sectionId: randomUUID(),
      title: 'Runtime Kernel',
      metrics: {
        l3TotalEnqueued: queueStats.totalEnqueued,
        l4CacheEntries: cacheStats.totalEntries,
        l4CacheHitRatio: cacheStats.hitRatio,
        l4ConstitutionalMemorySize: memSize,
        l7ActiveAgents: agents.length,
        l8AvailableSources: this.sovereignIntelligence.getAvailableSources().length,
      },
    };

    const sections = this.buildSections(type, runtimeSection);

    const report: SovereignReport = {
      reportId: randomUUID(),
      type,
      generatedAt: now,
      period: { from: periodStart, to: now },
      title: REPORT_TITLES[type],
      sections,
      summary: this.buildSummary(type, runtimeSection),
    };
    this.reports.push(report);
    return report;
  }

  getRecentReports(limit = 10): readonly SovereignReport[] {
    return [...this.reports]
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime())
      .slice(0, limit);
  }

  private buildSections(
    type: ReportType,
    runtimeSection: ReportSection,
  ): readonly ReportSection[] {
    const base = [runtimeSection];

    if (type === 'RUNTIME' || type === 'DAILY' || type === 'WEEKLY' || type === 'MONTHLY') {
      return base;
    }
    if (type === 'KNOWLEDGE_ACTIVITY') {
      return [
        ...base,
        {
          sectionId: randomUUID(),
          title: 'Knowledge Sources',
          metrics: {
            availableSources: this.sovereignIntelligence.getAvailableSources().length,
            sourcesOnline: this.sovereignIntelligence
              .getAvailableSources()
              .filter((s) => s.isAvailable()).length,
          },
        },
      ];
    }
    return base;
  }

  private buildSummary(type: ReportType, runtime: ReportSection): string {
    const enqueued = runtime.metrics['l3TotalEnqueued'];
    const cacheHit = runtime.metrics['l4CacheHitRatio'];
    return `${REPORT_TITLES[type]} — ${enqueued} total operations processed, cache hit ratio ${typeof cacheHit === 'number' ? (cacheHit * 100).toFixed(1) : '0'}%.`;
  }
}
