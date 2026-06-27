/**
 * AZMA OS – Al-Wateen Assistant
 * File: assistant-bootstrap.ts
 *
 * Bootstrap and initialization of Al-Wateen Assistant.
 */

import { ILogger, Logger } from '../utils/logger';
import { AlWateenStateManager } from '../state/al-wateen-state';
import { AlWateenRegistry } from '../registry/al-wateen-registry';
import { AlWateenMonitoringEngine } from '../monitoring/monitoring-engine';
import { AlWateenHealthEngine } from '../health/health-engine';
import { AlWateenRecoveryEngine } from '../recovery/recovery-engine';
import { AlWateenProviderManager } from '../providers/provider-manager';
import { AlWateenTelemetryEngine } from '../telemetry/telemetry-engine';
import { AlWateenExecutiveReportEngine } from '../reports/executive-report-engine';
import { AlWateenNotificationEngine } from '../notifications/notification-engine';
import { AlWateenSchedulerEngine } from '../scheduler/scheduler-engine';
import { AssistantStatus } from '../types/al-wateen.types';

export interface BootstrapConfig {
  readonly initTimeoutMs?: number;
  readonly enableMonitoring?: boolean;
  readonly enableHealthChecks?: boolean;
  readonly enableTelemetry?: boolean;
  readonly enableReporting?: boolean;
}

export interface BootstrappedServices {
  readonly logger: ILogger;
  readonly state: AlWateenStateManager;
  readonly registry: AlWateenRegistry;
  readonly monitoring: AlWateenMonitoringEngine;
  readonly health: AlWateenHealthEngine;
  readonly recovery: AlWateenRecoveryEngine;
  readonly providers: AlWateenProviderManager;
  readonly telemetry: AlWateenTelemetryEngine;
  readonly reports: AlWateenExecutiveReportEngine;
  readonly notifications: AlWateenNotificationEngine;
  readonly scheduler: AlWateenSchedulerEngine;
}

export class AssistantBootstrap {
  public static async initialize(config: BootstrapConfig = {}): Promise<BootstrappedServices> {
    const logger = new Logger();
    logger.info('AssistantBootstrap', 'Starting initialization');

    const enableMonitoring = config.enableMonitoring !== false;
    const enableHealthChecks = config.enableHealthChecks !== false;
    const enableTelemetry = config.enableTelemetry !== false;
    const enableReporting = config.enableReporting !== false;

    try {
      const state = new AlWateenStateManager();
      logger.info('AssistantBootstrap', 'State manager initialized');

      const registry = new AlWateenRegistry();
      logger.info('AssistantBootstrap', 'Registry initialized');

      const monitoring = new AlWateenMonitoringEngine(logger);
      const health = new AlWateenHealthEngine(logger, registry);
      const recovery = new AlWateenRecoveryEngine(logger);
      const providers = new AlWateenProviderManager(logger);
      const telemetry = new AlWateenTelemetryEngine(logger);
      const reports = new AlWateenExecutiveReportEngine(logger);
      const notifications = new AlWateenNotificationEngine(logger);
      const scheduler = new AlWateenSchedulerEngine(logger);

      logger.info('AssistantBootstrap', 'All engines initialized');

      if (enableMonitoring) {
        await monitoring.startMonitoring();
        logger.info('AssistantBootstrap', 'Monitoring started');
      }

      if (enableHealthChecks) {
        await health.startHealthMonitoring();
        logger.info('AssistantBootstrap', 'Health monitoring started');
      }

      if (enableTelemetry) {
        telemetry.startAutoFlush();
        logger.info('AssistantBootstrap', 'Telemetry auto-flush started');
      }

      if (enableReporting) {
        reports.startReportScheduling();
        logger.info('AssistantBootstrap', 'Report scheduling started');
      }

      scheduler.start();
      logger.info('AssistantBootstrap', 'Scheduler started');

      state.setAssistantStatus(AssistantStatus.RUNNING);
      logger.info('AssistantBootstrap', 'Assistant status set to RUNNING');

      logger.info('AssistantBootstrap', 'Initialization completed successfully');

      return {
        logger,
        state,
        registry,
        monitoring,
        health,
        recovery,
        providers,
        telemetry,
        reports,
        notifications,
        scheduler
      };
    } catch (error) {
      logger.critical(
        'AssistantBootstrap',
        'Initialization failed',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  }

  public static async shutdown(services: BootstrappedServices): Promise<void> {
    services.logger.info('AssistantBootstrap', 'Starting shutdown');

    try {
      services.state.setAssistantStatus(AssistantStatus.SHUTDOWN);
      services.scheduler.shutdown();
      services.monitoring.shutdown();
      services.health.shutdown();
      services.recovery.shutdown();
      services.telemetry.shutdown();
      services.reports.shutdown();
      services.notifications.shutdown();

      services.logger.info('AssistantBootstrap', 'Shutdown completed successfully');
    } catch (error) {
      services.logger.critical(
        'AssistantBootstrap',
        'Error during shutdown',
        error instanceof Error ? error : undefined
      );
      throw error;
    }
  }
}
