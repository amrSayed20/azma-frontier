/**
 * AZMA OS — Al Hujjah Al-Damighah
 * Arabic Wikipedia Knowledge Provider
 *
 * Queries the Arabic Wikipedia (ar.wikipedia.org) using the same MediaWiki
 * Action API as the English WikipediaProvider. Serves Arabic-language queries
 * under the Ministry of Media Intelligence alongside the English provider.
 *
 * No API key required. Free, public endpoint.
 * Document IDs: 'arwiki-{page_slug}'
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';

const ARWIKI_SEARCH_URL = 'https://ar.wikipedia.org/w/api.php';
const ARWIKI_SUMMARY_URL = 'https://ar.wikipedia.org/api/rest_v1/page/summary';
const REQUEST_HEADERS = {
  'User-Agent': 'AZMA-OS Intelligence Engine/1.0 (Knowledge Research)',
  'Accept': 'application/json',
};

interface WikiSearchItem {
  readonly title: string;
  readonly snippet: string;
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
}

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

export class ArabicWikipediaProvider implements IRepositoryProvider {
  public readonly providerId: string = 'arabic-wikipedia';

  public async search(query: string, limit: number): Promise<RepositorySearchResult[]> {
    const url = new URL(ARWIKI_SEARCH_URL);
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
      console.warn('[ArabicWikipediaProvider] Search request failed. Returning empty results.');
      return [];
    }

    if (!response.ok) {
      console.warn(`[ArabicWikipediaProvider] Search returned HTTP ${response.status}. Returning empty results.`);
      return [];
    }

    const data = (await response.json()) as WikiSearchResponse;
    const results = data.query?.search ?? [];

    return results.slice(0, limit).map((item, index) => ({
      id: `arwiki-${item.title.replace(/ /g, '_')}`,
      provider: this.providerId,
      title: item.title,
      snippet: stripHtml(item.snippet).slice(0, 200),
      relevanceScore: Math.max(0.1, 0.88 - index * 0.05),
    }));
  }

  public async fetch(documentId: string): Promise<SourceDocument> {
    if (!documentId.startsWith('arwiki-')) {
      throw new Error(`[ArabicWikipediaProvider] Invalid document ID: '${documentId}'`);
    }
    const slug = documentId.slice(7);
    const title = slug.replace(/_/g, ' ');
    const encodedTitle = encodeURIComponent(title);

    const url = `${ARWIKI_SUMMARY_URL}/${encodedTitle}`;
    let response: Response;
    try {
      response = await fetch(url, {
        headers: REQUEST_HEADERS,
        signal: AbortSignal.timeout(10000),
      });
    } catch {
      throw new Error(`[ArabicWikipediaProvider] Fetch failed for '${documentId}'.`);
    }

    if (!response.ok) {
      throw new Error(`[ArabicWikipediaProvider] HTTP ${response.status} for '${documentId}'.`);
    }

    const summary = (await response.json()) as WikiSummary;
    const lines: string[] = [`موضوع: ${summary.title}`];
    if (summary.description?.trim()) lines.push(`وصف: ${summary.description.trim()}`);
    if (summary.extract?.trim()) lines.push(`سياق: ${stripHtml(summary.extract).slice(0, 600)}`);

    return {
      id: documentId,
      provider: this.providerId,
      content: lines.join('\n'),
    };
  }
}
