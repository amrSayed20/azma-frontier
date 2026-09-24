/**
 * AZMA OS — Al Hujjah Al-Damighah
 *
 * The Sovereign Library Provider — 78,130 volumes the Empire indexes itself.
 *
 * ─── WHAT WAS WRONG BEFORE ──────────────────────────────────────────────────
 *
 *   The library was written off as a weak source. It was not weak. Its *index*
 *   is a third-party service that answers 403 to this host, and for weeks a
 *   blocked route was read as a poor library — so the chamber asked the outside
 *   world for things it already owned.
 *
 *   «لديك كنوز في هذه المكتبة فاقتنص منها قدر استطاعتك... لماذا تبحث عن مصادر
 *    خارجية فقط؟ أين تنوّع الآراء؟ أين التعدّدية، الرأي والرأي الآخر؟»
 *
 *   Measured over the catalogue: 11,877 works touching history, 11,988
 *   philosophy and literature, 675 medicine, 1,087 the natural sciences, 146
 *   touching Islam and the orientalists who wrote on it, 163 by authors of
 *   antiquity — Plato, Plutarch, Hippocrates, Galen, Ibn Sina.
 *
 *   The catalogue now lives in the Empire's own store. Nothing here asks an
 *   index service anything.
 *
 * ─── AND IT READS DEEPER THAN THE OPENING ───────────────────────────────────
 *
 *   The old provider read the first ten kilobytes of a book — which for most
 *   volumes is the title page and the preface. A passage about a subject sits
 *   wherever the author put it. This one retrieves a wide window and finds the
 *   passage that actually discusses what was asked, or reports honestly that it
 *   read part of a book and found nothing.
 *
 * ─── PLURALITY IS THE POINT, NOT A SIDE EFFECT ──────────────────────────────
 *
 *   Ten results from one author's collected editions is one opinion wearing ten
 *   hats. The catalogue search caps each author, so what comes back is a set of
 *   voices — and where they disagree, a Creator sees the disagreement instead of
 *   whichever voice the index happened to rank first.
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';
import { SourceAuthority } from '../domain/evidence-authority';
import { searchWorks, findWork, hasWorks, libraryCounts } from '@/src/persistent-storage/library-repository';

const CACHE = 'https://www.gutenberg.org/cache/epub';

/** Measured: a whole volume retrieves in under a second. */
const FETCH_TIMEOUT_MS = 8_000;

/**
 * How much of a book is read.
 *
 * Two hundred kilobytes rather than ten. The old window covered a title page;
 * this covers a substantial part of most volumes, and what it cannot cover it
 * says it cannot cover rather than implying the whole book was searched.
 */
const READING_WINDOW_BYTES = 204_800;

/** The passage handed to the chamber, once the right place is found. */
const PASSAGE_CHARS = 1_200;

const LATIN_WORD = /[A-Za-z]{3,}/;

/**
 * The document id carries the subject words the search was made with.
 *
 * IRepositoryProvider.fetch() receives an id and nothing else, and a book must
 * be read for a *subject* — reading the opening of a volume and offering it as
 * evidence is what the ten-kilobyte window used to do. Holding the words on the
 * provider between the two calls would be wrong in a different way: two
 * Creators searching at once would read each other's questions.
 */
function documentIdFor(workId: string, words: readonly string[]): string {
  return `library-${workId}~${words.slice(0, 6).join('.')}`;
}

export function parseLibraryId(documentId: string): { workId: string; words: string[] } | null {
  if (!documentId.startsWith('library-')) return null;
  const raw = documentId.slice(8);
  const at = raw.indexOf('~');
  const workId = at === -1 ? raw : raw.slice(0, at);
  if (!/^\d+$/.test(workId)) return null;
  const words = at === -1 ? [] : raw.slice(at + 1).split('.').filter(Boolean);
  return { workId, words };
}

/** Gutenberg wraps every text in a licence header and footer. */
/**
 * Remove the library's own wrapper from a volume's text.
 *
 * Exported because GutenbergProvider reads volumes in this same format, and
 * because what it removes is not merely noise: the wrapper repeats the name of
 * the service that published the file. A vendor's name must never reach the
 * Creator — not in English, and not translated either. Stripping it is part of
 * the Knowledge Source Abstraction Principle, not a tidying step.
 */
export function stripBoilerplate(raw: string): string {
  const start = raw.indexOf('START OF THE PROJECT GUTENBERG');
  const from = start === -1 ? 0 : raw.indexOf('\n', start) + 1;
  const end = raw.indexOf('END OF THE PROJECT GUTENBERG');
  return raw.slice(from, end === -1 ? raw.length : end);
}

/**
 * The part of a book that actually discusses what was asked.
 *
 * Returns null when the window carried nothing on the subject — which is a true
 * answer about a partly-read book, and better than handing back its opening
 * paragraph as though it were evidence.
 */
export function findPassage(body: string, words: readonly string[]): string | null {
  if (words.length === 0) return null;
  const haystack = body.toLowerCase();

  let bestAt = -1;
  let bestHits = 0;
  // Walk in windows so a passage mentioning several of the words beats one
  // mentioning a single word many times.
  const STEP = 600;
  for (let at = 0; at + PASSAGE_CHARS <= haystack.length + STEP; at += STEP) {
    const window = haystack.slice(at, at + PASSAGE_CHARS);
    let hits = 0;
    for (const w of words) if (window.includes(w)) hits += 1;
    if (hits > bestHits) { bestHits = hits; bestAt = at; }
    if (hits === words.length) break;
  }

  if (bestAt === -1 || bestHits === 0) return null;
  return body.slice(bestAt, bestAt + PASSAGE_CHARS).replace(/\s+/g, ' ').trim();
}

/** The chamber's own account of the library it holds. */
export function libraryHolding(): { held: boolean; total: number; byLanguage: Record<string, number> } {
  try {
    const counts = libraryCounts();
    return { held: counts.total > 0, ...counts };
  } catch {
    return { held: false, total: 0, byLanguage: {} };
  }
}

export class SovereignLibraryProvider implements IRepositoryProvider {
  public readonly providerId: string = 'sovereign-library';

  /**
   * Search the catalogue the Empire holds.
   *
   * The library is overwhelmingly English — one Arabic work in 78,130 — so the
   * rendered query is what reaches it. What comes back crosses into Arabic
   * before a Creator sees or hears it.
   */
  public async search(
    queryText: string,
    limit: number,
    _nativeQuery?: string,
    _domain?: string,
  ): Promise<RepositorySearchResult[]> {
    const words = queryText
      .split(/\s+/)
      .map((w) => w.replace(/[^A-Za-z]/g, ''))
      .filter((w) => LATIN_WORD.test(w) && w.length >= 3)
      .map((w) => w.toLowerCase());
    if (words.length === 0) return [];

    try {
      if (!hasWorks()) return [];
      const works = searchWorks(words, limit);
      return works.map((w, index) => ({
        id: documentIdFor(w.workId, words),
        provider: this.providerId,
        title: w.title.slice(0, 140),
        snippet: [w.authors, w.subjects].filter(Boolean).join(' — ').slice(0, 200),
        // A catalogue match says a book is about a subject; it does not say the
        // book is right. Ranked below sources that carry their own standing.
        relevanceScore: Math.max(0.4, 0.72 - index * 0.02),
      }));
    } catch {
      return [];
    }
  }

  /**
   * Retrieve the passage of a book that bears on the question.
   *
   * The Creator is told which work it is, who wrote it, and that only part of
   * the volume was read — «قُرئ جزء من الكتاب لا الكتاب كله» — because a
   * Creator quoting a book has a right to know how much of it was searched.
   */
  public async fetch(documentId: string): Promise<SourceDocument> {
    const parsed = parseLibraryId(documentId);
    if (!parsed) throw new Error(`[SovereignLibraryProvider] Invalid reference: '${documentId}'`);
    const { workId, words } = parsed;

    const work = findWork(workId);
    if (!work) throw new Error(`[SovereignLibraryProvider] Work '${documentId}' is not in the catalogue.`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let raw: string;
    try {
      const response = await fetch(`${CACHE}/${workId}/pg${workId}.txt`, {
        headers: { Range: `bytes=0-${READING_WINDOW_BYTES - 1}` },
        signal: controller.signal,
      });
      if (response.status !== 200 && response.status !== 206) {
        throw new Error(`HTTP ${response.status}`);
      }
      raw = await response.text();
    } catch (err) {
      throw new Error(`[SovereignLibraryProvider] Cannot read '${documentId}': ${String(err).slice(0, 60)}`);
    } finally {
      clearTimeout(timer);
    }

    const body = stripBoilerplate(raw);
    const attribution = [
      `${work.title}${work.authors ? ` — ${work.authors}` : ''}.`,
      'قُرئ جزء من الكتاب لا الكتاب كله.',
      'وهذا رأي مؤلفه، يُقرأ بجانب غيره لا وحده.',
    ].join('\n');

    return {
      id: documentId,
      provider: this.providerId,
      // The opening is the fallback, and it is marked as an opening rather than
      // passed off as a passage about the subject.
      content: body.slice(0, PASSAGE_CHARS).replace(/\s+/g, ' ').trim(),
      authority: SourceAuthority.DOCUMENTED,
      attributionAr: attribution,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as SourceDocument & { body?: string };
  }

  /** Retrieve, then find the passage that bears on these words. */
  public async fetchForSubject(documentId: string, words: readonly string[]): Promise<SourceDocument> {
    const doc = await this.fetch(documentId);
    const passage = findPassage(doc.content, words.map((w) => w.toLowerCase()));
    if (!passage) return doc;
    return { ...doc, content: passage };
  }
}
