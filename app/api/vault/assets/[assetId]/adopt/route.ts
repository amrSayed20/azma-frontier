import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb, getVaultAsset, adoptLegacyAsset } from '@/src/persistent-storage';
import { isLegacyAsset, isDerivable } from '@/src/vault/sovereign-vault-types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * POST /api/vault/assets/[assetId]/adopt
 *
 * ─── WHY THIS ROUTE HAD TO EXIST ────────────────────────────────────────────
 *
 *   Constitution Article 5.5 says a legacy asset — one whose provenance
 *   predates the sovereign model — stays usable but may not be built upon
 *   «حتى يعتمده صاحبه». `adoptLegacyAsset()` was written in Phase B2 to record
 *   exactly that act.
 *
 *   Nothing ever called it. So the rule had a condition the Creator could not
 *   satisfy: all 47 of their existing assets refused to be edited, and the
 *   refusal pointed at a door that was not there. Found the only way it could
 *   be found — by taking the Creator's own path on the live site and being
 *   stopped by it.
 *
 *   A constitutional protection the Creator cannot lift is not a protection.
 *   It is a wall.
 *
 * ─── WHAT ADOPTION IS, AND IS NOT ───────────────────────────────────────────
 *
 *   It is the owner saying: this is mine, and I accept that its history begins
 *   here. It grants the right to derive, and records who granted it and when.
 *
 *   It does NOT invent a parent, a chamber or a version history the asset never
 *   had — «لا يُخترع له تاريخ سابق». After adoption the asset is still an
 *   asset of unknown origin; what changed is that its owner has taken
 *   responsibility for building on it.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ assetId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  const { assetId } = await context.params;
  const db = getDb();

  const asset = getVaultAsset(db, assetId);
  if (!asset || asset.subscriberTenantId !== session.creatorId) {
    // Absent and not-yours answer alike — only an owner may adopt, and only
    // an owner learns whether there is anything to adopt.
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'الأصل غير موجود.' },
      { status: 404 },
    );
  }

  if (isDerivable(asset)) {
    // Already adopted, or never needed it. Truthful and idempotent: the
    // Creator asked for a state the asset is already in.
    return NextResponse.json({
      status: 'succeeded',
      alreadyAdopted: true,
      assetId,
      message: 'هذا الأصل معتمدٌ بالفعل.',
    });
  }

  if (!isLegacyAsset(asset)) {
    // Not legacy, yet not derivable — the right was withheld deliberately, and
    // adoption is not the instrument that restores it.
    return NextResponse.json(
      { status: 'failed', reason: 'not-adoptable', message: 'لا يمكن اعتماد هذا الأصل.' },
      { status: 409 },
    );
  }

  const adopted = adoptLegacyAsset(db, assetId, session.creatorId);
  if (!adopted) {
    return NextResponse.json(
      { status: 'failed', reason: 'adoption-failed', message: 'تعذّر الاعتماد. لم يتغيّر شيء.' },
      { status: 500 },
    );
  }

  // Proof, not assumption: re-read rather than trust that the write landed.
  const after = getVaultAsset(db, assetId);
  if (!after || !isDerivable(after)) {
    return NextResponse.json(
      { status: 'failed', reason: 'adoption-failed', message: 'تعذّر الاعتماد. لم يتغيّر شيء.' },
      { status: 500 },
    );
  }

  return NextResponse.json({
    status: 'succeeded',
    alreadyAdopted: false,
    assetId,
    message: 'اعتُمد الأصل. يبدأ نسبه الموثّق من الآن.',
  });
}
