/**
 * AZMA OS — المبدعُ يُوثِّق الحسابَ الذي هو داخلَه.
 *
 * ─── THE DEAD END, MEASURED ─────────────────────────────────────────────────
 *
 *   2026-10-30, on production, on the Founder's own account. He pressed
 *   «وثّق حسابك» on the Balance page, Google verified him, and he landed on
 *   /signup?identity=email-belongs-to-existing-account. He pressed it again and
 *   landed there again. The account that "already held the address" was his.
 *
 *   The cause was not the refusal — that refusal is correct and these tests
 *   keep it. The cause was that `linkVerifiedIdentity` had exactly one caller
 *   in the whole repository, inside the branch that mints a NEW account. So an
 *   account made with an email and a password could never become VERIFIED, and
 *   the purchase road, which asks for VERIFIED, was shut to it forever.
 *
 *   Each test below holds one rule of the door that was opened.
 */

import { mkdtempSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

const DB_PATH = join(mkdtempSync(join(tmpdir(), 'azma-identity-')), 'identity.db');
process.env.AZMA_DB_PATH = DB_PATH;

import { getDb, createCreator } from '../../persistent-storage';
import {
  verificationStateForCreator,
  linkVerifiedIdentity,
  listIdentitiesForCreator,
} from '../../persistent-storage/authentication-identity-repository';
import { VerificationState, type VerifiedIdentity } from '../sovereign-identity-contract';
import {
  linkVerifiedIdentityToSignedInCreator,
  signInWithVerifiedIdentity,
} from '../identity-gate';

let seq = 0;
const googleIdentity = (email: string, subject?: string): VerifiedIdentity => ({
  provider: 'google',
  providerSubject: subject ?? `google-subject-${(seq += 1)}`,
  email,
  displayName: 'مبدع',
});

/** An account made the old way: an address and a password, never verified. */
function passwordAccount(email: string): string {
  const creatorId = `creator_${(seq += 1)}_${Date.now()}`;
  createCreator(getDb(), {
    creatorId,
    email,
    passwordHash: 'scrypt$not$a$real$hash',
    role: 'creator',
    displayName: 'مبدع',
  });
  return creatorId;
}

describe('١ · الحلقة المغلقة تنكسر', () => {
  it('a signed-in Creator verifying their own address becomes VERIFIED', () => {
    const email = `founder-${seq + 1}@azma.test`;
    const creatorId = passwordAccount(email);
    expect(verificationStateForCreator(getDb(), creatorId)).toBe(VerificationState.UNVERIFIED);

    const outcome = linkVerifiedIdentityToSignedInCreator(creatorId, googleIdentity(email));

    expect(outcome).toEqual({ status: 'linked', creatorId });
    expect(verificationStateForCreator(getDb(), creatorId)).toBe(VerificationState.VERIFIED);
  });

  it('the binding is recorded on THEIR account, not a second one', () => {
    const email = `one-account-${seq + 1}@azma.test`;
    const creatorId = passwordAccount(email);
    linkVerifiedIdentityToSignedInCreator(creatorId, googleIdentity(email));

    const identities = listIdentitiesForCreator(getDb(), creatorId);
    expect(identities).toHaveLength(1);
    expect(identities[0].creatorId).toBe(creatorId);
    expect(identities[0].provider).toBe('google');
  });

  it('the address is matched without regard to case or stray spaces', () => {
    const email = `mixed-case-${seq + 1}@azma.test`;
    const creatorId = passwordAccount(email);

    const outcome = linkVerifiedIdentityToSignedInCreator(
      creatorId,
      googleIdentity(`  ${email.toUpperCase()}  `),
    );

    expect(outcome.status).toBe('linked');
  });

  it('pressing it twice is harmless — the second press changes nothing', () => {
    const email = `twice-${seq + 1}@azma.test`;
    const creatorId = passwordAccount(email);
    const identity = googleIdentity(email);

    expect(linkVerifiedIdentityToSignedInCreator(creatorId, identity).status).toBe('linked');
    expect(linkVerifiedIdentityToSignedInCreator(creatorId, identity).status).toBe('already-linked');

    expect(listIdentitiesForCreator(getDb(), creatorId)).toHaveLength(1);
    expect(verificationStateForCreator(getDb(), creatorId)).toBe(VerificationState.VERIFIED);
  });
});

describe('٢ · ما لا يُفتَح، ولو كانت الجلسة صحيحة', () => {
  it('a DIFFERENT Google address is not bound to this account', () => {
    // Binding it would open a second way in from an address the account never
    // claimed. The session proves who they are; it does not make a stranger's
    // address theirs.
    const creatorId = passwordAccount(`mine-${seq + 1}@azma.test`);

    const outcome = linkVerifiedIdentityToSignedInCreator(
      creatorId,
      googleIdentity(`someone-else-${seq + 1}@azma.test`),
    );

    expect(outcome).toEqual({ status: 'not-applicable' });
    expect(verificationStateForCreator(getDb(), creatorId)).toBe(VerificationState.UNVERIFIED);
    expect(listIdentitiesForCreator(getDb(), creatorId)).toHaveLength(0);
  });

  it('an identity already bound to another account is left alone', () => {
    const otherEmail = `other-${seq + 1}@azma.test`;
    const otherCreator = passwordAccount(otherEmail);
    const identity = googleIdentity(otherEmail);
    linkVerifiedIdentity(getDb(), otherCreator, identity);

    const mine = passwordAccount(`me-${seq + 1}@azma.test`);
    const outcome = linkVerifiedIdentityToSignedInCreator(mine, identity);

    expect(outcome).toEqual({ status: 'not-applicable' });
    // The other account keeps its single binding; mine gained nothing.
    expect(listIdentitiesForCreator(getDb(), otherCreator)).toHaveLength(1);
    expect(listIdentitiesForCreator(getDb(), mine)).toHaveLength(0);
    expect(verificationStateForCreator(getDb(), mine)).toBe(VerificationState.UNVERIFIED);
  });

  it('an account that does not exist links nothing', () => {
    const outcome = linkVerifiedIdentityToSignedInCreator(
      'creator_that_never_existed',
      googleIdentity(`ghost-${seq + 1}@azma.test`),
    );
    expect(outcome).toEqual({ status: 'not-applicable' });
  });
});

describe('٣ · الرفض الأصلي باقٍ كما هو', () => {
  it('a SIGN-IN still refuses to claim an account that merely shares the address', () => {
    // This is the guard the whole design rests on, and the repair must not
    // have loosened it: without a session, Google proving an address is NOT
    // proof that the account holding it is yours.
    const email = `unlinked-${seq + 1}@azma.test`;
    passwordAccount(email);

    const outcome = signInWithVerifiedIdentity(googleIdentity(email));

    expect(outcome.status).toBe('failed');
    if (outcome.status === 'failed') {
      expect(outcome.reason).toBe('email-belongs-to-existing-account');
    }
  });

  it('and a first-time visitor still gets an account and a session', () => {
    const outcome = signInWithVerifiedIdentity(googleIdentity(`brand-new-${seq + 1}@azma.test`));

    expect(outcome.status).toBe('succeeded');
    if (outcome.status === 'succeeded') {
      expect(outcome.accountCreated).toBe(true);
      expect(verificationStateForCreator(getDb(), outcome.creatorId)).toBe(VerificationState.VERIFIED);
    }
  });
});

describe('٤ · الطريق يستدعي الباب', () => {
  const route = require('fs').readFileSync(
    join(process.cwd(), 'app/api/auth/google/callback/route.ts'),
    'utf8',
  ) as string;

  it('the callback asks whether a session is already open, before signing anyone in', () => {
    expect(route).toContain('linkVerifiedIdentityToSignedInCreator(session.creatorId, identity)');
    expect(route.indexOf('linkVerifiedIdentityToSignedInCreator'))
      .toBeLessThan(route.indexOf('signInWithVerifiedIdentity(identity)'));
  });

  it('a Creator who never left is not given a new session', () => {
    const linked = route.slice(route.indexOf('if (session) {'), route.indexOf('const outcome ='));
    expect(linked).not.toContain('cookies.set(SESSION_COOKIE');
    expect(linked).toContain("new URL('/sovereign-balance', PUBLIC_ORIGIN)");
  });
});
