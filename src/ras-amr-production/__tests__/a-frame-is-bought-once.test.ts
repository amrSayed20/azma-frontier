/**
 * AZMA OS — RAS AL AMR, PHASE 3: a frame is bought once, and a scene with no
 * frame says so instead of being filled from the stock library.
 *
 * ─── WHAT WAS TRUE BEFORE THESE TESTS ───────────────────────────────────────
 *
 *   MEASURED at 0bada6e, by reading the production road end to end:
 *
 *     · a commissioned picture was deposited in the Creator's Vault and
 *       NOTHING recorded which scene it was for, so pressing produce again
 *       bought every picture a second time — 100 credits each;
 *     · a scene whose commission failed fell through to the stock library and
 *       the film was assembled anyway, with a searched picture standing where
 *       the Creator had asked for a made one. The only record was a line in
 *       the server log.
 *
 *   `assignSceneAsset` existed, owner-scoped and tested, with no caller on
 *   this road. These tests are the road.
 *
 * ─── WHERE THE DOUBLES ARE, AND WHY ─────────────────────────────────────────
 *
 *   The database is REAL — a temporary file, migrated by the Empire's own
 *   schema — because what is under test is which rows end up written. The
 *   ledger, the repository, the lifecycle and the route's own decisions are
 *   all real.
 *
 *   Three boundaries are doubled: the courier that spends money, the
 *   production workshop, and the Vault deposit. The courier is the one that
 *   matters — scripting it is how one scene can fail while the others finish,
 *   which is exactly the case the Founder asked to be proven, and no provider
 *   is reached. `jest.setup.network-guard.js` refuses `global.fetch` for every
 *   ordinary test in this repository, so that is enforced and not merely
 *   intended.
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// The database must be a scratch file before anything opens a connection.
const scratch = mkdtempSync(join(tmpdir(), 'azma-frames-'));
process.env.AZMA_DB_PATH = join(scratch, 'frames.db');

const OWNER = 'creator-owner';
const STRANGER = 'creator-stranger';

jest.mock('@/src/authentication', () => ({
  verifySession: (sessionId: string) =>
    sessionId === 'sess-owner' ? { creatorId: 'creator-owner', role: 'founder' }
    : sessionId === 'sess-stranger' ? { creatorId: 'creator-stranger', role: 'founder' }
    : null,
}));

jest.mock('next/headers', () => ({
  cookies: async () => ({ get: () => ({ value: 'sess-owner' }) }),
}));

const mockProduce = jest.fn();
const mockCheckHealth = jest.fn(async () => true);
jest.mock('@/src/external-providers/moneyprinterturbo/moneyprinterturbo-adapter', () => ({
  isMoneyPrinterTurboConfigured: () => true,
  MoneyPrinterTurboAdapter: class {
    checkHealth = mockCheckHealth;
    produce = mockProduce;
  },
}));

const mockDeposit = jest.fn();
jest.mock('@/src/external-providers/moneyprinterturbo/moneyprinterturbo-vault-deposit', () => ({
  depositProductionIntoVault: mockDeposit,
}));

const mockCommission = jest.fn();
const mockHandOver = jest.fn();
jest.mock('@/src/ras-amr-production/qiyamah-commission', () => ({
  commissionScenePictures: mockCommission,
  handOverAssetToWorkshop: mockHandOver,
}));

import { NextRequest } from 'next/server';
import { getDb } from '@/src/persistent-storage/db';
import {
  addScene,
  assignSceneAsset,
  createStoryboard,
  listScenes,
} from '@/src/persistent-storage/sovereign-project-repository';
import { observeStoryboardOperation, findOperationForStoryboard } from '../storyboard-operation-lifecycle';
import { POST } from '@/app/api/ras-amr/storyboard/[storyboardId]/produce/route';
import { readScenePlans } from '@/app/ras-amr/actions';

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Three scenes, each asking to have its picture made. */
function board(demands: readonly string[], owner = OWNER) {
  const db = getDb();
  const sb = createStoryboard(db, { ownerId: owner, title: 'إعلانٌ قصير' });
  const sceneIds = demands.map((demand, i) => {
    const added = addScene(db, {
      storyboardId: sb.storyboardId,
      ownerId: owner,
      description: `المشهد ${i + 1}`,
      directionNotes: 'سطرٌ يُقال فوق المشهد.',
      visualSearchEn: `scene ${i + 1}`,
      sourcing: 'generate',
      creationDemandAr: demand,
      order: i + 1,
    });
    if (!added.ok) throw new Error('could not seed a scene');
    return added.scene.sceneId;
  });
  return { storyboardId: sb.storyboardId, sceneIds };
}

async function produce(storyboardId: string, body: Record<string, unknown> = {}, session = 'sess-owner') {
  const request = new NextRequest(`http://localhost/api/ras-amr/storyboard/${storyboardId}/produce`, {
    method: 'POST',
    headers: { cookie: `azma_session=${session}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const response = await POST(request, { params: Promise.resolve({ storyboardId }) });
  return { status: response.status, body: await response.json() as Record<string, unknown> };
}

/** The work outlives the request, so the ledger is what is waited on. */
async function settled(operationId: string, creatorId = OWNER) {
  for (let i = 0; i < 200; i++) {
    const observed = await observeStoryboardOperation(operationId, creatorId);
    if (observed?.isTerminal) return observed;
    await new Promise((r) => setTimeout(r, 25));
  }
  throw new Error(`operation ${operationId} never settled`);
}

const made = (sceneId: string, order: number, assetId: string) => ({
  order, sceneId, assetId, assetUrl: `/generated-assets/${assetId}.png`,
  workshopPath: `/MoneyPrinterTurbo/storage/${assetId}.png`,
});
const refused = (sceneId: string, order: number, failure: string) => ({ order, sceneId, failure });

const framesOf = (storyboardId: string) =>
  listScenes(getDb(), storyboardId, OWNER).map((s) => s.visualAssetId);

// ─── SUITE ───────────────────────────────────────────────────────────────────

describe('a frame is bought once, and a missing one is never substituted', () => {
  beforeEach(() => {
    mockCommission.mockReset();
    mockHandOver.mockReset();
    mockProduce.mockReset();
    mockDeposit.mockReset();
    mockHandOver.mockImplementation(async (assetId: string) => `/MoneyPrinterTurbo/storage/${assetId}.png`);
    mockProduce.mockResolvedValue({ bytes: Buffer.alloc(2048, 7), taskId: 'task-1', providerId: 'x' });
    mockDeposit.mockResolvedValue({ assetId: 'asset-film', secureStorageUri: '/uploads/film.mp4' });
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());
  afterAll(() => {
    // Best effort, and deliberately not an assertion: the Empire's connection
    // is a module singleton with no close, so Windows holds the file open and
    // refuses the directory. MEASURED: this threw EPERM and failed a suite
    // whose ten tests had all passed — a cleanup must never be able to do that.
    try { rmSync(scratch, { recursive: true, force: true }); } catch { /* the OS will */ }
  });

  it('pins every made frame to its own scene, by the owner-scoped path', async () => {
    const { storyboardId, sceneIds } = board(['برطمانُ عسلٍ على خشب', 'ملعقةٌ ترفعُ خيطَ عسل', 'يدٌ تُقدّمُ البرطمان']);
    mockCommission.mockResolvedValue([
      made(sceneIds[0], 1, 'asset-a'), made(sceneIds[1], 2, 'asset-b'), made(sceneIds[2], 3, 'asset-c'),
    ]);

    const accepted = await produce(storyboardId);
    expect(accepted.status).toBe(202);
    expect(accepted.body.framesToCreate).toBe(3);
    const observed = await settled(accepted.body.operationId as string);

    expect(observed.succeeded).toBe(true);
    // The rows, not a response: this is what survives a refresh.
    expect(framesOf(storyboardId)).toEqual(['asset-a', 'asset-b', 'asset-c']);
    expect(observed.sceneOutcomes?.every((o) => o.state === 'COMPLETED')).toBe(true);
  });

  it('one scene fails, the others still finish — and their frames are kept', async () => {
    const { storyboardId, sceneIds } = board(['أوّل', 'ثانٍ', 'ثالث']);
    mockCommission.mockResolvedValue([
      made(sceneIds[0], 1, 'asset-1'),
      refused(sceneIds[1], 2, 'GENERATION_FAILED'),
      made(sceneIds[2], 3, 'asset-3'),
    ]);

    const accepted = await produce(storyboardId);
    const observed = await settled(accepted.body.operationId as string);

    // The two that were made are pinned; the one that failed holds nothing.
    expect(framesOf(storyboardId)).toEqual(['asset-1', null, 'asset-3']);
    // And the film was NOT assembled from a substitute.
    expect(observed.succeeded).toBe(false);
    expect(observed.failureReason).toBe('SCENES_NOT_CREATED');
    expect(mockProduce).not.toHaveBeenCalled();
    expect(mockDeposit).not.toHaveBeenCalled();
    // The scene's own cause is recorded, not the production's.
    const outcome = observed.sceneOutcomes?.find((o) => o.sceneId === sceneIds[1]);
    expect(outcome).toMatchObject({ state: 'FAILED', failure: 'GENERATION_FAILED' });
  });

  it('a retry commissions ONLY the scene that has no frame', async () => {
    const { storyboardId, sceneIds } = board(['أوّل', 'ثانٍ', 'ثالث']);
    mockCommission.mockResolvedValueOnce([
      made(sceneIds[0], 1, 'asset-1'),
      refused(sceneIds[1], 2, 'BUSY'),
      made(sceneIds[2], 3, 'asset-3'),
    ]);
    const first = await produce(storyboardId);
    await settled(first.body.operationId as string);

    // The second press: the two finished frames are reused, not re-bought.
    mockCommission.mockResolvedValueOnce([made(sceneIds[1], 2, 'asset-2')]);
    const retry = await produce(storyboardId);
    expect(retry.body.framesToCreate).toBe(1);
    expect(retry.body.framesReused).toBe(2);
    const observed = await settled(retry.body.operationId as string);

    const demandsAsked = mockCommission.mock.calls[1][0].demands as { sceneId: string }[];
    expect(demandsAsked.map((d) => d.sceneId)).toEqual([sceneIds[1]]);
    expect(framesOf(storyboardId)).toEqual(['asset-1', 'asset-2', 'asset-3']);
    expect(observed.succeeded).toBe(true);
    // Only now is a film assembled, because only now does every scene have one.
    expect(mockProduce).toHaveBeenCalledTimes(1);
  });

  it('the completed frames are the same assets after the retry — nothing was replaced', async () => {
    const { storyboardId, sceneIds } = board(['أوّل', 'ثانٍ']);
    mockCommission.mockResolvedValueOnce([
      made(sceneIds[0], 1, 'asset-keep'), refused(sceneIds[1], 2, 'GENERATION_FAILED'),
    ]);
    await settled((await produce(storyboardId)).body.operationId as string);
    const before = framesOf(storyboardId);

    mockCommission.mockResolvedValueOnce([made(sceneIds[1], 2, 'asset-new')]);
    await settled((await produce(storyboardId)).body.operationId as string);

    expect(before[0]).toBe('asset-keep');
    expect(framesOf(storyboardId)[0]).toBe('asset-keep');
  });

  it('a completed board asked again buys nothing and starts no new production', async () => {
    const { storyboardId, sceneIds } = board(['أوّل', 'ثانٍ']);
    mockCommission.mockResolvedValueOnce([made(sceneIds[0], 1, 'asset-x'), made(sceneIds[1], 2, 'asset-y')]);
    const first = await produce(storyboardId);
    await settled(first.body.operationId as string);
    const callsAfterFirst = mockCommission.mock.calls.length;

    const again = await produce(storyboardId);

    // One board, one film: the Creator is handed the one that exists.
    expect(again.body.reused).toBe(true);
    expect(again.body.operationId).toBe(first.body.operationId);
    expect(mockCommission.mock.calls.length).toBe(callsAfterFirst);
  });

  it('a frame is made again ONLY when the Creator names that scene', async () => {
    const { storyboardId, sceneIds } = board(['أوّل', 'ثانٍ']);
    mockCommission.mockResolvedValueOnce([made(sceneIds[0], 1, 'asset-old'), made(sceneIds[1], 2, 'asset-keep')]);
    await settled((await produce(storyboardId)).body.operationId as string);

    // The ledger holds a DEPOSITED operation for this board, so the explicit
    // ask has to travel with a fresh one — proven by the demand list below.
    getDb().prepare('UPDATE operation_ledger SET current_state = ? WHERE operation_id = ?')
      .run('FAILED', findOperationForStoryboard(OWNER, storyboardId));

    mockCommission.mockResolvedValueOnce([made(sceneIds[0], 1, 'asset-remade')]);
    const retry = await produce(storyboardId, { regenerateSceneIds: [sceneIds[0]] });
    await settled(retry.body.operationId as string);

    const demandsAsked = mockCommission.mock.calls[1][0].demands as { sceneId: string }[];
    expect(demandsAsked.map((d) => d.sceneId)).toEqual([sceneIds[0]]);
    expect(framesOf(storyboardId)).toEqual(['asset-remade', 'asset-keep']);
  });

  it('a frame that was made and could not be pinned says so, and the film still carries it', async () => {
    // LINK_FAILED is its own cause: nothing was refused and nothing was lost,
    // and the picture IS in this film. What it costs is memory.
    const { storyboardId, sceneIds } = board(['أوّل']);
    mockCommission.mockResolvedValue([made('a-scene-that-is-not-on-this-board', 1, 'asset-orphan')]);

    const accepted = await produce(storyboardId);
    const observed = await settled(accepted.body.operationId as string);

    expect(observed.sceneOutcomes?.[0]).toMatchObject({ state: 'FAILED', failure: 'LINK_FAILED' });
    expect(observed.succeeded).toBe(true);        // the film was still made
    expect(mockProduce).toHaveBeenCalledTimes(1);
    expect(framesOf(storyboardId)).toEqual([null]);
    expect(sceneIds.length).toBe(1);
  });

  it('a stranger can neither pin a frame onto this scene nor read its state', async () => {
    const { storyboardId, sceneIds } = board(['أوّل']);

    // The write path refuses by ownership, not by hope.
    expect(assignSceneAsset(getDb(), sceneIds[0], STRANGER, { visualAssetId: 'asset-theirs' })).toBe(false);
    expect(framesOf(storyboardId)).toEqual([null]);

    // And a production asked for by a stranger answers «not found» — the same
    // answer as a board that does not exist, so an id cannot be probed.
    const theirs = await produce(storyboardId, {}, 'sess-stranger');
    expect(theirs.status).toBe(404);
    expect(mockCommission).not.toHaveBeenCalled();
  });

  it('the state a scene reports comes from its row, not from a browser memory', async () => {
    const { storyboardId, sceneIds } = board(['أوّل', 'ثانٍ']);
    mockCommission.mockResolvedValue([
      made(sceneIds[0], 1, 'asset-done'), refused(sceneIds[1], 2, 'GENERATION_FAILED'),
    ]);
    await settled((await produce(storyboardId)).body.operationId as string);

    // `readScenePlans` is what the chamber calls on a fresh page load. Nothing
    // of the previous session is in scope here — this process never rendered.
    const plans = await readScenePlans(storyboardId);
    if (!plans.ok) throw new Error(plans.messageAr);
    expect(plans.scenes[0]).toMatchObject({ frameState: 'COMPLETED', visualAssetId: 'asset-done' });
    expect(plans.scenes[1]).toMatchObject({ frameState: 'FAILED', failure: 'GENERATION_FAILED' });
  });

  it('deleting a scene does not delete the sovereign asset it pointed at', async () => {
    const { storyboardId, sceneIds } = board(['أوّل']);
    const db = getDb();
    db.prepare(
      `INSERT INTO vault_assets (asset_id, subscriber_tenant_id, originating_operation_id,
        capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run('asset-survivor', OWNER, 'op-src', 'VISUAL', 'MEDIA', '/generated-assets/x.png', '{}', 1, 1);
    expect(assignSceneAsset(db, sceneIds[0], OWNER, { visualAssetId: 'asset-survivor' })).toBe(true);

    db.prepare('DELETE FROM storyboard_scenes WHERE scene_id = ?').run(sceneIds[0]);

    const still = db.prepare('SELECT asset_id FROM vault_assets WHERE asset_id = ?').get('asset-survivor');
    expect(still).toBeTruthy();
    expect(listScenes(db, storyboardId, OWNER)).toHaveLength(0);
  });
});
