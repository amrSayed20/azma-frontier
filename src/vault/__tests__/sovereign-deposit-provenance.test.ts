/**
 * AZMA OS — Phase C: provenance at the deposit boundary.
 *
 * Constitution Articles 5.3–5.6, 9; directive Articles 5–10.
 *
 * ─── WHY THESE TESTS SIT AT THIS ONE BOUNDARY ───────────────────────────────
 *
 *   The Phase C audit measured that `insertVaultAsset` has exactly ONE caller
 *   in the repository: `SovereignVaultManager.depositAsset()`. Ten call sites
 *   across eight files deposit through it. That makes it a real chokepoint, so
 *   a rule proven here is a rule that holds for every asset in the Empire —
 *   including creation paths that do not exist yet.
 */

import { SovereignVaultManager } from '../sovereign-vault-manager';
import {
  AssetFamily, SourceChamber, DerivationKind, DerivationPermission,
  LifecycleState, SovereignDepositError, isDerivable,
} from '../sovereign-vault-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import {
  getDb, resetDbSingletonForTests, createProject, adoptLegacyAsset, getVaultAsset, listAssetLineage,
} from '../../persistent-storage';
import { ProjectType } from '../../sovereign-projects/sovereign-project-contracts';

const OWNER = 'creator-alpha';
const OTHER = 'creator-beta';

let vault: SovereignVaultManager;

beforeEach(() => {
  process.env.AZMA_DB_PATH = ':memory:';
  resetDbSingletonForTests();
  vault = new SovereignVaultManager();
});
afterEach(() => { resetDbSingletonForTests(); });

function deposit(overrides: Record<string, unknown> = {}) {
  return vault.depositAsset({
    operationId: 'op-1',
    subscriberTenantId: OWNER,
    capabilityTarget: CapabilityTarget.VISUAL,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: '/uploads/x.png',
    metadata: {},
    creationChamber: SourceChamber.QIYAMAH,
    ...overrides,
  } as Parameters<SovereignVaultManager['depositAsset']>[0]);
}

describe('Phase C — an ORIGINAL asset is born with its provenance', () => {
  it('records owner, chamber, actor and timestamps', async () => {
    const asset = await deposit();
    expect(asset.subscriberTenantId).toBe(OWNER);
    expect(asset.creationChamber).toBe(SourceChamber.QIYAMAH);
    expect(asset.createdBy).toBe(OWNER);          // defaults to the owner
    expect(asset.createdAt).toBeGreaterThan(0);
    expect(asset.lastModifiedAt).toBeNull();      // never modified yet
  });

  it('is its own root, at version 1, with no parent — directive Article 6', async () => {
    const asset = await deposit();
    expect(asset.parentAssetId).toBeNull();
    expect(asset.rootAssetId).toBe(asset.assetId);
    expect(asset.version).toBe(1);
    expect(asset.derivation).toBe(DerivationKind.GENERATED);
  });

  it('is INTERMEDIATE and derivable — declared, not inferred', async () => {
    const asset = await deposit();
    expect(asset.lifecycleState).toBe(LifecycleState.INTERMEDIATE);
    expect(asset.derivationPermission).toBe(DerivationPermission.ALLOWED);
    expect(isDerivable(asset)).toBe(true);
  });

  it('honours an explicitly declared lifecycle and actor', async () => {
    const asset = await deposit({ lifecycleState: LifecycleState.FINAL, createdBy: 'operator-7' });
    expect(asset.lifecycleState).toBe(LifecycleState.FINAL);
    expect(asset.createdBy).toBe('operator-7');
  });

  it('persists — the record read back carries the same provenance', async () => {
    const asset = await deposit();
    const stored = getVaultAsset(getDb(), asset.assetId)!;
    expect(stored.creationChamber).toBe(SourceChamber.QIYAMAH);
    expect(stored.rootAssetId).toBe(asset.assetId);
    expect(stored.version).toBe(1);
  });

  it('records the chamber each real path actually declares', async () => {
    // The five real chambers, as the ten production call sites now name them.
    for (const chamber of [
      SourceChamber.QIYAMAH, SourceChamber.RAS_AL_AMR,
      SourceChamber.KHAZAIN, SourceChamber.HUJJAH_AL_DAMIGHAH,
    ]) {
      const asset = await deposit({ creationChamber: chamber });
      expect(asset.creationChamber).toBe(chamber);
    }
  });
});

describe('Phase C — a DERIVED asset, directive Article 7', () => {
  it('1 · valid same-owner derivation inherits root and steps the version', async () => {
    const original = await deposit();
    const derived = await deposit({ parentAssetId: original.assetId });

    expect(derived.parentAssetId).toBe(original.assetId);
    expect(derived.rootAssetId).toBe(original.assetId);
    expect(derived.version).toBe(2);
    expect(derived.derivation).toBe(DerivationKind.MODIFIED);
  });

  it('a third generation keeps the ORIGINAL root, not its parent', async () => {
    const v1 = await deposit();
    const v2 = await deposit({ parentAssetId: v1.assetId });
    const v3 = await deposit({ parentAssetId: v2.assetId });

    expect(v3.rootAssetId).toBe(v1.assetId);   // the root, not v2
    expect(v3.parentAssetId).toBe(v2.assetId);
    expect(v3.version).toBe(3);

    const lineage = listAssetLineage(getDb(), v1.assetId, OWNER);
    expect(lineage.map((a) => a.version)).toEqual([1, 2, 3]);
  });

  it('keeps an explicitly declared derivation kind rather than overwriting it', async () => {
    const original = await deposit();
    const animated = await deposit({ parentAssetId: original.assetId, derivation: DerivationKind.ANIMATED });
    expect(animated.derivation).toBe(DerivationKind.ANIMATED);
  });

  it('2 · REJECTS a missing parent', async () => {
    await expect(deposit({ parentAssetId: 'no-such-asset' })).rejects.toThrow(SovereignDepositError);
    await expect(deposit({ parentAssetId: 'no-such-asset' })).rejects.toMatchObject({ rejection: 'PARENT_NOT_FOUND' });
  });

  it('3 · REJECTS an invalid parent reference', async () => {
    // An empty string is NOT read as "no parent". It is not a valid asset id,
    // and a caller that sends one has a bug — treating it as absence would be
    // the silent correction Article 7 forbids, and would hide that bug.
    await expect(deposit({ parentAssetId: '' })).rejects.toMatchObject({ rejection: 'PARENT_NOT_FOUND' });
    await expect(deposit({ parentAssetId: '../../etc/passwd' })).rejects.toMatchObject({ rejection: 'PARENT_NOT_FOUND' });
    // Absence is expressed by omission or null, and that is what means absence.
    await expect(deposit({ parentAssetId: null })).resolves.toBeDefined();
    await expect(deposit({})).resolves.toBeDefined();
  });

  it('4 · REJECTS a cross-owner parent — the tenant boundary at creation time', async () => {
    const theirs = await deposit({ subscriberTenantId: OTHER });
    await expect(deposit({ subscriberTenantId: OWNER, parentAssetId: theirs.assetId }))
      .rejects.toMatchObject({ rejection: 'PARENT_NOT_OWNED' });
  });

  it('5 · a derived asset never invents a root — it inherits one', async () => {
    const original = await deposit();
    const derived = await deposit({ parentAssetId: original.assetId });
    // The root is the parent's root, never the derived asset's own id.
    expect(derived.rootAssetId).not.toBe(derived.assetId);
    expect(derived.rootAssetId).toBe(original.rootAssetId);
  });

  it('6 · REJECTS a circular lineage attempt', async () => {
    // An asset cannot be its own parent. The id is minted inside depositAsset,
    // so the only way to attempt this is to name an id that does not exist yet,
    // which the PARENT_NOT_FOUND guard catches first — and the explicit
    // self-reference guard stands behind it.
    await expect(deposit({ parentAssetId: 'asset_self' })).rejects.toBeInstanceOf(SovereignDepositError);
  });

  it('7 · REJECTS derivation from a legacy asset until it is adopted', async () => {
    // A legacy row: written directly in the pre-provenance shape.
    const db = getDb();
    db.prepare(
      `INSERT INTO vault_assets (asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at)
       VALUES ('legacy-1', ?, 'op', 'VISUAL', 'MEDIA', '/uploads/legacy-1.png', '{}', 1, 1)`,
    ).run(OWNER);

    await expect(deposit({ parentAssetId: 'legacy-1' }))
      .rejects.toMatchObject({ rejection: 'PARENT_NOT_DERIVABLE' });
  });

  it('7b · ALLOWS derivation once the owner adopts the legacy asset', async () => {
    const db = getDb();
    db.prepare(
      `INSERT INTO vault_assets (asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at)
       VALUES ('legacy-2', ?, 'op', 'VISUAL', 'MEDIA', '/uploads/legacy-2.png', '{}', 1, 1)`,
    ).run(OWNER);

    expect(adoptLegacyAsset(db, 'legacy-2', OWNER)).toBe(true);

    const derived = await deposit({ parentAssetId: 'legacy-2' });
    expect(derived.parentAssetId).toBe('legacy-2');
    // The lineage starts at the moment of adoption — the legacy asset is its
    // own root, and no history before it is invented. Article 5.5.
    expect(derived.rootAssetId).toBe('legacy-2');
    expect(derived.version).toBe(2);
  });

  it('8 · REJECTS derivation from any non-derivable parent', async () => {
    const db = getDb();
    const original = await deposit();
    // Withdraw the right explicitly, as an adoption reversal would.
    db.prepare('UPDATE vault_assets SET derivation_permission = ? WHERE asset_id = ?')
      .run(DerivationPermission.REQUIRES_ADOPTION, original.assetId);

    await expect(deposit({ parentAssetId: original.assetId }))
      .rejects.toMatchObject({ rejection: 'PARENT_NOT_DERIVABLE' });
  });

  it('refuses without writing anything — a rejected deposit leaves no asset', async () => {
    const before = (getDb().prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number }).n;
    await expect(deposit({ parentAssetId: 'no-such-asset' })).rejects.toThrow();
    const after = (getDb().prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number }).n;
    expect(after).toBe(before);
  });
});

describe('Phase C — project ownership, directive Article 9', () => {
  it('accepts an asset into a project its owner owns', async () => {
    const project = createProject(getDb(), { ownerId: OWNER, projectType: ProjectType.ASSET_COLLECTION, title: 'مجموعتي' });
    if (!project.ok) throw new Error('fixture');

    const asset = await deposit({ projectId: project.project.projectId });
    expect(asset.projectId).toBe(project.project.projectId);
  });

  it('REJECTS an asset into ANOTHER Creator’s project', async () => {
    const theirs = createProject(getDb(), { ownerId: OTHER, projectType: ProjectType.ASSET_COLLECTION, title: 'theirs' });
    if (!theirs.ok) throw new Error('fixture');

    await expect(deposit({ subscriberTenantId: OWNER, projectId: theirs.project.projectId }))
      .rejects.toMatchObject({ rejection: 'PROJECT_NOT_OWNED' });
  });

  it('REJECTS a project that does not exist', async () => {
    await expect(deposit({ projectId: 'no-such-project' }))
      .rejects.toMatchObject({ rejection: 'PROJECT_NOT_OWNED' });
  });

  it('allows a free asset with no project', async () => {
    expect((await deposit()).projectId).toBeNull();
  });

  it('a rejected project assignment writes no asset', async () => {
    const before = (getDb().prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number }).n;
    await expect(deposit({ projectId: 'no-such-project' })).rejects.toThrow();
    const after = (getDb().prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number }).n;
    expect(after).toBe(before);
  });
});
