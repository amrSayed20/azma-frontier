/**
 * AZMA OS — TELEGRAM, PUBLISHED BY THE CREATOR'S OWN ACCOUNT
 *
 * ─── THIS FILE HOLDS NO CREDENTIAL AND MAKES NO CALL ────────────────────────
 *
 *   That is the point of it. Everything Telegram-facing for this provider
 *   happens in `app/makman-al-ghayah/telegram-user-client.ts`, which runs in
 *   the Creator's browser. What lives here is only what the SERVER is allowed
 *   to know: the provider's name, how a destination is identified, and the
 *   fact that the server is not the one who delivers.
 *
 *   FOUNDER, 2026-10-04: «Telegram user sessions MUST NOT be stored on the
 *   AZMA server… MUST NOT enter cloud_accounts, distribution_receipts,
 *   backups, logs, API responses, or server-side persistence.»
 *
 * ─── WHY IT IS A SEPARATE PROVIDER FROM `telegram` ──────────────────────────
 *
 *   A bot grant and a user session are not two values of one thing. One is a
 *   secret the server holds and spends; the other is a secret the server must
 *   never see. Overloading one provider name would mean a single row could be
 *   either, and every reader would have to guess which — including
 *   `destinationFor`, which would hand a bot's uploader a user's account.
 *
 *   Two names, and the ambiguity cannot be expressed.
 *
 * ─── WHAT THE SERVER CANNOT DO, SAID PLAINLY ────────────────────────────────
 *
 *   It cannot verify which Telegram account is connected. The identity below
 *   is reported by the browser, and the server has no session with which to
 *   check it. That is not an oversight — holding the means to check it IS the
 *   custody the Founder rejected. The label a Creator sees is their own
 *   browser's report of their own account, which is the honest description.
 */

import type { CloudProviderIdentity } from './destination-contract';
import type { ClientExecutedDestination } from './client-delivery-contract';

/**
 * Whether the Empire holds the application credentials MTProto requires.
 *
 * `api_id`/`api_hash` identify AZMA AS AN APPLICATION to Telegram. They are
 * NOT any Creator's credential and grant access to no account; they are what
 * Telegram requires before any client — including a Creator's browser — may
 * speak the protocol at all.
 *
 * Read at CALL time. The frozen-constant form has caused three production
 * defects in this repository, each with that lesson written beside it.
 */
export function telegramUserIsConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_API_ID && process.env.TELEGRAM_API_HASH);
}

/**
 * The application credentials, for the one caller that may have them: the
 * route that hands them to the Creator's own browser.
 *
 * `api_hash` is not a user secret, but it is not public either — a stolen one
 * is used for someone else's automation until Telegram bans it, and a ban
 * takes this path away from every Creator at once. So it leaves the server
 * only to an authenticated Creator, never into a static bundle.
 */
export function telegramAppCredentials(): { apiId: number; apiHash: string } | null {
  const id = Number(process.env.TELEGRAM_API_ID);
  const hash = process.env.TELEGRAM_API_HASH;
  if (!Number.isInteger(id) || id <= 0 || !hash) return null;
  return { apiId: id, apiHash: hash };
}

const identity: CloudProviderIdentity = {
  id: 'telegram-user',
  labelAr: 'تيليجرام — حسابك',
  get configured() { return telegramUserIsConfigured(); },
};

export const telegramUserDestination: ClientExecutedDestination = {
  identity,
  deliveredBy: 'client',
};

/**
 * One destination: this Telegram account, publishing into that place.
 *
 * The same composite shape the bot path uses, for the same reason — an account
 * alone publishes nowhere, and two channels are two destinations a Creator
 * revokes separately. Neither half is a secret; both are routing.
 */
export function telegramUserAccountKey(telegramUserId: string, peerId: string): string {
  return `${telegramUserId}:${peerId}`;
}

/** Recover the peer from a stored account key. The last colon separates them. */
export function peerFromAccountKey(key: string): string | null {
  const cut = key.lastIndexOf(':');
  if (cut <= 0 || cut === key.length - 1) return null;
  return key.slice(cut + 1);
}

/**
 * A guard against the one mistake that would undo the whole ruling.
 *
 * If a future caller ever passes the browser's session string into a server
 * action — as a «convenience», or by widening a parameter — this is what
 * refuses it. A GramJS StoreSession string is long, url-safe base64 beginning
 * with `1` (its version byte); nothing legitimate on this path is remotely
 * that shape. Identity ids are short numbers, peers are numbers or @names.
 *
 * It is cheap, it is crude, and it sits at the only door through which such a
 * value could arrive.
 */
export function looksLikeTelegramSession(value: string): boolean {
  return value.length >= 64 && /^1[A-Za-z0-9+/_=-]{63,}$/.test(value.trim());
}
