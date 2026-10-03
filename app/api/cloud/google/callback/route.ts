import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage';
import { safeEquals } from '@/src/identity/providers/google-identity-binding';
import { googleDriveDestination } from '@/src/cloud-destinations/google-drive-destination';
import { linkCloudAccount } from '@/src/cloud-destinations/cloud-account-repository';
import { cloudRedirectUriFor, LINK_STATE_COOKIE, LINK_NONCE_COOKIE } from '../start/route';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * Where the Creator lands afterwards, in every outcome.
 *
 * A constant for the same reason the redirect URI is one: this is a
 * server-issued redirect, and a destination a request could influence is an
 * open redirect. The outcome travels as a short code the Chamber speaks in
 * Arabic — never as a provider's message, and never as a token.
 */
const RETURN_TO = 'https://azmaos.com/makman-al-ghayah';

function back(outcome: string): NextResponse {
  // ── EVERY ENDING LEAVES A TRACE ─────────────────────────────────────────
  //   MEASURED 2026-10-03: a real link attempt ended with no account stored
  //   and NOTHING in the server log, because four of this route's six endings
  //   returned silently. The one failure that did log was the only one that
  //   could not have been the cause, so the evidence pointed nowhere.
  //
  //   The outcome is a short word this file chose — never a token, never a
  //   code, never anything Google sent. A route that can fail six ways must
  //   be able to say which.
  console.log('[cloud/google] outcome:', outcome);
  const response = NextResponse.redirect(`${RETURN_TO}?cloud=${encodeURIComponent(outcome)}`);
  // The one-use values are spent whatever happened. A state cookie that
  // outlives its exchange is a state cookie that can be replayed.
  for (const name of [LINK_STATE_COOKIE, LINK_NONCE_COOKIE]) {
    response.cookies.set(name, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
  }
  return response;
}

/**
 * GET /api/cloud/google/callback — the Creator granted, or did not.
 *
 * ─── EVERY REFUSAL IS A REDIRECT, NOT AN ERROR PAGE ─────────────────────────
 *
 *   The Creator arrives here from Google's own screen. Showing them raw JSON
 *   at an address they did not type would end the journey in a place that
 *   cannot explain itself. They are returned to the Chamber with a code it
 *   speaks, whatever happened.
 *
 * ─── AND NOTHING FROM GOOGLE IS TRUSTED UNTIL state MATCHES ─────────────────
 *
 *   `state` is compared in constant time against the httpOnly cookie minted
 *   when this browser started the link. Without it, a link an attacker sends
 *   could complete a grant into the victim's Empire account.
 */
export async function GET(request: NextRequest) {
  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value ?? '');
  if (!session) return back('unauthorized');

  // The Creator may simply have pressed «Cancel» on Google's screen.
  const error = request.nextUrl.searchParams.get('error');
  if (error) return back('declined');

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(LINK_STATE_COOKIE)?.value;
  const nonce = request.cookies.get(LINK_NONCE_COOKIE)?.value;

  if (!code || !state || !expectedState || !nonce) return back('expired');
  if (!safeEquals(state, expectedState)) return back('mismatch');

  try {
    const grant = await googleDriveDestination.exchangeCode(code, cloudRedirectUriFor(), nonce);
    linkCloudAccount(getDb(), {
      creatorId: session.creatorId,
      provider: 'google-drive',
      providerAccountId: grant.accountId,
      accountLabel: grant.accountLabel,
      refreshToken: grant.refreshToken,
      scopes: grant.scopes,
    });
    return back('linked');
  } catch (err) {
    // Google's body can echo request parameters, and a refresh token is the
    // one thing that must never reach a log. Only a short reason is recorded.
    const detail = err instanceof Error ? err.message : 'unknown';
    console.error('[cloud/google] link failed:', detail.slice(0, 120));
    // «no refresh_token» has a specific remedy the Chamber can name, so it is
    // distinguished from every other failure rather than flattened into one.
    return back(detail.includes('no refresh_token') ? 'already-granted' : 'failed');
  }
}
