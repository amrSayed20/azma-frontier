/**
 * AZMA OS — رأس الأمر: المخرجُ الآليُّ حتّى الفيلم.
 *
 * ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
 *
 *   The Chief Architect, 2026-10-25: «النتيجة الحالية لا تتجاوز وصول القرار
 *   الآلي إلى اللوحة… أكمل الرحلة من داخل المسار الآلي الحقيقي، دون اصطناع
 *   نجاح أو استدعاء المخرج اليدوي بدلًا منه.»
 *
 *   So nothing here lays a scene by hand. Two pictures are given to the
 *   chamber's own Automatic Director standing on top of one another at zero —
 *   a sequence no film could play. The Director's own decisions are then
 *   executed through the Assembly Runtime, exactly as the chamber executes
 *   them, and the canvas that comes out is the canvas that is produced.
 *
 *   The film is then measured against the DECISION, not against a number this
 *   file chose: the instant the picture changes must be the instant the
 *   Director said the second scene begins.
 *
 * ─── OPT-IN, BECAUSE IT NEEDS A RUNNING CHAMBER ─────────────────────────────
 *
 *       AZMA_ALLOW_TEST_NETWORK=1 AZMA_LIVE_BASE=http://127.0.0.1:3100 \
 *       AZMA_LIVE_EMAIL=… AZMA_LIVE_PASSWORD=… npx jest automatic-director-to-film
 *
 *   No generation is requested and no credit is spent: the assets are already
 *   the Creator's and the encoder is local ffmpeg.
 */

import { spawnSync } from 'node:child_process';
import { AssemblyRuntime } from '../assembly-runtime';
import { RasAlAmrStateManager } from '../ras-al-amr-state-manager';
import { decideMultiNodeCinematicDirection } from '../automatic-director';
import { toDirectionDecision } from '../direction-workspace-constitution';
import { CanvasActionType } from '../assembly-directive-payloads';
import { CanvasType } from '../assembly-contracts';
import type { SovereignCanvas } from '../assembly-contracts';
import type { VaultAsset } from '../../../vault/sovereign-vault-types';

const BASE = process.env.AZMA_LIVE_BASE;
const live = process.env.AZMA_ALLOW_TEST_NETWORK === '1' && Boolean(BASE)
  && Boolean(process.env.AZMA_LIVE_EMAIL) && Boolean(process.env.AZMA_LIVE_PASSWORD);
const describeLive = live ? describe : describe.skip;

jest.setTimeout(600_000);

let cookie = '';
const api = async (path: string, init: RequestInit = {}) => {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}), ...(init.headers ?? {}) },
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0]!;
  return { status: res.status, body: (await res.json().catch(() => ({}))) as Record<string, unknown> };
};

/** The centre pixel of the frame at an instant, read out of the file itself. */
function pixelAt(file: string, t: number): [number, number, number] {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', file, '-frames:v', '1',
    '-vf', 'crop=1:1:960:540,format=rgb24', '-f', 'rawvideo', '-']);
  const b = r.stdout as Buffer;
  return [b[0]!, b[1]!, b[2]!];
}
const duration = (file: string) => Number(spawnSync('ffprobe',
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).stdout.toString().trim());

/**
 * Every stretch of black the file contains, as ffmpeg's own detector reports
 * it. A centre pixel is not a test for a black frame — a lit picture can have
 * a dark object in the middle of it, and one did.
 */
function blackRanges(file: string): string[] {
  const r = spawnSync('ffmpeg', ['-v', 'info', '-i', file,
    '-vf', 'blackdetect=d=0.04:pic_th=0.98:pix_th=0.10', '-f', 'null', '-']);
  return String(r.stderr ?? '').match(/black_start:[0-9.]+ black_end:[0-9.]+/g) ?? [];
}

describeLive('المخرج الآلي — من قرارٍ آليٍّ إلى فيلم', () => {
  it('decides a sequence for two pictures laid on top of each other, and the film obeys it', async () => {
    await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: process.env.AZMA_LIVE_EMAIL, password: process.env.AZMA_LIVE_PASSWORD }),
    });
    const vault = await api('/api/vault/assets');
    const assets = ((vault.body.assets ?? []) as VaultAsset[])
      .filter((a) => String(a.capabilityTarget) === 'VISUAL')
      .slice(0, 2);
    expect(assets).toHaveLength(2);

    // ── THE INPUT: a sequence no film could play ─────────────────────────
    const now = Date.now();
    const laid: SovereignCanvas = {
      canvasId: `canvas_auto_${now}`,
      subscriberTenantId: 'pending-server-verification',
      canvasType: CanvasType.CINEMATIC,
      title: 'المخرج الآلي',
      tracks: [{
        trackId: 'track-1', trackName: 'المسار الرئيسي', isMuted: false, isHidden: false,
        nodes: assets.map((a, i) => ({
          nodeId: `auto-${i}`,
          assetId: a.assetId,
          assetFamily: a.assetFamily,
          capabilityOrigin: a.capabilityTarget,
          isActive: true,
          isLocked: false,
          temporal: { globalStartTimeSeconds: 0, playDurationSeconds: 5 },
          spatial: { positionX: 0, positionY: 0, scaleX: 1, scaleY: 1, rotationDegrees: 0, zIndex: i },
        })),
      }],
      createdAt: now,
      updatedAt: now,
    } as unknown as SovereignCanvas;

    // ── THE DECISION: the chamber's own Director, untouched ──────────────
    const direction = decideMultiNodeCinematicDirection(
      assets.map((a, i) => ({ nodeId: `auto-${i}`, asset: a })),
    );
    const decided = direction.nodeDecisions.map((d) => ({
      nodeId: d.nodeId,
      start: d.decision.temporal?.globalStartTimeSeconds,
      dur: d.decision.temporal?.playDurationSeconds,
    }));
    // It must actually have moved something, or there is nothing to prove.
    expect(decided[1]!.start).toBeGreaterThan(0);

    // ── EXECUTED through the Assembly Runtime, as the chamber executes it ─
    const runtime = new AssemblyRuntime(new RasAlAmrStateManager());
    let canvas = laid;
    for (const nodeDecision of direction.nodeDecisions) {
      const temporal = nodeDecision.decision.temporal;
      if (!temporal) continue;
      canvas = runtime.execute(canvas, toDirectionDecision('automatic-director', {
        actionType: CanvasActionType.UPDATE_TEMPORAL,
        canvasId: canvas.canvasId,
        subscriberTenantId: canvas.subscriberTenantId,
        targetTrackId: 'track-1',
        targetNodeId: nodeDecision.nodeId,
        temporalUpdates: temporal,
      }));
    }
    const onCanvas = canvas.tracks.flatMap((t) => t.nodes)
      .map((n) => n.temporal?.globalStartTimeSeconds);
    expect(onCanvas).toEqual(decided.map((d) => d.start));

    // ── PRODUCED from that canvas, and measured against the decision ─────
    const started = await api('/api/ras-amr/render', { method: 'POST', body: JSON.stringify({ canvas }) });
    expect(started.status).toBe(202);
    const operationId = String(started.body.operationId);

    let fileUrl = '';
    for (let i = 0; i < 180; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const state = await api(`/api/ras-amr/render/${operationId}`);
      if (state.body.status === 'succeeded') { fileUrl = String(state.body.fileUrl); break; }
      if (state.body.status === 'failed') throw new Error(`render failed: ${JSON.stringify(state.body).slice(0, 200)}`);
    }
    expect(fileUrl).not.toBe('');

    const file = `${process.env.UPLOADS_DIR}/renders/${operationId}.mp4`;
    const boundary = decided[1]!.start as number;
    const total = (decided[1]!.start as number) + (decided[1]!.dur as number);

    expect(Math.abs(duration(file) - total)).toBeLessThanOrEqual(0.2);
    const before = pixelAt(file, Math.max(0.1, boundary - 0.5));
    const after = pixelAt(file, boundary + 0.5);
    // Two different pictures, each in the window the Director gave it.
    expect(before).not.toEqual(after);
    // And the film carries a picture throughout — no black anywhere in it.
    expect(blackRanges(file)).toEqual([]);

    // eslint-disable-next-line no-console
    console.log(`[automatic director] decision ${JSON.stringify(decided)} -> ${operationId}.mp4`
      + ` duration ${duration(file)}s, picture changes at ${boundary}s`);
  });
});
