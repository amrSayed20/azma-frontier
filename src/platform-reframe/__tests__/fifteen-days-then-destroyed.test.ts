/**
 * AZMA OS — the rendition that ends, and the master that does not, 2026-09-29.
 *
 *   FOUNDER: «الاحتفاظ به داخل الخزانة لمدة 15 يوم ثم يحذف» · «الإتلاف
 *   النهائي بعد إخبار صاحب الأصل».
 *
 *   Held to a real database and a real file, because destruction that is only
 *   asserted in prose is destruction nobody has seen happen.
 */

import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { SCHEMA_STATEMENTS, VAULT_ASSETS_MIGRATION_COLUMNS } from '../../persistent-storage/schema';
import { sweepExpiredRenditions, RETENTION_DAYS, RETENTION_MS } from '../retention';
import { createPublicLink, revokePublicLink } from '../../persistent-storage/sovereign-project-repository';

const DAY = 24 * 60 * 60 * 1000;

function freshDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  for (const s of SCHEMA_STATEMENTS) db.exec(s);
  for (const c of VAULT_ASSETS_MIGRATION_COLUMNS) {
    try { db.exec(`ALTER TABLE vault_assets ADD COLUMN ${c.ddl}`); } catch { /* present */ }
  }
  return db;
}

function put(db: DatabaseSync, id: string, uri: string, expiresAtMs: number | null) {
  db.prepare(
    `INSERT INTO vault_assets (asset_id, subscriber_tenant_id, originating_operation_id,
      capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at, expires_at_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(id, 'tenant-1', 'op-1', 'VISUAL', 'MEDIA', uri,
    JSON.stringify({ reframedForLabel: 'تيك توك' }), 1, 1, expiresAtMs);
}

function stage() {
  const dir = mkdtempSync(join(tmpdir(), 'azma-retention-'));
  mkdirSync(join(dir, 'generated-assets'), { recursive: true });
  process.env.UPLOADS_DIR = dir;
  const file = (name: string) => {
    writeFileSync(join(dir, 'generated-assets', name), Buffer.from('bytes'));
    return `/generated-assets/${name}`;
  };
  return { dir, file };
}

afterEach(() => { delete process.env.UPLOADS_DIR; });

const rows = (db: DatabaseSync) =>
  (db.prepare('SELECT asset_id FROM vault_assets').all() as unknown as { asset_id: string }[])
    .map((r) => r.asset_id);

it('the master has no ending, and the sweep never touches it', () => {
  // «وأصلُك الأب يبقى بلا حدّ». NULL means kept without limit, and a sweep
  // that widened to masters would destroy a Creator's own work.
  const { file } = stage();
  const db = freshDb();
  put(db, 'master', file('master.png'), null);
  put(db, 'rendition', file('rendition.png'), Date.now() - DAY);

  const sweep = sweepExpiredRenditions(db, 'tenant-1');
  expect(sweep.destroyed.map((d) => d.assetId)).toEqual(['rendition']);
  expect(rows(db)).toEqual(['master']);
});

it('a rendition past its end is destroyed — bytes gone, tombstone written', () => {
  // Article 6.2 and 6.3: FINAL destruction, with a record that carries the
  // lineage. Not 6.1's hidden restorable copy, which is the accumulation
  // the Founder ordered prevented.
  const { dir, file } = stage();
  const db = freshDb();
  const uri = file('expired.png');
  put(db, 'expired', uri, Date.now() - DAY);

  const sweep = sweepExpiredRenditions(db, 'tenant-1');
  expect(sweep.destroyed).toHaveLength(1);
  expect(existsSync(join(dir, 'generated-assets', 'expired.png'))).toBe(false);
  expect(rows(db)).toEqual([]);

  const tomb = db.prepare('SELECT asset_id, deletion_reason FROM asset_tombstones').all() as unknown as
    { asset_id: string; deletion_reason: string }[];
  expect(tomb).toHaveLength(1);
  expect(tomb[0].asset_id).toBe('expired');
  expect(tomb[0].deletion_reason).toContain(String(RETENTION_DAYS));
});

it('a rendition still inside its fifteen days is kept, and warned about near the end', () => {
  // The notice is a CONDITION of the act, not a courtesy after it.
  const { file } = stage();
  const db = freshDb();
  put(db, 'fresh', file('fresh.png'), Date.now() + RETENTION_MS);
  put(db, 'soon',  file('soon.png'),  Date.now() + DAY);

  const sweep = sweepExpiredRenditions(db, 'tenant-1');
  expect(sweep.destroyed).toHaveLength(0);
  expect(sweep.dueSoon.map((r) => r.assetId)).toEqual(['soon']);
  expect(sweep.dueSoon[0].daysLeft).toBe(1);
  expect(rows(db).sort()).toEqual(['fresh', 'soon']);
});

it('one Creator\'s sweep cannot reach another Creator\'s renditions', () => {
  const { file } = stage();
  const db = freshDb();
  put(db, 'mine', file('mine.png'), Date.now() - DAY);
  db.prepare(
    `INSERT INTO vault_assets (asset_id, subscriber_tenant_id, originating_operation_id,
      capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at, expires_at_ms)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run('theirs', 'tenant-2', 'op-1', 'VISUAL', 'MEDIA', file('theirs.png'), '{}', 1, 1, Date.now() - DAY);

  sweepExpiredRenditions(db, 'tenant-1');
  expect(rows(db)).toEqual(['theirs']);
});

it('a rendition inside a standing publication is refused destruction — Article 6.4', () => {
  // MEASURED while writing this suite: the first draft of the guard passed a
  // STATE STRING to `isLive`, which takes the whole link, and matched on
  // `assetId`, which this record calls `finalWorkAssetId` — with a cast to
  // `never` silencing the type-checker on both. It would have found no
  // publication ever and destroyed exactly what 6.4 protects. So the guard is
  // proven against a REAL live link, not asserted.
  const { dir, file } = stage();
  const db = freshDb();
  const name = 'published.png';
  put(db, 'published', file(name), Date.now() - DAY);
  createPublicLink(db, { ownerId: 'tenant-1', finalWorkAssetId: 'published' });

  const sweep = sweepExpiredRenditions(db, 'tenant-1');
  expect(sweep.destroyed).toHaveLength(0);
  expect(sweep.spared).toHaveLength(1);
  expect(sweep.spared[0].reasonAr).toContain('نشرٍ قائم');
  // The bytes are still there, and so is the row. Nothing was silently done.
  expect(existsSync(join(dir, 'generated-assets', name))).toBe(true);
  expect(rows(db)).toEqual(['published']);
});

it('and once the link is withdrawn, the same rendition may be destroyed', () => {
  // 6.4 protects a STANDING publication, not a memory of one.
  const { file } = stage();
  const db = freshDb();
  put(db, 'wasPublished', file('was.png'), Date.now() - DAY);
  const link = createPublicLink(db, { ownerId: 'tenant-1', finalWorkAssetId: 'wasPublished' });
  revokePublicLink(db, link.linkId, 'tenant-1');

  const sweep = sweepExpiredRenditions(db, 'tenant-1');
  expect(sweep.destroyed.map((d) => d.assetId)).toEqual(['wasPublished']);
  expect(rows(db)).toEqual([]);
});
