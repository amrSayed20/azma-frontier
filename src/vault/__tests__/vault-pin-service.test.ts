import {
  isPinAttemptBlocked,
  recordFailedPinAttempt,
  clearPinAttempts,
  resetPinAttemptTrackerForTests,
} from '../vault-pin-service';

beforeEach(() => resetPinAttemptTrackerForTests());

describe('vault-pin-service — per-creator attempt tracking', () => {
  it('is not blocked when no attempts have been recorded', () => {
    expect(isPinAttemptBlocked('creator-a')).toBe(false);
  });

  it('is not blocked after fewer than 5 failed attempts', () => {
    recordFailedPinAttempt('creator-a');
    recordFailedPinAttempt('creator-a');
    recordFailedPinAttempt('creator-a');
    recordFailedPinAttempt('creator-a');
    expect(isPinAttemptBlocked('creator-a')).toBe(false);
  });

  it('is blocked after 5 failed attempts within the window', () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) recordFailedPinAttempt('creator-a', now + i);
    expect(isPinAttemptBlocked('creator-a', now + 10)).toBe(true);
  });

  it('is not blocked after the 15-minute window expires', () => {
    const windowMs = 15 * 60 * 1000;
    const start = 1_000_000;
    for (let i = 0; i < 5; i++) recordFailedPinAttempt('creator-a', start + i);
    expect(isPinAttemptBlocked('creator-a', start + windowMs)).toBe(false);
  });

  it('clearPinAttempts removes the block', () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) recordFailedPinAttempt('creator-a', now);
    expect(isPinAttemptBlocked('creator-a', now + 1)).toBe(true);
    clearPinAttempts('creator-a');
    expect(isPinAttemptBlocked('creator-a', now + 1)).toBe(false);
  });

  it('Creator A block does not affect Creator B', () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) recordFailedPinAttempt('creator-a', now + i);
    expect(isPinAttemptBlocked('creator-a', now + 10)).toBe(true);
    expect(isPinAttemptBlocked('creator-b', now + 10)).toBe(false);
  });

  it('resets window when a new attempt arrives after the window expired', () => {
    const windowMs = 15 * 60 * 1000;
    const start = 1_000_000;
    for (let i = 0; i < 5; i++) recordFailedPinAttempt('creator-a', start + i);
    // Window expired — one new attempt should NOT immediately block
    recordFailedPinAttempt('creator-a', start + windowMs + 1);
    expect(isPinAttemptBlocked('creator-a', start + windowMs + 2)).toBe(false);
  });

  it('resetPinAttemptTrackerForTests clears all creators', () => {
    recordFailedPinAttempt('creator-x');
    recordFailedPinAttempt('creator-y');
    resetPinAttemptTrackerForTests();
    expect(isPinAttemptBlocked('creator-x')).toBe(false);
    expect(isPinAttemptBlocked('creator-y')).toBe(false);
  });
});
