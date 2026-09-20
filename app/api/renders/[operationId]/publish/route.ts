/**
 * AZMA OS — The Creator publishes, and withdraws, their own film.
 *
 * ─── WHY BOTH VERBS LIVE IN ONE FILE ────────────────────────────────────────
 *
 *   `createPublicLink` and `revokePublicLink` were written in Phase B3 and
 *   nothing ever called either of them. That is the same shape of defect as the
 *   legacy-adoption wall found in Phase D: a capability that exists, is
 *   correct, is tested — and that no Creator can reach. A right nobody can
 *   exercise is not a right.
 *
 *   Publishing and withdrawing are one power, not two features, so they are one
 *   route: POST opens the door, DELETE shuts it. A Creator who can open a door
 *   they cannot shut has been given a hazard, not a capability — so the two are
 *   built and proven together, never one without the other.
 *
 * ─── WHAT A PUBLIC LINK IS ──────────────────────────────────────────────────
 *
 *   A 32-byte CSPRNG token bound to ONE film and ONE owner. It is the single
 *   deliberate exception to the closure that shut every public path to a
 *   Creator's bytes — so it is unguessable by construction, revocable at any
 *   moment, and never cached by anything between here and the viewer.
 *
 *   Article 9.3: withdrawal means public access must STOP. Not stop eventually,
 *   not stop when a cache expires. The gate answers `private, no-store` on
 *   every served film precisely so that a revocation takes effect on the very
 *   next request.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage';
import { resolveRenderOwner } from '@/src/persistent-storage/render-ownership';
import {
  createPublicLink,
  revokePublicLink,
  listPublicLinksForOwner,
} from '@/src/persistent-storage/sovereign-project-repository';
import { PublicationState } from '@/src/sovereign-projects/sovereign-project-contracts';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

function unauthorized() {
  return NextResponse.json(
    { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
    { status: 401 },
  );
}

/** Absent and not-yours answer alike — only an owner learns a film exists. */
function notFound() {
  return NextResponse.json(
    { status: 'failed', reason: 'not-found', message: 'العمل غير موجود.' },
    { status: 404 },
  );
}

/**
 * Establish that the caller owns the film named in the path.
 * Returns the owner id, or the response that refuses.
 */
function requireOwner(request: NextRequest, operationId: string):
  { ownerId: string } | { refusal: NextResponse } {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) return { refusal: unauthorized() };

  const ownership = resolveRenderOwner(getDb(), operationId);
  // An unownable film cannot be published by anyone — there is no one with the
  // standing to publish it.
  if (!ownership || ownership.ownerId !== session.creatorId) return { refusal: notFound() };

  return { ownerId: session.creatorId };
}

/** POST — mint a public link for this film. */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ operationId: string }> },
) {
  const { operationId } = await context.params;
  const owner = requireOwner(request, operationId);
  if ('refusal' in owner) return owner.refusal;

  const db = getDb();

  // Idempotent by intent: a Creator pressing "publish" twice wants one live
  // link, not two. Minting a second would leave the first live after they
  // revoked what they believed was the only one — a revocation that silently
  // does nothing is worse than no revocation at all.
  const existing = listPublicLinksForOwner(db, owner.ownerId).find(
    (l) => l.finalWorkAssetId === operationId
      && l.publicationState === PublicationState.PUBLISHED
      && l.revokedAt === null,
  );
  if (existing) {
    return NextResponse.json({
      status: 'succeeded',
      alreadyPublished: true,
      linkId: existing.linkId,
      publicUrl: `/w/${existing.publicToken}`,
      message: 'هذا العمل منشورٌ بالفعل.',
    });
  }

  const link = createPublicLink(db, { ownerId: owner.ownerId, finalWorkAssetId: operationId });

  return NextResponse.json({
    status: 'succeeded',
    alreadyPublished: false,
    linkId: link.linkId,
    publicUrl: `/w/${link.publicToken}`,
    message: 'نُشر العمل. من يحمل الرابط يراه، ولك سحبه متى شئت.',
  });
}

/** DELETE — withdraw every live link for this film. Article 9.3. */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ operationId: string }> },
) {
  const { operationId } = await context.params;
  const owner = requireOwner(request, operationId);
  if ('refusal' in owner) return owner.refusal;

  const db = getDb();

  // EVERY live link, not the newest. If more than one ever exists — a second
  // minted before the idempotence above was in place, say — withdrawing one
  // and reporting success would leave the film public while telling its owner
  // it was private. The worst possible outcome of this route is a Creator who
  // believes they are withdrawn and is not.
  const live = listPublicLinksForOwner(db, owner.ownerId).filter(
    (l) => l.finalWorkAssetId === operationId
      && l.publicationState === PublicationState.PUBLISHED
      && l.revokedAt === null,
  );

  let revoked = 0;
  for (const link of live) {
    if (revokePublicLink(db, link.linkId, owner.ownerId)) revoked += 1;
  }

  // Proof, not assumption: re-read and confirm nothing live remains.
  const remaining = listPublicLinksForOwner(db, owner.ownerId).filter(
    (l) => l.finalWorkAssetId === operationId
      && l.publicationState === PublicationState.PUBLISHED
      && l.revokedAt === null,
  );
  if (remaining.length > 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'revocation-incomplete', message: 'تعذّر السحب الكامل. العمل ما يزال منشوراً.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    status: 'succeeded',
    revoked,
    message: revoked > 0
      ? 'سُحب النشر. لم يعد الرابط يفتح شيئاً.'
      : 'هذا العمل غير منشور.',
  });
}
