'use client';

/**
 * AZMA OS — THE ONLY PLACE A CREATOR'S TELEGRAM SESSION EXISTS
 *
 * ─── THIS FILE RUNS IN THE CREATOR'S BROWSER, AND NOWHERE ELSE ──────────────
 *
 *   FOUNDER'S RULING, 2026-10-04: «Telegram user sessions MUST NOT be stored
 *   on the AZMA server… The session may exist only in the user's browser
 *   storage under the AZMA origin.» And: «Do NOT describe this as zero
 *   custody. The accepted security model is PARTIAL ZERO-CUSTODY.»
 *
 *   Both halves are load-bearing. The session is written to `localStorage` by
 *   GramJS's own `StoreSession`, and no line in this module — or any other —
 *   sends it anywhere. It is also true that this code is served from the AZMA
 *   origin, so AZMA's own JavaScript can reach it. That is the accepted cost,
 *   and it is written here so nobody reading this file later believes
 *   otherwise.
 *
 * ─── IT IS NEVER IMPORTED STATICALLY ────────────────────────────────────────
 *
 *   GramJS is about two megabytes. `page.tsx` reaches it only through
 *   `await import('./telegram-user-client')` inside a handler, so a Creator
 *   who never links Telegram never downloads a byte of it. A static import
 *   anywhere would put MTProto into the Chamber's first paint.
 *
 * ─── AND WHY QR, NOT A PHONE NUMBER ─────────────────────────────────────────
 *
 *   The login code Telegram sends arrives in a message that says, in Telegram's
 *   own words, never to share it with anyone. Asking a Creator to type it into
 *   AZMA is asking them to do precisely what their messenger warns against.
 *
 *   QR authorization asks for nothing: no phone number reaches AZMA, no code
 *   is typed into it. The Creator scans with the Telegram app they already
 *   trust, exactly as they do for Telegram Desktop. It does not change where
 *   the session ends up — that is this browser either way — but it removes the
 *   one step that required a Creator to disregard a security warning.
 */

import { TelegramClient, Api } from 'telegram';
import { StoreSession } from 'telegram/sessions';

/** The key under which GramJS keeps the session, in this browser only. */
const SESSION_KEY = 'azma.telegram.user';

export interface TelegramIdentity {
  readonly telegramUserId: string;
  readonly username: string | null;
  readonly displayName: string;
}

export interface TelegramDestinationChoice {
  readonly peerId: string;
  readonly title: string;
  /** How the Creator may post there, in their own language. */
  readonly roleAr: string;
}

export type PublishFailure = 'unauthorised' | 'rejected' | 'unreachable';

export interface PublishOutcome {
  readonly ok: boolean;
  readonly messageId?: string;
  readonly failure?: PublishFailure;
}

let client: TelegramClient | null = null;

/** Whether this browser already holds an authorization. Never its contents. */
export function hasStoredSession(): boolean {
  try {
    // StoreSession writes several keys under this prefix; the auth key is the
    // one that means «authorized».
    return Object.keys(window.localStorage).some((k) => k.startsWith(SESSION_KEY));
  } catch {
    // A browser with storage blocked simply has no session. Never a crash.
    return false;
  }
}

async function connected(apiId: number, apiHash: string): Promise<TelegramClient> {
  if (client?.connected) return client;
  if (!client) {
    client = new TelegramClient(new StoreSession(SESSION_KEY), apiId, apiHash, {
      connectionRetries: 3,
      // Telegram's own web clients speak MTProto over WebSocket; this is the
      // same transport, not a workaround around a missing one.
      useWSS: true,
    });
  }
  await client.connect();
  return client;
}

/**
 * Authorize this browser as the Creator's own Telegram account, by QR.
 *
 * `onQrUrl` is called with a `tg://login?token=…` URL each time Telegram
 * issues a fresh token — they expire in under a minute, and GramJS reissues
 * them, so the caller must redraw rather than render once.
 *
 * `onPassword` is called only when the account has two-step verification. The
 * password is used by GramJS to compute an SRP proof; it is never transmitted
 * as itself, and it never leaves this function's scope.
 */
export async function authorizeWithQr(input: {
  apiId: number;
  apiHash: string;
  onQrUrl: (url: string) => void;
  onPassword: () => Promise<string>;
}): Promise<TelegramIdentity> {
  const c = await connected(input.apiId, input.apiHash);

  await c.signInUserWithQrCode(
    { apiId: input.apiId, apiHash: input.apiHash },
    {
      qrCode: async (code) => {
        // Telegram's documented QR payload: the raw token, base64url, no pad.
        const token = Buffer.from(code.token).toString('base64')
          .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        input.onQrUrl(`tg://login?token=${token}`);
      },
      password: async () => input.onPassword(),
      // Returning false asks GramJS to keep trying with a fresh token rather
      // than abandoning the Creator mid-scan.
      onError: async () => false,
    },
  );

  const me = (await c.getMe()) as Api.User;
  return {
    telegramUserId: String(me.id),
    username: me.username ?? null,
    displayName: [me.firstName, me.lastName].filter(Boolean).join(' ') || (me.username ?? 'حسابك'),
  };
}

/**
 * Who this browser is already authorized as — without asking for a scan.
 *
 * A Creator who linked yesterday and returns today must not be shown a QR
 * code: the authorization is still here. Re-running the sign-in flow against
 * an already-authorized client is undefined, so the two paths are separate
 * and `hasStoredSession()` chooses between them.
 */
export async function identify(input: { apiId: number; apiHash: string }): Promise<TelegramIdentity | null> {
  try {
    const c = await connected(input.apiId, input.apiHash);
    if (!(await c.isUserAuthorized())) return null;
    const me = (await c.getMe()) as Api.User;
    return {
      telegramUserId: String(me.id),
      username: me.username ?? null,
      displayName: [me.firstName, me.lastName].filter(Boolean).join(' ') || (me.username ?? 'حسابك'),
    };
  } catch {
    return null;
  }
}

/**
 * The places this Creator may actually publish to — asked of Telegram.
 *
 * Not every chat qualifies, and the filter is the honest one: a broadcast
 * channel needs `post_messages` or ownership; a supergroup needs media not to
 * be banned for its members. A list that showed every dialog would offer
 * destinations that refuse at the last step.
 *
 * Saved Messages is included first and deliberately: it is the one destination
 * every account has, it is private, and it is where a Creator can prove the
 * whole path works before pointing it at an audience.
 */
export async function listDestinations(input: { apiId: number; apiHash: string }): Promise<readonly TelegramDestinationChoice[]> {
  const c = await connected(input.apiId, input.apiHash);
  const me = (await c.getMe()) as Api.User;

  const found: TelegramDestinationChoice[] = [{
    peerId: String(me.id),
    title: 'الرسائل المحفوظة',
    roleAr: 'خاصّ بك وحدك',
  }];

  const dialogs = await c.getDialogs({ limit: 200 });
  for (const d of dialogs) {
    const e = d.entity;
    if (!(e instanceof Api.Channel)) continue;
    if (e.left) continue;

    const owner = e.creator === true;
    const mayPost = owner || e.adminRights?.postMessages === true;
    const maySendMedia = e.megagroup === true && e.defaultBannedRights?.sendMedia !== true;
    if (!mayPost && !maySendMedia) continue;

    found.push({
      peerId: String(e.id),
      title: e.title || '—',
      roleAr: owner ? 'قناتك' : mayPost ? 'أنت مشرفٌ فيها' : 'مجموعةٌ تنشر فيها',
    });
  }
  return found;
}

/** Resolve a stored peer id back to something Telegram will accept. */
async function resolvePeer(c: TelegramClient, peerId: string): Promise<Api.TypeEntityLike | null> {
  const me = (await c.getMe()) as Api.User;
  if (String(me.id) === peerId) return me;
  // Re-walking the dialogs warms GramJS's entity cache, so a channel's access
  // hash is present even on a browser that was reloaded since it was chosen.
  const dialogs = await c.getDialogs({ limit: 200 });
  for (const d of dialogs) {
    const e = d.entity;
    if (e && String(e.id) === peerId) return e;
  }
  return null;
}

/**
 * Publish one sovereign asset, as the Creator, from the Creator's browser.
 *
 * `scheduleAtMs` is wired through to Telegram's own scheduled-message field,
 * where Telegram holds the message and sends it at the appointed moment even
 * if this browser is closed.
 *
 * IT IS NOT CLAIMED TO WORK. The Founder ruled: «Do not assume it is valid
 * merely from design; verify it before claiming support.» Nothing in the
 * Chamber offers scheduling for this provider, and nothing will until a live
 * measurement says it may.
 */
export async function publish(input: {
  apiId: number;
  apiHash: string;
  peerId: string;
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
  scheduleAtMs?: number;
}): Promise<PublishOutcome> {
  let c: TelegramClient;
  try {
    c = await connected(input.apiId, input.apiHash);
  } catch {
    return { ok: false, failure: 'unreachable' };
  }

  if (!(await c.isUserAuthorized())) {
    // The Creator revoked this session from their own Telegram app, which is
    // their right and the whole point of the session living there.
    return { ok: false, failure: 'unauthorised' };
  }

  const peer = await resolvePeer(c, input.peerId);
  if (!peer) return { ok: false, failure: 'rejected' };

  try {
    const file = new File([new Uint8Array(input.bytes)], input.fileName, { type: input.mimeType });
    const sent = await c.sendFile(peer, {
      file,
      // An image stays an image and a video stays a video; forcing documents
      // would deliver a file attachment where a Creator expects a post.
      forceDocument: false,
      ...(input.scheduleAtMs ? { schedule: Math.floor(input.scheduleAtMs / 1000) } : {}),
    });
    const id = (sent as Api.Message)?.id;
    // A send that returns no id is NOT a publication. The receipt is the
    // proof, and asserting success without one is the fake success state this
    // whole path exists to make impossible.
    return typeof id === 'number'
      ? { ok: true, messageId: String(id) }
      : { ok: false, failure: 'rejected' };
  } catch (err) {
    const name = err instanceof Error ? err.message : '';
    if (/AUTH_KEY|SESSION_REVOKED|USER_DEACTIVATED|UNAUTHORIZED/i.test(name)) {
      return { ok: false, failure: 'unauthorised' };
    }
    if (/CHAT_WRITE_FORBIDDEN|CHANNEL_PRIVATE|PEER_ID_INVALID|MEDIA_/i.test(name)) {
      return { ok: false, failure: 'rejected' };
    }
    return { ok: false, failure: 'unreachable' };
  }
}

/**
 * End the authorization — at Telegram, then here.
 *
 * `auth.logOut` first, so the session is dead at the source rather than merely
 * forgotten locally. A browser that only cleared its own storage would leave a
 * live authorization standing in the Creator's Telegram session list, which is
 * the opposite of what «فُكَّ الربط» promises.
 */
export async function forgetSession(input: { apiId: number; apiHash: string }): Promise<void> {
  try {
    const c = await connected(input.apiId, input.apiHash);
    if (await c.isUserAuthorized()) await c.invoke(new Api.auth.LogOut());
    await c.disconnect();
  } catch {
    // Telegram unreachable changes nothing about the local half, which must
    // still happen — a session left in this browser after the Creator asked
    // for it to go is the worse failure.
  }
  client = null;
  try {
    for (const k of Object.keys(window.localStorage)) {
      if (k.startsWith(SESSION_KEY)) window.localStorage.removeItem(k);
    }
  } catch { /* storage blocked — nothing was stored either */ }
}
