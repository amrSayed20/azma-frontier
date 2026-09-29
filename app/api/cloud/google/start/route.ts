import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/src/authentication';
import { mintOAuthValue } from '@/src/identity/providers/google-identity-binding';
import { isTokenVaultConfigured } from '@/src/cloud-destinations/token-vault';
import { googleDriveDestination } from '@/src/cloud-destinations/google-drive-destination';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
export const LINK_STATE_COOKIE = 'azma_cloud_state';
export const LINK_NONCE_COOKIE = 'azma_cloud_nonce';
/** A linking that takes longer than this is not a linking in progress. */
const LINK_TTL_SECONDS = 600;

/**
 * The Empire's one authorized callback FOR LINKING A DRIVE.
 *
 * ─── WHY A CONSTANT, AND WHY ITS OWN PATH ───────────────────────────────────
 *
 *   The constant half is a lesson this repository already paid for, recorded
 *   in `app/api/auth/google/start/route.ts`: built from `request.nextUrl.origin`
 *   it became `https://localhost:3000/...` behind nginx, and every sign-in
 *   would have died on Google's own screen with `redirect_uri_mismatch` —
 *   where nothing here could have explained it. Nothing a request carries may
 *   influence this value, and a function with no input cannot be influenced.
 *   Reading `X-Forwarded-Host` is not the repair: nginx sets it, but it is
 *   client-supplied in principle, and trusting it trades a broken flow for a
 *   redirect-poisoning hole.
 *
 *   The own-path half is a decision, not an accident. The sign-in callback
 *   states in its own header that there is «exactly ONE authorized redirect
 *   URI… written here as one, with no branch at all», and a previously
 *   attempted branch was removed from it. Giving that route a second purpose —
 *   «is this a sign-in or a Drive link?» — would reintroduce exactly the shape
 *   it was hardened against, inside the route that mints sessions.
 *
 *   It costs one line in the Google Console, and it costs it ONCE.
 */
const AUTHORIZED_CALLBACK = 'https://azmaos.com/api/cloud/google/callback';

export function cloudRedirectUriFor(): string {
  return AUTHORIZED_CALLBACK;
}

/**
 * GET /api/cloud/google/start — begin linking the Creator's own Drive.
 *
 * Both gates are checked BEFORE the Creator is sent to Google, because a
 * Creator who grants permission and then learns the Empire cannot hold it has
 * been made to do something for nothing.
 */
export async function GET() {
  const jar = await cookies();
  const session = verifySession(jar.get(SESSION_COOKIE)?.value ?? '');
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  if (!googleDriveDestination.identity.configured) {
    return NextResponse.json(
      { status: 'failed', reason: 'capability-unavailable', message: 'ربط جوجل درايف غير متاحٍ حالياً.' },
      { status: 503 },
    );
  }

  if (!isTokenVaultConfigured()) {
    // Said plainly rather than failing later: the Empire will not ask a
    // Creator for permission it has no safe place to keep.
    return NextResponse.json(
      { status: 'failed', reason: 'capability-unavailable', message: 'الإمبراطورية ليست مهيّأةً بعد لحفظ حسابك بأمان.' },
      { status: 503 },
    );
  }

  const state = mintOAuthValue();
  const nonce = mintOAuthValue();

  const response = NextResponse.redirect(
    googleDriveDestination.authorizationUrl({
      redirectUri: cloudRedirectUriFor(),
      state,
      nonce,
    }),
  );

  // httpOnly, so no script on the page can read either — which is the whole
  // point of both. `state` binds the callback to a request this browser
  // started; `nonce` binds Google's identity token to that same request.
  for (const [name, value] of [[LINK_STATE_COOKIE, state], [LINK_NONCE_COOKIE, nonce]] as const) {
    response.cookies.set(name, value, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: LINK_TTL_SECONDS,
    });
  }
  return response;
}
