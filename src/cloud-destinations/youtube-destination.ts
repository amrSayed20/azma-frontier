/**
 * AZMA OS — PUBLISHING A SOVEREIGN WORK TO THE CREATOR'S OWN YOUTUBE CHANNEL
 *
 * ─── IT USES THE EMPIRE'S EXISTING GOOGLE CREDENTIAL ────────────────────────
 *
 *   The same `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` that signs Creators
 *   in and links their Drive. No second credential, no second consent screen,
 *   nothing new to rotate — which is why YouTube is the shortest of the four
 *   remaining channels by a wide margin.
 *
 * ─── AND A SCOPE NARROWER THAN THE ONE PEOPLE REACH FOR ─────────────────────
 *
 *   `youtube.upload` can insert a video and nothing else. It cannot read the
 *   channel, cannot list or edit existing videos, cannot touch comments,
 *   playlists or analytics. The broad `youtube` scope would grant all of that
 *   for a capability whose whole purpose is to publish one file.
 *
 * ─── WHY THIS FILE REPEATS GOOGLE'S TOKEN EXCHANGE ──────────────────────────
 *
 *   `google-drive-destination.ts` performs the same exchange, and extending it
 *   would be the ordinary engineering answer. Google Drive is a CLOSED, live,
 *   production-proven capability, and the directive sealing it is explicit:
 *   «Do not reopen either. Do not refactor them merely for consistency.»
 *
 *   So this module is self-contained by instruction, not by preference. The
 *   duplication is recorded here rather than left to be discovered, and the
 *   day Drive may be touched, these two exchanges become one.
 *
 * ─── WHAT A CREATOR MUST BE TOLD, AND IS ────────────────────────────────────
 *
 *   An unverified Google application may upload, and YouTube will return a
 *   real video id — but it LOCKS the video to `private` until the application
 *   passes YouTube's own API audit. The upload is real, the id is real, the
 *   video is real, and it is not public. `privacyStatus` below is therefore
 *   set to `private` deliberately: asking for `public` from an unaudited app
 *   produces a video that is private anyway, and a request whose answer is
 *   silently overridden is a lie told to the Creator by the system.
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
const UPLOAD_URI =
  'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=multipart&part=snippet,status';

/** Insert a video, and nothing else. The channel itself stays out of view. */
export const YOUTUBE_SCOPE = 'https://www.googleapis.com/auth/youtube.upload';
export const YOUTUBE_SCOPES: readonly string[] = ['openid', 'email', YOUTUBE_SCOPE];

/**
 * YouTube publishes video. It has no concept of posting a photograph.
 *
 * Refused here rather than by Google, so a Creator carrying an image to this
 * destination is told what is wrong instead of receiving a 400 the Chamber
 * would have to guess at.
 */
export function youtubeAcceptsMimeType(mimeType: string): boolean {
  return mimeType.startsWith('video/');
}

const clientId = () => process.env.GOOGLE_CLIENT_ID;
const clientSecret = () => process.env.GOOGLE_CLIENT_SECRET;

export const youtubeDestination: CloudDestination = {
  identity: {
    id: 'youtube',
    labelAr: 'يوتيوب',
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
    url.searchParams.set('scope', YOUTUBE_SCOPES.join(' '));
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);
    // Both load-bearing, for the reason recorded in the Drive binding: Google
    // returns a refresh token ONLY with access_type=offline, and only on the
    // first consent unless prompt=consent forces it again. Without both, a
    // Creator links successfully, nothing usable is stored, and the failure
    // surfaces weeks later when a video will not upload.
    url.searchParams.set('access_type', 'offline');
    url.searchParams.set('prompt', 'consent');
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
        code, client_id: id, client_secret: secret,
        redirect_uri: redirectUri, grant_type: 'authorization_code',
      }),
      signal: AbortSignal.timeout(15_000),
    });

    // Google's body can echo request parameters. Only the status leaves here.
    if (!response.ok) throw new GoogleIdentityError('EXCHANGE_FAILED', `HTTP ${response.status}`);

    const body = (await response.json()) as {
      refresh_token?: unknown; id_token?: unknown; scope?: unknown;
    };

    if (typeof body.refresh_token !== 'string' || body.refresh_token.length === 0) {
      // Named exactly, because the remedy is specific: Google withholds a
      // refresh token when a prior grant still stands. The Creator must remove
      // AZMA from their Google account permissions and link again.
      throw new GoogleIdentityError('EXCHANGE_FAILED', 'no refresh_token');
    }

    // Which account, from a token Google signed — never from a form field.
    let accountId = 'unknown';
    let accountLabel: string | null = null;
    if (typeof body.id_token === 'string') {
      try {
        const claims = await verifyGoogleIdToken(body.id_token, nonce);
        accountId = claims.providerSubject;
        accountLabel = claims.email;
      } catch {
        // A grant whose identity could not be read is still a usable grant.
      }
    }

    return {
      refreshToken: body.refresh_token,
      accountId,
      accountLabel,
      scopes: typeof body.scope === 'string' ? body.scope.split(' ') : YOUTUBE_SCOPES,
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
          refresh_token: refreshToken, client_id: id,
          client_secret: secret, grant_type: 'refresh_token',
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
    if (!youtubeAcceptsMimeType(request.mimeType)) {
      return { ok: false, reason: 'rejected', detail: `not a video: ${request.mimeType}` };
    }

    // multipart/related — the video's metadata and its bytes in one request,
    // the shape YouTube requires for uploadType=multipart. The same shape the
    // Drive binding uses, which has been proven live.
    const boundary = `azma${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    const metadata = JSON.stringify({
      snippet: {
        title: request.fileName.slice(0, 100),
        description: 'نُشر من AZMA OS',
      },
      status: {
        // Deliberate. See the header: an unaudited application's uploads are
        // locked private by YouTube whatever is asked for, and asking for
        // `public` would make the system promise what it cannot deliver.
        privacyStatus: 'private',
        selfDeclaredMadeForKids: false,
      },
    });

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
        signal: AbortSignal.timeout(300_000),
      });

      if (response.status === 401) {
        return { ok: false, reason: 'unauthorised', detail: 'HTTP 401' };
      }
      if (response.status === 403) {
        // 403 covers three different Console-level conditions at once: the
        // YouTube Data API not enabled on the project, the daily quota spent
        // (one upload costs 1600 units of a 10,000 default), and a channel
        // that is not permitted to upload. All three need an action nobody in
        // this process can take, and the detail carries the status for an
        // engineer while the Creator is told to check their channel.
        return { ok: false, reason: 'unauthorised', detail: 'HTTP 403' };
      }
      if (!response.ok) {
        return { ok: false, reason: 'rejected', detail: `HTTP ${response.status}` };
      }

      const created = (await response.json()) as { id?: unknown };
      // A 200 with no video id is NOT a publication. The id is the receipt,
      // and a success asserted without one is the fake success state this
      // whole path exists to make impossible.
      return typeof created.id === 'string'
        ? { ok: true, providerFileId: created.id }
        : { ok: false, reason: 'rejected', detail: 'no video id returned' };
    } catch (err) {
      return {
        ok: false,
        reason: 'unreachable',
        detail: err instanceof Error ? err.message : 'no response',
      };
    }
  },
};
