/**
 * AZMA OS – Al-Wateen Assistant
 * File: health-engine.ts
 *
 * Core health monitoring and management.
 */

import { HealthReport } from '../types/al-wateen.types';
import { AlertSeverity, HealthCheckStatus } from '../types/al-wateen.types';
import { ILogger } from '../utils/logger';
import { ASSISTANT_CONFIG } from '../utils/constants';
import { AlWateenRegistry } from '../registry/al-wateen-registry';
import { HealthCheckRegistry } from './health-checks';
import { AlWateenHealthReporter } from './health-reporter';

export interface HealthEngine {
  startHealthMonitoring(): Promise<void>;
  stopHealthMonitoring(): Promise<void>;
  checkComponentHealth(componentId: string, componentType: string): Promise<HealthReport>;
  getLastHealthReport(componentId: string): HealthReport | undefined;
}

export class AlWateenHealthEngine implements HealthEngine {
  private isRunning: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private lastReports: Map<string, HealthReport> = new Map();
  private readonly checkRegistry: HealthCheckRegistry;
  private readonly reporter: AlWateenHealthReporter;
  private readonly componentRegistry?: AlWateenRegistry;

  constructor(private readonly logger: ILogger, componentRegistry?: AlWateenRegistry) {
    this.checkRegistry = new HealthCheckRegistry();
    this.reporter = new AlWateenHealthReporter();
    this.componentRegistry = componentRegistry;
    this.logger.info('AlWateenHealthEngine', 'Initialized');
  }

  public async startHealthMonitoring(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('AlWateenHealthEngine', 'Health monitoring already started');
      return;
    }

    this.isRunning = true;
    this.logger.info('AlWateenHealthEngine', 'Starting health monitoring');

    this.healthCheckInterval = setInterval(() => {
      this.performPeriodicHealthChecks();
    }, ASSISTANT_CONFIG.HEALTH_CHECK_INTERVAL_MS);
  }

  public async stopHealthMonitoring(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('AlWateenHealthEngine', 'Health monitoring not running');
      return;
    }

    this.isRunning = false;
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    this.logger.info('AlWateenHealthEngine', 'Stopped health monitoring');
  }

  public async checkComponentHealth(
    componentId: string,
    componentType: string
  ): Promise<HealthReport> {
    this.logger.debug('AlWateenHealthEngine', `Checking health of ${componentId}`);

    try {
      const checks = await this.checkRegistry.runAll(componentId);
      const report = this.reporter.generateReport(componentId, componentType, checks);
      this.lastReports.set(componentId, report);
      return report;
    } catch (error) {
      this.logger.error(
        'AlWateenHealthEngine',
        `Failed to check health of ${componentId}`,
        error instanceof Error ? error : undefined
      );

      return {
        componentId,
        componentType,
        status: HealthCheckStatus.UNKNOWN,
        timestamp: Date.now(),
        checks: [],
        lastUpdate: Date.now(),
        severity: AlertSeverity.ERROR,
        message: `Failed to perform health check: ${error}`
      };
    }
  }

  public getLastHealthReport(componentId: string): HealthReport | undefined {
    return this.lastReports.get(componentId);
  }

  public getCheckRegistry(): HealthCheckRegistry {
    return this.checkRegistry;
  }

  private async performPeriodicHealthChecks(): Promise<void> {
    try {
      const components = this.componentRegistry?.getAll() ?? [];

      if (components.length === 0) {
        this.logger.debug('AlWateenHealthEngine', 'No registered components available for periodic health checks');
        return;
      }

      for (const component of components) {
        const report = await this.checkComponentHealth(component.id, component.type);
        this.logger.debug('AlWateenHealthEngine', `Periodic health check completed for ${component.id}`, {
          componentId: component.id,
          componentType: component.type,
          status: report.status,
          severity: report.severity
        });
      }
    } catch (error) {
      this.logger.error(
        'AlWateenHealthEngine',
        'Error in periodic health checks',
        error instanceof Error ? error : undefined
      );
    }
  }

  public shutdown(): void {
    if (this.isRunning) {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      this.isRunning = false;
    }
    this.lastReports.clear();
  }
}
