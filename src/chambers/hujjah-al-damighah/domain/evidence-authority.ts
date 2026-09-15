/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Evidence Authority Policy — the chamber's single ruling on what a piece
 * of evidence *is*, kept apart from how well it happens to match a question.
 *
 * ─── THE CONTRADICTION THIS EXISTS TO END ───────────────────────────────────
 *
 *   The chamber displayed one number, called it «درجة الثقة», and derived every
 *   word of its verdict from it. That number is the mean keyword overlap
 *   between the Creator's wording and the retrieved passages — nothing more. So
 *   a Qur'anic verse could be shown as the leading evidence while the same
 *   document announced «الثقة ضعيفة — الأدلة متعارضة أو لم تُوثَّق بما يكفي».
 *   Both statements came from the same conflated figure, and neither described
 *   what it claimed to describe.
 *
 *   Four different things were being said with one word:
 *
 *     حجّية المصدر      what kind of source this is
 *     توثيق النص        whether its text was really retrieved from that source
 *     صلة النص بالسؤال  how directly it bears on what was asked
 *     التفسير           what the text is taken to mean
 *
 *   Only the third is measured by the score. This module names all four and
 *   refuses to let any of them borrow another's word.
 *
 * ─── WHAT THIS MODULE WILL NOT DO ───────────────────────────────────────────
 *
 *   It does not rule that a Qur'anic verse answers a question. Authority is
 *   decisive for the text; whether that text settles this question is relevance,
 *   and relevance is measured, not granted. A verse retrieved on a weak keyword
 *   match is a decisive source with a distant bearing, and the chamber must be
 *   able to say exactly that.
 *
 *   It issues no interpretation. The Founder's standing instruction for
 *   religious content is «لا تُفتِ ولا تُرجّح بين المذاهب». The chamber presents
 *   the text as it came and says so plainly rather than implying a reading.
 */

/**
 * What kind of source a piece of evidence came from.
 *
 * This is a property of the source, never of the question. It does not move
 * when a question is reworded.
 */
export enum SourceAuthority {
  /**
   * The Qur'an. The Founder's constitutional rule for religious content names
   * it the sole authority, so it is decisive as a text — قطعي الثبوت — and is
   * never graded down by how a question happened to be phrased.
   */
  SCRIPTURE = 'SCRIPTURE',

  /**
   * A real catalogue whose text was retrieved and can be pointed at: a library
   * volume, an encyclopedia entry, an index record. Documented, and secondary.
   */
  DOCUMENTED = 'DOCUMENTED',

  /** Text whose origin the chamber cannot name. */
  UNATTRIBUTED = 'UNATTRIBUTED',
}

/**
 * How directly a passage bears on what was asked.
 *
 * This is the one dimension the numeric score actually measures, and the only
 * one allowed to move with the wording of a question.
 */
export enum EvidenceRelevance {
  DIRECT = 'DIRECT',
  PARTIAL = 'PARTIAL',
  NEEDS_REFLECTION = 'NEEDS_REFLECTION',
  DISTANT = 'DISTANT',
}

/**
 * The internal routing key of the scripture provider.
 *
 * It is a routing key and never reaches the Creator — the Knowledge Source
 * Abstraction Principle holds. What reaches the Creator is «القرآن الكريم»,
 * which is the evidence itself, not the name of a vendor that supplied it.
 */
export const SCRIPTURE_SOURCE_KEY = 'scripture';

/**
 * Sources whose text is retrieved live from a named public catalogue. Anything
 * outside this set is not assumed to be documented merely because it arrived.
 */
const DOCUMENTED_SOURCE_KEYS: ReadonlySet<string> = new Set([
  // The nine collections of the Sunnah. Documented, and deliberately not
  // SCRIPTURE: the Founder's rule names the Qur'an the sole decisive text, and
  // a narration's own standing is its grade — which belongs to the scholars who
  // issued it and is carried separately. See sources/source-contracts.ts.
  'hadith-collections',
  'gutenberg',
  'open-library',
  'openlibrary',
  'wikipedia',
  'arabic-wikipedia',
  'google-trends',
  'hacker-news',
  'hackernews',
]);

/** Relevance thresholds, matching the bands the chamber already scored by. */
const DIRECT_AT = 0.75;
const PARTIAL_AT = 0.45;
const REFLECTION_AT = 0.15;

/**
 * The single ruling on a source's authority.
 *
 * `sourceKey` is the provider's internal routing key. A Ministry re-stamps
 * evidence with its own constitutional ID before it travels upward, so this is
 * resolved on the raw key while it is still known — see MinistryRegistry.fetch.
 */
export function authorityOfSourceKey(sourceKey?: string | null): SourceAuthority {
  if (!sourceKey) return SourceAuthority.UNATTRIBUTED;
  const key = sourceKey.trim().toLowerCase();
  if (key === SCRIPTURE_SOURCE_KEY) return SourceAuthority.SCRIPTURE;
  if (DOCUMENTED_SOURCE_KEYS.has(key)) return SourceAuthority.DOCUMENTED;
  return SourceAuthority.UNATTRIBUTED;
}

/**
 * The authority carried on a piece of evidence, with absence resolved.
 *
 * Evidence built before this policy existed — and the fixtures that stand in for
 * it — carries nothing here. Nothing means the chamber cannot name the source,
 * which is UNATTRIBUTED, never a standing it has not established.
 */
export function authorityOfEvidence(
  evidence: { readonly sourceAuthority?: SourceAuthority } | null | undefined,
): SourceAuthority {
  return evidence?.sourceAuthority ?? SourceAuthority.UNATTRIBUTED;
}

/** Whether a source is decisive as a text. Says nothing about relevance. */
export function isDecisiveAuthority(authority: SourceAuthority): boolean {
  return authority === SourceAuthority.SCRIPTURE;
}

/** Grade how directly a passage bears on the question, from its match score. */
export function gradeRelevance(score: number): EvidenceRelevance {
  if (!Number.isFinite(score)) return EvidenceRelevance.DISTANT;
  if (score >= DIRECT_AT) return EvidenceRelevance.DIRECT;
  if (score >= PARTIAL_AT) return EvidenceRelevance.PARTIAL;
  if (score >= REFLECTION_AT) return EvidenceRelevance.NEEDS_REFLECTION;
  return EvidenceRelevance.DISTANT;
}

// ─── THE CREATOR'S WORDS ─────────────────────────────────────────────────────
//
// No provider, repository, host or model is named in any of these. What is
// named is the kind of thing the evidence is.

export function authorityLabelAr(authority: SourceAuthority): string {
  switch (authority) {
    case SourceAuthority.SCRIPTURE:
      return 'القرآن الكريم — قطعي الثبوت';
    case SourceAuthority.DOCUMENTED:
      return 'مصدر موثَّق محقَّق من أصله';
    default:
      return 'مصدر غير منسوب';
  }
}

export function relevanceLabelAr(relevance: EvidenceRelevance): string {
  switch (relevance) {
    case EvidenceRelevance.DIRECT:
      return 'صلة مباشرة بالسؤال';
    case EvidenceRelevance.PARTIAL:
      return 'صلة جزئية بالسؤال';
    case EvidenceRelevance.NEEDS_REFLECTION:
      return 'صلة تحتاج تدبّراً';
    default:
      return 'صلة بعيدة بالسؤال';
  }
}

/**
 * What the chamber says about meaning — which for scripture is that it says
 * nothing. Returns null where there is nothing to declare.
 */
export function interpretationNoteAr(authority: SourceAuthority): string | null {
  if (authority === SourceAuthority.SCRIPTURE) {
    return 'النص معروض كما ورد. لا تُفتي الحُجّة ولا تُرجّح بين المذاهب، والتفسير مرجعه أهله.';
  }
  return null;
}
