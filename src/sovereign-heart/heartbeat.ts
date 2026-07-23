/**
 * AZMA OS — THE CONSTITUTIONAL HEART (AL-WATEEN)
 * The Constitutional Heartbeat & Wake Cycle
 * Construction Phase IV
 *
 * The one genuinely new executable mechanism this phase adds: a regular,
 * continuous beat. Each beat does nothing but advance the beat counter
 * and record the time — it never inspects, judges, or reacts to organ
 * continuity itself (that remains a pure query, continuity-tracker.ts,
 * available to whichever future organ — the Sovereign Core, Phase V —
 * is authorized to interpret it). Al-Wateen sustains; it does not judge.
 *
 * ACTIVATED (Integration Package "The First Constitutional Heartbeat,"
 * 2026-07-12): awaken() is now called once at application startup (see
 * src/sovereign-heart/HeartPulse.tsx, mounted in app/layout.tsx) — only
 * in the browser. No server cron/worker process exists in this
 * architecture (the same constraint already disclosed for Phase II/III),
 * so server-side activation was not attempted; disclosed, not silently
 * assumed solved.
 *
 * CONNECTED TO THE CONSTITUTIONAL CIRCULATION: each tick() now reports
 * the Heart's own pulse as a real signal via circulateFromClient() (its
 * origin is 'al-wateen', a Skeleton-registered organ id) — this is the
 * Heart's ONE outbound emission, distinct from its inbound listening to
 * the Nervous System (beginReceivingConstitutionalReality below). It
 * carries no content, decides nothing, and is exactly the same
 * transport every other organ already uses — not a special path.
 */

import { beginReceivingConstitutionalReality } from './continuity-tracker';
import { CONSTITUTIONAL_RHYTHM } from './rhythm-registry';
import { circulateFromClient } from '../sovereign-circulation';
import type { ConstitutionalRhythm, HeartbeatState } from './types';

let state: HeartbeatState = { awake: false, beatCount: 0, lastBeatAt: null, startedAt: null };
let intervalHandle: ReturnType<typeof setInterval> | null = null;
let unsubscribeFromNervousSystem: (() => void) | null = null;

/** Advances the heartbeat by exactly one beat and circulates the Heart's own pulse. Exported so tests (and a future caller) can trigger a single beat deterministically, without waiting on a real interval. */
export function tick(): void {
  state = { ...state, beatCount: state.beatCount + 1, lastBeatAt: new Date().toISOString() };
  circulateFromClient({
    origin: 'al-wateen',
    signalType: 'Availability',
    relatedEvent: null,
    reportingAuthority: 'al-wateen',
    purpose: 'The Constitutional Heart beat.',
    content: null,
  });
}

/**
 * Awakens the Heart: begins receiving constitutional reality from the
 * Nervous System and starts beating at the given rhythm. Idempotent —
 * calling it while already awake does nothing, preventing a second,
 * competing heartbeat from ever existing (Phase IV Constitutional Limits
 * implicitly require exactly one Heart, one rhythm).
 */
export function awaken(rhythm: ConstitutionalRhythm = CONSTITUTIONAL_RHYTHM): void {
  if (state.awake) return;
  unsubscribeFromNervousSystem = beginReceivingConstitutionalReality();
  state = { awake: true, beatCount: 0, lastBeatAt: null, startedAt: new Date().toISOString() };
  intervalHandle = setInterval(tick, rhythm.beatIntervalMs);
}

/** Rests the Heart: stops beating and stops receiving constitutional reality. Continuity records already gathered are preserved (rest() does not clear them — only resetContinuityTracking() does, and only tests call that). */
export function rest(): void {
  if (intervalHandle !== null) clearInterval(intervalHandle);
  if (unsubscribeFromNervousSystem !== null) unsubscribeFromNervousSystem();
  intervalHandle = null;
  unsubscribeFromNervousSystem = null;
  state = { ...state, awake: false };
}

export function getHeartbeatState(): Readonly<HeartbeatState> {
  return state;
}
