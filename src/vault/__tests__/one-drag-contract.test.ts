/**
 * AZMA OS — one sovereign-asset drag contract, 2026-10-04.
 *
 *   FOUNDER: «كل أصل قابل للسحب بنفس عقد رأس الأمر» and «لا تغيير في عقد رأس
 *   الأمر الحالي للسحب».
 *
 *   So the wire string is defined once, in the Vault, which owns asset
 *   identity — and رأس الأمر's own literal is left untouched and PROVEN to
 *   still match it. A drift is caught here without editing the protected file.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { SOVEREIGN_ASSET_DRAG_TYPE, readDraggedAssetId } from '../sovereign-asset-drag';

const RAS_AMR = readFileSync(join(process.cwd(), 'app/ras-amr/page.tsx'), 'utf8');
const MAKMAN = readFileSync(join(process.cwd(), 'app/makman-al-ghayah/page.tsx'), 'utf8');

it('رأس الأمر still carries the exact type this constant names', () => {
  // Its contract is unchanged by construction: this asserts the match rather
  // than editing the file to import the constant.
  expect(RAS_AMR).toContain(`setData('${SOVEREIGN_ASSET_DRAG_TYPE}'`);
  expect(RAS_AMR).toContain(`getData('${SOVEREIGN_ASSET_DRAG_TYPE}')`);
});

it('and مكمن reads the same one, by the constant — never a second format', () => {
  expect(MAKMAN).toContain('SOVEREIGN_ASSET_DRAG_TYPE');
  // No literal of its own: a second spelling is a second contract.
  expect(MAKMAN).not.toContain(`'${SOVEREIGN_ASSET_DRAG_TYPE}'`);
});

it('a drop carrying anything but a sovereign id reads as null', () => {
  // A desktop file, a URL, a text selection — none is a sovereign asset, and
  // treating one as though it were is how a second canonical copy appears.
  const dt = (entries: Record<string, string>) =>
    ({ getData: (t: string) => entries[t] ?? '' }) as unknown as DataTransfer;

  expect(readDraggedAssetId(dt({ [SOVEREIGN_ASSET_DRAG_TYPE]: 'asset-1' }))).toBe('asset-1');
  expect(readDraggedAssetId(dt({ 'text/plain': 'asset-1' }))).toBeNull();
  expect(readDraggedAssetId(dt({ 'text/uri-list': 'https://example.com/x.png' }))).toBeNull();
  expect(readDraggedAssetId(dt({ [SOVEREIGN_ASSET_DRAG_TYPE]: '   ' }))).toBeNull();
  expect(readDraggedAssetId(null)).toBeNull();
});
