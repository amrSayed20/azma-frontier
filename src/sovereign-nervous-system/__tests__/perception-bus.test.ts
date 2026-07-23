import { emitSignal, observeOrgan, observeSignalType, observeAll, getSignalLog } from '../perception-bus';
import { createPerceptionEndpointForOrgan } from '../perception-contracts';
import { observeOrganState } from '../state-registry';
import { verifyLogTraceability } from '../queries';
import { isLegitimateSignalOrigin } from '../signal-origin-registry';

describe('Constitutional Perception Bus', () => {
  it('rejects a signal from an unrecognized organ', () => {
    expect(isLegitimateSignalOrigin('not-a-real-organ')).toBe(false);
    expect(() =>
      emitSignal({
        origin: 'not-a-real-organ',
        signalType: 'Health',
        relatedEvent: null,
        reportingAuthority: 'not-a-real-organ',
        purpose: 'test',
        content: null,
      }),
    ).toThrow(/not a recognized constitutional organ/);
  });

  it('accepts a signal from a real Skeleton organ, assigns a traceable id and timestamp, and records observable state', () => {
    const signal = emitSignal({
      origin: 'hujjah-al-damighah',
      signalType: 'Readiness',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'smoke test',
      content: { ok: true },
    });

    expect(signal.signalId).toBeTruthy();
    expect(signal.timestamp).toBeTruthy();
    expect(observeOrganState('hujjah-al-damighah').Readiness).toEqual(signal);
  });

  it('routes a signal to organ, type, and universal listeners without interpreting it', () => {
    const organHits: unknown[] = [];
    const typeHits: unknown[] = [];
    const allHits: unknown[] = [];

    const unsubOrgan = observeOrgan('qiyamah-chamber', (s) => organHits.push(s));
    const unsubType = observeSignalType('State', (s) => typeHits.push(s));
    const unsubAll = observeAll((s) => allHits.push(s));

    emitSignal({
      origin: 'qiyamah-chamber',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'routing smoke test',
      content: 'opaque-payload',
    });

    expect(organHits).toHaveLength(1);
    expect(typeHits).toHaveLength(1);
    expect(allHits.length).toBeGreaterThanOrEqual(1);

    unsubOrgan();
    unsubType();
    unsubAll();
  });

  it('keeps every emitted signal traceable with no duplicate ids', () => {
    const before = getSignalLog().length;
    emitSignal({
      origin: 'ras-al-amr',
      signalType: 'Availability',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'traceability smoke test',
      content: null,
    });
    const result = verifyLogTraceability();
    expect(result.traceable).toBe(true);
    expect(result.totalSignals).toBe(before + 1);
  });

  it('gives any Skeleton-registered organ a working perception endpoint', () => {
    const endpoint = createPerceptionEndpointForOrgan('makman-al-ghayah');
    const signal = endpoint.report({
      signalType: 'Purpose',
      relatedEvent: null,
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'endpoint smoke test',
      content: null,
    });
    expect(signal.origin).toBe('makman-al-ghayah');
    expect(endpoint.observeSelf().Purpose).toEqual(signal);
  });

  it('refuses to build an endpoint for an unrecognized organ', () => {
    expect(() => createPerceptionEndpointForOrgan('not-a-real-organ')).toThrow(
      /not a recognized constitutional organ/,
    );
  });
});
