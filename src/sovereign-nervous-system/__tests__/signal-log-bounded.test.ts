/**
 * AZMA OS — SECURITY REGRESSION: the Empire's memory has a ceiling.
 *
 * ─── THE DEFECT THIS HOLDS SHUT ─────────────────────────────────────────────
 *
 *   `signalLog` was a plain array that only ever grew, and
 *   `POST /api/sovereign/nervous-system/circulate` fed it with NO SESSION
 *   CHECK. Anyone who knew the path could push entries into the live
 *   production process until it exhausted memory and PM2 restarted it — an
 *   unauthenticated denial of service, found by hunting rather than reported.
 *
 *   Two layers now stand between a stranger and that outcome: the route
 *   requires a session, and the log has a ceiling. This file holds the second,
 *   because the first is one edit away from being removed by someone who reads
 *   "transport endpoint" and concludes "public".
 *
 *   A nervous system that remembers everything forever is not a nervous
 *   system; it is a leak.
 */

import { emitSignal, getSignalLog } from '../perception-bus';
import type { ConstitutionalSignal } from '../types';

/** An organ the origin registry already recognises. */
const ORIGIN = 'hujjah-al-damighah';

function report(purpose: string): ConstitutionalSignal {
  return emitSignal({
    origin: ORIGIN,
    signalType: 'Health',
    relatedEvent: null,
    reportingAuthority: ORIGIN,
    purpose,
    content: null,
  });
}

/**
 * The log is module state with no reset hook, so each assertion is written
 * against the CEILING and the ORDER rather than an absolute count from zero —
 * which is what actually matters, and is true whatever ran before.
 */
describe('the signal log is bounded', () => {
  it('keeps ordinary traffic', () => {
    const before = getSignalLog().length;
    for (let i = 0; i < 50; i += 1) report(`signal ${i}`);
    expect(getSignalLog().length).toBeGreaterThanOrEqual(Math.min(before + 50, 5_000));
  });

  it('REFUSES TO GROW without limit under flooding', () => {
    // Ten thousand reports — twice the ceiling — is what an attacker's loop
    // looks like, and what a client stuck retrying looks like too.
    for (let i = 0; i < 10_000; i += 1) report(`flood ${i}`);

    const log = getSignalLog();
    expect(log.length).toBeLessThanOrEqual(5_000);
    expect(log.length).toBeGreaterThan(0);
  });

  it('drops the OLDEST, never the newest — a reporting organ is never silenced', () => {
    for (let i = 0; i < 6_000; i += 1) report(`signal ${i}`);

    const log = getSignalLog();
    const last = log[log.length - 1];
    // The most recent report survived.
    expect(last.purpose).toBe('signal 5999');
    // The earliest did not.
    expect(log.some((s) => s.purpose === 'signal 0')).toBe(false);
  });

  it('stays bounded across repeated floods, not just one', () => {
    for (let round = 0; round < 3; round += 1) {
      for (let i = 0; i < 4_000; i += 1) report(`round ${round} signal ${i}`);
      expect(getSignalLog().length).toBeLessThanOrEqual(5_000);
    }
  });

  it('a reader still receives a copy, not the live array', () => {
    report('one');
    const before = getSignalLog().length;
    (getSignalLog() as ConstitutionalSignal[]).push({} as ConstitutionalSignal);
    // Mutating what a reader was handed must not change the Empire's memory.
    expect(getSignalLog().length).toBe(before);
  });
});
