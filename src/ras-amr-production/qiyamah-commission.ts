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

import { generateImage } from '../qiyamah-generation/generation-service';

/** Why a commission did not come back. Never the provider's own words. */
export type CommissionFailure =
  | 'DEMAND_REFUSED'      // the demand itself could not be accepted
  | 'BUSY'                // the Empire's generation is at its limit
  | 'GENERATION_FAILED'   // it was attempted and did not produce
  | 'STORAGE_FAILED';     // it produced and could not be kept

export interface CommissionedScene {
  /** The scene this picture belongs to, so order can never be guessed at. */
  readonly order: number;
  readonly assetId?: string;
  readonly assetUrl?: string;
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
  readonly demands: readonly SceneDemand[];
}): Promise<readonly CommissionedScene[]> {
  const commissioned: CommissionedScene[] = [];

  for (const demand of [...params.demands].sort((a, b) => a.order - b.order)) {
    const outcome = await generateImage({
      prompt: demand.demandAr,
      creatorId: params.creatorId,
      // The scene's own words, kept so the Vault record says what this picture
      // was for rather than only what was asked of the provider.
      originalIdea: demand.seenAr ?? null,
    });

    if (outcome.status === 'succeeded') {
      commissioned.push({
        order: demand.order,
        assetId: outcome.asset.assetId,
        assetUrl: outcome.asset.assetUrl,
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
