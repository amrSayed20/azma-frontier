import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForIdToken,
  verifyGoogleIdToken,
  googleIdentityIsConfigured,
  safeEquals,
  GoogleIdentityError,
} from '@/src/identity/providers/google-identity-binding';
import {
  signInWithVerifiedIdentity,
  linkVerifiedIdentityToSignedInCreator,
} from '@/src/identity/identity-gate';
import { verifySession } from '@/src/authentication';
import { OAUTH_STATE_COOKIE, OAUTH_NONCE_COOKIE, redirectUriFor, PUBLIC_ORIGIN } from '../start/route';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * GET /api/auth/google/callback — the only place an AZMA session is born from
 * an external identity.
 *
 * ─── THE ORDER ──────────────────────────────────────────────────────────────
 *
 *   state matches → exchange the code server-side → verify the id_token
 *   (signature, issuer, audience, expiry, nonce) → resolve the account →
 *   record the binding → ONLY THEN a session cookie.
 *
 *   Nothing the browser sent is read as fact. The code is opaque until Google
 *   redeems it against our secret; the token is untrusted until its signature
 *   is checked against Google's published keys; the email is whatever the
 *   VERIFIED payload says and nothing else.
 *
 * ─── WHAT THE CREATOR IS TOLD ───────────────────────────────────────────────
 *
 *   Every refusal lands on the sign-in page with a short reason in their own
 *   tongue. The provider's words, the rejection codes and the exception text
 *   stay on this side of the wire — an error naming an issuer or an audience
 *   is a debugging aid for us and an inventory for anyone probing.
 */

/**
 * Send the Creator somewhere real, with a reason they can act on.
 *
 * PUBLIC_ORIGIN, not request.nextUrl.origin. MEASURED on production: a
 * genuine sign-in completed — account created, identity verified, binding
 * recorded, session cookie set — and the Creator was then redirected to
 * http://localhost:3000, where their browser showed ERR_CONNECTION_REFUSED.
 * Behind nginx that is the private origin Next.js was proxied to. The whole
 * journey worked and the last instruction sent them nowhere.
 */
function refuse(request: NextRequest, reason: string): NextResponse {
  const url = new URL('/signup', PUBLIC_ORIGIN);
  url.searchParams.set('identity', reason);
  const response = NextResponse.redirect(url);
  clearOAuthCookies(response);
  return response;
}

function clearOAuthCookies(response: NextResponse): void {
  for (const name of [OAUTH_STATE_COOKIE, OAUTH_NONCE_COOKIE]) {
    response.cookies.set(name, '', { httpOnly: true, path: '/', maxAge: 0 });
  }
}

export async function GET(request: NextRequest) {
  if (!googleIdentityIsConfigured()) return refuse(request, 'unavailable');

  // Google reports its own refusals here — a Creator who pressed "cancel"
  // arrives with ?error=access_denied and has done nothing wrong.
  if (request.nextUrl.searchParams.get('error')) return refuse(request, 'cancelled');

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;
  const expectedNonce = request.cookies.get(OAUTH_NONCE_COOKIE)?.value;

  // ── The callback must belong to a sign-in THIS browser started ───────────
  if (!code || !state || !expectedState || !expectedNonce) return refuse(request, 'invalid-callback');
  if (!safeEquals(state, expectedState)) return refuse(request, 'invalid-callback');

  let identity;
  try {
    const idToken = await exchangeCodeForIdToken(code, redirectUriFor());
    // The token is verified even though it came straight from Google over the
    // back channel. A check that is skipped when the source "looks trusted" is
    // a check that disappears the first time the source changes.
    identity = await verifyGoogleIdToken(idToken, expectedNonce);
  } catch (err) {
    // Rejection codes and provider text stay server-side.
    console.error('[GoogleIdentity] verification failed:', err);
    const rejection = err instanceof GoogleIdentityError ? err.rejection : null;
    // One case is genuinely the person's own situation and is worth saying:
    // Google itself has not confirmed their address.
    return refuse(request, rejection === 'EMAIL_NOT_VERIFIED' ? 'email-not-verified' : 'verification-failed');
  }

  // ── A Creator who is ALREADY inside is verifying, not signing in ─────────
  //
  //   The one place that offers this to a signed-in Creator is the Balance
  //   page's «وثّق حسابك», and before this branch existed their journey ended
  //   at /signup telling them an account already holds their address — which
  //   was their own. They are sent back where they pressed it, and their
  //   session continues untouched: no new cookie is minted for a person who
  //   never left.
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (session) {
    const link = linkVerifiedIdentityToSignedInCreator(session.creatorId, identity);
    if (link.status === 'linked' || link.status === 'already-linked') {
      const back = new URL('/sovereign-balance', PUBLIC_ORIGIN);
      back.searchParams.set('identity', 'verified');
      const response = NextResponse.redirect(back);
      clearOAuthCookies(response);
      return response;
    }
    // `not-applicable` — this identity is not this account's. The sign-in path
    // below decides, exactly as it did before.
  }

  const outcome = signInWithVerifiedIdentity(identity);
  if (outcome.status === 'failed') {
    return refuse(request, outcome.reason);
  }

  const destination = new URL('/imperial-foyer', PUBLIC_ORIGIN);
  destination.searchParams.set('identity', outcome.accountCreated ? 'welcome' : 'verified');

  const response = NextResponse.redirect(destination);
  response.cookies.set(SESSION_COOKIE, outcome.sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false',
    sameSite: 'lax',
    path: '/',
    expires: new Date(outcome.expiresAt),
  });
  clearOAuthCookies(response);
  return response;
}
