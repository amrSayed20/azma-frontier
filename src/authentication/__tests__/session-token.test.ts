import { generateSessionId } from '../session-token';

describe('Authentication Foundation — Session Tokens', () => {
  it('generates a 64-character hex string (32 random bytes)', () => {
    expect(generateSessionId()).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generates distinct ids on each call', () => {
    expect(generateSessionId()).not.toBe(generateSessionId());
  });
});
