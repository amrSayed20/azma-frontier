import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage';
import {
  runCreativeOperation,
  CREATIVE_INPUT_SHAPE,
  type CreativeRunRejection,
} from '@/src/vault/creative-operation-runner';
import type { CreativeOperationId } from '@/src/core/sovereign-ai-integration/adapters/magic-hour-creative-operations';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * POST /api/vault/assets/[assetId]/creative/[operation]
 *
 * ─── ONE DOOR FOR THE FOUR, FOR THE REASON THE RUNNER RECORDS ───────────────
 *
 *   Four routes would be four copies of one security-critical sequence. The
 *   operation is a path segment, validated against the runner's own declared
 *   shapes — so an unknown segment is refused here and can never reach the
 *   provider.
 *
 * ─── AND IT GRANTS NOTHING ──────────────────────────────────────────────────
 *
 *   It performs the session check and hands everything else to the runner,
 *   which asks the operation catalog whether the act may run at all. The route
 *   holds no availability logic of its own: a door that could decide for
 *   itself would be the second authority this chamber spent three packages
 *   removing.
 *
 *   Today every one of the four is refused — no verified cost basis exists for
 *   any of them. The refusal carries the catalog's own Arabic reason.
 *
 *   Face swap carries a second, independent requirement: the Creator's own
 *   likeness declaration. This door does not enforce it — the runner does,
 *   below every door — so a direct POST, a script, or a future route cannot
 *   reach the provider by skipping this file.
 */

const HTTP_FOR: Readonly<Record<CreativeRunRejection, number>> = {
  unavailable: 409,
  'acknowledgment-required': 403,
  'not-found': 404,
  'wrong-family': 400,
  'not-derivable': 409,
  'duration-required': 400,
  'source-unreadable': 500,
  'engine-refused': 502,
  'output-rejected': 409,
};

function isCreativeOperation(value: string): value is CreativeOperationId {
  return Object.prototype.hasOwnProperty.call(CREATIVE_INPUT_SHAPE, value);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ assetId: string; operation: string }> },
) {
  const { assetId, operation } = await context.params;

  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value ?? '');
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  if (!isCreativeOperation(operation)) {
    return NextResponse.json(
      { status: 'failed', reason: 'unknown-operation', message: 'لا توجد عمليّةٌ بهذا الاسم.' },
      { status: 404 },
    );
  }

  let body: unknown = null;
  try { body = await request.json(); } catch { body = null; }
  const b = (body ?? {}) as {
    secondAssetId?: unknown; durationSeconds?: unknown; likenessAcknowledgment?: unknown;
  };

  const outcome = await runCreativeOperation(getDb(), {
    operation,
    creatorId: session.creatorId,
    targetAssetId: assetId,
    secondAssetId: typeof b.secondAssetId === 'string' ? b.secondAssetId : undefined,
    durationSeconds: typeof b.durationSeconds === 'number' ? b.durationSeconds : undefined,
    // Handed on EXACTLY as it arrived — not normalised, not coerced to a
    // boolean, not defaulted when absent. A door that tidied this value would
    // be completing a declaration on the Creator's behalf, and an absent
    // declaration must stay absent all the way to the gate that refuses it.
    likenessAcknowledgment: b.likenessAcknowledgment,
  });

  if (!outcome.ok) {
    console.error('[creative]', operation, outcome.rejection, outcome.detailEn);
    return NextResponse.json(
      { status: 'failed', reason: outcome.rejection, message: outcome.messageAr },
      { status: HTTP_FOR[outcome.rejection] },
    );
  }

  // The asset the Vault deposited — never an id this route minted.
  return NextResponse.json({
    status: 'succeeded',
    asset: {
      assetId: outcome.assetId,
      secureStorageUri: outcome.storageUri,
      parentAssetId: outcome.parentAssetId,
    },
    // Deposited, NOT accepted. The Creator's acceptance is a separate act and
    // the only thing that makes this theirs.
    lifecycle: 'DEPOSITED',
  });
}
