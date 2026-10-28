/**
 * AZMA OS — «رحلةُ البحثِ عن الحقيقة»: فيلمٌ من ستوري بوردٍ كَتَبَه بحثٌ حقيقيّ.
 *
 * The three scenes were written by الحُجّة الدامغة from a real investigation,
 * and their three pictures were commissioned through القيامة's own generation
 * route and already lie in the Vault. This assembles them with the chamber's
 * own storyboard functions, hands them over with its own single conversion to
 * a production canvas, and renders them with the very function the chamber's
 * route calls — startRasAlAmrRender — so no second production road is built.
 * Then it measures the film that comes out.
 *
 * Nothing here spends: the pictures exist and the encoder is local ffmpeg.
 *
 *     AZMA_ALLOW_TEST_NETWORK=1 AZMA_DB_PATH=… UPLOADS_DIR=… \
 *     AZMA_OWNER_ID=… AZMA_SCENE_ASSETS=a,b,c AZMA_PROOF_DIR=… \
 *     npx jest truth-journey-film
 */

import { spawnSync } from 'node:child_process';
import { copyFileSync, statSync, writeFileSync } from 'node:fs';
import {
  addScene,
  attachAsset,
  createStoryboardProject,
  readScenes,
  storyboardToProductionCanvas,
} from '../storyboard';
import { SovereignVaultManager } from '../../../vault/sovereign-vault-manager';
import {
  getRasAlAmrRenderStatus,
  resolveRasAlAmrRenderFile,
  startRasAlAmrRender,
} from '../../../sovereign-entry/ras-al-amr-render';

const OWNER = process.env.AZMA_OWNER_ID;
const live = process.env.AZMA_ALLOW_TEST_NETWORK === '1'
  && Boolean(OWNER) && Boolean(process.env.AZMA_SCENE_ASSETS) && Boolean(process.env.AZMA_PROOF_DIR);
const describeLive = live ? describe : describe.skip;
jest.setTimeout(900_000);

const thumbAt = (file: string, t: number): number[] => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', file, '-frames:v', '1',
    '-vf', 'scale=8:8,format=rgb24', '-f', 'rawvideo', '-']);
  return [...(r.stdout as Buffer)];
};
const distance = (a: number[], b: number[]): number => {
  if (a.length === 0 || a.length !== b.length) return 255;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i]! - b[i]!);
  return Math.round(s / a.length);
};
const meanLuma = (frame: number[]): number => {
  if (frame.length === 0) return -1;
  let s = 0;
  for (let i = 0; i + 2 < frame.length; i += 3) {
    s += 0.299 * frame[i]! + 0.587 * frame[i + 1]! + 0.114 * frame[i + 2]!;
  }
  return Math.round(s / (frame.length / 3));
};
const probe = (file: string, entries: string) => spawnSync('ffprobe',
  ['-v', 'error', '-show_entries', entries, '-of', 'csv=p=0', file]).stdout.toString().trim();
const blackRanges = (file: string): string[] => {
  const r = spawnSync('ffmpeg', ['-v', 'info', '-i', file,
    '-vf', 'blackdetect=d=0.04:pic_th=0.98:pix_th=0.10', '-f', 'null', '-']);
  return String(r.stderr ?? '').match(/black_start:[0-9.]+ black_end:[0-9.]+/g) ?? [];
};

describeLive('رحلةُ البحثِ عن الحقيقة — من البحثِ إلى الفيلم', () => {
  it('assembles three commissioned pictures into one film that carries them in order', async () => {
    const wanted = String(process.env.AZMA_SCENE_ASSETS).split(',').map((s) => s.trim());
    const vault = new SovereignVaultManager();
    const owned = await vault.listAssetsForTenant(OWNER!);
    const chosen = wanted.map((id) => owned.find((a) => a.assetId === id));
    expect(chosen.filter(Boolean)).toHaveLength(3);

    // ── the storyboard, built with the chamber's own functions ───────────
    let board = createStoryboardProject('رحلةُ البحثِ عن الحقيقة', Date.now());
    const titles = ['بدءُ البحث', 'فحصُ الدليل', 'الخلاصة'];
    chosen.forEach((asset, i) => {
      const added = addScene(board, { title: titles[i], description: titles[i], durationSeconds: 4 }, Date.now());
      board = attachAsset(added.canvas, added.sceneId, {
        assetId: asset!.assetId, assetFamily: asset!.assetFamily, capabilityTarget: asset!.capabilityTarget,
      }, Date.now()).canvas;
    });
    expect(readScenes(board)).toHaveLength(3);

    // ── the chamber's own single hand-off to production ──────────────────
    const production = { ...storyboardToProductionCanvas(board), subscriberTenantId: OWNER! };
    const placed = production.tracks.flatMap((t) => t.nodes).map((n) => ({
      assetId: n.assetId,
      start: n.temporal?.globalStartTimeSeconds,
      dur: n.temporal?.playDurationSeconds,
      trans: n.temporal?.transitionInType ?? 'cut',
    }));
    expect(placed.map((x) => x.start)).toEqual([0, 4, 8]);
    expect(placed.map((x) => x.assetId)).toEqual(wanted);

    // ── the very function the chamber's own route calls ──────────────────
    const { operationId, compiled } = await startRasAlAmrRender(production, OWNER!);
    let last = '';
    let done = false;
    for (let i = 0; i < 240; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const state = await getRasAlAmrRenderStatus(operationId, OWNER!);
      last = JSON.stringify(state).slice(0, 240);
      if (state.status === 'succeeded') { done = true; break; }
      if (state.status === 'failed') throw new Error(`render failed: ${last}`);
    }
    expect(done).toBe(true);

    // ── the film, resolved exactly as the Creator's own door resolves it ─
    const onDisk = await resolveRasAlAmrRenderFile(operationId, OWNER!);
    const file = `${process.env.AZMA_PROOF_DIR}/truth-journey.mp4`;
    copyFileSync(onDisk, file);

    const total = Number(probe(file, 'format=duration'));
    const streams = probe(file, 'stream=codec_name,width,height,r_frame_rate');
    const frames = [1.0, 6.0, 11.0].map((t) => thumbAt(file, t));
    const lumas = frames.map(meanLuma);
    const ranges = blackRanges(file);

    expect(Math.abs(total - 12)).toBeLessThanOrEqual(0.2);
    expect(ranges).toEqual([]);
    // Each scene's window carries light, not a placeholder void.
    lumas.forEach((l) => expect(l).toBeGreaterThan(12));
    // Three different pictures, each in the window its scene was given.
    expect(distance(frames[0]!, frames[1]!)).toBeGreaterThan(15);
    expect(distance(frames[1]!, frames[2]!)).toBeGreaterThan(15);
    expect(distance(frames[0]!, frames[2]!)).toBeGreaterThan(15);

    // The frames themselves, for the Founder's own eye.
    [1.0, 6.0, 11.0].forEach((t, i) => {
      spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', file, '-frames:v', '1',
        `${process.env.AZMA_PROOF_DIR}/film-scene-${i + 1}.png`]);
    });

    writeFileSync(`${process.env.AZMA_PROOF_DIR}/truth-journey.json`, JSON.stringify({
      storyboardId: board.canvasId,
      scenes: readScenes(board).map((s) => ({
        sceneId: s.sceneId, title: s.title, seconds: s.durationSeconds,
        transitionIn: s.transitionIn, nodes: s.nodes.length,
      })),
      placed,
      compiledNodes: compiled.metadata.totalNodes,
      compiledEstimateSeconds: compiled.metadata.estimatedDurationSeconds ?? null,
      operationId,
      onDisk,
      bytes: statSync(file).size,
      duration: total,
      streams,
      blackRanges: ranges,
      sceneMeanLuma: lumas,
      sceneDistances: {
        s1s2: distance(frames[0]!, frames[1]!),
        s2s3: distance(frames[1]!, frames[2]!),
        s1s3: distance(frames[0]!, frames[2]!),
      },
      finalStatus: last,
    }, null, 1), 'utf8');
    // eslint-disable-next-line no-console
    console.log(`[truth journey] ${board.canvasId} -> ${operationId} · ${total}s · ${statSync(file).size}B`
      + ` · luma ${lumas.join('/')} · black ${ranges.length}`);
  });
});
