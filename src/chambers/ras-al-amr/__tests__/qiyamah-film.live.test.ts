/**
 * AZMA OS — «حجرة القيامة: من الفكرة إلى الأصل الإبداعيّ السياديّ»
 *
 * The five-scene demand is already written and each scene already holds the
 * picture it shows. This lays those five on the chamber's own timeline, two
 * seconds each, lays the Creator's Egyptian narration underneath them, and
 * hands the whole to startRasAlAmrRender — the same function the chamber's
 * own render route calls.
 *
 * Cuts, not dissolves: at two seconds a shot, a half-second blend would eat a
 * quarter of every scene. The film is measured afterwards, not assumed.
 *
 *     AZMA_ALLOW_TEST_NETWORK=1 AZMA_DB_PATH=… UPLOADS_DIR=… \
 *     AZMA_OWNER_ID=… AZMA_PROOF_DIR=… npx jest qiyamah-film
 */

import { spawnSync } from 'node:child_process';
import { copyFileSync, statSync, writeFileSync } from 'node:fs';
import { CanvasType } from '../assembly-contracts';
import type { AssemblyNode, SovereignCanvas } from '../assembly-contracts';
import { SovereignVaultManager } from '../../../vault/sovereign-vault-manager';
import {
  getRasAlAmrRenderStatus,
  resolveRasAlAmrRenderFile,
  startRasAlAmrRender,
} from '../../../sovereign-entry/ras-al-amr-render';

const OWNER = process.env.AZMA_OWNER_ID;
const live = process.env.AZMA_ALLOW_TEST_NETWORK === '1' && Boolean(OWNER) && Boolean(process.env.AZMA_PROOF_DIR);
const describeLive = live ? describe : describe.skip;
jest.setTimeout(900_000);

const SHOT_SECONDS = 2;
const VISUALS = [
  'asset_1793051233463_zssae8s', // النيّة الإبداعيّة — مولَّدة
  'asset_1793073666350_lqbab9d', // التخطيط — لقطة رأس الأمر، مؤطَّرة
  'asset_1793073683020_bd2ed2o', // اختيار الأصول — لقطة القصر السياديّ، مؤطَّرة
  'asset_1793073678636_tl7348f', // الإنشاء والتركيب — لقطة القيامة، مؤطَّرة
  'asset_1793051250578_zknrr4v', // الناتج السياديّ — مولَّدة
];
const NARRATION = 'asset_1793051706709_tfotqq4';

/**
 * A thumbnail big enough to keep this product's own evidence.
 *
 * MEASURED on this very film: at 8x8 the three chamber screens average down to
 * near-black and read as 1 level apart, though they are plainly three
 * different screens. At 160x90 the same three stand 8 to 10 levels apart and
 * the photographs stand 16 to 27 apart. So the thumbnail is 160x90 and the
 * floor is 5 — above the 1 that a blind instrument reported, below the 8 that
 * the closest honest pair actually measures.
 */
const frame = (file: string, t: number): number[] => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', file, '-frames:v', '1',
    '-vf', 'format=gray,scale=160:90', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 });
  return [...(r.stdout as Buffer)];
};
const distance = (a: number[], b: number[]): number => {
  if (a.length === 0 || a.length !== b.length) return 255;
  let s = 0;
  for (let i = 0; i < a.length; i++) s += Math.abs(a[i]! - b[i]!);
  return Math.round(s / a.length);
};
const luma = (f: number[]): number => {
  if (f.length === 0) return -1;
  let s = 0;
  for (const v of f) s += v;
  return Math.round(s / f.length);
};
const probe = (file: string, entries: string) => spawnSync('ffprobe',
  ['-v', 'error', '-show_entries', entries, '-of', 'csv=p=0', file]).stdout.toString().trim();
const ffmpegErr = (args: string[]) => String(spawnSync('ffmpeg', args).stderr ?? '');

describeLive('حجرة القيامة — فيلمُ عشرِ ثوانٍ', () => {
  it('lays five owned pictures and one narration into a ten-second film', async () => {
    const vault = new SovereignVaultManager();
    const owned = await vault.listAssetsForTenant(OWNER!);
    const byId = new Map(owned.map((a) => [a.assetId, a]));
    [...VISUALS, NARRATION].forEach((id) => expect(byId.has(id)).toBe(true));

    const nodes: AssemblyNode[] = VISUALS.map((assetId, i) => {
      const a = byId.get(assetId)!;
      return {
        nodeId: `shot_${i + 1}`,
        assetId,
        assetFamily: a.assetFamily,
        capabilityOrigin: a.capabilityTarget,
        temporal: { globalStartTimeSeconds: i * SHOT_SECONDS, playDurationSeconds: SHOT_SECONDS },
        spatial: { zIndex: 0, scaleX: 1, scaleY: 1, positionX: 0, positionY: 0, rotationDegrees: 0 },
      };
    });
    const voice = byId.get(NARRATION)!;
    const voiceSeconds = Number(probe(
      `${process.env.UPLOADS_DIR}${voice.secureStorageUri.replace(/^\/uploads/, '')}`, 'format=duration',
    ));
    nodes.push({
      nodeId: 'narration',
      assetId: NARRATION,
      assetFamily: voice.assetFamily,
      capabilityOrigin: voice.capabilityTarget,
      // The narration runs from the first frame and is never cut: it is shorter
      // than the film, and the last shot holds after the last word.
      temporal: { globalStartTimeSeconds: 0, playDurationSeconds: voiceSeconds },
    });

    const canvas: SovereignCanvas = {
      canvasId: `canvas_qiyamah_gate_${Date.now()}`,
      subscriberTenantId: OWNER!,
      canvasType: CanvasType.CINEMATIC,
      title: 'حجرة القيامة: من الفكرة إلى الأصل الإبداعيّ السياديّ',
      tracks: [{ trackId: 'track-1', trackName: 'المسار الرئيسي', isMuted: false, isHidden: false, nodes }],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const { operationId, compiled } = await startRasAlAmrRender(canvas, OWNER!, { creatorRole: 'founder', clientOperationKey: null });
    let last = '';
    let done = false;
    for (let i = 0; i < 300; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const state = await getRasAlAmrRenderStatus(operationId, OWNER!);
      last = JSON.stringify(state).slice(0, 260);
      if (state.status === 'succeeded') { done = true; break; }
      if (state.status === 'failed') throw new Error(`render failed: ${last}`);
    }
    expect(done).toBe(true);

    const onDisk = await resolveRasAlAmrRenderFile(operationId, OWNER!);
    const file = `${process.env.AZMA_PROOF_DIR}/qiyamah-film.mp4`;
    copyFileSync(onDisk, file);

    // ── الصورة ───────────────────────────────────────────────────────────
    const total = Number(probe(file, 'format=duration'));
    const streams = probe(file, 'stream=codec_type,codec_name,width,height,r_frame_rate');
    const mids = [1, 3, 5, 7, 9].map((t) => frame(file, t));
    const lumas = mids.map(luma);
    // ── WHY THE THRESHOLD IS 0.02 AND NOT THE USUAL 0.10 ─────────────────
    //   MEASURED here: this Empire's own screens are a black ground carrying
    //   thin amber type, so at the customary pix_th=0.10 a faithful photograph
    //   of a working chamber is reported as a black frame. That reading is the
    //   instrument's, not the film's. A true void is what must be caught, so
    //   the floor is dropped to 5/255 — which a black frame still fails and a
    //   dark interface does not. The frames are then asked, separately, to
    //   prove they carry something a reader can see.
    const blacks = ffmpegErr(['-v', 'info', '-i', file,
      '-vf', 'blackdetect=d=0.04:pic_th=0.98:pix_th=0.02', '-f', 'null', '-'])
      .match(/black_start:[0-9.]+ black_end:[0-9.]+/g) ?? [];
    //   Read at the frame's own resolution: a downscale averages the thin
    //   strokes of this interface away, and would report a legible screen as
    //   a dim one. What is asked of every shot is that some of it is lit and
    //   that something in it is bright.
    const legibility = [1, 3, 5, 7, 9].map((t) => {
      const raw = spawnSync('ffmpeg', ['-v', 'error', '-ss', String(t), '-i', file, '-frames:v', '1',
        '-vf', 'format=gray', '-f', 'rawvideo', '-'], { maxBuffer: 1 << 26 }).stdout as Buffer;
      let lit = 0;
      let peak = 0;
      for (const v of raw) { if (v > 40) lit++; if (v > peak) peak = v; }
      return { litPercent: Math.round(1000 * lit / raw.length) / 10, peak };
    });

    expect(Math.abs(total - 10)).toBeLessThanOrEqual(0.05);
    expect(blacks).toEqual([]);
    // Every shot carries visible content: lit pixels, and a real highlight.
    legibility.forEach((g) => {
      expect(g.litPercent).toBeGreaterThan(1);
      expect(g.peak).toBeGreaterThan(150);
    });
    // Five shots, each measurably different from every other one.
    const pairs: Record<string, number> = {};
    for (let i = 0; i < mids.length; i++) {
      for (let j = i + 1; j < mids.length; j++) {
        const d = distance(mids[i]!, mids[j]!);
        pairs[`${i + 1}-${j + 1}`] = d;
        expect(d).toBeGreaterThan(5);
      }
    }

    // ── الصوت ────────────────────────────────────────────────────────────
    const vol = ffmpegErr(['-v', 'info', '-i', file, '-af', 'volumedetect', '-f', 'null', '-']);
    const mean = Number((vol.match(/mean_volume:\s*(-?[0-9.]+)/) ?? [])[1] ?? '0');
    const peak = Number((vol.match(/max_volume:\s*(-?[0-9.]+)/) ?? [])[1] ?? '0');
    const gaps = (ffmpegErr(['-v', 'info', '-i', file, '-af', 'silencedetect=n=-40dB:d=0.3', '-f', 'null', '-'])
      .match(/silence_start:\s*[0-9.]+/g) ?? []);
    // Audible speech, not an encoder's silent filler.
    expect(mean).toBeLessThan(-5);
    expect(mean).toBeGreaterThan(-45);
    expect(peak).toBeGreaterThan(-12);
    // Every second of the narration's own span carries sound.
    const perSecond: number[] = [];
    for (let t = 0; t < 9; t++) {
      const w = ffmpegErr(['-v', 'info', '-ss', String(t), '-t', '1', '-i', file, '-af', 'volumedetect', '-f', 'null', '-']);
      perSecond.push(Number((w.match(/mean_volume:\s*(-?[0-9.]+)/) ?? [])[1] ?? '-99'));
    }
    perSecond.forEach((v) => expect(v).toBeGreaterThan(-45));

    writeFileSync(`${process.env.AZMA_PROOF_DIR}/film-proof.json`, JSON.stringify({
      canvasId: canvas.canvasId, operationId, onDisk,
      compiledNodes: compiled.metadata.totalNodes,
      compiledEstimateSeconds: compiled.metadata.estimatedDurationSeconds ?? null,
      bytes: statSync(file).size, duration: total, streams,
      shots: VISUALS.map((a, i) => ({ shot: i + 1, assetId: a, startSeconds: i * SHOT_SECONDS, seconds: SHOT_SECONDS })),
      narration: { assetId: NARRATION, seconds: voiceSeconds },
      sceneLuma: lumas, shotLegibility: legibility, shotDistances: pairs, blackRanges: blacks,
      audio: { meanDb: mean, peakDb: peak, gapsOver300ms: gaps.length, perSecondDb: perSecond },
      finalStatus: last,
    }, null, 1), 'utf8');

    [1, 3, 5, 7, 9].forEach((t, i) => {
      spawnSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(t), '-i', file, '-frames:v', '1',
        `${process.env.AZMA_PROOF_DIR}/film-shot-${i + 1}.png`]);
    });
    // eslint-disable-next-line no-console
    console.log(`[qiyamah film] ${operationId} · ${total}s · ${statSync(file).size}B · audio mean ${mean}dB peak ${peak}dB`
      + ` · luma ${lumas.join('/')} · black ${blacks.length}`);
  });
});
