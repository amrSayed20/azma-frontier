/**
 * AZMA OS — Al Hujjah Al-Damighah
 * KNOWLEDGE MINISTRY VII — Media Intelligence Ministry
 *
 * The Wikipedia Knowledge Provider.
 *
 * Serves the Ministry of Media Intelligence under the Ministry layer.
 * Queries the public Wikipedia search API and the Wikipedia REST summary
 * endpoint to retrieve page summaries relevant to the query, delivering
 * them as SourceDocuments to the Evidence chain.
 *
 * ─── WHY WIKIPEDIA FOR MEDIA INTELLIGENCE ────────────────────────────────────
 *
 *   Wikipedia is one of the world's most-read media platforms. Its articles
 *   reflect what topics the public is actively discussing, reading, and
 *   researching. The constitutional mandate of the Media Intelligence Ministry
 *   covers:
 *
 *     Emerging public conversations  — current-events articles updated in
 *                                      real time by the global community
 *     Media narratives               — encyclopedic records of ongoing stories,
 *                                      controversies, and cultural moments
 *     Audience interests             — page view data reflected in search rank
 *     Viral topics                   — trending cultural phenomena, recent
 *                                      releases, public figures in the news
 *     Platform conversations         — Wikipedia talk pages inform which
 *                                      topics are actively contested
 *
 *   Wikipedia covers CURRENT world discourse. Gutenberg (Ministry of Human
 *   Knowledge) covers historical and literary archives. These are constitutionally
 *   distinct domains. This provider does not overlap with GutenbergProvider.
 *
 *   The MediaWiki Action API and Wikipedia REST API are:
 *     — publicly available, free of charge
 *     — no authentication or API key required
 *     — no per-request cost
 *     — stable, long-maintained infrastructure
 *
 * ─── WHAT THIS PROVIDER DOES ────────────────────────────────────────────────
 *
 *   search()  — Queries Wikipedia's MediaWiki Action API for pages relevant
 *               to the query string. Returns at most `limit` results as
 *               RepositorySearchResult records, scored by position in
 *               Wikipedia's own relevance ranking.
 *
 *   fetch()   — Retrieves the full page summary (title, description, extract)
 *               from the Wikipedia REST summary endpoint. Returns a SourceDocument
 *               sized for the EvidenceExtractor's keyword-scoring pass.
 *
 * ─── WHAT THIS PROVIDER DOES NOT DO ─────────────────────────────────────────
 *
 *   Does not expose Wikipedia page URLs to any caller.
 *   Does not perform editorial analysis or recommendations.
 *   Does not appear in KnowledgeDeclaration output (constitutional secrecy).
 *   Does not modify Investigation, Evidence, or Knowledge stages.
 *   Does not duplicate the Gutenberg provider's literary/historical domain.
 *
 * ─── CONSTITUTIONAL SECRECY BOUNDARY ────────────────────────────────────────
 *
 *   This provider's ID ('wikipedia') is an internal Ministry routing key.
 *   MinistryRegistry wraps it under 'ministry-media-intelligence'.
 *   Evidence items carry 'ministry-media-intelligence' as sourceProvider —
 *   never 'wikipedia'.
 *
 * ─── DOCUMENT ID FORMAT ──────────────────────────────────────────────────────
 *
 *   'wiki-{page_slug}' where page_slug is the Wikipedia page title with
 *   spaces replaced by underscores (Wikipedia's own canonical convention).
 *   Example: 'wiki-Artificial_intelligence', 'wiki-Taylor_Swift'
 *
 * ─── EXTERNAL DEPENDENCIES ───────────────────────────────────────────────────
 *
 *   MediaWiki Action API  — https://en.wikipedia.org/w/api.php  (search)
 *                           Public, free, no authentication required.
 *
 *   Wikipedia REST API    — https://en.wikipedia.org/api/rest_v1/page/summary
 *                           Public, free, no authentication required.
 *                           Returns plain-text extract, title, description.
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';

// ─── EXTERNAL ENDPOINTS ───────────────────────────────────────────────────────

const WIKI_SEARCH_URL = 'https://en.wikipedia.org/w/api.php';
const WIKI_SUMMARY_URL = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const REQUEST_HEADERS = {
  'User-Agent': 'AZMA-OS Intelligence Engine/1.0 (Knowledge Research)',
  'Accept': 'application/json',
};

// ─── API RESPONSE TYPES ───────────────────────────────────────────────────────

interface WikiSearchItem {
  readonly title: string;
  readonly snippet: string;
  readonly pageid: number;
}

interface WikiSearchResponse {
  readonly query?: {
    readonly search?: readonly WikiSearchItem[];
  };
}

interface WikiSummary {
  readonly title: string;
  readonly description?: string | null;
  readonly extract?: string | null;
  readonly type?: string;
}

// ─── DOCUMENT ID UTILITIES ───────────────────────────────────────────────────

function titleToSlug(title: string): string {
  // Wikipedia canonical: spaces become underscores
  return title.replace(/ /g, '_');
}

function slugToTitle(slug: string): string {
  return slug.replace(/_/g, ' ');
}

export function extractWikiSlug(documentId: string): string {
  if (!documentId.startsWith('wiki-')) {
    throw new Error(
      `[WikipediaProvider] Invalid document ID: '${documentId}'. Expected format: 'wiki-{page_slug}'`,
    );
  }
  const slug = documentId.slice(5);
  if (!slug) {
    throw new Error(
      `[WikipediaProvider] Invalid document ID: '${documentId}'. Page slug must not be empty.`,
    );
  }
  return slug;
}

// ─── HTML STRIPPING ───────────────────────────────────────────────────────────

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── CONTENT BUILDER ─────────────────────────────────────────────────────────

function buildWikiContent(summary: WikiSummary): string {
  const lines: string[] = [`Media Topic: ${summary.title}`];

  const description = summary.description;
  if (description && description.trim()) {
    lines.push(`Description: ${description.trim()}`);
  }

  const extract = summary.extract;
  if (extract && extract.trim()) {
    // Strip HTML (summary extract is plain text from the API, but defensively strip)
    const clean = stripHtml(extract).slice(0, 600);
    if (clean) {
      lines.push(`Context: ${clean}`);
    }
  }

  return lines.join('\n');
}

// ─── THE PROVIDER ─────────────────────────────────────────────────────────────

export class WikipediaProvider implements IRepositoryProvider {
  // Internal sub-provider routing key used inside the Ministry composite key mechanism.
  // Never surfaces above the Ministry layer: evidence.sourceProvider = 'ministry-media-intelligence'.
  public readonly providerId: string = 'wikipedia';

  /**
   * Search Wikipedia for pages relevant to the query.
   *
   * Uses the MediaWiki Action API list=search with srsearch parameter.
   * Results are returned in Wikipedia's own relevance order; position-based
   * scoring (0.90→0.10) respects that ordering.
   *
   * Snippets are HTML-stripped before inclusion — no markup reaches callers.
   *
   * On network failure or non-2xx response, returns empty results so the
   * investigation continues with other active Ministries.
   */
  public async search(query: string, limit: number): Promise<RepositorySearchResult[]> {
    const url = new URL(WIKI_SEARCH_URL);
    url.searchParams.set('action', 'query');
    url.searchParams.set('list', 'search');
    url.searchParams.set('srsearch', query);
    url.searchParams.set('srlimit', String(Math.min(limit, 10)));
    url.searchParams.set('utf8', '1');
    url.searchParams.set('format', 'json');
    url.searchParams.set('origin', '*');

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: REQUEST_HEADERS,
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      console.warn('[WikipediaProvider] Search request failed (network error or timeout). Returning empty results.');
      return [];
    }

    if (!response.ok) {
      console.warn(`[WikipediaProvider] Search returned HTTP ${response.status}. Returning empty results.`);
      return [];
    }

    const data = (await response.json()) as WikiSearchResponse;
    const results = data.query?.search ?? [];

    return results.slice(0, limit).map((item, index) => ({
      id: `wiki-${titleToSlug(item.title)}`,
      provider: this.providerId,
      title: item.title,
      snippet: stripHtml(item.snippet).slice(0, 200),
      relevanceScore: Math.max(0.1, 0.90 - index * 0.05),
    }));
  }

  /**
   * Retrieve the full page summary for a Wikipedia article.
   *
   * Fetches from the Wikipedia REST summary API using the page title derived
   * from the document ID slug. Returns title, description, and extract
   * (plain-text introduction) — never the page URL (constitutional secrecy).
   *
   * Throws on network failure or non-2xx response so the IntelligenceEngine's
   * silent-continuation handler bypasses this document.
   */
  public async fetch(documentId: string): Promise<SourceDocument> {
    const slug = extractWikiSlug(documentId);
    const title = slugToTitle(slug);
    const encodedTitle = encodeURIComponent(title);

    const url = `${WIKI_SUMMARY_URL}/${encodedTitle}`;
    let response: Response;
    try {
      response = await fetch(url, {
        headers: REQUEST_HEADERS,
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      throw new Error(
        `[WikipediaProvider] Fetch request failed for '${documentId}' (network error or timeout).`,
      );
    }

    if (!response.ok) {
      throw new Error(
        `[WikipediaProvider] Cannot fetch summary for '${documentId}': HTTP ${response.status}`,
      );
    }

    const summary = (await response.json()) as WikiSummary;

    return {
      id: documentId,
      provider: this.providerId,
      content: buildWikiContent(summary),
    };
  }
}
