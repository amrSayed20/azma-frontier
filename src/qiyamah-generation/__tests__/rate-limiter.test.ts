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
