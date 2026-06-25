/**
 * Event bridge for chamber-originated events.
 */

import { buildId } from '../utils/ids';
import { ChamberBridge, ChamberEvent, ChamberEventType, ChamberHealth } from '../types/chamber-contracts';

export type ChamberEventListener = (event: ChamberEvent<Readonly<Record<string, unknown>>>) => void;

export class ChamberEventBridge implements ChamberBridge {
  private readonly listeners = new Set<ChamberEventListener>();

  public subscribe(listener: ChamberEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public publishEvent<TPayload extends Readonly<Record<string, unknown>>>(event: ChamberEvent<TPayload>): void {
    const normalized: ChamberEvent<Readonly<Record<string, unknown>>> = {
      ...event,
      eventId: event.eventId || buildId('chamber-event')
    };

    for (const listener of this.listeners) {
      listener(normalized);
    }
  }

  public publishHealth(_health: ChamberHealth): void {
    throw new Error('Health publication is handled by ChamberHealthBridge');
  }

  public bridgeMessage(
    chamberId: string,
    payload: Readonly<Record<string, unknown>>
  ): ChamberEvent<Readonly<Record<string, unknown>>> {
    return {
      eventId: buildId('chamber-event'),
      chamberId,
      type: ChamberEventType.MESSAGE,
      timestamp: Date.now(),
      payload
    };
  }
}
