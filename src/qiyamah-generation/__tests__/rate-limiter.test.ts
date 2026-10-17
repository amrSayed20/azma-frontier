import { isRateLimited, recordGeneration, resetRateLimiterForTests } from '../rate-limiter';

describe('Qiyamah First Generation Path — interim rate limiter', () => {
  beforeEach(() => {
    resetRateLimiterForTests();
  });

  it('is not rate limited before any generation is recorded', () => {
    expect(isRateLimited(Date.now())).toBe(false);
  });

  it('becomes rate limited once the fixed-window maximum is reached', () => {
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      recordGeneration(now);
    }
    expect(isRateLimited(now)).toBe(true);
  });

  it('resets once the time window elapses', () => {
    const now = Date.now();
    for (let i = 0; i < 20; i++) {
      recordGeneration(now);
    }
    expect(isRateLimited(now)).toBe(true);

    const later = now + 60 * 60 * 1000 + 1;
    expect(isRateLimited(later)).toBe(false);
  });
});

describe('Qiyamah interim rate limiter — per-creator share', () => {
  beforeEach(() => {
    resetRateLimiterForTests();
  });

  it('stops one creator at their share while others can still generate', () => {
    const now = Date.now();
    for (let i = 0; i < 10; i++) recordGeneration(now, 'creator-heavy');
    expect(isRateLimited(now, 'creator-heavy')).toBe(true);
    expect(isRateLimited(now, 'creator-other')).toBe(false);
  });

  it('still enforces the global window across creators', () => {
    const now = Date.now();
    for (let i = 0; i < 20; i++) recordGeneration(now, `creator-${i}`);
    expect(isRateLimited(now, 'creator-new')).toBe(true);
  });

  it('gives each creator a fresh share when the window elapses', () => {
    const now = Date.now();
    for (let i = 0; i < 10; i++) recordGeneration(now, 'creator-heavy');
    expect(isRateLimited(now + 60 * 60 * 1000 + 1, 'creator-heavy')).toBe(false);
  });
});
