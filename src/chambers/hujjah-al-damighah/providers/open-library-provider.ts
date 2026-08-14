/**
 * AZMA OS — Al Hujjah Al-Damighah
 * Provider: Open Library (Internet Archive)
 *
 * Searches the Open Library catalog — 20M+ books across all topics and languages,
 * including Arabic works. Free, no authentication required.
 *
 * Replaces GutenbergProvider (English-only public-domain classics) with a source
 * that covers modern topics, non-fiction, science, culture, and Arabic literature.
 *
 * Document ID format: 'ol-{workId}' (e.g. 'ol-OL82563W')
 * Provider: 'open-library'
 * Ministry: ministry-human-knowledge
 */

import { IRepositoryProvider } from '../core/repository-manager';
import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from '../core/evidence-extractor';

interface OLSearchDoc {
  readonly key: string;
  readonly title: string;
  readonly author_name?: readonly string[];
  readonly first_sentence?: { value: string } | string;
  readonly subject?: readonly string[];
  readonly language?: readonly string[];
}

interface OLSearchResponse {
  readonly numFound: number;
  readonly docs: readonly OLSearchDoc[];
}

interface OLWorkResponse {
  readonly title?: string;
  readonly description?: { value: string } | string;
  readonly subjects?: readonly string[];
  readonly first_sentence?: { value: string } | string;
}

function extractText(field: { value: string } | string | undefined): string {
  if (!field) return '';
  if (typeof field === 'string') return field;
  return field.value ?? '';
}

function buildSnippet(doc: OLSearchDoc): string {
  const author = doc.author_name?.slice(0, 2).join(', ') ?? '';
  const subjects = doc.subject?.slice(0, 3).join('، ') ?? '';
  const sentence = extractText(doc.first_sentence);
  const parts: string[] = [];
  if (author)   parts.push(`تأليف: ${author}`);
  if (subjects) parts.push(`المواضيع: ${subjects}`);
  if (sentence) parts.push(sentence.slice(0, 200));
  return parts.join('. ') || doc.title;
}

export class OpenLibraryProvider implements IRepositoryProvider {
  public readonly providerId: string = 'open-library';

  public async search(query: string, limit: number): Promise<RepositorySearchResult[]> {
    const url = new URL('https://openlibrary.org/search.json');
    url.searchParams.set('q', query);
    url.searchParams.set('limit', String(Math.min(limit, 10)));
    url.searchParams.set('fields', 'key,title,author_name,first_sentence,subject,language');

    const response = await fetch(url.toString(), {
      headers: { 'User-Agent': 'AZMA-OS/1.0 (Knowledge Research Platform)' },
    });

    if (!response.ok) {
      throw new Error(`[OpenLibraryProvider] Search failed: HTTP ${response.status}`);
    }

    const data = (await response.json()) as OLSearchResponse;

    return data.docs.slice(0, limit).map((doc, index) => {
      const workId = doc.key.replace('/works/', '');
      return {
        id: `ol-${workId}`,
        provider: this.providerId,
        title: doc.title,
        snippet: buildSnippet(doc),
        relevanceScore: Math.max(0.1, 0.92 - index * 0.06),
      };
    });
  }

  public async fetch(documentId: string): Promise<SourceDocument> {
    const workId = documentId.startsWith('ol-') ? documentId.slice(3) : documentId;
    const url = `https://openlibrary.org/works/${workId}.json`;

    const response = await fetch(url, {
      headers: { 'User-Agent': 'AZMA-OS/1.0 (Knowledge Research Platform)' },
    });

    if (!response.ok) {
      throw new Error(`[OpenLibraryProvider] Fetch failed for '${documentId}': HTTP ${response.status}`);
    }

    const work = (await response.json()) as OLWorkResponse;

    const title = work.title ?? workId;
    const description = extractText(work.description).slice(0, 600);
    const firstSentence = extractText(work.first_sentence).slice(0, 300);
    const subjects = (work.subjects ?? []).slice(0, 6).join('، ');

    const content = [
      title,
      description || firstSentence,
      subjects ? `المواضيع: ${subjects}` : '',
    ].filter(Boolean).join('. ');

    return {
      id: documentId,
      provider: this.providerId,
      content: content || title,
    };
  }
}
