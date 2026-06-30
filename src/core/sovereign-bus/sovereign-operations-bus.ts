import { randomUUID } from 'crypto';
import type {
  AnySovereignEvent,
  SovereignBusEvent,
  SovereignEventInput,
  SovereignEventType,
} from './sovereign-bus-events';
import type {
  ReplayFilter,
  SovereignBusBackend,
  SovereignBusContract,
  SovereignBusStats,
  SubscriptionHandle,
} from './sovereign-bus-contract';
import { SovereignBusRecorder } from './sovereign-bus-recorder';
import { SovereignBusRouter } from './sovereign-bus-router';
import { SovereignBusReplayEngine } from './sovereign-bus-replay-engine';

export class SovereignOperationsBus implements SovereignBusContract {
  readonly layerName = 'SovereignOperationsBus' as const;
  readonly version = '1.0.0' as const;
  readonly layerNumber = 2 as const;

  private readonly recorder: SovereignBusRecorder;
  private readonly router: SovereignBusRouter;
  private readonly replayEngine: SovereignBusReplayEngine;
  private readonly backend: SovereignBusBackend | null;

  constructor(backend: SovereignBusBackend | null = null) {
    this.recorder = new SovereignBusRecorder();
    this.router = new SovereignBusRouter();
    this.replayEngine = new SovereignBusReplayEngine(this.recorder);
    this.backend = backend;
  }

  publish<TType extends SovereignEventType>(
    input: SovereignEventInput<TType>,
  ): SovereignBusEvent<TType> {
    const event: SovereignBusEvent<TType> = {
      eventId: randomUUID(),
      publishedAt: new Date(),
      ...input,
    };

    this.recorder.record(event as AnySovereignEvent);
    this.router.route(event as AnySovereignEvent);

    if (this.backend !== null) {
      void this.backend.persistEvent(event as AnySovereignEvent);
    }

    return event;
  }

  subscribe<TType extends SovereignEventType>(
    eventType: TType,
    handler: (event: SovereignBusEvent<TType>) => void | Promise<void>,
    subscriberName: string,
  ): SubscriptionHandle;
  subscribe(
    eventType: '*',
    handler: (event: AnySovereignEvent) => void | Promise<void>,
    subscriberName: string,
  ): SubscriptionHandle;
  subscribe(
    eventType: SovereignEventType | '*',
    handler: (event: AnySovereignEvent) => void | Promise<void>,
    subscriberName: string,
  ): SubscriptionHandle {
    return this.router.subscribe(eventType, handler, subscriberName);
  }

  unsubscribe(subscriptionId: string): void {
    this.router.unsubscribe(subscriptionId);
  }

  replay(filter: ReplayFilter): readonly AnySovereignEvent[] {
    return this.replayEngine.replay(filter);
  }

  getEventLog(limit?: number): readonly AnySovereignEvent[] {
    return this.recorder.getLog(limit);
  }

  getSubscriptions(): readonly SubscriptionHandle[] {
    return this.router.getSubscriptions();
  }

  getStats(): SovereignBusStats {
    return {
      totalPublished: this.recorder.getTotalPublished(),
      totalDelivered: this.router.getTotalDelivered(),
      activeSubscriptions: this.router.getSubscriptionCount(),
      recordedEventCount: this.recorder.getCount(),
      lastEventAt: this.recorder.getLastEventAt(),
    };
  }
}

export function createSovereignBus(
  backend: SovereignBusBackend | null = null,
): SovereignBusContract {
  return new SovereignOperationsBus(backend);
}
