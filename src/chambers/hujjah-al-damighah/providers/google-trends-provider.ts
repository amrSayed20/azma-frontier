/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE MINISTRY EXPANSION — Constitutional Foundation Package XVII
 * PRODUCTION UPGRADE — Knowledge Ministry VI
 *
 * The Google Trends Knowledge Provider.
 *
 * Serves the Ministry of Business Intelligence under the Ministry layer.
 * Retrieves currently trending search terms from the Google Trends public RSS
 * feed and delivers them as SourceDocuments to the Evidence chain.
 *
 * ─── WHAT THIS PROVIDER DOES ────────────────────────────────────────────────
 *
 *   search()  — Fetches (or returns cached) Google Trends daily trending topics
 *               for the US. Scores each topic by lexical overlap with the query.
 *               Returns at most `limit` results sorted by relevance score.
 *
 *   fetch()   — Returns the full trend record (term, traffic estimate, context)
 *               as a SourceDocument. Uses the in-process cache populated by
 *               search() — NO second HTTP fetch within the same TTL window.
 *               If the trend is no longer in the current feed and the cache
 *               has expired, throws so the IntelligenceEngine's silent-
 *               continuation handler bypasses it.
 *
 * ─── PRODUCTION CACHE (Knowledge Ministry VI) ────────────────────────────────
 *
 *   An in-process TTL cache (60 seconds) keyed by trend slug eliminates the
 *   rotation race condition: previously search() and fetch() each independently
 *   re-fetched the RSS feed. Trends rotate daily; if the feed updated between
 *   the two calls the slug would not match, causing a failed extraction.
 *
 *   With the cache:
 *     — The RSS feed is fetched AT MOST ONCE per 60-second window per instance.
 *     — fetch() performs a O(1) Map lookup against the cached data.
 *     — All documents found by search() are guaranteed findable by fetch()
 *       within the same investigation window (< 60 s).
 *     — After TTL expiry, the next call re-fetches once and repopulates.
 *
 * ─── DOMAIN OF SERVICE ───────────────────────────────────────────────────────
 *
 *   This provider serves Ministry of Business Intelligence ('ministry-business-
 *   intelligence'). It does not perform market analysis, produce
 *   recommendations, or generate Creator advice. It retrieves raw trend data.
 *   The Evidence chain evaluates relevance.
 *
 * ─── WHAT THIS PROVIDER DOES NOT DO ─────────────────────────────────────────
 *
 *   Does not interpret trends.
 *   Does not recommend actions to the Creator.
 *   Does not produce business advice.
 *   Does not appear in KnowledgeDeclaration output (constitutional secrecy).
 *   Does not modify Investigation, Evidence, or Knowledge stages.
 *
 * ─── CONSTITUTIONAL SECRECY BOUNDARY ────────────────────────────────────────
 *
 *   This provider's ID ('google-trends') is an internal Ministry routing key.
 *   MinistryRegistry wraps it under 'ministry-business-intelligence'.
 *   Evidence items carry 'ministry-business-intelligence' as sourceProvider —
 *   never 'google-trends'.
 *
 * ─── DOCUMENT ID FORMAT ──────────────────────────────────────────────────────
 *
 *   'trend-{slug}' where slug is the trending term lowercased with
 *   non-alphanumeric characters replaced by hyphens.
 *   Example: 'trend-super-bowl', 'trend-iphone-16'
 *
 * ─── EXTERNAL DEPENDENCY ─────────────────────────────────────────────────────
 *
 *   Google Trends RSS  — https://trends.google.com/trending/rss?geo=US
 *                        Public, free, no authentication required.
 *                        Returns today's trending search terms in RSS/XML format.
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';

// ─── EXTERNAL ENDPOINT ───────────────────────────────────────────────────────

const TRENDS_RSS_URL = 'https://trends.google.com/trending/rss?geo=US';
const REQUEST_HEADERS = {
  'User-Agent': 'AZMA-OS Intelligence Engine/1.0 (Knowledge Research)',
  'Accept': 'application/rss+xml, application/xml, text/xml, */*',
};

// 60-second TTL — covers any single investigation call (which runs fetch()
// immediately after search() for the same provider instance).
const CACHE_TTL_MS = 60_000;

// ─── INTERNAL TYPES ───────────────────────────────────────────────────────────

interface TrendItem {
  readonly title: string;
  readonly traffic: string;
  readonly description: string;
}

// ─── RSS PARSING ─────────────────────────────────────────────────────────────

function parseTrendItems(xml: string): readonly TrendItem[] {
  const itemBlocks = Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/g));
  return itemBlocks.map((match) => {
    const body = match[1];
    const titleRaw = (body.match(/<title>([\s\S]*?)<\/title>/) ?? [])[1] ?? '';
    const trafficRaw = (body.match(/<ht:approx_traffic>([\s\S]*?)<\/ht:approx_traffic>/) ?? [])[1] ?? '';
    const cdataRaw = (body.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/) ?? [])[1] ?? '';
    return {
      title: decodeEntities(titleRaw).trim(),
      traffic: trafficRaw.trim() || 'unknown',
      description: stripTags(cdataRaw).trim().slice(0, 300),
    };
  });
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ');
}

// ─── DOCUMENT ID UTILITIES ───────────────────────────────────────────────────

function makeTrendSlug(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'unknown';
}

export function extractTrendSlug(documentId: string): string {
  if (!documentId.startsWith('trend-')) {
    throw new Error(
      `[GoogleTrendsProvider] Invalid document ID: '${documentId}'. Expected format: 'trend-{slug}'`,
    );
  }
  const slug = documentId.slice(6);
  if (!slug) {
    throw new Error(`[GoogleTrendsProvider] Invalid document ID: '${documentId}'`);
  }
  return slug;
}

// ─── RELEVANCE SCORING ───────────────────────────────────────────────────────

function scoreRelevance(trendTitle: string, query: string, positionIndex: number): number {
  const queryWords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  if (queryWords.length === 0) {
    return Math.max(0.1, 0.3 - positionIndex * 0.01);
  }

  const trendWords = new Set(trendTitle.toLowerCase().split(/\s+/));
  let matches = 0;
  for (const word of queryWords) {
    if (trendWords.has(word)) matches++;
  }

  const overlapRatio = matches / queryWords.length;
  // Minimum 0.1 so Business Intelligence evidence is never zero-weighted in aggregation
  return Math.max(0.1, overlapRatio * 0.85 + (1 - positionIndex * 0.02) * 0.15);
}

// ─── SNIPPET BUILDER ─────────────────────────────────────────────────────────

function buildSnippet(item: TrendItem): string {
  const trafficPart =
    item.traffic !== 'unknown' ? `Search volume: ${item.traffic}.` : '';
  const descPart = item.description ? ` ${item.description.slice(0, 150)}` : '';
  return (trafficPart + descPart).trim() || item.title;
}

// ─── CONTENT BUILDER (for SourceDocument) ────────────────────────────────────

function buildTrendContent(item: TrendItem): string {
  const lines: string[] = [`Trending Search Term: ${item.title}`];
  if (item.traffic !== 'unknown') {
    lines.push(`Current Search Volume: ${item.traffic}`);
  }
  if (item.description) {
    lines.push(`Context: ${item.description}`);
  }
  return lines.join('\n');
}

// ─── THE PROVIDER ─────────────────────────────────────────────────────────────

export class GoogleTrendsProvider implements IRepositoryProvider {
  // Internal sub-provider routing key used inside the Ministry composite key mechanism.
  // Never surfaces above the Ministry layer: evidence.sourceProvider = 'ministry-business-intelligence'.
  public readonly providerId: string = 'google-trends';

  // ─── IN-PROCESS CACHE ──────────────────────────────────────────────────────
  // Keyed by trend slug (same key used in document IDs).
  // Eliminates the rotation race: search() populates the cache once per TTL
  // window; fetch() reads from it without a second HTTP call.
  private readonly slugCache = new Map<string, TrendItem>();
  private lastFetchedAtMs = 0;

  /**
   * Ensure the slug cache is populated and fresh.
   *
   * If the cache holds data that is less than CACHE_TTL_MS old, returns
   * immediately (no HTTP call). Otherwise fetches the RSS feed, populates
   * the cache, and records the fetch timestamp.
   *
   * On network failure: if the cache has any data (even stale), silently
   * returns — stale trends are better than no trends. If the cache is
   * empty, logs a warning so callers get empty results honestly.
   */
  private async ensureCache(): Promise<void> {
    const now = Date.now();
    if (this.slugCache.size > 0 && now - this.lastFetchedAtMs < CACHE_TTL_MS) {
      return;
    }

    let response: Response;
    try {
      response = await fetch(TRENDS_RSS_URL, {
        headers: REQUEST_HEADERS,
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      if (this.slugCache.size === 0) {
        console.warn('[GoogleTrendsProvider] RSS fetch failed (network error or timeout). Returning empty results.');
      }
      return;
    }

    if (!response.ok) {
      if (this.slugCache.size === 0) {
        console.warn(`[GoogleTrendsProvider] RSS fetch returned HTTP ${response.status}. Returning empty results.`);
      }
      return;
    }

    const xml = await response.text();
    const items = parseTrendItems(xml);

    this.slugCache.clear();
    for (const item of items) {
      this.slugCache.set(makeTrendSlug(item.title), item);
    }
    this.lastFetchedAtMs = now;
  }

  /**
   * Search Google Trends for topics relevant to the query.
   *
   * Populates (or returns) the in-process cache, then scores all cached trend
   * items by lexical overlap with the query. Items with no overlap receive the
   * minimum relevance score (0.10) — they remain in the pool so the Evidence
   * chain can determine their relevance independently.
   *
   * The Business Intelligence Ministry delivers signal about what the market
   * is actively searching for. Whether that signal is relevant to the Creator's
   * claim is the Evidence chain's determination, not the provider's.
   */
  public async search(query: string, limit: number): Promise<RepositorySearchResult[]> {
    await this.ensureCache();

    if (this.slugCache.size === 0) return [];

    const items = Array.from(this.slugCache.values());
    const scored = items.map((item, index) => ({
      item,
      score: scoreRelevance(item.title, query, index),
      slug: makeTrendSlug(item.title),
    }));

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit).map(({ item, score, slug }) => ({
      id: `trend-${slug}`,
      provider: this.providerId,
      title: item.title,
      snippet: buildSnippet(item),
      relevanceScore: score,
    }));
  }

  /**
   * Retrieve the full trend record for a previously found trending term.
   *
   * Performs an O(1) Map lookup against the in-process cache — no second HTTP
   * call within the same TTL window. If the cache has expired, re-fetches once
   * and checks again. If the trend is genuinely absent (rotated out of the live
   * feed and cache has expired), throws so the IntelligenceEngine's silent-
   * continuation handler bypasses this document.
   */
  public async fetch(documentId: string): Promise<SourceDocument> {
    const targetSlug = extractTrendSlug(documentId);

    await this.ensureCache();

    const item = this.slugCache.get(targetSlug);
    if (!item) {
      throw new Error(
        `[GoogleTrendsProvider] Trend '${targetSlug}' is no longer in the current trending data.`,
      );
    }

    return {
      id: documentId,
      provider: this.providerId,
      content: buildTrendContent(item),
    };
  }
}
