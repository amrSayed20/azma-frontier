/**
 * MINISTRY V — SOVEREIGN SUBTITLE SYSTEM: the subtitle import route.
 *
 * Accepts an uploaded SRT or WebVTT file and returns the parsed subtitle
 * cues as a SubtitleDirective the client applies to a Direction Node via
 * UPDATE_ADVANCED_DIRECTIVE('subtitles'). The raw file is never stored in
 * the Vault — subtitle cues belong in the Sovereign Direction State
 * (AssemblyNode.customDirectives.subtitles), not the asset library.
 *
 * No billing gate: importing subtitles is a creative Direction tool, not
 * a generation operation. Auth-gated only — the Creator must be signed in.
 *
 * Format detection: 'format' form field ('srt'|'vtt') overrides. When
 * absent, a file whose name ends in .vtt or whose content begins with
 * "WEBVTT" is treated as VTT; otherwise SRT is assumed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { parseSrt, parseVtt } from '../../../../../src/chambers/ras-al-amr/subtitle-parser';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

const MAX_SUBTITLE_BYTES = 2 * 1024 * 1024; // 2 MB — subtitles are tiny text files

function detectFormat(fileName: string, content: string, explicitFormat?: string): 'srt' | 'vtt' {
  if (explicitFormat === 'srt' || explicitFormat === 'vtt') return explicitFormat;
  if (fileName.toLowerCase().endsWith('.vtt')) return 'vtt';
  if (content.trimStart().startsWith('WEBVTT')) return 'vtt';
  return 'srt';
}

export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to import subtitles.' },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const explicitFormat = formData.get('format');

  if (!(file instanceof File)) {
    return NextResponse.json(
      { status: 'failed', reason: 'missing-file', message: 'A subtitle file is required under the "file" form field.' },
      { status: 400 },
    );
  }

  if (file.size > MAX_SUBTITLE_BYTES) {
    return NextResponse.json(
      { status: 'failed', reason: 'file-too-large', message: `Subtitle file exceeds the maximum size of ${MAX_SUBTITLE_BYTES} bytes.` },
      { status: 400 },
    );
  }

  const content = await file.text();
  const format = detectFormat(
    file.name,
    content,
    typeof explicitFormat === 'string' ? explicitFormat : undefined,
  );

  const languageRaw = formData.get('language');
  const language =
    typeof languageRaw === 'string' && languageRaw.trim().length > 0
      ? languageRaw.trim()
      : undefined;

  let cues;
  try {
    cues = format === 'vtt' ? parseVtt(content) : parseSrt(content);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse subtitle file.';
    return NextResponse.json(
      { status: 'failed', reason: 'parse-error', message },
      { status: 422 },
    );
  }

  return NextResponse.json({
    status: 'succeeded',
    directive: { cues, ...(language ? { language } : {}) },
  });
}
