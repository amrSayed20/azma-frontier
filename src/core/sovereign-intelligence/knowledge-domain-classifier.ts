/**
 * Sovereign Intelligence Layer — Knowledge Domain Classifier (Component 2)
 *
 * Detects the subject domain from a raw user query using heuristic pattern
 * matching. Routes classification without any external LLM dependency.
 */

import type { KnowledgeDomain } from './sovereign-intelligence-types';

const DOMAIN_PATTERNS: readonly { domain: KnowledgeDomain; pattern: RegExp }[] = [
  {
    domain: 'cinematic',
    pattern: /(documentary|film|video|cinematic|visual|footage|screenplay|storyboard|scene|shot)/,
  },
  {
    domain: 'podcast',
    pattern: /(podcast|audio|voice|interview|episode|transcript|host|listener)/,
  },
  {
    domain: 'article',
    pattern: /(article|blog|essay|editorial|post|news|column|headline)/,
  },
  {
    domain: 'research',
    pattern: /(research|study|paper|analysis|dossier|academic|report|thesis|survey)/,
  },
];

export class KnowledgeDomainClassifier {
  classify(query: string): KnowledgeDomain {
    const normalized = query.toLowerCase();
    for (const { domain, pattern } of DOMAIN_PATTERNS) {
      if (pattern.test(normalized)) {
        return domain;
      }
    }
    return 'general';
  }
}
