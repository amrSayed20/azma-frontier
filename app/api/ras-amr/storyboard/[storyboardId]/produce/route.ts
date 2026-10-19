import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage/db';
import { getStoryboard, listScenes } from '@/src/persistent-storage/sovereign-project-repository';
import {
  MoneyPrinterTurboAdapter,
  isMoneyPrinterTurboConfigured,
} from '@/src/external-providers/moneyprinterturbo/moneyprinterturbo-adapter';
import { depositProductionIntoVault } from '@/src/external-providers/moneyprinterturbo/moneyprinterturbo-vault-deposit';
import { commissionScenePictures, handOverAssetToWorkshop } from '@/src/ras-amr-production/qiyamah-commission';
import {
  acceptStoryboardProduction,
  findOperationForStoryboard,
  observeStoryboardOperation,
} from '@/src/ras-amr-production/storyboard-operation-lifecycle';
import { resolveOutputFrame } from '@/src/chambers/ras-al-amr/cinematic-timing';
import { getDefaultAspectRatio } from '@/src/sovereign-model-selection';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

const SESSION_COOKIE = 'azma_session';

/**
 * POST /api/ras-amr/storyboard/[storyboardId]/produce
 *
 * ─── THE RULING THIS IMPLEMENTS ──────────────────────────────────────────────
 *
 *   «تفكيك الموضوع إلى مشاهد مطالبةٌ تكتبها الحُجّة الدامغة، ويُنتَج ويُجمَّع
 *   في رأس الأمر، والمزوّد المعزول يكون مخصّصاً لإنتاج الستوري بورد»
 *   — the Founder, 2026-09-25.
 *
 *   الحُجّة الدامغة writes the ordered scenes and stops. This is where they are
 *   produced, and the isolated provider is what produces them — dedicated to
 *   this work, as ruled. Measured on the server: the provider answers on
 *   127.0.0.1:8080 and has been up for eleven days, bound to the loopback
 *   interface alone and reachable from nowhere else. It was configured,
 *   running, and connected to no Chamber at all.
 *
 * ─── WHAT THE CREATOR IS NEVER TOLD ──────────────────────────────────────────
 *
 *   Not the provider's name, not its task id, not the stock library it draws
 *   from, not a host or a port. The Knowledge Source Abstraction Principle
 *   holds here exactly as it holds in the Chamber of Evidence: what returns is
 *   a sovereign asset in the Creator's Vault. Every failure below answers in
 *   Arabic and names nothing outside the Empire.
 *
 * ─── OWNERSHIP ───────────────────────────────────────────────────────────────
 *
 *   The storyboard is read scoped to this session's creator. A storyboard that
 *   is not theirs answers 404 — the same answer as one that does not exist, so
 *   an id cannot be probed for someone else's work.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ storyboardId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  const { storyboardId } = await context.params;
  const db = getDb();

  const storyboard = getStoryboard(db, storyboardId, session.creatorId);
  if (!storyboard) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-found', message: 'لا توجد مشاهدُ بهذا المعرّف.' },
      { status: 404 },
    );
  }

  // ── THE FRAME THE CREATOR CHOSE, ARRIVING WHERE THE FILM IS MADE ─────
  //
  //   MEASURED at 57adbda: this route took no body at all and named no
  //   frame, so a Creator who selected «عمودي» in the chamber got scenes
  //   commissioned 16:9 and a film assembled 16:9. The selection was real and
  //   reached nothing on this road.
  //
  //   A body is optional and never trusted: anything that is not a profile
  //   this Empire declares resolves, through the frame table's own resolver,
  //   to landscape — which is exactly what every caller got before. So an old
  //   client, a missing body, malformed JSON and a made-up name all behave
  //   identically to the behaviour this route has always had.
  const body = await request.json().catch(() => null) as { outputProfile?: unknown } | null;
  const chosenProfile = typeof body?.outputProfile === 'string' ? body.outputProfile : undefined;
  const frame = resolveOutputFrame(chosenProfile);

  //   ONE declaration feeds both halves. The frame table says which platform
  //   name means this shape; the generation side is handed that NAME, and the
  //   workshop is handed the RATIO the same platform authority resolves it to.
  //   No second map is written, so the two can never drift apart.
  //
  //   The workshop can express three shapes and no more — its own request type
  //   says so. A ratio it cannot carry is refused here and the film keeps the
  //   frame it has always had, rather than being sent a value it would
  //   silently reinterpret.
  const resolvedRatio = getDefaultAspectRatio(frame.platformTarget);
  const filmAspect: '16:9' | '9:16' | '1:1' =
    resolvedRatio === '9:16' || resolvedRatio === '1:1' ? resolvedRatio : '16:9';

  const scenes = listScenes(db, storyboardId, session.creatorId);
  if (scenes.length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'no-scenes', message: 'لا مشاهدَ في هذه المطالبة بعد.' },
      { status: 422 },
    );
  }

  if (!isMoneyPrinterTurboConfigured()) {
    // Truthful, and silent about which provider is missing.
    return NextResponse.json(
      { status: 'failed', reason: 'production-unavailable', message: 'إنتاج المشاهد غير مهيّأ في الإمبراطوريّة بعد.' },
      { status: 503 },
    );
  }

  // The narration the scenes already carry, in their own order. `direction_notes`
  // holds what is said over each scene; `description` holds what is seen. The
  // spoken line is the script — a storyboard narrated by its own stage
  // directions would describe the picture instead of telling the story.
  const narration = scenes
    .map((s) => (s.directionNotes ?? '').trim())
    .filter((line) => line.length > 0)
    .join(' ');
  const subject = narration.length > 0 ? narration : scenes.map((s) => s.description).join(' ');

  // What each scene should SHOW, as الحُجّة الدامغة wrote it.
  //
  //   MEASURED 2026-09-25 by looking at the first real film: over narration
  //   about أصحاب الكهف it showed a priest holding a crucifix. The Chamber
  //   had written what every scene should show and this route sent none of it,
  //   so the picture was inferred from the words by a stock library that knows
  //   nothing of this Empire's world. A Chamber that decomposes a subject into
  //   scenes decides both halves of a scene; this carries the second half.
  //
  //   Storyboards written before that column existed have none, and then the
  //   production falls back to inferring as it did — degraded, not broken.
  const visualTerms = scenes
    .map((s) => (s.visualSearchEn ?? '').trim())
    .filter((term) => term.length > 0);

  // ── SCENES THAT EXIST NOWHERE ─────────────────────────────────
  //
  //   The Founder's ruling, 2026-09-25: a demand travels to القيامة and the
  //   generated picture travels back here. Measured: the production workshop
  //   holds no generator, so a scene showing a particular product or an
  //   imagined moment could never be found by any search, however phrased.
  //
  //   The constitutional line is not crossed: nothing is generated here. The
  //   courier commissions القيامة, which generates and deposits into the
  //   Creator's own Vault, and what returns is a sovereign asset this Chamber
  //   assembles — which is exactly what this Chamber does.
  //
  //   Only the PLAN is made here. Commissioning five pictures takes minutes,
  //   and this request answers in milliseconds — the same boundary the
  //   production itself already respects. The work happens inside `run`.
  const toGenerate = scenes
    .filter((sc) => sc.sourcing === 'generate' && (sc.creationDemandAr ?? '').trim().length > 0)
    .map((sc) => ({ order: sc.order, demandAr: sc.creationDemandAr as string, seenAr: sc.description }));

  // ── SCENES THE CREATOR ALREADY HAS A PICTURE FOR ─────────────────────
  //
  //   The Founder, 2026-09-25: this Chamber gave a Creator arriving with a
  //   demand from الحجّة no way to put their OWN asset into it, and leaned on
  //   generation instead. A picture they already own costs nothing and is
  //   already theirs, so it is used as it is — nothing is commissioned for a
  //   scene whose picture the Creator has already chosen.
  const chosenByCreator = scenes
    .filter((sc) => sc.sourcing === 'creator-asset' && sc.visualAssetId)
    .map((sc) => ({ order: sc.order, assetId: sc.visualAssetId as string }));

  const productionRequest = {
    subject,
    // The Chamber's own sentences are narrated, not a foreign model's
    // paraphrase of them: what the evidence supported is what is spoken.
    script: narration.length > 0 ? narration : undefined,
    visualTerms,
    language: 'ar',
    // MEASURED on the workshop 2026-09-25: with no voice named, the task
    // failed at «failed to synthesize audio; verify the selected voice and TTS
    // connectivity» — the adapter sends an empty voice_name and the engine has
    // no Arabic default to fall back on. Asked again with this voice, the same
    // workshop synthesized the same Arabic sentence and finished at progress
    // 100 with no error. A production that narrates Arabic must be told which
    // Arabic voice to narrate it in.
    voiceName: 'ar-EG-SalmaNeural-Female',
    paragraphCount: scenes.length,
    // Was `'16:9' as const`. A portrait film whose pictures were commissioned
    // portrait must not be assembled landscape: pillarboxed scenes inside the
    // old frame would be a worse film than the one this repair replaces.
    aspect: filmAspect,
    subtitlesEnabled: true,
    // MEASURED and recorded in the provider module: the default font renders
    // Arabic as disconnected boxes. A named Arabic face is not decoration here.
    fontName: 'NotoSansArabic-Regular.ttf',
  };

  const adapter = new MoneyPrinterTurboAdapter();
  if (!(await adapter.checkHealth())) {
    return NextResponse.json(
      { status: 'failed', reason: 'production-unreachable', message: 'ورشة الإنتاج لا تستجيب الآن. أعد المحاولة.' },
      { status: 503 },
    );
  }

  // ─── THE BOUNDARY THAT BROKE ON 2026-09-25 ─────────────────────────────
  //
  //   The first real storyboard production ran for 187 seconds and the
  //   browser's connection died before it finished. The Creator was told the
  //   workshop could not be reached, and the server had logged no failure —
  //   because there had been none. The work was still running. Then the
  //   request was gone, and the `await` that would have deposited the result
  //   went with it: the workshop finished into nothing.
  //
  //   A production that takes minutes does not ride a socket that lives for
  //   seconds. This accepts and answers at once; the work runs on its own and
  //   writes its ending to the Empire's operation ledger, which the Chamber
  //   reads through GET on this same path.
  const accepted = await acceptStoryboardProduction({
    creatorId: session.creatorId,
    storyboardId,
    sceneCount: scenes.length,
    run: async () => {
      // Commissioned here, not above: this closure is what outlives the
      // request. A picture the Empire could not make does not stop the film —
      // that scene is searched for instead, which is what it would have been.
      // The Creator's own pictures first: they are already theirs, already
      // paid for, and need no provider at all.
      let suppliedMaterials: { url: string; order: number }[] = [];
      for (const chosen of chosenByCreator) {
        const workshopPath = await handOverAssetToWorkshop(chosen.assetId, session.creatorId);
        if (workshopPath) suppliedMaterials.push({ url: workshopPath, order: chosen.order });
      }

      if (toGenerate.length > 0) {
        const commissioned = await commissionScenePictures({
          creatorId: session.creatorId,
          creatorRole: session.role,
          demands: toGenerate,
          // A NAME, not a ratio: the generation side owns that map and the
          // courier carries the word without understanding it.
          platformTarget: frame.platformTarget,
        });
        // The workshop opens a path on its own filesystem, not a Vault URI.
        // A picture whose handoff failed is simply absent here, and that scene
        // is searched for instead.
        suppliedMaterials = suppliedMaterials.concat(
          commissioned
            .filter((c) => typeof c.workshopPath === 'string')
            .map((c) => ({ url: c.workshopPath as string, order: c.order })),
        );
        const refused = commissioned.filter((c) => c.failure);
        if (refused.length > 0) {
          console.error('[RasAmr] scenes not commissioned:', JSON.stringify(
            refused.map((c) => ({ order: c.order, failure: c.failure })),
          ));
        }
      }

      // In scene order, so the pictures follow the story rather than the
      // order the Empire happened to obtain them in.
      const ordered = [...suppliedMaterials]
        .sort((x, y) => x.order - y.order)
        .map(({ url }) => ({ url }));
      const production = await adapter.produce({ ...productionRequest, suppliedMaterials: ordered });
      const asset = await depositProductionIntoVault({
        creatorId: session.creatorId,
        production,
        request: productionRequest,
        generatedScript: subject,
      });
      return { assetId: asset.assetId, assetUrl: asset.secureStorageUri };
    },
  });

  return NextResponse.json(
    {
      status: 'accepted',
      storyboardId,
      sceneCount: scenes.length,
      operationId: accepted.operationId,
      state: accepted.state,
      // True when this board already had a production running: the Creator is
      // handed the one that exists, never a second run of the same scenes.
      reused: accepted.reused,
      observeAt: `/api/ras-amr/storyboard/${encodeURIComponent(storyboardId)}/produce`,
    },
    { status: 202 },
  );
}

/**
 * GET — what became of the production. It observes only: it starts nothing,
 * changes nothing, and costs nothing.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ storyboardId: string }> },
) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  const { storyboardId } = await context.params;
  const operationId = findOperationForStoryboard(session.creatorId, storyboardId);
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
