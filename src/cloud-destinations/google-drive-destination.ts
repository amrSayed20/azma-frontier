/**
 * AZMA OS — DELIVERING A FILE TO THE CREATOR'S OWN GOOGLE DRIVE
 *
 * ─── IT USES THE EMPIRE'S EXISTING CREDENTIAL ───────────────────────────────
 *
 *   FOUNDER, 2026-09-29: «استخدم اعتماد Google OAuth الحالي الخاص بـAZMA OS،
 *   وأضف له drive.file فقط».
 *
 *   So `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — the same pair that signs
 *   Creators in today. No second credential, no second consent screen, no
 *   second thing to rotate.
 *
 * ─── AND THE NARROWEST SCOPE THAT CAN DO THE WORK ───────────────────────────
 *
 *   `drive.file` grants access to files THIS application creates, and to
 *   nothing else in the Creator's Drive. Their documents, their photos, their
 *   company's folders are not visible to this Empire and never become visible.
 *   Google itself names it the alternative to the restricted Drive scopes, and
 *   an application that asks for `drive` or `drive.readonly` to upload one
 *   file is asking for a power it has no use for.
 *
 *   `openid email` ride alongside — the same two the sign-in already requests
 *   — for one reason: so the Creator can be shown WHICH account they linked.
 *   An account list that says «حساب جوجل» three times is a list nobody can
 *   revoke from with confidence.
 *
 * ─── WHY access_type=offline AND prompt=consent ─────────────────────────────
 *
 *   Google returns a refresh token ONLY with `access_type=offline`, and only
 *   on the FIRST consent unless `prompt=consent` forces it again. Without both,
 *   a Creator who has linked before re-links successfully, the Empire stores
 *   nothing usable, and the failure appears weeks later when a file will not
 *   upload. It is written here with the reason so neither is ever "tidied".
 *
 * ─── THE REDIRECT URI IS A CONSTANT, AND THAT LESSON WAS PAID FOR ───────────
 *
 *   `app/api/auth/google/start/route.ts` carries the record: building it from
 *   `request.nextUrl.origin` produced `https://localhost:3000/...` behind
 *   nginx, and every sign-in would have died on Google's own screen. Nothing a
 *   request carries may influence it. This module never builds one — it is
 *   handed one by a route that holds it as a constant.
 */

import {
  GoogleIdentityError,
  googleIdentityIsConfigured,
  verifyGoogleIdToken,
} from '../identity/providers/google-identity-binding';
import type {
  CloudDestination,
  DeliveryRequest,
  DeliveryOutcome,
} from './destination-contract';

const AUTH_URI = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URI = 'https://oauth2.googleapis.com/token';
const UPLOAD_URI = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

/** Per-file access only. The Creator's wider Drive is never in view. */
export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
export const DRIVE_SCOPES: readonly string[] = ['openid', 'email', DRIVE_SCOPE];

const clientId = () => process.env.GOOGLE_CLIENT_ID;
const clientSecret = () => process.env.GOOGLE_CLIENT_SECRET;

export const googleDriveDestination: CloudDestination = {
  identity: {
    id: 'google-drive',
    labelAr: 'جوجل درايف',
    // The same credential as the sign-in: if one is configured, both are.
    get configured() { return googleIdentityIsConfigured(); },
  },

  authorizationUrl({ redirectUri, state, nonce }) {
    const id = clientId();
    if (!id) throw new GoogleIdentityError('NOT_CONFIGURED');
    const url = new URL(AUTH_URI);
    url.searchParams.set('client_id', id);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', DRIVE_SCOPES.join(' '));
    url.searchParams.set('state', state);
    // The same binding the sign-in uses: `nonce` ties the id_token Google
    // returns to THIS request, so a genuine token captured elsewhere — a log,
    // a proxy, another site sharing this client — cannot be replayed here.
    url.searchParams.set('nonce', nonce);
    // Both are load-bearing — see the header. Removing either yields a link
    // that appears to work and stores nothing usable.
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
    // A shared browser must not silently link the wrong account.
    url.searchParams.set('include_granted_scopes', 'true');
    return url.toString();
  },

  async exchangeCode(code, redirectUri, nonce) {
    const id = clientId();
    const secret = clientSecret();
    if (!id || !secret) throw new GoogleIdentityError('NOT_CONFIGURED');

    const response = await fetch(TOKEN_URI, {
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

    // Google's body can echo request parameters. Only the status leaves here.
    if (!response.ok) throw new GoogleIdentityError('EXCHANGE_FAILED', `HTTP ${response.status}`);

    const body = (await response.json()) as {
      refresh_token?: unknown;
      id_token?: unknown;
      scope?: unknown;
    };

    if (typeof body.refresh_token !== 'string' || body.refresh_token.length === 0) {
      // Named exactly, because the remedy is specific: Google withholds a
      // refresh token when a prior grant still stands. The Creator must remove
      // AZMA from their Google account permissions and link again.
      throw new GoogleIdentityError('EXCHANGE_FAILED', 'no refresh_token');
    }

    // Which account, said from a token Google signed — never from a form field.
    let accountId = 'unknown';
    let accountLabel: string | null = null;
    if (typeof body.id_token === 'string') {
      try {
        // The Empire's own hardened verifier — signature, issuer, audience,
        // expiry and nonce. Not a base64 decode of a payload we chose to trust.
        const claims = await verifyGoogleIdToken(body.id_token, nonce);
        accountId = claims.providerSubject;
        accountLabel = claims.email;
      } catch {
        // A grant whose identity could not be read is still a usable grant.
        // The Creator sees an unnamed account rather than none at all.
      }
    }

    return {
      refreshToken: body.refresh_token,
      accountId,
      accountLabel,
      scopes: typeof body.scope === 'string' ? body.scope.split(' ') : DRIVE_SCOPES,
    };
  },

  async refreshAccess(refreshToken) {
    const id = clientId();
    const secret = clientSecret();
    if (!id || !secret) return null;
    try {
      const response = await fetch(TOKEN_URI, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          client_id: id,
          client_secret: secret,
          grant_type: 'refresh_token',
        }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) return null;
      const body = (await response.json()) as { access_token?: unknown };
      return typeof body.access_token === 'string' ? body.access_token : null;
    } catch {
      return null;
    }
  },

  async deliver(accessToken, request: DeliveryRequest): Promise<DeliveryOutcome> {
    // multipart/related: the file's metadata and its bytes in one request.
    // Drive requires this exact shape for uploadType=multipart.
    const boundary = `azma${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    const metadata = JSON.stringify({ name: request.fileName, mimeType: request.mimeType });

    const body = Buffer.concat([
      Buffer.from(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`
        + `--${boundary}\r\nContent-Type: ${request.mimeType}\r\n\r\n`,
        'utf8',
      ),
      Buffer.from(request.bytes),
      Buffer.from(`\r\n--${boundary}--\r\n`, 'utf8'),
    ]);

    try {
      const response = await fetch(UPLOAD_URI, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body,
        signal: AbortSignal.timeout(120_000),
      });

      if (response.status === 401 || response.status === 403) {
        // 403 also covers «the Drive API is not enabled on this project», which
        // is a Console action nobody here can take. The detail carries the
        // status for an engineer; the Creator is told to link again.
        return { ok: false, reason: 'unauthorised', detail: `HTTP ${response.status}` };
      }
      if (!response.ok) {
        return { ok: false, reason: 'rejected', detail: `HTTP ${response.status}` };
      }

      const created = (await response.json()) as { id?: unknown };
      return typeof created.id === 'string'
        ? { ok: true, providerFileId: created.id }
        : { ok: false, reason: 'rejected', detail: 'no file id returned' };
    } catch (err) {
      return {
        ok: false,
        reason: 'unreachable',
        detail: err instanceof Error ? err.message : 'no response',
      };
    }
  },
};
