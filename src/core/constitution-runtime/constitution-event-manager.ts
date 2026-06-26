import { ConstitutionEventRecord, ConstitutionEventType, ConstitutionModuleOwner } from './constitution-types';

type ConstitutionEventListener = (event: ConstitutionEventRecord) => void;

export class ConstitutionEventManager {
  private readonly listeners = new Map<ConstitutionEventType, Set<ConstitutionEventListener>>();
  private readonly events: ConstitutionEventRecord[] = [];

  public publish(event: Omit<ConstitutionEventRecord, 'eventId' | 'timestamp'>): ConstitutionEventRecord {
    const record: ConstitutionEventRecord = {
      ...event,
      eventId: `constitution-event-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      timestamp: new Date(),
    };

    this.events.push(record);
    this.listeners.get(record.eventType)?.forEach((listener) => listener(record));
    return record;
  }

  public publishSystemEvent(
    eventType: ConstitutionEventType,
    source: ConstitutionModuleOwner,
    payload: Readonly<Record<string, unknown>>,
    actionId?: string,
    articleId?: ConstitutionEventRecord['articleId']
  ): ConstitutionEventRecord {
    return this.publish({ eventType, source, payload, actionId, articleId });
  }

  public subscribe(eventType: ConstitutionEventType, listener: ConstitutionEventListener): () => void {
    const listeners = this.listeners.get(eventType) ?? new Set<ConstitutionEventListener>();
    listeners.add(listener);
    this.listeners.set(eventType, listeners);

    return () => {
      const current = this.listeners.get(eventType);
      current?.delete(listener);
      if (current && current.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  public list(): readonly ConstitutionEventRecord[] {
    return [...this.events];
  }

  public getEvents(): readonly ConstitutionEventRecord[] {
    return this.list();
  }
}
