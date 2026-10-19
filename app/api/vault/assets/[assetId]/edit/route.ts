import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage';
import { mutationRejectionSpokenAr } from '@/src/vault/sovereign-asset-mutation';
import {
  editSovereignImage,
  MAX_EDIT_INSTRUCTION,
} from '@/src/qiyamah-generation/image-edit-service';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * POST /api/vault/assets/[assetId]/edit
 *
 * ─── WHAT THIS ROUTE IS ─────────────────────────────────────────────────────
 *
 *   The join that was missing. Every piece existed and none of them touched:
 *   the Vault could list an asset, the engine could edit an image, and
 *   `deriveAsset` could record a lineage — but nothing called the second, and
 *   nothing called the third. A capability nobody can invoke is not a
 *   capability.
 *
 * ─── WHY THE ACT IS NO LONGER WRITTEN HERE ──────────────────────────────────
 *
 *   The whole sequence — own it, read it, check the model, edit, write, prove
 *   the result differs, deposit — lived in this file and nothing else could
 *   reach it. رأس الأمر needs the same act, to make one scene out of the
 *   approved frame of another so the product in both is the same product.
 *   Copying it there would have created a second authority on how an edited
 *   image becomes a sovereign asset. So it moved to
 *   `src/qiyamah-generation/image-edit-service.ts` and both call it.
 *
 *   What stays here is what is genuinely HTTP's: who is asking, what shape the
 *   request has, which status code each refusal deserves, and the sentence a
 *   Creator reads. Every one of those sentences is unchanged.
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

  let body: unknown;
  try { body = await request.json(); } catch {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-input', message: 'الطلب غير صالح.' },
      { status: 400 },
    );
  }

  const instruction = typeof (body as { instruction?: unknown })?.instruction === 'string'
    ? ((body as { instruction: string }).instruction).trim()
    : '';

  if (instruction.length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'empty-instruction', message: 'اكتب ما تريد تغييره في الصورة.' },
      { status: 400 },
    );
  }
  if (instruction.length > MAX_EDIT_INSTRUCTION) {
    return NextResponse.json(
      { status: 'failed', reason: 'instruction-too-long', message: 'الوصف أطول من المسموح.' },
      { status: 400 },
    );
  }

  const outcome = await editSovereignImage({
    db: getDb(),
    assetId,
    creatorId: session.creatorId,
    instructionAr: instruction,
  });

  if (outcome.status === 'succeeded') {
    // The sovereign asset, never a storage path. Article 6.
    return NextResponse.json({
      status: 'succeeded',
      asset: outcome.asset,
      lineage: outcome.lineage,
    });
  }

  // One refusal, one status, one sentence — and no provider named in any of them.
  switch (outcome.refusal) {
    case 'capability-unavailable':
      return NextResponse.json(
        { status: 'failed', reason: 'capability-unavailable', message: 'تعديل الصور غير متاحٍ حالياً.' },
        { status: 503 },
      );
    case 'not-found':
      return NextResponse.json(
        { status: 'failed', reason: 'not-found', message: 'الأصل غير موجود.' },
        { status: 404 },
      );
    case 'not-an-image':
      return NextResponse.json(
        { status: 'failed', reason: 'not-an-image', message: 'هذا الأصل ليس صورة.' },
        { status: 400 },
      );
    case 'requires-adoption':
      return NextResponse.json(
        {
          status: 'failed',
          reason: 'requires-adoption',
          message: mutationRejectionSpokenAr('PARENT_REQUIRES_ADOPTION'),
        },
        { status: 409 },
      );
    case 'not-derivable':
      return NextResponse.json(
        { status: 'failed', reason: 'not-derivable', message: mutationRejectionSpokenAr('PARENT_NOT_DERIVABLE') },
        { status: 409 },
      );
    case 'source-unresolvable':
      return NextResponse.json(
        { status: 'failed', reason: 'source-unreadable', message: 'تعذّر الوصول إلى هذه الصورة.' },
        { status: 400 },
      );
    case 'source-unreadable':
      return NextResponse.json(
        { status: 'failed', reason: 'source-unreadable', message: 'تعذّر قراءة الصورة الأصلية.' },
        { status: 500 },
      );
    case 'model-unavailable':
      return NextResponse.json(
        {
          status: 'failed', reason: 'model-unavailable',
          message: 'لا يوجد نموذجٌ مُصرَّحٌ للتعديل الآن. وستُفتَح العمليّة فور تصريح الإمبراطوريّة بنموذجها.',
        },
        { status: 409 },
      );
    case 'no-credit':
      return NextResponse.json(
        {
          status: 'failed',
          reason: 'capability-unavailable',
          message: 'تعديل الصور متوقّفٌ مؤقّتاً لنفاد رصيد الإمبراطوريّة. لا شأن لصورتك بذلك.',
        },
        { status: 503 },
      );
    case 'timed-out':
      return NextResponse.json(
        { status: 'failed', reason: 'timed-out', message: 'استغرق التعديل وقتاً طويلاً. أعد المحاولة.' },
        { status: 504 },
      );
    case 'rejected-by-lineage': {
      const conflict = outcome.rejection === 'OUTPUT_IDENTICAL_TO_PARENT';
      return NextResponse.json(
        {
          status: 'failed',
          reason: outcome.rejection,
          message: mutationRejectionSpokenAr(outcome.rejection ?? 'OUTPUT_IDENTICAL_TO_PARENT'),
        },
        { status: conflict ? 409 : 400 },
      );
    }
    default:
      return NextResponse.json(
        { status: 'failed', reason: 'edit-failed', message: 'تعذّر تنفيذ التعديل. لم يُحفظ شيء.' },
        { status: 502 },
      );
  }
}
