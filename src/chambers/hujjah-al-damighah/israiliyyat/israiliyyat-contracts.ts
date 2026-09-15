/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Isra'iliyyat layer — contracts.
 *
 * ─── WHAT WAS MEASURED BEFORE A LINE OF THIS WAS DESIGNED ───────────────────
 *
 *   The Founder ruled that this category may be populated only through
 *   explicitly identified and verifiable sources, and that if none can be
 *   found, «the category must remain empty and the system must state that the
 *   classification is unavailable».
 *
 *   So it was searched for, twice, and both results are recorded here because
 *   they decide the whole shape of this file.
 *
 *   IN THE TAFSIRS. Six Arabic commentaries are reachable. Across 507 verses of
 *   al-Qurtubi and al-Baghawi — al-Baqara, al-Kahf and Yusuf, the most
 *   story-bearing suras there are — the word «الإسرائيليات» appears ZERO times.
 *   «أهل الكتاب» appears 53 times, and it is not a marker: it is a Qur'anic
 *   term occurring in ordinary exegesis. Reading it as a marker would be the
 *   inference the Founder forbade.
 *
 *   IN THE LIBRARY. Its whole catalogue — 79,381 volumes — contains zero works
 *   titled or subjected «إسرائيليات» or "Israiliyyat". It does hold the corpus
 *   those reports were drawn FROM: Ginzberg's *The Legends of the Jews* in four
 *   volumes, *Legends of Old Testament characters, from the Talmud and other
 *   sources*, *Hebraic Literature: Translations from the Talmud, Midrashim and
 *   Kabbala*, and *Old Testament legends*. All seven retrieve, 4.8 MB in all.
 *
 * ─── THE DISTINCTION THAT DECIDES EVERYTHING BELOW ──────────────────────────
 *
 *   Those volumes carry the MATERIAL. They do not carry the CLASSIFICATION.
 *
 *   «إسرائيليات» is a ruling that Muslim scholars make about a report that
 *   entered tafsir or Islamic history — compatible with the Qur'an, contrary to
 *   it, or suspended between. Ginzberg was compiling Jewish tradition; he was
 *   not classifying what crossed into Islamic exegesis, and nothing in his text
 *   could.
 *
 *   So this layer states provenance, which it can verify, and refuses the
 *   classification, which it cannot. A passage is presented as: this is from
 *   the Jewish traditional corpus, here is the volume and the place, and no
 *   scholarly classification of it is available in the Empire. That is less
 *   than the Founder asked for, and it is all that is true.
 *
 *   The alternative — inferring «موافق» or «مخالف» by reading — would be this
 *   chamber issuing a religious ruling, which it is forbidden to do and unfit
 *   to do.
 */

/**
 * Where a report sits relative to what the Qur'an and the authenticated Sunnah
 * establish.
 *
 * Every value but the last requires a scholar to have said so. The Empire holds
 * no source that does, so every report it can retrieve today carries
 * UNCLASSIFIED — and the Creator is told that in those words rather than left
 * to assume the absence means something else.
 */
export enum IsrailiyyatStatus {
  /** A scholar judged it compatible with established Islamic principles. */
  COMPATIBLE = 'COMPATIBLE',
  /** A scholar judged it contrary to the Qur'an or established Sunnah. */
  CONTRADICTORY = 'CONTRADICTORY',
  /** A scholar judged it neither confirmable nor deniable — تُوقف فيه. */
  SUSPENDED = 'SUSPENDED',
  /** A scholar noted its attribution or chain as uncertain. */
  ATTRIBUTION_UNCERTAIN = 'ATTRIBUTION_UNCERTAIN',
  /**
   * No scholarly classification is available to the Empire. Not a judgement —
   * the absence of one, stated plainly. This is the only value any retrieved
   * report carries today.
   */
  UNCLASSIFIED = 'UNCLASSIFIED',
}

export function statusLabelAr(status: IsrailiyyatStatus): string {
  switch (status) {
    case IsrailiyyatStatus.COMPATIBLE:
      return 'حكم عليه عالِمٌ بأنه موافقٌ لما تقرّر في الشرع';
    case IsrailiyyatStatus.CONTRADICTORY:
      return 'حكم عليه عالِمٌ بأنه مخالفٌ للقرآن أو لما ثبت من السنّة';
    case IsrailiyyatStatus.SUSPENDED:
      return 'مما يُتوقَّف فيه — لا يُصدَّق ولا يُكذَّب';
    case IsrailiyyatStatus.ATTRIBUTION_UNCERTAIN:
      return 'نسبتُه غير ثابتة';
    default:
      return 'تصنيفه غير متاح للإمبراطورية';
  }
}

/** Whether a report may be relied upon for anything at all. */
export function mayGroundAClaim(status: IsrailiyyatStatus): boolean {
  return status === IsrailiyyatStatus.COMPATIBLE;
}

// ─── ONE REPORT ──────────────────────────────────────────────────────────────

export interface IsrailiyyatReport {
  readonly id: string;
  /** The passage exactly as its source holds it. */
  readonly text: string;
  /** The work it is in, by its own title. */
  readonly workTitle: string;
  /** Who compiled or translated it. */
  readonly compiler: string | null;
  /** Volume, chapter or offset — enough to find it again. */
  readonly location: string;
  /**
   * What the source is, in its own terms: a compilation of Jewish tradition, a
   * translation of Talmudic material, and so on. Never «إسرائيليات», because no
   * source says that.
   */
  readonly provenanceAr: string;
  readonly status: IsrailiyyatStatus;
  /** Present only where a scholar's note was actually retrieved. */
  readonly scholarlyNoteAr: string | null;
}

// ─── WHAT THE CREATOR IS TOLD, EVERY TIME ────────────────────────────────────

/**
 * The warning the Founder specified, in Arabic, attached to every such report.
 *
 * Its second sentence is the one that does the work: appearing in a book does
 * not make a report authentic, and a Creator building an argument needs that
 * said before they quote it, not after.
 */
export const ISRAILIYYAT_WARNING_AR =
  'هذا خبرٌ من التراث المنقول عن أهل الكتاب، ووجودُه في كتابٍ أو تفسيرٍ لا يُثبت ' +
  'صحّته بذاته. يُقرأ بحسب ما هو مبيَّن من مصدره وتصنيفه، ولا يُبنى عليه عقيدةٌ ' +
  'ولا حكمٌ ولا تاريخٌ مقطوع به.';

/** Said when the Empire holds no scholarly classification of a report. */
export const CLASSIFICATION_UNAVAILABLE_AR =
  'تصنيف هذا الخبر — أموافقٌ هو لما تقرّر في الشرع أم مخالفٌ له أم مما يُتوقَّف ' +
  'فيه — غير متاح للإمبراطورية، إذ لا تملك مصدراً يُصدر هذا الحكم. وما لم يُصنَّف ' +
  'فليس محلاً للاستدلال.';

/** Said when the category is empty because nothing could be identified at all. */
export const NO_IDENTIFIED_REPORTS_AR =
  'لم يُعثر على خبرٍ موسومٍ بالإسرائيليات في مصادر الإمبراطورية. والتصنيف حكمٌ ' +
  'شرعي يُصدره أهل العلم، ولا تستنتجه الحجّة من عندها.';

// ─── THE MODES A STORY MAY BE TOLD IN ────────────────────────────────────────

/**
 * How much a Creator wants a story to rest on.
 *
 * The Founder's four modes. A Creator writing for a pulpit and a Creator
 * writing a film need different lines, and the chamber must not choose for
 * them — but it must make the line visible, and keep it through every output
 * that follows.
 */
export enum NarrativeMode {
  /** The Qur'an alone. */
  SCRIPTURE_ONLY = 'SCRIPTURE_ONLY',
  /** The Qur'an and narrations with a stated grade. */
  SCRIPTURE_AND_SUNNAH = 'SCRIPTURE_AND_SUNNAH',
  /** Adds history and exegesis, each labelled with its source. */
  WITH_HISTORY_AND_TAFSIR = 'WITH_HISTORY_AND_TAFSIR',
  /** Adds transmitted material that is uncertain, marked as uncertain. */
  EXPANDED_UNCERTAIN = 'EXPANDED_UNCERTAIN',
}

export interface NarrativeModeOption {
  readonly mode: NarrativeMode;
  readonly labelAr: string;
  readonly meaningAr: string;
}

export const NARRATIVE_MODES: readonly NarrativeModeOption[] = [
  {
    mode: NarrativeMode.SCRIPTURE_ONLY,
    labelAr: 'من القرآن وحده',
    meaningAr: 'ما ثبت في كتاب الله، بلا زيادة — أضيقُ المسالك وأوثقُها.',
  },
  {
    mode: NarrativeMode.SCRIPTURE_AND_SUNNAH,
    labelAr: 'القرآن والسنّة الثابتة',
    meaningAr: 'ويُضاف ما جاء في كتب السنّة بدرجةٍ منسوبة إلى عالِمٍ باسمه.',
  },
  {
    mode: NarrativeMode.WITH_HISTORY_AND_TAFSIR,
    labelAr: 'ومعهما التاريخ والتفسير',
    meaningAr: 'ويُضاف ما نقله المؤرخون والمفسّرون، منسوباً إلى كتبه — وهو نقلٌ لا إثبات.',
  },
  {
    mode: NarrativeMode.EXPANDED_UNCERTAIN,
    labelAr: 'ويُوسَّع بما لم يثبت',
    meaningAr: 'ويُضاف المنقول عن أهل الكتاب وما لم تُعرف درجته — موسوماً بذلك في كل موضع.',
  },
];

/** Whether a mode admits material the Empire cannot classify. */
export function admitsUnclassified(mode: NarrativeMode): boolean {
  return mode === NarrativeMode.EXPANDED_UNCERTAIN;
}

/**
 * Whether a mode admits history and exegesis that is transmitted rather than
 * established.
 */
export function admitsTransmitted(mode: NarrativeMode): boolean {
  return mode === NarrativeMode.WITH_HISTORY_AND_TAFSIR
    || mode === NarrativeMode.EXPANDED_UNCERTAIN;
}

/**
 * The label that must travel with a report into every downstream output — a
 * script, a storyboard, an infographic, an image prompt.
 *
 * «Never silently inserted into a generated script, book, storyboard,
 * infographic, image prompt, or video prompt.» A label that survives only until
 * the first composition is not a label.
 */
export function downstreamLabelAr(report: IsrailiyyatReport): string {
  return `[منقول عن أهل الكتاب — ${report.workTitle}، ${report.location} — ` +
         `${statusLabelAr(report.status)}]`;
}
