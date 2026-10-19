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

/** Why a commission did not come back. Never the provider's own words. */
export type CommissionFailure =
  | 'NOT_ENTITLED'        // this Creator may not spend the Empire's capacity
  | 'DEMAND_REFUSED'      // the demand itself could not be accepted
  | 'BUSY'                // the Empire's generation is at its limit
  | 'GENERATION_FAILED'   // it was attempted and did not produce
  | 'STORAGE_FAILED';     // it produced and could not be kept

export interface CommissionedScene {
  /** The scene this picture belongs to, so order can never be guessed at. */
  readonly order: number;
  readonly assetId?: string;
  /** The sovereign asset's own URI, in the Creator's Vault. */
  readonly assetUrl?: string;
  /** The same picture where the production workshop can open it. */
  readonly workshopPath?: string;
  readonly failure?: CommissionFailure;
}

/** One scene's demand, as the Chamber that wrote the scene phrased it. */
export interface SceneDemand {
  readonly order: number;
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
    return params.demands.map((d) => ({ order: d.order, failure: 'NOT_ENTITLED' as const }));
  }

  const commissioned: CommissionedScene[] = [];

  for (const demand of [...params.demands].sort((a, b) => a.order - b.order)) {
    const outcome = await generateImage({
      prompt: demand.demandAr,
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
      commissioned.push({ order: demand.order, failure: classify(outcome.reason) });
    }
  }

  return commissioned;
}
