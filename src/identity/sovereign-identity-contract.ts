/**
 * AZMA OS — The boundary between who a person is to Google, and who they are
 * to this Empire.
 *
 * ─── WHAT WAS MEASURED, BEFORE ANY OF THIS EXISTED ──────────────────────────
 *
 *   `POST /api/auth/signup` took an email string from the request body, made an
 *   account from it, and set a session cookie in the same response. The only
 *   thing standing between a stranger and a Creator account was:
 *
 *       /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *
 *   — a check that a string LOOKS like an address. Nothing anywhere in the
 *   repository proved a person could receive mail at it: zero matches for
 *   emailVerified, verificationToken, or any confirmation flow, and no column
 *   on `creators` to hold such a fact even if one existed.
 *
 * ─── WHY THIS FILE IS NOT "THE GOOGLE TYPES" ────────────────────────────────
 *
 *   Google is a Provider Binding. It answers one question — "is this really the
 *   person who can read mail at this address?" — and its answer is translated
 *   here into a shape that names Google nowhere.
 *
 *   Everything downstream of this boundary (users, ownership, authorization,
 *   subscriptions, projects, sovereign assets) sees only `VerifiedIdentity`. So
 *   replacing Google, or adding a second provider beside it, is a new binding
 *   and a new `ProviderId` — not a redesign of the Empire.
 *
 *   The test of that claim is concrete and worth stating: nothing outside
 *   `src/identity/providers/` may import a Google SDK, read an `id_token`, or
 *   know what `sub` means. If that ever stops being true, this boundary has
 *   failed regardless of what the types say.
 */

/**
 * Which external authority attested an identity.
 *
 * A string union rather than a free string: adding a provider is a deliberate
 * edit here, and every `switch` over it is then checked by the compiler.
 */
export type ProviderId = 'google';

/**
 * Whether the Empire has proof that the person controls the address on their
 * account.
 *
 * ─── WHY THE DEFAULT IS UNVERIFIED, AND STAYS THAT WAY ──────────────────────
 *
 *   Three accounts existed when this was written, including the Founder's. Not
 *   one carries any evidence of email ownership, because no mechanism to
 *   produce such evidence has ever existed in this system. They are therefore
 *   UNVERIFIED — not because anything suggests they are illegitimate, but
 *   because "we have no proof" is the only honest reading of "no proof exists".
 *
 *   Marking them VERIFIED at migration time would have been inventing a history
 *   — the same defect the Constitution forbids for legacy assets in Article
 *   5.5, in a place where it matters more.
 */
export enum VerificationState {
  /** No proof of address ownership has ever been presented. */
  UNVERIFIED = 'UNVERIFIED',
  /** An authentication provider attested it, and the server checked the attestation. */
  VERIFIED = 'VERIFIED',
}

/**
 * What a provider binding hands back after the SERVER has checked an
 * assertion. Constructing one of these is a claim that verification happened.
 *
 * There is deliberately no field here for anything provider-shaped: no token,
 * no raw claims, no expiry, no audience. Those belong to the binding that
 * verified them and must not outlive it.
 */
export interface VerifiedIdentity {
  readonly provider: ProviderId;
  /**
   * The provider's own permanent identifier for this person.
   *
   * NOT the email. An address can be relinquished, reassigned by a workspace
   * administrator, or simply changed — and an account bound to an address is an
   * account that changes hands when the address does. This is the stable half.
   */
  readonly providerSubject: string;
  /** The address the provider attested. Lowercased; never taken from a client. */
  readonly email: string;
  /** What the provider offers as a display name, if anything. */
  readonly displayName: string | null;
}

/**
 * The Empire's own account. Google has no authority over any field here.
 *
 * `creatorId` is minted by AZMA and is what every asset, project, session and
 * subscription is keyed on. If every provider binding were removed tomorrow,
 * this record and everything owned by it would be untouched.
 */
export interface AzmaIdentity {
  readonly creatorId: string;
  readonly email: string | null;
  readonly role: string;
  readonly verificationState: VerificationState;
}

/** A person is verified only when the Empire itself recorded the proof. */
export function isVerified(identity: { verificationState: VerificationState }): boolean {
  return identity.verificationState === VerificationState.VERIFIED;
}

/**
 * How an account's verification state is read for a row that predates the
 * column.
 *
 * A missing value is UNVERIFIED. Not "probably fine", not "grandfathered" —
 * absent proof is absent proof, and the one place that could quietly turn a
 * null into a VERIFIED is this function, so it is the one place that refuses to.
 */
export function verificationStateOf(raw: unknown): VerificationState {
  return raw === VerificationState.VERIFIED ? VerificationState.VERIFIED : VerificationState.UNVERIFIED;
}

/**
 * How an account is resolved from a verified identity.
 *
 * Every case is named because the dangerous ones are the cases nobody enumerated:
 * an existing address meeting a new provider identity is precisely where account
 * takeover lives.
 */
export enum IdentityResolution {
  /** No account, no binding. A new AZMA account is minted. */
  NEW_ACCOUNT = 'NEW_ACCOUNT',
  /** This provider subject is already bound. The same account is returned. */
  EXISTING_BINDING = 'EXISTING_BINDING',
  /**
   * An AZMA account holds this address, but no binding exists for this provider
   * subject.
   *
   * The account is NOT silently claimed and a second account is NOT minted. The
   * first would hand a stranger someone else's assets the moment a provider
   * reassigns an address; the second would split one person's work across two
   * accounts with the same address and leave the UNIQUE index to fail. The
   * Creator is told to sign in the way that account was made, and the link is a
   * separate, authenticated act.
   */
  EMAIL_EXISTS_UNLINKED = 'EMAIL_EXISTS_UNLINKED',
  /** This provider subject is bound to a different account than the one asked for. */
  BOUND_ELSEWHERE = 'BOUND_ELSEWHERE',
}
