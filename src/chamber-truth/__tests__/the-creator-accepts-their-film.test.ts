/**
 * AZMA OS — رأس الأمر: الفيلمُ لا يَصير نهائيًّا حتى يقولَ صاحبُه ذلك.
 *
 * ─── WHAT WAS MEASURED, AND WHEN ────────────────────────────────────────────
 *
 *   2026-10-27, on a real ten-second film with its own narration: the asset
 *   came to rest at INTERMEDIATE and stayed there. The rule was not broken —
 *   Article A-6 forbids inferring finality from an asset's type or location,
 *   and `acceptAsset` is where a Creator declares it instead. What was missing
 *   was a door: a repository-wide search found exactly ONE caller of the
 *   acceptance route, in القيامة. A film composed in رأس الأمر could be
 *   watched, downloaded, and sent to be published, and could never be called
 *   finished by the person who made it.
 *
 *   So these tests hold three things, each of which a later tidy-up could undo
 *   without noticing:
 *
 *     · the chamber offers the step — and offers THE existing one, not a
 *       second mechanism of its own;
 *     · it never accepts on the Creator's behalf;
 *     · the film knows which Vault asset it is, because without that the
 *       offer has nothing to act on.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const CHAMBER = read('app/ras-amr/page.tsx');
const RENDER_ENTRY = read('src/sovereign-entry/ras-al-amr-render.ts');
const ACCEPT_ROUTE = read('app/api/vault/assets/[assetId]/accept/route.ts');

describe('رأس الأمر — الاعتماد حيث يُشاهَد الفيلم', () => {
  it('the chamber offers acceptance through the Empire\'s existing route', () => {
    expect(CHAMBER).toContain('/accept`, { method: \'POST\' }');
    expect(CHAMBER).toContain('اعتمد هذا المخرج');
  });

  it('it is the same single mechanism — the chamber writes no state of its own', () => {
    // The route is the only thing that may move an asset to FINAL. A chamber
    // that reached for the repository directly would be a second authority.
    expect(CHAMBER).not.toContain('acceptAsset(');
    expect(CHAMBER).not.toContain('LifecycleState.FINAL');
    expect(ACCEPT_ROUTE).toContain('acceptAsset(');
  });

  it('nothing accepts on the Creator\'s behalf — the act is a press', () => {
    const start = CHAMBER.indexOf('const handleAcceptRender');
    expect(start).toBeGreaterThan(-1);
    // The only call site is the control the Creator presses.
    const calls = CHAMBER.split('handleAcceptRender').length - 1;
    expect(calls).toBe(2); // the definition, and the onClick
    expect(CHAMBER).toContain('onClick={handleAcceptRender}');
  });

  it('the finished render tells the chamber which asset it became', () => {
    expect(RENDER_ENTRY).toContain('readonly assetId?: string');
    expect(RENDER_ENTRY).toContain('depositedAssetId(operationId, tenantId)');
    expect(CHAMBER).toContain("assetId: typeof data.assetId === 'string'");
  });

  it('the asset is resolved scoped to its owner, never by path alone', () => {
    const fn = RENDER_ENTRY.slice(RENDER_ENTRY.indexOf('function depositedAssetId'));
    expect(fn.slice(0, 600)).toContain('asset.subscriberTenantId === tenantId');
  });

  it('a stale film is not offered for acceptance', () => {
    // Accepting a render the timeline has moved past would record the
    // Creator's word about a film they are no longer looking at.
    expect(CHAMBER).toContain('{renderJob.assetId && !isStale && (');
  });
});
