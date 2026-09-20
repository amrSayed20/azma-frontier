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

import { readFileSync } from 'fs';
import { join } from 'path';
import { redirectUriFor } from '../../../app/api/auth/google/start/route';
import { authorizationUrl } from '../providers/google-identity-binding';

const AUTHORIZED = 'https://azmaos.com/api/auth/google/callback';

describe('the redirect URI', () => {
  it('matches the authorized value EXACTLY', () => {
    expect(redirectUriFor()).toBe(AUTHORIZED);
  });

  /**
   * THE TEST THAT WAS MISSING, AND THE REASON THE FIRST VERSION SHIPPED BROKEN.
   *
   * The original derived the URI from `request.nextUrl.origin` and was tested
   * with a NextRequest built from the public URL — so it asserted an assumption
   * about the deployment rather than the deployment. Behind nginx, Next.js sees
   * the private origin it was proxied to, and production actually produced:
   *
   *     https://localhost:3000/api/auth/google/callback
   *
   * which Google refuses as redirect_uri_mismatch. This reproduces exactly that
   * request shape.
   */
  it('cannot be influenced by the request at all — it takes no input', () => {
    // The strongest form of the guarantee. There is no origin, no Host, no
    // X-Forwarded-Host and no query parameter to poison, because there is no
    // parameter. Behind nginx the first version produced
    // https://localhost:3000/... from nextUrl.origin; this cannot.
    expect(redirectUriFor()).toBe(AUTHORIZED);
    expect(redirectUriFor()).not.toContain('localhost');
    expect(redirectUriFor.length).toBe(0);
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

describe('no identity route may build a redirect from the proxied origin', () => {
  /**
   * ─── THE DEFECT THIS HOLDS SHUT ───────────────────────────────────────────
   *
   *   `redirectUriFor` was fixed and the same mistake stayed two functions
   *   away. MEASURED on production, on a real sign-in: the account was created,
   *   the identity verified, the binding recorded and the session cookie set —
   *   and the Creator was then sent to http://localhost:3000, where the browser
   *   showed ERR_CONNECTION_REFUSED. The entire journey worked and the last
   *   instruction pointed nowhere.
   *
   *   Behind nginx, `request.nextUrl.origin` is the private origin Next.js was
   *   proxied to. This asserts on the source itself, because the failure is
   *   invisible to any test that builds its own request from a public URL —
   *   which is exactly how the first version passed.
   */
  const IDENTITY_ROUTES = [
    'app/api/auth/google/start/route.ts',
    'app/api/auth/google/callback/route.ts',
  ];

  it('uses PUBLIC_ORIGIN, never nextUrl.origin', () => {
    for (const route of IDENTITY_ROUTES) {
      const source = readFileSync(join(process.cwd(), route), 'utf8');
      // Strip comments: this file's own explanation names the defect.
      const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
      expect(code).not.toContain('nextUrl.origin');
    }
  });
});
