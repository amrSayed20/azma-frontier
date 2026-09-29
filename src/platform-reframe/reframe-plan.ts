/**
 * AZMA OS — WHAT EACH PLATFORM NEEDS, AND WHAT IT COSTS, BEFORE ANYTHING IS SPENT
 *
 * ─── THE FOUNDER'S THREE VERDICTS ───────────────────────────────────────────
 *
 *   «تستبدل مقاسات الأصل الواحد قدر المستطاع، وأمّا ما لا تستطيع تغيير مقاسه
 *   لأيّ سبب فتعرض الأمر على المنشئ صاحب الأصل — إن أراد إعادة التوليد
 *   يتناسب مع المنصّة المطلوبة يؤكّد بعد حساب التكلفة.»
 *
 *   Nothing here executes, charges, or writes. It answers one question —
 *   «what would happen to this asset on these platforms?» — so the Creator can
 *   read the whole answer before approving any part of it.
 *
 * ─── EVERY JUDGEMENT COMES FROM SOMETHING THAT ALREADY EXISTED ──────────────
 *
 *   the shape        ← `resolveAssetShape`        (the asset's own bytes)
 *   the verdict      ← `assessMasterAdaptability` (platform-adapter)
 *   the rectangle    ← `resolveTarget`            (platform-adapter + encoder)
 *   the price        ← `OPERATION_CONSUMPTION`    (the Founder's own table)
 *
 *   This file composes them. It decides nothing of its own.
 */

import type { DatabaseSync } from 'node:sqlite';
import type { VaultAsset } from '../vault/sovereign-vault-types';
import { resolveAssetShape } from '../asset-dimensions/resolve-asset-dimensions';
import { assessMasterAdaptability } from '../sovereign-model-selection/platform-adapter';
import { resolveTarget, type PlatformTarget } from './platform-target';
import { OPERATION_CONSUMPTION } from '../economy/pricing/sovereign-value-balance';

/** What the Empire will do about one platform. */
export type ReframeVerdict =
  /** The asset already is this shape. Nothing is produced and nothing is charged. */
  | 'fits-as-is'
  /** Scale and crop, preserving the ratio. A charge, and no new generation. */
  | 'reframe'
  /** The orientation changes; only a new generation can serve it honestly. */
  | 'needs-regeneration'
  /** The Empire has no rectangle for this platform, or no size for this asset. */
  | 'cannot-say';

export interface PlatformPlanRow {
  readonly platform: string;
  readonly label: string;
  readonly verdict: ReframeVerdict;
  /** The target rectangle, when there is one. */
  readonly target: PlatformTarget | null;
  /** Balance units this row would consume. Zero unless the verdict is `reframe`. */
  readonly balanceCost: number;
  /** Said to the Creator, in their own language. Never a code. */
  readonly spokenAr: string;
}

export interface ReframePlan {
  readonly assetId: string;
  /** The master's own ratio, or null when its bytes could not say. */
  readonly masterAspectRatio: string | null;
  readonly rows: readonly PlatformPlanRow[];
  /** What pressing «approve» would actually deduct. */
  readonly totalBalanceCost: number;
  /** How many rows would produce a file. */
  readonly reframeCount: number;
}

/** The Founder's figure, read from his own table rather than written here. */
export function reframeUnitCost(): number {
  const rule = OPERATION_CONSUMPTION.find((r) => r.capability === 'PLATFORM_REFRAME');
  // A missing rule is a broken Empire, not a free operation. Never default to 0.
  if (!rule) throw new Error('PLATFORM_REFRAME has no approved consumption rule');
  return rule.balancePerUnit;
}

const SPOKEN: Record<ReframeVerdict, (label: string) => string> = {
  'fits-as-is':        (l) => `يصلح لـ${l} كما هو — بلا تكلفة.`,
  'reframe':           (l) => `يُعاد تأطيره لـ${l} — تُقتطع الحواف وتبقى الجودة كما هي.`,
  'needs-regeneration':(l) => `لا يمكن إعادة تأطيره لـ${l}: الاتجاه يتغيّر، ويحتاج توليداً جديداً.`,
  'cannot-say':        (l) => `لا نعرف كيف نجهّزه لـ${l}.`,
};

/**
 * Read the asset, judge every platform, and price the result.
 *
 * Reading the shape may MEASURE and persist it — that is the one write this
 * function permits, and it is a correction of the Vault's own record, never a
 * charge and never a production.
 */
export async function buildReframePlan(
  db: DatabaseSync,
  asset: VaultAsset,
  platforms: readonly string[],
): Promise<ReframePlan> {
  const shape = await resolveAssetShape(db, asset);
  const master = shape.aspectRatio;
  const unit = reframeUnitCost();

  const rows: PlatformPlanRow[] = [];
  for (const platform of platforms) {
    const target = resolveTarget(platform);
    const label = target?.label ?? platform;

    // Two different unknowns, and neither is guessed past: an asset whose size
    // we cannot read, and a platform we have no rectangle for.
    if (!target || !master) {
      rows.push({ platform, label, verdict: 'cannot-say', target, balanceCost: 0,
        spokenAr: SPOKEN['cannot-say'](label) });
      continue;
    }

    const adaptability = assessMasterAdaptability(master, target.aspectRatio);
    const verdict: ReframeVerdict =
      adaptability === 'direct-reuse' ? 'fits-as-is'
      : adaptability === 'crop-adapt' ? 'reframe'
      : 'needs-regeneration';

    rows.push({
      platform: target.platform,
      label,
      verdict,
      target,
      balanceCost: verdict === 'reframe' ? unit : 0,
      spokenAr: SPOKEN[verdict](label),
    });
  }

  return {
    assetId: asset.assetId,
    masterAspectRatio: master,
    rows,
    totalBalanceCost: rows.reduce((sum, r) => sum + r.balanceCost, 0),
    reframeCount: rows.filter((r) => r.verdict === 'reframe').length,
  };
}
