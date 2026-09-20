/**
 * AZMA OS — The published work. The one public door in the Empire.
 *
 * ─── WHY THE TOKEN IS IN THE PATH AND NOT THE QUERY STRING ──────────────────
 *
 *   The first build of this put the token in `?t=`. It worked against Node and
 *   against nginx, and failed at the edge. MEASURED — the request as it
 *   actually arrived at the origin, in the nginx access log:
 *
 *       GET /renders/op_render_1788003786797_08yy3tm9.mp4 HTTP/1.1  404
 *
 *   No `?t=` anywhere in it. The CDN in front of this Empire strips query
 *   strings from static-looking requests, so a Creator's published link
 *   arrived stripped of the only thing that authorised it, and every viewer
 *   they shared it with saw nothing. Origin said 200; the world saw 404.
 *
 *   A capability that works in every test and dies at the edge is not a
 *   capability. The token lives in the path now, where nothing between the
 *   viewer and the Empire can remove it.
 *
 * ─── AND WHY IT IS ITS OWN ROUTE ────────────────────────────────────────────
 *
 *   `/renders/` answers one question: are you this film's owner? This answers
 *   a different one: is this link still live? Two questions, two doors, no
 *   route trying to be both. The token alone names the work — the viewer needs
 *   to know nothing about operations, ledgers or storage.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/src/persistent-storage';
import { resolveRenderOwner } from '@/src/persistent-storage/render-ownership';
import { findPublicLinkByToken } from '@/src/persistent-storage/sovereign-project-repository';
import { PublicationState } from '@/src/sovereign-projects/sovereign-project-contracts';

export const dynamic = 'force-dynamic';

const INTERNAL_PREFIX = '/protected-renders/';

/** Revoked, never existed, and malformed answer alike. */
function refuse(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params;

  // mintPublicToken() produces 32 bytes of base64url — 43 characters, no
  // padding. Anything else never reaches a database query.
  if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{20,200}$/.test(token)) return refuse();

  const db = getDb();
  const link = findPublicLinkByToken(db, token);
  if (!link) return refuse();

  // Article 9.3 — a withdrawn publication opens nothing, immediately.
  if (link.publicationState !== PublicationState.PUBLISHED || link.revokedAt !== null) return refuse();

  // The work must still be the same owner's. A link cannot outlive a change
  // of hands, and a work whose owner cannot be established is served to nobody
  // — not even through a link that was valid when it was minted.
  const ownership = resolveRenderOwner(db, link.finalWorkAssetId);
  if (!ownership || ownership.ownerId !== link.ownerId) return refuse();

  const response = new NextResponse(null, { status: 200 });
  response.headers.set('X-Accel-Redirect', `${INTERNAL_PREFIX}${ownership.operationId}.mp4`);
  // Never cached, anywhere. A published film is still not a public file: the
  // owner may withdraw it in the next second, and an edge copy would keep
  // serving what they withdrew.
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('Content-Disposition', `inline; filename="${ownership.operationId}.mp4"`);
  return response;
}
