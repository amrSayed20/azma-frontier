import type { AnySovereignEvent } from './sovereign-bus-events';

const MAX_RECORDED_EVENTS = 10_000;

interface IndexedEvent {
  readonly event: AnySovereignEvent;
  readonly insertionIndex: number;
}

export class SovereignBusRecorder {
  private readonly indexed: IndexedEvent[] = [];
  private totalPublished = 0;
  private lastEventAt: Date | null = null;

  record(event: AnySovereignEvent): void {
    this.indexed.push({ event, insertionIndex: this.totalPublished });
    this.totalPublished++;
    this.lastEventAt = event.publishedAt;

    if (this.indexed.length > MAX_RECORDED_EVENTS) {
      this.indexed.shift();
    }
  }

  getAll(): readonly AnySovereignEvent[] {
    return this.indexed.map((e) => e.event);
  }

  getLog(limit?: number): readonly AnySovereignEvent[] {
    const sorted = [...this.indexed].sort(
      (a, b) =>
        b.event.publishedAt.getTime() - a.event.publishedAt.getTime() ||
        b.insertionIndex - a.insertionIndex,
    );
    const events = sorted.map((e) => e.event);
    return limit !== undefined ? events.slice(0, limit) : events;
  }

  getTotalPublished(): number {
    return this.totalPublished;
  }

  getCount(): number {
    return this.indexed.length;
  }

  getLastEventAt(): Date | null {
    return this.lastEventAt;
  }
}
