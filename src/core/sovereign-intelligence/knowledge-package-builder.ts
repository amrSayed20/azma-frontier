/**
 * Sovereign Intelligence Layer — Knowledge Package Builder (Component 6)
 *
 * Orchestrates the full SIL pipeline:
 *   Classify domain → Route workflow → Verify sources → Summarize → Package
 *
 * Does not generate creative content. Produces a structured KnowledgePackage
 * consumed by Qiyamah Chamber.
 */

import * as crypto from 'crypto';
import type { EvidenceBundle } from '../../chambers/hujjah-al-damighah/domain/evidence.types';
import type { KnowledgePackage } from './sovereign-intelligence-types';
import { KnowledgeDomainClassifier } from './knowledge-domain-classifier';
import { SearchAgentRouter } from './search-agent-router';
import { SourceVerifier } from './source-verifier';
import { KnowledgeSummarizer } from './knowledge-summarizer';

export class KnowledgePackageBuilder {
  readonly serviceName = 'KnowledgePackageBuilder' as const;

  private readonly classifier = new KnowledgeDomainClassifier();
  private readonly router = new SearchAgentRouter();
  private readonly verifier = new SourceVerifier();
  private readonly summarizer = new KnowledgeSummarizer();

  build(query: string, rawBundle: EvidenceBundle): KnowledgePackage {
    const domain = this.classifier.classify(query);
    const workflow = this.router.route(domain);
    const verifiedEvidence = this.verifier.verify(rawBundle);
    const summary = this.summarizer.summarize(query, domain, verifiedEvidence);

    return {
      packageId: crypto.randomUUID(),
      query,
      domain,
      workflow,
      verifiedEvidence,
      summary,
      rawBundle,
      generatedAtMs: Date.now(),
    };
  }
}
