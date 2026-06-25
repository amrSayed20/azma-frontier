/**
 * Telemetry flushing orchestration.
 */

import { AL_WATEEN_CONFIG } from '../utils/constants';
import { TelemetryCollector } from './telemetry-collector';

export interface TelemetrySink {
  flush(records: readonly unknown[]): Promise<void>;
}

export class TelemetryEngine {
  private timer: NodeJS.Timeout | undefined;

  constructor(
    private readonly collector: TelemetryCollector,
    private readonly sink: TelemetrySink
  ) {}

  public start(): void {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      void this.flush();
    }, AL_WATEEN_CONFIG.TELEMETRY_FLUSH_INTERVAL_MS);
  }

  public async flush(): Promise<void> {
    const records = this.collector.list();
    if (records.length === 0) {
      return;
    }

    await this.sink.flush(records);
    this.collector.clear();
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }
}
