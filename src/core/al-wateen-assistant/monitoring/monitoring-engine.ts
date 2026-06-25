/**
 * AZMA OS – Al-Wateen Assistant
 * File: monitoring-engine.ts
 *
 * Core monitoring engine for system observation.
 */

import { SystemEvent, SystemEventType, MonitoringSnapshot } from '../types/al-wateen.types';
import { ILogger } from '../utils/logger';
import { MonitoringEventBus } from './monitoring-events';
import { MonitoringRuntime } from './monitoring-runtime';

export interface MonitoringEngine {
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  captureSnapshot(): MonitoringSnapshot;
  recordSystemEvent(eventType: SystemEventType, source: string, data: Readonly<Record<string, unknown>>): void;
  getLastSnapshot(): MonitoringSnapshot | undefined;
}

export class AlWateenMonitoringEngine implements MonitoringEngine {
  private isRunning: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private lastSnapshot: MonitoringSnapshot | undefined;
  private readonly eventBus: MonitoringEventBus;
  private readonly runtime: MonitoringRuntime;

  constructor(
    private readonly logger: ILogger,
    private readonly snapshotIntervalMs: number = 10000
  ) {
    this.eventBus = new MonitoringEventBus();
    this.runtime = new MonitoringRuntime(logger);
    this.logger.info('AlWateenMonitoringEngine', 'Initialized');
  }

  public async startMonitoring(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('AlWateenMonitoringEngine', 'Monitoring already started');
      return;
    }

    this.isRunning = true;
    this.logger.info('AlWateenMonitoringEngine', 'Starting monitoring');

    this.monitoringInterval = setInterval(() => {
      this.captureAndStoreSnapshot();
    }, this.snapshotIntervalMs);
  }

  public async stopMonitoring(): Promise<void> {
    if (!this.isRunning) {
      this.logger.warn('AlWateenMonitoringEngine', 'Monitoring not running');
      return;
    }

    this.isRunning = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }

    this.logger.info('AlWateenMonitoringEngine', 'Stopped monitoring');
  }

  public captureSnapshot(): MonitoringSnapshot {
    return this.runtime.captureSnapshot();
  }

  public recordSystemEvent(
    eventType: SystemEventType,
    source: string,
    data: Readonly<Record<string, unknown>>
  ): void {
    const event: SystemEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      type: eventType,
      source,
      data,
      severity: this.mapEventTypeToSeverity(eventType),
      relatedAlerts: []
    };

    this.eventBus.emit(eventType, event);
    this.logger.debug('AlWateenMonitoringEngine', `Event recorded: ${eventType}`, { source });
  }

  public getLastSnapshot(): MonitoringSnapshot | undefined {
    return this.lastSnapshot;
  }

  public getEventBus(): MonitoringEventBus {
    return this.eventBus;
  }

  private captureAndStoreSnapshot(): void {
    this.lastSnapshot = this.captureSnapshot();
  }

  private generateEventId(): string {
    return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapEventTypeToSeverity(eventType: SystemEventType): import('../types/al-wateen.types').AlertSeverity {
    switch (eventType) {
      case SystemEventType.ERROR_OCCURRED:
      case SystemEventType.DEPENDENCY_FAILURE:
        return 'ERROR' as import('../types/al-wateen.types').AlertSeverity;
      case SystemEventType.RESOURCE_EXHAUSTED:
        return 'CRITICAL' as import('../types/al-wateen.types').AlertSeverity;
      case SystemEventType.PERFORMANCE_DEGRADED:
        return 'WARNING' as import('../types/al-wateen.types').AlertSeverity;
      default:
        return 'INFO' as import('../types/al-wateen.types').AlertSeverity;
    }
  }

  public shutdown(): void {
    if (this.isRunning) {
      this.monitoringInterval && clearInterval(this.monitoringInterval);
      this.isRunning = false;
    }
    this.eventBus.removeAllListeners();
  }
}
