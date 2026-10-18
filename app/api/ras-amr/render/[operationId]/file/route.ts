/**
 * GET /api/ras-amr/render/[operationId]/file[?download=1]
 *
 * Streams a finished Ras Al-Amr MP4 to its owner, with HTTP Range support so
 * the <video> element can seek. `download=1` asks the browser to save it.
 *
 * Served from disk through this authenticated route rather than as a static
 * file under public/: files written to public/ after `next build` are not
 * reliably served by `next start`, and a render belongs to one Creator only.
 */

import { createReadStream, statSync } from 'node:fs';
import { Readable } from 'node:stream';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { RenderAccessError, resolveRasAlAmrRenderFile } from '@/src/sovereign-entry/ras-al-amr-render';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SESSION_COOKIE = 'azma_session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ operationId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized' }, { status: 401 });
  }
  const { operationId } = await params;

  let path: string;
  try {
    path = await resolveRasAlAmrRenderFile(operationId, session.creatorId);
  } catch (error) {
    if (error instanceof RenderAccessError) {
      return NextResponse.json({ status: 'failed', reason: error.kind }, { status: error.kind === 'forbidden' ? 403 : 404 });
    }
    return NextResponse.json({ status: 'failed', reason: 'render-error' }, { status: 500 });
  }

  const size = statSync(path).size;
  const headers = new Headers({
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'private, no-store',
  });
  if (request.nextUrl.searchParams.get('download') === '1') {
    headers.set('Content-Disposition', `attachment; filename="ras-al-amr-${operationId}.mp4"`);
  }

  const range = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('range') ?? '');
  if (range && (range[1] !== '' || range[2] !== '')) {
    const start = range[1] === '' ? Math.max(0, size - Number(range[2])) : Number(range[1]);
    const end = range[1] !== '' && range[2] !== '' ? Math.min(Number(range[2]), size - 1) : size - 1;
    if (start >= size || start > end) {
      return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
    }
    headers.set('Content-Range', `bytes ${start}-${end}/${size}`);
    headers.set('Content-Length', String(end - start + 1));
    const stream = Readable.toWeb(createReadStream(path, { start, end })) as ReadableStream<Uint8Array>;
    return new NextResponse(stream, { status: 206, headers });
  }

  headers.set('Content-Length', String(size));
  const stream = Readable.toWeb(createReadStream(path)) as ReadableStream<Uint8Array>;
  return new NextResponse(stream, { status: 200, headers });
}
