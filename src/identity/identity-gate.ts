import { randomUUID } from 'crypto';
import { getDb, createCreator, createSession } from '../persistent-storage';
import {
  resolveIdentity,
  linkVerifiedIdentity,
  touchIdentity,
  findIdentityByProviderSubject,
} from '../persistent-storage/authentication-identity-repository';
import { generateSessionId } from '../authentication/session-token';
import { IdentityResolution, type VerifiedIdentity } from './sovereign-identity-contract';

/**
 * AZMA OS — Where a verified identity becomes an AZMA account and a session.
 *
 * ─── THE ORDER, WHICH IS THE SAFETY ─────────────────────────────────────────
 *
 *   verify (already done, by a provider binding)
 *     → resolve against accounts that exist
 *       → mint or return an account
 *         → record the binding and the proof
 *           → ONLY THEN a session
 *
 *   The old path ran that backwards: `signUp()` created an account from an
 *   unproven string and set a session cookie in the same response, so the
 *   session was the FIRST thing to exist rather than the last. This function
 *   takes a `VerifiedIdentity`, a value that cannot be constructed without a
 *   server-side check, so there is no argument through which an unverified
 *   sign-in could enter.
 */

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type GateOutcome =
  | {
      status: 'succeeded';
      creatorId: string;
      role: string;
      sessionId: string;
      expiresAt: number;
      accountCreated: boolean;
    }
  | { status: 'failed'; reason: 'email-belongs-to-existing-account'; message: string };

/**
 * Sign a verified person in, creating their AZMA account if this is their first
 * visit.
 *
 * Returns a failure — never a session — for the one case that looks harmless
 * and is not: an address that already belongs to an account made another way.
 */
export function signInWithVerifiedIdentity(identity: VerifiedIdentity): GateOutcome {
  const db = getDb();
  const { resolution, creatorId } = resolveIdentity(db, identity);

  if (resolution === IdentityResolution.EXISTING_BINDING && creatorId) {
    const bound = findIdentityByProviderSubject(db, identity.provider, identity.providerSubject);
    if (bound) touchIdentity(db, bound.identityId);
    return { ...issueSession(creatorId), accountCreated: false };
  }

  if (resolution === IdentityResolution.EMAIL_EXISTS_UNLINKED) {
    // NOT claimed, NOT duplicated.
    //
    // Claiming it would hand this person another's entire Vault the moment a
    // workspace administrator reassigns an address — which Google permits.
    // Duplicating it would split one address across two accounts and break on
    // the UNIQUE index anyway. The Creator is told, in their own tongue, to
    // enter the way that account was made; linking is a separate authenticated
    // act, not something that happens silently during a sign-in.
    return {
      status: 'failed',
      reason: 'email-belongs-to-existing-account',
      message: 'يوجد حسابٌ بهذا البريد أُنشئ بطريقةٍ أخرى. ادخل به أوّلاً، ثمّ اربط جوجل من إعداداتك.',
    };
  }

  // ── A person the Empire has not met ──────────────────────────────────────
  //
  // creatorId is minted HERE, by AZMA. It is not derived from the provider's
  // subject, not a hash of the email, and carries nothing Google gave us — so
  // the account's identity survives the provider being replaced or removed.
  const creator = createCreator(db, {
    creatorId: randomUUID(),
    email: identity.email,
    // No password. This account has no password-shaped way in, so there is no
    // credential to guess, stuff, or reset through the address.
    passwordHash: null,
    role: 'creator',
    displayName: identity.displayName,
  });

  // The binding and the verification state, in one transaction — before any
  // session exists.
  linkVerifiedIdentity(db, creator.creatorId, identity);

  return { ...issueSession(creator.creatorId), accountCreated: true };
}

function issueSession(creatorId: string): Extract<GateOutcome, { status: 'succeeded' }> {
  const db = getDb();
  const sessionId = generateSessionId();
  const session = createSession(db, sessionId, creatorId, SESSION_TTL_MS);
  const role = (db.prepare('SELECT role FROM creators WHERE creator_id = ?').get(creatorId) as
    { role?: unknown } | undefined)?.role;
  return {
    status: 'succeeded',
    creatorId,
    // Read from the database, never from anything the caller supplied.
    role: typeof role === 'string' ? role : 'creator',
    sessionId,
    expiresAt: session.expiresAt,
    accountCreated: false,
  };
}
