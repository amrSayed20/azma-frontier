/**
 * Monitoring orchestration for runtime resources and events.
 */

import { ResourceMetrics } from '../types/al-wateen.types';
import { RuntimeStateStore } from '../state/runtime-state-store';
import { now } from '../utils/time';
import { RuntimeEventBus } from './event-bus';
import { ExecutionMetricsTracker } from './execution-metrics';

export class MonitoringEngine {
  constructor(
    private readonly state: RuntimeStateStore,
    private readonly bus: RuntimeEventBus,
    private readonly metricsTracker: ExecutionMetricsTracker
  ) {}

  public captureResourceMetrics(): ResourceMetrics {
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();

    return {
      timestamp: now(),
      processUptimeSec: process.uptime(),
      rssBytes: memory.rss,
      heapUsedBytes: memory.heapUsed,
      heapTotalBytes: memory.heapTotal,
      cpuUserMicros: cpu.user,
      cpuSystemMicros: cpu.system
    };
  }

  public refreshState(): void {
    this.state.updateResources(this.captureResourceMetrics());
    this.state.updateMetrics(this.metricsTracker.snapshot());
  }

  public getEventBus(): RuntimeEventBus {
    return this.bus;
  }
}
