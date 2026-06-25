/**
 * Telemetry collector and in-memory rolling buffer.
 */

import { TelemetryRecord } from '../types/al-wateen.types';
import { AL_WATEEN_CONFIG } from '../utils/constants';
import { buildId } from '../utils/ids';
import { now } from '../utils/time';

export class TelemetryCollector {
  private readonly buffer: TelemetryRecord[] = [];

  public record(
    category: string,
    event: string,
    success: boolean,
    durationMs: number,
    properties: Readonly<Record<string, unknown>> = {}
  ): TelemetryRecord {
    const record: TelemetryRecord = {
      id: buildId('telemetry'),
      category,
      event,
      timestamp: now(),
      success,
      durationMs,
      properties
    };

    this.buffer.unshift(record);
    if (this.buffer.length > AL_WATEEN_CONFIG.MAX_TELEMETRY_BUFFER) {
      this.buffer.length = AL_WATEEN_CONFIG.MAX_TELEMETRY_BUFFER;
    }

    return record;
  }

  public list(): readonly TelemetryRecord[] {
    return [...this.buffer];
  }

  public clear(): void {
    this.buffer.length = 0;
  }
}
