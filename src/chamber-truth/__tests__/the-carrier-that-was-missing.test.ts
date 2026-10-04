/**
 * AZMA OS — the carrier between the Vault and the outside world, 2026-10-04.
 *
 *   FOUNDER, after a live test: «THE ASSET DOES NOT MOVE WITH THE DRAG. THE
 *   DROP TARGET DOES NOT RECEIVE THE ASSET.»
 *
 *   MEASURED before a line was changed: مكمن الغاية had ZERO drag or drop
 *   handlers, while رأس الأمر, الحجّة and القيامة each had one. And the only
 *   path to an upload ran through `reframeDone` — session state filled solely
 *   by a reframe finished minutes earlier — so an asset already in the Vault
 *   had no route at all.
 *
 *   These hold the repair to the shape the directive required of it.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const PAGE = readFileSync(join(process.cwd(), 'app/makman-al-ghayah/page.tsx'), 'utf8');
const ACTIONS = readFileSync(join(process.cwd(), 'app/makman-al-ghayah/cloud-actions.ts'), 'utf8');

it('the chamber has a drop target at all — the thing it had none of', () => {
  expect(PAGE).toContain('data-testid="makman-drop-target"');
  expect(PAGE).toContain('onDrop=');
  expect(PAGE).toContain('onDragOver=');
});

it('and every vault card is draggable AND pressable', () => {
  // «كل أصل قابل للاختيار بالضغط لمن لا يستخدم السحب والإفلات».
  const at = PAGE.indexOf('data-testid="makman-vault-door"');
  const door = PAGE.slice(at, at + 2000);
  expect(door).toContain('draggable');
  expect(door).toContain('onDragStart');
  expect(door).toContain('onClick');
});

it('the drop resolves an ID through the ownership boundary, never bytes', () => {
  // What travels is a reference. A File or a Blob would make the browser the
  // source of the material, and the Vault would stop being the truth.
  expect(PAGE).toContain('readDraggedAssetId');
  expect(PAGE).toContain('resolveAssetForDistribution');
  expect(PAGE).not.toMatch(/dataTransfer\.files/);
  expect(PAGE).not.toMatch(/new Blob\(/);
});

it('and the resolution is owner-scoped, with one answer for absent and not-yours', () => {
  const at = ACTIONS.indexOf('export async function resolveAssetForDistribution');
  const fn = ACTIONS.slice(at, at + 900);
  expect(fn).toContain('getVaultAsset');
  expect(fn).toContain('subscriberTenantId !== creatorId');
  // Indistinguishable, so an id cannot be probed.
  expect(fn).toContain('لا يوجد أصل بهذا المعرّف في خزانتك');
});

it('«accepted» is never shown before the resolution returns', () => {
  // A visual acceptance ahead of the answer is an animation standing in for
  // an action — which is exactly what the directive forbids.
  const at = PAGE.indexOf('onDrop={async (e)');
  const handler = PAGE.slice(at, at + 1200);
  const resolving = handler.indexOf("setDropState('resolving')");
  const setCarried = handler.indexOf('setCarried(outcome.asset)');
  expect(resolving).toBeGreaterThan(-1);
  expect(setCarried).toBeGreaterThan(resolving);
  expect(handler).toContain('outcome.ok');
});

it('the vault door is a VIEW of the Vault, not a second registry', () => {
  // It reads the Vault's own tenant-scoped listing, and holds nothing of its
  // own: no insert, no update, no delete anywhere in this surface.
  const at = ACTIONS.indexOf('export async function listDistributableAssets');
  const fn = ACTIONS.slice(at, at + 700);
  expect(fn).toContain('listVaultAssetsForTenant');
  expect(ACTIONS).not.toMatch(/insertVaultAsset|deleteVaultAsset|depositAsset/);
});

it('and distribution never removes the asset it distributed', () => {
  // «لا يحذف الأصل من الخزانة عند السحب» — and not after the upload either.
  //
  // Named precisely rather than by keyword: this file DOES revoke a cloud
  // GRANT, which is a permission and not an asset, and a broad search for
  // «delete» or «unlink» would have flagged that correct behaviour. What must
  // never appear here is any function that removes a sovereign asset.
  for (const forbidden of [
    'deleteVaultAssetById', 'deleteVaultAssetByStorageUri',
    'recordTombstone', 'unlinkSync', 'rmSync',
  ]) {
    expect(ACTIONS).not.toContain(forbidden);
  }
});
