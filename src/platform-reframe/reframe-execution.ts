/**
 * AZMA OS — THE REFRAME ITSELF
 *
 * One asset, one rectangle, one file. `ffmpeg` is spawned with the SAME filter
 * string the cinematic encoder has been producing films with — `framingFilter`
 * — so a reframed asset is cropped by the rule the Empire already trusts, not
 * by a second one written here.
 *
 * ─── WHAT THIS DELIBERATELY IS NOT ──────────────────────────────────────────
 *
 *   It does not build a CompiledAssemblyGraph. Reframing one picture is not a
 *   film, and fabricating a one-node canvas to reuse the assembly path would
 *   have invented a scene the Creator never composed — a lie in the record for
 *   the sake of reusing a function.
 *
 *   It does not charge. It does not deposit. It does not decide. Those belong
 *   to the boundary that calls it, where the Creator's approval lives.
 */

import { spawn } from 'node:child_process';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { framingFilter } from '../orchestrator/fleet-materialization/fleet/adapters/cinematic-ffmpeg-encoder';
import { resolveAssetPath } from '../vault/asset-bytes';
import type { PlatformTarget } from './platform-target';

/** Where a reframed file is written — beside every other protected byte. */
function reframesDir(): string {
  const base = process.env.UPLOADS_DIR;
  return base ? join(base, 'generated-assets') : join(process.cwd(), 'public', 'generated-assets');
}

export type ReframeOutcome =
  | { readonly ok: true; readonly fileName: string; readonly storageUri: string }
  | { readonly ok: false; readonly reason: 'source-missing' | 'ffmpeg-failed'; readonly detail: string };

/** How long one reframe may take before it is abandoned. A crop is not a render. */
const REFRAME_TIMEOUT_MS = 120_000;

/**
 * Produce `asset` at `target`'s rectangle, preserving its aspect ratio.
 *
 * Still images become stills; video stays video. The output extension follows
 * the source so nothing is silently transcoded into a format the Creator did
 * not have: a PNG reframed is a PNG, and an MP4 reframed is an MP4.
 */
export async function reframeToTarget(
  secureStorageUri: string,
  target: PlatformTarget,
  operationId: string,
): Promise<ReframeOutcome> {
  const sourcePath = resolveAssetPath(secureStorageUri);
  if (!existsSync(sourcePath)) {
    return { ok: false, reason: 'source-missing', detail: 'the asset\'s bytes are not on this host' };
  }

  const dot = secureStorageUri.lastIndexOf('.');
  const ext = dot >= 0 ? secureStorageUri.slice(dot).toLowerCase() : '.png';
  const fileName = `${operationId}${ext}`;
  mkdirSync(reframesDir(), { recursive: true });
  const outPath = join(reframesDir(), fileName);

  const args = [
    '-y',
    '-i', sourcePath,
    '-vf', framingFilter(target.width, target.height, 'cover'),
    // An even pixel count is required by H.264; harmless for stills.
    '-pix_fmt', 'yuv420p',
    outPath,
  ];

  return new Promise<ReframeOutcome>((resolve) => {
    const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stderr = '';
    const timer = setTimeout(() => { proc.kill('SIGKILL'); }, REFRAME_TIMEOUT_MS);

    proc.stderr.on('data', (c: Buffer) => {
      stderr += c.toString();
      if (stderr.length > 20000) stderr = stderr.slice(-20000);
    });
    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ ok: false, reason: 'ffmpeg-failed', detail: err.message });
    });
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code === 0 && existsSync(outPath)) {
        resolve({ ok: true, fileName, storageUri: `/generated-assets/${fileName}` });
      } else {
        resolve({
          ok: false,
          reason: 'ffmpeg-failed',
          detail: `ffmpeg exited ${code ?? 'null'}: ${stderr.slice(-800)}`,
        });
      }
    });
  });
}
