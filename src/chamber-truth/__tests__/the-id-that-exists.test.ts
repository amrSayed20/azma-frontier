/**
 * AZMA OS — a generation points at the asset that EXISTS.
 *
 * ─── FOUND BY THE FOUNDER'S QUESTION, 2026-09-26 ────────────────────────────
 *
 *   He asked «أفى نموذج استخدم فى العمليتين وهل تعرف كم تكلفا». Answering it
 *   meant reading production, and production said this:
 *
 *     generation record 03:56  asset_id = e463d3ee-…   in the Vault? NO
 *     generation record 04:04  asset_id = b7d61cf0-…   in the Vault? NO
 *     generation record 09:09  asset_id = c150caf7-…   in the Vault? NO
 *     the animation   10:02  asset_id = asset_1790416931347_zpuvpob   YES
 *
 *   Every image generation wrote `persisted.assetId` — the FILE id — into
 *   `generation_records.asset_id` and into its own HTTP response, while
 *   `vaultManager.depositAsset` minted a different, sovereign id and the
 *   deposit helper returned `void`, throwing it away.
 *
 *   PROVEN against production, not reasoned: POSTing an edit with a tile's
 *   generation id returned `HTTP 404 not-found الأصل غير موجود`. Every picture
 *   القيامة made was un-editable, un-animatable and un-upscalable through its
 *   own record — the third time this Empire has lost the link between what it
 *   made and what it kept.
 *
 *   Only the animate path was sound, because it goes through `deriveAsset`,
 *   which returns the asset it created.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const SERVICE = read('src/qiyamah-generation/generation-service.ts');
const REPO = read('src/persistent-storage/generation-record-repository.ts');
const DB = read('src/persistent-storage/db.ts');
const INDEX = read('src/persistent-storage/index.ts');

describe('1 · the deposit hands back the id the Vault minted', () => {
  it('neither deposit helper returns void any more', () => {
    expect(SERVICE).not.toMatch(/depositGeneratedAssetIntoVault[\s\S]{0,600}?\}\): Promise<void>/);
    expect((SERVICE.match(/\}\): Promise<string \| null> \{/g) ?? []).length).toBe(2);
  });

  it('both return the deposited asset, and null when the deposit degrades', () => {
    expect((SERVICE.match(/return deposited\.assetId;/g) ?? []).length).toBe(2);
    expect((SERVICE.match(/const deposited = await vaultManager\.depositAsset\(\{/g) ?? []).length).toBe(2);
  });
});

describe('2 · the record and the response carry that id', () => {
  it('the record is linked once the Vault answers', () => {
    expect(REPO).toContain('export function linkGenerationToVaultAsset(');
    expect(REPO).toContain("db.prepare('UPDATE generation_records SET asset_id = ? WHERE record_id = ?')");
    expect(INDEX).toContain('linkGenerationToVaultAsset');
    expect((SERVICE.match(/linkGenerationToVaultAsset\(getDb\(\), generationRecord\.recordId, vaultAssetId\)/g) ?? []).length).toBe(2);
  });

  it('both success responses carry the sovereign id, not the file id', () => {
    // Only the RETURN blocks are held. The console lines beside them keep the
    // file id deliberately — an engineer reading the trail needs to see which
    // file was written, and that log reaches no Creator.
    const returned = (SERVICE.match(/assetId: sovereignAssetId,/g) ?? []).length;
    expect(returned).toBe(2);
  });

  it('a link written late never fails a succeeded generation', () => {
    // The same honest degrade the deposit itself has.
    expect((SERVICE.match(/\[VaultLink\] could not link generation to asset/g) ?? []).length).toBe(2);
    expect((SERVICE.match(/if \(generationRecord\?\.recordId\) \{/g) ?? []).length).toBe(2);
  });
});

describe('3 · the rows already written that way are repaired', () => {
  it('a migration repairs rows whose asset_id matches no Vault row', () => {
    expect(DB).toContain('WHERE asset_id IS NOT NULL');
    expect(DB).toContain('SELECT 1 FROM vault_assets w WHERE w.asset_id = generation_records.asset_id');
  });

  it('it repairs only by the exact storage URI, and only for the same Creator', () => {
    const start = DB.indexOf('AND THE ROWS THAT KNEW THE WRONG ASSET');
    expect(start).toBeGreaterThan(-1);
    const block = DB.slice(start, start + 1800);
    expect(block).toContain('x.secure_storage_uri = generation_records.asset_url');
    expect(block).toContain('x.subscriber_tenant_id = generation_records.creator_id');
  });

  it('a row that already points at a real asset keeps what it knows', () => {
    // The NOT EXISTS clause is the whole safety of this repair.
    expect(DB).toContain('AND NOT EXISTS (');
  });
});
