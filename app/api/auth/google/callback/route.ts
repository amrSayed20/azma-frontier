import { NextRequest, NextResponse } from 'next/server';
import {
  exchangeCodeForIdToken,
  verifyGoogleIdToken,
  googleIdentityIsConfigured,
  safeEquals,
  GoogleIdentityError,
} from '@/src/identity/providers/google-identity-binding';
import { signInWithVerifiedIdentity } from '@/src/identity/identity-gate';
import { OAUTH_STATE_COOKIE, OAUTH_NONCE_COOKIE, redirectUriFor } from '../start/route';

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

/** Send the Creator somewhere real, with a reason they can act on. */
function refuse(request: NextRequest, reason: string): NextResponse {
  const url = new URL('/signup', request.nextUrl.origin);
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
    const idToken = await exchangeCodeForIdToken(code, redirectUriFor(request));
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

  const outcome = signInWithVerifiedIdentity(identity);
  if (outcome.status === 'failed') {
    return refuse(request, outcome.reason);
  }

  const destination = new URL('/imperial-foyer', request.nextUrl.origin);
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
