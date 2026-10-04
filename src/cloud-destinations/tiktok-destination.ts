/**
 * AZMA OS — TIKTOK, AND THE LIMIT NAMED BEFORE IT IS HIT
 *
 * ─── WHAT THIS CAN AND CANNOT DO, TODAY ─────────────────────────────────────
 *
 *   TikTok splits publishing in two:
 *
 *     `video.upload`  — the file lands in the Creator's own TikTok inbox as a
 *                       DRAFT. They open the app and finish posting it. No
 *                       audit required.
 *     `video.publish` — the file is posted directly. Requires TikTok's audit
 *                       of the application, which is theirs to grant and takes
 *                       weeks.
 *
 *   This binding implements the first, because it is the one that can be real
 *   today. It therefore produces a DELIVERY, not a publication, and the
 *   Chamber must never call it one. The `publish_id` TikTok returns is a real
 *   provider identifier for a real transfer that really happened — and the
 *   video is not live until a hand finishes it.
 *
 *   `UPLOAD_DRAFT — USER_COMPLETION_REQUIRED` is the honest state. When the
 *   audit is granted, the init endpoint and the scope change, and nothing else
 *   in this file or anywhere else does.
 *
 * ─── AND TIKTOK TAKES BYTES IN TWO MOVES ────────────────────────────────────
 *
 *   An init call declares the size and receives a one-time upload URL; the
 *   bytes are then PUT to that URL. Sending them to the init endpoint — the
 *   obvious mistake — is refused by TikTok with a message about source_info
 *   that explains nothing.
 */

import type {
  CloudDestination,
  DeliveryRequest,
  DeliveryOutcome,
} from './destination-contract';

const AUTH_URI = 'https://www.tiktok.com/v2/auth/authorize/';
const TOKEN_URI = 'https://open.tiktokapis.com/v2/oauth/token/';
const INBOX_INIT_URI = 'https://open.tiktokapis.com/v2/post/publish/inbox/video/init/';

/** The scope that needs no audit. See the header for what it costs. */
export const TIKTOK_SCOPES: readonly string[] = ['video.upload'];

/** TikTok's ceiling for a single-chunk upload. */
export const TIKTOK_MAX_BYTES = 64 * 1024 * 1024;

const clientKey = () => process.env.TIKTOK_CLIENT_KEY;
const clientSecret = () => process.env.TIKTOK_CLIENT_SECRET;

export function tiktokIsConfigured(): boolean {
  return Boolean(clientKey() && clientSecret());
}

export class TikTokNotConfigured extends Error {
  constructor() {
    super('TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET are not set');
    this.name = 'TikTokNotConfigured';
  }
}

export const tiktokDestination: CloudDestination = {
  identity: {
    id: 'tiktok',
    labelAr: 'تيك توك',
    get configured() { return tiktokIsConfigured(); },
  },

  authorizationUrl({ redirectUri, state }) {
    const key = clientKey();
    if (!key) throw new TikTokNotConfigured();
    const url = new URL(AUTH_URI);
    url.searchParams.set('client_key', key);
    url.searchParams.set('scope', TIKTOK_SCOPES.join(','));
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);
    return url.toString();
  },

  async exchangeCode(code, redirectUri) {
    const key = clientKey();
    const secret = clientSecret();
    if (!key || !secret) throw new TikTokNotConfigured();

    const response = await fetch(TOKEN_URI, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: key, client_secret: secret, code,
        grant_type: 'authorization_code', redirect_uri: redirectUri,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!response.ok) throw new Error(`tiktok exchange failed: HTTP ${response.status}`);

    const body = (await response.json()) as {
      refresh_token?: unknown; open_id?: unknown; scope?: unknown;
    };
    if (typeof body.refresh_token !== 'string') {
      throw new Error('tiktok exchange failed: no refresh_token');
    }
    return {
      refreshToken: body.refresh_token,
      accountId: typeof body.open_id === 'string' ? body.open_id : 'unknown',
      accountLabel: null,
      scopes: typeof body.scope === 'string' ? body.scope.split(',') : TIKTOK_SCOPES,
    };
  },

  async refreshAccess(refreshToken) {
    const key = clientKey();
    const secret = clientSecret();
    if (!key || !secret) return null;
    try {
      const response = await fetch(TOKEN_URI, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: key, client_secret: secret,
          grant_type: 'refresh_token', refresh_token: refreshToken,
        }),
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) return null;
      const body = (await response.json()) as { access_token?: unknown };
      return typeof body.access_token === 'string' ? body.access_token : null;
    } catch {
      return null;
    }
  },

  async deliver(accessToken, request: DeliveryRequest): Promise<DeliveryOutcome> {
    if (!request.mimeType.startsWith('video/')) {
      return { ok: false, reason: 'rejected', detail: `not a video: ${request.mimeType}` };
    }
    const size = request.bytes.byteLength;
    if (size > TIKTOK_MAX_BYTES) {
      return { ok: false, reason: 'rejected', detail: `${size} bytes exceeds ${TIKTOK_MAX_BYTES}` };
    }

    try {
      // ── ONE · declare the transfer, receive a one-time URL ──────────────
      const init = await fetch(INBOX_INIT_URI, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
          source_info: {
            source: 'FILE_UPLOAD',
            video_size: size,
            chunk_size: size,
            total_chunk_count: 1,
          },
        }),
        signal: AbortSignal.timeout(60_000),
      });
      const initBody = (await init.json().catch(() => ({}))) as {
        data?: { publish_id?: unknown; upload_url?: unknown };
        error?: { code?: unknown };
      };

      if (init.status === 401) return { ok: false, reason: 'unauthorised', detail: 'HTTP 401' };
      if (init.status === 403) {
        // Also covers «this scope has not been audited for your app», which is
        // a TikTok-side decision nobody here can take.
        return { ok: false, reason: 'unauthorised', detail: 'HTTP 403' };
      }
      const uploadUrl = initBody.data?.upload_url;
      const publishId = initBody.data?.publish_id;
      if (!init.ok || typeof uploadUrl !== 'string' || typeof publishId !== 'string') {
        const code = typeof initBody.error?.code === 'string' ? ` ${initBody.error.code}` : '';
        return { ok: false, reason: 'rejected', detail: `HTTP ${init.status}${code}` };
      }

      // ── TWO · the bytes themselves, to the URL TikTok just issued ───────
      const put = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': request.mimeType,
          'Content-Length': String(size),
          'Content-Range': `bytes 0-${size - 1}/${size}`,
        },
        body: Buffer.from(request.bytes),
        signal: AbortSignal.timeout(300_000),
      });
      if (!put.ok) return { ok: false, reason: 'rejected', detail: `upload HTTP ${put.status}` };

      // A real identifier for a real transfer. It is NOT a published video —
      // see the header. The Chamber reports it as a draft awaiting its owner.
      return { ok: true, providerFileId: publishId };
    } catch (err) {
      return { ok: false, reason: 'unreachable', detail: err instanceof Error ? err.message : 'no response' };
    }
  },
};
