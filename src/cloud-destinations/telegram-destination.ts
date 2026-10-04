/**
 * AZMA OS — PUBLISHING A SOVEREIGN ASSET TO TELEGRAM
 *
 * ─── THE FIRST PROVIDER THAT IS NOT A DRIVE ─────────────────────────────────
 *
 *   `destination-contract.ts` was written with «وهكذا» in its header: the
 *   Empire must be able to add the fourth provider without reopening the
 *   Chamber. Google Drive alone could never prove that — one implementation of
 *   an interface proves nothing about the interface. Telegram is the proof,
 *   and it was chosen because it is the one destination that needs no app
 *   review from anybody to be REAL today.
 *
 * ─── IT HAS NO OAUTH, AND THAT IS NOT A GAP TO BE PAPERED OVER ──────────────
 *
 *   Telegram issues no authorization URL and exchanges no code. A bot token
 *   from @BotFather IS the lasting grant, handed over by the Creator directly.
 *
 *   So `authorizationUrl` and `exchangeCode` THROW. They are not stubbed to
 *   return something harmless-looking, because a stub that returns a value is
 *   a path a future caller can take by accident and get silence instead of an
 *   answer. A provider that cannot do a thing says so.
 *
 *   The grant's life therefore has one half, not two: `refreshAccess` takes
 *   the bot token and returns it, having first ASKED TELEGRAM whether it still
 *   works. That call is the whole of the validation, and it is not skipped —
 *   a token that was revoked in @BotFather yesterday must not produce a
 *   «PUBLISHING» state today.
 *
 * ─── THE TOKEN IS IN THE URL, AND THAT IS A LEAK WAITING TO HAPPEN ──────────
 *
 *   `https://api.telegram.org/bot<TOKEN>/sendPhoto` — the credential is part
 *   of the path. Which means a fetch failure's own message («request to
 *   https://api.telegram.org/bot123:ABC... failed») carries the Creator's bot
 *   token into whatever log receives the detail string.
 *
 *   Every string that leaves this module passes through `scrub`. Not because
 *   a leak was observed, but because the shape of this API makes one the
 *   DEFAULT: the engineer who writes `detail: err.message` next year is
 *   writing the ordinary thing, and the ordinary thing is the defect.
 *
 * ─── AND WHAT TELEGRAM DOES NOT GET ─────────────────────────────────────────
 *
 *   Ownership. The asset stays in the Sovereign Vault; Telegram receives a
 *   copy of the bytes and returns a message id. The id is a receipt, not a
 *   title deed, and nothing here writes to the Vault at all.
 */

import type {
  CloudDestination,
  DeliveryRequest,
  DeliveryOutcome,
} from './destination-contract';

const API = 'https://api.telegram.org';

/** Telegram's own ceiling for a bot upload: 10MB a photo, 50MB a video. */
export const TELEGRAM_PHOTO_LIMIT_BYTES = 10 * 1024 * 1024;
export const TELEGRAM_VIDEO_LIMIT_BYTES = 50 * 1024 * 1024;

export class TelegramHasNoOAuth extends Error {
  constructor(method: string) {
    super(`Telegram grants no ${method} — the Creator supplies a bot token directly`);
    this.name = 'TelegramHasNoOAuth';
  }
}

/**
 * Remove any bot token from a string before it is logged or returned.
 *
 * A bot token is `<digits>:<35 or so url-safe characters>`. The pattern is
 * matched anywhere in the string, not only after `/bot`, so a token that
 * arrives in a message the shape of which nobody predicted is still removed.
 */
export function scrub(text: string): string {
  return text.replace(/\d{5,}:[A-Za-z0-9_-]{20,}/g, '<redacted>');
}

/** What a connected bot is, said from Telegram's own answer. */
export interface TelegramBotIdentity {
  readonly botId: string;
  readonly username: string | null;
}

/** Where a bot may publish, said from Telegram's own answer. */
export interface TelegramChatIdentity {
  readonly chatId: string;
  readonly title: string | null;
}

type TelegramEnvelope<T> = { ok?: unknown; result?: T; description?: unknown };

async function call<T>(
  botToken: string,
  method: string,
  params: Readonly<Record<string, string>> = {},
): Promise<{ ok: true; result: T } | { ok: false; status: number; detail: string }> {
  const url = new URL(`${API}/bot${botToken}/${method}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(20_000) });
    const body = (await response.json().catch(() => ({}))) as TelegramEnvelope<T>;
    if (!response.ok || body.ok !== true || body.result === undefined) {
      const said = typeof body.description === 'string' ? ` ${body.description}` : '';
      return { ok: false, status: response.status, detail: scrub(`HTTP ${response.status}${said}`) };
    }
    return { ok: true, result: body.result };
  } catch (err) {
    // The failure message can carry the URL — and the URL carries the token.
    return { ok: false, status: 0, detail: scrub(err instanceof Error ? err.message : 'no response') };
  }
}

/**
 * Is this a real, live bot token? Telegram answers, not this Empire.
 *
 * Used at connection time, so a Creator who mistypes one character is told
 * immediately rather than at their first publication.
 */
export async function identifyBot(botToken: string): Promise<TelegramBotIdentity | null> {
  const got = await call<{ id?: unknown; username?: unknown }>(botToken, 'getMe');
  if (!got.ok || typeof got.result.id !== 'number') return null;
  return {
    botId: String(got.result.id),
    username: typeof got.result.username === 'string' ? got.result.username : null,
  };
}

/**
 * Can this bot actually reach the place the Creator named?
 *
 * `getChat` is the honest test: it succeeds only when the bot is a member of
 * that chat or an admin of that channel. A Creator who names a channel they
 * forgot to add the bot to learns it here, at connection, where the remedy is
 * obvious — and not from a failed publication an hour later.
 */
export async function identifyChat(botToken: string, chat: string): Promise<TelegramChatIdentity | null> {
  const got = await call<{ id?: unknown; title?: unknown; username?: unknown }>(
    botToken, 'getChat', { chat_id: chat },
  );
  if (!got.ok || typeof got.result.id !== 'number') return null;
  const named =
    (typeof got.result.title === 'string' && got.result.title)
    || (typeof got.result.username === 'string' && `@${got.result.username}`)
    || null;
  return { chatId: String(got.result.id), title: named };
}

/**
 * The composite identity of one Telegram destination: `<botId>:<chatId>`.
 *
 * ─── WHY A PAIR AND NOT A BOT ───────────────────────────────────────────────
 *
 *   `cloud_accounts` is unique on (creator, provider, provider_account_id), and
 *   that uniqueness is what makes re-linking REPLACE a grant instead of
 *   leaving a second live one behind. For Telegram the thing a Creator links
 *   is not «a bot» — a bot publishes nowhere by itself — it is «this bot, into
 *   that channel». Two channels of one bot are two destinations a Creator must
 *   be able to see and revoke separately, so the pair is the identity.
 *
 *   Neither half is a secret. The token is sealed in its own column.
 */
export function telegramAccountKey(botId: string, chatId: string): string {
  return `${botId}:${chatId}`;
}

/** Recover the chat from a stored account key. The last colon separates them. */
export function chatFromAccountKey(key: string): string | null {
  const cut = key.lastIndexOf(':');
  if (cut <= 0 || cut === key.length - 1) return null;
  return key.slice(cut + 1);
}

export const telegramDestination: CloudDestination = {
  identity: {
    id: 'telegram',
    labelAr: 'تيليجرام',
    /**
     * ALWAYS true, and this is the one honest answer.
     *
     * `configured` asks «does the Empire hold the credentials to offer this at
     * all?» — for Google that is the Empire's own client secret, which a
     * Creator cannot supply. For Telegram the credential is the CREATOR'S, and
     * the Empire needs none of its own. Reporting false here would hide a door
     * that is in fact open.
     */
    configured: true,
  },

  authorizationUrl() {
    throw new TelegramHasNoOAuth('authorization URL');
  },

  async exchangeCode() {
    throw new TelegramHasNoOAuth('code exchange');
  },

  /**
   * The bot token is both the lasting grant and the hour of access.
   *
   * It is still re-validated every time, because the ONE thing that can change
   * without this Empire hearing about it is the token being revoked in
   * @BotFather. Returning it unchecked would make every revoked grant look
   * live until the publication itself failed.
   */
  async refreshAccess(refreshToken) {
    const bot = await identifyBot(refreshToken);
    return bot ? refreshToken : null;
  },

  async deliver(accessToken, request: DeliveryRequest): Promise<DeliveryOutcome> {
    const chat = request.providerTarget;
    if (!chat) {
      // Not a provider failure — a caller that did not say where. Named as
      // such rather than reported as a Telegram rejection.
      return { ok: false, reason: 'rejected', detail: 'no chat target given' };
    }

    const isPhoto = request.mimeType.startsWith('image/');
    const isVideo = request.mimeType.startsWith('video/');
    if (!isPhoto && !isVideo) {
      return { ok: false, reason: 'rejected', detail: `unsupported media ${request.mimeType}` };
    }

    const limit = isPhoto ? TELEGRAM_PHOTO_LIMIT_BYTES : TELEGRAM_VIDEO_LIMIT_BYTES;
    if (request.bytes.byteLength > limit) {
      // Refused HERE rather than by Telegram, so the Creator is told the real
      // reason instead of a 413 the Chamber would have to guess at.
      return { ok: false, reason: 'rejected', detail: `${request.bytes.byteLength} bytes exceeds ${limit}` };
    }

    const form = new FormData();
    form.set('chat_id', chat);
    form.set(
      isPhoto ? 'photo' : 'video',
      new Blob([new Uint8Array(request.bytes)], { type: request.mimeType }),
      request.fileName,
    );

    const method = isPhoto ? 'sendPhoto' : 'sendVideo';
    try {
      const response = await fetch(`${API}/bot${accessToken}/${method}`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(180_000),
      });
      const body = (await response.json().catch(() => ({}))) as TelegramEnvelope<{ message_id?: unknown }>;

      if (response.status === 401 || response.status === 403) {
        // 401 is a revoked token; 403 is a bot removed from the channel or
        // stripped of its posting right. Both mean the grant no longer works,
        // and both have the same single remedy: link it again.
        return { ok: false, reason: 'unauthorised', detail: scrub(`HTTP ${response.status}`) };
      }
      if (!response.ok || body.ok !== true) {
        const said = typeof body.description === 'string' ? ` ${body.description}` : '';
        return { ok: false, reason: 'rejected', detail: scrub(`HTTP ${response.status}${said}`) };
      }

      const id = body.result?.message_id;
      // A 200 with no message id is NOT a publication. The receipt is the
      // proof, and a success asserted without one is the fake success state
      // this whole path exists to make impossible.
      return typeof id === 'number'
        ? { ok: true, providerFileId: String(id) }
        : { ok: false, reason: 'rejected', detail: 'no message id returned' };
    } catch (err) {
      return {
        ok: false,
        reason: 'unreachable',
        detail: scrub(err instanceof Error ? err.message : 'no response'),
      };
    }
  },
};
