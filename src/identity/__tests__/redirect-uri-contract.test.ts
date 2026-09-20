/**
 * AZMA OS — The redirect URI is a contract with Google, and it is exact.
 *
 * ─── WHY THIS IS ITS OWN TEST ───────────────────────────────────────────────
 *
 *   Google matches the `redirect_uri` byte for byte against the value
 *   registered on the OAuth client. A trailing slash, a differing scheme, or
 *   `www.` is not a near miss — it is `redirect_uri_mismatch` and every sign-in
 *   fails, with the failure surfacing on Google's own screen where nothing in
 *   this repository can explain it.
 *
 *   The authorized value is:
 *
 *       https://azmaos.com/api/auth/google/callback
 *
 *   So the one thing worth pinning before any credential exists is that the
 *   code produces exactly that, and produces it from the server's own view of
 *   the request rather than from anything a caller can influence — a
 *   caller-supplied redirect_uri being the standard way an OAuth flow is
 *   pointed at an attacker's callback.
 */

import { NextRequest } from 'next/server';
import { redirectUriFor } from '../../../app/api/auth/google/start/route';
import { authorizationUrl } from '../providers/google-identity-binding';

const AUTHORIZED = 'https://azmaos.com/api/auth/google/callback';

describe('the redirect URI', () => {
  it('matches the authorized value EXACTLY', () => {
    const request = new NextRequest('https://azmaos.com/api/auth/google/start');
    expect(redirectUriFor(request)).toBe(AUTHORIZED);
  });

  it('comes from the server, never from the query string', () => {
    const request = new NextRequest(
      'https://azmaos.com/api/auth/google/start?redirect_uri=https://evil.example/cb',
    );
    expect(redirectUriFor(request)).toBe(AUTHORIZED);
  });
});

describe('the authorization URL', () => {
  beforeEach(() => { process.env.GOOGLE_CLIENT_ID = 'preflight-client-id'; });

  it('asks Google for a code, for openid/email/profile, bound by state and nonce', () => {
    const url = new URL(authorizationUrl({ redirectUri: AUTHORIZED, state: 'S', nonce: 'N' }));

    expect(`${url.origin}${url.pathname}`).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(url.searchParams.get('client_id')).toBe('preflight-client-id');
    expect(url.searchParams.get('redirect_uri')).toBe(AUTHORIZED);
    // The authorization-code flow: the token is fetched over the back channel
    // with our secret, so it never passes through the browser.
    expect(url.searchParams.get('response_type')).toBe('code');
    expect(url.searchParams.get('scope')).toBe('openid email profile');
    expect(url.searchParams.get('state')).toBe('S');
    expect(url.searchParams.get('nonce')).toBe('N');
  });

  it('never carries the client secret into a URL the browser will hold', () => {
    process.env.GOOGLE_CLIENT_SECRET = 'a-secret-that-must-not-travel';
    const url = authorizationUrl({ redirectUri: AUTHORIZED, state: 'S', nonce: 'N' });
    expect(url).not.toContain('a-secret-that-must-not-travel');
    expect(url).not.toContain('client_secret');
  });
});
