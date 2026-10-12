/**
 * AZMA OS — HOW MANY FRAMES A SECOND OF THIS ASSET ACTUALLY HAS
 *
 * ─── WHY THE EMPIRE MEASURES THIS ITSELF ────────────────────────────────────
 *
 *   Two of the ten acts are billed PER FRAME — measured on 2026-10-12, when a
 *   one-second segment of a 25fps clip was charged 25 credits and a
 *   three-second segment 75. So the charge is the frame count, and the frame
 *   count belongs to the Creator's own file.
 *
 *   The Vault does not record it. The browser must not be asked for it: a
 *   price the client supplies an input to is a price a client can move.
 *
 *   So the server reads it off the file, with the same tool the Empire's own
 *   encoder already runs. A file it cannot read returns null — and a null is
 *   an honest refusal to price, never a default of 24 or 30.
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import { resolveAssetPath } from './asset-bytes';

const run = promisify(execFile);

/** Parsed from `r_frame_rate`, which ffprobe gives as a rational like «25/1». */
function parseRational(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const [num, den] = trimmed.split('/');
  const n = Number(num);
  const d = den === undefined ? 1 : Number(den);
  if (!Number.isFinite(n) || !Number.isFinite(d) || d === 0) return null;
  const fps = n / d;
  // A plausibility bound, not a guess: outside it, the file is telling us
  // something we should not price from.
  return fps > 0 && fps <= 240 ? fps : null;
}

/**
 * The asset's own frame rate, or null when it cannot be read.
 *
 * Never throws: a Creator whose file cannot be probed must be told «we cannot
 * price this», not shown a crash. The caller decides what to do with null, and
 * every caller in this Empire refuses rather than assumes.
 */
export async function measureSourceFps(secureStorageUri: string): Promise<number | null> {
  try {
    const path = resolveAssetPath(secureStorageUri);
    const { stdout } = await run('ffprobe', [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=r_frame_rate',
      '-of', 'default=noprint_wrappers=1:nokey=1',
      path,
    ], { timeout: 15_000 });
    return parseRational(String(stdout));
  } catch {
    return null;
  }
}
