/**
 * AZMA OS — Telegram, the first destination that is not a drive, 2026-10-04.
 *
 *   `destination-contract.ts` has claimed since the day it was written that a
 *   fourth provider could be added «دون فتح الحجرة». One implementation of an
 *   interface proves nothing about the interface, so the claim stood unproven
 *   for as long as Google Drive was alone behind it.
 *
 *   Every test below is a line that, if deleted, breaks something real that no
 *   other test in this repository would catch. `fetch` is replaced so no test
 *   ever touches Telegram — and the LIVE proof is a separate act, on the
 *   production machine, with a real bot.
 */

import {
  telegramDestination,
  identifyBot,
  identifyChat,
  scrub,
  telegramAccountKey,
  chatFromAccountKey,
  TelegramHasNoOAuth,
  TELEGRAM_PHOTO_LIMIT_BYTES,
} from '../telegram-destination';
import { destinationFor } from '../destination-for';

const BOT = '8012345678:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]);

/** Telegram's own envelope shape, so a stub cannot be laxer than the API. */
const ok = (result: unknown) =>
  ({ ok: true, status: 200, json: async () => ({ ok: true, result }) }) as unknown as Response;
const refused = (status: number, description: string) =>
  ({ ok: false, status, json: async () => ({ ok: false, description }) }) as unknown as Response;

let calls: string[];
const original = global.fetch;
beforeEach(() => { calls = []; });
afterEach(() => { global.fetch = original; });

function answerWith(fn: (url: string, init?: RequestInit) => Response | Promise<Response>) {
  global.fetch = (async (input: unknown, init?: RequestInit) => {
    const url = String(input);
    calls.push(url);
    return fn(url, init);
  }) as unknown as typeof fetch;
}

// ── A · the contract halves Telegram genuinely does not have ──────────────
it('A · Telegram refuses to pretend it has an authorization URL', () => {
  // A stub returning something harmless-looking is a path a future caller can
  // take by accident and get silence instead of an answer.
  expect(() => telegramDestination.authorizationUrl({ redirectUri: 'x', state: 'y', nonce: 'z' }))
    .toThrow(TelegramHasNoOAuth);
});

it('A · and refuses to pretend it can exchange a code', async () => {
  await expect(telegramDestination.exchangeCode('code', 'uri', 'nonce')).rejects.toThrow(TelegramHasNoOAuth);
});

// ── B · the credential is validated against Telegram, never assumed ───────
it('B · a bot token is accepted only because Telegram said so', async () => {
  answerWith(() => ok({ id: 8012345678, username: 'azma_test_bot' }));
  expect(await identifyBot(BOT)).toEqual({ botId: '8012345678', username: 'azma_test_bot' });
});

it('B · an invalid bot token fails honestly — null, not a usable grant', async () => {
  answerWith(() => refused(401, 'Unauthorized'));
  expect(await identifyBot(BOT)).toBeNull();
});

it('B · refreshAccess re-asks Telegram, so a revoked token stops working', async () => {
  // The one thing that can change without this Empire hearing about it is the
  // token being revoked in @BotFather. Returning it unchecked would make
  // every revoked grant look live until the publication itself failed.
  answerWith(() => refused(401, 'Unauthorized'));
  expect(await telegramDestination.refreshAccess(BOT)).toBeNull();
  expect(calls.some((c) => c.includes('/getMe'))).toBe(true);
});

it('B · a destination the bot cannot reach is refused at connection time', async () => {
  // `getChat` succeeds only when the bot is a member or an admin. A Creator
  // who forgot to add it learns here, where the remedy is obvious.
  answerWith(() => refused(400, 'chat not found'));
  expect(await identifyChat(BOT, '@no_such_channel')).toBeNull();
});

// ── C · the destination resolves, and the target survives the round trip ──
it('C · the Telegram destination is resolvable from its provider name', () => {
  expect(destinationFor('telegram')).toBe(telegramDestination);
});

it('C · dropbox is a name with no binding, and resolves to nothing', () => {
  // Mapping it to anything — least of all to Google's destination — would
  // turn an honest gap into a silent wrong delivery.
  expect(destinationFor('dropbox')).toBeNull();
});

it('C · the chat survives the account key it is stored in', () => {
  const key = telegramAccountKey('8012345678', '-1001234567890');
  expect(chatFromAccountKey(key)).toBe('-1001234567890');
});

it('C · and an @name chat survives it too', () => {
  expect(chatFromAccountKey(telegramAccountKey('801', '@azma_channel'))).toBe('@azma_channel');
});

// ── D · publishing ────────────────────────────────────────────────────────
it('D · an image is published through sendPhoto, carrying the chat and the bytes', async () => {
  let body: FormData | null = null;
  answerWith((_u, init) => { body = init?.body as FormData; return ok({ message_id: 4242 }); });

  const outcome = await telegramDestination.deliver(BOT, {
    bytes: PNG, fileName: 'AZMA — asset.png', mimeType: 'image/png', providerTarget: '@azma_channel',
  });

  expect(outcome).toEqual({ ok: true, providerFileId: '4242' });
  expect(calls[0]).toContain('/sendPhoto');
  expect(body!.get('chat_id')).toBe('@azma_channel');
  expect(body!.get('photo')).toBeInstanceOf(Blob);
});

it('D · a video is published through sendVideo, not sendPhoto', async () => {
  answerWith(() => ok({ message_id: 7 }));
  await telegramDestination.deliver(BOT, {
    bytes: PNG, fileName: 'f.mp4', mimeType: 'video/mp4', providerTarget: '-100123',
  });
  expect(calls[0]).toContain('/sendVideo');
  expect(calls[0]).not.toContain('/sendPhoto');
});

it('D · the real Telegram message id is what comes back, not a generated one', async () => {
  answerWith(() => ok({ message_id: 90210 }));
  const outcome = await telegramDestination.deliver(BOT, {
    bytes: PNG, fileName: 'f.png', mimeType: 'image/png', providerTarget: '@c',
  });
  expect(outcome).toEqual({ ok: true, providerFileId: '90210' });
});

it('D · a 200 with no message id is NOT a publication', async () => {
  // The receipt is the proof. A success asserted without one is exactly the
  // fake success state this path exists to make impossible.
  answerWith(() => ok({}));
  expect(await telegramDestination.deliver(BOT, {
    bytes: PNG, fileName: 'f.png', mimeType: 'image/png', providerTarget: '@c',
  })).toMatchObject({ ok: false, reason: 'rejected' });
});

it('D · no chat target is a caller error, named as one', async () => {
  answerWith(() => ok({ message_id: 1 }));
  expect(await telegramDestination.deliver(BOT, {
    bytes: PNG, fileName: 'f.png', mimeType: 'image/png',
  })).toMatchObject({ ok: false, reason: 'rejected' });
  // And nothing was sent to Telegram at all.
  expect(calls).toEqual([]);
});

// ── E · failure stays failure ─────────────────────────────────────────────
it('E · a rejected publication never becomes a published one', async () => {
  answerWith(() => refused(400, 'Bad Request: wrong file identifier'));
  expect(await telegramDestination.deliver(BOT, {
    bytes: PNG, fileName: 'f.png', mimeType: 'image/png', providerTarget: '@c',
  })).toMatchObject({ ok: false, reason: 'rejected' });
});

it('E · a bot removed from its channel is reported as a grant to renew', async () => {
  answerWith(() => refused(403, 'Forbidden: bot was kicked'));
  expect(await telegramDestination.deliver(BOT, {
    bytes: PNG, fileName: 'f.png', mimeType: 'image/png', providerTarget: '@c',
  })).toMatchObject({ ok: false, reason: 'unauthorised' });
});

it('E · an unreachable Telegram is unreachable, not a rejection', async () => {
  answerWith(() => { throw new Error('network down'); });
  expect(await telegramDestination.deliver(BOT, {
    bytes: PNG, fileName: 'f.png', mimeType: 'image/png', providerTarget: '@c',
  })).toMatchObject({ ok: false, reason: 'unreachable' });
});

it('E · unsupported media is refused before Telegram is troubled with it', async () => {
  answerWith(() => ok({ message_id: 1 }));
  expect(await telegramDestination.deliver(BOT, {
    bytes: PNG, fileName: 'f.mp3', mimeType: 'audio/mpeg', providerTarget: '@c',
  })).toMatchObject({ ok: false, reason: 'rejected' });
  expect(calls).toEqual([]);
});

it('E · a file past the platform ceiling is refused here, with the real reason', async () => {
  answerWith(() => ok({ message_id: 1 }));
  const outcome = await telegramDestination.deliver(BOT, {
    bytes: new Uint8Array(TELEGRAM_PHOTO_LIMIT_BYTES + 1),
    fileName: 'big.png', mimeType: 'image/png', providerTarget: '@c',
  });
  // Refused HERE, so the Creator is told the ceiling rather than a 413 the
  // Chamber would have to guess at.
  expect(outcome).toMatchObject({ ok: false, reason: 'rejected' });
  expect(calls).toEqual([]);
});

// ── F · the token is in the URL, so every string out of here is scrubbed ──
it('F · a bot token never survives in a detail string', () => {
  // The shape of this API makes the leak the DEFAULT: the engineer who writes
  // `detail: err.message` is writing the ordinary thing, and `err.message`
  // from a fetch failure carries the URL, and the URL carries the token.
  expect(scrub(`request to https://api.telegram.org/bot${BOT}/sendPhoto failed`))
    .not.toContain(BOT);
});

it('F · and a network failure that names the URL carries no token out', async () => {
  answerWith(() => { throw new Error(`connect ECONNREFUSED https://api.telegram.org/bot${BOT}/sendPhoto`); });
  const outcome = await telegramDestination.deliver(BOT, {
    bytes: PNG, fileName: 'f.png', mimeType: 'image/png', providerTarget: '@c',
  });
  expect(outcome.ok).toBe(false);
  expect(JSON.stringify(outcome)).not.toContain(BOT);
});

it('F · a provider refusal that echoes the URL carries no token out either', async () => {
  answerWith(() => refused(400, `Bad Request at /bot${BOT}/sendPhoto`));
  const outcome = await telegramDestination.deliver(BOT, {
    bytes: PNG, fileName: 'f.png', mimeType: 'image/png', providerTarget: '@c',
  });
  expect(JSON.stringify(outcome)).not.toContain(BOT);
});

it('F · and a successful outcome carries no token either', async () => {
  answerWith(() => ok({ message_id: 5 }));
  const outcome = await telegramDestination.deliver(BOT, {
    bytes: PNG, fileName: 'f.png', mimeType: 'image/png', providerTarget: '@c',
  });
  // `deliver` is handed a token, uses it, and forgets it — the contract's own
  // rule, which only a test can keep true.
  expect(JSON.stringify(outcome)).not.toContain(BOT);
});
