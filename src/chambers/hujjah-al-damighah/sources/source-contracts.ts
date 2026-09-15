/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Sovereign Source Registry — contracts.
 *
 * ─── WHY A REGISTRY, AND WHY NOW ────────────────────────────────────────────
 *
 *   Until now a source was whatever a provider happened to return. Nothing
 *   recorded what a source *is*: who wrote it, in what language, whether its
 *   text was verified, how much of it the chamber can actually read, or whether
 *   it answers at all. The chamber therefore could not tell a Creator that the
 *   Hadith encyclopedia it was named after is unreachable from this host — it
 *   simply returned nothing and said nothing.
 *
 *   Measured from the production server on 2026-09-15: dorar.net answers 403,
 *   sunnah.com answers 403, sunna.alifta.gov.sa returns a challenge page, and
 *   gutendex.com — the index the library has always used — answers 403 while
 *   answering 200 from an ordinary connection. Four named sources, none of them
 *   reachable, and the chamber had no way to say so.
 *
 *   A registered source therefore carries its access state as data. A blocked
 *   source stays registered and is shown as blocked. That is the difference
 *   between a chamber that is silent and a chamber that is honest.
 *
 * ─── WHAT THIS DELIBERATELY DOES NOT DO ─────────────────────────────────────
 *
 *   It does not decide authority. SourceAuthority already rules on that in
 *   domain/evidence-authority.ts and is not duplicated here — a registry entry
 *   *carries* an authority class, it does not invent a second scale.
 *
 *   It does not grade Hadith. A grade belongs to the scholar who issued it and
 *   travels with their name attached, or it does not travel at all. There is no
 *   path in this file that produces a grade the chamber made up.
 */

import type { SourceAuthority } from '../domain/evidence-authority';

// ─── WHAT KIND OF THING A SOURCE IS ──────────────────────────────────────────

export enum SourceType {
  /** The Qur'an. */
  SCRIPTURE = 'SCRIPTURE',
  /** A collection of Prophetic narrations. */
  HADITH_COLLECTION = 'HADITH_COLLECTION',
  /** An indexed encyclopedia of narrations with scholarly gradings. */
  HADITH_ENCYCLOPEDIA = 'HADITH_ENCYCLOPEDIA',
  /** Prophetic biography. */
  SIRAH = 'SIRAH',
  /** Stories of the Prophets. */
  PROPHET_STORIES = 'PROPHET_STORIES',
  /** Biographies of Companions, Followers, or the righteous. */
  BIOGRAPHY = 'BIOGRAPHY',
  /** Books of classes and generations. */
  TABAQAT = 'TABAQAT',
  /** Books of narrators. */
  RIJAL = 'RIJAL',
  /** Qur'anic exegesis. */
  TAFSIR = 'TAFSIR',
  /** General or Islamic history. */
  HISTORY = 'HISTORY',
  /** A general reference work or encyclopedia. */
  ENCYCLOPEDIA = 'ENCYCLOPEDIA',
  /** A library of full-text books. */
  LIBRARY = 'LIBRARY',
  /** Medical or scientific literature. */
  MEDICAL_SCIENTIFIC = 'MEDICAL_SCIENTIFIC',
  /** Contemporary discourse, trends, news. */
  CONTEMPORARY = 'CONTEMPORARY',
}

/** What a source is used for inside an investigation. */
export enum SourceRole {
  /** Carries the authoritative text itself. */
  PRIMARY_TEXT = 'PRIMARY_TEXT',
  /** Explains or grades a primary text. */
  SCHOLARLY_APPARATUS = 'SCHOLARLY_APPARATUS',
  /** Narrates events around a subject. */
  NARRATIVE = 'NARRATIVE',
  /** Locates material held elsewhere. */
  INDEX = 'INDEX',
  /** Supplies background and orientation only. */
  CONTEXT = 'CONTEXT',
}

/**
 * Whether the chamber has confirmed this source answers, and with what.
 *
 * Measured, never assumed. A source moves to VERIFIED only after a real request
 * from the host that will serve Creators — not from an engineer's laptop, which
 * reaches things the server cannot.
 */
export enum VerificationStatus {
  /** A real request returned the expected shape from the production host. */
  VERIFIED = 'VERIFIED',
  /** Registered but never yet exercised. */
  UNVERIFIED = 'UNVERIFIED',
  /** It answered, but not in the shape the adapter expects. */
  SHAPE_MISMATCH = 'SHAPE_MISMATCH',
}

/** Whether the chamber can reach the source right now. */
export enum AccessStatus {
  /** Reachable and answering. */
  OPEN = 'OPEN',
  /** Reachable only with a credential the Empire does not hold. */
  REQUIRES_KEY = 'REQUIRES_KEY',
  /** The host refuses this server specifically. */
  BLOCKED = 'BLOCKED',
  /** The host is down or unreachable. */
  UNAVAILABLE = 'UNAVAILABLE',
  /** Registered as a reference for a human, never fetched by the chamber. */
  REFERENCE_ONLY = 'REFERENCE_ONLY',
}

/**
 * How much of a source the chamber actually reads.
 *
 * The Founder's rule: «The current nine-kilobyte limitation must not remain
 * invisible.» The library is read as EXCERPT_ONLY — the chamber sees the opening
 * of each book and nothing beyond it — and a Creator is entitled to know that
 * before deciding a story is complete.
 */
export enum CoverageStatus {
  FULLY_REVIEWED = 'FULLY_REVIEWED',
  PARTIALLY_REVIEWED = 'PARTIALLY_REVIEWED',
  EXCERPT_ONLY = 'EXCERPT_ONLY',
  INDEX_ONLY = 'INDEX_ONLY',
  SOURCE_UNAVAILABLE = 'SOURCE_UNAVAILABLE',
  SOURCE_BLOCKED = 'SOURCE_BLOCKED',
  SOURCE_INCOMPLETE = 'SOURCE_INCOMPLETE',
}

export enum CopyrightStatus {
  PUBLIC_DOMAIN = 'PUBLIC_DOMAIN',
  FREELY_LICENSED = 'FREELY_LICENSED',
  PERMITTED_REFERENCE = 'PERMITTED_REFERENCE',
  UNKNOWN = 'UNKNOWN',
}

// ─── A REGISTERED SOURCE ─────────────────────────────────────────────────────

export interface SovereignSource {
  /** Internal routing key. Never shown to a Creator. */
  readonly sourceId: string;

  /** The source's own name, in Arabic. This the Creator may see. */
  readonly titleAr: string;

  /** Its author or compiler, where one exists. */
  readonly authorAr?: string;

  readonly sourceType: SourceType;
  readonly sourceRole: SourceRole;

  /** The language its text is held in. */
  readonly language: 'ar' | 'en' | 'mixed';

  /** The standing its text carries, ruled by the existing authority policy. */
  readonly authorityClass: SourceAuthority;

  readonly verificationStatus: VerificationStatus;
  readonly accessStatus: AccessStatus;
  readonly coverage: CoverageStatus;
  readonly copyrightStatus: CopyrightStatus;

  /** Where it lives. Internal — never rendered to a Creator. */
  readonly endpoint?: string;

  /** The edition or recension, where that distinction matters. */
  readonly edition?: string;

  /** Which knowledge domains this source can serve. */
  readonly domains: readonly string[];

  /**
   * Why this source stands where it stands — measured facts, not intentions.
   * Carried so a later engineer inherits the measurement and not a guess.
   */
  readonly note: string;

  /** When its access state was last established by a real request, if ever. */
  readonly lastMeasuredAtMs?: number;
}

// ─── A NARRATION'S GRADE ─────────────────────────────────────────────────────

/**
 * A scholarly grading of a narration.
 *
 * The Founder's rule is absolute here: «Do not infer the grade of every
 * narration from the name of the collection», «Display multiple scholarly grades
 * when they differ», «Never manufacture a single synthetic grade».
 *
 * So a grade exists only when a source supplied it *and* named who issued it.
 * There is no constructor in this chamber that produces a grade without both.
 */
export interface HadithGrade {
  /** The grade as the source worded it. Never normalised into a scale. */
  readonly gradeAr: string;
  /** The scholar who issued it. A grade without this is not a grade. */
  readonly graderAr: string;
  /** Where the grading was published, where the source says. */
  readonly gradingSourceAr?: string;
}

/** What the chamber knows about a narration's standing. */
export interface HadithAttribution {
  /** The collection it was taken from, by its own name. */
  readonly collectionAr: string;
  /** The book or chapter within it, where the source gives one. */
  readonly bookAr?: string;
  /** Its number in that collection. */
  readonly referenceNumber?: string;
  /** The chain, when the source carries it. */
  readonly isnadAr?: string;
  /** Where else it is narrated. */
  readonly takhrijAr?: string;
  /**
   * Every grade the sources gave, each with its author. Empty when none was
   * supplied — and an empty list is displayed as «درجة الحديث: غير متوفرة»,
   * never quietly filled in.
   */
  readonly grades: readonly HadithGrade[];
  /** True when the grades disagree. The Creator is told, not shielded. */
  readonly gradesDiffer: boolean;
}

/** Whether a narration's standing can be stated at all. */
export function hasStatedGrade(attribution: HadithAttribution): boolean {
  return attribution.grades.length > 0;
}

/** The Creator's wording for a narration whose grade nobody supplied. */
export const GRADE_UNAVAILABLE_AR = 'درجة الحديث: غير متوفرة من المصدر';

// ─── TRANSLATION ─────────────────────────────────────────────────────────────

/**
 * How a piece of text came to be in the language it is displayed in.
 *
 * The Founder's rule: the Creator is never shown foreign text, and the chamber
 * speaks — so an untranslated English passage would be *read aloud* in a
 * language the Creator did not ask in. Translation is therefore part of the
 * evidence path. But a translation must never be mistaken for the original, so
 * the original is preserved beside it and the machine's hand is declared.
 */
export enum TranslationType {
  ORIGINAL = 'ORIGINAL',
  HUMAN_TRANSLATION = 'HUMAN_TRANSLATION',
  MACHINE_TRANSLATION = 'MACHINE_TRANSLATION',
  AI_ASSISTED_TRANSLATION = 'AI_ASSISTED_TRANSLATION',
  UNKNOWN = 'UNKNOWN',
}

export enum TranslationStatus {
  NOT_REQUIRED = 'NOT_REQUIRED',
  TRANSLATED = 'TRANSLATED',
  FAILED = 'FAILED',
  WITHHELD = 'WITHHELD',
}

export interface TranslationRecord {
  readonly originalLanguage: string;
  readonly originalText: string;
  readonly translatedLanguage: string;
  readonly translationText: string | null;
  readonly translationType: TranslationType;
  readonly translationStatus: TranslationStatus;
  /**
   * Null unless a defensible number exists. The Founder's rule: «If confidence
   * cannot be calculated defensibly, display ثقة الترجمة: غير محسوبة. Do not
   * fabricate percentages.» Nothing in this chamber computes one, so this is
   * null everywhere today and the Creator is told so in those words.
   */
  readonly translationConfidence: number | null;
  /** Terms the translator could not render with confidence. */
  readonly translationWarnings: readonly string[];
  /** The source the original came from, so the reference survives translation. */
  readonly sourceReference?: string;
}

export const TRANSLATION_CONFIDENCE_UNCOMPUTED_AR = 'ثقة الترجمة: غير محسوبة';

/** The Creator's wording for machine translation. Never omitted. */
export const MACHINE_TRANSLATION_LABEL_AR = 'ترجمة آلية — والأصل محفوظ';

export function translationLabelAr(record: TranslationRecord): string {
  switch (record.translationType) {
    case TranslationType.ORIGINAL:
      return 'النص كما ورد في مصدره';
    case TranslationType.HUMAN_TRANSLATION:
      return 'ترجمة بشرية';
    case TranslationType.MACHINE_TRANSLATION:
    case TranslationType.AI_ASSISTED_TRANSLATION:
      return MACHINE_TRANSLATION_LABEL_AR;
    default:
      return 'أصل الترجمة غير معروف';
  }
}

// ─── COVERAGE, IN THE CREATOR'S WORDS ────────────────────────────────────────

/**
 * The Founder's rule: «Do not write القصة كاملة unless the system can support
 * that claim.» These are the words used instead.
 */
export function coverageLabelAr(coverage: CoverageStatus): string {
  switch (coverage) {
    case CoverageStatus.FULLY_REVIEWED:
      return 'المصدر مقروء بالكامل';
    case CoverageStatus.PARTIALLY_REVIEWED:
      return 'التغطية المتاحة جزئية';
    case CoverageStatus.EXCERPT_ONLY:
      return 'قُرئ مقتطف من المصدر لا المصدر كله';
    case CoverageStatus.INDEX_ONLY:
      return 'تمّت مطالعة الفهرس دون النص';
    case CoverageStatus.SOURCE_BLOCKED:
      return 'المصدر غير متاح من الإمبراطورية حالياً';
    case CoverageStatus.SOURCE_UNAVAILABLE:
      return 'المصدر لم يستجب';
    default:
      return 'المصدر ناقص';
  }
}

/** Whether the chamber may describe a result as whole. */
export function mayClaimCompleteness(coverages: readonly CoverageStatus[]): boolean {
  return coverages.length > 0 && coverages.every((c) => c === CoverageStatus.FULLY_REVIEWED);
}

/** What the chamber says instead when it may not claim completeness. */
export const PARTIAL_COVERAGE_AR = 'القصة بحسب المصادر المتاحة — وثمة تفاصيل لم يتم التحقق منها';
