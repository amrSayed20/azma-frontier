/**
 * AZMA OS — THE ONE OPERATION AUTHORITY FOR حجرة القيامة
 *
 * ─── WHAT THIS REPLACES ─────────────────────────────────────────────────────
 *
 *   The chamber's six acts were discoverable in THREE places: four in a media
 *   type chooser, upscaling only inside a result panel, and editing twice —
 *   once as an act and again as a per-asset panel in the gallery. A Creator
 *   who had produced nothing could not learn that upscaling existed.
 *
 *   And availability was one boolean for all of them:
 *
 *       const generationAvailable = !!process.env.MAGIC_HOUR_API_KEY
 *
 *   One unrelated key standing in for six different questions. It happens to
 *   be right today — because every designated model routes to `magic-hour`,
 *   and because the one gateway that does not (`openai`) has no fleet member.
 *   It would be wrong the moment either changes, and «right by coincidence» is
 *   not a property an availability signal may have.
 *
 * ─── WHAT AVAILABILITY MEANS HERE ───────────────────────────────────────────
 *
 *   An operation is available when BOTH are true, each read from the authority
 *   that owns it:
 *
 *       · the fleet designates a model for it, and authorises that model
 *         (`productionAuthorized && active`)                — the fleet's word
 *       · this process can dispatch to that model's gateway  — the bootstrap's
 *
 *   Nothing is marked available because a button exists, a route exists, or an
 *   adapter is imported. And historical production proof is reported in a
 *   SEPARATE field: six of these operations produced real assets in September,
 *   and that is a fact about the past, not a claim about today.
 */

import {
  type QiyamahOperationId,
  QIYAMAH_OPERATION_IDS,
  designatedBindingFor,
  briefContractFor,
  operationTakesBrief,
  operationScaffolds,
  type BriefContract,
} from './prompt-contract';
import { configuredGatewayIds } from '../core/sovereign-ai-integration/provider-bootstrap';

/** How a Creator reaches the operation — by what they already have. */
export type OperationGroup =
  /** Needs nothing but words. */
  | 'from-idea'
  /** Needs an asset the Creator already owns. */
  | 'on-my-asset';

/** What the operation needs before it can run. Drawn as chips on its card. */
export type OperationInput = 'brief' | 'asset' | 'style' | 'aspect' | 'duration' | 'motion-model';

export type OperationAvailability =
  /** The fleet authorises it and this process can reach its gateway. */
  | 'AVAILABLE'
  /** A model is designated but the fleet has not authorised it. */
  | 'NOT_AUTHORIZED'
  /** Authorised, but this process holds no credential for its gateway. */
  | 'NO_CREDENTIAL'
  /** The fleet designates nothing for it. */
  | 'NO_DESIGNATED_MODEL';

export interface OperationDescriptor {
  readonly id: QiyamahOperationId;
  readonly group: OperationGroup;
  readonly nameAr: string;
  /** What the Creator gets — their words, never a provider's. */
  readonly outcomeAr: string;
  readonly glyph: string;
  readonly inputs: readonly OperationInput[];
  /** The named step the existing estimator prices. Never a price. */
  readonly costStep: string;
  /** Whether the chamber's own records show it produced before. Past tense. */
  readonly historicallyProven: boolean;
}

/**
 * The six acts. Declared once.
 *
 * `historicallyProven` is read from the Phase 0 forensic measurement of the
 * production database (vault_assets · creation_chamber = QIYAMAH, by
 * `derivation` and `mutationProviderId`), not from the presence of code.
 */
const DESCRIPTORS: readonly OperationDescriptor[] = [
  {
    id: 'image', group: 'from-idea', nameAr: 'صورة', glyph: '◈',
    outcomeAr: 'مشهدٌ أصليّ من فكرتك',
    inputs: ['brief', 'style', 'aspect'],
    costStep: 'IMAGE_GENERATION', historicallyProven: true,
  },
  {
    id: 'infographic', group: 'from-idea', nameAr: 'إنفوغرافيك', glyph: '▤',
    outcomeAr: 'حرفٌ مقروء وترتيبٌ منظّم',
    inputs: ['brief', 'aspect'],
    costStep: 'INFOGRAPHIC', historicallyProven: true,
  },
  {
    id: 'video', group: 'from-idea', nameAr: 'فيديو', glyph: '▶',
    outcomeAr: 'مقطعٌ تختار مدّته وامتداده',
    inputs: ['brief', 'style', 'aspect', 'duration'],
    costStep: 'VIDEO_GENERATION', historicallyProven: true,
  },
  {
    id: 'edit', group: 'on-my-asset', nameAr: 'تعديل', glyph: '✎',
    outcomeAr: 'غيّر في أصلٍ تملكه',
    inputs: ['asset', 'brief'],
    costStep: 'IMAGE_EDIT', historicallyProven: true,
  },
  {
    id: 'animate', group: 'on-my-asset', nameAr: 'تحريك', glyph: '◉',
    outcomeAr: 'تُبعث الحركة في صورةٍ لديك',
    inputs: ['asset', 'brief', 'motion-model', 'duration'],
    costStep: 'MOTION', historicallyProven: true,
  },
  {
    id: 'upscale', group: 'on-my-asset', nameAr: 'رفع الدقّة', glyph: '⤢',
    outcomeAr: 'تفاصيلُ أوضح — بلا تعليمة',
    inputs: ['asset'],
    costStep: 'UPSCALE_2X', historicallyProven: true,
  },
];

export function operationDescriptor(id: QiyamahOperationId): OperationDescriptor {
  const found = DESCRIPTORS.find((d) => d.id === id);
  if (!found) throw new Error(`no descriptor for operation '${id}'`);
  return found;
}

/**
 * One operation as the chamber must present it — availability included, and
 * the reason when it cannot run.
 *
 * Carries NO price: the existing estimator owns that, and this module names
 * only the step to ask it about. The deferred financial authority is untouched.
 */
export interface OperationState extends OperationDescriptor {
  readonly availability: OperationAvailability;
  /** True only for AVAILABLE. The one boolean a screen may branch on. */
  readonly runnable: boolean;
  /** Said to the Creator when it cannot run. Empty when it can. */
  readonly reasonAr: string;
  /** For an engineer's log and the acceptance report. Never Creator-facing. */
  readonly detailEn: string;
  readonly brief: BriefContract;
  readonly takesBrief: boolean;
  readonly scaffolds: boolean;
}

const REASON_AR: Readonly<Record<OperationAvailability, string>> = {
  AVAILABLE: '',
  NOT_AUTHORIZED: 'لم تُصرّح الإمبراطوريّةُ بنموذج هذه العمليّة بعد.',
  NO_CREDENTIAL: 'الإمبراطوريّةُ لا تملك اعتماداً يَصل إلى محرّك هذه العمليّة الآن.',
  NO_DESIGNATED_MODEL: 'لم يُخصَّص نموذجٌ لهذه العمليّة بعد.',
};

/** Judge one operation. Pure except for the gateway list handed in. */
export function stateOfOperation(
  id: QiyamahOperationId,
  gateways: readonly string[],
  styleId?: string | null,
): OperationState {
  const d = operationDescriptor(id);
  const binding = designatedBindingFor(id);

  let availability: OperationAvailability;
  let detailEn: string;
  if (!binding.modelId || !binding.gatewayId) {
    availability = 'NO_DESIGNATED_MODEL';
    detailEn = `no designated model — ${binding.whyEn}`;
  } else if (!binding.authorized) {
    availability = 'NOT_AUTHORIZED';
    detailEn = `model '${binding.modelId}' is not productionAuthorized && active`;
  } else if (!gateways.includes(binding.gatewayId)) {
    availability = 'NO_CREDENTIAL';
    detailEn = `gateway '${binding.gatewayId}' is not configured in this process`;
  } else {
    availability = 'AVAILABLE';
    detailEn = `model '${binding.modelId}' on gateway '${binding.gatewayId}'`;
  }

  return {
    ...d,
    availability,
    runnable: availability === 'AVAILABLE',
    reasonAr: REASON_AR[availability],
    detailEn,
    brief: briefContractFor(id, styleId),
    takesBrief: operationTakesBrief(id),
    scaffolds: operationScaffolds(id),
  };
}

/**
 * Every operation, judged — what `page.tsx` hands the browser.
 *
 * Reads the gateway list ONCE so six operations cannot disagree about what
 * this process can reach.
 */
export function qiyamahOperations(styleId?: string | null): readonly OperationState[] {
  const gateways = configuredGatewayIds();
  return QIYAMAH_OPERATION_IDS.map((id) => stateOfOperation(id, gateways, styleId));
}

/** The groups, in the order a Creator meets them. */
export const OPERATION_GROUPS: readonly {
  readonly id: OperationGroup;
  readonly titleAr: string;
  readonly noteAr: string;
}[] = [
  { id: 'from-idea', titleAr: '◈ أصنعُ من فكرة', noteAr: 'لا تحتاج أصلاً — تعليمتُك وحدها' },
  { id: 'on-my-asset', titleAr: '◈ أعملُ على أصلٍ لي', noteAr: 'المدخلُ من خزانتك السياديّة' },
];

/**
 * ─── D-7 · THE CONTRADICTORY FLAGS, DECLARED RATHER THAN DECIDED ────────────
 *
 *   Three fleet entries carry `active: true` with `productionAuthorized:
 *   false` — `z-image-turbo`, `ltx-2-3`, `kling-3-0`. Two booleans for one
 *   judgement, and each is one value away from ordinary routing.
 *
 *   Their INTENDED status is the Chief Architect's to rule, not an engineer's,
 *   and the directive is explicit: «Do not automatically authorize currently
 *   unauthorized models.» So nothing here changes a flag.
 *
 *   What is enforced instead is the invariant that actually protects a
 *   Creator: an unauthorized model must never be offered as an ordinary
 *   production choice. `selectableModelIds` is the one list any chooser may
 *   draw from, and it requires BOTH flags — so the contradiction cannot reach
 *   a screen while it awaits a ruling. A test guards it.
 */
export function selectableModelIds(
  fleet: readonly { modelId: string; productionAuthorized: boolean; active: boolean }[],
): readonly string[] {
  return fleet.filter((m) => m.productionAuthorized && m.active).map((m) => m.modelId);
}

/** The entries whose two flags disagree — reported, never silently resolved. */
export function contradictoryAuthorizationFlags(
  fleet: readonly { modelId: string; productionAuthorized: boolean; active: boolean }[],
): readonly string[] {
  return fleet.filter((m) => m.active && !m.productionAuthorized).map((m) => m.modelId);
}
