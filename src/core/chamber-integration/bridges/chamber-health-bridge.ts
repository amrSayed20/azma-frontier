/**
 * Health bridge for chamber health propagation into core.
 */

import { ChamberBridge, ChamberEvent, ChamberHealth } from '../types/chamber-contracts';

export type ChamberHealthListener = (health: ChamberHealth) => void;

export class ChamberHealthBridge implements ChamberBridge {
  private readonly listeners = new Set<ChamberHealthListener>();

  public subscribe(listener: ChamberHealthListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public publishHealth(health: ChamberHealth): void {
    for (const listener of this.listeners) {
      listener(health);
    }
  }

  public publishEvent<TPayload extends Readonly<Record<string, unknown>>>(
    _event: ChamberEvent<TPayload>
  ): void {
    throw new Error('Event publication is handled by ChamberEventBridge');
  }
}
