/**
 * Typed runtime event bus.
 */

import { EventType, RuntimeEvent } from '../types/al-wateen.types';

export type EventPayload = Readonly<Record<string, unknown>>;
export type EventListener = (event: RuntimeEvent<EventPayload>) => void;

export class RuntimeEventBus {
  private readonly listeners = new Map<EventType, Set<EventListener>>();

  constructor() {
    for (const eventType of Object.values(EventType)) {
      this.listeners.set(eventType, new Set<EventListener>());
    }
  }

  public subscribe(eventType: EventType, listener: EventListener): () => void {
    const set = this.listeners.get(eventType);
    if (!set) {
      throw new Error(`Unsupported event type: ${eventType}`);
    }

    set.add(listener);
    return () => this.unsubscribe(eventType, listener);
  }

  public unsubscribe(eventType: EventType, listener: EventListener): void {
    const set = this.listeners.get(eventType);
    set?.delete(listener);
  }

  public publish(event: RuntimeEvent<EventPayload>): void {
    const set = this.listeners.get(event.type);
    if (!set) {
      return;
    }

    for (const listener of set) {
      listener(event);
    }
  }
}
