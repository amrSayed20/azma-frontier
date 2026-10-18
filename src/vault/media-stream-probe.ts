/**
 * What a media file actually carries, read with ffprobe.
 *
 * A browser reports a file's MIME type from its extension: an audio-only
 * .webm (a microphone recording saved to disk) arrives as `video/webm`.
 * The Vault must file it by its streams, or every chamber that trusts the
 * capability treats a sound as a picture.
 */

import { spawnSync } from 'node:child_process';

export interface StreamKinds {
  readonly video: boolean;
  readonly audio: boolean;
}

/** The stream kinds in the file, or null when ffprobe is unavailable or cannot read it. */
export function probeStreamKinds(filePath: string): StreamKinds | null {
  if (typeof spawnSync !== 'function') return null;
  try {
    const result = spawnSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'stream=codec_type:stream_disposition=attached_pic', '-of', 'csv=p=0', filePath],
      { encoding: 'utf-8', timeout: 15000 },
    );
    if (result.status !== 0) return null;
    const rows = String(result.stdout ?? '').split('\n').map((row) => row.trim()).filter(Boolean);
    // An attached picture (cover art) is not a moving picture.
    const video = rows.some((row) => row.startsWith('video') && !row.endsWith(',1'));
    const audio = rows.some((row) => row.startsWith('audio'));
    return { video, audio };
  } catch {
    return null;
  }
}
