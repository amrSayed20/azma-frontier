/**
 * AZMA OS — ONE OAUTH LINKING FLOW, FOR EVERY PROVIDER THAT IS NOT SEALED
 *
 * ─── WHY THIS EXISTS, AND WHY IT DOES NOT TOUCH DRIVE ───────────────────────
 *
 *   `/api/cloud/google/*` performs this dance for Google Drive and is a CLOSED
 *   capability under a standing instruction not to reopen it. Three new
 *   providers — YouTube, Meta, TikTok — need the same dance, and writing it
 *   three more times would put four copies of a security-critical flow in the
 *   repository, each able to drift from the others.
 *
 *   So the new providers share ONE implementation. Drive keeps its own, by
 *   instruction, and the day it may be touched there are two to merge, not
 *   five.
 *
 * ─── WHAT IT KEEPS FROM THE FLOW IT LEARNED FROM ────────────────────────────
 *
 *   Every protection the Drive route paid for is carried over, not re-derived:
 *
 *   · the redirect URI is a CONSTANT handed in, never built from the request.
 *     Built from `request.nextUrl.origin` it became `https://localhost:3000`
 *     behind nginx and every link died on the provider's own screen; and
 *     `X-Forwarded-Host` is nginx-set but client-supplied in principle, so
 *     trusting it trades a broken flow for a redirect-poisoning hole.
 *   · `state` and `nonce` are minted per link and held in httpOnly cookies —
 *     a value the page can read is a value an injected script can read.
 *   · `state` is compared with a constant-time equality, not `===`.
 *   · both gates — provider configured, vault configured — are checked BEFORE
 *     the Creator is sent anywhere, because a Creator who grants permission
 *     and then learns the Empire cannot hold it has been made to do something
 *     for nothing.
 *   · every ending leaves a trace in the log, because a link that fails
 *     silently is a link nobody can diagnose.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { verifySession } from '../authentication';
import { getDb } from '../persistent-storage';
import { mintOAuthValue, safeEquals } from '../identity/providers/google-identity-binding';
import { isTokenVaultConfigured } from './token-vault';
import { linkCloudAccount, type CloudProviderId } from './cloud-account-repository';
import type { CloudDestination } from './destination-contract';

const SESSION_COOKIE = 'azma_session';
const RETURN_TO = 'https://azmaos.com/makman-al-ghayah';
/** A linking that takes longer than this is not a linking in progress. */
const LINK_TTL_SECONDS = 600;

export interface LinkFlow {
  /** Distinguishes one provider's in-flight link from another's. */
  readonly key: string;
  readonly destination: CloudDestination;
  /** A CONSTANT. Never derived from the request. See the header. */
  readonly redirectUri: string;
  readonly provider: CloudProviderId;
}

const stateCookie = (f: LinkFlow) => `azma_link_state_${f.key}`;
const nonceCookie = (f: LinkFlow) => `azma_link_nonce_${f.key}`;

/** Send the Creator to the provider's own consent screen. */
export async function beginLink(f: LinkFlow, sessionId: string | undefined): Promise<NextResponse> {
  const session = verifySession(sessionId ?? '');
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }
  if (!f.destination.identity.configured) {
    return NextResponse.json(
      { status: 'failed', reason: 'capability-unavailable', message: 'هذه الوجهة غير مهيّأةٍ في الإمبراطوريّة بعد.' },
      { status: 503 },
    );
  }
  if (!isTokenVaultConfigured()) {
    return NextResponse.json(
      { status: 'failed', reason: 'capability-unavailable', message: 'الإمبراطورية ليست مهيّأةً بعد لحفظ حسابك بأمان.' },
      { status: 503 },
    );
  }

  const state = mintOAuthValue();
  const nonce = mintOAuthValue();
  const response = NextResponse.redirect(
    f.destination.authorizationUrl({ redirectUri: f.redirectUri, state, nonce }),
  );
  for (const [name, value] of [[stateCookie(f), state], [nonceCookie(f), nonce]] as const) {
    response.cookies.set(name, value, {
      httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: LINK_TTL_SECONDS,
    });
  }
  return response;
}

/**
 * The Creator came back. Turn consent into a stored grant, or say why not.
 *
 * `onGranted` lets a provider do more than store one row — Meta returns a user
 * token from which Pages and Instagram accounts must still be discovered. When
 * it is absent, the grant becomes one account, which is what YouTube and
 * TikTok need.
 */
export async function completeLink(
  request: NextRequest,
  f: LinkFlow,
  onGranted?: (grant: {
    refreshToken: string; accountId: string; accountLabel: string | null; scopes: readonly string[];
  }, creatorId: string) => Promise<string>,
): Promise<NextResponse> {
  const back = (outcome: string): NextResponse => {
    console.log(`[cloud/${f.key}] outcome:`, outcome);
    const response = NextResponse.redirect(`${RETURN_TO}?cloud=${encodeURIComponent(outcome)}`);
    for (const name of [stateCookie(f), nonceCookie(f)]) {
      response.cookies.set(name, '', { httpOnly: true, secure: true, sameSite: 'lax', path: '/', maxAge: 0 });
    }
    return response;
  };

  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value ?? '');
  if (!session) return back('unauthorized');
  if (request.nextUrl.searchParams.get('error')) return back('declined');

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const expectedState = request.cookies.get(stateCookie(f))?.value;
  const nonce = request.cookies.get(nonceCookie(f))?.value;
  if (!code || !state || !expectedState || !nonce) return back('expired');
  if (!safeEquals(state, expectedState)) return back('mismatch');

  try {
    const grant = await f.destination.exchangeCode(code, f.redirectUri, nonce);
    if (onGranted) return back(await onGranted(grant, session.creatorId));
    linkCloudAccount(getDb(), {
      creatorId: session.creatorId,
      provider: f.provider,
      providerAccountId: grant.accountId,
      accountLabel: grant.accountLabel,
      refreshToken: grant.refreshToken,
      scopes: grant.scopes,
    });
    return back('linked');
  } catch (err) {
    const detail = err instanceof Error ? err.message : 'unknown';
    console.error(`[cloud/${f.key}] link failed:`, detail.slice(0, 120));
    return back(detail.includes('no refresh_token') ? 'already-granted' : 'failed');
  }
}
