/**
 * Sovereign Intelligence Layer — Search Agent Router (Component 3)
 *
 * Maps a classified knowledge domain to the appropriate search workflow.
 * Prepared for future expansion into multiple specialist search agents.
 */

import type { KnowledgeDomain, SearchWorkflow } from './sovereign-intelligence-types';

const DOMAIN_TO_WORKFLOW: Readonly<Record<KnowledgeDomain, SearchWorkflow>> = {
  cinematic: 'deep-investigation',
  research: 'deep-investigation',
  article: 'surface-scan',
  podcast: 'surface-scan',
  general: 'general-query',
} as const;

const WORKFLOW_DEPTH: Readonly<Record<SearchWorkflow, number>> = {
  'deep-investigation': 5,
  'surface-scan': 3,
  'general-query': 3,
} as const;

export class SearchAgentRouter {
  readonly serviceName = 'SearchAgentRouter' as const;

  route(domain: KnowledgeDomain): SearchWorkflow {
    return DOMAIN_TO_WORKFLOW[domain];
  }

  getWorkflowDepth(workflow: SearchWorkflow): number {
    return WORKFLOW_DEPTH[workflow];
  }
}
