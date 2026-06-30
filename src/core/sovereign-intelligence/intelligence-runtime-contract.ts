/**
 * Sovereign Intelligence Layer — Platform Runtime Contracts (Layer 8)
 *
 * Stable, versioned contract interfaces for all SIL platform services.
 * Every chamber that consumes intelligence depends ONLY on these contracts.
 * No chamber imports concrete SIL implementation classes.
 *
 * CONTRACT HIERARCHY:
 *   IntelligenceRuntimeContract (layer-level)
 *     ├── KnowledgeSourceManagerContract   (sub-service)
 *     ├── KnowledgeDomainClassifierContract (sub-service)
 *     ├── SearchAgentRouterContract         (sub-service)
 *     ├── SourceVerifierContract            (sub-service)
 *     ├── KnowledgeSummarizerContract       (sub-service)
 *     ├── KnowledgePackageBuilderContract   (sub-service)
 *     └── KnowledgePipelineContract         (orchestration)
 */

import type { EvidenceBundle } from '../../chambers/hujjah-al-damighah/domain/evidence.types';
import type {
  IKnowledgeSource,
  KnowledgeDomain,
  KnowledgePackage,
  KnowledgeSummary,
  SearchWorkflow,
  VerifiedEvidenceItem,
} from './sovereign-intelligence-types';

// ── Sub-service contracts ─────────────────────────────────────────────────────

export interface KnowledgeSourceManagerContract {
  readonly serviceName: 'KnowledgeSourceManager';
  register(source: IKnowledgeSource): void;
  getSource(sourceId: string): IKnowledgeSource | undefined;
  getAvailableSources(): readonly IKnowledgeSource[];
  getAllSources(): readonly IKnowledgeSource[];
  hasAvailableSources(): boolean;
}

export interface KnowledgeDomainClassifierContract {
  readonly serviceName: 'KnowledgeDomainClassifier';
  classify(query: string): KnowledgeDomain;
}

export interface SearchAgentRouterContract {
  readonly serviceName: 'SearchAgentRouter';
  route(domain: KnowledgeDomain): SearchWorkflow;
  getWorkflowDepth(workflow: SearchWorkflow): number;
}

export interface SourceVerifierContract {
  readonly serviceName: 'SourceVerifier';
  verify(bundle: EvidenceBundle): readonly VerifiedEvidenceItem[];
}

export interface KnowledgeSummarizerContract {
  readonly serviceName: 'KnowledgeSummarizer';
  summarize(
    query: string,
    domain: KnowledgeDomain,
    verifiedEvidence: readonly VerifiedEvidenceItem[],
  ): KnowledgeSummary;
}

export interface KnowledgePackageBuilderContract {
  readonly serviceName: 'KnowledgePackageBuilder';
  build(query: string, rawBundle: EvidenceBundle): KnowledgePackage;
}

export interface KnowledgePipelineContract {
  readonly serviceName: 'KnowledgePipeline';
  process(
    query: string,
    category: string,
    requestId: string,
  ): Promise<{ readonly pkg: KnowledgePackage; readonly fromCache: boolean }>;
  getAvailableSources(): readonly IKnowledgeSource[];
}

// ── Layer 8 platform contract ─────────────────────────────────────────────────

export interface IntelligenceRuntimeContract {
  readonly layerName: 'SovereignIntelligence';
  readonly version: '1.0.0';
  readonly layerNumber: 8;

  // Direct pipeline access — primary interface for chambers
  process(
    query: string,
    category: string,
    requestId: string,
  ): Promise<{ readonly pkg: KnowledgePackage; readonly fromCache: boolean }>;
  getAvailableSources(): readonly IKnowledgeSource[];

  // Sub-service contracts — for chambers that need fine-grained access
  readonly sourceManager: KnowledgeSourceManagerContract;
  readonly domainClassifier: KnowledgeDomainClassifierContract;
  readonly searchRouter: SearchAgentRouterContract;
  readonly sourceVerifier: SourceVerifierContract;
  readonly summarizer: KnowledgeSummarizerContract;
  readonly packageBuilder: KnowledgePackageBuilderContract;
  readonly pipeline: KnowledgePipelineContract;
}
