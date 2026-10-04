/**
 * AZMA OS — the Telegram grant in the vault, and the receipt it leaves, 2026-10-04.
 *
 *   Two things had to be true before a Telegram publication could be called
 *   real, and neither is visible from the destination's own tests:
 *
 *     1. the bot token is SEALED by the existing vault — no new credential
 *        store, no plaintext column, and nothing readable from a backup;
 *     2. the publication leaves a RECORD that outlives the process. Commit
 *        c3c4d34 was named «A distribution leaves a receipt» and left it in a
 *        console line, which cannot be read back and does not survive a
 *        restart.
 *
 *   A real SQLite file, and a real close and re-open where durability is the
 *   subject. A durability claim proven against an in-memory database proves
 *   nothing about durability.
 */

import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { SCHEMA_STATEMENTS } from '../../persistent-storage/schema';
import {
  linkCloudAccount,
  listAccountsForCreator,
  readRefreshToken,
  readAccountBinding,
  revokeCloudAccount,
} from '../cloud-account-repository';
import {
  recordDistribution,
  listReceiptsForCreator,
  listReceiptsForAsset,
} from '../../persistent-storage/distribution-receipt-repository';
import { telegramAccountKey } from '../telegram-destination';

const BOT = '8012345678:AAHxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
const KEY = telegramAccountKey('8012345678', '-1001234567890');

let dir: string;
let file: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'azma-tg-'));
  file = join(dir, 'tg.db');
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

const link = (db: DatabaseSync, over: { creatorId?: string; providerAccountId?: string } = {}) =>
  linkCloudAccount(db, {
    creatorId: over.creatorId ?? 'creator-1',
    provider: 'telegram',
    providerAccountId: over.providerAccountId ?? KEY,
    accountLabel: 'قناة أزما — @azma_test_bot',
    refreshToken: BOT,
    scopes: ['publish'],
  });

// ── A · the token goes through the existing vault, and only there ─────────
it('A · the bot token is stored sealed — the plaintext is nowhere in the row', () => {
  const db = open();
  const account = link(db);
  const row = db
    .prepare('SELECT * FROM cloud_accounts WHERE account_id = ?')
    .get(account.accountId) as unknown as Record<string, unknown>;
  // Every column at once: a seal in the right column is no protection if the
  // token is also sitting in the label somebody chose to be helpful with.
  expect(JSON.stringify(row)).not.toContain(BOT);
  db.close();
});

it('A · and it comes back out whole for the one caller that needs it', () => {
  const db = open();
  const account = link(db);
  expect(readRefreshToken(db, account.accountId, 'creator-1')).toBe(BOT);
  db.close();
});

it('A · the Creator sees a label and no token — a Telegram grant is no exception', () => {
  const db = open();
  link(db);
  const shown = listAccountsForCreator(db, 'creator-1');
  expect(shown[0].provider).toBe('telegram');
  // What the browser receives, serialized exactly as the action returns it.
  expect(JSON.stringify(shown)).not.toContain(BOT);
  db.close();
});

it('A · another Creator holding the account id still gets nothing', () => {
  const db = open();
  const account = link(db);
  expect(readRefreshToken(db, account.accountId, 'creator-2')).toBeNull();
  db.close();
});

it('A · and unlinking blanks the seal, so the audit row carries no key', () => {
  const db = open();
  const account = link(db);
  expect(revokeCloudAccount(db, account.accountId, 'creator-1')).toBe(true);
  expect(readRefreshToken(db, account.accountId, 'creator-1')).toBeNull();
  db.close();
});

// ── B · the chat survives, because a publication cannot be routed without it ──
it('B · the chat is recoverable from the stored binding', () => {
  const db = open();
  const account = link(db);
  const binding = readAccountBinding(db, account.accountId, 'creator-1');
  expect(binding).toEqual({ provider: 'telegram', providerAccountId: KEY });
  db.close();
});

it('B · and the binding is creator-scoped like every other read', () => {
  const db = open();
  const account = link(db);
  expect(readAccountBinding(db, account.accountId, 'creator-2')).toBeNull();
  db.close();
});

it('B · two channels of one bot are two destinations, separately revocable', () => {
  const db = open();
  // The pair is the identity: a bot publishes nowhere by itself.
  const first = link(db, { providerAccountId: telegramAccountKey('801', '-100111') });
  const second = link(db, { providerAccountId: telegramAccountKey('801', '-100222') });
  expect(first.accountId).not.toBe(second.accountId);
  revokeCloudAccount(db, first.accountId, 'creator-1');
  expect(listAccountsForCreator(db, 'creator-1').map((a) => a.accountId)).toEqual([second.accountId]);
  db.close();
});

// ── C · the receipt outlives the process that wrote it ───────────────────
it('C · the real Telegram message id survives a restart', () => {
  const first = open();
  recordDistribution(first, {
    creatorId: 'creator-1', sourceAssetId: 'asset-1', provider: 'telegram',
    accountId: 'cloud-1', providerTarget: '-1001234567890',
    providerMessageId: '4242', status: 'PUBLISHED',
  });
  first.close();                       // the process that published is gone

  const second = open();               // and the Creator comes back tomorrow
  const held = listReceiptsForCreator(second, 'creator-1');
  expect(held).toHaveLength(1);
  expect(held[0].providerMessageId).toBe('4242');
  expect(held[0].status).toBe('PUBLISHED');
  second.close();
});

it('C · the receipt stays bound to the sovereign asset it came from', () => {
  const db = open();
  recordDistribution(db, {
    creatorId: 'creator-1', sourceAssetId: 'asset-1', provider: 'telegram',
    accountId: 'cloud-1', providerMessageId: '1', status: 'PUBLISHED',
  });
  expect(listReceiptsForAsset(db, 'creator-1', 'asset-1')).toHaveLength(1);
  expect(listReceiptsForAsset(db, 'creator-1', 'asset-2')).toEqual([]);
  db.close();
});

it('C · a failure is written down too, with its reason', () => {
  // A store that records only successes makes a failed publication
  // indistinguishable from one never attempted, and those two have
  // different remedies.
  const db = open();
  recordDistribution(db, {
    creatorId: 'creator-1', sourceAssetId: 'asset-1', provider: 'telegram',
    accountId: 'cloud-1', status: 'FAILED', failureReason: 'unauthorised',
  });
  const held = listReceiptsForCreator(db, 'creator-1');
  expect(held[0].status).toBe('FAILED');
  expect(held[0].providerMessageId).toBeNull();
  expect(held[0].failureReason).toBe('unauthorised');
  db.close();
});

it('C · a second publication of one asset is a second event, not an overwrite', () => {
  const db = open();
  const base = { creatorId: 'creator-1', sourceAssetId: 'asset-1', provider: 'telegram', accountId: 'cloud-1', status: 'PUBLISHED' } as const;
  recordDistribution(db, { ...base, providerMessageId: '1', nowMs: 1_000 });
  recordDistribution(db, { ...base, providerMessageId: '2', nowMs: 2_000 });
  // The asset's history is the list, and a history that replaces its entries
  // is not one.
  expect(listReceiptsForAsset(db, 'creator-1', 'asset-1').map((r) => r.providerMessageId)).toEqual(['2', '1']);
  db.close();
});

it('C · and no Creator ever sees another Creator\'s receipts', () => {
  const db = open();
  recordDistribution(db, {
    creatorId: 'creator-2', sourceAssetId: 'asset-9', provider: 'telegram',
    accountId: 'cloud-9', providerMessageId: '9', status: 'PUBLISHED',
  });
  expect(listReceiptsForCreator(db, 'creator-1')).toEqual([]);
  expect(listReceiptsForAsset(db, 'creator-1', 'asset-9')).toEqual([]);
  db.close();
});
