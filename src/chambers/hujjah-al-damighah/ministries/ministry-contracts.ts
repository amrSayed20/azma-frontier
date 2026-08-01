/**
 * AZMA OS — Al Hujjah Al-Damighah
 * KNOWLEDGE MINISTRIES FOUNDATION — Constitutional Foundation Package XV
 *
 * The constitutional Ministry declarations.
 *
 * ─── THE CONSTITUTIONAL PRINCIPLE ──────────────────────────────────────────
 *
 *   A Ministry is a permanent constitutional entity that owns a domain of
 *   knowledge. A Provider is only one implementation serving that Ministry.
 *
 *   The Empire shall never bind its constitutional identity to any provider.
 *   Ministries never change when providers change.
 *   Providers are replaceable. Ministries are constitutional.
 *
 * ─── WHAT A MINISTRY IS ─────────────────────────────────────────────────────
 *
 *   A Ministry is a named sovereign authority over one domain of knowledge.
 *   It declares that the Empire recognizes this domain as real, important,
 *   and constitutionally owned — regardless of whether a provider currently
 *   serves it.
 *
 *   A Ministry with no attached providers is constitutionally valid. It will
 *   return empty results honestly. Future providers may serve it without
 *   any change to the Ministry's constitutional identity.
 *
 * ─── WHAT A MINISTRY IS NOT ─────────────────────────────────────────────────
 *
 *   A Ministry is not a search engine.
 *   A Ministry is not an HTTP client.
 *   A Ministry is not a provider.
 *   A Ministry is not a routing table.
 *
 *   Providers serve Ministries. Ministries do not serve providers.
 *
 * ─── THE EIGHT CONSTITUTIONAL MINISTRIES ────────────────────────────────────
 *
 *   Established by the Architectural Council as the permanent sovereign
 *   classification of all knowledge domains recognized by AZMA OS.
 *
 *   Ministry of Human Knowledge:
 *     Launch provider: GutenbergProvider (simulated; real HTTP deferred)
 *     Domain: humanities — literary, philosophical, cultural works
 *
 *   Ministry of Sovereign Knowledge:
 *     Launch provider: deferred (internal Vault / Creator records)
 *     Domain: sovereign — AZMA OS internal state
 *
 *   Ministry of Scientific Knowledge:
 *     Launch provider: deferred (arXiv or equivalent)
 *     Domain: science — peer-reviewed research, academic publications
 *
 *   Ministry of Technical Knowledge:
 *     Launch provider: deferred (GitHub, Hacker News)
 *     Domain: technology — technical documentation, engineering discourse
 *
 *   Ministry of Historical Knowledge:
 *     Launch provider: deferred
 *     Domain: history — historical records, chronicles, archival sources
 *
 *   Ministry of Legal Knowledge:
 *     Launch provider: deferred
 *     Domain: law — legal texts, rulings, regulations, constitutional archives
 *
 *   Ministry of Business Intelligence:
 *     Launch providers: Google Trends, Exploding Topics (deferred)
 *     Domain: commerce — market intelligence, trend analysis
 *
 *   Ministry of Media Intelligence:
 *     Launch providers: YouTube Trending, Reddit (deferred)
 *     Domain: media — content performance, cultural signal analysis
 */

export type KnowledgeMinistryId =
  | 'ministry-human-knowledge'
  | 'ministry-sovereign-knowledge'
  | 'ministry-scientific-knowledge'
  | 'ministry-technical-knowledge'
  | 'ministry-historical-knowledge'
  | 'ministry-legal-knowledge'
  | 'ministry-business-intelligence'
  | 'ministry-media-intelligence';

export interface KnowledgeMinistry {
  readonly ministryId: KnowledgeMinistryId;
  readonly name: string;
  readonly domain: string;
  readonly description: string;
}

export const CONSTITUTIONAL_MINISTRIES: readonly KnowledgeMinistry[] = [
  {
    ministryId: 'ministry-human-knowledge',
    name: 'Ministry of Human Knowledge',
    domain: 'humanities',
    description:
      'Governs knowledge derived from human literary, philosophical, and cultural works. ' +
      'Launch provider: Gutenberg Archive.',
  },
  {
    ministryId: 'ministry-sovereign-knowledge',
    name: 'Ministry of Sovereign Knowledge',
    domain: 'sovereign',
    description:
      'Governs internal Sovereign knowledge — the Creator Vault, Creator records, ' +
      'and AZMA OS state. Provider deferred to Sovereign Knowledge Sources phase.',
  },
  {
    ministryId: 'ministry-scientific-knowledge',
    name: 'Ministry of Scientific Knowledge',
    domain: 'science',
    description:
      'Governs knowledge derived from peer-reviewed research, academic publications, ' +
      'and scientific archives. Provider deferred.',
  },
  {
    ministryId: 'ministry-technical-knowledge',
    name: 'Ministry of Technical Knowledge',
    domain: 'technology',
    description:
      'Governs knowledge derived from technical documentation, open-source repositories, ' +
      'and engineering discourse. Launch providers: GitHub, Hacker News (deferred).',
  },
  {
    ministryId: 'ministry-historical-knowledge',
    name: 'Ministry of Historical Knowledge',
    domain: 'history',
    description:
      'Governs knowledge derived from historical records, chronicles, and archival sources. ' +
      'Provider deferred.',
  },
  {
    ministryId: 'ministry-legal-knowledge',
    name: 'Ministry of Legal Knowledge',
    domain: 'law',
    description:
      'Governs knowledge derived from legal texts, rulings, regulations, and constitutional ' +
      'archives. Provider deferred.',
  },
  {
    ministryId: 'ministry-business-intelligence',
    name: 'Ministry of Business Intelligence',
    domain: 'commerce',
    description:
      'Governs market intelligence, trend analysis, and commercial domain knowledge. ' +
      'Launch providers: Google Trends, Exploding Topics (deferred).',
  },
  {
    ministryId: 'ministry-media-intelligence',
    name: 'Ministry of Media Intelligence',
    domain: 'media',
    description:
      'Governs media trends, content performance intelligence, and cultural signal analysis. ' +
      'Launch providers: YouTube Trending, Reddit (deferred).',
  },
];
