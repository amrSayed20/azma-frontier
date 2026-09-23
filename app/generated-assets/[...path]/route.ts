/**
 * AZMA OS — the same authorisation gate, in front of generated assets.
 *
 * ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
 *
 *   Closing `/uploads/` and stopping there would have been closing the door the
 *   audit happened to walk through and leaving the one beside it open. Measured
 *   while verifying the upload gate: 23 rows in `vault_assets` are addressed at
 *   `/generated-assets/…`, nginx served that directory to the world exactly as
 *   it had served `/uploads/`, and no ownership check existed on that path
 *   either. A Creator's generated images were readable by any other Creator,
 *   and by anyone at all who held the name.
 *
 *   These are not the attack path — they are written by the Empire from a
 *   generation provider's output, not by an uploader, so no attacker chooses
 *   their bytes. But the Founder's acceptance condition is that authorisation
 *   prevents cross-user asset access, and it did not here.
 *
 * ─── HOW ────────────────────────────────────────────────────────────────────
 *
 *   Identical to the upload gate, deliberately: same lookup by stored address,
 *   same tenant comparison, same single 404 for every kind of refusal, same
 *   X-Accel-Redirect into an `internal` nginx location. One shape of gate, so
 *   one shape of mistake is possible rather than two.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb, findVaultAssetByStorageUri, creatorOwnsGeneratedAsset } from '@/src/persistent-storage';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const INTERNAL_PREFIX = '/protected-generated-assets/';

/** Absent, not yours, and never existed answer alike — existence is not enumerable. */
function refuse(): NextResponse {
  return new NextResponse(null, { status: 404 });
}

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

  const storageUri = `/generated-assets/${path.join('/')}`;
  const db = getDb();

  // Ownership has two proofs, and either is enough.
  //
  //   MEASURED on production 2026-09-24 by opening the gallery as a visitor:
  //   five of the Founder's own thirty-three generations rendered as broken
  //   frames. The files were on disk and the generation records were in the
  //   database; only the `vault_assets` rows were missing, and this gate knew
  //   no other proof. It refused a Creator their own work, in their own
  //   gallery, and said 404 — the same answer it gives a stranger.
  //
  //   A generation record names the Creator who asked for the image and the
  //   url of what came back. That is ownership, established at the moment of
  //   creation. Nothing is widened: both lookups are scoped to this session's
  //   creator, so a file that neither this Creator's Vault nor their own
  //   generations name is still refused, and still with one 404 for every
  //   kind of refusal.
  const asset = findVaultAssetByStorageUri(db, storageUri);
  const ownedByVault = asset !== null && asset.subscriberTenantId === session.creatorId;
  if (!ownedByVault && !creatorOwnsGeneratedAsset(db, session.creatorId, storageUri)) {
    return refuse();
  }

  const response = new NextResponse(null, { status: 200 });
  response.headers.set('X-Accel-Redirect', `${INTERNAL_PREFIX}${path.join('/')}`);
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
