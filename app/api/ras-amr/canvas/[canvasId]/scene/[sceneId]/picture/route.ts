import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb, loadCanvas } from '@/src/persistent-storage';
import { getVaultAsset } from '@/src/persistent-storage/vault-asset-repository';
import { isStoryboardCanvasId, readScenes } from '@/src/chambers/ras-al-amr/storyboard';
import { commissionScenePictures } from '@/src/ras-amr-production/qiyamah-commission';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const SESSION_COOKIE = 'azma_session';

/**
 * POST /api/ras-amr/canvas/[canvasId]/scene/[sceneId]/picture
 *
 * ─── THE DOOR THAT WAS MISSING, AND THE WORLD IT HAD TO BE BUILT IN ─────────
 *
 *   The engines were proven on 2026-11-09: a real nano-banana-2 picture (job
 *   cmw923boj051rgv01b26pf4cs) became a real 1920x1080 film (task 804b08c5).
 *   The workshop's own header said, truthfully when it was written, that
 *   «automatic frame generation … is not wired». That stopped being true.
 *
 *   BUT THE FIRST VERSION OF THIS ROAD WAS BUILT ON THE WRONG WORLD, and the
 *   measurement caught it before a single button was drawn. Ras Al Amr holds
 *   TWO storyboard worlds:
 *
 *     · `storyboards` / `storyboard_scenes` — DB rows the Chamber of Evidence
 *       writes, produced all at once by storyboard/[id]/produce
 *     · the CANVAS — what the Creator's own workshop opens, edits and saves
 *       through /api/ras-amr/canvas, whose scenes are tracks and whose ids
 *       are canvas scene ids
 *
 *   `StoryboardWorld.tsx` contains the string «storyboardId» exactly zero
 *   times. A per-scene road built on the first world would have been a door
 *   onto a wall: correct, tested, and unreachable by any hand.
 *
 * ─── WHAT IT DOES, AND WHAT IT LEAVES ALONE ─────────────────────────────────
 *
 *   One scene. Not the film. A Creator who dislikes one frame asks for that
 *   frame again and every other scene stays exactly as it was — the Founder's
 *   fourth acceptance scenario, and the reason this exists at all.
 *
 *   It commissions and deposits a sovereign asset, and answers with it. It
 *   does NOT write the canvas: attaching the returned asset to the scene is
 *   the workshop's own act, through the same `attachAsset` it already uses
 *   for a picture chosen from the Vault. The server never edits a canvas the
 *   Creator has open.
 *
 *   It is not a second engine and not a second adapter: it calls the same
 *   commission the whole-storyboard road calls, with a list of one.
 *
 * ─── OWNERSHIP ──────────────────────────────────────────────────────────────
 *
 *   `loadCanvas` enforces the tenant match in SQL. A canvas that is not
 *   theirs answers 404 — the same answer as one that does not exist.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ canvasId: string; sceneId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  const { canvasId, sceneId } = await context.params;

  // A montage canvas has no scenes to picture. Saying so is not pedantry:
  // the alternative is a confusing «scene not found» for a canvas that is
  // simply a different kind of work.
  if (!isStoryboardCanvasId(canvasId)) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-a-storyboard', message: 'هذا المشروع ليس لوحةَ مشاهد.' },
      { status: 400 },
    );
  }

  const canvas = loadCanvas(getDb(), canvasId, session.creatorId);
  if (!canvas) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'لا يوجد مشروعٌ بهذا المعرّف.' },
      { status: 404 },
    );
  }

  const scene = readScenes(canvas).find((s) => s.sceneId === sceneId);
  if (!scene) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'لا يوجد مشهدٌ بهذا المعرّف.' },
      { status: 404 },
    );
  }

  // A scene that says nothing about what is seen cannot be commissioned, and
  // is not quietly given something either. The Creator is told what is
  // missing, because it is a thing they can fix in one line.
  const demandAr = (scene.description ?? '').trim();
  if (demandAr.length === 0) {
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'no-demand',
        message: 'اكتُب أوّلاً ما الذي يُرى في هذا المشهد، ثم اطلب صورته.',
      },
      { status: 400 },
    );
  }

  let body: { platformTarget?: unknown; visualWorldAr?: unknown } = {};
  try { body = await request.json(); } catch { body = {}; }

  const commissioned = await commissionScenePictures({
    creatorId: session.creatorId,
    creatorRole: session.role,
    demands: [{ order: 0, sceneId: scene.sceneId, demandAr, seenAr: scene.title }],
    ...(typeof body.platformTarget === 'string' ? { platformTarget: body.platformTarget } : {}),
    ...(typeof body.visualWorldAr === 'string' ? { visualWorldAr: body.visualWorldAr } : {}),
  });

  const outcome = commissioned[0];
  if (!outcome || outcome.failure) {
    // The commission's own classification is carried rather than flattened:
    // «your balance is short» and «the provider refused» are different facts
    // and the Creator can act on only one of them.
    const failure = outcome?.failure;
    return NextResponse.json(
      {
        status: 'failed',
        reason: failure ?? 'not-commissioned',
        message: failure === 'NO_BALANCE'
          ? 'رصيدُك لا يكفي لصنع صورة هذا المشهد.'
          : failure === 'NOT_PRICED'
            ? 'صنعُ صور المشاهد غير مُسعَّرٍ بعد.'
            : 'تعذّر صنعُ صورة هذا المشهد. حاوِل بعد قليل.',
      },
      { status: failure === 'NO_BALANCE' ? 402 : 502 },
    );
  }

  // The WHOLE asset, not an id. The workshop attaches a picture to a scene
  // with the same `attachAsset` it uses for one chosen from the Vault, and
  // that needs the asset's family and capability — a client that rebuilt
  // those from an id would be guessing at facts the Vault already holds.
  const asset = outcome.assetId ? getVaultAsset(getDb(), outcome.assetId) : null;

  return NextResponse.json({
    status: 'succeeded',
    sceneId: outcome.sceneId,
    assetId: outcome.assetId,
    assetUrl: outcome.assetUrl,
    asset,
  });
}
