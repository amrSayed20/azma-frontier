/**
 * AZMA OS — The identity gate: what it admits, and what it refuses.
 *
 * ─── THE DEFECT THIS HOLDS SHUT ─────────────────────────────────────────────
 *
 *   `POST /api/auth/signup` made an account from any string matching
 *   `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` and set a session cookie in the SAME
 *   response. Measured before this work: no verification flow existed anywhere
 *   in the repository, and `creators` had no column able to record one.
 *
 *   These tests hold the replacement, and they are written against the shape of
 *   the code rather than its politeness: the reason a client cannot set a
 *   verification state is that no function anywhere accepts one, and the test
 *   for that asserts on the exported surface itself.
 */

import { POST as SIGNUP } from '../../../app/api/auth/signup/route';
import { NextRequest } from 'next/server';

import { getDb, resetDbSingletonForTests, createCreator } from '../../persistent-storage';
import {
  resolveIdentity,
  linkVerifiedIdentity,
  verificationStateForCreator,
  findIdentityByProviderSubject,
  listIdentitiesForCreator,
} from '../../persistent-storage/authentication-identity-repository';
import { signInWithVerifiedIdentity } from '../identity-gate';
import {
  VerificationState,
  IdentityResolution,
  isVerified,
  verificationStateOf,
  type VerifiedIdentity,
} from '../sovereign-identity-contract';
import * as repository from '../../persistent-storage/authentication-identity-repository';
import * as gate from '../identity-gate';

const GOOGLE_IDENTITY: VerifiedIdentity = {
  provider: 'google',
  providerSubject: '117000000000000000001',
  email: 'person@example.com',
  displayName: 'A Person',
};

beforeEach(() => {
  process.env.AZMA_DB_PATH = ':memory:';
  resetDbSingletonForTests();
});
afterEach(() => resetDbSingletonForTests());

// ─── 1 · An address, on its own, proves nothing ──────────────────────────────

describe('an arbitrary email can no longer become an account', () => {
  it('the old registration route is CLOSED and names the real door', async () => {
    const response = await SIGNUP();
    expect(response.status).toBe(410);
    const body = await response.json();
    expect(body.reason).toBe('registration-requires-verified-identity');
    expect(body.registerAt).toBe('/api/auth/google/start');
  });

  it('no session is created by asking for registration', async () => {
    const before = getDb().prepare('SELECT COUNT(*) c FROM sessions').get() as { c: number };
    await SIGNUP();
    const after = getDb().prepare('SELECT COUNT(*) c FROM sessions').get() as { c: number };
    expect(after.c).toBe(before.c);
  });

  it('no account is created by asking for registration', async () => {
    await SIGNUP();
    const count = getDb().prepare('SELECT COUNT(*) c FROM creators').get() as { c: number };
    expect(count.c).toBe(0);
  });

  it('the route ignores a body entirely — there is nothing to send it', async () => {
    // Proving the shape: POST takes no request argument, so a crafted body has
    // nowhere to land. Calling it with one changes nothing.
    const withBody = SIGNUP as unknown as (r: NextRequest) => Promise<Response>;
    const response = await withBody(
      new NextRequest('http://localhost/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email: 'forged@example.com', verificationState: 'VERIFIED', role: 'founder' }),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    expect(response.status).toBe(410);
    expect((getDb().prepare('SELECT COUNT(*) c FROM creators').get() as { c: number }).c).toBe(0);
  });
});

// ─── 2 · Legacy accounts ─────────────────────────────────────────────────────

describe('accounts that predate the gate stay unverified', () => {
  it('an account created without a provider binding is UNVERIFIED', () => {
    const creator = createCreator(getDb(), {
      creatorId: 'legacy-1', email: 'legacy@azmaos.com', passwordHash: 'x', role: 'creator', displayName: null,
    });
    expect(verificationStateForCreator(getDb(), creator.creatorId)).toBe(VerificationState.UNVERIFIED);
    expect(isVerified({ verificationState: verificationStateForCreator(getDb(), creator.creatorId) })).toBe(false);
  });

  it('a Founder is not exempt — role is not proof of an address', () => {
    createCreator(getDb(), {
      creatorId: 'legacy-founder', email: 'founder@azmaos.com', passwordHash: 'x', role: 'founder', displayName: null,
    });
    expect(verificationStateForCreator(getDb(), 'legacy-founder')).toBe(VerificationState.UNVERIFIED);
  });

  it('a missing or unexpected stored value reads as UNVERIFIED, never as VERIFIED', () => {
    for (const raw of [null, undefined, '', 'verified', 'TRUE', 1, {}, 'VERIFIED_']) {
      expect(verificationStateOf(raw)).toBe(VerificationState.UNVERIFIED);
    }
    // Only the exact recorded value counts.
    expect(verificationStateOf('VERIFIED')).toBe(VerificationState.VERIFIED);
  });

  it('an unknown account is UNVERIFIED rather than an error that might be caught and ignored', () => {
    expect(verificationStateForCreator(getDb(), 'no-such-creator')).toBe(VerificationState.UNVERIFIED);
  });
});

// ─── 3 · The client cannot reach any of it ───────────────────────────────────

describe('verification state has no client-reachable path', () => {
  /**
   * Not "the route filters it out" — there is no parameter to filter. A value
   * the client sends would need a function that accepts one, and this asserts
   * that no such function is exported.
   */
  it('a state smuggled onto the identity object is ignored, not honoured', () => {
    // The realistic shape of the attack: a field that LOOKS like it belongs,
    // riding along on an object that does. Nothing reads it, so nothing can
    // act on it — and an account only ever becomes VERIFIED because the link
    // happened, never because something said so.
    const smuggled = {
      ...GOOGLE_IDENTITY,
      verificationState: 'VERIFIED',
      role: 'founder',
      creatorId: 'attacker-chosen-id',
      verified_at: 1,
    } as unknown as VerifiedIdentity;

    const outcome = gate.signInWithVerifiedIdentity(smuggled);
    if (outcome.status !== 'succeeded') throw new Error('expected success');

    // The id is AZMA's, not the one supplied.
    expect(outcome.creatorId).not.toBe('attacker-chosen-id');
    // The role is the default, not the one supplied.
    expect(outcome.role).toBe('creator');

    // And the stored binding carries only the four contract fields.
    const stored = repository.findIdentityByProviderSubject(getDb(), 'google', GOOGLE_IDENTITY.providerSubject)!;
    expect(stored.creatorId).toBe(outcome.creatorId);
    expect(Object.keys(stored)).not.toContain('verificationState');
    expect(Object.keys(stored)).not.toContain('role');
  });

  it('state is written ONLY as a consequence of linking a verified identity', () => {
    const creator = createCreator(getDb(), {
      creatorId: 'c-1', email: GOOGLE_IDENTITY.email, passwordHash: null, role: 'creator', displayName: null,
    });
    expect(verificationStateForCreator(getDb(), creator.creatorId)).toBe(VerificationState.UNVERIFIED);

    linkVerifiedIdentity(getDb(), creator.creatorId, GOOGLE_IDENTITY);
    expect(verificationStateForCreator(getDb(), creator.creatorId)).toBe(VerificationState.VERIFIED);
  });

  it('the binding and the state are written together or not at all', () => {
    const creator = createCreator(getDb(), {
      creatorId: 'c-2', email: GOOGLE_IDENTITY.email, passwordHash: null, role: 'creator', displayName: null,
    });
    linkVerifiedIdentity(getDb(), creator.creatorId, GOOGLE_IDENTITY);

    // A second link with the same subject violates the UNIQUE index.
    expect(() => linkVerifiedIdentity(getDb(), 'c-2', GOOGLE_IDENTITY)).toThrow();
    // And the rollback left exactly one binding, not two.
    expect(listIdentitiesForCreator(getDb(), 'c-2')).toHaveLength(1);
  });
});

// ─── 4 · Account resolution — where takeover lives ───────────────────────────

describe('one provider identity, one AZMA account', () => {
  it('a person the Empire has not met gets a new account and a session', () => {
    const outcome = signInWithVerifiedIdentity(GOOGLE_IDENTITY);
    expect(outcome.status).toBe('succeeded');
    if (outcome.status !== 'succeeded') return;

    expect(outcome.accountCreated).toBe(true);
    expect(outcome.sessionId).toBeTruthy();
    expect(verificationStateForCreator(getDb(), outcome.creatorId)).toBe(VerificationState.VERIFIED);
    // The AZMA id is AZMA's own — it is not the provider's subject.
    expect(outcome.creatorId).not.toBe(GOOGLE_IDENTITY.providerSubject);
    // And the account has no password, so there is no credential to guess.
    const row = getDb().prepare('SELECT password_hash, role FROM creators WHERE creator_id = ?')
      .get(outcome.creatorId) as { password_hash: unknown; role: string };
    expect(row.password_hash).toBeNull();
    expect(row.role).toBe('creator');
  });

  it('the SAME provider subject NEVER creates a second account', () => {
    const first = signInWithVerifiedIdentity(GOOGLE_IDENTITY);
    const second = signInWithVerifiedIdentity(GOOGLE_IDENTITY);
    if (first.status !== 'succeeded' || second.status !== 'succeeded') throw new Error('fixture');

    expect(second.accountCreated).toBe(false);
    expect(second.creatorId).toBe(first.creatorId);
    expect((getDb().prepare('SELECT COUNT(*) c FROM creators').get() as { c: number }).c).toBe(1);
    expect(listIdentitiesForCreator(getDb(), first.creatorId)).toHaveLength(1);
  });

  it('a changed email on the SAME subject follows the subject, not the address', () => {
    const first = signInWithVerifiedIdentity(GOOGLE_IDENTITY);
    if (first.status !== 'succeeded') throw new Error('fixture');

    const renamed = { ...GOOGLE_IDENTITY, email: 'renamed@example.com' };
    const second = signInWithVerifiedIdentity(renamed);
    if (second.status !== 'succeeded') throw new Error('fixture');

    expect(second.creatorId).toBe(first.creatorId);
    expect(second.accountCreated).toBe(false);
  });

  it('REFUSES to claim an account that holds the address but no binding', () => {
    // The takeover case: Google can reassign a workspace address to a different
    // human, and that human must not inherit the first one's Vault.
    createCreator(getDb(), {
      creatorId: 'someone-else', email: GOOGLE_IDENTITY.email, passwordHash: 'their-password', role: 'creator', displayName: null,
    });

    const outcome = signInWithVerifiedIdentity(GOOGLE_IDENTITY);
    expect(outcome.status).toBe('failed');
    if (outcome.status !== 'failed') return;
    expect(outcome.reason).toBe('email-belongs-to-existing-account');

    // No session, no second account, and the existing one untouched.
    expect((getDb().prepare('SELECT COUNT(*) c FROM sessions').get() as { c: number }).c).toBe(0);
    expect((getDb().prepare('SELECT COUNT(*) c FROM creators').get() as { c: number }).c).toBe(1);
    expect(verificationStateForCreator(getDb(), 'someone-else')).toBe(VerificationState.UNVERIFIED);
    expect(findIdentityByProviderSubject(getDb(), 'google', GOOGLE_IDENTITY.providerSubject)).toBeNull();
  });

  it('names every resolution case, so none is handled by falling through', () => {
    expect(resolveIdentity(getDb(), GOOGLE_IDENTITY).resolution).toBe(IdentityResolution.NEW_ACCOUNT);

    const outcome = signInWithVerifiedIdentity(GOOGLE_IDENTITY);
    if (outcome.status !== 'succeeded') throw new Error('fixture');
    expect(resolveIdentity(getDb(), GOOGLE_IDENTITY).resolution).toBe(IdentityResolution.EXISTING_BINDING);

    const otherPerson = { ...GOOGLE_IDENTITY, providerSubject: 'a-different-human' };
    expect(resolveIdentity(getDb(), otherPerson).resolution).toBe(IdentityResolution.EMAIL_EXISTS_UNLINKED);
  });
});

// ─── 5 · The session is the LAST thing to exist ──────────────────────────────

describe('a session is never created before verification', () => {
  it('a refused sign-in leaves no session behind', () => {
    createCreator(getDb(), {
      creatorId: 'holder', email: GOOGLE_IDENTITY.email, passwordHash: 'x', role: 'creator', displayName: null,
    });
    signInWithVerifiedIdentity(GOOGLE_IDENTITY);
    expect((getDb().prepare('SELECT COUNT(*) c FROM sessions').get() as { c: number }).c).toBe(0);
  });

  it('a session always belongs to an account that is already VERIFIED', () => {
    const outcome = signInWithVerifiedIdentity(GOOGLE_IDENTITY);
    if (outcome.status !== 'succeeded') throw new Error('fixture');

    const session = getDb().prepare('SELECT creator_id FROM sessions WHERE session_id = ?')
      .get(outcome.sessionId) as { creator_id: string };
    expect(verificationStateForCreator(getDb(), session.creator_id)).toBe(VerificationState.VERIFIED);
  });

  it('the role on the outcome is read from the database, not from the caller', () => {
    const outcome = signInWithVerifiedIdentity(GOOGLE_IDENTITY);
    if (outcome.status !== 'succeeded') throw new Error('fixture');
    getDb().prepare('UPDATE creators SET role = ? WHERE creator_id = ?').run('founder', outcome.creatorId);

    const second = signInWithVerifiedIdentity(GOOGLE_IDENTITY);
    if (second.status !== 'succeeded') throw new Error('fixture');
    expect(second.role).toBe('founder');
  });
});
