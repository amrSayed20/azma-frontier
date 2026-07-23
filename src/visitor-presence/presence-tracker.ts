/**
 * AZMA OS — VISITOR PRESENCE
 * Presence Tracker — the genuinely missing "Presence Engine"
 *
 * A full-codebase audit before this file was written found several
 * real but partial pieces under the name "presence" — LivingCompanion
 * (a presence-facing UI, not a tracker), creator-presence's
 * welcome-composer (a one-shot data receiver, not a live tracker), and
 * imperial-presence's presence-registry (a static route catalog for
 * certification, unrelated to live visitors) — but no single system
 * that actually tracks whether a visitor is currently present, idle,
 * or has left. This module is that missing piece, and only that piece.
 *
 * State transitions are a pure state machine (PresenceMachine),
 * separated from the browser wiring (createPresenceTracker) that
 * drives it — the machine is fully unit-testable without a DOM; only
 * the wiring needs a real browser, verified live rather than in Jest
 * (this codebase's test environment has no DOM — see other
 * localStorage-backed modules for the same convention).
 *
 * Exported and ready to consume, not yet consumed by any page — wiring
 * it into the Arrival Experience's visible behavior is a Welcome-
 * Experience decision for a later package, not a runtime-foundation
 * one ("do not redesign UI").
 */

export type PresenceState = 'present' | 'idle' | 'away';

export interface PresenceMachineOptions {
  /** Milliseconds of no activity, while the tab is visible, before 'idle'. */
  readonly idleAfterMs: number;
}

const DEFAULT_OPTIONS: PresenceMachineOptions = {
  idleAfterMs: 60_000,
};

/**
 * The pure part: given explicit events, what state should presence be
 * in? No timers, no DOM — a caller (createPresenceTracker below) is
 * responsible for actually deciding when idleAfterMs has elapsed and
 * calling onIdleTimeout().
 */
export class PresenceMachine {
  private state: PresenceState = 'present';
  private readonly listeners = new Set<(state: PresenceState) => void>();

  private setState(next: PresenceState): void {
    if (next === this.state) return;
    this.state = next;
    for (const listener of this.listeners) listener(next);
  }

  getState(): PresenceState {
    return this.state;
  }

  subscribe(listener: (state: PresenceState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** The tab became visible, or the visitor interacted (pointer/key/scroll). */
  onActivity(): void {
    this.setState('present');
  }

  /** The tab was hidden (switched away, minimized). */
  onHidden(): void {
    this.setState('away');
  }

  /** idleAfterMs elapsed with no activity while the tab stayed visible. */
  onIdleTimeout(): void {
    if (this.state === 'present') this.setState('idle');
  }
}

export interface PresenceTracker {
  getState: () => PresenceState;
  subscribe: (listener: (state: PresenceState) => void) => () => void;
  destroy: () => void;
}

const ACTIVITY_EVENTS = ['pointerdown', 'keydown', 'scroll'] as const;

/**
 * Wires a PresenceMachine to real browser signals: Page Visibility API
 * for present/away, a reset-on-activity idle timer for present/idle.
 * SSR-safe — returns an inert tracker (always 'present', no-op
 * destroy) when there is no window, matching this codebase's
 * established `typeof window === 'undefined'` convention.
 */
export function createPresenceTracker(options: Partial<PresenceMachineOptions> = {}): PresenceTracker {
  if (typeof window === 'undefined') {
    return { getState: () => 'present', subscribe: () => () => {}, destroy: () => {} };
  }

  const { idleAfterMs } = { ...DEFAULT_OPTIONS, ...options };
  const machine = new PresenceMachine();
  let idleTimer: ReturnType<typeof setTimeout> | null = null;

  const resetIdleTimer = () => {
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(() => machine.onIdleTimeout(), idleAfterMs);
  };

  const handleActivity = () => {
    machine.onActivity();
    resetIdleTimer();
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      machine.onHidden();
      if (idleTimer) clearTimeout(idleTimer);
    } else {
      handleActivity();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  for (const eventName of ACTIVITY_EVENTS) {
    window.addEventListener(eventName, handleActivity, { passive: true });
  }
  resetIdleTimer();

  return {
    getState: () => machine.getState(),
    subscribe: (listener) => machine.subscribe(listener),
    destroy: () => {
      if (idleTimer) clearTimeout(idleTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      for (const eventName of ACTIVITY_EVENTS) {
        window.removeEventListener(eventName, handleActivity);
      }
    },
  };
}
