import type { AnySovereignEvent } from './sovereign-bus-events';
import type { ReplayFilter } from './sovereign-bus-contract';
import type { SovereignBusRecorder } from './sovereign-bus-recorder';

export class SovereignBusReplayEngine {
  constructor(private readonly recorder: SovereignBusRecorder) {}

  replay(filter: ReplayFilter): readonly AnySovereignEvent[] {
    let events = [...this.recorder.getAll()];

    if (filter.eventType !== undefined) {
      const eventType = filter.eventType;
      events = events.filter((e) => e.eventType === eventType);
    }
    if (filter.sourceLayer !== undefined) {
      const layer = filter.sourceLayer;
      events = events.filter((e) => e.sourceLayer === layer);
    }
    if (filter.sourceService !== undefined) {
      const service = filter.sourceService;
      events = events.filter((e) => e.sourceService === service);
    }
    if (filter.correlationId !== undefined) {
      const correlationId = filter.correlationId;
      events = events.filter((e) => e.correlationId === correlationId);
    }
    if (filter.from !== undefined) {
      const from = filter.from.getTime();
      events = events.filter((e) => e.publishedAt.getTime() >= from);
    }
    if (filter.to !== undefined) {
      const to = filter.to.getTime();
      events = events.filter((e) => e.publishedAt.getTime() <= to);
    }

    // Replay order is chronological (oldest first) for event sourcing
    events.sort((a, b) => a.publishedAt.getTime() - b.publishedAt.getTime());

    if (filter.limit !== undefined) {
      events = events.slice(0, filter.limit);
    }

    return events;
  }
}
