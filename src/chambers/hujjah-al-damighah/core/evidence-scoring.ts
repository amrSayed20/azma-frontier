import { Claim } from '../domain/evidence.types';

/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * How closely a passage's wording touches the question.
 *
 * ─── TWO FAULTS THIS FILE CARRIED ───────────────────────────────────────────
 *
 *   It compared raw strings. Arabic written with diacritics — which is how the
 *   Qur'an is written, and how the collections of the Sunnah are — never
 *   matched a question typed without them. «ٱلصَّبْرِ» is not the substring
 *   «الصبر», so a verse retrieved *because* it contains the word was then scored
 *   as containing nothing, and the live page showed verses and narrations at
 *   «0%» beside encyclopedia entries at «100%».
 *
 *   And it matched anywhere inside a word. A question about «يونس» — the
 *   Prophet — matched every narrator named Yunus in every chain of transmission
 *   in 36,064 narrations, and the Founder saw exactly that: «فجاءت بنص قرآني ثم
 *   أتت بكل ما يسمى يونس سواء كان راوٍ أو أي شخص اسمه يونس».
 *
 * ─── WHAT THIS STILL DOES NOT DO, AND MUST NOT PRETEND TO ───────────────────
 *
 *   This counts words. It does not understand a subject. A word appearing in a
 *   passage is evidence that the passage mentions the word — nothing more — and
 *   whether the passage is *about* what the Creator asked is a judgement this
 *   file cannot make and does not claim to. That judgement is made after
 *   retrieval, by something that can read.
 */

const ARABIC_LETTER = /[؀-ۿ]/;

/**
 * Strips what varies between two spellings of one word: the diacritics, the
 * elongation mark, and the letterforms scribes differ over. Kept identical to
 * the normalisation used when the Sunnah was stored, so both sides always meet.
 */
export function normaliseArabic(text: string): string {
  return text
    .replace(/[ً-ْٰۖ-ۭـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Characters that end a word in either tongue. */
const WORD_SPLIT = /[\s،؛؟.,!?:;"'()[\]{}«»\-—_/\\]+/;

/**
 * The words of a passage, normalised, as a set.
 *
 * A set rather than a string, because membership must be a whole word. Matching
 * inside words is what turned a question about a Prophet into a roll-call of
 * every narrator who shared his name.
 */
function wordsOf(text: string): Set<string> {
  const source = ARABIC_LETTER.test(text) ? normaliseArabic(text) : text.toLowerCase();
  return new Set(source.split(WORD_SPLIT).filter((w) => w.length > 0));
}

/**
 * Whether a passage carries a keyword as a word of its own.
 *
 * Arabic attaches its articles and conjunctions to the word itself, so «الصبر»
 * and «بالصبر» and «وللصبر» are the same word wearing different clothes. A
 * prefix of up to three of those letters is allowed; anything more is a
 * different word, and matching it is how «يونس» found «يونسي».
 */
const ARABIC_PREFIXES = /^(?:و|ف|ب|ك|ل|ال|وال|فال|بال|كال|لل|ولل|وب|ول|فب|في|فل|بل)$/;

/**
 * The forms of a keyword a passage might carry it in.
 *
 * The definite article loses its alif after a lam — «لِلصَّبْر» is «ل» joined to
 * «الصبر» with the alif elided, so it ends in «لصبر» and never in «الصبر». The
 * bare stem is therefore matched too, and the prefix rule applied to both.
 */
function formsOf(keyword: string): string[] {
  const forms = [keyword];
  if (keyword.startsWith('ال') && keyword.length > 3) forms.push(keyword.slice(2));
  return forms;
}

function carriesWord(words: Set<string>, keyword: string): boolean {
  const forms = formsOf(keyword);
  for (const form of forms) if (words.has(form)) return true;

  for (const word of words) {
    for (const form of forms) {
      if (word.length <= form.length) continue;
      if (!word.endsWith(form)) continue;
      const prefix = word.slice(0, word.length - form.length);
      if (prefix.length <= 3 && ARABIC_PREFIXES.test(prefix)) return true;
    }
  }
  return false;
}

export class EvidenceScoringEngine {
  public static score(evidenceText: string, claim: Claim): { evidenceScore: number; confidenceScore: number } {
    if (!claim.keywords || claim.keywords.length === 0) {
      return { evidenceScore: 0.1, confidenceScore: 0.1 };
    }

    const words = wordsOf(evidenceText);
    const keywords = claim.keywords.map((k) =>
      ARABIC_LETTER.test(k) ? normaliseArabic(k) : k.toLowerCase(),
    );

    let matchCount = 0;
    for (const keyword of keywords) {
      if (keyword.length === 0) continue;
      if (carriesWord(words, keyword)) matchCount++;
    }

    const keywordRatio = matchCount / keywords.length;

    // Heuristic scoring for V1 (pre-LLM semantic analysis)
    const evidenceScore = Number((keywordRatio * 0.7 + 0.3).toFixed(2));
    const confidenceScore = Number((Math.min(1.0, keywordRatio * 1.5)).toFixed(2));

    return { evidenceScore, confidenceScore };
  }
}
