/**
 * AZMA OS — a Creator's grant, held in trust, 2026-09-29.
 *
 *   FOUNDER: «حسابات المستخدم السحابية... بعد أن يقوم بربطها». The Empire
 *   owns nothing in that account. It holds one permission, and must be able
 *   to prove it never held it in the open.
 */

import { DatabaseSync } from 'node:sqlite';
import { SCHEMA_STATEMENTS } from '../../persistent-storage/schema';
import { encryptToken, decryptToken, isTokenVaultConfigured } from '../token-vault';
import {
  linkCloudAccount, listAccountsForCreator, revokeCloudAccount,
  readRefreshToken, markAccountUsed,
} from '../cloud-account-repository';

const KEY = 'a-server-secret-of-at-least-thirty-two-characters';

function freshDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  for (const s of SCHEMA_STATEMENTS) db.exec(s);
  return db;
}

beforeEach(() => { process.env.AZMA_TOKEN_KEY = KEY; });
afterEach(() => { delete process.env.AZMA_TOKEN_KEY; });

const sealedOf = (db: DatabaseSync) =>
  (db.prepare('SELECT refresh_token_sealed AS s FROM cloud_accounts').get() as unknown as { s: string | null }).s;

it('a token never touches the database in the open, and comes back exactly', () => {
  const sealed = encryptToken('1//refresh-token-value');
  expect(sealed).not.toContain('refresh-token-value');
  expect(decryptToken(sealed)).toBe('1//refresh-token-value');
});

it('sealing the same token twice produces different bytes', () => {
  // Two Creators who linked the same account must not be identifiable as such
  // by comparing two rows.
  expect(encryptToken('same')).not.toBe(encryptToken('same'));
});

it('a tampered seal opens to null, never to nonsense', () => {
  const sealed = encryptToken('real');
  const parts = sealed.split('.');
  const tampered = [parts[0], parts[1], Buffer.from('forged').toString('base64url')].join('.');
  expect(decryptToken(tampered)).toBeNull();
});

it('without a key the Empire REFUSES to hold a token — it never falls back to plaintext', () => {
  delete process.env.AZMA_TOKEN_KEY;
  expect(isTokenVaultConfigured()).toBe(false);
  expect(() => encryptToken('anything')).toThrow();
  const db = freshDb();
  expect(() => linkCloudAccount(db, {
    creatorId: 'c1', provider: 'google-drive', providerAccountId: 'g1',
    refreshToken: 'tok', scopes: ['drive.file'],
  })).toThrow();
  expect(db.prepare('SELECT COUNT(*) AS n FROM cloud_accounts').get()).toMatchObject({ n: 0 });
});

it('the stored row carries no readable token, and the Creator sees no token at all', () => {
  const db = freshDb();
  linkCloudAccount(db, {
    creatorId: 'c1', provider: 'google-drive', providerAccountId: 'g1',
    accountLabel: 'amr@example.com', refreshToken: 'secret-refresh', scopes: ['drive.file'],
  });
  expect(sealedOf(db)).not.toContain('secret-refresh');

  const shown = listAccountsForCreator(db, 'c1');
  expect(shown).toHaveLength(1);
  expect(JSON.stringify(shown)).not.toContain('secret-refresh');
  expect(shown[0].accountLabel).toBe('amr@example.com');
});

it('linking the same account twice replaces the grant instead of hiding a second', () => {
  const db = freshDb();
  const link = (t: string) => linkCloudAccount(db, {
    creatorId: 'c1', provider: 'google-drive', providerAccountId: 'g1',
    refreshToken: t, scopes: ['drive.file'],
  });
  link('first');
  link('second');
  expect(listAccountsForCreator(db, 'c1')).toHaveLength(1);
  const id = listAccountsForCreator(db, 'c1')[0].accountId;
  expect(readRefreshToken(db, id, 'c1')).toBe('second');
});

it('revoking leaves the record and destroys the power', () => {
  const db = freshDb();
  const acc = linkCloudAccount(db, {
    creatorId: 'c1', provider: 'google-drive', providerAccountId: 'g1',
    refreshToken: 'secret-refresh', scopes: ['drive.file'],
  });
  expect(revokeCloudAccount(db, acc.accountId, 'c1')).toBe(true);

  // The audit trail survives — Article 8.4 — carrying no key.
  const { n } = db.prepare('SELECT COUNT(*) AS n FROM cloud_accounts').get() as unknown as { n: number };
  expect(n).toBe(1);
  expect(sealedOf(db)).toBeNull();
  expect(readRefreshToken(db, acc.accountId, 'c1')).toBeNull();
  expect(listAccountsForCreator(db, 'c1')).toHaveLength(0);
});

it('one Creator can never read or revoke the grant of another', () => {
  const db = freshDb();
  const acc = linkCloudAccount(db, {
    creatorId: 'c1', provider: 'google-drive', providerAccountId: 'g1',
    refreshToken: 'mine', scopes: ['drive.file'],
  });
  expect(readRefreshToken(db, acc.accountId, 'intruder')).toBeNull();
  expect(revokeCloudAccount(db, acc.accountId, 'intruder')).toBe(false);
  expect(readRefreshToken(db, acc.accountId, 'c1')).toBe('mine');
  markAccountUsed(db, acc.accountId, 'c1');
  expect(listAccountsForCreator(db, 'c1')[0].lastUsedAtMs).not.toBeNull();
});
