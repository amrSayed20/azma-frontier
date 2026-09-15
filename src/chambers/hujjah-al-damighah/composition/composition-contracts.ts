/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Composition Layer — contracts.
 *
 * ─── THE LINE THIS LAYER EXISTS TO HOLD ─────────────────────────────────────
 *
 *   Everything above this file was retrieved. Everything below it was made.
 *
 *   That is the only distinction that matters here, and every other rule in
 *   this file descends from it. A verse was retrieved. A summary of a verse was
 *   made. A narration was retrieved. A scene depicting that narration was made.
 *   The chamber may compose freely, and it may never let what it made be
 *   mistaken for what it found — because the Creator will carry this into an
 *   argument, a classroom, or a pulpit, and it is their name on it, not ours.
 *
 * ─── WHAT A PRODUCTION STATE IS ─────────────────────────────────────────────
 *
 *   The Founder named four states for an infographic and said they must never
 *   be merged: a content package, a design specification, image prompts, and a
 *   final image. The distinction generalises, and it is the same distinction:
 *
 *       A prompt for an image is not an image.
 *       A script for a film is not a film.
 *       A specification for a book is not a book.
 *
 *   So every composed work carries the state it actually reached. There is no
 *   path in this chamber that lets a prompt package call itself a finished
 *   picture — not because it would be caught, but because a Creator who is told
 *   their video is ready and finds prompts has been lied to by their own
 *   Empire.
 *
 * ─── WHAT A COMPOSITION MAY NEVER DO ────────────────────────────────────────
 *
 *   Invent a verse. Invent a narration. Invent a grade. Present a reconstructed
 *   scene as documented history. Present education as an instruction to a
 *   patient. Claim a story is whole when the sources covered part of it.
 */

import type { SourceAuthority } from '../domain/evidence-authority';
import type { CoverageStatus, TranslationRecord } from '../sources/source-contracts';

// ─── WHERE A SENTENCE CAME FROM ──────────────────────────────────────────────

/**
 * The provenance of a single piece of composed text.
 *
 * Carried per section rather than per document, because a biography is not
 * uniformly sourced: its lineage may rest on a narration, its significance on a
 * historian, and its atmosphere on nobody at all.
 */
export enum CompositionBasis {
  /** Stated by a retrieved source, and traceable to it. */
  VERIFIED_FACT = 'VERIFIED_FACT',
  /** A faithful condensation of retrieved sources. */
  SUMMARIZED_FACT = 'SUMMARIZED_FACT',
  /** Reasoned from the sources but stated by none of them. */
  INTERPRETIVE = 'INTERPRETIVE',
  /** Invented for the telling: scene, mood, framing, imagery. */
  CREATIVE_VISUALIZATION = 'CREATIVE_VISUALIZATION',
}

export function basisLabelAr(basis: CompositionBasis): string {
  switch (basis) {
    case CompositionBasis.VERIFIED_FACT:
      return 'ثابت في المصدر';
    case CompositionBasis.SUMMARIZED_FACT:
      return 'تلخيص لما في المصادر';
    case CompositionBasis.INTERPRETIVE:
      return 'استنتاج، لا نصّ';
    default:
      return 'تصوير إبداعي — ليس واقعة';
  }
}

/** Whether a passage may be repeated as a fact about the world. */
export function isFactual(basis: CompositionBasis): boolean {
  return basis === CompositionBasis.VERIFIED_FACT || basis === CompositionBasis.SUMMARIZED_FACT;
}

// ─── HOW FAR A WORK GOT ──────────────────────────────────────────────────────

/**
 * What was actually produced.
 *
 * The Founder's four infographic states are these four, generalised to every
 * output the chamber makes. They are ordered, and a work never claims a state
 * it did not reach.
 */
export enum ProductionState {
  /** Words: the content itself, written and sourced. */
  CONTENT_PACKAGE = 'CONTENT_PACKAGE',
  /** Instructions: how it should be built, laid out, shot, or designed. */
  DESIGN_SPECIFICATION = 'DESIGN_SPECIFICATION',
  /** Prompts: what a generator would need to make the artefact. */
  GENERATION_PROMPTS = 'GENERATION_PROMPTS',
  /** The artefact itself — an actual file that exists and can be opened. */
  FINAL_ARTEFACT = 'FINAL_ARTEFACT',
}

/**
 * The Creator's wording for each state, written so that no reading of it
 * suggests a finished artefact exists when one does not.
 */
export function productionStateLabelAr(state: ProductionState): string {
  switch (state) {
    case ProductionState.CONTENT_PACKAGE:
      return 'محتوى مكتوب وموثَّق — لم يُصمَّم بعد';
    case ProductionState.DESIGN_SPECIFICATION:
      return 'مواصفة تصميم — تعليمات للتنفيذ، لا تنفيذ';
    case ProductionState.GENERATION_PROMPTS:
      return 'مطالبات إنتاج جاهزة — ولم تُنتَج الصورة أو الفيديو بعد';
    default:
      return 'عمل منجَز — الملف موجود فعلاً';
  }
}

/**
 * The guard on the last state.
 *
 * FINAL_ARTEFACT is claimable only when a real artefact reference exists. The
 * chamber produces prompts today and no images, so nothing it composes reaches
 * this state — and the one way to reach it is to actually hold a file.
 */
export function mayClaimFinalArtefact(artefactRef: string | null | undefined): boolean {
  return typeof artefactRef === 'string' && artefactRef.trim().length > 0;
}

// ─── WHAT THE CREATOR ASKED FOR ──────────────────────────────────────────────

export enum WorkType {
  SUMMARY = 'SUMMARY',
  FULL_STORY = 'FULL_STORY',
  BIOGRAPHY = 'BIOGRAPHY',
  TIMELINE = 'TIMELINE',
  FOCUSED_EVENT = 'FOCUSED_EVENT',
  TREATMENT = 'TREATMENT',
  ARTICLE = 'ARTICLE',
  PATIENT_EXPLANATION = 'PATIENT_EXPLANATION',
  SCRIPT = 'SCRIPT',
  STORYBOARD = 'STORYBOARD',
  INFOGRAPHIC = 'INFOGRAPHIC',
  IMAGE_PROMPTS = 'IMAGE_PROMPTS',
  VIDEO_PROMPTS = 'VIDEO_PROMPTS',
  DOCUMENT = 'DOCUMENT',
  BOOK = 'BOOK',
  FULL_PACKAGE = 'FULL_PACKAGE',
}

export interface WorkTypeOption {
  readonly workType: WorkType;
  readonly labelAr: string;
  /** What the Creator will actually be holding when this finishes. */
  readonly producesAr: string;
  readonly reachableState: ProductionState;
}

/**
 * What the chamber offers, and what each choice truthfully yields.
 *
 * `producesAr` is not marketing. It is the promise the chamber is held to, and
 * it is written before the work begins so that it cannot be adjusted afterwards
 * to match whatever came out.
 */
export const WORK_TYPE_OPTIONS: readonly WorkTypeOption[] = [
  { workType: WorkType.SUMMARY, labelAr: 'الملخص', producesAr: 'نصّ مختصر موثَّق', reachableState: ProductionState.CONTENT_PACKAGE },
  { workType: WorkType.FULL_STORY, labelAr: 'القصة كاملة', producesAr: 'سرد مرتّب بحسب المصادر المتاحة', reachableState: ProductionState.CONTENT_PACKAGE },
  { workType: WorkType.BIOGRAPHY, labelAr: 'السيرة', producesAr: 'سيرة مرتّبة بمراجعها', reachableState: ProductionState.CONTENT_PACKAGE },
  { workType: WorkType.TIMELINE, labelAr: 'الخط الزمني', producesAr: 'محطّات مرتّبة زمنياً بمصادرها', reachableState: ProductionState.CONTENT_PACKAGE },
  { workType: WorkType.FOCUSED_EVENT, labelAr: 'التركيز على حادثة', producesAr: 'الحادثة في سياقها', reachableState: ProductionState.CONTENT_PACKAGE },
  { workType: WorkType.TREATMENT, labelAr: 'المعالجة', producesAr: 'معالجة درامية مميَّزة عن الوقائع', reachableState: ProductionState.CONTENT_PACKAGE },
  { workType: WorkType.ARTICLE, labelAr: 'مقال', producesAr: 'مقال بمراجعه', reachableState: ProductionState.CONTENT_PACKAGE },
  { workType: WorkType.PATIENT_EXPLANATION, labelAr: 'شرح للمريض', producesAr: 'شرح تعليمي لا يُغني عن الطبيب المعالج', reachableState: ProductionState.CONTENT_PACKAGE },
  { workType: WorkType.SCRIPT, labelAr: 'سكريبت', producesAr: 'سكريبت مشاهد وتعليق صوتي', reachableState: ProductionState.DESIGN_SPECIFICATION },
  { workType: WorkType.STORYBOARD, labelAr: 'ستوري بورد', producesAr: 'مواصفة مشاهد — لا صور', reachableState: ProductionState.DESIGN_SPECIFICATION },
  { workType: WorkType.INFOGRAPHIC, labelAr: 'إنفوجرافيك', producesAr: 'محتوى ومواصفة تصميم ومطالبات — لا صورة نهائية', reachableState: ProductionState.GENERATION_PROMPTS },
  { workType: WorkType.IMAGE_PROMPTS, labelAr: 'مطالبات صور', producesAr: 'مطالبات جاهزة — والصور تُنتَج في حجرة القيامة', reachableState: ProductionState.GENERATION_PROMPTS },
  { workType: WorkType.VIDEO_PROMPTS, labelAr: 'مطالبات فيديو', producesAr: 'مطالبات جاهزة — ولم يُنتَج فيديو', reachableState: ProductionState.GENERATION_PROMPTS },
  { workType: WorkType.DOCUMENT, labelAr: 'ملف مكتمل', producesAr: 'مستند مجمَّع بمصادره', reachableState: ProductionState.CONTENT_PACKAGE },
  { workType: WorkType.BOOK, labelAr: 'كتاب', producesAr: 'هيكل كتاب وفصوله بمصادرها', reachableState: ProductionState.CONTENT_PACKAGE },
  { workType: WorkType.FULL_PACKAGE, labelAr: 'حزمة عمل كاملة', producesAr: 'المعرفة والسكريبت والمطالبات في حزمة واحدة', reachableState: ProductionState.GENERATION_PROMPTS },
];

export function workTypeOption(workType: WorkType): WorkTypeOption {
  return WORK_TYPE_OPTIONS.find((o) => o.workType === workType)!;
}

// ─── A COMPOSED SECTION ──────────────────────────────────────────────────────

/** What a section of composed work rests on. */
export interface SectionProvenance {
  readonly basis: CompositionBasis;
  /** Ids of the evidence items this section rests on. Empty is a claim in itself. */
  readonly evidenceIds: readonly string[];
  /** The Creator-facing names of the sources behind it. Never hostnames. */
  readonly sourceTitlesAr: readonly string[];
  readonly authority?: SourceAuthority;
  readonly translation?: TranslationRecord;
}

export interface ComposedSection {
  readonly sectionNumber: number;
  readonly titleAr: string;
  readonly bodyAr: string;
  readonly provenance: SectionProvenance;
}

// ─── THE INFOGRAPHIC ─────────────────────────────────────────────────────────

export enum InfographicFormat {
  VERTICAL = 'VERTICAL',
  HORIZONTAL = 'HORIZONTAL',
  SOCIAL = 'SOCIAL',
  EDUCATIONAL = 'EDUCATIONAL',
  MEDICAL_EDUCATIONAL = 'MEDICAL_EDUCATIONAL',
  HISTORICAL = 'HISTORICAL',
  TIMELINE = 'TIMELINE',
  COMPARISON = 'COMPARISON',
  PROCESS = 'PROCESS',
  STEP_BY_STEP = 'STEP_BY_STEP',
}

export interface InfographicPanel {
  readonly sectionNumber: number;
  readonly sectionTitleAr: string;
  readonly sectionPurposeAr: string;
  readonly displayTextAr: string;
  readonly keyFactAr: string;
  readonly provenance: SectionProvenance;
  readonly visualDirectionAr: string;
  readonly iconOrDiagramAr: string;
  /** What a generator would need. A prompt, and not a picture. */
  readonly imagePrompt: string;
  readonly designerInstructionAr: string;
}

export interface InfographicPackage {
  readonly titleAr: string;
  readonly mainMessageAr: string;
  readonly audienceAr: string;
  readonly purposeAr: string;
  readonly format: InfographicFormat;
  readonly panels: readonly InfographicPanel[];
  /** Right-to-left for Arabic, and the reading order follows from it. */
  readonly layoutDirection: 'rtl' | 'ltr';
  readonly readingOrderAr: string;
  readonly paletteGuidanceAr: string;
  readonly typographyGuidanceAr: string;
  /** What text-to-image cannot be trusted to render, stated up front. */
  readonly generationLimitationsAr: readonly string[];
  /**
   * How far this got. Never FINAL_ARTEFACT from this chamber: an infographic
   * image is produced in Qiyamah, and prompts are not pictures.
   */
  readonly productionState: ProductionState;
}

/**
 * The limitation every Arabic infographic inherits and no prompt can wish away.
 *
 * Text-to-image models do not render Arabic script reliably — they produce
 * letterforms that look like Arabic and are not. So the copy travels as copy,
 * for a designer or a layout engine to set, and the image prompts describe
 * everything except the words.
 */
export const ARABIC_TEXT_IN_IMAGES_WARNING_AR =
  'لا يُعتمد على مولّدات الصور في كتابة النص العربي — تُخرج حروفاً تشبه العربية وليست بها. النصّ يُركَّب على التصميم، ولا يُطلب من المولّد.';

// ─── SCRIPT AND STORYBOARD ───────────────────────────────────────────────────

export interface StoryboardScene {
  readonly sceneNumber: number;
  readonly scenePurposeAr: string;
  readonly visualDescriptionAr: string;
  readonly cameraDirectionAr: string;
  readonly environmentAr: string;
  readonly subjectsAr: string;
  readonly actionAr: string;
  readonly voiceoverAr: string;
  readonly onScreenTextAr: string;
  readonly durationSeconds: number;
  readonly transitionAr: string;
  readonly provenance: SectionProvenance;
  readonly imagePrompt: string;
  readonly videoPrompt: string;
  /** What must not be invented in this scene, and why. */
  readonly constraintsAr: readonly string[];
}

export interface ComposedScript {
  readonly titleAr: string;
  readonly objectiveAr: string;
  readonly audienceAr: string;
  readonly estimatedDurationSeconds: number;
  readonly narrationAr: string;
  readonly scenes: readonly StoryboardScene[];
  readonly cautionsAr: readonly string[];
  readonly productionState: ProductionState;
}

// ─── THE COMPOSED WORK ───────────────────────────────────────────────────────

export interface ComposedWork {
  readonly workType: WorkType;
  readonly titleAr: string;
  readonly sections: readonly ComposedSection[];
  /** Present only for visual work types. */
  readonly script?: ComposedScript;
  readonly infographic?: InfographicPackage;
  /** How much of the underlying sources was actually read. */
  readonly coverage: CoverageStatus;
  /** What was produced — never more than what exists. */
  readonly productionState: ProductionState;
  /** True when a person must check this before it is used. */
  readonly humanReviewRequired: boolean;
  /** Why review is required, in the Creator's language. */
  readonly reviewReasonsAr: readonly string[];
  readonly composedAtMs: number;
}

/**
 * Whether a work may be described to the Creator as whole.
 *
 * The Founder's rule: «Do not write القصة كاملة unless the system can support
 * that claim.» A story is whole only when every source behind it was read whole
 * and every section rests on something.
 */
export function mayCallWorkComplete(work: ComposedWork): boolean {
  if (work.sections.length === 0) return false;
  if (work.sections.some((s) => s.provenance.evidenceIds.length === 0)) return false;
  return work.coverage === 'FULLY_REVIEWED';
}

/** What the chamber titles a work it may not call whole. */
export const WORK_PARTIAL_TITLE_SUFFIX_AR = ' — بحسب المصادر المتاحة';

/**
 * Reasons a human must look before this is used.
 *
 * Religious and medical work always carries one: the chamber does not issue
 * rulings and does not treat patients, and saying so once in a footnote is not
 * the same as attaching it to the work that travels.
 */
export function reviewReasonsFor(
  domain: string,
  sections: readonly ComposedSection[],
): string[] {
  const reasons: string[] = [];

  if (domain === 'religious') {
    reasons.push('مادة دينية — لا تُفتي الحُجّة، والتفسير والترجيح مرجعهما أهل العلم.');
  }
  if (domain === 'medical') {
    reasons.push('مادة تعليمية طبية — لا تُغني عن الطبيب المعالج، والقرار في حالة بعينها له وحده.');
  }
  if (sections.some((s) => s.provenance.basis === CompositionBasis.CREATIVE_VISUALIZATION)) {
    reasons.push('يحتوي تصويراً إبداعياً مميَّزاً عن الوقائع — يُراجَع قبل النشر.');
  }
  if (sections.some((s) => s.provenance.evidenceIds.length === 0)) {
    reasons.push('فيه مواضع لا تستند إلى دليل مسترجَع.');
  }

  return reasons;
}
