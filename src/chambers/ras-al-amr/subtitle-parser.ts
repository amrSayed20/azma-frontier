/**
 * AZMA OS — RAS AL AMR: MINISTRY V — SOVEREIGN SUBTITLE SYSTEM
 * The Subtitle Parser.
 *
 * Pure parse functions — no runtime, no I/O, no state. Used by the
 * import-subtitles API route to convert uploaded SRT/VTT content into
 * SubtitleCue arrays that the caller can wrap in a SubtitleDirective and
 * apply to a Direction Node via UPDATE_ADVANCED_DIRECTIVE('subtitles').
 *
 * Handles the real-world cases in both formats:
 * - SRT: sequence number, HH:MM:SS,mmm timestamps, multi-line text
 * - VTT: WEBVTT header, optional cue identifiers, NOTE/STYLE/REGION blocks
 *   skipped, HH:MM:SS.mmm or MM:SS.mmm timestamps, optional cue settings
 *   after the arrow (ignored — we only need start/end times)
 */

import type { SubtitleCue } from './subtitle-directive';

const TIMESTAMP_ARROW = /(\d{1,2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{1,2}:\d{2}:\d{2}[.,]\d{3})/;

function parseTimestamp(ts: string): number {
  const normalized = ts.trim().replace(',', '.');
  const parts = normalized.split(':');
  if (parts.length === 3) {
    return parseInt(parts[0], 10) * 3600 + parseInt(parts[1], 10) * 60 + parseFloat(parts[2]);
  }
  if (parts.length === 2) {
    return parseInt(parts[0], 10) * 60 + parseFloat(parts[1]);
  }
  throw new Error(`Invalid subtitle timestamp: "${ts}"`);
}

function makeCueId(index: number): string {
  return `cue_${index}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Parses SRT (SubRip Text) subtitle content into SubtitleCue[].
 * Blocks are separated by blank lines; each block has the form:
 *   [sequence number]
 *   [HH:MM:SS,mmm --> HH:MM:SS,mmm]
 *   [text line(s)...]
 *
 * Blocks without a recognisable timestamp line are silently skipped.
 */
export function parseSrt(content: string): SubtitleCue[] {
  const blocks = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split(/\n{2,}/);
  const cues: SubtitleCue[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    // Skip the sequence number line (first line); timestamp is the next
    // line that matches the arrow pattern.
    let timestampLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (TIMESTAMP_ARROW.test(lines[i])) {
        timestampLineIndex = i;
        break;
      }
    }
    if (timestampLineIndex === -1) continue;

    const match = TIMESTAMP_ARROW.exec(lines[timestampLineIndex])!;
    const startSeconds = parseTimestamp(match[1]);
    const endSeconds = parseTimestamp(match[2]);
    if (endSeconds <= startSeconds) continue;

    const text = lines.slice(timestampLineIndex + 1).join('\n').trim();
    if (!text) continue;

    cues.push({ cueId: makeCueId(cues.length), startSeconds, endSeconds, text });
  }

  return cues;
}

/**
 * Parses WebVTT subtitle content into SubtitleCue[].
 * Expects the file to start with "WEBVTT". NOTE, STYLE, and REGION blocks
 * are skipped. Optional cue identifiers (lines before the timestamp line)
 * are consumed but not stored — cueId is generated independently.
 * Cue settings after the timestamps (e.g., `align:start`) are ignored.
 */
export function parseVtt(content: string): SubtitleCue[] {
  const normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  if (!normalized.trimStart().startsWith('WEBVTT')) {
    throw new Error('File does not begin with "WEBVTT" — not a valid WebVTT file.');
  }

  const blocks = normalized.split(/\n{2,}/);
  const cues: SubtitleCue[] = [];

  for (const block of blocks) {
    const lines = block.trim().split('\n');
    if (!lines.length) continue;

    // Skip the header block and blocks that are NOTE/STYLE/REGION metadata.
    const firstLine = lines[0].trim();
    if (
      firstLine.startsWith('WEBVTT') ||
      firstLine.startsWith('NOTE') ||
      firstLine.startsWith('STYLE') ||
      firstLine.startsWith('REGION')
    ) {
      continue;
    }

    // The timestamp line may be the first line (no cue identifier) or the
    // second line (first line is a cue identifier).
    let timestampLineIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      if (TIMESTAMP_ARROW.test(lines[i])) {
        timestampLineIndex = i;
        break;
      }
    }
    if (timestampLineIndex === -1) continue;

    const match = TIMESTAMP_ARROW.exec(lines[timestampLineIndex])!;
    const startSeconds = parseTimestamp(match[1]);
    const endSeconds = parseTimestamp(match[2]);
    if (endSeconds <= startSeconds) continue;

    const text = lines.slice(timestampLineIndex + 1).join('\n').trim();
    if (!text) continue;

    cues.push({ cueId: makeCueId(cues.length), startSeconds, endSeconds, text });
  }

  return cues;
}
