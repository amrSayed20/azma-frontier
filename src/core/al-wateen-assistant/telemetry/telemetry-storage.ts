/**
 * AZMA OS – Al-Wateen Assistant
 * File: telemetry-storage.ts
 *
 * Telemetry data storage and retrieval.
 */

import { TelemetryRecord } from '../types/al-wateen.types';

export interface TelemetryStore {
  save(record: TelemetryRecord): void;
  get(recordId: string): TelemetryRecord | undefined;
  getByCategory(category: string): readonly TelemetryRecord[];
  getByTimeRange(start: number, end: number): readonly TelemetryRecord[];
  clear(): void;
  size(): number;
}

export class InMemoryTelemetryStore implements TelemetryStore {
  private records: Map<string, TelemetryRecord> = new Map();
  private categoryIndex: Map<string, string[]> = new Map();
  private maxSize: number = 10000;

  constructor(maxSize: number = 10000) {
    this.maxSize = maxSize;
  }

  public save(record: TelemetryRecord): void {
    if (this.records.size >= this.maxSize) {
      this.evictOldestRecord();
    }

    this.records.set(record.recordId, record);

    const categoryIds = this.categoryIndex.get(record.category) || [];
    if (!categoryIds.includes(record.recordId)) {
      this.categoryIndex.set(record.category, [...categoryIds, record.recordId]);
    }
  }

  public get(recordId: string): TelemetryRecord | undefined {
    return this.records.get(recordId);
  }

  public getByCategory(category: string): readonly TelemetryRecord[] {
    const ids = this.categoryIndex.get(category) || [];
    return ids
      .map(id => this.records.get(id))
      .filter((record): record is TelemetryRecord => record !== undefined);
  }

  public getByTimeRange(start: number, end: number): readonly TelemetryRecord[] {
    return Array.from(this.records.values()).filter(r => r.timestamp >= start && r.timestamp <= end);
  }

  public clear(): void {
    this.records.clear();
    this.categoryIndex.clear();
  }

  public size(): number {
    return this.records.size;
  }

  private evictOldestRecord(): void {
    let oldest: TelemetryRecord | undefined;
    let oldestId: string | undefined;

    this.records.forEach((record, id) => {
      if (!oldest || record.timestamp < oldest.timestamp) {
        oldest = record;
        oldestId = id;
      }
    });

    if (oldestId && oldest) {
      this.records.delete(oldestId);
      const categoryIds = this.categoryIndex.get(oldest.category) || [];
      this.categoryIndex.set(
        oldest.category,
        categoryIds.filter(id => id !== oldestId)
      );
    }
  }
}
