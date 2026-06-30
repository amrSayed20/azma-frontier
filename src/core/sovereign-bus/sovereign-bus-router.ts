import { randomUUID } from 'crypto';
import type { AnySovereignEvent, SovereignEventType } from './sovereign-bus-events';
import type { SubscriptionHandle } from './sovereign-bus-contract';

interface InternalSubscription {
  readonly subscriptionId: string;
  readonly eventType: SovereignEventType | '*';
  readonly subscriberName: string;
  readonly handler: (event: AnySovereignEvent) => void | Promise<void>;
}

export class SovereignBusRouter {
  private readonly subscriptions = new Map<string, InternalSubscription>();
  private totalDelivered = 0;

  subscribe(
    eventType: SovereignEventType | '*',
    handler: (event: AnySovereignEvent) => void | Promise<void>,
    subscriberName: string,
  ): SubscriptionHandle {
    const subscriptionId = randomUUID();
    this.subscriptions.set(subscriptionId, {
      subscriptionId,
      eventType,
      subscriberName,
      handler,
    });

    return {
      subscriptionId,
      eventType,
      subscriberName,
      unsubscribe: () => {
        this.unsubscribe(subscriptionId);
      },
    };
  }

  route(event: AnySovereignEvent): void {
    for (const sub of this.subscriptions.values()) {
      if (sub.eventType !== '*' && sub.eventType !== event.eventType) continue;
      try {
        const result = sub.handler(event);
        if (result instanceof Promise) {
          result.catch(() => {
            // Handler async errors do not affect the bus or other subscribers
          });
        }
      } catch {
        // Handler sync errors do not affect the bus or other subscribers
      }
      this.totalDelivered++;
    }
  }

  unsubscribe(subscriptionId: string): void {
    this.subscriptions.delete(subscriptionId);
  }

  getSubscriptions(): readonly SubscriptionHandle[] {
    return [...this.subscriptions.values()].map((sub) => ({
      subscriptionId: sub.subscriptionId,
      eventType: sub.eventType,
      subscriberName: sub.subscriberName,
      unsubscribe: () => {
        this.unsubscribe(sub.subscriptionId);
      },
    }));
  }

  getTotalDelivered(): number {
    return this.totalDelivered;
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}
