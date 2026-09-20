import { createPublicKey, createVerify, randomBytes, timingSafeEqual } from 'crypto';
import type { JsonWebKey as NodeJsonWebKey } from 'crypto';
import type { ProviderId, VerifiedIdentity } from '../sovereign-identity-contract';

/**
 * AZMA OS — Google, as a Provider Binding and nothing more.
 *
 * ─── THE ONE THING THIS FILE IS FOR ─────────────────────────────────────────
 *
 *   Turning something a browser handed us into something the server has proven.
 *
 *   Everything that arrives from a browser in an OAuth flow is attacker-
 *   controlled until verified: the code, the state, the id_token, and above all
 *   the claims inside it. An `id_token` is three base64url segments a client can
 *   trivially rewrite — decoding one and reading `email_verified` out of it,
 *   without checking the signature, is indistinguishable from asking the
 *   attacker what their email address is. That is the single most common way
 *   this integration is built wrong, so it is the thing checked hardest here.
 *
 * ─── WHAT IS ACTUALLY CHECKED, AND WHY EACH ONE ─────────────────────────────
 *
 *     signature   — against Google's published keys, fetched from Google, over
 *                   the exact bytes signed. Without this every other check is
 *                   theatre, because an attacker forges the claims too.
 *     iss         — accounts.google.com. A validly-signed token from a
 *                   different issuer is a valid token belonging to someone
 *                   else's system.
 *     aud         — OUR client id. Google signs tokens for every application
 *                   it serves; one issued to a different app is genuine, and
 *                   accepting it lets that app's owner log in as anyone here.
 *     exp / iat   — an assertion is a statement about a moment.
 *     nonce       — ties the token to the request WE started, so one captured
 *                   elsewhere cannot be replayed into our callback.
 *     sub         — present and non-empty; it is the account's real anchor.
 *     email_verified — from the VERIFIED payload, never from anywhere else.
 *                   Google itself will hand out an unverified address.
 *
 *   No other module may import this file's internals. What leaves here is a
 *   `VerifiedIdentity`, which names no provider-specific concept — that is what
 *   makes Google replaceable.
 *
 * ─── SECRETS ────────────────────────────────────────────────────────────────
 *
 *   GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are read from the environment at
 *   CALL time, never frozen into a module constant — the defect this repository
 *   has now produced four times. Neither value is logged, returned, embedded in
 *   an error, or written to any report.
 */

export const GOOGLE_PROVIDER: ProviderId = 'google';

const GOOGLE_ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
const GOOGLE_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs';
const GOOGLE_TOKEN_URI = 'https://oauth2.googleapis.com/token';
const GOOGLE_AUTH_URI = 'https://accounts.google.com/o/oauth2/v2/auth';

/** Tolerance for clock drift between Google and this server. */
const CLOCK_SKEW_SECONDS = 120;

export type GoogleRejection =
  | 'NOT_CONFIGURED'
  | 'MALFORMED_TOKEN'
  | 'UNKNOWN_KEY'
  | 'BAD_SIGNATURE'
  | 'BAD_ISSUER'
  | 'BAD_AUDIENCE'
  | 'EXPIRED'
  | 'NOT_YET_VALID'
  | 'NONCE_MISMATCH'
  | 'EMAIL_NOT_VERIFIED'
  | 'NO_SUBJECT'
  | 'NO_EMAIL'
  | 'EXCHANGE_FAILED';

export class GoogleIdentityError extends Error {
  constructor(public readonly rejection: GoogleRejection, detail?: string) {
    // The detail never carries a token, a secret, or a claim value.
    super(`[GoogleIdentity] ${rejection}${detail ? `: ${detail}` : ''}`);
    this.name = 'GoogleIdentityError';
  }
}

/** Read at call time. Never a module constant. */
function clientId(): string | undefined { return process.env.GOOGLE_CLIENT_ID; }
function clientSecret(): string | undefined { return process.env.GOOGLE_CLIENT_SECRET; }

/**
 * Whether the binding can operate at all.
 *
 * The Creator is never offered a door that cannot open — the same rule the
 * image-editing capability follows.
 */
export function googleIdentityIsConfigured(): boolean {
  return Boolean(clientId() && clientSecret());
}

/** Unguessable, and compared in constant time. */
export function mintOAuthValue(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * Compare two opaque values without leaking their contents through timing.
 *
 * `state` and `nonce` are secrets for the length of one sign-in, and `===` on
 * a secret is a habit worth not having.
 */
export function safeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Where the Creator is sent to prove who they are. */
export function authorizationUrl(input: {
  redirectUri: string;
  state: string;
  nonce: string;
}): string {
  const id = clientId();
  if (!id) throw new GoogleIdentityError('NOT_CONFIGURED');

  const url = new URL(GOOGLE_AUTH_URI);
  url.searchParams.set('client_id', id);
  url.searchParams.set('redirect_uri', input.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('state', input.state);
  url.searchParams.set('nonce', input.nonce);
  // An address Google itself has not confirmed is of no use to us, and
  // prompting keeps a shared browser from silently reusing a session.
  url.searchParams.set('prompt', 'select_account');
  return url.toString();
}

/**
 * One of Google's published signing keys.
 *
 * Extends Node's own JsonWebKey so the object can be handed straight to
 * createPublicKey — the modulus and exponent are never hand-parsed here, which
 * is one fewer place to get RSA wrong.
 */
interface GoogleJwk extends NodeJsonWebKey {
  kid: string;
}

/**
 * Google's signing keys, fetched from Google.
 *
 * Deliberately not cached across requests in this first version: a stale key
 * set causes a sign-in to fail, while a wrongly-cached one causes a forged
 * token to be accepted. Correctness first; caching is an optimisation that can
 * be added once there is traffic to justify it.
 */
async function fetchGoogleKeys(): Promise<GoogleJwk[]> {
  const response = await fetch(GOOGLE_JWKS_URI, { signal: AbortSignal.timeout(10_000) });
  if (!response.ok) throw new GoogleIdentityError('UNKNOWN_KEY', `jwks HTTP ${response.status}`);
  const body = (await response.json()) as { keys?: GoogleJwk[] };
  return body.keys ?? [];
}

function base64UrlToJson(segment: string): Record<string, unknown> {
  const json = Buffer.from(segment, 'base64url').toString('utf8');
  return JSON.parse(json) as Record<string, unknown>;
}

/**
 * Verify an id_token and return what it proves.
 *
 * Throws on every failure, and the throw names only a rejection code — never a
 * claim, never the token.
 */
export async function verifyGoogleIdToken(
  idToken: string,
  expectedNonce: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<VerifiedIdentity> {
  const id = clientId();
  if (!id) throw new GoogleIdentityError('NOT_CONFIGURED');

  const parts = idToken.split('.');
  if (parts.length !== 3) throw new GoogleIdentityError('MALFORMED_TOKEN');
  const [headerSegment, payloadSegment, signatureSegment] = parts;

  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = base64UrlToJson(headerSegment);
    payload = base64UrlToJson(payloadSegment);
  } catch {
    throw new GoogleIdentityError('MALFORMED_TOKEN');
  }

  // ── The signature, FIRST ─────────────────────────────────────────────────
  //
  // Nothing below may read a claim before this passes. Ordering is not a
  // style choice here: a check performed on unverified claims proves nothing,
  // and an early `return` on one of them would be a hole.
  const kid = typeof header.kid === 'string' ? header.kid : null;
  const alg = typeof header.alg === 'string' ? header.alg : null;
  // `alg: none`, and any algorithm substitution, ends here.
  if (alg !== 'RS256') throw new GoogleIdentityError('BAD_SIGNATURE', 'unexpected alg');
  if (!kid) throw new GoogleIdentityError('UNKNOWN_KEY');

  const keys = await fetchGoogleKeys();
  const jwk = keys.find((k) => k.kid === kid);
  if (!jwk) throw new GoogleIdentityError('UNKNOWN_KEY');

  // Google publishes JWK; Node builds a key object from it directly, so the
  // modulus and exponent are never hand-parsed here.
  const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
  const verifier = createVerify('RSA-SHA256');
  verifier.update(`${headerSegment}.${payloadSegment}`);
  verifier.end();
  if (!verifier.verify(publicKey, Buffer.from(signatureSegment, 'base64url'))) {
    throw new GoogleIdentityError('BAD_SIGNATURE');
  }

  // ── Only now are the claims worth reading ────────────────────────────────
  const iss = typeof payload.iss === 'string' ? payload.iss : '';
  if (!GOOGLE_ISSUERS.includes(iss)) throw new GoogleIdentityError('BAD_ISSUER');

  // `aud` may be a string or an array; both forms must name us.
  const aud = payload.aud;
  const audiences = Array.isArray(aud) ? aud : [aud];
  if (!audiences.some((a) => typeof a === 'string' && safeEquals(a, id))) {
    throw new GoogleIdentityError('BAD_AUDIENCE');
  }

  const exp = typeof payload.exp === 'number' ? payload.exp : 0;
  const iat = typeof payload.iat === 'number' ? payload.iat : 0;
  if (exp + CLOCK_SKEW_SECONDS < nowSeconds) throw new GoogleIdentityError('EXPIRED');
  if (iat - CLOCK_SKEW_SECONDS > nowSeconds) throw new GoogleIdentityError('NOT_YET_VALID');

  const nonce = typeof payload.nonce === 'string' ? payload.nonce : '';
  if (!nonce || !safeEquals(nonce, expectedNonce)) throw new GoogleIdentityError('NONCE_MISMATCH');

  const sub = typeof payload.sub === 'string' ? payload.sub.trim() : '';
  if (!sub) throw new GoogleIdentityError('NO_SUBJECT');

  // Google hands out addresses it has NOT confirmed. Accepting one would
  // reintroduce the exact defect this whole gate exists to close, through the
  // front door instead of the back.
  if (payload.email_verified !== true) throw new GoogleIdentityError('EMAIL_NOT_VERIFIED');

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : '';
  if (!email) throw new GoogleIdentityError('NO_EMAIL');

  const name = typeof payload.name === 'string' && payload.name.trim().length > 0
    ? payload.name.trim()
    : null;

  return { provider: GOOGLE_PROVIDER, providerSubject: sub, email, displayName: name };
}

/**
 * Exchange the authorization code for an id_token.
 *
 * The code goes to Google over the back channel with our client secret; the
 * browser never holds either. The returned token is NOT trusted for having come
 * from this exchange — it goes through `verifyGoogleIdToken` like any other.
 */
export async function exchangeCodeForIdToken(code: string, redirectUri: string): Promise<string> {
  const id = clientId();
  const secret = clientSecret();
  if (!id || !secret) throw new GoogleIdentityError('NOT_CONFIGURED');

  const response = await fetch(GOOGLE_TOKEN_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: id,
      client_secret: secret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
    signal: AbortSignal.timeout(15_000),
  });

  if (!response.ok) {
    // Google's body can echo request parameters. Only the status leaves here.
    throw new GoogleIdentityError('EXCHANGE_FAILED', `HTTP ${response.status}`);
  }

  const body = (await response.json()) as { id_token?: unknown };
  if (typeof body.id_token !== 'string' || body.id_token.length === 0) {
    throw new GoogleIdentityError('EXCHANGE_FAILED', 'no id_token');
  }
  return body.id_token;
}
