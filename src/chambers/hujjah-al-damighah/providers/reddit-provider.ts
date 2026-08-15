/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE MINISTRY EXPANSION — Constitutional Foundation Package XVII
 *
 * The Reddit Knowledge Provider.
 *
 * Serves the Ministry of Media Intelligence under the Ministry layer.
 * Retrieves posts and discussions from Reddit's public JSON API and delivers
 * them as SourceDocuments to the Evidence chain.
 *
 * ─── WHAT THIS PROVIDER DOES ────────────────────────────────────────────────
 *
 *   search()  — Queries Reddit's public search endpoint for posts relevant to
 *               the query string. Sorted by relevance. Returns at most `limit`
 *               results as RepositorySearchResult records.
 *
 *   fetch()   — Retrieves the full post content (title + selftext body) from
 *               Reddit's comment thread endpoint. Returns a SourceDocument
 *               sized for the EvidenceExtractor's keyword-scoring pass.
 *
 * ─── DOMAIN OF SERVICE ───────────────────────────────────────────────────────
 *
 *   This provider serves Ministry of Media Intelligence ('ministry-media-
 *   intelligence'). It retrieves raw community discourse data. It does not
 *   summarize, analyze, rank, or produce any Creator-facing output.
 *
 * ─── WHAT THIS PROVIDER DOES NOT DO ─────────────────────────────────────────
 *
 *   Does not produce Creator advice.
 *   Does not perform sentiment analysis.
 *   Does not recommend subreddits or posts.
 *   Does not appear in KnowledgeDeclaration output (constitutional secrecy).
 *   Does not modify Investigation, Evidence, or Knowledge stages.
 *
 * ─── CONSTITUTIONAL SECRECY BOUNDARY ────────────────────────────────────────
 *
 *   This provider's ID ('reddit') is an internal Ministry routing key.
 *   MinistryRegistry wraps it under 'ministry-media-intelligence'.
 *   Evidence items carry 'ministry-media-intelligence' as sourceProvider —
 *   never 'reddit'.
 *
 * ─── DOCUMENT ID FORMAT ──────────────────────────────────────────────────────
 *
 *   'post-{redditPostId}' where redditPostId is Reddit's base-36 post ID.
 *   Example: 'post-1abc2d3' (matches Reddit's internal ID format)
 *
 * ─── EXTERNAL DEPENDENCY ─────────────────────────────────────────────────────
 *
 *   Reddit JSON API  — https://www.reddit.com/search.json  (search)
 *                    — https://www.reddit.com/comments/{id}.json  (fetch)
 *                      Public, free, no authentication required.
 *                      Requires a User-Agent header — Reddit returns HTTP 429
 *                      or blocks requests that omit a valid User-Agent.
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';

// ─── EXTERNAL ENDPOINTS ───────────────────────────────────────────────────────

const REDDIT_SEARCH = 'https://www.reddit.com/search.json';
const REDDIT_COMMENTS = 'https://www.reddit.com/comments';
const USER_AGENT = 'AZMA-OS Intelligence Engine/1.0 (Knowledge Research)';

// ─── REDDIT JSON RESPONSE TYPES ───────────────────────────────────────────────

interface RedditPostData {
  readonly id: string;
  readonly title: string;
  readonly selftext?: string;
  readonly score: number;
  readonly subreddit: string;
  readonly url?: string;
}

interface RedditListing {
  readonly kind: string;
  readonly data: {
    readonly children: ReadonlyArray<{
      readonly kind: string;
      readonly data: RedditPostData;
    }>;
  };
}

// ─── DOCUMENT ID UTILITIES ───────────────────────────────────────────────────

export function extractRedditPostId(documentId: string): string {
  if (!documentId.startsWith('post-')) {
    throw new Error(
      `[RedditProvider] Invalid document ID: '${documentId}'. Expected format: 'post-{id}'`,
    );
  }
  const postId = documentId.slice(5);
  if (!postId || !/^[a-z0-9]+$/i.test(postId)) {
    throw new Error(`[RedditProvider] Invalid document ID: '${documentId}'`);
  }
  return postId;
}

// ─── CONTENT BUILDER ─────────────────────────────────────────────────────────

function buildPostContent(post: RedditPostData): string {
  const lines: string[] = [
    `Topic: ${post.title}`,
    `Community: r/${post.subreddit}`,
    `Community Score: ${post.score.toLocaleString('en-US')} points`,
  ];

  const selftext = post.selftext;
  if (selftext && selftext !== '[deleted]' && selftext !== '[removed]' && selftext.trim()) {
    lines.push(`Content: ${selftext.slice(0, 800)}`);
  }

  return lines.join('\n');
}

function buildSnippet(post: RedditPostData): string {
  const selftext = post.selftext;
  if (selftext && selftext !== '[deleted]' && selftext !== '[removed]' && selftext.trim()) {
    return selftext.slice(0, 200);
  }
  return `Community: r/${post.subreddit}. Score: ${post.score.toLocaleString('en-US')} points.`;
}

// ─── THE PROVIDER ─────────────────────────────────────────────────────────────

export class RedditProvider implements IRepositoryProvider {
  // Internal sub-provider routing key used inside the Ministry composite key mechanism.
  // Never surfaces above the Ministry layer: evidence.sourceProvider = 'ministry-media-intelligence'.
  public readonly providerId: string = 'reddit';

  /**
   * Search Reddit for posts relevant to the query.
   *
   * Queries the public Reddit search endpoint, sorted by relevance across
   * all subreddits. Returns position-based relevance scores (0.95→0.10)
   * since Reddit's own relevance ordering is authoritative.
   *
   * Posts with no selftext (link posts) return a snippet built from subreddit
   * and score — the EvidenceExtractor will score them against the claim
   * keywords using the title content.
   */
  public async search(query: string, limit: number): Promise<RepositorySearchResult[]> {
    const url = new URL(REDDIT_SEARCH);
    url.searchParams.set('q', query);
    url.searchParams.set('sort', 'relevance');
    url.searchParams.set('type', 'link');
    url.searchParams.set('limit', String(Math.min(limit, 10)));
    url.searchParams.set('t', 'year');

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      console.warn('[RedditProvider] Search request failed (network error or timeout). Returning empty results.');
      return [];
    }

    if (response.status === 403 || response.status === 429) {
      // Reddit restricts unauthenticated API access in some environments.
      // Return empty results rather than crashing the investigation — the
      // Ministry layer and IntelligenceEngine already handle empty providers.
      console.warn(`[RedditProvider] Access restricted (HTTP ${response.status}). Returning empty results.`);
      return [];
    }

    if (!response.ok) {
      throw new Error(`[RedditProvider] Search failed: HTTP ${response.status}`);
    }

    const listing = (await response.json()) as RedditListing;
    const posts = listing.data.children
      .filter((c) => c.kind === 't3')
      .map((c) => c.data)
      .slice(0, limit);

    return posts.map((post, index) => ({
      id: `post-${post.id}`,
      provider: this.providerId,
      title: post.title,
      snippet: buildSnippet(post),
      relevanceScore: Math.max(0.1, 0.95 - index * 0.05),
    }));
  }

  /**
   * Retrieve the full content of a Reddit post.
   *
   * Fetches the post's comment thread endpoint with comments disabled
   * (limit=0) — we only need the post body (title + selftext) for the
   * Evidence window.
   *
   * Content is truncated to 800 characters of selftext — sufficient for
   * EvidenceExtractor's keyword-overlap scoring against any claim.
   */
  public async fetch(documentId: string): Promise<SourceDocument> {
    const postId = extractRedditPostId(documentId);

    const url = `${REDDIT_COMMENTS}/${postId}.json?limit=0`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      throw new Error(`[RedditProvider] Cannot fetch post '${documentId}': HTTP ${response.status}`);
    }

    const data = (await response.json()) as [RedditListing, ...unknown[]];
    const postData = data[0]?.data?.children?.[0]?.data as RedditPostData | undefined;

    if (!postData) {
      throw new Error(`[RedditProvider] Post '${documentId}' not found in response`);
    }

    return {
      id: documentId,
      provider: this.providerId,
      content: buildPostContent(postData),
    };
  }
}
