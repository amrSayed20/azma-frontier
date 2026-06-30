/**
 * Sovereign Operations Bus — Production-Grade Tests
 *
 * Covers all four internal components + the full bus contract:
 *   1. SovereignBusRecorder
 *   2. SovereignBusRouter
 *   3. SovereignBusReplayEngine
 *   4. SovereignOperationsBus (full contract)
 *   5. Typed event publishing and handler inference
 *   6. Distributed backend extension point
 */

import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import type { AnySovereignEvent, SovereignBusEvent } from './sovereign-bus-events';
import type { SovereignBusBackend } from './sovereign-bus-contract';
import { SovereignBusRecorder } from './sovereign-bus-recorder';
import { SovereignBusRouter } from './sovereign-bus-router';
import { SovereignBusReplayEngine } from './sovereign-bus-replay-engine';
import { SovereignOperationsBus, createSovereignBus } from './sovereign-operations-bus';

// ── Fixtures ─────────────────────────────────────────────────────────────────

function runtimeStartedInput() {
  return {
    eventType: 'RUNTIME_STARTED' as const,
    sourceLayer: 2 as const,
    sourceService: 'AzmaOsBootstrap',
    correlationId: null,
    payload: { version: '1.0.0', startedAt: new Date(), activeChambers: ['hujjah-al-damighah'] },
  };
}

function chamberActivatedInput(chamberId = 'qiyamah-chamber') {
  return {
    eventType: 'CHAMBER_ACTIVATED' as const,
    sourceLayer: 10 as const,
    sourceService: 'ChamberLoader',
    correlationId: null,
    payload: { chamberId },
  };
}

function incidentDetectedInput() {
  return {
    eventType: 'INCIDENT_DETECTED' as const,
    sourceLayer: 9 as const,
    sourceService: 'IncidentIntelligenceService',
    correlationId: 'corr-001',
    payload: {
      incidentId: 'inc-001',
      chamberId: 'ras-al-amr',
      severity: 'HIGH',
      what: 'Chamber latency exceeded threshold',
    },
  };
}

function predictionInput() {
  return {
    eventType: 'PREDICTION_GENERATED' as const,
    sourceLayer: 9 as const,
    sourceService: 'PredictiveCommandService',
    correlationId: null,
    payload: {
      predictionId: 'pred-001',
      subject: 'QUEUE_CONGESTION',
      severity: 'WARNING',
      confidence: 0.75,
      estimatedTimeToEventMs: 120_000,
    },
  };
}

// ── Component 1: SovereignBusRecorder ────────────────────────────────────────

describe('SovereignBusRecorder', () => {
  let recorder: SovereignBusRecorder;

  beforeEach(() => {
    recorder = new SovereignBusRecorder();
  });

  test('starts with zero events', () => {
    expect(recorder.getCount()).toBe(0);
    expect(recorder.getTotalPublished()).toBe(0);
    expect(recorder.getLastEventAt()).toBeNull();
    expect(recorder.getAll()).toHaveLength(0);
  });

  test('record increments counters', () => {
    const bus = new SovereignOperationsBus();
    const event = bus.publish(runtimeStartedInput());
    const rawEvent = event as AnySovereignEvent;

    const r = new SovereignBusRecorder();
    r.record(rawEvent);

    expect(r.getCount()).toBe(1);
    expect(r.getTotalPublished()).toBe(1);
    expect(r.getLastEventAt()).toBeInstanceOf(Date);
  });

  test('getLog returns events newest-first', () => {
    const bus = new SovereignOperationsBus();
    const e1 = bus.publish(runtimeStartedInput()) as AnySovereignEvent;
    const e2 = bus.publish(chamberActivatedInput()) as AnySovereignEvent;

    recorder.record(e1);
    recorder.record(e2);

    const log = recorder.getLog();
    expect(log[0]!.eventId).toBe(e2.eventId);
    expect(log[1]!.eventId).toBe(e1.eventId);
  });

  test('getLog respects limit parameter', () => {
    const bus = new SovereignOperationsBus();
    for (let i = 0; i < 5; i++) {
      recorder.record(bus.publish(chamberActivatedInput(`chamber-${i}`)) as AnySovereignEvent);
    }
    expect(recorder.getLog(3)).toHaveLength(3);
  });

  test('getAll returns all events in insertion order', () => {
    const bus = new SovereignOperationsBus();
    const e1 = bus.publish(runtimeStartedInput()) as AnySovereignEvent;
    const e2 = bus.publish(chamberActivatedInput()) as AnySovereignEvent;

    recorder.record(e1);
    recorder.record(e2);

    const all = recorder.getAll();
    expect(all[0]!.eventId).toBe(e1.eventId);
    expect(all[1]!.eventId).toBe(e2.eventId);
  });
});

// ── Component 2: SovereignBusRouter ──────────────────────────────────────────

describe('SovereignBusRouter', () => {
  let router: SovereignBusRouter;

  beforeEach(() => {
    router = new SovereignBusRouter();
  });

  test('subscribe returns a SubscriptionHandle', () => {
    const handle = router.subscribe('CHAMBER_ACTIVATED', () => {}, 'test-subscriber');
    expect(handle.subscriptionId).toBeTruthy();
    expect(handle.eventType).toBe('CHAMBER_ACTIVATED');
    expect(handle.subscriberName).toBe('test-subscriber');
    expect(typeof handle.unsubscribe).toBe('function');
  });

  test('route delivers event to matching subscriber', () => {
    const bus = new SovereignOperationsBus();
    const received: AnySovereignEvent[] = [];
    router.subscribe('CHAMBER_ACTIVATED', (e) => { received.push(e); }, 'collector');

    const event = bus.publish(chamberActivatedInput()) as AnySovereignEvent;
    router.route(event);

    expect(received).toHaveLength(1);
    expect(received[0]!.eventType).toBe('CHAMBER_ACTIVATED');
  });

  test('route does not deliver event to non-matching subscriber', () => {
    const bus = new SovereignOperationsBus();
    const received: AnySovereignEvent[] = [];
    router.subscribe('RUNTIME_STARTED', (e) => { received.push(e); }, 'collector');

    const event = bus.publish(chamberActivatedInput()) as AnySovereignEvent;
    router.route(event);

    expect(received).toHaveLength(0);
  });

  test('wildcard subscriber receives all event types', () => {
    const bus = new SovereignOperationsBus();
    const received: AnySovereignEvent[] = [];
    router.subscribe('*', (e) => { received.push(e); }, 'wildcard');

    router.route(bus.publish(runtimeStartedInput()) as AnySovereignEvent);
    router.route(bus.publish(chamberActivatedInput()) as AnySovereignEvent);
    router.route(bus.publish(incidentDetectedInput()) as AnySovereignEvent);

    expect(received).toHaveLength(3);
  });

  test('handler errors do not stop delivery to other subscribers', () => {
    const bus = new SovereignOperationsBus();
    const received: AnySovereignEvent[] = [];

    router.subscribe('CHAMBER_ACTIVATED', () => { throw new Error('handler crash'); }, 'broken');
    router.subscribe('CHAMBER_ACTIVATED', (e) => { received.push(e); }, 'working');

    const event = bus.publish(chamberActivatedInput()) as AnySovereignEvent;
    expect(() => router.route(event)).not.toThrow();
    expect(received).toHaveLength(1);
  });

  test('unsubscribe prevents future delivery', () => {
    const bus = new SovereignOperationsBus();
    const received: AnySovereignEvent[] = [];
    const handle = router.subscribe('CHAMBER_ACTIVATED', (e) => { received.push(e); }, 'temp');

    router.route(bus.publish(chamberActivatedInput('c1')) as AnySovereignEvent);
    expect(received).toHaveLength(1);

    handle.unsubscribe();
    router.route(bus.publish(chamberActivatedInput('c2')) as AnySovereignEvent);
    expect(received).toHaveLength(1);
  });

  test('getTotalDelivered counts each delivery', () => {
    const bus = new SovereignOperationsBus();
    router.subscribe('*', () => {}, 'sub-a');
    router.subscribe('*', () => {}, 'sub-b');

    router.route(bus.publish(runtimeStartedInput()) as AnySovereignEvent);
    // Two subscribers × one event = 2 deliveries
    expect(router.getTotalDelivered()).toBe(2);
  });

  test('getSubscriptionCount tracks active subscriptions', () => {
    const h1 = router.subscribe('RUNTIME_STARTED', () => {}, 'a');
    router.subscribe('CHAMBER_ACTIVATED', () => {}, 'b');
    expect(router.getSubscriptionCount()).toBe(2);

    h1.unsubscribe();
    expect(router.getSubscriptionCount()).toBe(1);
  });

  test('getSubscriptions returns all active handles', () => {
    router.subscribe('RUNTIME_STARTED', () => {}, 'alpha');
    router.subscribe('CHAMBER_ACTIVATED', () => {}, 'beta');
    const handles = router.getSubscriptions();
    expect(handles).toHaveLength(2);
    const names = handles.map((h) => h.subscriberName);
    expect(names).toContain('alpha');
    expect(names).toContain('beta');
  });
});

// ── Component 3: SovereignBusReplayEngine ────────────────────────────────────

describe('SovereignBusReplayEngine', () => {
  let recorder: SovereignBusRecorder;
  let engine: SovereignBusReplayEngine;
  let bus: SovereignOperationsBus;

  beforeEach(() => {
    bus = new SovereignOperationsBus();
    recorder = new SovereignBusRecorder();
    engine = new SovereignBusReplayEngine(recorder);
  });

  function record(input: ReturnType<typeof runtimeStartedInput> | ReturnType<typeof chamberActivatedInput> | ReturnType<typeof incidentDetectedInput> | ReturnType<typeof predictionInput>): AnySovereignEvent {
    const event = bus.publish(input) as AnySovereignEvent;
    recorder.record(event);
    return event;
  }

  test('replay with no filter returns all events in chronological order', () => {
    const e1 = record(runtimeStartedInput());
    const e2 = record(chamberActivatedInput());
    const e3 = record(incidentDetectedInput());

    const replayed = engine.replay({});
    expect(replayed).toHaveLength(3);
    expect(replayed[0]!.eventId).toBe(e1.eventId);
    expect(replayed[1]!.eventId).toBe(e2.eventId);
    expect(replayed[2]!.eventId).toBe(e3.eventId);
  });

  test('replay filtered by eventType', () => {
    record(runtimeStartedInput());
    const e2 = record(chamberActivatedInput('a'));
    const e3 = record(chamberActivatedInput('b'));

    const replayed = engine.replay({ eventType: 'CHAMBER_ACTIVATED' });
    expect(replayed).toHaveLength(2);
    expect(replayed[0]!.eventId).toBe(e2.eventId);
    expect(replayed[1]!.eventId).toBe(e3.eventId);
  });

  test('replay filtered by sourceLayer', () => {
    record(runtimeStartedInput()); // sourceLayer: 2
    const e2 = record(incidentDetectedInput()); // sourceLayer: 9

    const replayed = engine.replay({ sourceLayer: 9 });
    expect(replayed).toHaveLength(1);
    expect(replayed[0]!.eventId).toBe(e2.eventId);
  });

  test('replay filtered by sourceService', () => {
    record(runtimeStartedInput()); // sourceService: AzmaOsBootstrap
    const e2 = record(chamberActivatedInput()); // sourceService: ChamberLoader

    const replayed = engine.replay({ sourceService: 'ChamberLoader' });
    expect(replayed).toHaveLength(1);
    expect(replayed[0]!.eventId).toBe(e2.eventId);
  });

  test('replay filtered by correlationId', () => {
    record(runtimeStartedInput()); // correlationId: null
    const e2 = record(incidentDetectedInput()); // correlationId: 'corr-001'

    const replayed = engine.replay({ correlationId: 'corr-001' });
    expect(replayed).toHaveLength(1);
    expect(replayed[0]!.eventId).toBe(e2.eventId);
  });

  test('replay with limit parameter', () => {
    record(runtimeStartedInput());
    record(chamberActivatedInput('c1'));
    record(chamberActivatedInput('c2'));
    record(chamberActivatedInput('c3'));

    const replayed = engine.replay({ limit: 2 });
    expect(replayed).toHaveLength(2);
  });

  test('replay with from/to time range', () => {
    const before = new Date(Date.now() - 10_000);
    const e1 = record(runtimeStartedInput());
    const after = new Date(Date.now() + 10_000);

    const replayed = engine.replay({ from: before, to: after });
    expect(replayed.some((e) => e.eventId === e1.eventId)).toBe(true);
  });

  test('replay returns empty array when no events match filter', () => {
    record(runtimeStartedInput());
    const replayed = engine.replay({ eventType: 'AI_PROVIDER_SWITCHED' });
    expect(replayed).toHaveLength(0);
  });
});

// ── Component 4: SovereignOperationsBus (full contract) ───────────────────────

describe('SovereignOperationsBus', () => {
  let bus: SovereignOperationsBus;

  beforeEach(() => {
    bus = new SovereignOperationsBus();
  });

  test('has correct Layer 2 identity contract', () => {
    expect(bus.layerName).toBe('SovereignOperationsBus');
    expect(bus.version).toBe('1.0.0');
    expect(bus.layerNumber).toBe(2);
  });

  test('publish returns a complete SovereignBusEvent', () => {
    const event = bus.publish(runtimeStartedInput());
    expect(event.eventId).toBeTruthy();
    expect(event.eventType).toBe('RUNTIME_STARTED');
    expect(event.sourceLayer).toBe(2);
    expect(event.sourceService).toBe('AzmaOsBootstrap');
    expect(event.publishedAt).toBeInstanceOf(Date);
    expect(event.correlationId).toBeNull();
    expect(event.payload.version).toBe('1.0.0');
  });

  test('each published event has a unique eventId', () => {
    const e1 = bus.publish(runtimeStartedInput());
    const e2 = bus.publish(runtimeStartedInput());
    expect(e1.eventId).not.toBe(e2.eventId);
  });

  test('subscribe and receive a specific event type', () => {
    const received: SovereignBusEvent<'CHAMBER_ACTIVATED'>[] = [];
    bus.subscribe('CHAMBER_ACTIVATED', (e) => { received.push(e); }, 'test');

    bus.publish(chamberActivatedInput('hall'));
    bus.publish(runtimeStartedInput()); // should not arrive

    expect(received).toHaveLength(1);
    expect(received[0]!.payload.chamberId).toBe('hall');
  });

  test('wildcard subscribe receives all published events', () => {
    const received: AnySovereignEvent[] = [];
    bus.subscribe('*', (e) => { received.push(e); }, 'everything');

    bus.publish(runtimeStartedInput());
    bus.publish(chamberActivatedInput());
    bus.publish(incidentDetectedInput());

    expect(received).toHaveLength(3);
  });

  test('unsubscribe via handle stops delivery', () => {
    const received: AnySovereignEvent[] = [];
    const handle = bus.subscribe('*', (e) => { received.push(e); }, 'temp');

    bus.publish(runtimeStartedInput());
    expect(received).toHaveLength(1);

    handle.unsubscribe();
    bus.publish(chamberActivatedInput());
    expect(received).toHaveLength(1);
  });

  test('unsubscribe via bus.unsubscribe() stops delivery', () => {
    const received: AnySovereignEvent[] = [];
    const handle = bus.subscribe('*', (e) => { received.push(e); }, 'direct');
    bus.publish(runtimeStartedInput());
    bus.unsubscribe(handle.subscriptionId);
    bus.publish(chamberActivatedInput());
    expect(received).toHaveLength(1);
  });

  test('handler errors do not stop other deliveries', () => {
    const good: AnySovereignEvent[] = [];
    bus.subscribe('CHAMBER_ACTIVATED', () => { throw new Error('boom'); }, 'broken');
    bus.subscribe('CHAMBER_ACTIVATED', (e) => { good.push(e); }, 'resilient');

    expect(() => bus.publish(chamberActivatedInput())).not.toThrow();
    expect(good).toHaveLength(1);
  });

  test('getEventLog returns recorded events newest-first', () => {
    const e1 = bus.publish(runtimeStartedInput());
    const e2 = bus.publish(chamberActivatedInput());

    const log = bus.getEventLog();
    expect(log[0]!.eventId).toBe(e2.eventId);
    expect(log[1]!.eventId).toBe(e1.eventId);
  });

  test('getEventLog respects limit', () => {
    for (let i = 0; i < 10; i++) {
      bus.publish(chamberActivatedInput(`chamber-${i}`));
    }
    expect(bus.getEventLog(5)).toHaveLength(5);
  });

  test('replay returns events in chronological order', () => {
    const e1 = bus.publish(runtimeStartedInput());
    const e2 = bus.publish(chamberActivatedInput());

    const replayed = bus.replay({});
    expect(replayed[0]!.eventId).toBe(e1.eventId);
    expect(replayed[1]!.eventId).toBe(e2.eventId);
  });

  test('replay with eventType filter', () => {
    bus.publish(runtimeStartedInput());
    bus.publish(chamberActivatedInput('x'));
    bus.publish(chamberActivatedInput('y'));

    const replayed = bus.replay({ eventType: 'CHAMBER_ACTIVATED' });
    expect(replayed).toHaveLength(2);
    expect(replayed.every((e) => e.eventType === 'CHAMBER_ACTIVATED')).toBe(true);
  });

  test('getSubscriptions returns all active handles', () => {
    bus.subscribe('RUNTIME_STARTED', () => {}, 'sub-a');
    bus.subscribe('*', () => {}, 'sub-b');
    const subs = bus.getSubscriptions();
    expect(subs).toHaveLength(2);
  });

  test('getStats reflects published and delivered counts', () => {
    bus.subscribe('*', () => {}, 'counter');
    bus.publish(runtimeStartedInput());
    bus.publish(chamberActivatedInput());

    const stats = bus.getStats();
    expect(stats.totalPublished).toBe(2);
    expect(stats.totalDelivered).toBe(2);
    expect(stats.activeSubscriptions).toBe(1);
    expect(stats.recordedEventCount).toBe(2);
    expect(stats.lastEventAt).toBeInstanceOf(Date);
  });

  test('getStats starts at zero', () => {
    const stats = bus.getStats();
    expect(stats.totalPublished).toBe(0);
    expect(stats.totalDelivered).toBe(0);
    expect(stats.activeSubscriptions).toBe(0);
    expect(stats.recordedEventCount).toBe(0);
    expect(stats.lastEventAt).toBeNull();
  });
});

// ── Component 5: Typed event publishing ──────────────────────────────────────

describe('Typed event publishing', () => {
  let bus: SovereignOperationsBus;

  beforeEach(() => {
    bus = new SovereignOperationsBus();
  });

  test('PREDICTION_GENERATED payload is fully typed', () => {
    const event = bus.publish(predictionInput());
    expect(event.payload.predictionId).toBe('pred-001');
    expect(event.payload.subject).toBe('QUEUE_CONGESTION');
    expect(event.payload.confidence).toBe(0.75);
    expect(event.payload.estimatedTimeToEventMs).toBe(120_000);
  });

  test('INCIDENT_DETECTED payload includes correlationId', () => {
    const event = bus.publish(incidentDetectedInput());
    expect(event.correlationId).toBe('corr-001');
    expect(event.payload.chamberId).toBe('ras-al-amr');
    expect(event.payload.severity).toBe('HIGH');
  });

  test('APPROVAL_RESOLVED payload discriminates APPROVED/REJECTED', () => {
    const approved = bus.publish({
      eventType: 'APPROVAL_RESOLVED' as const,
      sourceLayer: 9 as const,
      sourceService: 'FounderApprovalGateService',
      correlationId: null,
      payload: { approvalId: 'apr-001', status: 'APPROVED' as const },
    });
    expect(approved.payload.status).toBe('APPROVED');

    const rejected = bus.publish({
      eventType: 'APPROVAL_RESOLVED' as const,
      sourceLayer: 9 as const,
      sourceService: 'FounderApprovalGateService',
      correlationId: null,
      payload: { approvalId: 'apr-002', status: 'REJECTED' as const },
    });
    expect(rejected.payload.status).toBe('REJECTED');
  });

  test('GRANT_ISSUED event carries correct grant metadata', () => {
    const event = bus.publish({
      eventType: 'GRANT_ISSUED' as const,
      sourceLayer: 9 as const,
      sourceService: 'SovereignGrantService',
      correlationId: null,
      payload: { grantId: 'g-001', grantType: 'CREDITS', targetUserId: 'user-999' },
    });
    expect(event.payload.grantType).toBe('CREDITS');
    expect(event.payload.targetUserId).toBe('user-999');
  });

  test('INTELLIGENCE_QUERIED tracks cache status', () => {
    const event = bus.publish({
      eventType: 'INTELLIGENCE_QUERIED' as const,
      sourceLayer: 8 as const,
      sourceService: 'SovereignIntelligenceConnector',
      correlationId: null,
      payload: { query: 'ancient rome', domain: 'research', fromCache: true },
    });
    expect(event.payload.fromCache).toBe(true);
    expect(event.payload.domain).toBe('research');
  });
});

// ── Component 6: Distributed backend extension point ─────────────────────────

describe('Distributed backend extension point', () => {
  test('createSovereignBus() returns a valid SovereignBusContract without backend', () => {
    const bus = createSovereignBus();
    expect(bus.layerName).toBe('SovereignOperationsBus');
    expect(bus.layerNumber).toBe(2);
  });

  test('backend.persistEvent is called on publish when backend is set', async () => {
    const persisted: AnySovereignEvent[] = [];
    const mockBackend: SovereignBusBackend = {
      backendId: 'test-backend',
      backendType: 'distributed',
      persistEvent: jest.fn(async (event: AnySovereignEvent) => { persisted.push(event); }),
      loadEvents: jest.fn(async () => []),
    };

    const bus = new SovereignOperationsBus(mockBackend);
    bus.publish(runtimeStartedInput());

    // Allow microtask queue to flush
    await Promise.resolve();

    expect(mockBackend.persistEvent).toHaveBeenCalledTimes(1);
    expect(persisted).toHaveLength(1);
    expect(persisted[0]!.eventType).toBe('RUNTIME_STARTED');
  });

  test('backend is not required — null default still records locally', () => {
    const bus = new SovereignOperationsBus(null);
    bus.publish(chamberActivatedInput());
    expect(bus.getStats().recordedEventCount).toBe(1);
  });
});
