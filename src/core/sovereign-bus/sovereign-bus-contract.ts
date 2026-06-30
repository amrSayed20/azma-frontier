import type {
  AnySovereignEvent,
  SovereignBusEvent,
  SovereignEventInput,
  SovereignEventType,
} from './sovereign-bus-events';

// ── Subscription handle ───────────────────────────────────────────────────────

export interface SubscriptionHandle {
  readonly subscriptionId: string;
  readonly eventType: SovereignEventType | '*';
  readonly subscriberName: string;
  unsubscribe(): void;
}

// ── Replay filter ─────────────────────────────────────────────────────────────

export interface ReplayFilter {
  readonly eventType?: SovereignEventType;
  readonly sourceLayer?: number;
  readonly sourceService?: string;
  readonly correlationId?: string;
  readonly from?: Date;
  readonly to?: Date;
  readonly limit?: number;
}

// ── Bus statistics ────────────────────────────────────────────────────────────

export interface SovereignBusStats {
  readonly totalPublished: number;
  readonly totalDelivered: number;
  readonly activeSubscriptions: number;
  readonly recordedEventCount: number;
  readonly lastEventAt: Date | null;
}

// ── Extension point: distributed backend ─────────────────────────────────────

export interface SovereignBusBackend {
  readonly backendId: string;
  readonly backendType: 'in-memory' | 'distributed' | 'cloud';
  persistEvent(event: AnySovereignEvent): Promise<void>;
  loadEvents(filter: ReplayFilter): Promise<readonly AnySovereignEvent[]>;
}

// ── Main bus contract ─────────────────────────────────────────────────────────

export interface SovereignBusContract {
  readonly layerName: 'SovereignOperationsBus';
  readonly version: '1.0.0';
  readonly layerNumber: 2;

  // Publish a strongly-typed operational event
  publish<TType extends SovereignEventType>(
    input: SovereignEventInput<TType>,
  ): SovereignBusEvent<TType>;

  // Subscribe to a specific event type with full payload type inference
  subscribe<TType extends SovereignEventType>(
    eventType: TType,
    handler: (event: SovereignBusEvent<TType>) => void | Promise<void>,
    subscriberName: string,
  ): SubscriptionHandle;

  // Subscribe to all event types (wildcard)
  subscribe(
    eventType: '*',
    handler: (event: AnySovereignEvent) => void | Promise<void>,
    subscriberName: string,
  ): SubscriptionHandle;

  unsubscribe(subscriptionId: string): void;

  // Replay recorded events matching a filter (chronological order)
  replay(filter: ReplayFilter): readonly AnySovereignEvent[];

  // Return the most recent N recorded events (newest-first)
  getEventLog(limit?: number): readonly AnySovereignEvent[];

  getSubscriptions(): readonly SubscriptionHandle[];
  getStats(): SovereignBusStats;
}
