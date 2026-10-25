/**
 * AZMA OS — رأس الأمر: رحلةُ الستوري بورد حتّى الفيلم.
 *
 * ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
 *
 *   The Chief Architect, 2026-10-25: «الاختبارات الوحدوية السابقة ليست بديلًا
 *   عن الرحلة الحية.» So this one walks the chamber's own storyboard road on a
 *   running chamber with the Creator's own assets: a project is made, saved,
 *   resumed, its scenes written, reordered and given assets, then handed to
 *   the production path and produced — and every scene in the file is traced
 *   back to the scene in the project that made it.
 *
 *   The hand-off is `storyboardToProductionCanvas`, the chamber's own, so no
 *   second render road is invented for the storyboard.
 *
 *   Nothing is generated and nothing is charged: the pictures are already the
 *   Creator's, and the encoder is local ffmpeg.
 *
 * ─── OPT-IN ─────────────────────────────────────────────────────────────────
 *
 *       AZMA_ALLOW_TEST_NETWORK=1 AZMA_LIVE_BASE=… AZMA_LIVE_EMAIL=… \
 *       AZMA_LIVE_PASSWORD=… UPLOADS_DIR=… npx jest storyboard-to-film
 */

import { spawnSync } from 'node:child_process';
import {
  addScene,
  attachAsset,
  createStoryboardProject,
  detachAsset,
  moveScene,
  readScenes,
  storyboardToProductionCanvas,
  updateScene,
} from '../storyboard';
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

/** The frame at an instant, reduced to an 8x8 thumbnail of its own colours. */
function thumbAt(file: string, t: number): number[] {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', file, '-frames:v', '1',
    '-vf', 'scale=8:8,format=rgb24', '-f', 'rawvideo', '-']);
  return [...(r.stdout as Buffer)];
}
/**
 * How far two frames are from each other, 0 to 255. Two frames of the SAME
 * still picture are not byte-identical once H.264 has had them, so sameness
 * is a distance, not an equality.
 */
function distance(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 255;
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i]! - b[i]!);
  return Math.round(sum / a.length);
}
const duration = (file: string) => Number(spawnSync('ffprobe',
  ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).stdout.toString().trim());

describeLive('الستوري بورد — من مشروعٍ إلى فيلم', () => {
  it('builds a project, resumes it, hands it to production, and the film carries its scenes in order', async () => {
    await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: process.env.AZMA_LIVE_EMAIL, password: process.env.AZMA_LIVE_PASSWORD }),
    });
    const vault = await api('/api/vault/assets');
    const pictures = ((vault.body.assets ?? []) as VaultAsset[])
      .filter((a) => String(a.capabilityTarget) === 'VISUAL').slice(0, 2);
    expect(pictures).toHaveLength(2);
    const vaultCountBefore = ((vault.body.assets ?? []) as VaultAsset[]).length;

    // ── ١ مشروعٌ جديد، لا يُخلَط بالمونتاج ────────────────────────────────
    let board = createStoryboardProject('رحلةُ قبولٍ مصوّرة', Date.now());
    expect(board.canvasId.startsWith('storyboard_')).toBe(true);

    // ── ٢ مشاهدُه، ثمّ ترتيبُها ───────────────────────────────────────────
    const first = addScene(board, { description: 'المشهد الأوّل', durationSeconds: 3 }, Date.now());
    board = first.canvas;
    const second = addScene(board, { description: 'المشهد الثاني', durationSeconds: 4 }, Date.now());
    board = second.canvas;
    board = updateScene(board, second.sceneId, { description: 'المشهد الثاني — مُحرَّر' }, Date.now());
    expect(readScenes(board).map((s) => s.description))
      .toEqual(['المشهد الأوّل', 'المشهد الثاني — مُحرَّر']);
    board = moveScene(board, second.sceneId, 'up', Date.now());
    expect(readScenes(board)[0]!.sceneId).toBe(second.sceneId);
    board = moveScene(board, second.sceneId, 'down', Date.now());

    // ── ٣ مشهدٌ بلا صورةٍ لا يُمرَّر على أنّه صالح ────────────────────────
    const incomplete = storyboardToProductionCanvas(board);
    expect(incomplete.tracks.flatMap((t) => t.nodes)).toHaveLength(0);

    // ── ٤ أصولُ المبدعِ تُربَط، ولا تُنسَخ ───────────────────────────────
    const ref = (a: VaultAsset) => ({ assetId: a.assetId, assetFamily: a.assetFamily, capabilityTarget: a.capabilityTarget });
    board = attachAsset(board, first.sceneId, ref(pictures[0]!), Date.now()).canvas;
    board = attachAsset(board, second.sceneId, ref(pictures[1]!), Date.now()).canvas;

    // ── ٥ الحفظُ والاستئناف، عبرَ مسارِ اللوحةِ نفسِه ────────────────────
    const saved = await api('/api/ras-amr/canvas', { method: 'POST', body: JSON.stringify({ canvas: board }) });
    expect(saved.status).toBe(200);
    // Resumed the way the chamber resumes: the saved projects are listed and
    // this one is found among them, rather than asked for by a path that does
    // not exist.
    const listed = await api('/api/ras-amr/canvas');
    expect(((listed.body.canvases ?? []) as { canvasId: string }[]).some((c) => c.canvasId === board.canvasId)).toBe(true);
    const resumedRes = await api(`/api/ras-amr/canvas/${encodeURIComponent(board.canvasId)}`);
    const resumed = (resumedRes.body.canvas ?? resumedRes.body) as SovereignCanvas;
    expect(resumed?.tracks).toBeTruthy();
    const resumedScenes = readScenes(resumed);
    expect(resumedScenes.map((s) => s.description))
      .toEqual(['المشهد الأوّل', 'المشهد الثاني — مُحرَّر']);
    expect(resumedScenes.map((s) => s.nodes.map((n) => n.assetId)))
      .toEqual([[pictures[0]!.assetId], [pictures[1]!.assetId]]);

    // ── ٦ حذفُ مشهدٍ لا يَمَسُّ الخزانة ──────────────────────────────────
    const trial = detachAsset(resumed, first.sceneId, readScenes(resumed)[0]!.nodes[0]!.nodeId, Date.now());
    expect(readScenes(trial)[0]!.nodes).toHaveLength(0);
    const vaultAfterDetach = await api('/api/vault/assets');
    expect(((vaultAfterDetach.body.assets ?? []) as VaultAsset[]).length).toBe(vaultCountBefore);

    // ── ٧ التسليمُ إلى الإنتاج، بمسارِ الحجرةِ نفسِه ────────────────────
    const production = storyboardToProductionCanvas(resumed);
    const placed = production.tracks.flatMap((t) => t.nodes).map((n) => ({
      assetId: n.assetId,
      start: n.temporal?.globalStartTimeSeconds,
      dur: n.temporal?.playDurationSeconds,
    }));
    expect(placed).toEqual([
      { assetId: pictures[0]!.assetId, start: 0, dur: 3 },
      { assetId: pictures[1]!.assetId, start: 3, dur: 4 },
    ]);

    // ── ٨ الفيلم ─────────────────────────────────────────────────────────
    const started = await api('/api/ras-amr/render', { method: 'POST', body: JSON.stringify({ canvas: production }) });
    expect(started.status).toBe(202);
    const operationId = String(started.body.operationId);
    let done = false;
    for (let i = 0; i < 180; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const state = await api(`/api/ras-amr/render/${operationId}`);
      if (state.body.status === 'succeeded') { done = true; break; }
      if (state.body.status === 'failed') throw new Error(`render failed: ${JSON.stringify(state.body).slice(0, 200)}`);
    }
    expect(done).toBe(true);

    // ── ٩ كلُّ مشهدٍ في الفيلمِ يُتتبَّع إلى مشهدِه في المشروع ──────────
    const file = `${process.env.UPLOADS_DIR}/renders/${operationId}.mp4`;
    expect(Math.abs(duration(file) - 7)).toBeLessThanOrEqual(0.2);
    const sceneOne = thumbAt(file, 0.4);
    const sceneTwo = thumbAt(file, 6.0);
    // Two different pictures, each holding its own window.
    expect(distance(sceneOne, sceneTwo)).toBeGreaterThan(20);
    expect(distance(thumbAt(file, 1.2), sceneOne)).toBeLessThan(8);
    expect(distance(thumbAt(file, 5.0), sceneTwo)).toBeLessThan(8);
    // And the join is a real dissolve, not a cut: the frame on the ramp
    // belongs to neither picture, because it is both. The storyboard asked
    // for a crossfade into the second scene, and the file has one.
    const ramp = [2.2, 2.4, 2.6, 2.8, 2.9].map((t) => {
      const f = thumbAt(file, t);
      return { t, toOne: distance(f, sceneOne), toTwo: distance(f, sceneTwo) };
    });
    const blended = ramp.filter((r) => r.toOne > 6 && r.toTwo > 6);
    // eslint-disable-next-line no-console
    console.log('[storyboard] the dissolve: ' + ramp.map((r) => `${r.t}s(${r.toOne}/${r.toTwo})`).join(' '));
    expect(blended.length).toBeGreaterThan(0);

    // eslint-disable-next-line no-console
    console.log(`[storyboard] ${board.canvasId} -> ${operationId}.mp4 `
      + `${duration(file)}s, scene one 0-3s, scene two 3-7s`);
  });
});
