/**
 * AZMA OS — Phase B1/B2: the migration, rehearsed against REAL production data.
 *
 * ─── WHY THIS TEST EXISTS ───────────────────────────────────────────────────
 *
 *   Every other test in this phase builds its own fixtures. A fixture is a
 *   statement about what I believe production looks like, and this workshop has
 *   already produced one migration whose tests passed on fixtures while failing
 *   on 36,064 real rows, because the fixtures lacked the diacritics the real
 *   data carried.
 *
 *   So this runs the ACTUAL `createDatabase()` — the same function the server
 *   calls on boot — against a byte-for-byte copy of the live `vault_assets`
 *   table, pulled from production on 2026-09-16. 47 rows, 2 owners, the exact
 *   shape the migration will meet when it is deployed.
 *
 *   It is skipped, with a stated reason, when the copy is absent, so a clone of
 *   this repository without the fixture does not fail — and so the skip can
 *   never be mistaken for a pass.
 */

import { existsSync, copyFileSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { listVaultAssetsForTenant, getVaultAsset } from '../vault-asset-repository';
import { isDerivable, isLegacyAsset, SourceChamber } from '../../vault/sovereign-vault-types';

/** A copy of the live vault_assets table, taken 2026-09-16. */
const PRODUCTION_COPY = join(
  process.env.TEMP ?? tmpdir(),
  'claude', 'c--Users-Hp-azma-frontier',
  '2caf1fbe-dc31-4bbd-83e0-0d8cfa20f2cf', 'scratchpad', 'prod-vault-copy.db',
);

const available = existsSync(PRODUCTION_COPY);
const describeIfAvailable = available ? describe : describe.skip;

if (!available) {
  // Stated out loud: a silent skip is indistinguishable from a pass.
  console.warn(`[migration-rehearsal] SKIPPED — production copy not present at ${PRODUCTION_COPY}`);
}

describeIfAvailable('B1/B2 — migration rehearsed on the real production table', () => {
  let workingCopy: string;
  let db: DatabaseSync;

  beforeAll(() => {
    workingCopy = join(tmpdir(), `azma-rehearsal-${Date.now()}.db`);
    copyFileSync(PRODUCTION_COPY, workingCopy);
    // The real boot path, unchanged — schema, then every migration, then indexes.
    db = createDatabase(workingCopy);
  });

  afterAll(() => {
    db?.close();
    try { rmSync(workingCopy, { force: true }); } catch { /* the OS will reclaim it */ }
  });

  it('destroys nothing — all 47 production assets survive', () => {
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number };
    expect(n).toBe(47);
  });

  it('duplicates nothing — 47 distinct ids remain', () => {
    const rows = db.prepare('SELECT DISTINCT asset_id FROM vault_assets').all();
    expect(rows).toHaveLength(47);
  });

  it('preserves the exact production population by kind', () => {
    const rows = db
      .prepare('SELECT capability_target AS k, COUNT(*) AS n FROM vault_assets GROUP BY 1')
      .all() as unknown as { k: string; n: number }[];
    const byKind = Object.fromEntries(rows.map((r) => [r.k, r.n]));
    // Measured on production before this phase began.
    expect(byKind.VISUAL).toBe(27);
    expect(byKind.MOTION).toBe(16);
    expect(byKind.AUDIO).toBe(3);
    expect(byKind.WRITING).toBe(1);
  });

  it('changes no owner — the two real Creators keep everything they had', () => {
    const owners = db
      .prepare('SELECT subscriber_tenant_id AS o, COUNT(*) AS n FROM vault_assets GROUP BY 1 ORDER BY 1')
      .all() as unknown as { o: string; n: number }[];
    expect(owners).toHaveLength(2);
    expect(owners.reduce((sum, r) => sum + r.n, 0)).toBe(47);
  });

  it('adds every provenance column to the live table shape', () => {
    const columns = new Set(
      (db.prepare('PRAGMA table_info(vault_assets)').all() as { name: string }[]).map((r) => r.name),
    );
    // 9 original + 11 provenance + content_digest (2026-09-26).
    // The Founder: «لا أريد ملء الخزائن بأصول مكرّرة... ستواجهنا مشكلة تخزين
    // مع زيادة أعداد المشتركين». The digest already existed inside the JSON
    // metadata of every derived asset, where no query could reach it; as an
    // INDEXED column it answers «does this Creator already own these exact
    // bytes?» in one lookup at any number of subscribers. Nullable, so every
    // pre-existing row is untouched and answers «unknown», never «duplicate».
    // + pixel_width, pixel_height (2026-09-29). The Founder, on مكمن الغاية:
    // «مقاس الأصل ليس ثابتا في جميع المنصات». `platform-adapter.ts` takes one
    // input — the master's aspect ratio — and nothing in the Empire recorded a
    // pixel size, so that engine had never been able to run. Columns for the
    // same reason as the digest: «which of this Creator's assets already fit
    // TikTok?» is a question asked of every asset, so a query must answer it.
    // Nullable, because «لا نعرف مقاسه» is a true and frequent state.
    expect(columns.size).toBe(23);
    expect(columns.has('content_digest')).toBe(true);
    expect(columns.has('pixel_width')).toBe(true);
    expect(columns.has('pixel_height')).toBe(true);
    for (const expected of ['parent_asset_id', 'root_asset_id', 'version', 'derivation', 'creation_chamber', 'project_id', 'lifecycle_state', 'derivation_permission', 'created_by', 'last_modified_by', 'last_modified_at']) {
      expect(columns.has(expected)).toBe(true);
    }
  });

  it('leaves every provenance column NULL — Article 5.5, no history invented', () => {
    const { n } = db
      .prepare('SELECT COUNT(*) AS n FROM vault_assets WHERE creation_chamber IS NOT NULL OR parent_asset_id IS NOT NULL OR version IS NOT NULL')
      .get() as unknown as { n: number };
    expect(n).toBe(0);
  });

  it('reads every real asset as legacy, owned, and usable', () => {
    const owners = (db.prepare('SELECT DISTINCT subscriber_tenant_id AS o FROM vault_assets').all() as unknown as { o: string }[])
      .map((r) => r.o);

    let seen = 0;
    for (const owner of owners) {
      for (const asset of listVaultAssetsForTenant(db, owner)) {
        seen += 1;
        // Legacy, with no invented chamber — Article 5.5.
        expect(isLegacyAsset(asset)).toBe(true);
        expect(asset.creationChamber).toBe(SourceChamber.UNKNOWN);
        // Not derivable until adopted…
        expect(isDerivable(asset)).toBe(false);
        // …but entirely usable: owned, addressable, and typed for composition.
        expect(asset.subscriberTenantId).toBe(owner);
        expect(asset.secureStorageUri).toBeTruthy();
        expect(asset.assetFamily).toBeTruthy();
        expect(asset.capabilityTarget).toBeTruthy();
        // Root of its own lineage — the one true thing about its history.
        expect(asset.rootAssetId).toBe(asset.assetId);
        expect(asset.parentAssetId).toBeNull();
        // Retrievable one by one, not only in a listing.
        expect(getVaultAsset(db, asset.assetId)).not.toBeNull();
      }
    }
    expect(seen).toBe(47);
  });

  it('creates the five constitutional tables alongside, without touching the old ones', () => {
    const tables = new Set(
      (db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[])
        .map((r) => r.name),
    );
    for (const expected of ['sovereign_projects', 'storyboards', 'storyboard_scenes', 'asset_tombstones', 'sovereign_public_links']) {
      expect(tables.has(expected)).toBe(true);
    }
    expect(tables.has('vault_assets')).toBe(true);
  });

  it('is idempotent — running the boot path twice over the same file changes nothing', () => {
    const again = createDatabase(workingCopy);
    const { n } = again.prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number };
    expect(n).toBe(47);
    again.close();
  });
});
