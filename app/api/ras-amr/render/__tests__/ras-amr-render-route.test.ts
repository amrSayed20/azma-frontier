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
let workDir = '';
const savedEnv = { UPLOADS_DIR: process.env.UPLOADS_DIR, RENDERS_DIR: process.env.RENDERS_DIR };

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

function asset(assetId: string, file: string, capabilityTarget: string) {
  return {
    assetId,
    subscriberTenantId: CREATOR,
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
    process.env.UPLOADS_DIR = uploads;
    process.env.RENDERS_DIR = join(workDir, 'renders');
    const make = (args: string[]) => {
      const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { cwd: uploads });
      if (r.status !== 0) throw new Error(r.stderr.toString());
    };
    make(['-f', 'lavfi', '-i', 'color=c=red:s=1280x720', '-frames:v', '1', 'scene.png']);
    make(['-f', 'lavfi', '-i', 'color=c=lime:s=1280x720:d=2', '-pix_fmt', 'yuv420p', 'clip.mp4']);
    make(['-f', 'lavfi', '-i', 'sine=f=440:d=3', '-c:a', 'libopus', 'voice.webm']);
    make(['-f', 'lavfi', '-i', 'color=c=blue:s=1280x720', '-frames:v', '1', 'doomed.png']);

    const { getDb } = jest.requireMock('../../../../../src/persistent-storage/db') as { getDb: () => unknown };
    const { insertVaultAsset } = jest.requireActual('../../../../../src/persistent-storage/vault-asset-repository');
    for (const a of [
      asset('a-scene', 'scene.png', 'VISUAL'),
      asset('a-clip', 'clip.mp4', 'MOTION'),
      asset('a-voice', 'voice.webm', 'AUDIO'),
      asset('a-doomed', 'doomed.png', 'VISUAL'),
    ]) {
      insertVaultAsset(getDb(), a);
    }

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
