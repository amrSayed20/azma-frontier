import { AttemptLimiter, clientKey } from '../attempt-limiter';

describe('Authentication Foundation — attempt limiter', () => {
  it('blocks a key after its attempts in the window, and frees it when the window ends', () => {
    const limiter = new AttemptLimiter(3, 1000);
    const now = 10_000;
    for (let i = 0; i < 3; i++) {
      expect(limiter.isBlocked('a@example.com', now)).toBe(false);
      limiter.record('a@example.com', now);
    }
    expect(limiter.isBlocked('a@example.com', now)).toBe(true);
    expect(limiter.retryAfterSeconds('a@example.com', now + 400)).toBe(1);
    expect(limiter.isBlocked('b@example.com', now)).toBe(false);
    expect(limiter.isBlocked('a@example.com', now + 1000)).toBe(false);
  });

  it('clear() forgets a key at once (a successful sign-in)', () => {
    const limiter = new AttemptLimiter(1, 60_000);
    limiter.record('a');
    expect(limiter.isBlocked('a')).toBe(true);
    limiter.clear('a');
    expect(limiter.isBlocked('a')).toBe(false);
  });

  it('reads the first forwarded address, then x-real-ip, then a shared bucket', () => {
    expect(clientKey(new Headers({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' }))).toBe('203.0.113.7');
    expect(clientKey(new Headers({ 'x-real-ip': '198.51.100.2' }))).toBe('198.51.100.2');
    expect(clientKey(new Headers())).toBe('unknown-client');
  });
});
