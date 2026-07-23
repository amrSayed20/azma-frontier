import { hashPassword, verifyPassword } from '../password-hashing';

describe('Authentication Foundation — Password Hashing', () => {
  it('never stores the password in plaintext', async () => {
    const stored = await hashPassword('a-strong-password');
    expect(stored).not.toContain('a-strong-password');
    expect(stored).toContain(':');
  });

  it('verifies a correct password', async () => {
    const stored = await hashPassword('a-strong-password');
    expect(await verifyPassword('a-strong-password', stored)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const stored = await hashPassword('a-strong-password');
    expect(await verifyPassword('wrong-password', stored)).toBe(false);
  });

  it('produces a different hash for the same password each time (per-user salt)', async () => {
    const first = await hashPassword('a-strong-password');
    const second = await hashPassword('a-strong-password');
    expect(first).not.toBe(second);
  });

  it('rejects a malformed stored hash gracefully rather than throwing', async () => {
    expect(await verifyPassword('anything', 'not-a-valid-stored-hash')).toBe(false);
  });
});
