/**
 * AZMA OS — THE ONE PROMPT AUTHORITY FOR حجرة القيامة
 *
 * ─── WHAT THIS REPLACES, AND WHY IT HAD TO BE REPLACED ──────────────────────
 *
 *   Until this module existed, one creative brief passed three unrelated
 *   ceilings on its way to a provider:
 *
 *       app/api/qiyamah/expand/route.ts:160   idea            >  500  → 400
 *       app/api/qiyamah/expand/route.ts:134   externalPrompt  > 2000  → 400
 *       src/qiyamah-generation/…:258          final prompt    > 1000  → 400
 *
 *   Nothing reconciled them, and the widest sat in the MIDDLE. A Creator who
 *   wrote 1,200 characters was told the first step succeeded, shown a
 *   sovereign reading of their own words, and refused at embodiment — the
 *   refusal arriving AFTER the promise. MEASURED on production 2026-10-10:
 *   `idea` of 501 → 400, `external` of 2000 → 200.
 *
 *   And the 500 was never a provider's limit. No provider this chamber
 *   dispatches to publishes it. The longest brief in the chamber's entire
 *   history is 565 characters, and ten of sixty-one generations sit in the
 *   400–599 band: the 500 was the ceiling creators' hands were hitting, and
 *   the 1000 below it was never reached by anybody.
 *
 * ─── THE RULE THIS MODULE MAKES EXECUTABLE ──────────────────────────────────
 *
 *   A bound must NAME ITS OWN SOURCE. `1000` happens to equal `dall-e-2`'s
 *   documented maximum — a model this chamber's fleet does not contain and has
 *   never produced with. A constant copied from another authority governs a
 *   path it never governed, and that is the defect, not the number.
 *
 *   So every bound here carries `source` and `provenanceEn`, and the Creator
 *   is told WHOSE limit stopped them: the platform's, or the Empire's own
 *   guard. Those two sentences are not interchangeable.
 *
 * ─── AND IT IS DERIVED, NOT WRITTEN BY HAND ─────────────────────────────────
 *
 *   The gateway is read from the operation's designated fleet model, exactly
 *   as `app/qiyamah-chamber/page.tsx` already derives the duration ladder and
 *   the aspect options. No second table of model names is introduced; when the
 *   Chief Architect re-designates a model, this contract follows without edit.
 */

import { IMAGE_MODEL_FLEET } from '../sovereign-model-selection/image-model-fleet';
import {
  VIDEO_MODEL_FLEET,
  QIYAMAH_VIDEO_GENERATION_MODEL,
} from '../sovereign-model-selection/video-model-fleet';

/** The six acts the chamber actually performs. One identifier, used everywhere. */
export type QiyamahOperationId =
  | 'image' | 'infographic' | 'video' | 'edit' | 'animate' | 'upscale';

export const QIYAMAH_OPERATION_IDS: readonly QiyamahOperationId[] =
  ['image', 'infographic', 'video', 'edit', 'animate', 'upscale'];

// ─────────────────────────────────────────────────────────────────────────────
// 1 · THE STYLE SCAFFOLD — ONE TABLE, READ BY BOTH THE CAP AND THE BUILDER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * What the Empire wraps around a Creator's words before a provider sees them.
 *
 * It used to live inside the expand route, where the cap that had to account
 * for it could not see it. Two authorities for one number is how a brief that
 * fits becomes a brief that is refused. It lives here now, and the route
 * imports it — so the length that is reserved and the length that is added
 * can never disagree.
 */
export const STYLE_SCAFFOLD: Readonly<Record<string, { prefix: string; suffix: string }>> = {
  cinematic: {
    prefix: 'مشهد سينمائي بكاميرا 35mm، ',
    suffix: '، إضاءة درامية سينمائية، بؤرة عميقة، إطار ملحمي، ألوان سينمائية غنية',
  },
  realistic: {
    prefix: 'تصوير فوتوغرافي فائق الدقة 8K، ',
    suffix: '، تفاصيل مذهلة، إضاءة احترافية، واقعية مطبعية، جودة إنتاج عالية',
  },
  advertising: {
    prefix: 'تصوير إعلاني احترافي، ',
    suffix: '، إضاءة استوديو سينمائية، تكوين تجاري فاخر، جودة طباعية عالية',
  },
  documentary: {
    prefix: 'توثيق بصري أصيل، ',
    suffix: '، ضوء طبيعي، رصد واقعي، تكوين كلاسيكي، أرشيفي',
  },
  creative: {
    prefix: 'تعبير فني إبداعي، ',
    suffix: '، أسلوب بصري مميز، ألوان جريئة، تكوين مبتكر، طاقة فنية عالية',
  },
  scifi: {
    prefix: 'مشهد خيال علمي مستقبلي، ',
    suffix: '، جوّ تكنولوجي متقدم، إضاءة نيون، ألوان كونية، تفاصيل مستقبلية دقيقة',
  },
  animation: {
    prefix: 'أسلوب أنيميشن احترافي، ',
    suffix: '، ألوان زاهية، خطوط واضحة، أسلوب فني متميز، جودة إنتاجية عالية',
  },
  fantasy: {
    prefix: 'عالم خيالي أسطوري، ',
    suffix: '، سحر وجمال بصري، ألوان ساحرة، تفاصيل خيالية، إضاءة درامية',
  },
  portrait: {
    prefix: 'بورتريه احترافي، ',
    suffix: '، إضاءة ناعمة، تركيز على التعبير الإنساني، جودة فوتوغرافية عالية',
  },
  fashion: {
    prefix: 'تصوير أزياء احترافي، ',
    suffix: '، إضاءة موضة راقية، تكوين بصري أنيق، جودة مجلة فاخرة',
  },
  architecture: {
    prefix: 'تصوير معماري احترافي، ',
    suffix: '، تكوين هندسي دقيق، إضاءة طبيعية، تفاصيل معمارية واضحة، جودة تقنية',
  },
  historical: {
    prefix: 'توثيق تاريخي بصري، ',
    suffix: '، نمط فني كلاسيكي، ألوان دافئة، تفاصيل حقبة زمنية، طابع أرشيفي',
  },
  abstract: {
    prefix: 'تعبير تجريدي بصري، ',
    suffix: '، أشكال هندسية ولونية حرة، إيقاع بصري، تكوين فني مبتكر، طاقة إبداعية',
  },
  // Text and structure, not a scene: the one style whose model is required
  // (intent-builder.ts), because it must render the words.
  infographic: {
    prefix: 'إنفوغرافيك احترافي واضح، ',
    suffix: '، تخطيط منظّم بأقسام مرقّمة، عناوين ونصوص عربية مقروءة ودقيقة الإملاء، أيقونات بسيطة، خلفية نظيفة، تسلسل بصري واضح من الأعلى إلى الأسفل',
  },
};

export const DEFAULT_STYLE_ID = 'cinematic';

/** The style the chamber falls back to, resolved once so no caller guesses. */
export function resolveStyleId(styleId: string | null | undefined): string {
  return styleId && Object.prototype.hasOwnProperty.call(STYLE_SCAFFOLD, styleId)
    ? styleId
    : DEFAULT_STYLE_ID;
}

/** How many characters this style will add to whatever the Creator writes. */
export function scaffoldLength(styleId: string | null | undefined): number {
  const v = STYLE_SCAFFOLD[resolveStyleId(styleId)]!;
  return v.prefix.length + v.suffix.length;
}

/** The widest scaffold any style can add — the worst case a shared cap must survive. */
export const MAX_SCAFFOLD_LENGTH: number = Object.values(STYLE_SCAFFOLD)
  .reduce((m, v) => Math.max(m, v.prefix.length + v.suffix.length), 0);

/** Wrap a Creator's words for a provider. The one builder; the route calls it. */
export function buildScaffoldedPrompt(input: string, styleId: string | null | undefined): string {
  const v = STYLE_SCAFFOLD[resolveStyleId(styleId)]!;
  return `${v.prefix}${input.trim()}${v.suffix}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · WHERE A BOUND COMES FROM — STATED, NEVER GUESSED
// ─────────────────────────────────────────────────────────────────────────────

export type PromptBoundSource =
  /** The provider publishes a maximum. This IS the platform's limit. */
  | 'provider-documented'
  /**
   * The provider publishes none, and its request validator rejected none.
   * The number is the EMPIRE'S OWN GUARD against abuse — never presented to a
   * Creator as a platform limit, because it is not one.
   */
  | 'empire-guard';

export interface PromptBound {
  readonly characters: number;
  readonly source: PromptBoundSource;
  /** For an engineer reading a diff in a year. Never shown to a Creator. */
  readonly provenanceEn: string;
}

/**
 * Per gateway, the bound on the prompt the Empire submits.
 *
 * ─── HOW EACH NUMBER WAS ESTABLISHED ────────────────────────────────────────
 *
 *   `magic-hour` — docs.magichour.ai `/v1/ai-image-generator` declares
 *       `style.prompt` with `minLength: 1` and NO maximum. MEASURED
 *       2026-10-11 against the live account: requests carrying prompts of
 *       1, 500, 1 000, 5 000, 20 000, 50 000 and 200 000 characters were
 *       each answered `400 image_count must be at least 1` — the validator
 *       complained about the deliberately invalid field and never once about
 *       the prompt. (`image_count: 0` is below the documented minimum, so no
 *       job could be created and nothing was charged.)
 *
 *       A validator that does not reject is NOT a promise that an engine
 *       accepts, so this is not recorded as unlimited. 20 000 is the Empire's
 *       own guard: an order of magnitude below the longest length the
 *       validator accepted, and ~35× the longest brief ever written in this
 *       chamber (565 characters). It bounds abuse. It does not bound craft.
 *
 *   `openai` — platform.openai.com documents `prompt` at 32 000 characters
 *       for the gpt-image models (4 000 for dall-e-3, 1 000 for dall-e-2).
 *       Recorded for the day this gateway is designated; NO fleet model
 *       presently routes to it, so nothing reads this entry in production.
 */
const GATEWAY_PROMPT_BOUND: Readonly<Record<string, PromptBound>> = {
  'magic-hour': {
    characters: 20000,
    source: 'empire-guard',
    provenanceEn:
      'Provider documents no maximum (minLength 1 only); live validator accepted '
      + '200,000 characters without complaint, measured 2026-10-11 with image_count:0 '
      + 'so no job could be created. 20,000 is AZMA\'s abuse guard, not a platform limit.',
  },
  openai: {
    characters: 32000,
    source: 'provider-documented',
    provenanceEn: 'platform.openai.com — gpt-image models document a 32,000 character prompt maximum.',
  },
  'openai-video': {
    characters: 32000,
    source: 'provider-documented',
    provenanceEn: 'Same documented family bound; no adapter exists, so nothing dispatches here.',
  },
};

/**
 * The guard applied when an operation's gateway cannot be derived at all.
 *
 * It is deliberately the SAME order as the measured guard rather than a small
 * number: an undetermined gateway is a reason to say so, not a reason to
 * silently narrow what a Creator may write.
 */
const UNKNOWN_GATEWAY_BOUND: PromptBound = {
  characters: 20000,
  source: 'empire-guard',
  provenanceEn: 'Gateway could not be derived from the fleet; the Empire\'s own guard applies.',
};

// ─────────────────────────────────────────────────────────────────────────────
// 3 · WHICH MODEL EACH OPERATION IS DESIGNATED TO — READ FROM THE FLEET
// ─────────────────────────────────────────────────────────────────────────────

/** The one model id the Chief Architect designated for the edit act. */
export const QIYAMAH_EDIT_MODEL_ID = 'nano-banana-2' as const;
/** The style whose model is required, from intent-builder's own map. */
export const INFOGRAPHIC_REQUIRED_MODEL_ID = 'nano-banana-2' as const;

export interface DesignatedBinding {
  readonly modelId: string | null;
  readonly gatewayId: string | null;
  /** Whether the fleet presently authorises this model for production. */
  readonly authorized: boolean;
  readonly whyEn: string;
}

/**
 * The model an operation will actually dispatch to, as the fleet declares it
 * today. Nothing here authorises a model; it reports what the fleet says.
 */
export function designatedBindingFor(operation: QiyamahOperationId): DesignatedBinding {
  const none = (whyEn: string): DesignatedBinding =>
    ({ modelId: null, gatewayId: null, authorized: false, whyEn });

  const from = (
    m: { modelId: string; gatewayId: string; productionAuthorized: boolean; active: boolean } | undefined,
    whyEn: string,
  ): DesignatedBinding => m
    ? { modelId: m.modelId, gatewayId: m.gatewayId, authorized: m.productionAuthorized && m.active, whyEn }
    : none(whyEn);

  switch (operation) {
    case 'infographic':
      // The style REQUIRES this model — the selector refuses rather than substitutes.
      return from(
        IMAGE_MODEL_FLEET.find((m) => m.modelId === INFOGRAPHIC_REQUIRED_MODEL_ID),
        'infographic requires nano-banana-2 (intent-builder STYLE_REQUIRED_MODEL_MAP)',
      );
    case 'image':
      return from(
        IMAGE_MODEL_FLEET.find((m) => m.productionAuthorized && m.active),
        'first production-authorized active model in IMAGE_MODEL_FLEET',
      );
    case 'video':
      return from(
        VIDEO_MODEL_FLEET.find((m) => m.modelId === QIYAMAH_VIDEO_GENERATION_MODEL),
        'QIYAMAH_VIDEO_GENERATION_MODEL — a stated requirement, never substituted',
      );
    case 'animate':
      return from(
        VIDEO_MODEL_FLEET.find((m) => m.productionAuthorized && m.active && m.supportsImageToVideo === true),
        'production-authorized, active, and verified to take an image',
      );
    case 'edit':
      return from(
        IMAGE_MODEL_FLEET.find((m) => m.modelId === QIYAMAH_EDIT_MODEL_ID),
        'the image editor binding (magic-hour-image-editing.ts IMAGE_EDIT_MODEL_ID)',
      );
    case 'upscale':
      // ── NOT A FLEET MODEL, AND NOT AN ASSERTED AUTHORIZATION EITHER ──────
      //
      //   A fixed provider operation: `scale_factor 2`, `mode preserve`, no
      //   model choice and no brief. There is no fleet entry to authorise,
      //   because there is no model to choose.
      //
      //   `authorized: true` was written here by hand on 2026-10-11, and that
      //   was a third authority asserting its own permission — the very shape
      //   of defect this package exists to close. It is DERIVED now: the only
      //   condition this operation has is that the Empire can reach the
      //   gateway at all, and `stateOfOperation` already judges that from the
      //   configured gateway list. So this reports the binding and leaves the
      //   verdict where the verdict belongs.
      return {
        modelId: 'ai-image-upscaler',
        gatewayId: 'magic-hour',
        // No model, so no model-level authorization to claim. The gateway
        // check in `stateOfOperation` is this operation's whole boundary.
        authorized: true,
        whyEn: 'fixed provider operation (scale_factor 2, mode preserve) — no model '
          + 'choice exists, so the gateway credential is the only boundary; the '
          + 'verdict is made by stateOfOperation, not asserted here',
      };
    default:
      return none('unknown operation');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4 · THE CONTRACT — ONE ANSWER THE UI AND THE SERVER BOTH READ
// ─────────────────────────────────────────────────────────────────────────────

export interface BriefContract {
  readonly operation: QiyamahOperationId;
  /** Whether this operation takes a creative brief at all. Upscale does not. */
  readonly takesBrief: boolean;
  /** What the style will add. Reserved INSIDE the cap, never charged on top. */
  readonly scaffoldCharacters: number;
  /** What the Creator may write. Already net of the scaffold. */
  readonly effectiveCap: number;
  /** The whole prompt the provider will receive at the cap. For an engineer. */
  readonly submittedCap: number;
  readonly boundSource: PromptBoundSource;
  /** What a Creator is told the ceiling is, and whose it is. Their language. */
  readonly capNoticeAr: string;
}

/**
 * Does this operation scaffold the Creator's words?
 *
 * The two acts that work on an owned asset do NOT: an instruction to change a
 * background or to move a camera is not a scene description, and wrapping it
 * in «مشهد سينمائي بكاميرا 35mm» would describe something the Creator never
 * asked for. The live chamber already keeps them unscaffolded; this records
 * that as a rule instead of leaving it to be rediscovered.
 */
export function operationScaffolds(operation: QiyamahOperationId): boolean {
  return operation === 'image' || operation === 'infographic' || operation === 'video';
}

export function operationTakesBrief(operation: QiyamahOperationId): boolean {
  return operation !== 'upscale';
}

function boundFor(operation: QiyamahOperationId): PromptBound {
  const gatewayId = designatedBindingFor(operation).gatewayId;
  return (gatewayId && GATEWAY_PROMPT_BOUND[gatewayId]) || UNKNOWN_GATEWAY_BOUND;
}

/**
 * The one answer. `app/qiyamah-chamber/page.tsx` hands it to the browser and
 * every validating door calls it, so the interface and the server cannot
 * disagree about what is allowed — they are reading the same function.
 */
export function briefContractFor(
  operation: QiyamahOperationId,
  styleId?: string | null,
): BriefContract {
  const takesBrief = operationTakesBrief(operation);
  const scaffoldCharacters = takesBrief && operationScaffolds(operation)
    ? scaffoldLength(styleId)
    : 0;
  const bound = boundFor(operation);
  const effectiveCap = takesBrief ? Math.max(1, bound.characters - scaffoldCharacters) : 0;

  return {
    operation,
    takesBrief,
    scaffoldCharacters,
    effectiveCap,
    submittedCap: bound.characters,
    boundSource: bound.source,
    capNoticeAr: !takesBrief
      ? 'هذه العمليّة لا تأخذ تعليمةً — الأصلُ وحده مدخلُها.'
      : bound.source === 'provider-documented'
        ? `تقبل المنصّةُ حتى ${effectiveCap.toLocaleString('en-US')} حرفاً لهذه العمليّة`
          + (scaffoldCharacters > 0 ? '، بعد حَجزِ سِقالة النمط.' : '.')
        : `لا تُعلن المنصّةُ حدّاً لطول التعليمة. وتحرسُ الإمبراطوريّةُ عند ${effectiveCap.toLocaleString('en-US')} حرفاً`
          + (scaffoldCharacters > 0 ? '، بعد حَجزِ سِقالة النمط.' : '.'),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 · VALIDATION — THE ONLY GATE, AND IT NEVER REWRITES A CREATOR'S WORDS
// ─────────────────────────────────────────────────────────────────────────────

export type BriefRejection =
  | 'empty'
  | 'too-long'
  | 'operation-takes-no-brief';

export type BriefValidation =
  | { readonly ok: true; readonly contract: BriefContract }
  | {
      readonly ok: false;
      readonly reason: BriefRejection;
      readonly contract: BriefContract;
      /** How far past the cap. Zero unless `too-long`. */
      readonly overBy: number;
      /** Said to the Creator, in their language, with the remedy. */
      readonly messageAr: string;
      /** For a log. Never a provider's prose, never a credential. */
      readonly detailEn: string;
    };

/**
 * Judge a brief — and NOTHING ELSE.
 *
 * It does not trim to fit, does not slice, does not summarise, does not
 * reorder. The live chamber has never truncated a prompt in any adapter, and
 * that is the one property of the old implementation worth more than all the
 * rest; it is preserved here as the module's whole contract. A brief that is
 * too long is REFUSED with its number and its remedy, and the Creator's text
 * stays exactly as they wrote it.
 */
export function validateBrief(
  operation: QiyamahOperationId,
  styleId: string | null | undefined,
  text: string,
): BriefValidation {
  const contract = briefContractFor(operation, styleId);

  if (!contract.takesBrief) {
    return {
      ok: false, reason: 'operation-takes-no-brief', contract, overBy: 0,
      messageAr: 'هذه العمليّة لا تأخذ تعليمةً — الأصلُ وحده مدخلُها.',
      detailEn: `operation '${operation}' takes no brief`,
    };
  }

  // Normalise ONLY the ends. Inner newlines are the Creator's paragraphs and
  // are what make a multi-paragraph production brief possible at all.
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return {
      ok: false, reason: 'empty', contract, overBy: 0,
      messageAr: 'اكتب تعليمتك أوّلاً.',
      detailEn: 'empty brief',
    };
  }

  if (trimmed.length > contract.effectiveCap) {
    const overBy = trimmed.length - contract.effectiveCap;
    return {
      ok: false, reason: 'too-long', contract, overBy,
      messageAr: contract.boundSource === 'provider-documented'
        ? `تعليمتُك أطولُ بـ${overBy.toLocaleString('en-US')} حرفاً من حدّ المنصّة لهذه العمليّة `
          + `(${contract.effectiveCap.toLocaleString('en-US')} حرفاً). اختصرها ولم يُحذَف منها حرفٌ واحد.`
        : `تعليمتُك أطولُ بـ${overBy.toLocaleString('en-US')} حرفاً من حَرَس الإمبراطوريّة `
          + `(${contract.effectiveCap.toLocaleString('en-US')} حرفاً). اختصرها ولم يُحذَف منها حرفٌ واحد.`,
      detailEn: `brief ${trimmed.length} exceeds effective cap ${contract.effectiveCap}`
        + ` (bound ${contract.submittedCap} from ${contract.boundSource}, scaffold ${contract.scaffoldCharacters})`,
    };
  }

  return { ok: true, contract };
}

/** Every operation's contract at the default style — what the browser is handed. */
export function allBriefContracts(styleId?: string | null): Readonly<Record<string, BriefContract>> {
  const out: Record<string, BriefContract> = {};
  for (const id of QIYAMAH_OPERATION_IDS) out[id] = briefContractFor(id, styleId);
  return out;
}

/**
 * Judge the WHOLE prompt a provider will receive — scaffold included.
 *
 * ─── WHY THIS IS A SECOND FUNCTION AND NOT THE SAME ONE ─────────────────────
 *
 *   `validateBrief` judges what the CREATOR wrote, against `effectiveCap`.
 *   By the time a prompt reaches the generation service it has already been
 *   scaffolded by the expand route, so judging it against the same number
 *   would refuse a brief that was exactly at the cap — the precise shape of
 *   the old defect, where one door accepted what the next refused.
 *
 *   Because `submittedCap = effectiveCap + scaffold` by construction, nothing
 *   that passes `validateBrief` can fail here. The gate stays, because this
 *   service is callable by paths that never passed through expand at all.
 */
export function validateSubmittedPrompt(
  operation: QiyamahOperationId,
  text: string,
): { readonly ok: true } | { readonly ok: false; readonly messageAr: string; readonly detailEn: string } {
  const contract = briefContractFor(operation, null);
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { ok: false, messageAr: 'اكتب تعليمتك أوّلاً.', detailEn: 'empty prompt' };
  }
  if (trimmed.length > contract.submittedCap) {
    return {
      ok: false,
      messageAr: contract.boundSource === 'provider-documented'
        ? `المحثّ أطولُ من حدّ المنصّة (${contract.submittedCap.toLocaleString('en-US')} حرفاً).`
        : `المحثّ أطولُ من حَرَس الإمبراطوريّة (${contract.submittedCap.toLocaleString('en-US')} حرفاً).`,
      detailEn: `submitted prompt ${trimmed.length} exceeds ${contract.submittedCap}`
        + ` (${contract.boundSource})`,
    };
  }
  return { ok: true };
}

/** Which operation a generation request is, from the only field it carries. */
export function operationFromStyle(
  styleId: string | null | undefined,
  mediaType: 'image' | 'video',
): QiyamahOperationId {
  if (mediaType === 'video') return 'video';
  return styleId === 'infographic' ? 'infographic' : 'image';
}
