/**
 * AZMA OS – Al-Wateen Assistant
 * File: telemetry-engine.ts
 *
 * Telemetry collection and processing.
 */

import { TelemetryRecord, ResourceMetrics } from '../types/al-wateen.types';
import { ILogger } from '../utils/logger';
import { ASSISTANT_CONFIG } from '../utils/constants';
import { InMemoryTelemetryStore, TelemetryStore } from './telemetry-storage';

export interface TelemetryEngine {
  recordEvent(category: string, event: string, properties: Readonly<Record<string, unknown>>): void;
  recordOperation(
    category: string,
    event: string,
    duration: number,
    success: boolean,
    properties?: Readonly<Record<string, unknown>>
  ): void;
  flushTelemetry(): Promise<void>;
}

export class AlWateenTelemetryEngine implements TelemetryEngine {
  private store: TelemetryStore;
  private batchQueue: TelemetryRecord[] = [];
  private flushInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly logger: ILogger,
    store?: TelemetryStore
  ) {
    this.store = store || new InMemoryTelemetryStore();
    this.logger.info('AlWateenTelemetryEngine', 'Initialized');
  }

  public recordEvent(
    category: string,
    event: string,
    properties: Readonly<Record<string, unknown>>
  ): void {
    const record: TelemetryRecord = {
      recordId: this.generateRecordId(),
      timestamp: Date.now(),
      category,
      event,
      duration: 0,
      success: true,
      properties,
      resourceMetrics: this.captureResourceMetrics()
    };

    this.enqueueRecord(record);
  }

  public recordOperation(
    category: string,
    event: string,
    duration: number,
    success: boolean,
    properties?: Readonly<Record<string, unknown>>
  ): void {
    const record: TelemetryRecord = {
      recordId: this.generateRecordId(),
      timestamp: Date.now(),
      category,
      event,
      duration,
      success,
      properties: properties || {},
      resourceMetrics: this.captureResourceMetrics()
    };

    this.enqueueRecord(record);
  }

  public async flushTelemetry(): Promise<void> {
    if (this.batchQueue.length === 0) {
      return;
    }

    try {
      this.logger.debug('AlWateenTelemetryEngine', `Flushing ${this.batchQueue.length} telemetry records`);

      const batch = this.batchQueue.splice(0, this.batchQueue.length);

      for (const record of batch) {
        this.store.save(record);
      }

      this.logger.debug('AlWateenTelemetryEngine', 'Telemetry flushed successfully');
    } catch (error) {
      this.logger.error(
        'AlWateenTelemetryEngine',
        'Error flushing telemetry',
        error instanceof Error ? error : undefined
      );

      this.batchQueue.push(...this.batchQueue);
    }
  }

  public startAutoFlush(): void {
    if (this.flushInterval) {
      return;
    }

    this.flushInterval = setInterval(() => {
      this.flushTelemetry();
    }, ASSISTANT_CONFIG.TELEMETRY_FLUSH_INTERVAL_MS);
  }

  public stopAutoFlush(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
      this.flushInterval = null;
    }
  }

  public getStore(): TelemetryStore {
    return this.store;
  }

  private enqueueRecord(record: TelemetryRecord): void {
    this.batchQueue.push(record);

    if (this.batchQueue.length >= ASSISTANT_CONFIG.TELEMETRY_BATCH_SIZE) {
      this.flushTelemetry();
    }
  }

  private generateRecordId(): string {
    return `telemetry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private captureResourceMetrics(): ResourceMetrics {
    return {
      timestamp: Date.now(),
      cpuUsage: 0,
      memoryUsage: 0,
      memoryLimit: 0,
      diskUsage: 0,
      diskLimit: 0,
      networkIn: 0,
      networkOut: 0,
      activeConnections: 0,
      openFileHandles: 0
    };
  }

  public shutdown(): void {
    this.stopAutoFlush();
    this.flushTelemetry();
  }
}
