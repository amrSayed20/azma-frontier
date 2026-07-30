/**
 * MINISTRY V — SOVEREIGN SUBTITLE SYSTEM: proves the pure parse functions
 * (parseSrt, parseVtt) correctly produce SubtitleCue arrays from real
 * subtitle file content — multi-line text, optional VTT cue IDs, NOTE/
 * STYLE/REGION block skipping. No runtime, no I/O, no mocks needed.
 */

import { parseSrt, parseVtt } from '../subtitle-parser';

describe('Ministry V — parseSrt', () => {
  it('parses a minimal two-cue SRT file into two SubtitleCues with correct timings and text', () => {
    const srt = `
1
00:00:01,000 --> 00:00:04,000
Hello, world.

2
00:00:05,500 --> 00:00:08,250
This is the second line.
`.trim();

    const cues = parseSrt(srt);

    expect(cues).toHaveLength(2);
    expect(cues[0].startSeconds).toBeCloseTo(1.0);
    expect(cues[0].endSeconds).toBeCloseTo(4.0);
    expect(cues[0].text).toBe('Hello, world.');
    expect(cues[1].startSeconds).toBeCloseTo(5.5);
    expect(cues[1].endSeconds).toBeCloseTo(8.25);
    expect(cues[1].text).toBe('This is the second line.');
  });

  it('assigns a unique, non-empty cueId to each cue', () => {
    const srt = `1\n00:00:01,000 --> 00:00:02,000\nA\n\n2\n00:00:03,000 --> 00:00:04,000\nB`;
    const cues = parseSrt(srt);
    expect(cues[0].cueId.length).toBeGreaterThan(0);
    expect(cues[1].cueId.length).toBeGreaterThan(0);
    expect(cues[0].cueId).not.toBe(cues[1].cueId);
  });

  it('handles multi-line cue text correctly, joining with newline', () => {
    const srt = `1\n00:00:01,000 --> 00:00:05,000\nLine one.\nLine two.\nLine three.`;
    const cues = parseSrt(srt);
    expect(cues).toHaveLength(1);
    expect(cues[0].text).toBe('Line one.\nLine two.\nLine three.');
  });

  it('silently skips blocks with endSeconds <= startSeconds rather than producing an invalid cue', () => {
    const srt = `1\n00:00:05,000 --> 00:00:01,000\nBackwards.\n\n2\n00:00:02,000 --> 00:00:04,000\nGood.`;
    const cues = parseSrt(srt);
    expect(cues).toHaveLength(1);
    expect(cues[0].text).toBe('Good.');
  });

  it('returns an empty array for an empty string', () => {
    expect(parseSrt('')).toEqual([]);
  });

  it('handles hours-level timestamps correctly (HH:MM:SS,mmm)', () => {
    const srt = `1\n01:02:03,456 --> 01:02:07,000\nLate in the timeline.`;
    const cues = parseSrt(srt);
    expect(cues[0].startSeconds).toBeCloseTo(1 * 3600 + 2 * 60 + 3.456);
    expect(cues[0].endSeconds).toBeCloseTo(1 * 3600 + 2 * 60 + 7.0);
  });
});

describe('Ministry V — parseVtt', () => {
  it('parses a minimal WebVTT file with two cues', () => {
    const vtt = `WEBVTT

00:00:01.000 --> 00:00:04.000
Hello from VTT.

00:00:05.500 --> 00:00:08.250
Second VTT cue.`;

    const cues = parseVtt(vtt);

    expect(cues).toHaveLength(2);
    expect(cues[0].startSeconds).toBeCloseTo(1.0);
    expect(cues[0].endSeconds).toBeCloseTo(4.0);
    expect(cues[0].text).toBe('Hello from VTT.');
    expect(cues[1].startSeconds).toBeCloseTo(5.5);
    expect(cues[1].endSeconds).toBeCloseTo(8.25);
  });

  it('skips NOTE blocks and STYLE blocks, producing only cue content', () => {
    const vtt = `WEBVTT

NOTE This is a comment about the file.

STYLE
::cue {
  color: white;
}

00:00:01.000 --> 00:00:03.000
Real cue after metadata.`;

    const cues = parseVtt(vtt);
    expect(cues).toHaveLength(1);
    expect(cues[0].text).toBe('Real cue after metadata.');
  });

  it('handles optional cue identifiers (line before timestamp)', () => {
    const vtt = `WEBVTT

intro
00:00:01.000 --> 00:00:04.000
Identified cue.

00:00:05.000 --> 00:00:07.000
Unidentified cue.`;

    const cues = parseVtt(vtt);
    expect(cues).toHaveLength(2);
    expect(cues[0].text).toBe('Identified cue.');
    expect(cues[1].text).toBe('Unidentified cue.');
  });

  it('ignores cue settings after the timestamps (e.g., align:start line:0%)', () => {
    const vtt = `WEBVTT

00:00:01.000 --> 00:00:04.000 align:start line:0%
Cue with settings.`;

    const cues = parseVtt(vtt);
    expect(cues).toHaveLength(1);
    expect(cues[0].startSeconds).toBeCloseTo(1.0);
    expect(cues[0].text).toBe('Cue with settings.');
  });

  it('throws a clear error when content does not start with WEBVTT', () => {
    expect(() => parseVtt('Not a VTT file\n\n00:00:01.000 --> 00:00:02.000\nText')).toThrow(/WEBVTT/);
  });

  it('returns an empty array for a file with only the WEBVTT header', () => {
    expect(parseVtt('WEBVTT\n')).toEqual([]);
  });

  it('assigns unique cueIds to each parsed cue', () => {
    const vtt = `WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nA\n\n00:00:03.000 --> 00:00:04.000\nB`;
    const cues = parseVtt(vtt);
    expect(cues[0].cueId).not.toBe(cues[1].cueId);
  });
});
