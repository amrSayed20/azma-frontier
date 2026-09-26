import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb, getVaultAsset } from '@/src/persistent-storage';
import { acceptAsset } from '@/src/persistent-storage/vault-asset-repository';
import { LifecycleState } from '@/src/vault/sovereign-vault-types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * POST /api/vault/assets/[assetId]/accept — the Creator's word that this one is right.
 *
 * ─── WHAT THE FOUNDER ASKED FOR ──────────────────────────────────────────────
 *
 *   «والتجلّي والتعديل على الأصل الناتج قبل الحفظ في الخزانة أو المعاينة»
 *   — 2026-09-25.
 *
 *   A review before the work is treated as finished.
 *
 * ─── WHY NOTHING IS HELD BACK FROM THE VAULT ─────────────────────────────────
 *
 *   MEASURED before building: everything القيامة makes is already deposited as
 *   INTERMEDIATE — the Vault's own word for «not yet the Creator's final
 *   word» — and 65 assets on production carry it. Not one line in the Empire
 *   reads that state. The review was half built and entirely silent.
 *
 *   Holding the bytes out of the Vault until a Creator approves would be the
 *   older and worse design: it is exactly how work was lost when a socket
 *   died. The asset is safe from the moment it exists. What was missing is
 *   the Creator's word about it, and that is all this route records.
 *
 * ─── OWNERSHIP ───────────────────────────────────────────────────────────────
 *
 *   Scoped to the session's Creator. An asset that is not theirs answers as
 *   one that does not exist, so an id cannot be probed.
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
  const asset = getVaultAsset(getDb(), assetId);
  if (!asset || asset.subscriberTenantId !== session.creatorId) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'لا أصلَ بهذا المعرّف في خزانتك.' },
      { status: 404 },
    );
  }

  if (asset.lifecycleState === LifecycleState.FINAL || asset.lifecycleState === LifecycleState.PUBLISHED) {
    // Already theirs by their own word. Said plainly rather than refused.
    return NextResponse.json({ status: 'succeeded', assetId, lifecycleState: asset.lifecycleState, alreadyAccepted: true });
  }

  const accepted = acceptAsset(getDb(), assetId, session.creatorId);
  if (!accepted) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-accepted', message: 'لم يُسجَّل اعتمادك. أعد المحاولة.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ status: 'succeeded', assetId, lifecycleState: LifecycleState.FINAL });
}
