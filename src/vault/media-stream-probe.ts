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

/**
 * ─── HOW LONG THE FILE ACTUALLY IS ──────────────────────────────────────────
 *
 *   Measured, never claimed. The Founder's ruling of 2026-11-02 charges the
 *   final export «وفق مدة الفيديو النهائي الفعلية بالثواني، وليس وفق مدة
 *   تخمينية يرسلها العميل» — so the settlement needs the file's own duration,
 *   read from the file by the same instrument that reads its streams.
 *
 *   `format=duration` is the container's figure for the whole file, which is
 *   what a Creator watches and what they are charged for. A stream's own
 *   duration can differ (an audio track that outruns the picture), and the
 *   container's is the honest one for a film.
 *
 *   Returns null — never 0 — when ffprobe is absent, fails, or reports
 *   something unusable. A missing measurement is an absence, and the caller
 *   must treat it as one: an instrument returning nothing is not returning a
 *   zero.
 */
export function probeDurationSeconds(filePath: string): number | null {
  if (typeof spawnSync !== 'function') return null;
  try {
    const result = spawnSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', filePath],
      { encoding: 'utf-8', timeout: 15000 },
    );
    if (result.status !== 0) return null;
    const seconds = Number.parseFloat(String(result.stdout ?? '').trim());
    if (!Number.isFinite(seconds) || seconds <= 0) return null;
    return seconds;
  } catch {
    return null;
  }
}
