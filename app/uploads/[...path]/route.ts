/**
 * AZMA OS — Sovereign Vault: the authorisation gate in front of every uploaded file.
 *
 * ─── WHAT WAS MEASURED, BEFORE THIS ROUTE EXISTED ───────────────────────────
 *
 *   Nginx served the upload directory straight to the world:
 *
 *       location /uploads/ { alias /var/www/azma-uploads/; }
 *
 *   Measured: `GET /uploads/<uuid>.txt` returned 200 to a request carrying no
 *   session at all. Every file any Creator had ever uploaded — and every text
 *   a Creator had kept from the Chamber of Evidence — was readable by anyone
 *   who held or guessed the name, and readable by every OTHER Creator without
 *   any ownership check ever running. It was also the step that made the image
 *   decoder reachable: a planted file had to be publicly addressable before an
 *   unauthenticated request could aim the optimizer at it.
 *
 * ─── HOW THE GATE WORKS ─────────────────────────────────────────────────────
 *
 *   Nginx no longer serves `/uploads/` itself. It proxies the path here, and
 *   keeps the directory on an `internal` location that only it can reach. This
 *   route verifies the session, proves the requester owns the asset, and then
 *   answers with `X-Accel-Redirect`, which tells nginx to send the bytes.
 *
 *   The file never passes through Node: nginx still does the sending, with its
 *   range support and its efficiency intact. What changed is that it will not
 *   send anything until this route has said who may have it.
 *
 *   Every existing `<img src="/uploads/…">` across Ras Al Amr, Makman and the
 *   Vault Palace keeps working unchanged, because the path is the same one.
 *   The session cookie is `SameSite=Lax`, which same-origin subresource
 *   requests carry — so the Creator's own images load, and a stranger's do not.
 *
 * ─── WHAT IT REFUSES TO DO ──────────────────────────────────────────────────
 *
 *   It does not fall back to serving a file when ownership cannot be
 *   established. A missing asset, an asset owned by someone else, and a
 *   guessed filename are answered identically — 404, nothing else — because
 *   telling the difference would confirm which files exist.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb, findVaultAssetByStorageUri } from '@/src/persistent-storage';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * The internal nginx location that holds the files.
 *
 * Deliberately NOT `/uploads/` — that path now belongs to this route, and
 * pointing the redirect back at it would loop nginx into itself.
 */
const INTERNAL_PREFIX = '/protected-uploads/';

/**
 * One answer for every failure.
 *
 * Absent, not yours, and never existed are the same response on purpose: a
 * distinguishable 403 would let anyone enumerate which assets exist.
 */
function refuse(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

/**
 * Whether a path segment could escape the upload directory.
 *
 * Nginx would resolve `..` against the alias before this route ever saw it,
 * but a name is checked here too rather than trusted to a layer below.
 */
function isSafeSegment(segment: string): boolean {
  if (segment.length === 0 || segment.length > 200) return false;
  if (segment === '.' || segment === '..') return false;
  return /^[A-Za-z0-9._-]+$/.test(segment);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (!Array.isArray(path) || path.length === 0 || !path.every(isSafeSegment)) {
    return refuse();
  }

  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) return refuse();

  // The stored form of the address, exactly as depositAsset recorded it.
  const storageUri = `/uploads/${path.join('/')}`;

  const asset = findVaultAssetByStorageUri(getDb(), storageUri);
  if (!asset) return refuse();

  // THE CROSS-TENANT BOUNDARY. The same rule SovereignVaultManager.getAsset()
  // enforces when a Chamber pulls an asset — applied here, where the browser
  // asks for the bytes directly.
  if (asset.subscriberTenantId !== session.creatorId) return refuse();

  const response = new NextResponse(null, { status: 200 });
  response.headers.set('X-Accel-Redirect', `${INTERNAL_PREFIX}${path.join('/')}`);
  // A Creator's own asset, never a shared cache. Without this an edge or proxy
  // could hand one Creator's file to the next requester of the same URL.
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
