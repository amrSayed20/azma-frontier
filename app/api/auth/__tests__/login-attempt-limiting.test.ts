/**
 * Sign-in attempt limiting — the hole the review confirmed: logIn had no
 * attempt tracking at all, so passwords could be tried forever at full
 * speed. Now five failures in fifteen minutes close the gate (429), the
 * count is durable, unknown addresses count identically (no enumeration
 * oracle), one success clears it, and the window expiring reopens it.
 */

import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { createDatabase } from '../../../../src/persistent-storage/db';

let testDb: DatabaseSync;

jest.mock('../../../../src/persistent-storage', () => {
  const actual = jest.requireActual('../../../../src/persistent-storage');
  return { ...actual, getDb: jest.fn(() => testDb) };
});

import { createCreator } from '../../../../src/persistent-storage';
import { hashPassword } from '../../../../src/authentication/password-hashing';
import { POST as logInRoute } from '../login/route';

function makeRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function seedAccount(email: string, password: string) {
  createCreator(testDb, {
    creatorId: randomUUID(),
    email,
    passwordHash: await hashPassword(password),
    role: 'creator',
    displayName: null,
  });
}

beforeEach(() => { testDb = createDatabase(':memory:'); });
afterEach(() => { testDb.close(); });

describe('POST /api/auth/login — attempt limiting', () => {
  it('correct credentials still get in (200 + session cookie)', async () => {
    await seedAccount('real@example.com', 'correct-horse');
    const res = await logInRoute(makeRequest({ email: 'real@example.com', password: 'correct-horse' }));
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('azma_session=');
  });

  it('5 wrong passwords → the 6th attempt is 429, even with the RIGHT password', async () => {
    await seedAccount('real@example.com', 'correct-horse');
    for (let i = 0; i < 5; i++) {
      const res = await logInRoute(makeRequest({ email: 'real@example.com', password: `wrong-${i}` }));
      expect(res.status).toBe(401);
    }
    const blocked = await logInRoute(makeRequest({ email: 'real@example.com', password: 'correct-horse' }));
    expect(blocked.status).toBe(429);
    const json = await blocked.json();
    expect(json.reason).toBe('too-many-attempts');
    expect(blocked.headers.get('set-cookie') ?? '').not.toContain('azma_session=');
  });

  it('an address with NO account is counted and blocked identically — no enumeration oracle', async () => {
    for (let i = 0; i < 5; i++) {
      const res = await logInRoute(makeRequest({ email: 'ghost@example.com', password: `wrong-${i}` }));
      expect(res.status).toBe(401);
    }
    const blocked = await logInRoute(makeRequest({ email: 'ghost@example.com', password: 'wrong-again' }));
    expect(blocked.status).toBe(429);
  });

  it('the block is keyed case-insensitively — CAPITALS do not buy a fresh budget', async () => {
    await seedAccount('real@example.com', 'correct-horse');
    for (let i = 0; i < 5; i++) {
      await logInRoute(makeRequest({ email: i % 2 ? 'REAL@example.com' : 'real@EXAMPLE.com', password: `wrong-${i}` }));
    }
    const blocked = await logInRoute(makeRequest({ email: 'real@example.com', password: 'correct-horse' }));
    expect(blocked.status).toBe(429);
  });

  it('one success clears the count: 4 fails, success, then 4 more fails still let you try', async () => {
    await seedAccount('real@example.com', 'correct-horse');
    for (let i = 0; i < 4; i++) {
      await logInRoute(makeRequest({ email: 'real@example.com', password: `wrong-${i}` }));
    }
    const ok = await logInRoute(makeRequest({ email: 'real@example.com', password: 'correct-horse' }));
    expect(ok.status).toBe(200);
    for (let i = 0; i < 4; i++) {
      const res = await logInRoute(makeRequest({ email: 'real@example.com', password: `again-${i}` }));
      expect(res.status).toBe(401);
    }
  });

  it('the window expiring reopens the gate', async () => {
    await seedAccount('real@example.com', 'correct-horse');
    for (let i = 0; i < 5; i++) {
      await logInRoute(makeRequest({ email: 'real@example.com', password: `wrong-${i}` }));
    }
    expect((await logInRoute(makeRequest({ email: 'real@example.com', password: 'x' }))).status).toBe(429);
    // Age the record past the 15-minute window, the way the clock itself would.
    testDb.prepare('UPDATE login_attempts SET window_start = window_start - ? WHERE subject = ?')
      .run(16 * 60 * 1000, 'real@example.com');
    const after = await logInRoute(makeRequest({ email: 'real@example.com', password: 'correct-horse' }));
    expect(after.status).toBe(200);
  });

  it('the count survives a process restart (it lives in the store)', async () => {
    await seedAccount('real@example.com', 'correct-horse');
    for (let i = 0; i < 5; i++) {
      await logInRoute(makeRequest({ email: 'real@example.com', password: `wrong-${i}` }));
    }
    // A restarted process holds no in-memory state: assert from the store directly.
    const row = testDb.prepare('SELECT failed_count FROM login_attempts WHERE subject = ?').get('real@example.com') as { failed_count: number } | undefined;
    expect(row?.failed_count).toBeGreaterThanOrEqual(5);
  });

  it('malformed input is a 400 and never touches the attempt counter', async () => {
    const res = await logInRoute(makeRequest({ email: 42 }));
    expect(res.status).toBe(400);
    const row = testDb.prepare('SELECT COUNT(*) AS n FROM login_attempts').get() as { n: number };
    expect(row.n).toBe(0);
  });
});
