/**
 * AZMA OS — the legacy asset that learns its shape, 2026-09-29.
 *
 *   No backfill script runs against production. An asset that predates the
 *   pixel columns is measured the first time something actually asks, and what
 *   is learned is written back. These hold that to a real database and real
 *   bytes on disk.
 */

import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { SCHEMA_STATEMENTS, VAULT_ASSETS_MIGRATION_COLUMNS } from '../../persistent-storage/schema';
import { resolveAssetShape } from '../resolve-asset-dimensions';
import type { VaultAsset } from '../../vault/sovereign-vault-types';

function png(w: number, h: number): Buffer {
  const b = Buffer.alloc(24);
  // The FULL 8-byte signature. MEASURED 2026-09-29: this fixture wrote only
  // `0x89 P N G` and the old private detector accepted it — a file that is not
  // a PNG. The Vault's signature table refused it the moment this module
  // started asking the Empire's one authority instead of its own.
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20);
  return b;
}

function freshDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  for (const s of SCHEMA_STATEMENTS) db.exec(s);
  for (const c of VAULT_ASSETS_MIGRATION_COLUMNS) {
    try { db.exec(`ALTER TABLE vault_assets ADD COLUMN ${c.ddl}`); } catch { /* already there */ }
  }
  return db;
}

function legacyRow(db: DatabaseSync, assetId: string, uri: string): VaultAsset {
  db.prepare(
    `INSERT INTO vault_assets (asset_id, subscriber_tenant_id, originating_operation_id,
      capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(assetId, 'tenant-1', 'op-1', 'VISUAL', 'MEDIA', uri, '{}', 1, 1);
  return {
    assetId,
    subscriberTenantId: 'tenant-1',
    originatingOperationId: 'op-1',
    capabilityTarget: 'VISUAL',
    assetFamily: 'MEDIA',
    secureStorageUri: uri,
    metadata: {},
    createdAt: 1,
    updatedAt: 1,
  } as VaultAsset;
}

const read = (db: DatabaseSync, id: string) =>
  db.prepare('SELECT pixel_width AS w, pixel_height AS h FROM vault_assets WHERE asset_id = ?')
    .get(id) as unknown as { w: number | null; h: number | null };

it('an asset that predates the columns is measured on the first real question, and remembers', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'azma-dim-'));
  mkdirSync(join(dir, 'generated-assets'), { recursive: true });
  writeFileSync(join(dir, 'generated-assets', 'old.png'), png(1920, 1080));
  process.env.UPLOADS_DIR = dir;

  const db = freshDb();
  const asset = legacyRow(db, 'asset-legacy', '/generated-assets/old.png');
  expect(read(db, 'asset-legacy')).toEqual({ w: null, h: null });

  const shape = await resolveAssetShape(db, asset);
  expect(shape.source).toBe('measured');
  expect(shape.aspectRatio).toBe('16:9');
  // Written back, so the next caller reads it rather than the disk.
  expect(read(db, 'asset-legacy')).toEqual({ w: 1920, h: 1080 });

  delete process.env.UPLOADS_DIR;
});

it('an asset whose file is gone says it does not know, and writes nothing', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'azma-dim-'));
  process.env.UPLOADS_DIR = dir;

  const db = freshDb();
  const asset = legacyRow(db, 'asset-missing', '/generated-assets/vanished.png');

  const shape = await resolveAssetShape(db, asset);
  expect(shape.source).toBe('unknown');
  expect(shape.dimensions).toBeNull();
  expect(shape.aspectRatio).toBeNull();
  // Never a zero, never a default shape.
  expect(read(db, 'asset-missing')).toEqual({ w: null, h: null });

  delete process.env.UPLOADS_DIR;
});
