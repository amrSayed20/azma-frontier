import { ingestCirculatedSignal } from '../transport';
import { verifyCrossRuntimeContinuity } from '../queries';
import { observeStateFlow } from '../state-flow';
import { observeContextFlow } from '../context-flow';
import { observeHealthFlow } from '../health-flow';
import { getSignalLog } from '../../sovereign-nervous-system';

describe('Constitutional Circulation — cross-runtime boundary', () => {
  it('ingests a signal exactly as the API route would, preserving origin and traceability', () => {
    const result = verifyCrossRuntimeContinuity({
      origin: 'hujjah-al-damighah',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'hujjah-al-damighah',
      purpose: 'circulation continuity smoke test',
      content: null,
    });
    expect(result.continuityPreserved).toBe(true);
    expect(result.reason).toBeNull();
  });

  it('rejects a circulated signal from an illegitimate origin, exactly like direct emission', () => {
    const result = ingestCirculatedSignal({
      origin: 'not-a-real-organ',
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'not-a-real-organ',
      purpose: 'should be rejected',
      content: null,
    });
    expect(result.circulated).toBe(false);
    expect(result.reason).toMatch(/not a recognized constitutional organ/);
  });

  it('State Flow only observes State-typed signals, never others', () => {
    const stateHits: string[] = [];
    const unsub = observeStateFlow((s) => stateHits.push(s.signalType));

    ingestCirculatedSignal({
      origin: 'ras-al-amr',
      signalType: 'State',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'state flow test',
      content: null,
    });
    ingestCirculatedSignal({
      origin: 'ras-al-amr',
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'ras-al-amr',
      purpose: 'should not appear in state flow',
      content: null,
    });

    expect(stateHits).toEqual(['State']);
    unsub();
  });

  it('Context Flow only observes journey-context related events', () => {
    const contextHits: unknown[] = [];
    const unsub = observeContextFlow((s) => contextHits.push(s.relatedEvent));

    ingestCirculatedSignal({
      origin: 'makman-al-ghayah',
      signalType: 'State',
      relatedEvent: 'Creator Entered Chamber',
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'context flow test',
      content: null,
    });
    ingestCirculatedSignal({
      origin: 'makman-al-ghayah',
      signalType: 'State',
      relatedEvent: 'Creator Completed Goal',
      reportingAuthority: 'makman-al-ghayah',
      purpose: 'not a context event, should not appear',
      content: null,
    });

    expect(contextHits).toEqual(['Creator Entered Chamber']);
    unsub();
  });

  it('Health Flow observes Health signals emitted through circulation, not just direct emission', () => {
    const healthHits: string[] = [];
    const unsub = observeHealthFlow((s) => healthHits.push(s.origin));

    ingestCirculatedSignal({
      origin: 'qiyamah-chamber',
      signalType: 'Health',
      relatedEvent: null,
      reportingAuthority: 'qiyamah-chamber',
      purpose: 'health flow via circulation',
      content: null,
    });

    expect(healthHits).toContain('qiyamah-chamber');
    unsub();
  });

  it('never introduces a second Signal Log — circulated signals land in the same log direct emissions use', () => {
    const before = getSignalLog().length;
    ingestCirculatedSignal({
      origin: 'sovereign-vault-palace',
      signalType: 'Availability',
      relatedEvent: null,
      reportingAuthority: 'sovereign-vault-palace',
      purpose: 'single-log smoke test',
      content: null,
    });
    expect(getSignalLog().length).toBe(before + 1);
  });
});
