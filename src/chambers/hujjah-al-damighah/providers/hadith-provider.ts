/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Hadith Provider — the nine collections of the Sunnah, in Arabic.
 *
 * ─── WHY IT EXISTS ──────────────────────────────────────────────────────────
 *
 *   The chamber was asked for «سيرة أبي بكر الصديق» and had no narration to
 *   offer, because it held no Hadith at all. The three authorities the Founder
 *   named all refuse this host — measured 403, 403, and a challenge page — so
 *   this provider reaches the collections by a route that answers: their full
 *   Arabic text, served from a CDN, measured at 24ms for the index and 187ms
 *   for the whole of al-Bukhari.
 *
 * ─── THE RULE THAT SHAPES EVERY LINE BELOW ──────────────────────────────────
 *
 *   «Do not infer the grade of every narration from the name of the collection.
 *    Do not treat all narrations in all collections as equally authentic.
 *    Display the exact source and the grading authority.
 *    Display multiple scholarly grades when they differ.
 *    Display "grade unavailable" when no reliable grade is available.
 *    Never manufacture a single synthetic grade.»
 *
 *   So: a grade travels only with the name of the scholar who issued it. There
 *   is no path in this file that produces a grade from a collection's title.
 *   Measured from the source: al-Bukhari and Muslim carry an empty grading
 *   field, while Abu Dawud's first narration carries four grades from four
 *   scholars that do not agree with one another — «حسن صحيح» from al-Albani,
 *   «صحيح لغيره» from Shu'ayb al-Arna'ut. Both facts reach the Creator as they
 *   are: the two Sahihs as ungraded, and the disagreement as a disagreement.
 *
 * ─── SEARCH ─────────────────────────────────────────────────────────────────
 *
 *   The route carries no search endpoint, so a collection is retrieved whole
 *   and searched in memory. A retrieved collection is kept for a bounded time
 *   and a bounded count, because 9 MB of JSON is cheap to hold once and
 *   wasteful to fetch twice. The server was measured first: 6.5 GB free, the
 *   process at 209 MB against a 3 GB ceiling.
 *
 * ─── SECRECY ────────────────────────────────────────────────────────────────
 *
 *   The host is never named to a Creator. What a Creator sees is «صحيح
 *   البخاري» and the narration's number — the identity of the evidence, not the
 *   plumbing that delivered it.
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';
import { SourceAuthority } from '../domain/evidence-authority';

const EDITION_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';

/** Measured: index 24ms, a whole collection 187ms. Generous many times over. */
const FETCH_TIMEOUT_MS = 6_000;

/** The whole search, across every collection consulted. */
const TOTAL_BUDGET_MS = 4_000;

/** How many collections are held in memory at once. */
const CACHE_LIMIT = 3;

/** How long a retrieved collection stays warm. */
const CACHE_TTL_MS = 30 * 60 * 1000;

const ARABIC_LETTER = /[؀-ۿ]/;

/**
 * The collections, by the names they are known by.
 *
 * Order matters: the two Sahihs are consulted first, then the four Sunan, then
 * the Muwatta and the two Forty-collections. A question is usually answered by
 * the first books it is put to.
 */
interface Collection {
  readonly edition: string;
  readonly titleAr: string;
}

const COLLECTIONS: readonly Collection[] = [
  { edition: 'ara-bukhari', titleAr: 'صحيح البخاري' },
  { edition: 'ara-muslim', titleAr: 'صحيح مسلم' },
  { edition: 'ara-abudawud', titleAr: 'سنن أبي داود' },
  { edition: 'ara-tirmidhi', titleAr: 'جامع الترمذي' },
  { edition: 'ara-nasai', titleAr: 'سنن النسائي' },
  { edition: 'ara-ibnmajah', titleAr: 'سنن ابن ماجه' },
  { edition: 'ara-malik', titleAr: 'موطأ الإمام مالك' },
  { edition: 'ara-nawawi', titleAr: 'الأربعون النووية' },
  { edition: 'ara-qudsi', titleAr: 'الأربعون القدسية' },
];

const COLLECTION_BY_EDITION = new Map(COLLECTIONS.map((c) => [c.edition, c]));

// ─── THE SHAPE THE ROUTE RETURNS ─────────────────────────────────────────────

interface RawGrade {
  readonly name?: string;
  readonly grade?: string;
}

interface RawHadith {
  readonly hadithnumber?: number;
  readonly arabicnumber?: number;
  readonly text?: string;
  readonly grades?: readonly RawGrade[];
  readonly reference?: { readonly book?: number; readonly hadith?: number };
}

interface RawCollection {
  readonly hadiths?: readonly RawHadith[];
}

// ─── ARABIC, MADE COMPARABLE ─────────────────────────────────────────────────

/**
 * Strips what varies between two spellings of the same word: the diacritics, the
 * elongation mark, and the forms of alif and ya that scribes differ over. Two
 * texts that differ only in these are the same text for the purpose of finding.
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

/** Words that carry the asking rather than the subject. */
const FRAMING_WORDS = new Set([
  'ما', 'ماذا', 'من', 'هل', 'كيف', 'لماذا', 'متي', 'اين', 'هي', 'هو',
  'التي', 'الذي', 'عن', 'في', 'علي', 'الي', 'مع', 'قصه', 'حديث', 'احاديث',
  'اذكر', 'حدثني', 'اخبرني', 'معني', 'تفسير', 'شرح', 'ملخص', 'نبذه',
  'كل', 'بعض', 'هذه', 'هذا', 'وما', 'وهل', 'ان', 'قال', 'يقول', 'سيره',
  'فضل', 'باب', 'كتاب',
]);

/** The words of a question that a book could actually be searched for. */
export function subjectWords(query: string): string[] {
  return normaliseArabic(query)
    .replace(/[،؛؟.,!?:;"'()[\]{}]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !FRAMING_WORDS.has(w));
}

// ─── HOLDING A COLLECTION ────────────────────────────────────────────────────

interface CachedCollection {
  readonly hadiths: readonly RawHadith[];
  /** The normalised text of each narration, aligned by index. */
  readonly searchable: readonly string[];
  readonly loadedAtMs: number;
}

const cache = new Map<string, CachedCollection>();

/**
 * Empties the held collections.
 *
 * A cache with no way to empty it is a cache you cannot recover from: a
 * collection retrieved during a bad minute stays wrong for its whole lifetime,
 * and nothing short of restarting the Empire clears it. This is that way out,
 * and it is also what lets a test observe the provider's behaviour when the
 * collections cannot be reached rather than observing a leftover from the test
 * before it.
 */
export function clearHeldCollections(): void {
  cache.clear();
}

/** What is currently held, for operational inspection. */
export function heldCollections(): string[] {
  return [...cache.keys()];
}

function evictIfNeeded(): void {
  while (cache.size > CACHE_LIMIT) {
    let oldestKey: string | null = null;
    let oldestAt = Infinity;
    for (const [k, v] of cache) {
      if (v.loadedAtMs < oldestAt) { oldestAt = v.loadedAtMs; oldestKey = k; }
    }
    if (oldestKey === null) return;
    cache.delete(oldestKey);
  }
}

async function loadCollection(edition: string, budgetMs: number): Promise<CachedCollection | null> {
  const held = cache.get(edition);
  if (held && Date.now() - held.loadedAtMs < CACHE_TTL_MS) return held;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, Math.min(FETCH_TIMEOUT_MS, budgetMs)));
  try {
    const response = await fetch(`${EDITION_BASE}/${edition}.min.json`, { signal: controller.signal });
    if (!response.ok) return null;
    const payload = (await response.json()) as RawCollection;
    const hadiths = (payload.hadiths ?? []).filter((h) => typeof h.text === 'string' && h.text.length > 0);
    if (hadiths.length === 0) return null;

    const entry: CachedCollection = {
      hadiths,
      searchable: hadiths.map((h) => normaliseArabic(h.text as string)),
      loadedAtMs: Date.now(),
    };
    cache.set(edition, entry);
    evictIfNeeded();
    return entry;
  } catch {
    // An unreachable collection contributes nothing. It does not fail the
    // investigation, and it does not become a silence either — the registry
    // records what refuses this host.
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─── A NARRATION, READY FOR THE CREATOR ──────────────────────────────────────

/**
 * Renders the gradings exactly as the sources gave them, each beside the name of
 * the scholar who issued it.
 *
 * Returns null when nothing was supplied — and null is displayed as «درجة
 * الحديث: غير متوفرة من المصدر», never filled in from the collection's
 * reputation. The two Sahihs travel this path.
 */
export function renderGrades(grades: readonly RawGrade[] | undefined): string | null {
  const stated = (grades ?? []).filter((g) => g.name && g.grade);
  if (stated.length === 0) return null;

  const lines = stated.map((g) => `${g.grade} — ${g.name}`);
  const distinct = new Set(stated.map((g) => (g.grade ?? '').trim().toLowerCase()));
  const disagreement = distinct.size > 1
    ? '\nواختلف أهل العلم في درجته، وقد عُرضت أقوالهم كما هي.'
    : '';

  return `درجة الحديث:\n${lines.join('\n')}${disagreement}`;
}

function documentIdFor(edition: string, hadithNumber: number): string {
  return `hadith-${edition}-${hadithNumber}`;
}

function parseDocumentId(documentId: string): { edition: string; number: number } | null {
  const raw = documentId.startsWith('hadith-') ? documentId.slice(7) : documentId;
  const at = raw.lastIndexOf('-');
  if (at <= 0) return null;
  const edition = raw.slice(0, at);
  const number = parseInt(raw.slice(at + 1), 10);
  if (!COLLECTION_BY_EDITION.has(edition) || Number.isNaN(number)) return null;
  return { edition, number };
}

// ─── THE PROVIDER ────────────────────────────────────────────────────────────

export class HadithProvider implements IRepositoryProvider {
  public readonly providerId: string = 'hadith-collections';

  /**
   * Search the collections for narrations bearing on the question.
   *
   * The collections hold Arabic, so the Creator's own words are used and the
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

    const deadline = Date.now() + TOTAL_BUDGET_MS;
    const found: RepositorySearchResult[] = [];

    for (const collection of COLLECTIONS) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;
      if (found.length >= limit * 2) break;

      const held = await loadCollection(collection.edition, remaining);
      if (!held) continue;

      for (let i = 0; i < held.searchable.length; i += 1) {
        const text = held.searchable[i];
        let hits = 0;
        for (const w of words) if (text.includes(w)) hits += 1;
        if (hits === 0) continue;

        const hadith = held.hadiths[i];
        const number = hadith.hadithnumber ?? hadith.arabicnumber ?? i + 1;
        found.push({
          id: documentIdFor(collection.edition, number),
          provider: this.providerId,
          title: `${collection.titleAr} — ${number}`,
          snippet: (hadith.text ?? '').slice(0, 200),
          // Every word of the subject present outranks a single word. A
          // narration's standing is not decided here — that is the grade, and
          // the grade belongs to the scholars who issued it.
          relevanceScore: Math.min(0.94, 0.4 + (hits / words.length) * 0.5),
        });
        if (found.length >= limit * 4) break;
      }
    }

    return found.sort((a, b) => b.relevanceScore - a.relevanceScore).slice(0, limit);
  }

  /** Retrieve one narration with its collection, its number, and its gradings. */
  public async fetch(documentId: string): Promise<SourceDocument> {
    const parsed = parseDocumentId(documentId);
    if (!parsed) {
      throw new Error(`[HadithProvider] Invalid narration reference: '${documentId}'`);
    }

    const collection = COLLECTION_BY_EDITION.get(parsed.edition)!;
    const held = await loadCollection(parsed.edition, FETCH_TIMEOUT_MS);
    if (!held) {
      throw new Error(`[HadithProvider] Cannot reach the collection for '${documentId}'.`);
    }

    const hadith = held.hadiths.find(
      (h) => (h.hadithnumber ?? h.arabicnumber) === parsed.number,
    );
    if (!hadith || !hadith.text) {
      throw new Error(`[HadithProvider] Narration '${documentId}' is not in the collection.`);
    }

    const place = `${collection.titleAr} — الحديث ${parsed.number}`;
    const grades = renderGrades(hadith.grades);

    // The narration, then where it is found, then what the scholars said of it —
    // and when they said nothing, that silence is spoken plainly rather than
    // filled in from the collection's name.
    const content = [
      hadith.text,
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
