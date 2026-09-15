/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Hadith Provider — the collections of the Sunnah, in Arabic.
 *
 * ─── WHY IT EXISTS ──────────────────────────────────────────────────────────
 *
 *   The chamber was asked for «سيرة أبي بكر الصديق» and had no narration to
 *   offer, because it held no Hadith at all. The three authorities the Founder
 *   named all refuse this host — measured 403, 403, and a challenge page — so
 *   the collections were obtained by a route that answers, and the Empire now
 *   holds their text itself.
 *
 * ─── WHY IT READS ROWS AND NEVER FETCHES ────────────────────────────────────
 *
 *   The first shape of this provider retrieved the collections at search time.
 *   They are published as single JSON documents of nine megabytes, JSON.parse
 *   is synchronous, and the production log recorded the result precisely: on
 *   every investigation *every* Ministry exceeded its five-second deadline —
 *   including the four Ministries that have no providers attached and return an
 *   empty array immediately. An empty Ministry cannot take five seconds. They
 *   took five seconds because nothing was running: the runtime was frozen, and
 *   one Creator's search of the Sunnah stalled the whole Empire for everyone
 *   else inside it.
 *
 *   Moving that parse into the background would have moved the freeze, not
 *   ended it. The parse now happens once, in a separate process, and this
 *   provider issues an indexed SQL query. Nothing is fetched here, nothing is
 *   parsed here, and nothing is held between requests.
 *
 * ─── THE RULE THAT SHAPES EVERY GRADE BELOW ─────────────────────────────────
 *
 *   «Do not infer the grade of every narration from the name of the collection.
 *    Display the exact source and the grading authority. Display multiple
 *    scholarly grades when they differ. Display "grade unavailable" when no
 *    reliable grade is available. Never manufacture a single synthetic grade.»
 *
 *   Measured from the collections themselves: al-Bukhari's narrations carry an
 *   empty grading field, while Abu Dawud's first carries four grades from four
 *   scholars who do not agree. Both facts travel as they are. A grade exists
 *   only with the name of the scholar who issued it. There is no path in this
 *   file that produces a grade from a collection's title.
 *
 * ─── SECRECY ────────────────────────────────────────────────────────────────
 *
 *   No host is named to a Creator. What a Creator sees is «صحيح البخاري» and
 *   the narration's number — the identity of the evidence, not its plumbing.
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';
import { SourceAuthority } from '../domain/evidence-authority';
import {
  searchNarrations,
  searchNarrationsAny,
  findNarration,
  narrationCounts,
  hasNarrations,
  type StoredGrade,
} from '@/src/persistent-storage/hadith-repository';

const ARABIC_LETTER = /[؀-ۿ]/;

// ─── ARABIC, MADE COMPARABLE ─────────────────────────────────────────────────

/**
 * Strips what varies between two spellings of the same word: the diacritics, the
 * elongation mark, and the forms of alif, ya and ta marbuta that scribes differ
 * over. Two texts differing only in these are one text for the purpose of
 * finding — and ingestion stores this same form, so both sides always agree.
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

/** Words a Creator uses to frame a question rather than to name its subject. */
const FRAMING_WORDS = new Set([
  'ما', 'ماذا', 'من', 'هل', 'كيف', 'لماذا', 'متي', 'اين', 'هي', 'هو',
  'التي', 'الذي', 'عن', 'في', 'علي', 'الي', 'مع', 'قصه', 'حديث', 'احاديث',
  'اذكر', 'حدثني', 'اخبرني', 'معني', 'تفسير', 'شرح', 'ملخص', 'نبذه',
  'كل', 'بعض', 'هذه', 'هذا', 'وما', 'وهل', 'ان', 'قال', 'يقول', 'سيره',
  'ورد', 'جاء', 'باب', 'كتاب', 'يخص', 'حول',
]);

/** The words of a question a collection could actually be searched for. */
export function subjectWords(query: string): string[] {
  return normaliseArabic(query)
    .replace(/[،؛؟.,!?:;"'()[\]{}]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !FRAMING_WORDS.has(w));
}

// ─── A NARRATION'S GRADE, AS THE SCHOLARS GAVE IT ────────────────────────────

/**
 * Renders the gradings exactly as the sources gave them, each beside the name of
 * the scholar who issued it.
 *
 * Returns null when nothing was supplied — and null is displayed as «درجة
 * الحديث: غير متوفرة من المصدر», never filled in from the collection's
 * reputation. The two Sahihs travel this path.
 */
export function renderGrades(grades: readonly StoredGrade[] | undefined): string | null {
  const stated = (grades ?? []).filter((g) => g.name && g.grade);
  if (stated.length === 0) return null;

  const lines = stated.map((g) => `${g.grade} — ${g.name}`);
  const distinct = new Set(stated.map((g) => g.grade.trim().toLowerCase()));
  const disagreement = distinct.size > 1
    ? '\nواختلف أهل العلم في درجته، وقد عُرضت أقوالهم كما هي.'
    : '';

  return `درجة الحديث:\n${lines.join('\n')}${disagreement}`;
}

// ─── DOCUMENT IDENTITY ───────────────────────────────────────────────────────

function documentIdFor(edition: string, narrationNumber: number): string {
  return `hadith-${edition}-${narrationNumber}`;
}

export function parseDocumentId(documentId: string): { edition: string; number: number } | null {
  const raw = documentId.startsWith('hadith-') ? documentId.slice(7) : documentId;
  const at = raw.lastIndexOf('-');
  if (at <= 0) return null;
  const edition = raw.slice(0, at);
  const number = parseInt(raw.slice(at + 1), 10);
  if (edition.length === 0 || Number.isNaN(number) || number <= 0) return null;
  return { edition, number };
}

// ─── WHAT THE EMPIRE HOLDS ───────────────────────────────────────────────────

/**
 * The chamber's own account of the Sunnah it holds.
 *
 * An empty table is reported as an empty table. Before ingestion has run the
 * Creator is told the collections are not yet held, rather than being left with
 * a silence to interpret.
 */
export function sunnahHolding(): { held: boolean; total: number; byCollection: Record<string, number> } {
  try {
    const counts = narrationCounts();
    return { held: counts.total > 0, ...counts };
  } catch {
    return { held: false, total: 0, byCollection: {} };
  }
}

// ─── THE PROVIDER ────────────────────────────────────────────────────────────

export class HadithProvider implements IRepositoryProvider {
  public readonly providerId: string = 'hadith-collections';

  /**
   * Search the collections for narrations bearing on the question.
   *
   * The collections hold Arabic, so the Creator's own words are used; the
   * rendering made for the English catalogues is of no use here.
   */
  public async search(
    query: string,
    limit: number,
    nativeQuery?: string,
  ): Promise<RepositorySearchResult[]> {
    const asked = nativeQuery && ARABIC_LETTER.test(nativeQuery) ? nativeQuery : query;
    if (!ARABIC_LETTER.test(asked)) return [];

    const words = subjectWords(asked);
    if (words.length === 0) return [];

    let narrations;
    // Whether these narrations carry the whole subject or only part of it. It
    // decides how they rank, so it is recorded where the decision is made
    // rather than inferred afterwards from what came back.
    let matchedWholeSubject = true;
    try {
      if (!hasNarrations()) return [];
      // Every word first — a narration touching the whole subject beats one
      // that happens to contain its commonest half.
      narrations = searchNarrations(words, limit);
      if (narrations.length === 0 && words.length > 1) {
        narrations = searchNarrationsAny(words, limit);
        matchedWholeSubject = false;
      }
    } catch {
      // A storage fault contributes nothing and fails nothing. It does not
      // become a fabricated narration either.
      return [];
    }

    return narrations.map((n, index) => ({
      id: documentIdFor(n.edition, n.narrationNumber),
      provider: this.providerId,
      title: `${n.collectionAr} — ${n.narrationNumber}`,
      snippet: n.textAr.slice(0, 200),
      // Standing is not decided here. A narration's own standing is its grade,
      // which belongs to the scholars who issued it and travels separately.
      relevanceScore: Math.max(0.5, (matchedWholeSubject ? 0.9 : 0.7) - index * 0.02),
    }));
  }

  /** Retrieve one narration with its collection, its number, and its gradings. */
  public async fetch(documentId: string): Promise<SourceDocument> {
    const parsed = parseDocumentId(documentId);
    if (!parsed) {
      throw new Error(`[HadithProvider] Invalid narration reference: '${documentId}'`);
    }

    const narration = findNarration(parsed.edition, parsed.number);
    if (!narration) {
      throw new Error(`[HadithProvider] Narration '${documentId}' is not held.`);
    }

    const place = `${narration.collectionAr} — الحديث ${narration.narrationNumber}`;
    const grades = renderGrades(narration.grades);

    // The narration, then where it is found, then what the scholars said of it —
    // and when they said nothing, that silence is spoken plainly rather than
    // filled in from the collection's name.
    const content = [
      narration.textAr,
      '',
      place + '.',
      grades ?? 'درجة الحديث: غير متوفرة من المصدر.',
    ].join('\n');

    return {
      id: documentId,
      provider: this.providerId,
      content,
      authority: SourceAuthority.DOCUMENTED,
    };
  }
}
