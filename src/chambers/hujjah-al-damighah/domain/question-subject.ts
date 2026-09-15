/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The subject of a question, separated from the asking of it.
 *
 * ─── MEASURED, ON THE LIVE ENCYCLOPEDIA ─────────────────────────────────────
 *
 *   «اشرح للمريض عملية استئصال المرارة»   →  0 results
 *   «استئصال المرارة»                      →  10 results, the first of them the
 *                                             article of that exact name
 *
 *   The whole medical domain answered a doctor with nothing, because the words
 *   they used to *ask* — اشرح، للمريض، عملية — were searched as though they were
 *   part of what they asked *about*. A catalogue matching an entire sentence
 *   finds an article only when someone happened to title one after it.
 *
 *   «يجب أن تكون الحجرة صادقة وتجيب المستخدم من سؤاله أو موضوعه الذي قد حدده
 *    مسبقاً... وخاصة سياق البحث وليس الكلمات المستخدمة في الموضوع.»
 *
 * ─── WHY IT LIVES HERE ──────────────────────────────────────────────────────
 *
 *   The Sunnah provider learned this first and kept its own copy. Then the
 *   encyclopedias needed it and did not have it, and a doctor's question
 *   returned nothing for a week's worth of commits. One notion of what a
 *   subject is, in one place, used by everything that searches.
 *
 * ─── WHAT IT WILL NOT DO ────────────────────────────────────────────────────
 *
 *   It removes framing, not meaning. A question reduced to nothing is returned
 *   whole: asking a catalogue too much finds a little, asking it nothing finds
 *   nothing at all.
 */

const ARABIC_LETTER = /[؀-ۿ]/;

/**
 * Words that carry the asking rather than the subject.
 *
 * Every one of these is here because it appeared in a real question and cost
 * the Creator an answer — «اشرح للمريض عملية», «ما ورد في فضل», «من هو», «قصة».
 * Words that could be a subject in their own right are deliberately absent: a
 * question about «الطب» or «القصة» as such must still find them.
 */
const FRAMING_WORDS: ReadonlySet<string> = new Set([
  // Asking
  'ما', 'ماذا', 'من', 'هل', 'كيف', 'لماذا', 'متي', 'متى', 'اين', 'أين',
  'هي', 'هو', 'التي', 'الذي', 'وما', 'وهل', 'ومن',
  // Requesting
  'اشرح', 'أشرح', 'اذكر', 'أذكر', 'حدثني', 'أخبرني', 'اخبرني', 'اعطني',
  'أعطني', 'ابحث', 'أبحث', 'اريد', 'أريد', 'وضح', 'وضّح', 'بين', 'بيّن',
  'لخص', 'لخّص', 'احك', 'احكي', 'عرّف', 'عرف',
  // Framing a topic
  'قصه', 'قصة', 'سيره', 'سيرة', 'تفسير', 'شرح', 'معني', 'معنى', 'ملخص',
  'نبذه', 'نبذة', 'موضوع', 'حول', 'بخصوص', 'يخص', 'عملية', 'عمليه',
  'ورد', 'جاء', 'فضل', 'باب', 'كتاب', 'حديث', 'احاديث', 'أحاديث',
  // Addressing
  'للمريض', 'للمستخدم', 'للطالب', 'للقارئ', 'لي', 'لنا',
  // Joining
  'عن', 'في', 'علي', 'على', 'الي', 'إلى', 'مع', 'من', 'الى',
  'كل', 'بعض', 'هذه', 'هذا', 'ذلك', 'تلك', 'ان', 'أن', 'إن',
  'قال', 'يقول', 'و', 'أو', 'او', 'ثم',
]);

/** Strips the diacritics and letterform variants, as everything else does. */
function bare(text: string): string {
  return text
    .replace(/[ً-ْٰۖ-ۭـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Whether a word is one the Creator used to ask rather than to name. */
function isFraming(word: string): boolean {
  return FRAMING_WORDS.has(word) || FRAMING_WORDS.has(bare(word));
}

/**
 * The words of a question that name what it is about.
 *
 * Returned in the order they were written, because Arabic compounds carry their
 * meaning in that order — «استئصال المرارة» is a procedure, «المرارة استئصال»
 * is nothing.
 */
export function subjectWordsOf(question: string): string[] {
  return question
    .replace(/[،؛؟.,!?:;"'()[\]{}«»]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0)
    .filter((w) => !isFraming(w))
    .filter((w) => (ARABIC_LETTER.test(w) ? bare(w).length >= 3 : w.length >= 3));
}

/**
 * The question reduced to its subject, for a catalogue to be asked with.
 *
 * Returns the question unchanged when nothing survives — a catalogue asked too
 * much finds a little, and a catalogue asked nothing finds nothing at all.
 */
export function subjectOf(question: string): string {
  const words = subjectWordsOf(question);
  if (words.length === 0) return question.trim();
  return words.join(' ');
}

/** Whether reducing this question to its subject changes it at all. */
export function hasFraming(question: string): boolean {
  return subjectOf(question) !== question.trim();
}
