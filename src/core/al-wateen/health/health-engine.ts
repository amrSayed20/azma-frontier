/**
 * Health monitoring engine and runtime health aggregation.
 */

import { EventType, HealthCheckResult, HealthStatus } from '../types/al-wateen.types';
import { AL_WATEEN_CONFIG, COMPONENTS } from '../utils/constants';
import { buildId } from '../utils/ids';
import { now } from '../utils/time';
import { RuntimeEventBus } from '../monitoring/event-bus';
import { HealthCheckProvider, HealthCheckRegistry } from './health-checks';

export class HealthEngine {
  private timer: NodeJS.Timeout | undefined;
  private latestResults: HealthCheckResult[] = [];

  constructor(
    private readonly registry: HealthCheckRegistry,
    private readonly bus: RuntimeEventBus
  ) {}

  public registerCheck(provider: HealthCheckProvider): void {
    this.registry.register(provider);
  }

  public async runChecks(): Promise<readonly HealthCheckResult[]> {
    const providers = this.registry.list();
    const results = await Promise.all(providers.map(provider => provider.run()));
    this.latestResults = results;

    this.bus.publish({
      id: buildId('event'),
      type: EventType.HEALTH_CHECK,
      timestamp: now(),
      source: COMPONENTS.HEALTH,
      payload: {
        total: results.length,
        critical: results.filter(result => result.status === HealthStatus.CRITICAL).length
      }
    });

    return results;
  }

  public start(): void {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      void this.runChecks();
    }, AL_WATEEN_CONFIG.HEALTH_CHECK_INTERVAL_MS);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  public currentHealth(): HealthStatus {
    if (this.latestResults.length === 0) {
      return HealthStatus.UNKNOWN;
    }

    const critical = this.latestResults.some(result => result.status === HealthStatus.CRITICAL);
    if (critical) {
      return HealthStatus.CRITICAL;
    }

    const warning = this.latestResults.some(result => result.status === HealthStatus.WARNING);
    if (warning) {
      return HealthStatus.WARNING;
    }

    return HealthStatus.HEALTHY;
  }

  public latest(): readonly HealthCheckResult[] {
    return [...this.latestResults];
  }
}
