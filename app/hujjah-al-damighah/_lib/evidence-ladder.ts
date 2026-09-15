/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Ladder of Evidence.
 *
 * ─── THE FOUNDER'S PROPOSAL ─────────────────────────────────────────────────
 *
 *   «يمكننا أن نجعل الحجرة تعرض للمستخدم أنواع الأدلة في نفس موضوع بحثه — فمثلاً
 *    هذا الدليل من القرآن وهو دليل قاطع، وهذا الدليل من السنة وهو صحيح، وهذا
 *    دليل آخر من السنة وهو حسن، وهذا دليل من العامة، وهذا من الإسرائيليات، وهذا
 *    من التاريخ، وهذا من الروايات والقصص.»
 *
 *   Offered as a suggestion, taken because it is the natural home for every
 *   separation this chamber has made: a source's standing is not its grade, and
 *   neither is how closely it touched the question. Ten passages in a flat list
 *   forced a Creator to work that out for themselves, item by item. Ranked by
 *   kind, the shape of the answer is visible before a single item is opened.
 *
 * ─── WHAT A RUNG MAY NOT DO ─────────────────────────────────────────────────
 *
 *   A rung reports. It does not decide. A narration lands on the صحيح rung
 *   because a named scholar said so and the chamber stored his words — never
 *   because a collection's title is famous, never because the chamber formed an
 *   opinion. Where scholars disagree, the narration goes to a rung that says
 *   they disagreed rather than to whichever grade was listed first.
 *
 * ─── THE RUNG THAT STAYS EMPTY, AND WHY IT IS STILL HERE ────────────────────
 *
 *   الإسرائيليات is named in this ladder and nothing is ever placed on it. The
 *   chamber holds no source that marks a report as Isra'iliyyat, and detecting
 *   one by reading is a scholarly judgement this chamber has no business making.
 *   Naming the rung without filling it says exactly that: the distinction is
 *   real, the Empire cannot yet draw it, and the day a source arrives that can,
 *   the rung is already waiting. Filling it by guesswork would be the worse
 *   failure — the composed answer already hedges such reports with «قيل إن»,
 *   which is where that caution currently lives.
 */

import type { EvidenceItemDTO, InvestigationDTO } from '../actions';
import { SourceAuthority, authorityOf, isNarration, relevanceOf } from './evidence-utils';
import { EvidenceRelevance } from '@/src/chambers/hujjah-al-damighah/domain/evidence-authority';

export type LadderRungId =
  // Religious
  | 'quran'
  | 'sunnah-sahih'
  | 'sunnah-hasan'
  | 'sunnah-daif'
  | 'sunnah-disputed'
  | 'sunnah-ungraded'
  | 'israiliyyat'
  // Historical
  | 'primary-record'
  | 'history'
  | 'contested-account'
  // Scientific and medical
  | 'scientific-consensus'
  | 'clinical-guidance'
  | 'study'
  | 'technical'
  // Everywhere
  | 'reference'
  | 'narrative'
  | 'contemporary';

export interface LadderRung {
  readonly id: LadderRungId;
  readonly titleAr: string;
  /** What this rung means, in one line the Creator can act on. */
  readonly meaningAr: string;
  readonly items: readonly EvidenceItemDTO[];
}

/**
 * Every rung, in the order standing demands.
 *
 * ─── THE LADDER IS NOT ONLY FOR RELIGION ────────────────────────────────────
 *
 *   «طبق الاقتراح ليُعمَّم في جميع مجالات البحث، وليس في البحث الديني فقط، بل في
 *    البحث العلمي والتاريخي.» — and the principle carries because it was never
 *    about religion. It is about a Creator being told what kind of thing each
 *    piece of evidence is before they build an argument on it.
 *
 *   A doctor explaining an operation needs to know which passage is settled
 *   science and which is a single study. A historian needs to know which is a
 *   primary record and which is a later account, and which accounts conflict.
 *   The distinction that matters changes with the domain; that a distinction
 *   must be drawn does not.
 *
 *   Each domain therefore has its own rungs, and the ones that belong nowhere
 *   in particular — a general reference, a story, a note on what people are
 *   talking about today — are shared by all of them and always rank last.
 */
const RUNG_ORDER: readonly { id: LadderRungId; titleAr: string; meaningAr: string }[] = [
  // ── Religious ──────────────────────────────────────────────────────────
  { id: 'quran', titleAr: 'من القرآن الكريم',
    meaningAr: 'قطعي الثبوت — والتفسير مرجعه أهله.' },
  { id: 'sunnah-sahih', titleAr: 'من السنّة — صحيح',
    meaningAr: 'حكم عليه بالصحّة عالِمٌ مذكورٌ باسمه.' },
  { id: 'sunnah-hasan', titleAr: 'من السنّة — حسن',
    meaningAr: 'حكم عليه بالحُسن عالِمٌ مذكورٌ باسمه.' },
  { id: 'sunnah-daif', titleAr: 'من السنّة — ضعيف',
    meaningAr: 'حكم عليه بالضعف عالِمٌ مذكورٌ باسمه، وعُرض كما هو.' },
  { id: 'sunnah-disputed', titleAr: 'من السنّة — اختُلف في درجته',
    meaningAr: 'تباينت أحكام أهل العلم فيه، وعُرضت أقوالهم جميعاً.' },
  { id: 'sunnah-ungraded', titleAr: 'من السنّة — لم تُذكر درجته',
    meaningAr: 'لم يورد المصدر حكماً منسوباً لعالِم، ولا تُستنتج الدرجة من اسم الكتاب.' },
  { id: 'israiliyyat', titleAr: 'من الإسرائيليات',
    meaningAr: 'ما يُنقل عن أهل الكتاب — يُذكر بصيغة التمريض ولا يُبنى عليه.' },

  // ── Scientific and medical ─────────────────────────────────────────────
  { id: 'scientific-consensus', titleAr: 'ما استقرّ عليه العلم',
    meaningAr: 'مقرَّر في المراجع العلمية، لا رأي باحثٍ منفرد.' },
  { id: 'clinical-guidance', titleAr: 'إرشاد طبي عام',
    meaningAr: 'شرح تعليمي — والقرار في حالتك بعينها لطبيبك المعالج وحده.' },
  { id: 'study', titleAr: 'من دراسة أو بحث',
    meaningAr: 'نتيجة بحثٍ بعينه — تُقرأ في حدود ما درسه، ولا تُعمَّم.' },
  { id: 'technical', titleAr: 'من المجال التقني',
    meaningAr: 'ممارسةٌ ومناقشةٌ مهنية، لا نصّ علمي محكَّم.' },

  // ── Historical ─────────────────────────────────────────────────────────
  { id: 'primary-record', titleAr: 'من مصدر أوّلي',
    meaningAr: 'نصّ من زمن الحادثة أو من شاهدها — أقوى ما يُعتمد في التاريخ.' },
  { id: 'history', titleAr: 'من التاريخ والسير',
    meaningAr: 'رواية تاريخية موثَّقة إلى مصدرها، لا نصّ شرعي.' },
  { id: 'contested-account', titleAr: 'رواية مُختلَف فيها',
    meaningAr: 'تتعارض مع رواياتٍ أخرى في الموضوع نفسه، وعُرضت لتراها.' },

  // ── Everywhere, and always last ────────────────────────────────────────
  { id: 'reference', titleAr: 'من المراجع العامة',
    meaningAr: 'مصدر معرفي عام، يُستأنس به ولا يُحتجّ به وحده.' },
  { id: 'narrative', titleAr: 'من الروايات والقصص',
    meaningAr: 'مادة سردية — تصلح للحكاية لا للاستدلال.' },
  { id: 'contemporary', titleAr: 'من الاهتمام المعاصر',
    meaningAr: 'ما يتداوله الناس اليوم — سياقٌ لا دليل.' },
];

/**
 * Words the scholars themselves use.
 *
 * No `\b` anywhere. JavaScript defines a word boundary by the Latin alphabet,
 * so `\bصحيح` matches nothing at all in Arabic — a regex that silently never
 * fires, which is how every graded narration first landed on the ungraded rung.
 * Precision comes from reading only the grade lines instead, not from a
 * boundary marker that does not exist here.
 */
const SAHIH = /صحيح/;
const HASAN = /حسن/;
const DAIF = /ضعيف|منكر|موضوع|باطل|لا يصح/;

/** The line a source writes before it starts listing gradings. */
const GRADES_HEADING = 'درجة الحديث';

/**
 * The rung a narration belongs on, read from the gradings its sources supplied.
 *
 * Nothing here forms an opinion. «اختُلف في درجته» is chosen whenever the stated
 * grades do not agree — the chamber reports the disagreement rather than
 * resolving it, because resolving it is the work of scholars.
 */
export function narrationRung(item: EvidenceItemDTO): LadderRungId {
  const attribution = item.attributionAr ?? '';
  if (!attribution.includes(GRADES_HEADING) || attribution.includes('غير متوفرة')) {
    return 'sunnah-ungraded';
  }
  if (attribution.includes('واختلف أهل العلم')) return 'sunnah-disputed';

  // Only the lines after the heading. The citation line above it carries a dash
  // of its own — «صحيح البخاري — الحديث 2731» — and reading dashes rather than
  // structure would have taken the word صحيح out of a book's *title* and
  // reported it as a scholar's ruling. A collection's name is not a grade.
  const lines = attribution.split('\n');
  const headingAt = lines.findIndex((l) => l.includes(GRADES_HEADING));
  const gradeLines = lines
    .slice(headingAt + 1)
    .map((l) => l.trim())
    .filter((l) => l.includes('—'));

  const kinds = new Set<LadderRungId>();
  for (const line of gradeLines) {
    // The grade is what the source wrote before the scholar's name.
    const grade = line.split('—')[0]!;
    if (DAIF.test(grade)) kinds.add('sunnah-daif');
    else if (SAHIH.test(grade)) kinds.add('sunnah-sahih');
    else if (HASAN.test(grade)) kinds.add('sunnah-hasan');
  }

  if (kinds.size === 0) return 'sunnah-ungraded';
  if (kinds.size > 1) return 'sunnah-disputed';
  return [...kinds][0]!;
}

/**
 * The rung any piece of evidence belongs on.
 *
 * Standing decides first and is the same everywhere: the Qur'an is the Qur'an
 * whatever domain a Creator declared, and a narration is a narration. Below
 * that, the distinction that matters is the domain's own — a single study is a
 * meaningful category in medicine and a meaningless one in history.
 *
 * Nothing the chamber cannot actually tell apart is assigned. The Empire holds
 * no source that marks a report as Isra'iliyyat, none that distinguishes a
 * primary record from a later account, and none that flags a study as a study —
 * so those rungs stay empty rather than being filled by inference. They are
 * named because the distinctions are real and the day a source can draw one,
 * the rung is waiting.
 */
export function rungOf(item: EvidenceItemDTO, domain: string): LadderRungId {
  // Standing, before domain. This does not move.
  if (authorityOf(item) === SourceAuthority.SCRIPTURE) return 'quran';
  if (isNarration(item)) return narrationRung(item);

  const documented = authorityOf(item) === SourceAuthority.DOCUMENTED;
  if (!documented) return 'narrative';

  switch (domain) {
    case 'history':
      // A primary record and a contested account are real historical
      // categories the chamber cannot yet identify. Until a source states
      // which it is, documented material is what it is: history.
      return 'history';
    case 'medical':
      // Everything medical the chamber can reach is educational, and the
      // rung's own words say the decision belongs to a treating physician.
      return 'clinical-guidance';
    case 'scientific':
      return 'scientific-consensus';
    default:
      return 'reference';
  }
}

/**
 * The ladder for one investigation: rungs in order, empty ones omitted.
 *
 * Within a rung, the passages that bear most closely on the question come
 * first — standing decides the rung, bearing decides the order inside it.
 */
export function buildLadder(dto: InvestigationDTO, domain: string): LadderRung[] {
  const byRung = new Map<LadderRungId, EvidenceItemDTO[]>();
  for (const item of dto.evidence) {
    const rung = rungOf(item, domain);
    if (!byRung.has(rung)) byRung.set(rung, []);
    byRung.get(rung)!.push(item);
  }

  const ladder: LadderRung[] = [];
  for (const rung of RUNG_ORDER) {
    const items = byRung.get(rung.id);
    if (!items || items.length === 0) continue;
    ladder.push({
      ...rung,
      items: [...items].sort((a, b) => b.confidenceScore - a.confidenceScore),
    });
  }
  return ladder;
}

/**
 * One line telling the Creator what the ladder amounts to.
 *
 * It counts rungs rather than judging them: «وجدنا من القرآن ومن السنّة» is a
 * statement about what was found, and the Creator draws their own conclusion.
 */
export function ladderSummaryAr(ladder: readonly LadderRung[]): string {
  if (ladder.length === 0) return 'لم يُعثر على دليل في موضوع سؤالك.';
  const parts = ladder.map((r) => `${r.titleAr} (${r.items.length})`);
  return `ما وُجد في موضوع سؤالك: ${parts.join(' · ')}`;
}

/** Whether anything decisive was found — the Qur'an, and only the Qur'an. */
export function hasDecisiveRung(ladder: readonly LadderRung[]): boolean {
  return ladder.some((r) => r.id === 'quran' && r.items.length > 0);
}

/** Rungs whose evidence bears only distantly on the question, for a caution. */
export function distantRungs(ladder: readonly LadderRung[]): LadderRungId[] {
  return ladder
    .filter((r) => r.items.every((i) => relevanceOf(i) === EvidenceRelevance.DISTANT))
    .map((r) => r.id);
}
