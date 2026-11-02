/**
 * RAS AL AMR EXECUTION DIRECTIVE — PHASE 4 ACCEPTANCE: IN-CHAMBER RENDER
 *
 * Drives the real routes end to end with no FFmpeg or fleet mocks:
 *   POST /api/ras-amr/render            → real compile + real dispatch (202)
 *   GET  /api/ras-amr/render/[id]       → polled until the real MP4 is deposited
 *   GET  /api/ras-amr/render/[id]/file  → streams the MP4 (full + Range)
 *   GET  /api/ras-amr/render            → the render is listed again on return
 * plus ownership (another Creator gets 403) and a missing-file failure that
 * explains itself to the Creator.
 *
 * Only two seams are replaced: the session check (no login flow in a unit
 * test) and the database, which runs in memory so the real database file is
 * never touched. Skipped automatically when ffmpeg is not installed.
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { NextRequest } from 'next/server';

jest.mock('../../../../../src/persistent-storage/db', () => {
  const actual = jest.requireActual('../../../../../src/persistent-storage/db');
  const memory = actual.createDatabase(':memory:');
  return { ...actual, getDb: () => memory };
});

const mockVerifySession = jest.fn();
jest.mock('../../../../../src/authentication', () => ({
  verifySession: (...args: unknown[]) => mockVerifySession(...args),
}));

const hasFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0 && spawnSync('ffprobe', ['-version']).status === 0;
const describeReal = hasFfmpeg ? describe : describe.skip;

jest.setTimeout(120000);

const CREATOR = 'creator-render-a';
const OTHER_CREATOR = 'creator-render-b';
const FOUNDER = 'creator-render-founder';

/** The in-memory database this suite runs against, shared by every case. */
const getDb = () => (jest.requireMock('../../../../../src/persistent-storage/db') as { getDb: () => never }).getDb();
let workDir = '';
const savedEnv = { UPLOADS_DIR: process.env.UPLOADS_DIR };

type Routes = {
  start: typeof import('../route');
  status: typeof import('../[operationId]/route');
  file: typeof import('../[operationId]/file/route');
};
let routes: Routes;

function request(url: string, init: { method?: string; body?: unknown; headers?: Record<string, string> } = {}) {
  return new NextRequest(`http://localhost${url}`, {
    method: init.method ?? 'GET',
    headers: { 'Content-Type': 'application/json', Cookie: 'azma_session=session-1', ...(init.headers ?? {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
}

const params = (operationId: string) => ({ params: Promise.resolve({ operationId }) });

function asset(assetId: string, file: string, capabilityTarget: string, owner: string = CREATOR) {
  return {
    assetId,
    subscriberTenantId: owner,
    originatingOperationId: `upload-${assetId}`,
    capabilityTarget,
    assetFamily: 'MEDIA',
    secureStorageUri: `/uploads/${file}`,
    metadata: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function canvas(nodes: { nodeId: string; assetId: string; capability: string; start: number; dur: number }[]) {
  return {
    canvasId: 'canvas_narrative_session',
    subscriberTenantId: 'pending-server-verification',
    canvasType: 'CINEMATIC',
    title: 'Render route proof',
    tracks: [{
      trackId: 'track-1',
      trackName: 'المسار الرئيسي',
      isMuted: false,
      isHidden: false,
      nodes: nodes.map((n) => ({
        nodeId: n.nodeId,
        assetId: n.assetId,
        assetFamily: 'MEDIA',
        capabilityOrigin: n.capability,
        temporal: { globalStartTimeSeconds: n.start, playDurationSeconds: n.dur },
        spatial: { zIndex: 0, scaleX: 1, scaleY: 1, positionX: 0, positionY: 0, rotationDegrees: 0 },
      })),
    }],
    createdAt: 0,
    updatedAt: 0,
  };
}

async function pollUntilDone(operationId: string): Promise<Record<string, unknown>> {
  for (let i = 0; i < 300; i++) {
    const res = await routes.status.GET(request(`/api/ras-amr/render/${operationId}`), params(operationId));
    const body = await res.json();
    if (body.status !== 'processing') return body;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error('render did not finish');
}

describeReal('Ras Al-Amr in-chamber render — real routes, real FFmpeg', () => {
  beforeAll(async () => {
    workDir = mkdtempSync(join(tmpdir(), 'azma-render-route-'));
    const uploads = join(workDir, 'uploads');
    mkdirSync(uploads, { recursive: true });
    // ONE variable decides where both assets and finished films live. The
    // encoder deliberately does not read a RENDERS_DIR of its own: a separate
    // variable that production does not set would default back to
    // `public/renders`, which Next.js serves BEFORE the authorisation gate.
    // Measured on the live server: /renders/<film>.mp4 with no session -> 404.
    process.env.UPLOADS_DIR = uploads;
    const make = (args: string[]) => {
      const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { cwd: uploads });
      if (r.status !== 0) throw new Error(r.stderr.toString());
    };
    make(['-f', 'lavfi', '-i', 'color=c=red:s=1280x720', '-frames:v', '1', 'scene.png']);
    make(['-f', 'lavfi', '-i', 'color=c=lime:s=1280x720:d=2', '-pix_fmt', 'yuv420p', 'clip.mp4']);
    make(['-f', 'lavfi', '-i', 'sine=f=440:d=3', '-c:a', 'libopus', 'voice.webm']);
    make(['-f', 'lavfi', '-i', 'color=c=blue:s=1280x720', '-frames:v', '1', 'doomed.png']);

    const { insertVaultAsset } = jest.requireActual('../../../../../src/persistent-storage/vault-asset-repository');
    for (const a of [
      asset('a-scene', 'scene.png', 'VISUAL'),
      asset('a-clip', 'clip.mp4', 'MOTION'),
      asset('a-voice', 'voice.webm', 'AUDIO'),
      asset('a-doomed', 'doomed.png', 'VISUAL'),
      // Owned elsewhere, so the money cases below are refused for the reason
      // they are testing and never for a tenancy breach.
      asset('a-scene-poor', 'scene.png', 'VISUAL', OTHER_CREATOR),
      asset('a-scene-founder', 'scene.png', 'VISUAL', FOUNDER),
    ]) {
      insertVaultAsset(getDb(), a);
    }

    // ── THE EXPORT IS PAID FOR NOW, SO THE CREATOR MUST HAVE UNITS ────────
    //
    //   RULED 2026-11-02, decision 2: 100 units per second of the final MP4.
    //   Before that ruling these renders were free, and this grant is part of
    //   the proof: without it every successful case below answers 402, which
    //   is exactly what a Creator with an empty balance now gets.
    const { CreatorCreditRepository } = jest.requireActual('../../../../../src/economy/credit-ledger/credit-ledger-repository');
    new CreatorCreditRepository(getDb()).creditUnits(CREATOR, 100_000, 'grant', 'render-route-proof-grant');

    routes = {
      start: await import('../route'),
      status: await import('../[operationId]/route'),
      file: await import('../[operationId]/file/route'),
    };
  });

  beforeEach(() => mockVerifySession.mockReturnValue({ creatorId: CREATOR, role: 'creator' }));

  afterAll(() => {
    for (const [key, value] of Object.entries(savedEnv)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    if (workDir) rmSync(workDir, { recursive: true, force: true });
  });

  it('renders, deposits, streams and lists the MP4 without leaving Ras Al-Amr', async () => {
    const res = await routes.start.POST(request('/api/ras-amr/render', {
      method: 'POST',
      body: {
        canvas: canvas([
          { nodeId: 'n-scene', assetId: 'a-scene', capability: 'VISUAL', start: 0, dur: 2 },
          { nodeId: 'n-voice', assetId: 'a-voice', capability: 'AUDIO', start: 0, dur: 3 },
          { nodeId: 'n-clip', assetId: 'a-clip', capability: 'MOTION', start: 2, dur: 2 },
        ]),
      },
    }));
    expect(res.status).toBe(202);
    const started = await res.json();
    expect(started.status).toBe('accepted');
    expect(started.operationId).toMatch(/^op_rasamr_/);
    expect(started.estimatedDurationSeconds).toBe(4);

    const done = await pollUntilDone(started.operationId);
    expect(done.status).toBe('succeeded');
    expect(done.fileUrl).toBe(`/api/ras-amr/render/${started.operationId}/file`);

    // Polling again after deposit is stable.
    const again = await (await routes.status.GET(request(`/api/ras-amr/render/${started.operationId}`), params(started.operationId))).json();
    expect(again.status).toBe('succeeded');

    // Full download.
    const full = await routes.file.GET(request(`/api/ras-amr/render/${started.operationId}/file?download=1`), params(started.operationId));
    expect(full.status).toBe(200);
    expect(full.headers.get('content-type')).toBe('video/mp4');
    expect(full.headers.get('content-disposition')).toContain('attachment');
    const bytes = Buffer.from(await full.arrayBuffer());
    expect(bytes.length).toBeGreaterThan(1000);
    expect(bytes.subarray(4, 8).toString('ascii')).toBe('ftyp');

    // Seeking (Range) for the <video> element.
    const partial = await routes.file.GET(
      request(`/api/ras-amr/render/${started.operationId}/file`, { headers: { Range: 'bytes=0-99' } }),
      params(started.operationId),
    );
    expect(partial.status).toBe(206);
    expect(partial.headers.get('content-range')).toBe(`bytes 0-99/${bytes.length}`);
    expect(Buffer.from(await partial.arrayBuffer()).length).toBe(100);

    // Leaving and returning: the render is found again from the ledger.
    const listed = await (await routes.start.GET(request('/api/ras-amr/render'))).json();
    expect(listed.renders[0].operationId).toBe(started.operationId);
    expect(listed.renders[0].state).toBe('DEPOSITED');

    // Another Creator can neither poll nor download it.
    mockVerifySession.mockReturnValue({ creatorId: OTHER_CREATOR, role: 'creator' });
    expect((await routes.status.GET(request(`/api/ras-amr/render/${started.operationId}`), params(started.operationId))).status).toBe(403);
    expect((await routes.file.GET(request(`/api/ras-amr/render/${started.operationId}/file`), params(started.operationId))).status).toBe(403);
  });

  /* ─── THE CHARGE, ON A REAL FILM THAT A REAL FFPROBE MEASURED ───────────────
   *
   *   RULED 2026-11-02, decision 2. This is the only place in the Empire where
   *   a genuine MP4 exists inside a test, so it is where the ruling is proven:
   *   the hold is stated before the encode, the settlement follows the file's
   *   own measured length, and the Creator is told the figure in the answer.
   */
  it('charges 100 units for every second of the film it actually produced', async () => {
    const { CreatorCreditRepository } = jest.requireActual('../../../../../src/economy/credit-ledger/credit-ledger-repository');
    const { attemptForOperation } = jest.requireActual('../../../../../src/economy/paid-operation-attempts');
    const credits = new CreatorCreditRepository(getDb());
    const before = credits.getBalance(CREATOR);

    // Three seconds of picture. The hold must be 300, not a guess and not zero.
    const res = await routes.start.POST(request('/api/ras-amr/render', {
      method: 'POST',
      body: { canvas: canvas([{ nodeId: 'n-paid', assetId: 'a-scene', capability: 'VISUAL', start: 0, dur: 3 }]) },
    }));
    expect(res.status).toBe(202);
    const started = await res.json();
    expect(started.charge).toEqual({ units: 300, heldForSeconds: 3 });

    // Held, not yet spent: the film does not exist at this moment.
    const held = credits.getBalance(CREATOR);
    expect(held.reservedUnits - before.reservedUnits).toBe(300);
    expect(held.totalSpent).toBe(before.totalSpent);

    expect((await pollUntilDone(started.operationId)).status).toBe('succeeded');

    // Settled on the FILE: ffprobe reads it, and the charge follows that.
    const mp4 = join(process.env.UPLOADS_DIR!, 'renders', `${started.operationId}.mp4`);
    const measured = Number(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]).stdout.toString());
    expect(measured).toBeCloseTo(3, 0);

    const after = credits.getBalance(CREATOR);
    expect(after.reservedUnits).toBe(before.reservedUnits);
    expect(after.totalSpent - before.totalSpent).toBe(Math.ceil(measured) * 100);
    // And never more than was held, whatever the file turned out to be.
    expect(after.totalSpent - before.totalSpent).toBeLessThanOrEqual(300);

    const attempt = attemptForOperation(getDb(), started.operationId);
    expect(attempt.settlementState).toBe('settled');
    expect(attempt.state).toBe('succeeded');
  });

  it('pays once for one press, however many times the browser resends it', async () => {
    const { CreatorCreditRepository } = jest.requireActual('../../../../../src/economy/credit-ledger/credit-ledger-repository');
    const credits = new CreatorCreditRepository(getDb());
    const before = credits.getBalance(CREATOR);
    const press = { 'x-azma-operation-key': 'one-press-of-export' };
    const body = { canvas: canvas([{ nodeId: 'n-once', assetId: 'a-scene', capability: 'VISUAL', start: 0, dur: 2 }]) };

    const first = await routes.start.POST(request('/api/ras-amr/render', { method: 'POST', body, headers: press }));
    expect(first.status).toBe(202);
    expect((await first.json()).charge.units).toBe(200);

    // The same key again: no second hold, no second film.
    const second = await routes.start.POST(request('/api/ras-amr/render', { method: 'POST', body, headers: press }));
    expect(second.status).toBe(503);
    // NOT a verdict: the browser must keep this press's key, or the next
    // press takes a second hold and encodes the same film twice.
    expect((await second.json()).reason).toBe('operation-in-flight');
    expect(credits.getBalance(CREATOR).reservedUnits - before.reservedUnits).toBe(200);
  });

  it('closes the hold of a Creator who closed the tab, when they come back', async () => {
    const { CreatorCreditRepository } = jest.requireActual('../../../../../src/economy/credit-ledger/credit-ledger-repository');
    const { attemptForOperation } = jest.requireActual('../../../../../src/economy/paid-operation-attempts');
    const credits = new CreatorCreditRepository(getDb());
    const spentBefore = credits.getBalance(CREATOR).totalSpent;

    const started = await (await routes.start.POST(request('/api/ras-amr/render', {
      method: 'POST',
      body: { canvas: canvas([{ nodeId: 'n-abandoned', assetId: 'a-scene', capability: 'VISUAL', start: 0, dur: 2 }]) },
    }))).json();
    expect(started.charge.units).toBe(200);
    expect((await pollUntilDone(started.operationId)).status).toBe('succeeded');

    // Now put the money back the way an ABANDONED export leaves it: the film
    // is made and recorded, and the hold was never closed because nobody
    // polled the moment it finished.
    const attempt = attemptForOperation(getDb(), started.operationId);
    const db = getDb() as unknown as {
      prepare: (sql: string) => { run: (...args: unknown[]) => void; get: (...args: unknown[]) => unknown };
    };
    db.prepare("UPDATE paid_operation_attempts SET settlement_state = 'owed', state = 'in-flight' WHERE attempt_key = ?")
      .run(attempt.attemptKey);
    db.prepare("UPDATE credit_ledger SET status = 'pending' WHERE ledger_id = ?").run(attempt.reservationId);
    expect(attemptForOperation(getDb(), started.operationId).settlementState).toBe('owed');

    // The Creator comes back. Listing their films closes the money — decided
    // by the operation ledger's own record of DEPOSITED, never by an age.
    await routes.start.GET(request('/api/ras-amr/render'));

    // THIS hold is closed, and its units became a charge rather than going
    // back: the film was delivered. The Creator's total reserved figure is
    // deliberately not asserted — the same return closes every OTHER
    // stranded hold it can speak for, which is the point of it.
    const closed = attemptForOperation(getDb(), started.operationId);
    expect(closed.settlementState).toBe('settled');
    expect(closed.state).toBe('succeeded');
    const row = db.prepare('SELECT status FROM credit_ledger WHERE ledger_id = ?')
      .get(closed.reservationId) as { status: string };
    expect(row.status).not.toBe('pending');
    expect(credits.getBalance(CREATOR).totalSpent).toBeGreaterThan(spentBefore);
  });

  it('refuses the export when the balance is short, and makes no film', async () => {
    mockVerifySession.mockReturnValue({ creatorId: OTHER_CREATOR, role: 'creator' });
    const res = await routes.start.POST(request('/api/ras-amr/render', {
      method: 'POST',
      body: { canvas: canvas([{ nodeId: 'n-poor', assetId: 'a-scene-poor', capability: 'VISUAL', start: 0, dur: 2 }]) },
    }));
    expect(res.status).toBe(402);
    const body = await res.json();
    expect(body.reason).toBe('payment-required');
    expect(body.requiredUnits).toBe(200);
    expect(body.operationId).toBeUndefined();
  });

  it('owes nothing for a Founder, and still names the film it made', async () => {
    mockVerifySession.mockReturnValue({ creatorId: FOUNDER, role: 'founder' });
    const res = await routes.start.POST(request('/api/ras-amr/render', {
      method: 'POST',
      body: { canvas: canvas([{ nodeId: 'n-free', assetId: 'a-scene-founder', capability: 'VISUAL', start: 0, dur: 2 }]) },
    }));
    expect(res.status).toBe(202);
    expect((await res.json()).charge).toEqual({ units: 0, heldForSeconds: 2, entitledVia: 'founder' });
  });

  it('renders a storyboard project as its own MP4, filed under that project, adoptable by distribution', async () => {
    const storyboard = await import('../../../../../src/chambers/ras-al-amr/storyboard');
    const { isAdoptableRasAlAmrRender } = await import('../../../../../src/sovereign-entry/ras-al-amr-render');
    const { FlattenedRenderingBridge, RenderStatus } = await import('../../../../../src/chambers/makman-al-ghayah/rendering-bridge');

    let project = storyboard.createStoryboardProject('قصة الاختبار', 1, 'route');
    const opening = storyboard.addScene(project, { title: 'الافتتاح', description: 'لون أحمر', durationSeconds: 3 }, 2, 's1');
    const closing = storyboard.addScene(opening.canvas, { title: 'الختام', description: 'المقطع', durationSeconds: 2 }, 3, 's2');
    project = closing.canvas;
    project = storyboard.attachAsset(project, opening.sceneId, { assetId: 'a-scene', assetFamily: 'MEDIA' as never, capabilityTarget: 'VISUAL' as never }, 4, 'v1').canvas;
    project = storyboard.attachAsset(project, opening.sceneId, { assetId: 'a-voice', assetFamily: 'MEDIA' as never, capabilityTarget: 'AUDIO' as never }, 4, 'v2').canvas;
    project = storyboard.attachAsset(project, closing.sceneId, { assetId: 'a-clip', assetFamily: 'MEDIA' as never, capabilityTarget: 'MOTION' as never }, 4, 'v3').canvas;

    const res = await routes.start.POST(request('/api/ras-amr/render', {
      method: 'POST',
      body: { canvas: storyboard.storyboardToProductionCanvas(project) },
    }));
    expect(res.status).toBe(202);
    const started = await res.json();
    expect(started.estimatedDurationSeconds).toBe(5);
    expect((await pollUntilDone(started.operationId)).status).toBe('succeeded');

    // The real MP4: 5 s, scene 1 red, scene 2 the lime clip, dissolving between them.
    const { join: joinPath } = await import('node:path');
    const mp4 = joinPath(process.env.UPLOADS_DIR!, 'renders', `${started.operationId}.mp4`);
    const probe = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', mp4]);
    expect(Number(probe.stdout.toString())).toBeCloseTo(5, 0);
    const pixel = (t: number) => {
      const out = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', mp4, '-frames:v', '1', '-vf', 'crop=64:64:928:508,scale=1:1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
      return [...out.stdout.subarray(0, 3)];
    };
    const [r1, g1] = pixel(1.5);
    expect(r1).toBeGreaterThan(200);
    expect(g1).toBeLessThan(60);
    const [r2, g2] = pixel(4.2);
    expect(r2).toBeLessThan(60);
    expect(g2).toBeGreaterThan(200);
    const [r3, g3] = pixel(2.75);
    expect(r3).toBeGreaterThan(70);
    expect(g3).toBeGreaterThan(70);

    // Filed under the storyboard, never under the montage session.
    const own = await (await routes.start.GET(request(`/api/ras-amr/render?projectId=${project.canvasId}`))).json();
    expect(own.renders.map((r: { operationId: string }) => r.operationId)).toEqual([started.operationId]);
    const montage = await (await routes.start.GET(request('/api/ras-amr/render?projectId=canvas_narrative_session'))).json();
    expect(montage.renders.map((r: { operationId: string }) => r.operationId)).not.toContain(started.operationId);

    // Distribution may serve this MP4 only for this Creator and this exact compilation.
    const compilationId = started.compiledGraph.compilationId as string;
    expect(await isAdoptableRasAlAmrRender(started.operationId, CREATOR, compilationId)).toBe(true);
    expect(await isAdoptableRasAlAmrRender(started.operationId, CREATOR, 'another-compilation')).toBe(false);
    expect(await isAdoptableRasAlAmrRender(started.operationId, OTHER_CREATOR, compilationId)).toBe(false);
    expect(await isAdoptableRasAlAmrRender('op_render_elsewhere', CREATOR, compilationId)).toBe(false);

    const dispatcher = { executeMaterialization: jest.fn() };
    const bridge = new FlattenedRenderingBridge(dispatcher as never);
    const publication = { publicationId: 'pub-1', sourceCompilationId: compilationId, publisherTenantId: CREATOR } as never;
    const state = await bridge.evaluateAndDispatchRender(publication, started.compiledGraph, started.operationId);
    expect(state.status).toBe(RenderStatus.COMPLETED);
    expect(state.activeOperationId).toBe(started.operationId);
    expect(dispatcher.executeMaterialization).not.toHaveBeenCalled();
  });

  it('explains a missing asset file to the Creator instead of failing silently', async () => {
    unlinkSync(join(process.env.UPLOADS_DIR!, 'doomed.png'));
    const res = await routes.start.POST(request('/api/ras-amr/render', {
      method: 'POST',
      body: { canvas: canvas([{ nodeId: 'n-doomed', assetId: 'a-doomed', capability: 'VISUAL', start: 0, dur: 2 }]) },
    }));
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.reason).toBe('asset-file-missing');
    expect(body.message).toContain('ارفعه من جديد');
  });

  it('refuses a canvas with no visual scene, with a reason the Creator can act on', async () => {
    const res = await routes.start.POST(request('/api/ras-amr/render', {
      method: 'POST',
      body: { canvas: canvas([{ nodeId: 'n-only-voice', assetId: 'a-voice', capability: 'AUDIO', start: 0, dur: 3 }]) },
    }));
    expect(res.status).toBe(422);
    expect((await res.json()).reason).toBe('no-visual-scenes');
  });

  it('requires a signed-in Creator', async () => {
    mockVerifySession.mockReturnValue(null);
    const res = await routes.start.POST(request('/api/ras-amr/render', { method: 'POST', body: { canvas: canvas([]) } }));
    expect(res.status).toBe(401);
  });
});
