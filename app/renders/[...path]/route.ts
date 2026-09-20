/**
 * AZMA OS — The authorisation gate in front of every finished film.
 *
 * ─── WHAT WAS MEASURED, BEFORE THIS ROUTE EXISTED ───────────────────────────
 *
 *   The September 16 security closure shut `/uploads/` and `/generated-assets/`
 *   and left this open. Worse than left open — the same config I wrote told
 *   every proxy between here and the viewer to keep a copy:
 *
 *       location /renders/ {
 *           alias /root/azma-os/public/renders/;
 *           add_header Cache-Control "public, max-age=3600";
 *       }
 *
 *   Measured on production, with no session and no cookie of any kind:
 *
 *       GET https://azmaos.com/renders/op_render_1788000362601_0iusk3w8.mp4
 *       → 200 · 239,231 bytes · video/mp4
 *       → sha256 identical to the file on disk
 *
 *   25 finished films belonging to 7 Creators, each fully downloadable by
 *   anyone holding the name. The films are the most finished thing the Empire
 *   produces — the end of the whole Creator journey — and they were the least
 *   protected thing in it.
 *
 * ─── THE TWO DOORS ──────────────────────────────────────────────────────────
 *
 *   A film is served to exactly two kinds of requester, and no third:
 *
 *     1. ITS OWNER, proven by session against `resolveRenderOwner` — here.
 *     2. ANYONE HOLDING A LIVE PUBLIC LINK — at `/w/<token>`, its own route,
 *        because the CDN strips query strings and a `?t=` door could never
 *        have opened. See the note where the second door used to be.
 *
 *   That second door is why this is a gate and not a wall. Article 9 gives the
 *   Creator the right to publish their work; a protection that made export
 *   impossible would have replaced one defect with another. The Creator opens
 *   it themselves, for one film at a time, and can shut it again.
 *
 *   Nginx still sends the bytes, via `X-Accel-Redirect` into an `internal`
 *   location it will only enter on its own instruction. Node never streams a
 *   video. Range requests, seeking and efficiency are unchanged; what changed
 *   is that nginx will not send anything until this route has said who may
 *   have it.
 *
 *   The path stays `/renders/<file>.mp4`, so the Makman player's existing
 *   `<video src>` keeps working untouched — the session cookie is SameSite=Lax,
 *   which same-origin subresource requests carry.
 *
 * ─── WHAT IT REFUSES TO DO ──────────────────────────────────────────────────
 *
 *   It does not serve a film whose owner cannot be established. It does not
 *   distinguish absent from forbidden. It does not let a Founder past the
 *   ownership check — a Founder's power is over the Empire, not over another
 *   Creator's unpublished work.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage';
import { resolveRenderOwner, renderOperationIdFromFilename } from '@/src/persistent-storage/render-ownership';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * The internal nginx location holding the films.
 *
 * Deliberately NOT `/renders/` — that path now belongs to this route, and
 * redirecting into it would loop nginx back through Node forever.
 */
const INTERNAL_PREFIX = '/protected-renders/';

/**
 * One answer for every refusal.
 *
 * Absent, not-yours, unpublished, revoked and never-existed are the same 404
 * on purpose. Any distinguishable code would turn this route into an oracle
 * for which films exist and which tokens were once valid.
 */
function refuse(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

function serve(filename: string): NextResponse {
  const response = new NextResponse(null, { status: 200 });
  response.headers.set('X-Accel-Redirect', `${INTERNAL_PREFIX}${filename}`);
  // The header that was wrong before. `public` let any shared cache keep a
  // Creator's film and hand it to the next requester of the same URL — which
  // would survive this gate entirely, serving from the edge without ever
  // reaching it. A published film is still not a cacheable-by-anyone film,
  // because revocation must take effect immediately.
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;

  // Films are flat files in one directory. A nested path is not a shape this
  // route produces, so it is refused rather than normalised.
  if (!Array.isArray(path) || path.length !== 1) return refuse();

  const filename = path[0];
  const operationId = renderOperationIdFromFilename(filename);
  if (!operationId) return refuse();

  const db = getDb();

  // WHO OWNS IT. Established before any right is considered — an unownable
  // film is served to nobody, whatever credential the requester presents.
  const ownership = resolveRenderOwner(db, operationId);
  if (!ownership) return refuse();

  // ── Door 1 · the owner ───────────────────────────────────────────────────
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (session && session.creatorId === ownership.ownerId) {
    return serve(filename);
  }

  // ── There is no second door here ─────────────────────────────────────────
  //
  // A published link is served by `app/w/[token]`, not by this path. The first
  // build accepted `?t=<token>` here and it could never have worked: the CDN in
  // front of this Empire strips query strings from static-looking requests, so
  // the token was gone before the request arrived. Measured in the nginx log:
  //
  //     GET /renders/op_render_1788003786797_08yy3tm9.mp4  404
  //
  // — the `?t=` the viewer sent is simply absent. Keeping that branch would
  // leave a door that looks open, passes every test, and is shut in reality.
  //
  // So this route answers exactly one question: are you this film's owner?
  return refuse();
}
