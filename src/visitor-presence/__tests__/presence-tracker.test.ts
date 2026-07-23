import { PresenceMachine, createPresenceTracker } from '../presence-tracker';

describe('Visitor Presence — PresenceMachine (pure state machine)', () => {
  it('starts present', () => {
    expect(new PresenceMachine().getState()).toBe('present');
  });

  it('goes idle only after an idle timeout while present, never directly from away', () => {
    const machine = new PresenceMachine();
    machine.onIdleTimeout();
    expect(machine.getState()).toBe('idle');

    machine.onHidden();
    expect(machine.getState()).toBe('away');
    machine.onIdleTimeout();
    expect(machine.getState()).toBe('away'); // idle timeout is a no-op while away
  });

  it('returns to present on activity from either idle or away', () => {
    const machine = new PresenceMachine();
    machine.onIdleTimeout();
    machine.onActivity();
    expect(machine.getState()).toBe('present');

    machine.onHidden();
    machine.onActivity();
    expect(machine.getState()).toBe('present');
  });

  it('notifies subscribers only on an actual state change, and unsubscribe stops delivery', () => {
    const machine = new PresenceMachine();
    const seen: string[] = [];
    const unsubscribe = machine.subscribe((state) => seen.push(state));

    machine.onActivity(); // already present — no change, no notification
    machine.onHidden();
    machine.onHidden(); // already away — no duplicate notification
    machine.onActivity();

    expect(seen).toEqual(['away', 'present']);

    unsubscribe();
    machine.onHidden();
    expect(seen).toEqual(['away', 'present']); // no further delivery after unsubscribe
  });
});

describe('Visitor Presence — createPresenceTracker server-side safety (this codebase\'s test environment has no DOM)', () => {
  it('returns an inert, always-present tracker without window, and never throws', () => {
    expect(typeof window).toBe('undefined');
    const tracker = createPresenceTracker();
    expect(tracker.getState()).toBe('present');
    expect(() => tracker.subscribe(() => {})()).not.toThrow();
    expect(() => tracker.destroy()).not.toThrow();
  });
});
