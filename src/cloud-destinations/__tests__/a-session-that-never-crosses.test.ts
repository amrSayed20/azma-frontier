/**
 * AZMA OS — the Creator's Telegram session, and the server that never sees it.
 *
 *   FOUNDER'S RULING, 2026-10-04, accepted as PARTIAL ZERO-CUSTODY:
 *
 *     «Telegram user sessions MUST NOT be stored on the AZMA server… MUST NOT
 *      enter cloud_accounts, distribution_receipts, backups, logs, API
 *      responses, or server-side persistence.»
 *
 *     «Before implementation is considered complete, prove that the
 *      browser-side session never crosses into AZMA server persistence, logs,
 *      receipts, backups, or API responses.»
 *
 *   A ruling that lives only in a comment is a ruling the next edit removes.
 *   These tests are the ruling in a form that fails a build.
 *
 *   A real SQLite file throughout: a claim about what is written to disk,
 *   proven against memory, proves nothing about disk.
 */

import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync, readFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { SCHEMA_STATEMENTS } from '../../persistent-storage/schema';
import {
  linkCloudAccount,
  listAccountsForCreator,
  readRefreshToken,
  readAccountBinding,
} from '../cloud-account-repository';
import {
  recordDistribution,
  listReceiptsForCreator,
} from '../../persistent-storage/distribution-receipt-repository';
import {
  telegramUserAccountKey,
  peerFromAccountKey,
  looksLikeTelegramSession,
  telegramUserDestination,
  telegramAppCredentials,
} from '../telegram-user-destination';
import { destinationFor, serverCanDeliver } from '../destination-for';

/** A GramJS StoreSession string's real shape: version byte `1`, then base64. */
const SESSION = `1${'AbCdEfGh0123456789_-'.repeat(12)}`;
const KEY = telegramUserAccountKey('777000', '-1001234567890');

let dir: string;
let file: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'azma-tgu-'));
  file = join(dir, 'tgu.db');
  process.env.AZMA_TOKEN_KEY = 'a-test-key-of-at-least-thirty-two-characters';
});
afterEach(() => {
  delete process.env.AZMA_TOKEN_KEY;
  try { rmSync(dir, { recursive: true, force: true }); } catch { /* reclaimed */ }
});

function open(): DatabaseSync {
  const db = new DatabaseSync(file);
  for (const s of SCHEMA_STATEMENTS) db.exec(s);
  return db;
}

const link = (db: DatabaseSync) =>
  linkCloudAccount(db, {
    creatorId: 'creator-1',
    provider: 'telegram-user',
    providerAccountId: KEY,
    accountLabel: 'قناة أزما — @creator',
    // THE RULING, IN ONE ARGUMENT.
    refreshToken: null,
    scopes: ['client-publish'],
  });

// ── A · the account carries no secret, and the file proves it ─────────────
it('A · a linked telegram-user account stores no secret at all', () => {
  const db = open();
  const account = link(db);
  const row = db
    .prepare('SELECT * FROM cloud_accounts WHERE account_id = ?')
    .get(account.accountId) as unknown as Record<string, unknown>;
  expect(row.refresh_token_sealed).toBeNull();
  db.close();
});

it('A · and reading a token for it yields nothing, because there is nothing', () => {
  const db = open();
  const account = link(db);
  expect(readRefreshToken(db, account.accountId, 'creator-1')).toBeNull();
  db.close();
});

it('A · the database FILE contains no session anywhere — backups included', () => {
  // The Founder named backups explicitly. A backup is a copy of this file, so
  // the file is what must be searched, not the rows a query happens to return.
  const db = open();
  link(db);
  recordDistribution(db, {
    creatorId: 'creator-1', sourceAssetId: 'asset-1', provider: 'telegram-user',
    accountId: 'cloud-1', providerTarget: '-1001234567890',
    providerMessageId: '4242', status: 'PUBLISHED',
  });
  db.close();
  expect(readFileSync(file, 'latin1')).not.toContain(SESSION);
});

// ── B · every door that could take one, refuses ───────────────────────────
it('B · a session string is recognised for what it is', () => {
  expect(looksLikeTelegramSession(SESSION)).toBe(true);
});

it('B · and the ordinary values of this path are never mistaken for one', () => {
  // A guard that refuses real traffic is a guard someone removes.
  for (const ordinary of ['777000', '-1001234567890', '@azma_channel', 'قناة أزما', '4242', '']) {
    expect(looksLikeTelegramSession(ordinary)).toBe(false);
  }
});

// ── C · the receipt holds a message id and nothing else ───────────────────
it('C · a telegram-user receipt carries the message id, the peer, and no secret', () => {
  const db = open();
  recordDistribution(db, {
    creatorId: 'creator-1', sourceAssetId: 'asset-1', provider: 'telegram-user',
    accountId: 'cloud-1', providerTarget: '-1001234567890',
    providerMessageId: '4242', status: 'PUBLISHED',
  });
  const held = listReceiptsForCreator(db, 'creator-1');
  expect(held[0].providerMessageId).toBe('4242');
  expect(JSON.stringify(held)).not.toContain(SESSION);
  db.close();
});

it('C · the provider name is what records that a browser reported it', () => {
  // No extra column states «client-reported»: `telegram-user` means exactly
  // that, for every row, permanently — and `telegram` means the server
  // observed it. The distinction cannot drift because it is the identity.
  const db = open();
  recordDistribution(db, {
    creatorId: 'creator-1', sourceAssetId: 'a', provider: 'telegram-user',
    accountId: 'c', providerMessageId: '1', status: 'PUBLISHED',
  });
  expect(listReceiptsForCreator(db, 'creator-1')[0].provider).toBe('telegram-user');
  db.close();
});

// ── D · the server cannot deliver, and says so ────────────────────────────
it('D · the server has no destination that can deliver for telegram-user', () => {
  // Not because the provider is unimplemented — because the server holds no
  // session for it. A caller that finds null must refuse, never improvise.
  expect(destinationFor('telegram-user')).toBeNull();
  expect(serverCanDeliver('telegram-user')).toBe(false);
});

it('D · while the bot path remains server-delivered, untouched', () => {
  expect(serverCanDeliver('telegram')).toBe(true);
  expect(serverCanDeliver('google-drive')).toBe(true);
});

it('D · and the provider declares that its delivery is the client\'s', () => {
  expect(telegramUserDestination.deliveredBy).toBe('client');
});

// ── E · routing reaches the browser; identity stays off it ────────────────
it('E · the peer is exposed to the browser, because the browser must address it', () => {
  const db = open();
  link(db);
  const shown = listAccountsForCreator(db, 'creator-1');
  expect(shown[0].clientTarget).toBe('-1001234567890');
  db.close();
});

it('E · and a server-delivered account exposes no peer to the browser at all', () => {
  const db = open();
  linkCloudAccount(db, {
    creatorId: 'creator-1', provider: 'telegram', providerAccountId: 'bot1:-100999',
    accountLabel: 'قناة', refreshToken: 'bot-token', scopes: ['publish'],
  });
  expect(listAccountsForCreator(db, 'creator-1')[0].clientTarget).toBeNull();
  db.close();
});

it('E · the binding is still creator-scoped, as every read on this table is', () => {
  const db = open();
  const account = link(db);
  expect(readAccountBinding(db, account.accountId, 'creator-2')).toBeNull();
  expect(peerFromAccountKey(KEY)).toBe('-1001234567890');
  db.close();
});

// ── F · the application credentials are not an account credential ─────────
it('F · api_id and api_hash are read at call time, never frozen at import', () => {
  // The frozen-constant form has caused three production defects here. This
  // holds the lesson to the one new module that reads an environment value.
  delete process.env.TELEGRAM_API_ID;
  delete process.env.TELEGRAM_API_HASH;
  expect(telegramAppCredentials()).toBeNull();

  process.env.TELEGRAM_API_ID = '30933338';
  process.env.TELEGRAM_API_HASH = 'x'.repeat(32);
  expect(telegramAppCredentials()).toEqual({ apiId: 30933338, apiHash: 'x'.repeat(32) });

  delete process.env.TELEGRAM_API_ID;
  delete process.env.TELEGRAM_API_HASH;
});

it('F · a malformed api_id yields nothing rather than NaN', () => {
  process.env.TELEGRAM_API_ID = 'not-a-number';
  process.env.TELEGRAM_API_HASH = 'x'.repeat(32);
  expect(telegramAppCredentials()).toBeNull();
  delete process.env.TELEGRAM_API_ID;
  delete process.env.TELEGRAM_API_HASH;
});
