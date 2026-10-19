import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage/db';
import {
  assignSceneAsset,
  getStoryboard,
  listScenes,
} from '@/src/persistent-storage/sovereign-project-repository';
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
  recordSceneOutcomes,
} from '@/src/ras-amr-production/storyboard-operation-lifecycle';
import type { SceneFrameOutcome } from '@/src/ras-amr-production/storyboard-operation-lifecycle';
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
  const body = await request.json().catch(() => null) as {
    outputProfile?: unknown;
    regenerateSceneIds?: unknown;
    visualWorldAr?: unknown;
    referenceSceneId?: unknown;
  } | null;
  const chosenProfile = typeof body?.outputProfile === 'string' ? body.outputProfile : undefined;
  const frame = resolveOutputFrame(chosenProfile);

  // ── ONLY AN EXPLICIT ASK BUYS A PICTURE TWICE ─────────────────────────
  //
  //   The Founder, 2026-10-19: «لا تُعاد توليدات المشاهد المكتملة عند إعادة
  //   المحاولة إلا بطلب واضح من المستخدم.» This is that explicit ask, and it
  //   is the ONLY road to it: a scene whose picture is already pinned is
  //   otherwise reused, however many times the Creator presses produce.
  //
  //   An unnamed scene, a malformed list and an absent body are all the same
  //   answer — nothing is to be made again.
  const requestedAgain = new Set(
    (Array.isArray(body?.regenerateSceneIds) ? body.regenerateSceneIds : [])
      .filter((id): id is string => typeof id === 'string' && id.length > 0),
  );

  // ── THE WORLD EVERY SCENE SHARES ──────────────────────────────────────
  //
  //   Place, style, light, in the Creator's own words. It travels with the
  //   request and is NOT stored, which is a limit worth saying out loud: a
  //   refreshed chamber asks for it again. Storing it needs either a column on
  //   `storyboards` — a migration nobody has authorised — or an existing text
  //   field repurposed into a second meaning, which is worse. So it travels,
  //   and the Architect is told rather than a schema being changed quietly.
  const visualWorldAr = typeof body?.visualWorldAr === 'string'
    ? body.visualWorldAr.trim().slice(0, 600)
    : undefined;
  const requestedReferenceSceneId = typeof body?.referenceSceneId === 'string'
    ? body.referenceSceneId
    : undefined;

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
  //   AND A FRAME ALREADY MADE IS NOT MADE AGAIN. The state is read from the
  //   scene's own row — `visual_asset_id`, written by the production that made
  //   it — never from a browser's memory of what it saw. So a refresh, a new
  //   device and a second Creator session all agree about what is finished.
  const wantsCreation = (sc: { sourcing?: string | null }) => sc.sourcing === 'generate';

  // ── THE APPROVED FRAME THE OTHERS ARE MADE OUT OF ─────────────────────
  //
  //   The Founder, 2026-10-19: «صمّم مسارًا يستخدم إطارًا مرجعيًا معتمدًا، ثم
  //   يمرر المرجع مع تعليمات المشهد التالي إلى محرر الصور القائم، بدل توليد كل
  //   إطار مستقلًا دون رابط بصري.»
  //
  //   «Approved» is a scene that HOLDS a picture: either one the Creator chose
  //   from their own Vault, or one an earlier production made and pinned. No
  //   new field records approval, because holding the picture already does.
  //
  //   The Creator may name which one, and when they do not, the earliest scene
  //   that holds a picture is it — the first frame of the film, which is what a
  //   director would have chosen anyway.
  const referenceScene =
    scenes.find((sc) => sc.sceneId === requestedReferenceSceneId && sc.visualAssetId)
    ?? scenes.filter((sc) => sc.visualAssetId).sort((a, b) => a.order - b.order)[0]
    ?? null;
  const referenceAssetId = referenceScene?.visualAssetId ?? null;
  const alreadyMade = scenes.filter(
    (sc) => wantsCreation(sc) && sc.visualAssetId && !requestedAgain.has(sc.sceneId),
  );
  //   AND THE APPROVED REFERENCE IS NEVER REPLACED BY ACCIDENT. It is left out
  //   of the commission entirely unless the Creator named it for remaking,
  //   which is the explicit approval the Founder required before an approved
  //   frame is replaced.
  const isReference = (sceneId: string) => referenceScene?.sceneId === sceneId;
  const toGenerate = scenes
    .filter((sc) => wantsCreation(sc)
      && (sc.creationDemandAr ?? '').trim().length > 0
      && (!sc.visualAssetId || requestedAgain.has(sc.sceneId))
      && (!isReference(sc.sceneId) || requestedAgain.has(sc.sceneId)))
    .map((sc) => ({
      order: sc.order,
      sceneId: sc.sceneId,
      demandAr: sc.creationDemandAr as string,
      seenAr: sc.description,
    }));

  //   A scene that asks to be created and says nothing about what to create
  //   cannot be commissioned at all. It is not quietly searched for either:
  //   it is recorded as a scene whose demand was not accepted, and it stops
  //   the film like any other missing frame.
  const undecided = scenes.filter(
    (sc) => wantsCreation(sc) && !sc.visualAssetId && (sc.creationDemandAr ?? '').trim().length === 0,
  );

  // ── SCENES THE CREATOR ALREADY HAS A PICTURE FOR ─────────────────────
  //
  //   The Founder, 2026-09-25: this Chamber gave a Creator arriving with a
  //   demand from الحجّة no way to put their OWN asset into it, and leaned on
  //   generation instead. A picture they already own costs nothing and is
  //   already theirs, so it is used as it is — nothing is commissioned for a
  //   scene whose picture the Creator has already chosen.
  const chosenByCreator = scenes
    .filter((sc) => sc.sourcing === 'creator-asset' && sc.visualAssetId)
    .map((sc) => ({ order: sc.order, sceneId: sc.sceneId, assetId: sc.visualAssetId as string }));

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
    run: async (operationId) => {
      // Commissioned here, not above: this closure is what outlives the
      // request. The Creator's own pictures first: they are already theirs,
      // already paid for, and need no provider at all.
      const suppliedMaterials: { url: string; order: number }[] = [];
      const outcomes: SceneFrameOutcome[] = [];

      for (const chosen of chosenByCreator) {
        const workshopPath = await handOverAssetToWorkshop(chosen.assetId, session.creatorId);
        if (workshopPath) suppliedMaterials.push({ url: workshopPath, order: chosen.order });
        else {
          // A picture that exists and cannot be put where the workshop can
          // open it is its own cause, and not «the provider failed».
          outcomes.push({
            sceneId: chosen.sceneId, order: chosen.order, state: 'FAILED',
            assetId: chosen.assetId, failure: 'HANDOFF_FAILED',
          });
          continue;
        }
        if (isReference(chosen.sceneId)) {
          // The Creator's own product photo, standing as the visual reference
          // for every scene the Empire makes. Recorded so the Chamber can say so.
          outcomes.push({
            sceneId: chosen.sceneId, order: chosen.order, state: 'COMPLETED',
            assetId: chosen.assetId, isReference: true,
          });
        }
      }

      // Frames made by an earlier production: used as they are, nothing spent.
      for (const made of alreadyMade) {
        const assetId = made.visualAssetId as string;
        const workshopPath = await handOverAssetToWorkshop(assetId, session.creatorId);
        if (workshopPath) {
          suppliedMaterials.push({ url: workshopPath, order: made.order });
          outcomes.push({
            sceneId: made.sceneId, order: made.order, state: 'COMPLETED', assetId,
            ...(isReference(made.sceneId) ? { isReference: true } : {}),
          });
        } else {
          outcomes.push({
            sceneId: made.sceneId, order: made.order, state: 'FAILED',
            assetId, failure: 'HANDOFF_FAILED',
          });
        }
      }

      for (const blocked of undecided) {
        outcomes.push({
          sceneId: blocked.sceneId, order: blocked.order, state: 'FAILED',
          failure: 'DEMAND_REFUSED',
        });
      }

      if (toGenerate.length > 0) {
        const commissioned = await commissionScenePictures({
          creatorId: session.creatorId,
          creatorRole: session.role,
          demands: toGenerate,
          // A NAME, not a ratio: the generation side owns that map and the
          // courier carries the word without understanding it.
          platformTarget: frame.platformTarget,
          ...(visualWorldAr ? { visualWorldAr } : {}),
          // When a frame is approved, every other scene is made OUT OF it.
          // A frame that is itself being remade is generated from words, since
          // a picture cannot be its own reference.
          ...(referenceAssetId && !requestedAgain.has(referenceScene!.sceneId)
            ? { referenceAssetId }
            : {}),
        });

        for (const made of commissioned) {
          if (made.failure || !made.assetId) {
            outcomes.push({
              sceneId: made.sceneId, order: made.order, state: 'FAILED',
              failure: made.failure ?? 'GENERATION_FAILED',
              ...(made.usedReference ? { usedReference: true } : {}),
            });
            continue;
          }

          // ── THE FRAME IS WRITTEN ONTO ITS OWN SCENE ──────────────────
          //
          //   Through the Vault-scoped path that already exists, which checks
          //   that this scene belongs to this Creator before it writes — so a
          //   session cannot pin a picture onto someone else's storyboard by
          //   passing an id. Until this line, a commissioned frame existed in
          //   the Creator's Vault and NOTHING recorded which scene it was for,
          //   so the next production bought it again.
          const linked = assignSceneAsset(
            db, made.sceneId, session.creatorId, { visualAssetId: made.assetId },
          );

          // The picture is real either way, so it is still given to the
          // workshop. What a failed link costs is MEMORY, not this film, and
          // that is what the outcome says.
          if (typeof made.workshopPath === 'string') {
            suppliedMaterials.push({ url: made.workshopPath, order: made.order });
          }

          outcomes.push(
            linked
              ? {
                  sceneId: made.sceneId, order: made.order, state: 'COMPLETED',
                  assetId: made.assetId,
                  ...(made.usedReference ? { usedReference: true } : {}),
                }
              : {
                  sceneId: made.sceneId, order: made.order, state: 'FAILED',
                  assetId: made.assetId,
                  failure: typeof made.workshopPath === 'string' ? 'LINK_FAILED' : 'HANDOFF_FAILED',
                },
          );
        }
      }

      // Recorded BEFORE anything is allowed to fail, so a refusal below still
      // leaves the Creator able to see which scene it was and why.
      await recordSceneOutcomes(operationId, outcomes).catch(() => {});

      // ── NO SILENT SUBSTITUTION ───────────────────────────────────────
      //
      //   A scene the Creator asked to have CREATED, with no picture, used to
      //   fall through to the stock library: the film was assembled and a
      //   searched picture stood where a made one had been asked for, with
      //   only a server log to say so. A film built on that substitution is
      //   not the film they asked for, so it is not built.
      //
      //   LINK_FAILED is deliberately not counted here: that scene HAS its
      //   picture in this film.
      const missing = outcomes.filter((o) => o.state === 'FAILED' && o.failure !== 'LINK_FAILED');
      if (missing.length > 0) {
        console.error('[RasAmr] scenes without a frame:', JSON.stringify(
          missing.map((o) => ({ order: o.order, failure: o.failure })),
        ));
        throw new Error(
          `scenes-not-created: ${missing.length} scene(s) have no frame `
          + `(${missing.map((o) => `${o.order}:${o.failure}`).join(', ')})`,
        );
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
      // Said before the work starts, because it is about the Creator's money:
      // how many pictures this production will buy, and how many it reuses.
      framesToCreate: toGenerate.length,
      framesReused: alreadyMade.length,
      // Said before the work starts: whether these frames will be built on an
      // approved picture, and which one. Never the storage path — the id.
      referenceSceneId: referenceScene?.sceneId ?? null,
      usesReference: Boolean(referenceAssetId)
        && !(referenceScene && requestedAgain.has(referenceScene.sceneId)),
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
