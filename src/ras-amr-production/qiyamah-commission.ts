/**
 * AZMA OS — the courier between رأس الأمر and القيامة.
 *
 * ─── THE RULING THIS IMPLEMENTS ──────────────────────────────────────────────
 *
 *   The Founder, 2026-09-25, choosing the first of three roads:
 *   «يجب أن يكون هناك وسيطاً ينقل المطالبة إلى القيامة وينقل المخرجات المولّدة
 *   من القيامة لرأس الأمر، بأقل حزمة بناء، إن لم يكن متوفراً عميل لذلك في
 *   المستودع.»
 *
 * ─── WHY THE ROAD EXISTS AT ALL ──────────────────────────────────────────────
 *
 *   MEASURED on the live workshop 2026-09-25: it holds no generator. There is
 *   no text-to-image anywhere in it — it searches a stock library, assembles,
 *   narrates and burns subtitles. So a scene describing something that does
 *   not exist in the world («منتجي الجديد على منصّة ذهبية») can never be found
 *   by any search, however well phrased.
 *
 *   The Empire does generate — in القيامة, which is constitutionally the
 *   Chamber that works INSIDE an asset, while رأس الأمر works BETWEEN assets
 *   and creates none. That line is guarded by a test. It is not crossed here:
 *   this module generates nothing. It commissions.
 *
 * ─── WHY IT IS THIS SMALL ────────────────────────────────────────────────────
 *
 *   Existence before implementation, as the Founder's order required. There
 *   was no courier in the repository — and there did not need to be much of
 *   one, because `generateImage` in src/qiyamah-generation is the whole
 *   Qiyamah act: it validates, rate-limits, calls the image provider, and
 *   deposits the result into the Creator's own Vault through
 *   SovereignVaultManager. So the courier neither generates nor stores. It
 *   carries a demand there, waits, and carries a sovereign asset back.
 *
 * ─── WHAT THE CREATOR IS NEVER TOLD ──────────────────────────────────────────
 *
 *   Not a provider, not a model, not a failure in a foreign tongue. Every
 *   outcome below is classified, and the Chamber says it in Arabic.
 */

import { copyFile, mkdir } from 'fs/promises';
import { basename, join } from 'path';
import { getDb } from '../persistent-storage';
import { hasActiveEntitlement } from '../billing/entitlement-service';
import type { CreatorRole } from '../authentication';
import { generateImage } from '../qiyamah-generation/generation-service';
import { editSovereignImage } from '../qiyamah-generation/image-edit-service';
import type { ImageEditRefusal } from '../qiyamah-generation/image-edit-service';

/**
 * Where the production workshop can read a picture the Empire made.
 *
 * ─── WHY A COPY, AND WHY HERE ────────────────────────────────────────────────
 *
 *   MEASURED 2026-09-25 on the live host: with `video_source: 'local'` the
 *   workshop treats each material's `url` as a path on its OWN filesystem and
 *   opens it directly — it does not fetch. A sovereign asset's URI is a
 *   relative web path («/generated-assets/….png»), which that container cannot
 *   open, so handing it over unchanged would have been a road to nothing.
 *
 *   The container already shares one directory with the host —
 *   /opt/providers/mpt-runtime/storage ⟷ /MoneyPrinterTurbo/storage, proven by
 *   writing on one side and reading on the other. So a working copy is placed
 *   there and the container-side path is what the workshop is told. No mount
 *   is added, nothing is exposed over HTTP, and the sovereign asset itself
 *   never leaves the Creator's Vault — this is a render copy, like any other.
 */
const HOST_HANDOFF_DIR = process.env['MPT_HANDOFF_DIR']
  ?? '/opt/providers/mpt-runtime/storage/azma-commissioned';
const CONTAINER_HANDOFF_DIR = process.env['MPT_HANDOFF_CONTAINER_DIR']
  ?? '/MoneyPrinterTurbo/storage/azma-commissioned';

/** Where the generated file actually sits on this host. */
function hostPathForAsset(assetUrl: string): string {
  const name = basename(assetUrl);
  const root = process.env['UPLOADS_DIR'] ?? join(process.cwd(), 'public');
  // A sovereign asset sits in one of two places depending on how it came to
  // exist: generated here, or uploaded by the Creator. The URI says which, so
  // the URI is what decides — never an assumption about where pictures live.
  return assetUrl.startsWith('/generated-assets/')
    ? join(root, 'generated-assets', name)
    : join(root, name);
}

/**
 * Put a commissioned picture where the workshop can open it, and answer with
 * the path IT will see. Returns null when the handoff fails — that scene then
 * falls back to being searched for, which is what it would have been.
 */
async function handOverToWorkshop(assetUrl: string): Promise<string | null> {
  try {
    const name = basename(assetUrl);
    await mkdir(HOST_HANDOFF_DIR, { recursive: true });
    await copyFile(hostPathForAsset(assetUrl), join(HOST_HANDOFF_DIR, name));
    // The container is Linux; its path is built explicitly rather than by
    // this host's separator, which on Windows would be the wrong one.
    return `${CONTAINER_HANDOFF_DIR}/${name}`;
  } catch (err) {
    console.error('[RasAmr] handoff to workshop failed:', assetUrl, err);
    return null;
  }
}

/**
 * Put a picture the Creator already owns where the workshop can open it.
 *
 * Nothing is commissioned and nothing is charged: it is already theirs. The
 * asset is read scoped to this Creator, so one Creator cannot put another's
 * picture into their film by passing an id.
 */
export async function handOverAssetToWorkshop(
  assetId: string,
  creatorId: string,
): Promise<string | null> {
  try {
    const row = getDb()
      .prepare('SELECT secure_storage_uri FROM vault_assets WHERE asset_id = ? AND subscriber_tenant_id = ?')
      .get(assetId, creatorId) as { secure_storage_uri?: string } | undefined;
    if (typeof row?.secure_storage_uri !== 'string') return null;
    return await handOverToWorkshop(row.secure_storage_uri);
  } catch (err) {
    console.error('[RasAmr] creator asset handoff failed:', assetId, err);
    return null;
  }
}

/**
 * Why a commission did not come back. Never the provider's own words.
 *
 * The last five arrived with the visual-reference road, and each is here
 * because its CURE is different. «أعد المحاولة» is wrong advice for a Creator
 * whose reference picture is the thing that cannot be read, and it is wrong
 * again for an Empire that has run out of credit.
 */
export type CommissionFailure =
  | 'NOT_ENTITLED'        // this Creator may not spend the Empire's capacity
  | 'DEMAND_REFUSED'      // the demand itself could not be accepted
  | 'BUSY'                // the Empire's generation is at its limit
  | 'GENERATION_FAILED'   // it was attempted and did not produce
  | 'STORAGE_FAILED'      // it produced and could not be kept
  | 'NO_CAPACITY'         // the Empire's own credit with the engine is spent
  | 'TIMED_OUT'           // it was attempted and took longer than the wait
  | 'REFERENCE_UNUSABLE'  // the approved frame itself cannot be read or built on
  | 'UNCHANGED_BY_EDITOR' // the engine returned the reference untouched
  | 'EDITOR_UNAVAILABLE'; // the editing capability is not configured here

/**
 * ─── HOW A SCENE'S WORDS BECOME ONE INSTRUCTION ──────────────────────────────
 *
 *   One function, used for BOTH roads — the first frame which is generated
 *   from text, and every later frame which is edited out of the approved one —
 *   so the shared visual world cannot reach one road and miss the other.
 *
 *   The world comes first and the scene's own demand after it, because the
 *   demand is what changes between scenes and the world is what must not.
 *   Nothing is invented: if the Creator wrote no world, the demand is the
 *   whole instruction, exactly as it was before this existed.
 *
 *   ANGLE AND COMPOSITION LIVE INSIDE THESE WORDS, and that is a limit, not a
 *   design: MEASURED by reading the engine's own payload, an edit is submitted
 *   as `{ model, style: { prompt }, assets: { image_file_paths } }` — there is
 *   no angle parameter, no composition parameter and no aspect ratio to set.
 *   So a Creator who wants a low angle writes it, and the Empire claims no
 *   structured control it does not have.
 */
export function composeSceneInstruction(parts: {
  readonly visualWorldAr?: string;
  readonly demandAr: string;
}): string {
  const world = (parts.visualWorldAr ?? '').trim();
  const demand = parts.demandAr.trim();
  const rule = asksForMultipleSubjects(demand) ? '' : `\n\n${SUBJECT_INTEGRITY_RULE_AR}`;
  if (world.length === 0) return `${demand}${rule}`;
  return `${world}\n\nفي هذا المشهد: ${demand}${rule}`;
}

/**
 * ─── ONE SUBJECT, ONCE — AND NOTHING SAYS IT BUT THE WORDS ───────────────────
 *
 *   MEASURED on the live proof, 2026-10-19, job cmvfrm3lp01bbjs01p57gpzij: the
 *   editor was given an approved frame holding one honey jar and asked to add a
 *   spoon lifting honey in front of it. It returned the SAME product with the
 *   same label — identity held — and TWO jars, their bodies merged and the lid
 *   gone. One further edit, cmvfrrgoo00m4j501rkrowexp, differed from it by one
 *   sentence forbidding a second copy, and the duplication was gone.
 *
 *   So the fault was in the words, and the words are the only place a fix can
 *   live: the engine's payload is `{ model, style: { prompt }, assets }` and
 *   holds no parameter for «one of this». This is a GUIDING rule written into
 *   every scene's instruction. It is not a guarantee, and the Empire must never
 *   speak of it as one — a model may still disobey, and only looking at the
 *   picture will say whether it did.
 *
 *   It names no product. It bans four things and frees everything else:
 *   duplication, merging, altering what makes the subject recognisable, and
 *   swapping the subject for another. The action, the surroundings and the
 *   detail of the scene stay the Creator's to change.
 */
export const SUBJECT_INTEGRITY_RULE_AR = [
  'والتزِم بما يلي ما لم تُطلَب غيرُه صراحةً في هذه الجملة:',
  'يَظهَر الموضوعُ المرجعيُّ نسخةً واحدةً فقط في الإطار،',
  'ولا تُكرَّر أجزاؤه ولا تُدمَج أجسامُه ولا يُضاعَف أيُّ جزءٍ منه؛',
  'وتَبقى سِماتُه المميِّزةُ ونصُّ مُلصَقِه وألوانُه كما هي دون تغيير؛',
  'ولا يُستبدَل بموضوعٍ آخر.',
  'وما عدا ذلك — الفعلُ والعناصرُ المحيطةُ وتفاصيلُ المشهد — يتغيّر كما تَطلُبُه هذه الجملة.',
].join(' ');

/**
 * Whether the Creator ASKED for more than one of the subject.
 *
 * Their own words outrank a default, always — a rule imposed on a Creator who
 * wanted three bottles in a row is a worse failure than a duplicate nobody
 * asked for, because the first silently refuses what they said and the second
 * is visible the moment they look.
 *
 * So this errs toward respecting them: any of these phrases in the scene's own
 * demand withdraws the rule entirely. It reads the DEMAND only, never the
 * shared world — the world describes a place and a style, and a label reading
 * «طبيعي ١٠٠٪» must never be mistaken for a request for a hundred products.
 */
export function asksForMultipleSubjects(demandAr: string): boolean {
  const text = demandAr.trim();
  return MULTIPLICITY_PHRASES_AR.some((phrase) => text.includes(phrase));
}

/** Phrases that can only mean «more than one of it», kept deliberately few. */
const MULTIPLICITY_PHRASES_AR: readonly string[] = [
  'أكثر من', 'عدة', 'عدّة', 'متعدد', 'نسخ', 'مجموعة من', 'صفٌّ من', 'صف من',
  'اثنان', 'اثنين', 'ثلاثة', 'ثلاث', 'أربعة', 'أربع', 'خمسة',
];

export interface CommissionedScene {
  /** The scene this picture belongs to, so order can never be guessed at. */
  readonly order: number;
  /**
   * The scene's own id, carried back so the frame can be PINNED to it.
   *
   * Order alone was enough while the pictures only had to be handed to the
   * workshop in sequence. It is not enough to write a row: two storyboards can
   * both have a scene 3, and an order is a position while an id is an identity.
   */
  readonly sceneId: string;
  readonly assetId?: string;
  /** The sovereign asset's own URI, in the Creator's Vault. */
  readonly assetUrl?: string;
  /** The same picture where the production workshop can open it. */
  readonly workshopPath?: string;
  /**
   * True when this frame was made OUT OF the approved reference rather than
   * from words alone. Recorded so the Chamber can say which frames share a
   * visual lineage — and so nobody has to infer it from a provider's output.
   */
  readonly usedReference?: boolean;
  readonly failure?: CommissionFailure;
}

/** One scene's demand, as the Chamber that wrote the scene phrased it. */
export interface SceneDemand {
  readonly order: number;
  /** Whose demand this is. Required, because the answer is written to it. */
  readonly sceneId: string;
  /** What should be created — written by whoever wrote the scene. */
  readonly demandAr: string;
  /** The Creator's own words for the scene, kept beside the demand. */
  readonly seenAr?: string;
}

function classify(reason: string): CommissionFailure {
  switch (reason) {
    case 'invalid-prompt': return 'DEMAND_REFUSED';
    case 'rate-limited':   return 'BUSY';
    case 'storage-error':  return 'STORAGE_FAILED';
    default:               return 'GENERATION_FAILED';
  }
}

/** What the Chamber says about a commission that did not arrive. */
export function commissionFailureSpokenAr(failure: CommissionFailure): string {
  switch (failure) {
    case 'NOT_ENTITLED':      return 'إنشاء الصور متاحٌ لأصحاب الاشتراك. اشترك لتفتحه.';
    case 'DEMAND_REFUSED':    return 'لم تُقبل مطالبة هذا المشهد. أعد صياغته.';
    case 'BUSY':              return 'التوليد بلغ حدّه الآن. أعد المحاولة بعد قليل.';
    case 'STORAGE_FAILED':    return 'أُنشئت الصورة ولم تُحفظ في خزانتك.';
    case 'GENERATION_FAILED': return 'تعذّر إنشاء صورة هذا المشهد.';
    case 'NO_CAPACITY':       return 'رصيد الإمبراطوريّة للإنشاء نفد. لا شأن لمشهدك بذلك.';
    case 'TIMED_OUT':         return 'استغرق إنشاء هذا المشهد أطول من المتاح. أعد المحاولة.';
    case 'REFERENCE_UNUSABLE': return 'المرجع البصريُّ المعتمد لا يمكن البناء عليه. اختر مرجعاً آخر.';
    case 'UNCHANGED_BY_EDITOR': return 'عاد المحرّر بالصورة المرجعيّة نفسها دون تغيير. أعد صياغة المطلوب في هذا المشهد.';
    case 'EDITOR_UNAVAILABLE': return 'البناء على مرجعٍ بصريٍّ غير مهيّأ في الإمبراطوريّة بعد.';
  }
}

/**
 * The editor's refusals, carried into this courier's own vocabulary.
 *
 * Nothing is flattened into «it failed»: the three the Founder asked to keep
 * apart — the engine, the keeping, and the link — stay apart here, and the
 * reference being unusable is its own answer because its cure is to choose a
 * different reference.
 */
function classifyEditRefusal(refusal: ImageEditRefusal): CommissionFailure {
  switch (refusal) {
    case 'no-credit':             return 'NO_CAPACITY';
    case 'timed-out':             return 'TIMED_OUT';
    case 'capability-unavailable':
    case 'model-unavailable':     return 'EDITOR_UNAVAILABLE';
    case 'rejected-by-lineage':   return 'UNCHANGED_BY_EDITOR';
    case 'not-found':
    case 'not-an-image':
    case 'not-derivable':
    case 'requires-adoption':
    case 'source-unresolvable':
    case 'source-unreadable':     return 'REFERENCE_UNUSABLE';
    default:                      return 'GENERATION_FAILED';
  }
}

/**
 * Commission the pictures a storyboard needs, in scene order.
 *
 * Sequential on purpose. Generation is rate-limited and costs the Creator, and
 * a burst of parallel demands would spend that limit on whichever scenes
 * happened to win the race rather than on the storyboard in its own order. A
 * scene that fails is recorded and the rest continue — one picture the Empire
 * could not make must not cost the Creator the ones it could.
 */
export async function commissionScenePictures(params: {
  readonly creatorId: string;
  readonly creatorRole: CreatorRole;
  readonly demands: readonly SceneDemand[];
  /**
   * ── THE FRAME THE FILM IS BEING MADE IN ────────────────────────────────
   *
   *   A platform name from the vocabulary `platform-adapter.ts` owns, which
   *   the output-frame table in cinematic-timing.ts declares for each profile
   *   the Creator can pick. It is CARRIED, never decided: this courier does
   *   not know what 9:16 is and must not learn, exactly as it does not know
   *   what a provider is.
   *
   *   Omitted — by any caller written before this existed — means the
   *   generation service behaves as it did: `platform-adapter.ts`'s
   *   documented 16:9.
   */
  readonly platformTarget?: string;
  /**
   * ── THE WORLD EVERY SCENE SHARES ──────────────────────────────────────
   *
   *   Place, style, light — the Creator's own words, in their own tongue,
   *   prepended to every scene's instruction so the scenes belong to one film
   *   rather than to one subject. Absent means every scene is instructed
   *   exactly as it was before this existed.
   */
  readonly visualWorldAr?: string;
  /**
   * ── THE APPROVED FRAME THE OTHERS ARE MADE OUT OF ─────────────────────
   *
   *   A sovereign asset the Creator has approved, owned by them. When it is
   *   given, every scene below is produced by EDITING it with that scene's
   *   instruction instead of generating from words alone — which is the only
   *   mechanism this Empire actually holds for keeping a product or a person
   *   the same across frames.
   *
   *   NO CLAIM IS MADE THAT IT GUARANTEES IDENTITY. The engine is given the
   *   approved picture and told what to change; how much of the subject
   *   survives is a question only a real generation can answer, and it has not
   *   been asked yet.
   */
  readonly referenceAssetId?: string;
}): Promise<readonly CommissionedScene[]> {
  // ── EVERY PATH THAT SPENDS IS GUARDED, NOT ONE THAT REMEMBERS ────────
  //
  //   FOUND 2026-09-25 during the launch-readiness audit, in work I had
  //   written the same day. القيامة's own route decides entitlement before
  //   touching a provider and says why in its own comment: «a Creator who is
  //   not entitled must never spend the Empire's provider capacity to learn
  //   that they were not entitled». But the gate lives in that ROUTE, and this
  //   courier calls the generation service underneath it — so a Creator with
  //   no subscription could compose scenes in رأس الأمر, mark them «يُنشَأ
  //   لي», press produce, and the Empire would buy the pictures. Measured
  //   earlier today: five credits an image.
  //
  //   The same authority is used, not a second one. The durable repair is for
  //   the generation service itself to refuse an unentitled caller, so no
  //   third path can forget — that touches trial accounting and is the
  //   Founder's to rule on, and is recorded in the audit rather than taken.
  if (!hasActiveEntitlement(params.creatorId, params.creatorRole)) {
    return params.demands.map((d) => ({
      order: d.order, sceneId: d.sceneId, failure: 'NOT_ENTITLED' as const,
    }));
  }

  const commissioned: CommissionedScene[] = [];

  for (const demand of [...params.demands].sort((a, b) => a.order - b.order)) {
    // The instruction both roads use — composed once, so the shared world
    // cannot reach one road and miss the other.
    const instruction = composeSceneInstruction({
      visualWorldAr: params.visualWorldAr,
      demandAr: demand.demandAr,
    });

    // ── ROAD ONE: OUT OF THE APPROVED FRAME ──────────────────────────────
    if (params.referenceAssetId) {
      const edited = await editSovereignImage({
        db: getDb(),
        assetId: params.referenceAssetId,
        creatorId: params.creatorId,
        instructionAr: instruction,
      });

      if (edited.status === 'succeeded') {
        // An INDEPENDENT sovereign asset with a recorded lineage — that is
        // `deriveAsset`'s work, not this courier's, and it refuses an output
        // identical to its parent before the asset exists at all.
        const workshopPath = await handOverToWorkshop(edited.asset.secureStorageUri);
        commissioned.push({
          order: demand.order,
          sceneId: demand.sceneId,
          assetId: edited.asset.assetId,
          assetUrl: edited.asset.secureStorageUri,
          usedReference: true,
          ...(workshopPath ? { workshopPath } : {}),
        });
      } else {
        console.error('[RasAmr] scene edit from reference failed:', JSON.stringify({
          order: demand.order, refusal: edited.refusal,
        }));
        commissioned.push({
          order: demand.order,
          sceneId: demand.sceneId,
          usedReference: true,
          failure: classifyEditRefusal(edited.refusal),
        });
      }
      continue;
    }

    // ── ROAD TWO: FROM WORDS ALONE ───────────────────────────────────────
    const outcome = await generateImage({
      prompt: instruction,
      creatorId: params.creatorId,
      // The scene's own words, kept so the Vault record says what this picture
      // was for rather than only what was asked of the provider.
      originalIdea: demand.seenAr ?? null,
      // MEASURED before this line existed: a Creator could choose «عمودي»,
      // watch a 9:16 preview, and have every commissioned scene generated
      // 16:9 — because this call named no frame and the default is landscape.
      // Spread, not set: a commission with no frame must reach `generateImage`
      // with the field ABSENT, so an unfilled choice stays indistinguishable
      // from the field never having existed.
      ...(params.platformTarget ? { platformTarget: params.platformTarget } : {}),
    });

    if (outcome.status === 'succeeded') {
      const workshopPath = await handOverToWorkshop(outcome.asset.assetUrl);
      commissioned.push({
        order: demand.order,
        sceneId: demand.sceneId,
        assetId: outcome.asset.assetId,
        assetUrl: outcome.asset.assetUrl,
        ...(workshopPath ? { workshopPath } : {}),
      });
    } else {
      // The provider's own message goes where an engineer reads it, never to
      // a Creator.
      console.error('[RasAmr] scene commission failed:', JSON.stringify({
        order: demand.order, reason: outcome.reason, stage: outcome.stage,
      }));
      commissioned.push({ order: demand.order, sceneId: demand.sceneId, failure: classify(outcome.reason) });
    }
  }

  return commissioned;
}
