import { NextResponse } from 'next/server';
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
 * The Empire's one authorized callback.
 *
 * ─── WHY A CONSTANT, AND NOT THE REQUEST'S ORIGIN ───────────────────────────
 *
 *   This was `${request.nextUrl.origin}/api/auth/google/callback`, and a unit
 *   test asserted it produced the authorized value. The test passed. Production
 *   did not. MEASURED against the live server the moment the credential landed:
 *
 *       redirect_uri = https://localhost:3000/api/auth/google/callback
 *
 *   Behind nginx, Next.js sees the internal host it was proxied to — 127.0.0.1
 *   on port 3000 — so `nextUrl.origin` is the private origin, not the public
 *   one. The test had constructed its NextRequest from the public URL, so it
 *   was testing the assumption rather than the deployment. Every sign-in would
 *   have died at Google with redirect_uri_mismatch, on Google's own screen,
 *   where nothing here could have explained it.
 *
 *   The repair is not to read X-Forwarded-Host. That header is set by nginx but
 *   is client-supplied in principle, and trusting it would make the callback
 *   address something an attacker can influence — trading a broken flow for a
 *   redirect-poisoning hole.
 *
 *   There is exactly ONE authorized redirect URI. It is a contract with Google,
 *   singular and fixed, so it is written here as one — with no branch at all.
 *
 *   A NODE_ENV branch was tried first and removed: Next's transform replaces
 *   `process.env.NODE_ENV` at compile time, so the tests could not exercise the
 *   production path, and a switch a test cannot reach is a switch nobody is
 *   checking. Local development against Google would need a second registered
 *   URI in any case, which this directive forbids — so there is nothing for a
 *   branch to serve.
 */
const AUTHORIZED_CALLBACK = 'https://azmaos.com/api/auth/google/callback';

export function redirectUriFor(): string {
  // Takes nothing, on purpose. Nothing a request carries — not its origin, not
  // its Host, not a query parameter — may influence where Google is told to
  // send the Creator back, and a function with no input cannot be influenced.
  return AUTHORIZED_CALLBACK;
}

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
 */export async function GET() {
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
    authorizationUrl({ redirectUri: redirectUriFor(), state, nonce }),
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
