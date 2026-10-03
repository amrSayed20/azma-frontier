/**
 * AZMA OS — the permission a Creator granted must be one they can withdraw.
 *
 *   MEASURED on production 2026-10-03, after a real Google link: the accounts
 *   panel was nested inside the reframe section, which renders only after a
 *   render finishes in the SAME session. The grant was held, and its owner had
 *   no way to see or revoke it.
 *
 *   «A Creator who can open a door they cannot shut has been given a hazard,
 *   not a capability» — app/api/renders/[operationId]/publish/route.ts.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const PAGE = readFileSync(join(process.cwd(), 'app/makman-al-ghayah/page.tsx'), 'utf8');

it('the cloud panel is not nested inside the render-only section', () => {
  // The reframe panel opens on `renderVaultAssetId &&`. Anything after that
  // index and before its close is invisible without a finished render.
  const renderGate = PAGE.indexOf('{renderVaultAssetId && (');
  const cloudPanel = PAGE.indexOf('data-testid="makman-cloud"');
  expect(cloudPanel).toBeGreaterThan(-1);
  expect(renderGate).toBeGreaterThan(-1);
  expect(cloudPanel).toBeLessThan(renderGate);
});

it('and stands where an arriving eye lands — before the Purpose and the goals', () => {
  // MEASURED, then LOOKED AT, 2026-10-03: moving it to chamber level was not
  // enough. It sat below twenty-one goal cards with its button cut off under
  // the fold — present, visible, and findable by nobody. «يجد أمامه مباشرة
  // حالة Google Drive والاتصال» is a position, not a presence.
  const cloudPanel = PAGE.indexOf('data-testid="makman-cloud"');
  const purpose = PAGE.indexOf('makman-purpose-section');
  const goals = PAGE.indexOf('makman-goals-list');
  expect(purpose).toBeGreaterThan(-1);
  expect(goals).toBeGreaterThan(-1);
  expect(cloudPanel).toBeLessThan(purpose);
  expect(cloudPanel).toBeLessThan(goals);
});

it('and states its condition before it asks for anything', () => {
  // A Creator returning from Google reads an answer, not a button.
  const at = PAGE.indexOf('data-testid="makman-cloud"');
  const panel = PAGE.slice(at, at + 1400);
  expect(panel).toContain('makman-cloud-state');
  expect(panel).toMatch(/مرتبط/);
});

it('and every linked account carries its own way out', () => {
  const at = PAGE.indexOf('data-testid="makman-cloud"');
  const panel = PAGE.slice(at, at + 2200);
  expect(panel).toContain('cloud?.accounts.map');
  expect(panel).toContain('unlinkCloudAccount');
  expect(panel).toContain('فُكَّ الربط');
});
