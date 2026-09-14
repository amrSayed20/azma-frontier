/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Scripture Provider — the Qur'an itself.
 *
 * ─── WHY THIS PROVIDER EXISTS ───────────────────────────────────────────────
 *
 *   Until now a religious question reached only the English catalogues. Asked
 *   about أصحاب الكهف, the chamber returned an English media entry — "Seven
 *   Sleepers: Christian and Muslim story" — and graded it as evidence. The
 *   Founder's standing rule is that for religious content the sole authority is
 *   the Qur'an, and that anything merely narrated is hedged with «قيل إن» or
 *   «يقال» or «ذكر أن». The chamber could obey the second half of that rule in
 *   its wording while having no access to the first half at all. This provider
 *   closes that gap: the verse itself now enters the evidence bundle.
 *
 * ─── WHAT IT RETRIEVES ──────────────────────────────────────────────────────
 *
 *   search()  — The Qur'anic text is searched literally, so the Creator's
 *               question is reduced to its content words before it is asked.
 *               Measured from the production server: the whole phrase
 *               «قصة أصحاب الكهف» answers 404, «أصحاب الكهف» answers in 34ms
 *               with sura 18 verse 9. The framing word «قصة» is the Creator's,
 *               not the Book's, so it is set aside rather than searched.
 *
 *   fetch()   — Returns the verse in its Uthmani orthography together with the
 *               Muyassar reading of its meaning, and names the sura and verse
 *               number. The reference is not decoration: the Founder requires
 *               that a Creator can take the evidence anywhere and check it, and
 *               a verse without its place cannot be checked.
 *
 * ─── THE ARABIC QUESTION ────────────────────────────────────────────────────
 *
 *   Every other catalogue here indexes English, so an Arabic question crosses
 *   the language bridge before it is asked. This one indexes Arabic and nothing
 *   else, so it is given the Creator's own words — the nativeQuery — and asks
 *   for nothing when the question carries no Arabic at all. Returning nothing
 *   is the honest answer; a transliterated guess would not be the Qur'an.
 *
 * ─── SECRECY BOUNDARY ───────────────────────────────────────────────────────
 *
 *   providerId 'scripture' is an internal routing key, wrapped by the Ministry
 *   layer exactly as every other provider is. The endpoint host never reaches
 *   the Creator. The sura and verse do — because they are the evidence, not the
 *   vendor.
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';

const SEARCH_ENDPOINT = 'https://api.alquran.cloud/v1/search';
const AYAH_ENDPOINT = 'https://api.alquran.cloud/v1/ayah';
const UTHMANI = 'quran-uthmani';
const MEANING = 'ar.muyassar';

// Measured from the production server: a search answers in ~34ms and a verse
// with its meaning in ~237ms.
const FETCH_TIMEOUT_MS = 1_200;

/**
 * The whole search — every phrasing tried — must finish inside this.
 *
 * Phrasings are tried one after another, each only because the one before it
 * found nothing. A per-request timeout alone would let four slow attempts add up
 * to four times the ceiling, and this provider shares a Ministry with the
 * library: the Ministry waits for all of its sources, so a slow search here
 * would push the whole Ministry past the investigation's five-second deadline
 * and discard the library's evidence along with its own. One budget covers them
 * all instead, and what is not answered inside it is simply not asked.
 */
const TOTAL_BUDGET_MS = 1_500;

/** At most this many phrasings are tried before the Book is left unasked. */
const MAX_ATTEMPTS = 4;

/**
 * Words a Creator uses to frame a question rather than to name its subject.
 * They belong to the asking, not to the Book, and searching for them literally
 * is what turned «قصة أصحاب الكهف» into a 404.
 */
const FRAMING_WORDS = new Set([
  'ما', 'ما', 'ماذا', 'من', 'هل', 'كيف', 'لماذا', 'متى', 'أين', 'اين',
  'هي', 'هو', 'التي', 'الذي', 'عن', 'في', 'على', 'إلى', 'الى', 'مع',
  'قصة', 'قصه', 'حديث', 'اذكر', 'أذكر', 'حدثني', 'أخبرني', 'اخبرني',
  'معنى', 'تفسير', 'شرح', 'ملخص', 'نبذة', 'كل', 'بعض', 'هذه', 'هذا',
  'وما', 'وهل', 'أن', 'ان', 'إن', 'قال', 'يقول',
]);

const ARABIC_LETTER = /[؀-ۿ]/;

interface ScriptureMatch {
  readonly number: number;
  readonly text: string;
  readonly surah?: { readonly name?: string; readonly number?: number };
  readonly numberInSurah?: number;
}

/** Strip diacritics and the ornamental marks so word lengths mean something. */
function bare(word: string): string {
  return word.replace(/[ً-ْٰۖ-ۭـ]/g, '');
}

/**
 * Turn a Creator's question into the phrasings worth asking of a literal index,
 * longest and most specific first: the whole subject, then its adjacent pairs,
 * then its single content words.
 */
export function scriptureSearchCandidates(query: string): string[] {
  const words = query
    .replace(/[،؛؟.,!?:;"'()\[\]{}]/g, ' ')
    .split(/\s+/)
    .map((w) => bare(w).trim())
    .filter((w) => w.length > 0 && ARABIC_LETTER.test(w));

  const subject = words.filter((w) => !FRAMING_WORDS.has(w) && w.length >= 3);
  if (subject.length === 0) return [];

  const candidates: string[] = [];
  const add = (phrase: string) => {
    if (phrase.length >= 3 && !candidates.includes(phrase)) candidates.push(phrase);
  };

  add(subject.join(' '));
  for (let i = 0; i + 1 < subject.length; i += 1) add(`${subject[i]} ${subject[i + 1]}`);
  for (const word of [...subject].sort((a, b) => b.length - a.length)) add(word);

  return candidates.slice(0, MAX_ATTEMPTS);
}

async function getJson(url: string, budgetMs = FETCH_TIMEOUT_MS): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, budgetMs));
  try {
    const response = await fetch(url, { signal: controller.signal });
    // A 404 here is not a fault. It is the Book saying this wording appears
    // nowhere in it, which is a true answer and the reason to try the next one.
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export class SovereignScriptureProvider implements IRepositoryProvider {
  public readonly providerId: string = 'scripture';

  /**
   * Search the Qur'an for the subject of the Creator's question.
   *
   * `nativeQuery` carries the Creator's own Arabic. `query` may have been
   * rendered into English for the catalogues that index English, which is of no
   * use here, so the native wording is preferred whenever it exists.
   */
  public async search(
    query: string,
    limit: number,
    nativeQuery?: string,
  ): Promise<RepositorySearchResult[]> {
    const asked = nativeQuery && ARABIC_LETTER.test(nativeQuery) ? nativeQuery : query;
    if (!ARABIC_LETTER.test(asked)) return [];

    const candidates = scriptureSearchCandidates(asked);
    if (candidates.length === 0) return [];

    const deadline = Date.now() + TOTAL_BUDGET_MS;

    for (const candidate of candidates) {
      const remaining = deadline - Date.now();
      if (remaining <= 0) break;

      const url = `${SEARCH_ENDPOINT}/${encodeURIComponent(candidate)}/all/${UTHMANI}`;
      const payload = (await getJson(url, Math.min(FETCH_TIMEOUT_MS, remaining))) as
        | { data?: { matches?: readonly ScriptureMatch[] } }
        | null;
      const matches = payload?.data?.matches;
      if (!matches || matches.length === 0) continue;

      return matches.slice(0, limit).map((match, index) => ({
        id: `ayah-${match.number}`,
        provider: this.providerId,
        title: match.surah?.name ? `${match.surah.name} — ${match.numberInSurah ?? ''}`.trim() : 'آية',
        snippet: match.text,
        // The Qur'an is the authority the Founder named for this domain, and the
        // verse returned is a literal match on the subject asked about. It is
        // ranked above every catalogue rather than left to compete with them.
        relevanceScore: Math.max(0.8, 0.99 - index * 0.02),
      }));
    }

    return [];
  }

  /**
   * Retrieve one verse: its Uthmani text, its place, and the Muyassar reading.
   */
  public async fetch(documentId: string): Promise<SourceDocument> {
    const raw = documentId.startsWith('ayah-') ? documentId.slice(5) : documentId;
    const number = parseInt(raw, 10);
    if (Number.isNaN(number) || number <= 0) {
      throw new Error(`[SovereignScriptureProvider] Invalid verse reference: '${documentId}'`);
    }

    const payload = (await getJson(
      `${AYAH_ENDPOINT}/${number}/editions/${UTHMANI},${MEANING}`,
    )) as { data?: readonly ScriptureMatch[] } | null;

    const editions = payload?.data;
    if (!editions || editions.length === 0) {
      throw new Error(`[SovereignScriptureProvider] Cannot retrieve verse '${documentId}'.`);
    }

    const verse = editions[0];
    const meaning = editions[1]?.text;
    const place =
      verse.surah?.name && verse.numberInSurah
        ? `سورة ${verse.surah.name}، الآية ${verse.numberInSurah}`
        : 'القرآن الكريم';

    // Verse first, then where to find it, then the reading of its meaning. The
    // order matters: what is recited carries the authority, and the reading of
    // it is a reading. Both travel with the Creator when they take the evidence.
    const content = meaning
      ? `﴿${verse.text}﴾ — ${place}.\n\nالمعنى: ${meaning}`
      : `﴿${verse.text}﴾ — ${place}.`;

    return { id: documentId, provider: this.providerId, content };
  }
}
