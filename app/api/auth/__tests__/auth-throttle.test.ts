import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../../../../src/persistent-storage/db';

let testDb: DatabaseSync;

jest.mock('../../../../src/persistent-storage', () => {
  const actual = jest.requireActual('../../../../src/persistent-storage');
  return { ...actual, getDb: jest.fn(() => testDb) };
});

import { NextRequest } from 'next/server';
import { POST as loginPOST } from '../login/route';
import { POST as signupPOST } from '../signup/route';
import { POST as passwordPOST } from '../password/route';

function post(path: string, body: unknown, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

describe('auth routes — attempt limits and password change', () => {
  beforeAll(() => {
    testDb = createDatabase(':memory:');
  });
  afterAll(() => testDb.close());

  it('refuses sign-in for an email after 10 wrong passwords, even with the right one', async () => {
    const ip = { 'x-forwarded-for': '203.0.113.10' };
    expect((await signupPOST(post('/api/auth/signup', { email: 'target@example.test', password: 'right-password' }, ip))).status).toBe(201);
    for (let i = 0; i < 10; i++) {
      expect((await loginPOST(post('/api/auth/login', { email: 'target@example.test', password: `guess-${i}` }, { 'x-forwarded-for': `198.51.100.${i}` }))).status).toBe(401);
    }
    const blocked = await loginPOST(post('/api/auth/login', { email: 'TARGET@example.test', password: 'right-password' }, ip));
    expect(blocked.status).toBe(429);
    expect((await blocked.json()).reason).toBe('too-many-attempts');
    expect(Number(blocked.headers.get('Retry-After'))).toBeGreaterThan(0);
  });

  it('a successful sign-in clears the failed count for that email', async () => {
    const ip = { 'x-forwarded-for': '203.0.113.20' };
    await signupPOST(post('/api/auth/signup', { email: 'forgetful@example.test', password: 'right-password' }, ip));
    for (let i = 0; i < 9; i++) await loginPOST(post('/api/auth/login', { email: 'forgetful@example.test', password: 'wrong' }, ip));
    expect((await loginPOST(post('/api/auth/login', { email: 'forgetful@example.test', password: 'right-password' }, ip))).status).toBe(200);
    for (let i = 0; i < 9; i++) await loginPOST(post('/api/auth/login', { email: 'forgetful@example.test', password: 'wrong' }, ip));
    expect((await loginPOST(post('/api/auth/login', { email: 'forgetful@example.test', password: 'right-password' }, ip))).status).toBe(200);
  });

  it('caps account creation at 5 per hour from one address', async () => {
    const ip = { 'x-forwarded-for': '203.0.113.30' };
    for (let i = 0; i < 5; i++) {
      expect((await signupPOST(post('/api/auth/signup', { email: `farm-${i}@example.test`, password: 'a-password' }, ip))).status).toBe(201);
    }
    const sixth = await signupPOST(post('/api/auth/signup', { email: 'farm-6@example.test', password: 'a-password' }, ip));
    expect(sixth.status).toBe(429);
    expect((await signupPOST(post('/api/auth/signup', { email: 'neighbour@example.test', password: 'a-password' }, { 'x-forwarded-for': '203.0.113.31' }))).status).toBe(201);
  });

  it('changes the password for the signed-in creator and rejects a wrong current password', async () => {
    const signup = await signupPOST(post('/api/auth/signup', { email: 'mover@example.test', password: 'old-password' }, { 'x-forwarded-for': '203.0.113.40' }));
    const cookie = `azma_session=${signup.cookies.get('azma_session')?.value}`;

    expect((await passwordPOST(post('/api/auth/password', { currentPassword: 'old-password', newPassword: 'new-password' }))).status).toBe(401);
    expect((await passwordPOST(post('/api/auth/password', { currentPassword: 'nope', newPassword: 'new-password' }, { Cookie: cookie }))).status).toBe(403);
    const ok = await passwordPOST(post('/api/auth/password', { currentPassword: 'old-password', newPassword: 'new-password' }, { Cookie: cookie }));
    expect(ok.status).toBe(200);
    expect((await loginPOST(post('/api/auth/login', { email: 'mover@example.test', password: 'new-password' }, { 'x-forwarded-for': '203.0.113.41' }))).status).toBe(200);
  });
});
