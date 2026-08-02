/**
 * AZMA OS — Al Hujjah Al-Damighah
 * KNOWLEDGE MINISTRY VI — Business Intelligence Ministry
 *
 * The Hacker News Knowledge Provider.
 *
 * Serves the Ministry of Business Intelligence under the Ministry layer.
 * Queries the Algolia Hacker News public search API to retrieve top stories
 * relevant to the query, and delivers them as SourceDocuments to the Evidence
 * chain.
 *
 * ─── WHY HACKER NEWS ─────────────────────────────────────────────────────────
 *
 *   Hacker News is the primary public forum for startup launches, technology
 *   adoption, funding announcements, and industry discourse. Its content
 *   directly serves the Business Intelligence Ministry's constitutional mandate:
 *
 *     Emerging opportunities   — product launches, "Show HN" posts, funding rounds
 *     Competitive movement     — company acquisitions, market entries, pivots
 *     Industry evolution       — technology adoption curves, industry analysis
 *     Consumer interests       — what technology consumers actively discuss
 *     Market trends            — rising and falling interest in specific domains
 *
 *   The Algolia HN search API is publicly available, free of charge, requires
 *   no authentication, and imposes no per-request cost — meeting the Empire's
 *   launch-era constraint of free or very low-cost providers.
 *
 * ─── WHAT THIS PROVIDER DOES ────────────────────────────────────────────────
 *
 *   search()  — Queries the Algolia HN search endpoint for stories relevant
 *               to the query string. Returns at most `limit` results as
 *               RepositorySearchResult records, position-scored by Algolia's
 *               own relevance ranking.
 *
 *   fetch()   — Retrieves the full story record (title, discussion text, points)
 *               from the Algolia HN items endpoint. Returns a SourceDocument
 *               sized for the EvidenceExtractor's keyword-scoring pass.
 *
 * ─── WHAT THIS PROVIDER DOES NOT DO ─────────────────────────────────────────
 *
 *   Does not expose Hacker News usernames, comments, or URLs.
 *   Does not recommend stories, companies, or technologies to the Creator.
 *   Does not perform sentiment analysis or investment analysis.
 *   Does not appear in KnowledgeDeclaration output (constitutional secrecy).
 *   Does not modify Investigation, Evidence, or Knowledge stages.
 *
 * ─── CONSTITUTIONAL SECRECY BOUNDARY ────────────────────────────────────────
 *
 *   This provider's ID ('hacker-news') is an internal Ministry routing key.
 *   MinistryRegistry wraps it under 'ministry-business-intelligence'.
 *   Evidence items carry 'ministry-business-intelligence' as sourceProvider —
 *   never 'hacker-news' and never 'algolia'.
 *
 * ─── DOCUMENT ID FORMAT ──────────────────────────────────────────────────────
 *
 *   'hn-{objectID}' where objectID is the Algolia/HN numeric story ID.
 *   Example: 'hn-38123456', 'hn-40000001'
 *
 * ─── EXTERNAL DEPENDENCY ─────────────────────────────────────────────────────
 *
 *   Algolia HN Search  — https://hn.algolia.com/api/v1/search  (search)
 *                      — https://hn.algolia.com/api/v1/items/{id}  (fetch)
 *                        Public, free, no authentication required.
 *                        Standard rate limits apply; graceful degradation
 *                        on non-2xx responses.
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';

// ─── EXTERNAL ENDPOINTS ───────────────────────────────────────────────────────

const HN_SEARCH_URL = 'https://hn.algolia.com/api/v1/search';
const HN_ITEM_URL = 'https://hn.algolia.com/api/v1/items';
const REQUEST_HEADERS = {
  'User-Agent': 'AZMA-OS Intelligence Engine/1.0 (Knowledge Research)',
  'Accept': 'application/json',
};

// ─── ALGOLIA RESPONSE TYPES ───────────────────────────────────────────────────

interface HNHit {
  readonly objectID: string;
  readonly title: string;
  readonly story_text?: string | null;
  readonly points?: number | null;
  readonly url?: string | null;
  readonly author?: string | null;
}

interface HNSearchResponse {
  readonly hits: readonly HNHit[];
}

interface HNItem {
  readonly id: number;
  readonly title?: string | null;
  readonly text?: string | null;
  readonly points?: number | null;
  readonly url?: string | null;
  readonly author?: string | null;
}

// ─── DOCUMENT ID UTILITIES ───────────────────────────────────────────────────

export function extractHNObjectId(documentId: string): string {
  if (!documentId.startsWith('hn-')) {
    throw new Error(
      `[HackerNewsProvider] Invalid document ID: '${documentId}'. Expected format: 'hn-{objectID}'`,
    );
  }
  const objectId = documentId.slice(3);
  if (!objectId || !/^\d+$/.test(objectId)) {
    throw new Error(
      `[HackerNewsProvider] Invalid document ID: '${documentId}'. objectID must be numeric.`,
    );
  }
  return objectId;
}

// ─── CONTENT BUILDERS ────────────────────────────────────────────────────────

function buildSnippet(hit: HNHit): string {
  const storyText = hit.story_text;
  if (storyText && storyText.trim()) {
    return storyText.slice(0, 200).trim();
  }
  const points = hit.points ?? 0;
  return `Community discussion: ${hit.title}. Points: ${points}.`;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

function buildHNContent(item: HNItem): string {
  const title = item.title ?? 'Untitled';
  const lines: string[] = [`Business Intelligence: ${title}`];

  const points = item.points;
  if (points != null && points > 0) {
    lines.push(`Community Points: ${points}`);
  }

  // Include discussion text if present.
  // Constitutional secrecy: strip all URLs before including (Creator receives
  // Sovereign Knowledge only — no external pointers).
  const text = item.text;
  if (text && text.trim()) {
    // 1. Strip HTML tags
    let cleaned = text.replace(/<[^>]*>/g, ' ');
    // 2. Decode HTML entities so encoded URLs become plain text
    cleaned = decodeHtmlEntities(cleaned);
    // 3. Remove any URLs (now in plain form after decoding)
    cleaned = cleaned.replace(/https?:\/\/\S+/g, '').replace(/\s+/g, ' ').trim();
    if (cleaned) {
      lines.push(`Discussion: ${cleaned.slice(0, 600)}`);
    }
  }

  return lines.join('\n');
}

// ─── THE PROVIDER ─────────────────────────────────────────────────────────────

export class HackerNewsProvider implements IRepositoryProvider {
  // Internal sub-provider routing key used inside the Ministry composite key mechanism.
  // Never surfaces above the Ministry layer: evidence.sourceProvider = 'ministry-business-intelligence'.
  public readonly providerId: string = 'hacker-news';

  /**
   * Search Hacker News for stories relevant to the query.
   *
   * Uses Algolia's HN search API with `tags=story` to retrieve only top-level
   * stories (not comments or polls). Results are returned in Algolia's own
   * relevance order; position-based scoring (0.90→0.10) respects that ordering.
   *
   * On network failure or non-2xx response, returns empty results so the
   * investigation continues with other active Ministries.
   */
  public async search(query: string, limit: number): Promise<RepositorySearchResult[]> {
    const url = new URL(HN_SEARCH_URL);
    url.searchParams.set('query', query);
    url.searchParams.set('tags', 'story');
    url.searchParams.set('hitsPerPage', String(Math.min(limit, 10)));

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: REQUEST_HEADERS,
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      console.warn('[HackerNewsProvider] Search request failed (network error or timeout). Returning empty results.');
      return [];
    }

    if (!response.ok) {
      console.warn(`[HackerNewsProvider] Search returned HTTP ${response.status}. Returning empty results.`);
      return [];
    }

    const data = (await response.json()) as HNSearchResponse;
    const hits = data.hits.slice(0, limit);

    return hits.map((hit, index) => ({
      id: `hn-${hit.objectID}`,
      provider: this.providerId,
      title: hit.title,
      snippet: buildSnippet(hit),
      relevanceScore: Math.max(0.1, 0.90 - index * 0.05),
    }));
  }

  /**
   * Retrieve the full story record for a previously found Hacker News story.
   *
   * Fetches from the Algolia items endpoint using the story's numeric objectID.
   * Returns title, points, and discussion text (if any) — never the external URL
   * (constitutional secrecy: the Creator receives Sovereign Knowledge only,
   * not pointers to external sources).
   *
   * Throws on network failure or non-2xx response so the IntelligenceEngine's
   * silent-continuation handler bypasses this document.
   */
  public async fetch(documentId: string): Promise<SourceDocument> {
    const objectId = extractHNObjectId(documentId);

    const url = `${HN_ITEM_URL}/${objectId}`;
    let response: Response;
    try {
      response = await fetch(url, {
        headers: REQUEST_HEADERS,
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      throw new Error(
        `[HackerNewsProvider] Fetch request failed for item '${documentId}' (network error or timeout).`,
      );
    }

    if (!response.ok) {
      throw new Error(
        `[HackerNewsProvider] Cannot fetch item '${documentId}': HTTP ${response.status}`,
      );
    }

    const item = (await response.json()) as HNItem;

    return {
      id: documentId,
      provider: this.providerId,
      content: buildHNContent(item),
    };
  }
}
