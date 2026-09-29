'use server';

/**
 * AZMA OS — مكمن الغاية: preparing one asset for the platforms a Creator chose.
 *
 * ─── THE ORDER IS THE LAW, AND IT IS NEVER ANOTHER ──────────────────────────
 *
 *   READ THE ASSET → JUDGE EACH PLATFORM → SHOW THE COST → AWAIT APPROVAL →
 *   RESERVE → PRODUCE → SETTLE (or RELEASE) → DEPOSIT.
 *
 *   `planReframe` performs the first three and stops. `executeReframe` performs
 *   the rest and refuses to begin without the Creator's explicit word — it is
 *   `verifyCostApproval` that refuses, the Empire's own gate, not a condition
 *   invented here.
 *
 * ─── WHY UNITS ARE RESERVED AND NOT SPENT ───────────────────────────────────
 *
 *   `CreatorCreditRepository` already has reserve/settle/release. A reframe
 *   that ffmpeg fails to produce is RELEASED, so a Creator is never charged
 *   for a file they did not receive. Charging first and refunding later would
 *   have been a second, worse ledger written beside a correct one.
 *
 * ─── AND WHY THE RESULT IS A DERIVATIVE, NEVER A NEW ASSET ──────────────────
 *
 *   Constitution 9.4: مكمن does not «اختراع نسخة جديدة». The reframed file is
 *   deposited with `parentAssetId` set to the master and `DerivationKind.
 *   RENDERED` — a rendition of the Creator's own work, carrying its lineage,
 *   which is what Article 5.3 requires of anything born in this Empire.
 */

import { cookies } from 'next/headers';
import { verifySession } from '@/src/authentication';
import { getDb, getVaultAsset } from '@/src/persistent-storage';
import { SovereignVaultManager } from '@/src/vault/sovereign-vault-manager';
import { DerivationKind, LifecycleState, SourceChamber } from '@/src/vault/sovereign-vault-types';
import { CreatorCreditRepository } from '@/src/economy/credit-ledger/credit-ledger-repository';
import { buildReframePlan, reframeUnitCost, type ReframePlan } from '@/src/platform-reframe/reframe-plan';
import { resolveTarget } from '@/src/platform-reframe/platform-target';
import { reframeToTarget } from '@/src/platform-reframe/reframe-execution';
import { RETENTION_MS, sweepExpiredRenditions } from '@/src/platform-reframe/retention';

const SESSION_COOKIE = 'azma_session';

async function creator(): Promise<string | null> {
  const id = (await cookies()).get(SESSION_COOKIE)?.value;
  return id ? (verifySession(id)?.creatorId ?? null) : null;
}

export type PlanOutcome =
  | { readonly ok: true; readonly plan: ReframePlan; readonly availableUnits: number }
  | { readonly ok: false; readonly messageAr: string };

/** What would happen, and what it would cost. Nothing is charged or produced. */
export async function planReframe(
  assetId: string,
  platforms: readonly string[],
): Promise<PlanOutcome> {
  const creatorId = await creator();
  if (!creatorId) return { ok: false, messageAr: 'سجّل دخولك أوّلاً.' };
  if (platforms.length === 0) return { ok: false, messageAr: 'اختر منصّةً واحدةً على الأقلّ.' };

  const db = getDb();
  const asset = getVaultAsset(db, assetId);
  if (!asset || asset.subscriberTenantId !== creatorId) {
    return { ok: false, messageAr: 'لا يوجد أصل بهذا المعرّف في خزانتك.' };
  }

  const plan = await buildReframePlan(db, asset, platforms);
  const balance = new CreatorCreditRepository(db).getBalance(creatorId);
  return { ok: true, plan, availableUnits: balance.availableUnits };
}

export type ExecuteOutcome = {
  readonly ok: boolean;
  readonly messageAr: string;
  readonly produced: readonly {
    readonly platform: string;
    readonly label: string;
    readonly assetId: string;
    /** Where the Creator's own browser can fetch it — for the download door. */
    readonly storageUri: string;
  }[];
  readonly refused: readonly { readonly platform: string; readonly label: string; readonly reasonAr: string }[];
  readonly unitsCharged: number;
};

/**
 * Produce the reframed renditions the Creator approved.
 *
 * `approved` is the Creator's explicit word and is required to be `true`;
 * a missing or false value is refused, not treated as consent.
 */
export async function executeReframe(
  assetId: string,
  platforms: readonly string[],
  approved: boolean,
): Promise<ExecuteOutcome> {
  const none = { produced: [], refused: [], unitsCharged: 0 };
  const creatorId = await creator();
  if (!creatorId) return { ok: false, messageAr: 'سجّل دخولك أوّلاً.', ...none };
  if (approved !== true) {
    return { ok: false, messageAr: 'لم تُمنح الموافقة على الخصم — لم يُنفَّذ شيء.', ...none };
  }

  const db = getDb();
  const asset = getVaultAsset(db, assetId);
  if (!asset || asset.subscriberTenantId !== creatorId) {
    return { ok: false, messageAr: 'لا يوجد أصل بهذا المعرّف في خزانتك.', ...none };
  }

  // The plan is rebuilt here rather than trusted from the browser: a cost a
  // page sends back is a cost a page could change.
  const plan = await buildReframePlan(db, asset, platforms);
  const toReframe = plan.rows.filter((r) => r.verdict === 'reframe' && r.target);
  if (toReframe.length === 0) {
    return { ok: true, messageAr: 'لا شيء يحتاج إعادة تأطير — لم يُخصم شيء.', ...none };
  }

  const ledger = new CreatorCreditRepository(db);
  const unit = reframeUnitCost();
  const balance = ledger.getBalance(creatorId);
  if (balance.availableUnits < unit * toReframe.length) {
    return {
      ok: false,
      messageAr: `رصيدك لا يكفي: المطلوب ${unit * toReframe.length} وحدة والمتاح ${balance.availableUnits}.`,
      ...none,
    };
  }

  const vault = new SovereignVaultManager();
  const produced: { platform: string; label: string; assetId: string; storageUri: string }[] = [];
  const refused: { platform: string; label: string; reasonAr: string }[] = [];
  let unitsCharged = 0;

  for (const row of toReframe) {
    const target = resolveTarget(row.platform);
    if (!target) {
      refused.push({ platform: row.platform, label: row.label, reasonAr: row.spokenAr });
      continue;
    }

    const operationId = `reframe_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    // One reservation per platform, because one platform is one charge and one
    // file. A single reservation for all of them would charge for a failure.
    const reservation = ledger.reserve(creatorId, unit, operationId, {
      capability: 'PLATFORM_REFRAME', platform: target.platform, sourceAssetId: assetId,
    });

    const outcome = await reframeToTarget(asset.secureStorageUri, target, operationId);
    if (!outcome.ok) {
      ledger.release(reservation.reservationId, outcome.reason);
      refused.push({
        platform: target.platform,
        label: target.label,
        reasonAr: outcome.reason === 'source-missing'
          ? 'لم نجد بايتات هذا الأصل على الخادم — لم يُخصم شيء.'
          : 'تعذّر إعداد النسخة، ولم يُخصم شيء.',
      });
      continue;
    }

    try {
      const rendition = await vault.depositAsset({
        subscriberTenantId: creatorId,
        operationId,
        capabilityTarget: asset.capabilityTarget,
        assetFamily: asset.assetFamily,
        secureStorageUri: outcome.storageUri,
        // The lineage Article 5.3 requires: a rendition of the Creator's own
        // master, never an asset that appeared from nowhere.
        parentAssetId: asset.assetId,
        derivation: DerivationKind.RENDERED,
        creationChamber: SourceChamber.MAKMAN_AL_GHAYAH,
        lifecycleState: LifecycleState.FINAL,
        createdBy: creatorId,
        // ── ITS END IS SET AT ITS BIRTH ──────────────────────────────────
        //   FOUNDER: «الاحتفاظ به داخل الخزانة لمدة 15 يوم ثم يحذف».
        //   Stamped here and nowhere else, so a rendition can never exist
        //   without an ending while the master beside it has none.
        expiresAtMs: Date.now() + RETENTION_MS,
        metadata: {
          reframedForPlatform: target.platform,
          reframedForLabel: target.label,
          targetAspectRatio: target.aspectRatio,
          targetWidth: target.width,
          targetHeight: target.height,
          sourceAssetId: asset.assetId,
        },
      });
      ledger.settle(reservation.reservationId, unit, { assetId: rendition.assetId });
      unitsCharged += unit;
      produced.push({
        platform: target.platform,
        label: target.label,
        assetId: rendition.assetId,
        storageUri: outcome.storageUri,
      });
    } catch (err) {
      // The file exists but could not be recorded. Releasing is the only
      // honest end: a Creator must not pay for a rendition the Vault refused.
      ledger.release(reservation.reservationId, 'deposit-failed');
      refused.push({
        platform: target.platform,
        label: target.label,
        reasonAr: 'أُعدّت النسخة ولم تُقبل في خزانتك — لم يُخصم شيء.',
      });
      console.error('[Makman reframe] deposit failed:', err instanceof Error ? err.message : String(err));
    }
  }

  return {
    ok: produced.length > 0,
    messageAr: produced.length > 0
      ? `جُهِّزت ${produced.length} نسخة — وخُصمت ${unitsCharged} وحدة.`
      : 'لم تُجهَّز أيّ نسخة، ولم يُخصم شيء.',
    produced,
    refused,
    unitsCharged,
  };
}

export interface RetentionView {
  readonly dueSoon: readonly { readonly label: string; readonly daysLeft: number }[];
  readonly destroyed: readonly { readonly label: string }[];
  readonly spared: readonly { readonly label: string; readonly reasonAr: string }[];
}

/**
 * Run the retention sweep for the Creator who just opened the Chamber, and
 * report what it found — so they are TOLD, which is the Founder's condition
 * on the act: «الإتلاف النهائي بعد إخبار صاحب الأصل».
 *
 * It runs here because this Empire has no background worker and says so in its
 * own source. The one limit is stated rather than hidden: a Creator who never
 * returns leaves their expired renditions in place — lingering, never served
 * past their end, and never resurrected.
 */
export async function sweepRetention(): Promise<RetentionView> {
  const empty: RetentionView = { dueSoon: [], destroyed: [], spared: [] };
  const creatorId = await creator();
  if (!creatorId) return empty;
  try {
    const sweep = sweepExpiredRenditions(getDb(), creatorId);
    return {
      dueSoon: sweep.dueSoon.map((r) => ({ label: r.label, daysLeft: r.daysLeft })),
      destroyed: sweep.destroyed.map((r) => ({ label: r.label })),
      spared: sweep.spared.map((r) => ({ label: r.label, reasonAr: r.reasonAr })),
    };
  } catch (err) {
    // A sweep that cannot run must not stop a Creator entering their Chamber.
    console.error('[Makman retention] sweep failed:', err instanceof Error ? err.message : String(err));
    return empty;
  }
}
