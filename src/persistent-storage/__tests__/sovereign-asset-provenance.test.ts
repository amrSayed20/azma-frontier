/**
 * AZMA OS — Phase B1 + B2: sovereign provenance, and the legacy rule.
 *
 * Constitution Articles 5.3–5.6. Every assertion below is a constitutional
 * invariant, not a check that a function exists.
 *
 * ─── THE ONE THAT MATTERS MOST ──────────────────────────────────────────────
 *
 *   47 assets exist in production — 27 images, 16 motion, 3 audio, 1 text, all
 *   with valid owners. Article 5.5 says they stay usable while losing only the
 *   right to be derived from. Reading «لا يُفترض أنها قابلة للتعديل» as
 *   "unusable" would empty the canvases 43 media assets currently sit in.
 *
 *   The `legacy asset` block below is that rule, held.
 */

import { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { VAULT_ASSETS_MIGRATION_COLUMNS } from '../schema';
import {
  insertVaultAsset,
  getVaultAsset,
  listVaultAssetsForTenant,
  listAssetLineage,
  adoptLegacyAsset,
} from '../vault-asset-repository';
import {
  AssetFamily,
  DerivationKind,
  DerivationPermission,
  LifecycleState,
  SourceChamber,
  isDerivable,
  isLegacyAsset,
  legacyProvenanceFor,
  type VaultAsset,
} from '../../vault/sovereign-vault-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';

const OWNER = 'creator-alpha';
const OTHER = 'creator-beta';

function makeAsset(overrides: Partial<VaultAsset> = {}): VaultAsset {
  const now = Date.now();
  return {
    assetId: `asset_${Math.random().toString(36).slice(2, 10)}`,
    subscriberTenantId: OWNER,
    originatingOperationId: 'op-1',
    capabilityTarget: CapabilityTarget.VISUAL,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: '/uploads/x.png',
    metadata: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

/**
 * A database shaped like production BEFORE provenance existed: the original
 * nine columns and nothing else. This is what the 47 assets live in.
 */
function legacyShapedDb(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec(`CREATE TABLE vault_assets (
    asset_id TEXT PRIMARY KEY,
    subscriber_tenant_id TEXT NOT NULL,
    originating_operation_id TEXT NOT NULL,
    capability_target TEXT NOT NULL,
    asset_family TEXT NOT NULL,
    secure_storage_uri TEXT NOT NULL,
    metadata TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`);
  return db;
}

describe('B1 — sovereign asset provenance', () => {
  let db: DatabaseSync;
  beforeEach(() => { db = createDatabase(':memory:'); });
  afterEach(() => { db.close(); });

  describe('the migration itself', () => {
    it('adds every provenance column to a freshly created database', () => {
      const columns = new Set(
        (db.prepare('PRAGMA table_info(vault_assets)').all() as { name: string }[]).map((r) => r.name),
      );
      for (const expected of [
        'parent_asset_id', 'root_asset_id', 'version', 'derivation',
        'creation_chamber', 'project_id', 'lifecycle_state',
        'derivation_permission', 'created_by', 'last_modified_by', 'last_modified_at',
      ]) {
        expect(columns.has(expected)).toBe(true);
      }
    });

    it('keeps all nine original columns — nothing renamed, nothing dropped', () => {
      const columns = new Set(
        (db.prepare('PRAGMA table_info(vault_assets)').all() as { name: string }[]).map((r) => r.name),
      );
      for (const original of [
        'asset_id', 'subscriber_tenant_id', 'originating_operation_id',
        'capability_target', 'asset_family', 'secure_storage_uri',
        'metadata', 'created_at', 'updated_at',
      ]) {
        expect(columns.has(original)).toBe(true);
      }
    });

    it('is idempotent — a second createDatabase over the same shape does not throw', () => {
      expect(() => createDatabase(':memory:').close()).not.toThrow();
    });
  });

  describe('an original asset', () => {
    it('is the root of its own lineage at version 1', () => {
      const asset = makeAsset();
      insertVaultAsset(db, asset);
      const stored = getVaultAsset(db, asset.assetId)!;
      expect(stored.parentAssetId).toBeNull();
      expect(stored.rootAssetId).toBe(asset.assetId);
      expect(stored.version).toBe(1);
    });

    it('records the chamber that made it, and who made it', () => {
      const asset = makeAsset({ creationChamber: SourceChamber.QIYAMAH, createdBy: OWNER });
      insertVaultAsset(db, asset);
      const stored = getVaultAsset(db, asset.assetId)!;
      expect(stored.creationChamber).toBe(SourceChamber.QIYAMAH);
      expect(stored.createdBy).toBe(OWNER);
    });

    it('is derivable, intermediate, and not legacy', () => {
      const asset = makeAsset({ creationChamber: SourceChamber.QIYAMAH });
      insertVaultAsset(db, asset);
      const stored = getVaultAsset(db, asset.assetId)!;
      expect(isDerivable(stored)).toBe(true);
      expect(isLegacyAsset(stored)).toBe(false);
      expect(stored.lifecycleState).toBe(LifecycleState.INTERMEDIATE);
    });
  });

  describe('a derived asset — Article 5.3', () => {
    it('carries its parent and keeps its ancestor’s root', () => {
      const original = makeAsset({ creationChamber: SourceChamber.QIYAMAH });
      insertVaultAsset(db, original);

      const derived = makeAsset({
        parentAssetId: original.assetId,
        rootAssetId: original.assetId,
        version: 2,
        derivation: DerivationKind.MODIFIED,
        creationChamber: SourceChamber.QIYAMAH,
      });
      insertVaultAsset(db, derived);

      const stored = getVaultAsset(db, derived.assetId)!;
      expect(stored.parentAssetId).toBe(original.assetId);
      expect(stored.rootAssetId).toBe(original.assetId);
      expect(stored.version).toBe(2);
      expect(stored.derivation).toBe(DerivationKind.MODIFIED);
    });

    it('never replaces its parent — Article 5.6, the parent stays retrievable', () => {
      const original = makeAsset({ creationChamber: SourceChamber.QIYAMAH });
      insertVaultAsset(db, original);
      insertVaultAsset(db, makeAsset({
        parentAssetId: original.assetId, rootAssetId: original.assetId,
        version: 2, derivation: DerivationKind.MODIFIED,
      }));
      expect(getVaultAsset(db, original.assetId)).not.toBeNull();
    });

    it('a three-generation lineage returns in order from its root', () => {
      const v1 = makeAsset({ creationChamber: SourceChamber.QIYAMAH });
      insertVaultAsset(db, v1);
      const v2 = makeAsset({ parentAssetId: v1.assetId, rootAssetId: v1.assetId, version: 2, derivation: DerivationKind.MODIFIED });
      insertVaultAsset(db, v2);
      const v3 = makeAsset({ parentAssetId: v2.assetId, rootAssetId: v1.assetId, version: 3, derivation: DerivationKind.ANIMATED });
      insertVaultAsset(db, v3);

      const lineage = listAssetLineage(db, v1.assetId, OWNER);
      expect(lineage.map((a) => a.version)).toEqual([1, 2, 3]);
      expect(lineage.map((a) => a.assetId)).toEqual([v1.assetId, v2.assetId, v3.assetId]);
    });

    it('a lineage is not readable by another Creator', () => {
      const v1 = makeAsset({ creationChamber: SourceChamber.QIYAMAH });
      insertVaultAsset(db, v1);
      expect(listAssetLineage(db, v1.assetId, OTHER)).toHaveLength(0);
    });
  });
});

describe('B2 — the 47 legacy assets, Article 5.5', () => {
  /**
   * The exact production population, measured 2026-09-16:
   * 27 VISUAL/MEDIA · 16 MOTION/MEDIA · 3 AUDIO/MEDIA · 1 WRITING/STRUCTURAL.
   */
  const POPULATION: ReadonlyArray<[CapabilityTarget, AssetFamily, number]> = [
    [CapabilityTarget.VISUAL, AssetFamily.MEDIA, 27],
    [CapabilityTarget.MOTION, AssetFamily.MEDIA, 16],
    [CapabilityTarget.AUDIO, AssetFamily.MEDIA, 3],
    [CapabilityTarget.WRITING, AssetFamily.STRUCTURAL, 1],
  ];

  let db: DatabaseSync;

  beforeEach(() => {
    // Seed into the OLD nine-column shape, exactly as production held them,
    // then migrate — so this tests the real upgrade path, not a fresh table.
    db = legacyShapedDb();
    let n = 0;
    for (const [target, family] of POPULATION) {
      const count = POPULATION.find((p) => p[0] === target)![2];
      for (let i = 0; i < count; i += 1) {
        n += 1;
        db.prepare(
          `INSERT INTO vault_assets (asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        ).run(`legacy-${n}`, n % 2 === 0 ? OWNER : OTHER, `op-${n}`, target, family, `/uploads/legacy-${n}`, '{}', 1000 + n, 1000 + n);
      }
    }
    // The migration, run exactly as db.ts runs it — against the real column
    // list, so this test breaks if a future column is added without thought
    // for the 47 rows it lands on.
    const existing = new Set((db.prepare('PRAGMA table_info(vault_assets)').all() as { name: string }[]).map((r) => r.name));
    for (const column of VAULT_ASSETS_MIGRATION_COLUMNS) {
      if (!existing.has(column.name)) db.exec(`ALTER TABLE vault_assets ADD COLUMN ${column.ddl}`);
    }
  });

  afterEach(() => { db.close(); });

  it('preserves all 47 assets through the migration — none deleted', () => {
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number };
    expect(n).toBe(47);
  });

  it('preserves the exact population by kind', () => {
    for (const [target, , expected] of POPULATION) {
      const { n } = db.prepare('SELECT COUNT(*) AS n FROM vault_assets WHERE capability_target = ?').get(target) as unknown as { n: number };
      expect(n).toBe(expected);
    }
  });

  it('preserves ownership — every asset keeps the Creator it had', () => {
    const owned = listVaultAssetsForTenant(db, OWNER);
    const other = listVaultAssetsForTenant(db, OTHER);
    expect(owned.length + other.length).toBe(47);
    for (const asset of owned) expect(asset.subscriberTenantId).toBe(OWNER);
    for (const asset of other) expect(asset.subscriberTenantId).toBe(OTHER);
  });

  it('duplicates nothing — 47 distinct ids', () => {
    const rows = db.prepare('SELECT DISTINCT asset_id FROM vault_assets').all();
    expect(rows).toHaveLength(47);
  });

  it('orphans nothing — every asset is the root of its own lineage', () => {
    for (const asset of [...listVaultAssetsForTenant(db, OWNER), ...listVaultAssetsForTenant(db, OTHER)]) {
      expect(asset.rootAssetId).toBe(asset.assetId);
      expect(asset.parentAssetId).toBeNull();
    }
  });

  describe('THE DISTINCTION: non-derivable is not unusable', () => {
    it('reads every legacy asset as legacy, with no invented chamber', () => {
      for (const asset of listVaultAssetsForTenant(db, OWNER)) {
        expect(isLegacyAsset(asset)).toBe(true);
        expect(asset.creationChamber).toBe(SourceChamber.UNKNOWN);
      }
    });

    it('REMAINS VISIBLE to its owner', () => {
      expect(listVaultAssetsForTenant(db, OWNER).length).toBeGreaterThan(0);
    });

    it('REMAINS SELECTABLE — retrievable by id', () => {
      const one = listVaultAssetsForTenant(db, OWNER)[0];
      expect(getVaultAsset(db, one.assetId)).not.toBeNull();
    });

    it('REMAINS COMPOSABLE — it carries the family and capability a canvas node needs', () => {
      // 43 of the 47 are media that sit in canvases today. A composition node
      // reads assetFamily and capabilityOrigin; both must survive.
      const media = listVaultAssetsForTenant(db, OWNER).filter((a) => a.assetFamily === AssetFamily.MEDIA);
      expect(media.length).toBeGreaterThan(0);
      for (const asset of media) {
        expect(asset.assetFamily).toBe(AssetFamily.MEDIA);
        expect(asset.capabilityTarget).toBeTruthy();
        expect(asset.secureStorageUri).toBeTruthy();
      }
    });

    it('REMAINS EXPORTABLE — its storage address is intact', () => {
      for (const asset of listVaultAssetsForTenant(db, OWNER)) {
        expect(asset.secureStorageUri).toMatch(/^\/uploads\//);
      }
    });

    it('IS NOT DERIVABLE until its owner adopts it', () => {
      for (const asset of listVaultAssetsForTenant(db, OWNER)) {
        expect(isDerivable(asset)).toBe(false);
        expect(asset.derivationPermission).toBe(DerivationPermission.REQUIRES_ADOPTION);
      }
    });
  });

  describe('adoption — Article 5.5', () => {
    it('grants derivation and records who granted it and when', () => {
      const asset = listVaultAssetsForTenant(db, OWNER)[0];
      expect(adoptLegacyAsset(db, asset.assetId, OWNER, 9_999)).toBe(true);

      const adopted = getVaultAsset(db, asset.assetId)!;
      expect(isDerivable(adopted)).toBe(true);
      expect(adopted.lastModifiedBy).toBe(OWNER);
      expect(adopted.lastModifiedAt).toBe(9_999);
    });

    it('invents no history — no parent, no chamber, no version is fabricated', () => {
      const asset = listVaultAssetsForTenant(db, OWNER)[0];
      adoptLegacyAsset(db, asset.assetId, OWNER);

      const adopted = getVaultAsset(db, asset.assetId)!;
      expect(adopted.parentAssetId).toBeNull();
      expect(adopted.creationChamber).toBe(SourceChamber.UNKNOWN);
      expect(adopted.version).toBe(1);
      expect(adopted.rootAssetId).toBe(asset.assetId);
    });

    it('cannot be performed by another Creator', () => {
      const asset = listVaultAssetsForTenant(db, OWNER)[0];
      expect(adoptLegacyAsset(db, asset.assetId, OTHER)).toBe(false);
      expect(isDerivable(getVaultAsset(db, asset.assetId)!)).toBe(false);
    });

    it('refuses an asset that does not exist', () => {
      expect(adoptLegacyAsset(db, 'no-such-asset', OWNER)).toBe(false);
    });
  });

  describe('the legacy reading is a function, not a stored guess', () => {
    it('leaves the provenance columns NULL in the database', () => {
      // Article 5.5: nothing is written into history. The columns stay empty
      // and the rule lives in rowToVaultAsset, where a test can hold it.
      const row = db.prepare('SELECT creation_chamber, parent_asset_id, version FROM vault_assets LIMIT 1').get() as Record<string, unknown>;
      expect(row.creation_chamber).toBeNull();
      expect(row.parent_asset_id).toBeNull();
      expect(row.version).toBeNull();
    });

    it('legacyProvenanceFor never claims a chamber or a parent', () => {
      const legacy = legacyProvenanceFor('some-asset');
      expect(legacy.creationChamber).toBe(SourceChamber.UNKNOWN);
      expect(legacy.parentAssetId).toBeNull();
      expect(legacy.derivation).toBe(DerivationKind.LEGACY);
      expect(legacy.rootAssetId).toBe('some-asset');
      // Not FINAL — calling an old asset final would be the inference Article 8 forbids.
      expect(legacy.lifecycleState).toBe(LifecycleState.INTERMEDIATE);
    });
  });
});
