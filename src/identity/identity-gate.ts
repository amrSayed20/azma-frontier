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
 * What a signed-in Creator's trip through Google means for the account they are
 * already inside.
 *
 * `not-applicable` is not a failure. It means this identity has nothing to do
 * with the account holding the session, so the ordinary sign-in path should
 * decide — exactly as it did before this function existed.
 */
export type LinkOutcome =
  | { status: 'linked'; creatorId: string }
  | { status: 'already-linked'; creatorId: string }
  | { status: 'not-applicable' };

/**
 * Link Google to the account a Creator is ALREADY signed into, and verify it.
 *
 * ─── THE DEAD END THIS OPENS ────────────────────────────────────────────────
 *
 *   MEASURED on production 2026-10-30, on the Founder's own account: pressing
 *   «وثّق حسابك» sent a signed-in Creator to Google, and the callback handed
 *   the verified identity to `signInWithVerifiedIdentity` — which, finding an
 *   account that already held that address with no binding, refused with
 *   `email-belongs-to-existing-account` and bounced them to /signup. Pressing
 *   it again did the same, forever.
 *
 *   That refusal is RIGHT and stays: a sign-in must never claim an account it
 *   merely shares an address with, because a workspace administrator can
 *   reassign an address and hand a stranger someone's whole Vault.
 *
 *   But its own sentence promised a way out — «ادخل به أوّلاً، ثمّ اربط جوجل
 *   من إعداداتك» — and `linkVerifiedIdentity` had exactly ONE caller in the
 *   repository: the branch that mints a brand-new account. So every Creator
 *   whose account was made with an email and a password could never become
 *   VERIFIED, and therefore could never buy. The Empire offered a door it had
 *   not built.
 *
 * ─── WHY THIS IS SAFE WHERE A SIGN-IN IS NOT ────────────────────────────────
 *
 *   A sign-in asks «whose account is this address?» and must not guess. This
 *   asks a narrower question, and only after TWO independent proofs are already
 *   in hand: an unexpired session for this very account, and Google's own
 *   attestation of the same address. The reassigned-address attack needs the
 *   stranger to hold the session too — at which point they did not need Google.
 *
 *   The address must MATCH. Binding some other Google address to this account
 *   would open a second door from an address the account never claimed, so that
 *   case is declined rather than linked.
 */
export function linkVerifiedIdentityToSignedInCreator(
  creatorId: string,
  identity: VerifiedIdentity,
): LinkOutcome {
  const db = getDb();

  const bound = findIdentityByProviderSubject(db, identity.provider, identity.providerSubject);
  if (bound) {
    // Already this account's — the Creator pressed a button they did not need.
    if (bound.creatorId === creatorId) {
      touchIdentity(db, bound.identityId);
      return { status: 'already-linked', creatorId };
    }
    // It belongs to someone else. Nothing is linked and nothing is refused
    // here; the sign-in path owns that question and already answers it.
    return { status: 'not-applicable' };
  }

  const row = db
    .prepare('SELECT email FROM creators WHERE creator_id = ?')
    .get(creatorId) as { email?: unknown } | undefined;
  const accountEmail = typeof row?.email === 'string' ? row.email.trim().toLowerCase() : null;
  if (!accountEmail || accountEmail !== identity.email.trim().toLowerCase()) {
    return { status: 'not-applicable' };
  }

  linkVerifiedIdentity(db, creatorId, identity);
  return { status: 'linked', creatorId };
}

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
