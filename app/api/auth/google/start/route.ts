import { NextRequest, NextResponse } from 'next/server';
import {
  authorizationUrl,
  googleIdentityIsConfigured,
  mintOAuthValue,
} from '@/src/identity/providers/google-identity-binding';

export const dynamic = 'force-dynamic';

/** Short-lived, httpOnly, and never readable by any script on the page. */
export const OAUTH_STATE_COOKIE = 'azma_oauth_state';
export const OAUTH_NONCE_COOKIE = 'azma_oauth_nonce';
/** A sign-in that takes longer than this is not a sign-in in progress. */
const OAUTH_TTL_SECONDS = 600;

/**
 * GET /api/auth/google/start — begin proving who you are.
 *
 * ─── WHY state AND nonce, AND WHY BOTH IN httpOnly COOKIES ──────────────────
 *
 *   `state` binds the callback to a request THIS browser started, so a link an
 *   attacker sends cannot complete a sign-in into their own account inside the
 *   victim's browser.
 *
 *   `nonce` binds the id_token itself to that same request, so a genuine token
 *   captured from somewhere else — another site sharing the same Google client,
 *   a log, a proxy — cannot be replayed into our callback.
 *
 *   Both live in httpOnly cookies rather than in sessionStorage. A value the
 *   page can read is a value an injected script can read, and the whole point
 *   of these two is that only the browser and this server ever hold them.
 */
export function redirectUriFor(request: NextRequest): string {
  // The server's own view of the request. Never a value from the query string:
  // a caller-supplied redirect_uri is how an OAuth flow gets pointed at an
  // attacker's callback.
  return `${request.nextUrl.origin}/api/auth/google/callback`;
}

export async function GET(request: NextRequest) {
  if (!googleIdentityIsConfigured()) {
    // The door is never offered blind. The Creator is told it is unavailable
    // rather than shown a failure that reads like their own mistake.
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'capability-unavailable',
        message: 'الدخول عبر جوجل غير متاحٍ حالياً.',
      },
      { status: 503 },
    );
  }

  const state = mintOAuthValue();
  const nonce = mintOAuthValue();

  const response = NextResponse.redirect(
    authorizationUrl({ redirectUri: redirectUriFor(request), state, nonce }),
  );

  const secure = process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false';
  for (const [name, value] of [[OAUTH_STATE_COOKIE, state], [OAUTH_NONCE_COOKIE, nonce]] as const) {
    response.cookies.set(name, value, {
      httpOnly: true,
      secure,
      // Google's callback is a top-level cross-site GET, which 'strict' would
      // strip — and a cookie that never arrives makes every sign-in fail.
      sameSite: 'lax',
      path: '/',
      maxAge: OAUTH_TTL_SECONDS,
    });
  }

  return response;
}
