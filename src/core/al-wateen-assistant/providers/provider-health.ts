/**
 * AZMA OS – Al-Wateen Assistant
 * File: provider-health.ts
 *
 * Provider health monitoring.
 */

import { AIProvider, ProviderStatus } from '../types/al-wateen.types';
import { ILogger } from '../utils/logger';

export interface ProviderHealthMonitor {
  checkHealth(provider: AIProvider): Promise<AIProvider>;
  recordSuccess(providerId: string, responseTime: number): void;
  recordFailure(providerId: string): void;
}

export class AlWateenProviderHealthMonitor implements ProviderHealthMonitor {
  private providerMetrics: Map<
    string,
    { successCount: number; failureCount: number; totalResponseTime: number }
  > = new Map();

  constructor(private readonly logger: ILogger) {
    this.logger.info('AlWateenProviderHealthMonitor', 'Initialized');
  }

  public async checkHealth(provider: AIProvider): Promise<AIProvider> {
    try {
      this.logger.debug('AlWateenProviderHealthMonitor', `Checking health of provider: ${provider.providerId}`);

      const metrics = this.providerMetrics.get(provider.providerId) || {
        successCount: 0,
        failureCount: 0,
        totalResponseTime: 0
      };

      const totalRequests = metrics.successCount + metrics.failureCount;
      const successRate = totalRequests > 0 ? metrics.successCount / totalRequests : 1.0;
      const avgResponseTime =
        metrics.successCount > 0 ? metrics.totalResponseTime / metrics.successCount : 0;

      const status = this.determineStatus(successRate, provider.activeRequests, provider.capacity);

      return {
        ...provider,
        status,
        successRate,
        averageResponseTime: avgResponseTime,
        lastHealthCheck: Date.now()
      };
    } catch (error) {
      this.logger.error(
        'AlWateenProviderHealthMonitor',
        `Error checking health of provider: ${provider.providerId}`,
        error instanceof Error ? error : undefined
      );

      return {
        ...provider,
        status: ProviderStatus.ERROR,
        lastHealthCheck: Date.now()
      };
    }
  }

  public recordSuccess(providerId: string, responseTime: number): void {
    const metrics = this.providerMetrics.get(providerId) || {
      successCount: 0,
      failureCount: 0,
      totalResponseTime: 0
    };

    metrics.successCount++;
    metrics.totalResponseTime += responseTime;

    this.providerMetrics.set(providerId, metrics);
  }

  public recordFailure(providerId: string): void {
    const metrics = this.providerMetrics.get(providerId) || {
      successCount: 0,
      failureCount: 0,
      totalResponseTime: 0
    };

    metrics.failureCount++;
    this.providerMetrics.set(providerId, metrics);
  }

  private determineStatus(
    successRate: number,
    activeRequests: number,
    capacity: number
  ): ProviderStatus {
    if (successRate < 0.5) {
      return ProviderStatus.ERROR;
    }

    if (successRate < 0.8 || activeRequests > capacity * 0.8) {
      return ProviderStatus.DEGRADED;
    }

    if (activeRequests > 0) {
      return ProviderStatus.AVAILABLE;
    }

    return ProviderStatus.AVAILABLE;
  }
}
