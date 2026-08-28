/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE SOURCES FOUNDATION — Constitutional Foundation Package XVI
 *
 * The Gutenberg Knowledge Provider.
 *
 * The first real Knowledge Source implementation in AZMA OS.
 * Replaces the Package IX–XV simulated baseline with live retrieval from
 * Project Gutenberg — the world's oldest digital library of public domain books.
 *
 * ─── WHAT THIS PROVIDER DOES ────────────────────────────────────────────────
 *
 *   search()  — Queries the Gutendex API (https://gutendex.com), the open
 *               REST index of all Project Gutenberg titles, by keyword.
 *               Returns up to `limit` books as RepositorySearchResult records.
 *
 *   fetch()   — Retrieves the opening 10 KB of the requested book's plain-text
 *               file from the Gutenberg cache CDN. 10 KB is the constitutional
 *               evidence window — sufficient for EvidenceExtractor.extract() to
 *               run its keyword-overlap scoring against any claim.
 *
 * ─── CONSTITUTIONAL SECRECY BOUNDARY ────────────────────────────────────────
 *
 *   This provider's `providerId` ('gutenberg') is an internal routing key used
 *   only inside the Ministry wrapper's composite document key mechanism.
 *   It never appears in the constitutional chain above the Ministry layer.
 *
 *   MinistryRegistry.buildRepositoryManager() wraps this provider under the
 *   Ministry of Human Knowledge ('ministry-human-knowledge'). All outgoing
 *   SourceDocuments are re-stamped with the Ministry's constitutional ID before
 *   reaching EvidenceExtractor. Evidence.sourceProvider is therefore
 *   'ministry-human-knowledge', never 'gutenberg'.
 *
 *   Book titles, author names, download counts, and Gutenberg document IDs
 *   are internal to this provider. They do not appear in KnowledgeDeclaration.
 *
 * ─── EXTERNAL DEPENDENCIES ──────────────────────────────────────────────────
 *
 *   Gutendex API     — https://gutendex.com/books/?search={query}&languages=en
 *                      Public, free, no authentication required.
 *                      Returns Project Gutenberg book metadata in JSON.
 *
 *   Gutenberg cache  — https://www.gutenberg.org/cache/epub/{id}/pg{id}.txt
 *                      Public CDN, no authentication required.
 *                      Served with Range header support (RFC 7233).
 *                      Requesting bytes 0–10239 returns first 10 KB only.
 *
 * ─── DOCUMENT ID FORMAT ──────────────────────────────────────────────────────
 *
 *   IDs returned by search() use the format: 'book-{gutenbergNumericId}'
 *   Examples: 'book-1513' (Romeo and Juliet), 'book-1342' (Pride and Prejudice)
 *   fetch() accepts this format and extracts the numeric ID for cache lookup.
 *
 * ─── WHAT THIS PROVIDER DOES NOT DO ─────────────────────────────────────────
 *
 *   Does not modify Investigation, Evidence, or Knowledge stages.
 *   Does not modify the Ministry architecture.
 *   Does not expose HTTP endpoints, document IDs, or author names to
 *   creator-facing output — that boundary is the KnowledgeDeclaration.
 *   Does not produce evidence, verdicts, or knowledge declarations.
 *
 * ─── RUNTIME REQUIREMENT ────────────────────────────────────────────────────
 *
 *   Requires network access to gutendex.com and www.gutenberg.org.
 *   Uses the global fetch() API (Node.js 18+, Next.js 13+).
 *   If the network is unavailable, errors propagate to the caller.
 *   The MinistryRegistry wrapper and IntelligenceEngine both handle errors
 *   gracefully — investigation continues with empty results rather than crashing.
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';

// ─── GUTENDEX RESPONSE TYPES ──────────────────────────────────────────────────

interface GutendexAuthor {
  readonly name: string;
  readonly birth_year?: number | null;
  readonly death_year?: number | null;
}

interface GutendexBook {
  readonly id: number;
  readonly title: string;
  readonly authors: readonly GutendexAuthor[];
  readonly subjects: readonly string[];
  readonly download_count?: number;
}

interface GutendexResponse {
  readonly count: number;
  readonly results: readonly GutendexBook[];
}

// ─── INTERNAL UTILITIES ───────────────────────────────────────────────────────

const GUTENDEX_SEARCH = 'https://gutendex.com/books/';
const GUTENBERG_CACHE = 'https://www.gutenberg.org/cache/epub';
const EVIDENCE_WINDOW_BYTES = 10240; // 10 KB — sufficient for EvidenceExtractor keyword scoring
const FETCH_TIMEOUT_MS = 8_000; // Gutenberg CDN can be slow; abort rather than stall the investigation

function buildBookSnippet(book: GutendexBook): string {
  const authorNames = book.authors
    .map((a) => a.name.split(', ').reverse().join(' '))
    .join(', ');
  const subjectSample = book.subjects.slice(0, 2).join('; ');
  const downloads =
    book.download_count != null
      ? ` Downloaded ${book.download_count.toLocaleString('en-US')} times.`
      : '';
  return authorNames
    ? `By ${authorNames}.${subjectSample ? ` Subjects: ${subjectSample}.` : ''}${downloads}`
    : book.title;
}

function extractNumericBookId(documentId: string): number {
  const raw = documentId.startsWith('book-') ? documentId.slice(5) : documentId;
  const numeric = parseInt(raw, 10);
  if (isNaN(numeric) || numeric <= 0) {
    throw new Error(`[GutenbergProvider] Invalid document ID: '${documentId}'`);
  }
  return numeric;
}

// ─── THE PROVIDER ─────────────────────────────────────────────────────────────

export class GutenbergProvider implements IRepositoryProvider {
  // Internal sub-provider routing key. Used by MinistryRegistry to route composite-key fetches.
  // The Investigation Engine routes by Ministry ID; this ID is internal to the Ministry wrapper.
  public readonly providerId: string = 'gutenberg';

  /**
   * Search Project Gutenberg for books matching the query.
   *
   * Calls the Gutendex API with the query and language filter (English only).
   * Results are already ordered by Gutendex relevance scoring. The position-based
   * relevance scores applied here (0.95 → 0.10) preserve that ordering when the
   * RepositoryManager aggregates results across multiple Ministries.
   */
  public async search(query: string, limit: number): Promise<RepositorySearchResult[]> {
    console.log(`[Gutenberg Provider] Querying Gutendex: "${query}" (limit: ${limit})`);

    const url = new URL(GUTENDEX_SEARCH);
    url.searchParams.set('search', query);
    url.searchParams.set('languages', 'en');

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(url.toString(), { signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
    if (!response.ok) {
      throw new Error(
        `[GutenbergProvider] Gutendex search failed: HTTP ${response.status}`,
      );
    }

    const data = (await response.json()) as GutendexResponse;

    return data.results.slice(0, limit).map((book, index) => ({
      id: `book-${book.id}`,
      provider: this.providerId,
      title: book.title,
      snippet: buildBookSnippet(book),
      relevanceScore: Math.max(0.1, 0.95 - index * 0.05),
    }));
  }

  /**
   * Retrieve the opening text of a Gutenberg book.
   *
   * Fetches only the first 10 KB of the book's plain-text file via a Range
   * request. This is the constitutional evidence window passed to EvidenceExtractor.
   * The Range request ensures fast retrieval even for multi-megabyte books.
   *
   * Returns HTTP 200 (full file smaller than window) or 206 (partial content).
   * Any other status throws — the IntelligenceEngine handles this gracefully.
   */
  public async fetch(documentId: string): Promise<SourceDocument> {
    const numericId = extractNumericBookId(documentId);
    const url = `${GUTENBERG_CACHE}/${numericId}/pg${numericId}.txt`;

    console.log(`[Gutenberg Provider] Fetching book ${numericId} (first ${EVIDENCE_WINDOW_BYTES} bytes)`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Range: `bytes=0-${EVIDENCE_WINDOW_BYTES - 1}` },
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }

    if (response.status !== 200 && response.status !== 206) {
      throw new Error(
        `[GutenbergProvider] Cannot retrieve '${documentId}': HTTP ${response.status}`,
      );
    }

    return {
      id: documentId,
      provider: this.providerId,
      content: await response.text(),
    };
  }
}
