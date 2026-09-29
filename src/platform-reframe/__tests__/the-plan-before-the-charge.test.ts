/**
 * AZMA OS — the plan a Creator reads before approving anything, 2026-09-29.
 *
 *   Built against a real database and a real file on disk, because the plan's
 *   first act is to read the asset's own bytes.
 */

import { DatabaseSync } from 'node:sqlite';
import { mkdtempSync, mkdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { SCHEMA_STATEMENTS, VAULT_ASSETS_MIGRATION_COLUMNS } from '../../persistent-storage/schema';
import { buildReframePlan } from '../reframe-plan';
import type { VaultAsset } from '../../vault/sovereign-vault-types';

function png(w: number, h: number): Buffer {
  const b = Buffer.alloc(24);
  b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], 0);
  b.write('IHDR', 12, 'ascii');
  b.writeUInt32BE(w, 16); b.writeUInt32BE(h, 20);
  return b;
}

function stage(w: number, h: number): { db: DatabaseSync; asset: VaultAsset } {
  const dir = mkdtempSync(join(tmpdir(), 'azma-reframe-'));
  mkdirSync(join(dir, 'generated-assets'), { recursive: true });
  writeFileSync(join(dir, 'generated-assets', 'master.png'), png(w, h));
  process.env.UPLOADS_DIR = dir;

  const db = new DatabaseSync(':memory:');
  for (const s of SCHEMA_STATEMENTS) db.exec(s);
  for (const c of VAULT_ASSETS_MIGRATION_COLUMNS) {
    try { db.exec(`ALTER TABLE vault_assets ADD COLUMN ${c.ddl}`); } catch { /* present */ }
  }
  db.prepare(
    `INSERT INTO vault_assets (asset_id, subscriber_tenant_id, originating_operation_id,
      capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run('asset-master', 'tenant-1', 'op-1', 'VISUAL', 'MEDIA', '/generated-assets/master.png', '{}', 1, 1);

  return {
    db,
    asset: {
      assetId: 'asset-master', subscriberTenantId: 'tenant-1', originatingOperationId: 'op-1',
      capabilityTarget: 'VISUAL', assetFamily: 'MEDIA',
      secureStorageUri: '/generated-assets/master.png', metadata: {}, createdAt: 1, updatedAt: 1,
    } as VaultAsset,
  };
}

afterEach(() => { delete process.env.UPLOADS_DIR; });

it('a phone photo is reframed for YouTube and refused for TikTok — one charge, not two', () => {
  // 2048×1536 is 4:3, which is what a phone and most cameras actually hand a
  // Creator. Landscape to landscape is a crop: the ratio is preserved, the
  // edges are cut, the quality is untouched — «تستبدل مقاسات الأصل قدر
  // المستطاع». Landscape to portrait is not, and is put to the Creator.
  const { db, asset } = stage(2048, 1536);
  return buildReframePlan(db, asset, ['youtube', 'tiktok']).then((plan) => {
    expect(plan.masterAspectRatio).toBe('4:3');
    expect(plan.rows.map((r) => r.verdict)).toEqual(['reframe', 'needs-regeneration']);
    // Only the reframe is charged — twenty units, once.
    expect(plan.rows.map((r) => r.balanceCost)).toEqual([20, 0]);
    expect(plan.totalBalanceCost).toBe(20);
    expect(plan.reframeCount).toBe(1);
  });
});

it('a master already at the exact ratio of a platform costs nothing at all', () => {
  // MEASURED while writing these: every platform in the table is 16:9, 9:16 or
  // 1:1, so a master ALREADY at one of those is free wherever it matches and
  // needs regeneration wherever the orientation turns. The reframe charge
  // exists for the assets Creators really own, which are rarely so exact.
  const { db, asset } = stage(1920, 1080);
  return buildReframePlan(db, asset, ['youtube', 'facebook', 'linkedin', 'instagram']).then((plan) => {
    expect(plan.masterAspectRatio).toBe('16:9');
    expect(plan.rows.slice(0, 3).every((r) => r.verdict === 'fits-as-is')).toBe(true);
    expect(plan.rows[3].verdict).toBe('needs-regeneration');
    expect(plan.totalBalanceCost).toBe(0);
  });
});

it('an asset whose size cannot be read is never assigned a shape', () => {
  // `getOrientation` reads an unparseable ratio as landscape, so a guess here
  // would tell a Creator their unknown asset fits YouTube — and charge for it.
  const { db, asset } = stage(1920, 1080);
  const missing = { ...asset, secureStorageUri: '/generated-assets/gone.png' } as VaultAsset;
  return buildReframePlan(db, missing, ['youtube', 'tiktok']).then((plan) => {
    expect(plan.masterAspectRatio).toBeNull();
    expect(plan.rows.every((r) => r.verdict === 'cannot-say')).toBe(true);
    expect(plan.totalBalanceCost).toBe(0);
  });
});

it('a platform the Empire has no rectangle for costs nothing and says so', () => {
  const { db, asset } = stage(1080, 1080);
  return buildReframePlan(db, asset, ['unknown-planet-tv']).then((plan) => {
    expect(plan.rows[0].verdict).toBe('cannot-say');
    expect(plan.rows[0].balanceCost).toBe(0);
  });
});
