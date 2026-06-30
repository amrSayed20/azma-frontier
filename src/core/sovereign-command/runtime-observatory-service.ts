import { randomUUID } from 'crypto';
import type { RuntimeObservatoryContract } from './sovereign-command-contract';
import type { RuntimeEvent, RuntimeEventType } from './sovereign-command-types';

const MAX_RING_BUFFER_SIZE = 1_000;

interface IndexedEvent {
  readonly event: RuntimeEvent;
  readonly insertionIndex: number;
}

export class RuntimeObservatoryService implements RuntimeObservatoryContract {
  readonly serviceName = 'RuntimeObservatoryService' as const;

  private readonly events: IndexedEvent[] = [];
  private totalEventCount = 0;

  recordEvent(event: Omit<RuntimeEvent, 'eventId' | 'timestamp'>): void {
    const runtimeEvent: RuntimeEvent = {
      eventId: randomUUID(),
      timestamp: new Date(),
      ...event,
    };
    this.events.push({ event: runtimeEvent, insertionIndex: this.totalEventCount });
    this.totalEventCount++;

    if (this.events.length > MAX_RING_BUFFER_SIZE) {
      this.events.shift();
    }
  }

  getRecentEvents(limit = 50): readonly RuntimeEvent[] {
    const sorted = [...this.events].sort(
      (a, b) =>
        b.event.timestamp.getTime() - a.event.timestamp.getTime() ||
        b.insertionIndex - a.insertionIndex,
    );
    return sorted.slice(0, limit).map((e) => e.event);
  }

  getEventCount(): number {
    return this.totalEventCount;
  }

  getEventsByType(type: RuntimeEventType): readonly RuntimeEvent[] {
    return this.events.filter((e) => e.event.eventType === type).map((e) => e.event);
  }
}
