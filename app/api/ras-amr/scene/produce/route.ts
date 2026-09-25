import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage/db';
import { loadCanvas } from '@/src/persistent-storage/canvas-repository';
import {
  MoneyPrinterTurboAdapter,
  isMoneyPrinterTurboConfigured,
} from '@/src/external-providers/moneyprinterturbo/moneyprinterturbo-adapter';
import { depositProductionIntoVault } from '@/src/external-providers/moneyprinterturbo/moneyprinterturbo-vault-deposit';
import { handOverAssetToWorkshop } from '@/src/ras-amr-production/qiyamah-commission';
import {
  acceptStoryboardProduction,
  findOperationForStoryboard,
  observeStoryboardOperation,
} from '@/src/ras-amr-production/storyboard-operation-lifecycle';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const SESSION_COOKIE = 'azma_session';

/**
 * AZMA OS — a film from the Creator's own assets.
 *
 * ─── WHAT THE FOUNDER FOUND MISSING ──────────────────────────────────────────
 *
 *   «أين حقل أو زر الاختيار الذي يمكّن المستخدم من رفع صوره ومقاطعه وإنشاء
 *   مقطع mp4 عن طريق رفع أصوله» — 2026-09-25.
 *
 *   MEASURED that day: «تجميع المشهد» produces a CompiledAssemblyGraph — a
 *   plan — and no route under app/api/ras-amr emitted an mp4 at all. A Creator
 *   could upload their own pictures, place them on a timeline, direct every
 *   pixel of them, and had no way to end with a file.
 *
 * ─── WHY THIS IS THE SAME ROAD, NOT A SECOND ONE ─────────────────────────────
 *
 *   The storyboard path was proven end to end earlier the same day: the
 *   isolated workshop accepts exact pictures with their durations
 *   (`video_materials`) and returns a film, and the lifecycle beside it owns
 *   accept-at-once, the operation ledger, and observation. Nothing here is new
 *   machinery. What changes is the source: the Creator's own canvas instead of
 *   scenes written next door — the same road, a different beginning.
 *
 *   One subject, one film: a canvas already produced hands its film back
 *   rather than paying to build a second copy of the same work.
 *
 * ─── WHAT IT NEVER DOES ──────────────────────────────────────────────────────
 *
 *   It commissions nothing and generates nothing. Every picture in the film is
 *   one the Creator already owns, so there is no provider to pay and no
 *   entitlement to spend. The workshop is never named to them.
 */
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as { canvasId?: string };
  const canvasId = typeof body.canvasId === 'string' ? body.canvasId : '';
  if (canvasId.length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'no-canvas', message: 'لا مشهدَ لإنتاجه بعد.' },
      { status: 422 },
    );
  }

  // The Empire's own canvas repository, scoped to this Creator: a canvas that
  // is not theirs answers exactly as one that does not exist, so an id cannot
  // be probed. No second way to read a canvas is introduced here.
  const canvas = loadCanvas(getDb(), canvasId, session.creatorId);
  if (!canvas) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'لا مشهدَ بهذا المعرّف.' },
      { status: 404 },
    );
  }

  const nodes = canvas.tracks.flatMap((t) => t.nodes);

  // In the order the Creator laid them on the timeline — the film follows the
  // scene, never the order the Empire happened to read them in.
  const placed = nodes
    .filter((n) => n.isActive !== false && typeof n.assetId === 'string')
    .sort((a, b) => (a.temporal?.globalStartTimeSeconds ?? 0) - (b.temporal?.globalStartTimeSeconds ?? 0));

  if (placed.length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'empty', message: 'ضع أصلاً واحداً على الأقلّ في مشهدك قبل إنتاجه.' },
      { status: 422 },
    );
  }

  if (!isMoneyPrinterTurboConfigured()) {
    return NextResponse.json(
      { status: 'failed', reason: 'production-unavailable', message: 'إنتاج المشاهد غير مهيّأ في الإمبراطوريّة بعد.' },
      { status: 503 },
    );
  }

  const adapter = new MoneyPrinterTurboAdapter();
  if (!(await adapter.checkHealth())) {
    return NextResponse.json(
      { status: 'failed', reason: 'production-unreachable', message: 'ورشة الإنتاج لا تستجيب الآن. أعد المحاولة.' },
      { status: 503 },
    );
  }

  const accepted = await acceptStoryboardProduction({
    creatorId: session.creatorId,
    // The canvas is the subject of this production, as a storyboard is of the
    // other. Namespaced so the two can never be mistaken for one another in
    // the ledger they share.
    storyboardId: `canvas:${canvasId}`,
    sceneCount: placed.length,
    run: async () => {
      const materials: { url: string; durationSeconds?: number }[] = [];
      for (const node of placed) {
        const workshopPath = await handOverAssetToWorkshop(node.assetId as string, session.creatorId);
        if (workshopPath) {
          materials.push({ url: workshopPath, durationSeconds: node.temporal?.playDurationSeconds ?? 5 });
        }
      }
      if (materials.length === 0) {
        // Said for an engineer. The Creator is told the classified reason.
        throw new Error('no output — none of the scene\'s assets could be handed to the workshop');
      }

      const productionRequest = {
        // The workshop needs a subject even when every picture is supplied;
        // the Creator's own scene is what it is producing.
        subject: 'مشهد من أصول المنشئ',
        language: 'ar',
        suppliedMaterials: materials,
        aspect: '16:9' as const,
        // No narration is invented for a scene the Creator assembled: their
        // own audio layers are theirs, and a voice they did not ask for would
        // be the Empire speaking over their work.
        subtitlesEnabled: false,
        fontName: 'NotoSansArabic-Regular.ttf',
      };

      const production = await adapter.produce(productionRequest);
      const asset = await depositProductionIntoVault({
        creatorId: session.creatorId,
        production,
        request: productionRequest,
        generatedScript: '',
      });
      return { assetId: asset.assetId, assetUrl: asset.secureStorageUri };
    },
  });

  return NextResponse.json(
    {
      status: 'accepted',
      canvasId,
      layerCount: placed.length,
      operationId: accepted.operationId,
      state: accepted.state,
      reused: accepted.reused,
      observeAt: `/api/ras-amr/scene/produce?canvasId=${encodeURIComponent(canvasId)}`,
    },
    { status: 202 },
  );
}

/** What became of it. Observes only: starts nothing, changes nothing, costs nothing. */
export async function GET(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  const canvasId = request.nextUrl.searchParams.get('canvasId') ?? '';
  const operationId = canvasId
    ? findOperationForStoryboard(session.creatorId, `canvas:${canvasId}`)
    : null;
  const observed = operationId ? await observeStoryboardOperation(operationId, session.creatorId) : null;
  if (!observed) {
    return NextResponse.json({ found: false, operationId: null, state: null });
  }

  return NextResponse.json({
    found: true,
    operationId: observed.operationId,
    state: observed.state,
    isTerminal: observed.isTerminal,
    producing: observed.producing,
    succeeded: observed.succeeded,
    assetId: observed.assetId ?? null,
    assetUrl: observed.assetUrl ?? null,
    failureReason: observed.failureReason ?? null,
  });
}
