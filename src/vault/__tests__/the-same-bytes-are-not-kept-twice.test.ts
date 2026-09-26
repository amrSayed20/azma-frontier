/**
 * AZMA OS — one Creator, one copy of the same bytes.
 *
 * The Founder, 2026-09-26: «لا أريد ملء الخزائن بأصول مكرّرة» and «وسّع الآلة
 * قدر الإمكان — ستواجهنا مشكلة تخزين مع زيادة أعداد المشتركين».
 *
 * ─── WHY THE GUARD IS IN depositAsset AND NOT IN THE UPLOAD ROUTE ───────────
 *
 *   `depositAsset` documents itself as the one chokepoint every asset in the
 *   Empire passes through — upload, generation, derivation, voice, video, the
 *   Chamber of Evidence — «so no future creation path can bypass them by
 *   forgetting to». Guarding the upload route alone would have left every
 *   other path free to duplicate, which is the opposite of widening the
 *   machine.
 *
 *   The digest itself is not new. It was already computed for every DERIVED
 *   asset, to prove an output differs from its parent. It lived inside a JSON
 *   blob where no query could reach it; it is now also an indexed column.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const MANAGER = read('src/vault/sovereign-vault-manager.ts');
const TYPES = read('src/vault/sovereign-vault-types.ts');
const REPO = read('src/persistent-storage/vault-asset-repository.ts');
const SCHEMA = read('src/persistent-storage/schema.ts');
const UPLOAD = read('app/api/vault/assets/upload/route.ts');

describe('1 · the digest is queryable, and indexed', () => {
  it('it is a column, not a field inside a JSON blob', () => {
    expect(SCHEMA).toContain("{ name: 'content_digest', ddl: 'content_digest TEXT' }");
  });

  it('and it is indexed per tenant, so the check stays cheap as subscribers grow', () => {
    expect(SCHEMA).toContain('idx_vault_assets_digest ON vault_assets(subscriber_tenant_id, content_digest)');
  });

  it('it is written at birth, from the deposit or from the metadata already carrying it', () => {
    expect(MANAGER).toContain('contentDigest: deposit.contentDigest');
    expect(REPO).toContain('asset.contentDigest ??');
  });
});

describe('2 · the guard is at the chokepoint', () => {
  it('depositAsset refuses a duplicate before it creates anything', () => {
    const start = MANAGER.indexOf('if (deposit.contentDigest) {');
    expect(start).toBeGreaterThan(-1);
    // Before the lineage work and long before the insert.
    expect(start).toBeLessThan(MANAGER.indexOf('const parentAssetId: string | null'));
    expect(start).toBeLessThan(MANAGER.indexOf('insertVaultAsset(db, asset)'));
  });

  it('it refuses rather than repairs, and names the asset already owned', () => {
    expect(TYPES).toContain("| 'DUPLICATE_CONTENT'");
    expect(TYPES).toContain('public readonly existingAssetId?: string;');
    expect(MANAGER).toContain("'DUPLICATE_CONTENT',");
    expect(MANAGER).toContain('existing.assetId,');
  });

  it('it is scoped to one Creator — identical bytes in two Vaults are two assets', () => {
    expect(REPO).toContain('WHERE subscriber_tenant_id = ? AND content_digest = ?');
    expect(MANAGER).toContain('findVaultAssetByContentDigest(db, deposit.subscriberTenantId, deposit.contentDigest)');
  });

  it('a path that supplies no digest is unaffected', () => {
    // The whole guard sits behind the presence of a digest.
    expect(MANAGER).toContain('if (deposit.contentDigest) {');
  });
});

describe('3 · the upload leaves nothing behind and answers honestly', () => {
  it('it hashes the bytes it already holds', () => {
    expect(UPLOAD).toContain('contentDigest: digestOf(bytes),');
  });

  it('a refused deposit removes the file it had just written', () => {
    expect(UPLOAD).toContain('await unlink(join(uploadsDir, basename(persisted.assetUrl)));');
  });

  it('the Creator is answered with the asset they already own, as success', () => {
    // They asked for this file to be in their Vault. It is.
    expect(UPLOAD).toContain('alreadyHeld: true');
    expect(UPLOAD).toContain('هذا الملفّ في خزانتك بالفعل');
  });

  it('and any other rejection is still thrown, not swallowed', () => {
    expect(UPLOAD).toContain('if (!duplicate) throw err;');
  });
});
